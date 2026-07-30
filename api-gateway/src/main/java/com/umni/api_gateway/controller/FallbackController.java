package com.umni.api_gateway.controller;


import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/fallback")
public class FallbackController {
	
	@RequestMapping("/core")
    public ResponseEntity<Map<String, String>> coreFallback() {
        Map<String, String> response = new HashMap<>();
        response.put("error", "core service is temporarily unavailable please try again later.");
        response.put("status", "503");
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }
	
	
	@RequestMapping("/note")
    public ResponseEntity<Map<String, String>> noteFallback() {
        Map<String, String> response = new HashMap<>();
        response.put("error", "note service is temporarily unavailable. your file upload may not have been saved.");
        response.put("status", "503");
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }

}
