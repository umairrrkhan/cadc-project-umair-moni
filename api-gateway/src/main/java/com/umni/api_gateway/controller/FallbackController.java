package com.umni.api_gateway.controller;


import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/fallback")
public class FallbackController {
	
	@PostMapping("/core")
    public Map<String, String> coreFallback() {
        Map<String, String> response = new HashMap<>();
        response.put("error", "core service is temporarily unavailable please try again later.");
        response.put("status", "503");
        return response;
    }
	
	
	@PostMapping("/note")
    public Map<String, String> noteFallback() {
        Map<String, String> response = new HashMap<>();
        response.put("error", "note service is temporarily unavailable. your file upload may not have been saved.");
        response.put("status", "503");
        return response;
    }

}
