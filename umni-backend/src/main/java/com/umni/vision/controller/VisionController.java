package com.umni.vision.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.Base64;
import java.util.Map;


import com.umni.vision.model.Vision;
import com.umni.vision.service.VisionService;
import com.umni.vision.service.S3StorageService;
import com.umni.vision.repository.VisionRepository;


@RestController
@RequestMapping("/api/vision")
@CrossOrigin(origins = "http://localhost:3000")

public class VisionController {
	
	private final VisionService visionService;
    private final S3StorageService s3Service;
    private final VisionRepository visionRepository;

    public VisionController(
            VisionService visionService,
            S3StorageService s3Service,
            VisionRepository visionRepository) {
        this.visionService = visionService;
        this.s3Service = s3Service;
        this.visionRepository = visionRepository;
    }
    
    private String getCurrentUserId() {
    	Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    	if(auth == null) throw new RuntimeException("not autheticated");
    	
    	Object details = auth.getDetails();
    	if (details instanceof Map<?, ?> map) {
    	    String userId = (String) map.get("userId");
    	    if (userId != null) {
    	        return userId;
    	    }
    	}
    	
    	throw new RuntimeException("User id not found");
    }
    
    @PostMapping("/solve")
    public Mono<ResponseEntity<Map<String, Object>>> solveMathProblem(
    		@RequestBody Map<String , Object> request ){
    
    	
    	String userId = getCurrentUserId();
    	String base64Image = String.valueOf(request.get("image"));
        
        if(base64Image != null && base64Image.contains(",")) {
        	base64Image = base64Image.substring(base64Image.indexOf(",")+1);
        }
        
        return visionService.solveMathProblem(base64Image)
        		.map(generatedBase64 ->{
        			byte[] imageBytes = Base64.getDecoder().decode(generatedBase64);
        			
        			String imageUrl = s3Service.uploadImage(imageBytes , userId , "solved");
        			
        			Vision vision = new Vision();
        			vision.setUserId(userId);
        			vision.setTitle("solved "+Instant.now().toString());
        			vision.setSolvedImageKey(imageUrl);
        			vision.setCreatedAt(Instant.now());
        			vision.setUpdatedAt(Instant.now());
        			visionRepository.save(vision);
        			
        			Map<String, Object> response = new java.util.HashMap<>();
        			response.put("success", true);
        			response.put("imageurl", imageUrl);
        			response.put("visionid", vision.getId());

        			return ResponseEntity.ok(response);
        			
        		})
        		
        		.onErrorResume(error -> {
        			return Mono.just(ResponseEntity.badRequest().body(
        					Map.of("success" , false , "error " , error.getMessage())
        					));
        		});
    	
    }
    
    @GetMapping("/library")
    public ResponseEntity<?> getUserLibrary(){
    	String userId = getCurrentUserId();
    	var images = visionRepository.findByUserIdOrderByCreatedAtDesc(userId);
    	return ResponseEntity.ok(Map.of(
    			"images" ,images,
    			"count", images.size()
    			));
    }
    
    @DeleteMapping("/{visionId}")
    public ResponseEntity<?> deleteVision(@PathVariable String visionId) {
        String userId = getCurrentUserId();
        Vision vision = visionRepository.findById(visionId)
                .orElseThrow(() -> new RuntimeException("Image not found"));

        if (!vision.getUserId().equals(userId)) {
            return ResponseEntity.status(403).body("Unauthorized");
        }

        String key = vision.getSolvedImageKey()
                .replace("https://umni-vision-images.s3.amazonaws.com/", "");
        s3Service.deleteImage(key);

        visionRepository.deleteById(visionId);

        return ResponseEntity.ok(Map.of("success", true));
    }
    
    

}
