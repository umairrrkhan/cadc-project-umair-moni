package com.umni.common.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;
import java.util.Locale;
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
    	this.webClient = webClientBuilder
    	        .baseUrl(apiUrl)
    	        .build();
    }
    
    public Mono<String> getChatCompletion(List<Map<String , String >> messages){
    	Map<String , Object> requestBody = new HashMap<>();
    	requestBody.put("model", model);
        requestBody.put("messages", messages);
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
					return handleApiError(e);
				});
    }
    
    public Mono<String> getChatCompletionWithHistory(List<Map<String, String>> conversationHistory) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);
        requestBody.put("messages", conversationHistory);
        requestBody.put("stream", false);

        return webClient.post()
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .map(response -> {
                    List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                    if (choices != null && !choices.isEmpty()) {
                        Map<String, String> message = (Map<String, String>) choices.get(0).get("message");
                        return message.get("content");
                    }
                    return "Sorry, I couldn't generate a response.";
                })
                .onErrorResume(e -> {
                    return handleApiError(e);
                });
    
    }

    private Mono<String> handleApiError(Throwable error) {
        String userMessage = classifyApiError(error);

        if (error instanceof WebClientResponseException responseError) {
            System.err.println("DeepSeek API request failed with HTTP "
                    + responseError.getStatusCode().value());
        } else {
            System.err.println("DeepSeek API request failed: "
                    + error.getClass().getSimpleName());
        }

        return Mono.just(userMessage);
    }

    private String classifyApiError(Throwable error) {
        if (error instanceof WebClientResponseException responseError) {
            int status = responseError.getStatusCode().value();
            String responseBody = responseError.getResponseBodyAsString().toLowerCase(Locale.ROOT);

            if (status == 402 || containsAny(responseBody,
                    "insufficient balance", "insufficient_balance",
                    "insufficient quota", "insufficient_quota",
                    "out of balance", "billing", "credits exhausted")) {
                return "AI service credits are exhausted. Please recharge the API account and try again.";
            }
            if (status == 401) {
                return "AI service authentication failed. Please verify the configured API key.";
            }
            if (status == 403) {
                return "AI service access was denied. Please verify the account and model permissions.";
            }
            if (status == 429) {
                return "AI service rate limit reached. Please wait a moment and try again.";
            }
            if (status == 400 || status == 422) {
                return "AI service rejected the request. Please verify the configured model and request settings.";
            }
            if (status >= 500) {
                return "AI service is temporarily unavailable. Please try again later.";
            }
        }

        if (error instanceof WebClientRequestException) {
            return "Could not reach the AI service. Please check the network connection and try again.";
        }

        return "The AI request failed unexpectedly. Please try again later.";
    }

    private boolean containsAny(String text, String... values) {
        for (String value : values) {
            if (text.contains(value)) {
                return true;
            }
        }
        return false;
    }

}
