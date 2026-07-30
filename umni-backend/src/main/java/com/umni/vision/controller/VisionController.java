package com.umni.vision.controller;

import java.time.Instant;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.umni.vision.model.Vision;
import com.umni.vision.repository.VisionRepository;
import com.umni.vision.service.S3StorageService;
import com.umni.vision.service.VisionService;

import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/vision")
public class VisionController {

    private static final int MAX_IMAGE_SIZE = 10 * 1024 * 1024;

    private final VisionService visionService;
    private final S3StorageService s3Service;
    private final VisionRepository visionRepository;

    public VisionController(VisionService visionService,
            S3StorageService s3Service,
            VisionRepository visionRepository) {
        this.visionService = visionService;
        this.s3Service = s3Service;
        this.visionRepository = visionRepository;
    }

    private String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getDetails() instanceof Map<?, ?> details)) {
            throw new RuntimeException("User is not authenticated");
        }
        Object userId = details.get("userId");
        if (userId instanceof String value && !value.isBlank()) {
            return value;
        }
        throw new RuntimeException("User ID not found");
    }

    @PostMapping("/solve")
    public Mono<ResponseEntity<Map<String, Object>>> solveMathProblem(
            @RequestBody Map<String, Object> request) {
        String userId = getCurrentUserId();
        Object imageValue = request.get("image");
        if (!(imageValue instanceof String image) || image.isBlank()) {
            return Mono.just(badRequest("A PNG image is required"));
        }

        String base64Image = image.contains(",")
                ? image.substring(image.indexOf(",") + 1)
                : image;

        final byte[] originalImageBytes;
        try {
            originalImageBytes = Base64.getDecoder().decode(base64Image);
            validatePng(originalImageBytes);
        } catch (IllegalArgumentException error) {
            return Mono.just(badRequest(error.getMessage()));
        }

        return visionService.solveMathProblem(base64Image)
                .map(generatedBase64 -> persistSolution(
                        userId, originalImageBytes, generatedBase64))
                .onErrorResume(error -> {
                    System.out.println("Vision solve failed: " + error.getMessage());
                    return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body(errorBody("Could not store the generated solution")));
                });
    }

    private ResponseEntity<Map<String, Object>> persistSolution(
            String userId, byte[] originalImageBytes, String generatedBase64) {
        if (generatedBase64 == null || generatedBase64.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(errorBody("AI could not generate a solution image"));
        }

        byte[] solvedImageBytes = Base64.getDecoder().decode(generatedBase64);
        String originalImageUrl = null;
        String solvedImageUrl = null;

        try {
            originalImageUrl = s3Service.uploadImage(originalImageBytes, userId, "original");
            solvedImageUrl = s3Service.uploadImage(solvedImageBytes, userId, "solved");

            Vision vision = new Vision();
            vision.setUserId(userId);
            vision.setTitle("Solved " + Instant.now());
            vision.setOriginalImageKey(originalImageUrl);
            vision.setSolvedImageKey(solvedImageUrl);
            vision.setCreatedAt(Instant.now());
            vision.setUpdatedAt(Instant.now());
            visionRepository.save(vision);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("imageurl", solvedImageUrl);
            response.put("visionid", vision.getId());
            return ResponseEntity.ok(response);
        } catch (RuntimeException storageError) {
            deleteStoredImage(originalImageUrl);
            deleteStoredImage(solvedImageUrl);
            throw storageError;
        }
    }

    private void validatePng(byte[] imageBytes) {
        if (imageBytes.length == 0 || imageBytes.length > MAX_IMAGE_SIZE) {
            throw new IllegalArgumentException("Image must be between 1 byte and 10 MB");
        }
        if (imageBytes.length < 8
                || (imageBytes[0] & 0xFF) != 0x89
                || imageBytes[1] != 0x50
                || imageBytes[2] != 0x4E
                || imageBytes[3] != 0x47) {
            throw new IllegalArgumentException("Only PNG canvas images are supported");
        }
    }

    @GetMapping("/library")
    public ResponseEntity<?> getUserLibrary() {
        var images = visionRepository.findByUserIdOrderByCreatedAtDesc(getCurrentUserId());
        return ResponseEntity.ok(Map.of("images", images, "count", images.size()));
    }

    @DeleteMapping("/{visionId}")
    public ResponseEntity<?> deleteVision(@PathVariable String visionId) {
        String userId = getCurrentUserId();
        Vision vision = visionRepository.findById(visionId)
                .orElseThrow(() -> new RuntimeException("Image not found"));

        if (!vision.getUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Unauthorized");
        }

        deleteStoredImage(vision.getOriginalImageKey());
        deleteStoredImage(vision.getSolvedImageKey());
        visionRepository.deleteById(visionId);
        return ResponseEntity.ok(Map.of("success", true));
    }

    private void deleteStoredImage(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            return;
        }
        try {
            s3Service.deleteImageByUrl(imageUrl);
        } catch (Exception error) {
            System.out.println("Failed to delete image from S3: " + error.getMessage());
        }
    }

    private ResponseEntity<Map<String, Object>> badRequest(String message) {
        return ResponseEntity.badRequest().body(errorBody(message));
    }

    private Map<String, Object> errorBody(String message) {
        Map<String, Object> error = new HashMap<>();
        error.put("success", false);
        error.put("error", message);
        return error;
    }
}
