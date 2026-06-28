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
    	if (details instanceof Map) {
    	    Map<String, Object> map = (Map<String, Object>) details;
    	    String userId = (String) map.get("userId");
    	    if (userId != null) {
    	        System.out.println("VISION userId from map: " + userId);
    	        return userId;
    	    }
    	}
    	
    	throw new RuntimeException("User id not found");
    }
    
    @PostMapping("/solve")
    public Mono<Map<String, Object>> solveMathProblem(
    		@RequestBody Map<String , Object> request ){
    
    	System.out.println("=== VISION SOLVE CALLED ===");
    	String userId = getCurrentUserId();
    	System.out.println("userId: " + userId);
    	String base64Image = String.valueOf(request.get("image"));
        
        if(base64Image != null && base64Image.contains(",")) {
        	base64Image = base64Image.substring(base64Image.indexOf(",")+1);
        }
        
        return visionService.solveMathProblem(base64Image)
        		.map(generatedBase64 ->{
                    System.out.println("Generated base64 length: " + (generatedBase64 != null ? generatedBase64.length() : "null"));
        		    if (generatedBase64 == null || generatedBase64.isEmpty()) {
        		        Map<String, Object> err = new java.util.HashMap<>();
        		        err.put("success", false);
        		        err.put("error", "AI could not generate a solution image");
        		        return err;
        		    }
        			byte[] imageBytes = Base64.getDecoder().decode(generatedBase64);
        			
        			String imageUrl;
                    try {
                        imageUrl = s3Service.uploadImage(imageBytes , userId , "solved");
                        System.out.println("Uploaded image to S3: " + imageUrl);
                    } catch (Exception s3Error) {
                        System.out.println("S3 upload failed, falling back to Base64 data URL: " + s3Error.getMessage());
                        imageUrl = "data:image/png;base64," + generatedBase64;
                    }
        			
        			Vision vision = new Vision();
        			vision.setUserId(userId);
        			vision.setTitle("solved "+Instant.now().toString());
        			vision.setSolvedImageKey(imageUrl);
        			vision.setCreatedAt(Instant.now());
        			vision.setUpdatedAt(Instant.now());
        			visionRepository.save(vision);
                    System.out.println("Saved vision entity to database: " + vision.getId());
        			
        			Map<String, Object> response = new java.util.HashMap<>();
        			response.put("success", true);
        			response.put("imageurl", imageUrl);
        			response.put("visionid", vision.getId());

        			return response;
        			
        		})
        		
        		.onErrorResume(error -> {
                    System.out.println("VisionController error caught:");
                    error.printStackTrace();
        			Map<String, Object> errMap = new java.util.HashMap<>();
        			errMap.put("success", false);
        			errMap.put("error", error.getMessage());
        			return Mono.just(errMap);
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

        String key = vision.getSolvedImageKey();
        if (key != null && key.startsWith("https://")) {
            String s3Key = key.replace("https://umni-vision-images.s3.amazonaws.com/", "");
            try {
                s3Service.deleteImage(s3Key);
            } catch (Exception e) {
                System.out.println("Failed to delete image from S3: " + e.getMessage());
            }
        }

        visionRepository.deleteById(visionId);

        return ResponseEntity.ok(Map.of("success", true));
    }
    
    

}