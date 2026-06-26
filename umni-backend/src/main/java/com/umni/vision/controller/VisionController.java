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
    
    private String getCurrentUserI

}
