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

@RestController
@RequestMapping("/api/notes")
public class NoteController {
	
	private final NoteRepository noteRepository;
	private final S3StorageService  s3Service;
	
	public NoteController(NoteRepository noteRepository, S3StorageService s3Service) {
        this.noteRepository = noteRepository;
        this.s3Service = s3Service;
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
			
			String originalName = file.getOriginalFilename();
            String contentType = file.getContentType();
            byte[] bytes = file.getBytes();
            
            String key = "notes/" + userId + "/" + System.currentTimeMillis() + "_" + originalName;
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

		}catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
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
		@PostMapping("/internal/upload")
	    public ResponseEntity<?> internalUploadNote(
	            @RequestParam("userId") String userId,
	            @RequestParam("file") MultipartFile file) {
			
			try {
	                String originalName = file.getOriginalFilename();
	                String contentType = file.getContentType();
	                byte[] bytes = file.getBytes();

	                String key = "notes/" + userId + "/" + System.currentTimeMillis() + "_" + originalName;
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
	            } catch (Exception e) {
	                return ResponseEntity.status(500).body("Internal upload failed: " + e.getMessage());
	            }
}
		
		@GetMapping("/internal/user/{userId}")
	    public ResponseEntity<List<Note>> internalGetUserNotes(@PathVariable String userId) {
	        return ResponseEntity.ok(noteRepository.findByUserIdOrderByUploadedAtDesc(userId));
	    }
		
		@DeleteMapping("/internal/{noteId}")
	    public ResponseEntity<?> internalDeleteNote(
	            @PathVariable String noteId,
	            @RequestParam("userId") String userId)  {
	        Note note = noteRepository.findById(noteId)
	                .orElseThrow(() -> new RuntimeException("Note not found"));

	        if (!note.getUserId().equals(userId)) {
	            return ResponseEntity.status(403).body("Unauthorized");
	        }

	        s3Service.deleteFile(note.getS3Key());
	        noteRepository.deleteById(noteId);
	        return ResponseEntity.ok().build();
	    }

}
