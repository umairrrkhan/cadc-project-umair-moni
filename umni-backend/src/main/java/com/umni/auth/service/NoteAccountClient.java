package com.umni.auth.service;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Service
public class NoteAccountClient {

    private final WebClient webClient;

    public NoteAccountClient(WebClient.Builder builder,
            @Value("${note.service.url}") String noteServiceUrl) {
        this.webClient = builder.baseUrl(noteServiceUrl).build();
    }

    public void deleteCurrentUserNotes(String authorizationHeader) {
		if (authorizationHeader == null || authorizationHeader.isBlank()) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
					"Authorization header is required for note cleanup");
		}

        try {
            webClient.delete()
                    .uri("/api/notes/account")
                    .header("Authorization", authorizationHeader)
                    .retrieve()
                    .toBodilessEntity()
                    .block(Duration.ofSeconds(30));
        } catch (RuntimeException error) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Could not delete notes; account was not deleted", error);
        }
    }
}
