package com.fintrack.backend.controller.auth;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/auth")
public class GoogleOAuthController {

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String clientSecret;

    HttpClient client = HttpClient.newHttpClient();

    @GetMapping("/google")
    public ResponseEntity<?> handleGoogleCallback(@RequestParam String code) throws Exception {
        String body = "code=" + code +
                "&client_id=" + clientId +
                "&client_secret=" + clientSecret +
                "&redirect_uri=http://localhost:5173" +
                "&grant_type=authorization_code" +
                "&scope=https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/gmail.readonly";

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://oauth2.googleapis.com/token"))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() == 200) {
            return ResponseEntity.ok(response.body());
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token exchange failed");
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> getAccessToken(@RequestBody Map<String, String> requestBody)
            throws IOException, InterruptedException {
        String body = "refresh_token=" + requestBody.get("refreshToken") +
                "&client_id=" + clientId +
                "&client_secret=" + clientSecret +
                "&grant_type=refresh_token";

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://oauth2.googleapis.com/token"))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() == 200) {
            return ResponseEntity.ok(response.body());
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to refresh token");
        }
    }

}
