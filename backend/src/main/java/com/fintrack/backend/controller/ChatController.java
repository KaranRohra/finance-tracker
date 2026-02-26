package com.fintrack.backend.controller;

import com.fintrack.backend.model.ChatMessage;
import com.fintrack.backend.model.User;
import com.fintrack.backend.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @GetMapping("/history")
    public ResponseEntity<List<Map<String, Object>>> getHistory(@AuthenticationPrincipal User user) {
        List<ChatMessage> history = chatService.getHistory(user);
        List<Map<String, Object>> result = history.stream()
                .map(m -> Map.<String, Object>of(
                        "id", m.getId(),
                        "role", m.getRole(),
                        "content", m.getContent(),
                        "createdAt", m.getCreatedAt().toString()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/message")
    public ResponseEntity<?> sendMessage(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> request) {
        String message = request.get("message");
        if (message == null || message.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message cannot be empty"));
        }
        ChatMessage response = chatService.sendMessage(user, message);
        return ResponseEntity.ok(Map.of(
                "id", response.getId(),
                "role", response.getRole(),
                "content", response.getContent(),
                "createdAt", response.getCreatedAt().toString()));
    }
}
