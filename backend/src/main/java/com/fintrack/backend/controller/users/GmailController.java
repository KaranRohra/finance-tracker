package com.fintrack.backend.controller.users;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class GmailController {

    @GetMapping("/api/gmails")
    public ResponseEntity<?> fetchGmails(Authentication authentication) throws IOException, InterruptedException {
        String accessToken = (String) authentication.getCredentials();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://gmail.googleapis.com/gmail/v1/users/me/messages"))
                .header("Authorization", "Bearer " + accessToken)
                .GET()
                .build();

        HttpClient client = HttpClient.newHttpClient();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        return ResponseEntity.status(response.statusCode())
                .body(response.body());
    }
}
