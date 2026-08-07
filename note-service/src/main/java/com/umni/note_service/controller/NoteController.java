package com.umni.note_service.controller;


// here its gets intresting 


import com.umni.note_service.model.*;
import com.umni.note_service.service.*;
import com.umni.note_service.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.util.StringUtils;

@RestController
@RequestMapping("/api/notes")
public class NoteController {
	
	private final NoteRepository noteRepository;
	private final S3StorageService  s3Service;
	private final FileValidationService fileValidationService;
	
	public NoteController(NoteRepository noteRepository, S3StorageService s3Service,
			FileValidationService fileValidationService) {
        this.noteRepository = noteRepository;
        this.s3Service = s3Service;
        this.fileValidationService = fileValidationService;
    }
	
	private String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            throw new RuntimeException("User not authenticated");
        }
        Object details = auth.getDetails();
        if (details instanceof Map) {
            Map<String, Object> map = (Map<String, Object>) details;
            String userId = (String) map.get("userId");
            if (userId != null) {
                return userId;
            }
        }
        throw new RuntimeException("User ID not found in JWT");
    }
	
	@PostMapping("/upload")
	
	public ResponseEntity<?> uploadNote(
			@RequestParam("file") MultipartFile file
			){
		try {
			
			String userId = getCurrentUserId(); 
			
			FileValidationService.ValidatedFile validated = fileValidationService.validate(file);
			String originalName = validated.fileName();
            String contentType = validated.contentType();
            byte[] bytes = file.getBytes();
            
            String extension = StringUtils.getFilenameExtension(originalName);
            String key = "notes/" + userId + "/" + UUID.randomUUID()
                    + (extension == null ? "" : "." + extension.toLowerCase());
            String fileUrl = s3Service.uploadFile(bytes, key, contentType);

            Note note = new Note();
            note.setUserId(userId);
            note.setFileName(originalName);
            note.setFileType(contentType);
            note.setS3Url(fileUrl);
            note.setS3Key(key);
            note.setUploadedAt(Instant.now());
            
            noteRepository.save(note);
            
            return ResponseEntity.ok(note);

		}catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
		}catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Upload failed"));
	}
		
	}
		
	    @GetMapping("/list")
	    public ResponseEntity<List<Note>> getUserNotes() {
	        String userId = getCurrentUserId();
	        return ResponseEntity.ok(noteRepository.findByUserIdOrderByUploadedAtDesc(userId));
	    }
		
		@DeleteMapping("/{noteId}")
	    public ResponseEntity<?> deleteNote(@PathVariable String noteId) {
			String userId = getCurrentUserId();
		    Note note = noteRepository.findById(noteId)
		            .orElseThrow(() -> new RuntimeException("Note not found"));

	        if (!note.getUserId().equals(userId)) {
	            return ResponseEntity.status(403).body("Unauthorized");
	        }
	        
	        try {
	            s3Service.deleteFile(note.getS3Key());
	        } catch (Exception e) {
	            System.out.println("S3 delete failed (may already be deleted): " + e.getMessage());
	        }
	        
	        noteRepository.deleteById(noteId);

	        return ResponseEntity.ok().build();


}

		@DeleteMapping("/account")
		public ResponseEntity<?> deleteCurrentUserNotes() {
			String userId = getCurrentUserId();
			List<Note> notes = noteRepository.findByUserIdOrderByUploadedAtDesc(userId);
			int storageCleanupFailures = 0;

			for (Note note : notes) {
				try {
					s3Service.deleteFile(note.getS3Key());
				} catch (Exception error) {
					storageCleanupFailures++;
					System.err.println("Account deletion could not remove an S3 note object: "
							+ error.getClass().getSimpleName());
				}
			}
			noteRepository.deleteAll(notes);

			return ResponseEntity.ok(Map.of(
					"deleted", notes.size(),
					"storageCleanupFailures", storageCleanupFailures));
		}

}
