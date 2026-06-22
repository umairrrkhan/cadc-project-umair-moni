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
		 String prompt ="replace the ? with the correct value written in red";
		 
		 Map<String , Object> request = buildGeminiRequest(base64Image, prompt);
		 
		 return webClient.post()
				 .uri(uriBuilder -> uriBuilder
						 .path("/models/{model}:generateContent")
						 .queryParam("key", apiKey)
						 .build(model))
				 .header("Content-Type", "application/json")
				 .bodyValue(request)
				 .retrieve()
				 .bodyToMono(Map.class)
				 .map(response -> extractGeneratedImage(response));
		
	}
	
	private Map<String , Object> buildGeminiRequest(String base64Image , String prompt){
		Map<String , Object> part1 = Map.of("text",prompt);
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
	
	

}
