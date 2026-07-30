package com.umni.vision.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.core.io.ByteArrayResource;
import reactor.core.publisher.Mono;
import java.util.*;

@Service
public class VisionService {

    private final WebClient webClient;
    private final String apiKey;
    private final String model;
    private final String quality;
    private final String size;

    private static final String DEFAULT_PROMPT = "solve the math problem shown in the image, replace x with the correct value written in red";

    public VisionService(WebClient.Builder webClientBuilder,
            @Value("${openai.api.key}") String apiKey,
            @Value("${openai.image.model}") String model,
            @Value("${openai.image.quality}") String quality,
            @Value("${openai.image.size}") String size) {
        this.apiKey = apiKey;
        this.model = model;
        this.quality = quality;
        this.size = size;
        this.webClient = webClientBuilder
                .baseUrl("https://api.openai.com")
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(10 * 1024 * 1024))
                .build();
    }

    @SuppressWarnings("unchecked")
    public Mono<String> solveMathProblem(String base64Image) {
        byte[] imageBytes;
        try {
            imageBytes = Base64.getDecoder().decode(base64Image);
        } catch (Exception e) {
            System.out.println("Base64 decode error: " + e.getMessage());
            return Mono.just("");
        }

        ByteArrayResource imageResource = new ByteArrayResource(imageBytes) {
            @Override
            public String getFilename() {
                return "image.png";
            }
        };

        MultipartBodyBuilder builder = new MultipartBodyBuilder();
        builder.part("model", model);
        builder.part("image", imageResource, MediaType.IMAGE_PNG);
        builder.part("prompt", DEFAULT_PROMPT);
        builder.part("quality", quality);
        builder.part("size", size);
        builder.part("output_format", "png");
        builder.part("n", 1);

        return webClient.post()
                .uri("/v1/images/edits")
                .header("Authorization", "Bearer " + apiKey)
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(builder.build()))
                .retrieve()
                .bodyToMono(Map.class)
                .map(response -> {
                    List<Map<String, Object>> data = (List<Map<String, Object>>) response.get("data");
                    if (data != null && !data.isEmpty()) {
                        return (String) data.get(0).get("b64_json");
                    }
                    return "";
                })
                .onErrorResume(e -> {
                    e.printStackTrace();
                    if (e instanceof WebClientResponseException) {
                        WebClientResponseException wcre = (WebClientResponseException) e;
                        System.out.println("OpenAI edit error body: " + wcre.getResponseBodyAsString());
                    }
                    System.out.println("OpenAI edit error: " + e.getMessage());
                    return Mono.just("");
                });
    }
}
