package com.umni.note_service.controller;


// here its gets intresting 


import com.umni.note_service.model.*;
import com.umni.note_service.service.*;
import com.umni.note_service.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/notes/internal")
public class NoteController {
	
	private final NoteRepository noteRepository;
	private final S3StorageService  s3Service;
	
	public NoteController(NoteRepository noteRepository, S3StorageService s3Service) {
        this.noteRepository = noteRepository;
        this.s3Service = s3Service;
    }
	
	@PostMapping("/upload")
	
	public ResponseEntity<?> uploadNote(
			@RequestParam("userId") String userId,
			@RequestParam("file") MultipartFile file
			){
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
            note.setUploadedAt(Instant.now());
            
            noteRepository.save(note);
            
            return ResponseEntity.ok(note);

		}catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
	}
		
	}
		
		@GetMapping("/user/{userId}")
	    public ResponseEntity<List<Note>> getUserNotes(@PathVariable String userId) {
	        return ResponseEntity.ok(noteRepository.findByUserIdOrderByUploadedAtDesc(userId));
	    }
		
		@DeleteMapping("/{noteId}")
	    public ResponseEntity<?> deleteNote(@PathVariable String noteId, @RequestParam String userId) {
	        Note note = noteRepository.findById(noteId)
	                .orElseThrow(() -> new RuntimeException("Note not found"));

	        if (!note.getUserId().equals(userId)) {
	            return ResponseEntity.status(403).body("Unauthorized");
	        }
	        
	        String bucket = s3Service.getBucketName();
	        
	        String prefix = "https://" + bucket + ".s3.amazonaws.com/";
	        
	        String key = note.getS3Url().replace(prefix, "");
	        
	        s3Service.deleteFile(key);
	        
	        noteRepository.deleteById(noteId);

	        return ResponseEntity.ok().build();


}}
