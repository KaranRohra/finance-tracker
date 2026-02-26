package com.fintrack.backend.controller;

import com.fintrack.backend.dto.CreateTransactionRequest;
import com.fintrack.backend.dto.TransactionDTO;
import com.fintrack.backend.model.User;
import com.fintrack.backend.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    public ResponseEntity<Page<TransactionDTO>> getTransactions(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(
                transactionService.getTransactions(user.getId(), startDate, endDate, category, type, search, page,
                        size));
    }

    @PostMapping
    public ResponseEntity<TransactionDTO> createTransaction(
            @AuthenticationPrincipal User user,
            @RequestBody CreateTransactionRequest request) {
        return ResponseEntity.ok(transactionService.createTransaction(user, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionDTO> updateTransaction(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id,
            @RequestBody CreateTransactionRequest request) {
        return ResponseEntity.ok(transactionService.updateTransaction(id, user.getId(), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTransaction(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id) {
        transactionService.deleteTransaction(id, user.getId());
        return ResponseEntity.ok().build();
    }
}
