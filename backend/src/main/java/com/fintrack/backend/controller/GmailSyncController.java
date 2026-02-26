package com.fintrack.backend.controller;

import com.fintrack.backend.model.User;
import com.fintrack.backend.service.TransactionIngestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/gmail")
@RequiredArgsConstructor
public class GmailSyncController {

    private final TransactionIngestionService transactionIngestionService;

    @PostMapping("/sync")
    public ResponseEntity<?> syncGmail(@AuthenticationPrincipal User user) {
        try {
            int count = transactionIngestionService.syncGmailTransactions(user.getId());
            return ResponseEntity.ok(Map.of(
                    "message", "Sync complete",
                    "newTransactions", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
