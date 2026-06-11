package com.umni.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import java.util.Map;
import java.util.List;
import java.util.HashMap;


@Service
public class DeepSeekService {
	
	private final WebClient webClient;
	private final String apiKey;
	private final String model;
	
	public DeepSeekService(WebClient.Builder webClientBuilder,
			@Value ("${deepseek.api.key}") String apiKey,
	@Value("${deepseek.api.url}") String apiUrl,
    @Value("${deepseek.model}") String model){
    	this.apiKey = apiKey;
    	this.model = model;
    	this.webClient = webClientBuilder.baseUrl(apiUrl).build();
    }
    
    public Mono<String> getChatCompletion(String userMessage){
    	Map<String , Object> requestBody = new HashMap<>();
    	requestBody.put("model", model);
    	requestBody.put("messages", List.of(Map.of("role", "user", "content", userMessage)));
    	requestBody.put("stream", false);
    	
    	return webClient.post()
    			.header("Authorization", "Bearer " + apiKey)
    			
    			.bodyValue(requestBody)
    			.retrieve()
    			.bodyToMono(Map.class)
    			.map(response -> {
    				List<Map<String , Object>> choices = (List<Map<String ,Object >>)
    						response.get("choices");
    				if(choices!=null && !choices.isEmpty()) {
    					Map<String , String> message = (Map<String , String>)
    							choices.get(0).get("message");
    					return message.get("content");
    				}
    				return "sorry , i couldnt generate a response ";
    			})
    			.onErrorResume(e->{
    				System.out.println("deepseek api error : " + e.getMessage());
    				return Mono.just("sorry , something went wrong ,pls try again latter");
    			});
    }

}
