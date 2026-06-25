package com.umni.vision.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import java.util.*;

@Service
public class VisionService {
	
	private final WebClient webClient;
	private final String apiKey;
	private final String model;
	
	private static final String DEFAULT_PROMPT = "replace the ? with the correct value written in red";
	
			
	
	
	public VisionService(WebClient.Builder webClientBuilder,  
			@Value("${gemini.api.key}") String apiKey,
            @Value("${gemini.model}") String model) {
		this.apiKey = apiKey;
        this.model = model;
        this.webClient = webClientBuilder
                .baseUrl("https://generativelanguage.googleapis.com/v1beta")
                .build();
	}
	
	public Mono<String> solveMathProblem(String base64Image){
		 
		 Map<String , Object> request = buildGeminiRequest(base64Image);
		 
		 return webClient.post()
				 .uri(uriBuilder -> uriBuilder
						 .path("/models/{model}:generateContent")
						 .queryParam("key", apiKey)
						 .build(model))
				 .header("Content-Type", "application/json")
				 .bodyValue(request)
				 .retrieve()
				 .bodyToMono(Map.class)
				 .map(this::extractGeneratedImage);
		
	}
	
	private Map<String , Object> buildGeminiRequest(String base64Image){
		Map<String , Object> part1 = Map.of("text",DEFAULT_PROMPT);
		Map<String , Object> part2 = Map.of(
				"inlineData", Map.of(
						"mimeType", "image/png",
						"data",base64Image
						)
				);
				Map<String , Object> content = Map.of(
						"parts",List.of(part1, part2)
						);
				
				return Map.of(
			            "contents", List.of(content),
			            "generationConfig", Map.of(
			                "temperature", 0.7,
			                "topP", 0.95,
			                "maxOutputTokens", 8192
			            )
			        );
				
	}
	
	@SuppressWarnings("unchecked")
	private String extractGeneratedImage(Map<String, Object> response) {
        try {
            List<Map<String, Object>> candidates = 
                (List<Map<String, Object>>) response.get("candidates");
            
            if (candidates != null && !candidates.isEmpty()) {
                Map<String, Object> content = 
                    (Map<String, Object>) candidates.get(0).get("content");
                List<Map<String, Object>> parts = 
                    (List<Map<String, Object>>) content.get("parts");
                
                for (Map<String, Object> part : parts) {
                    if (part.containsKey("inlineData")) {
                        Map<String, String> inlineData = 
                            (Map<String, String>) part.get("inlineData");
                        return inlineData.get("data");
                    }
                }
            }return null;
	
        } catch (Exception e) {
        	e.printStackTrace();
        	return null;
        }
	}
}
