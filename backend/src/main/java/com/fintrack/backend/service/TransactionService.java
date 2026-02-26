package com.fintrack.backend.service;

import com.fintrack.backend.dto.CreateTransactionRequest;
import com.fintrack.backend.dto.TransactionDTO;
import com.fintrack.backend.model.Transaction;
import com.fintrack.backend.model.User;
import com.fintrack.backend.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;

    public Page<TransactionDTO> getTransactions(UUID userId, LocalDate startDate, LocalDate endDate,
            String category, String type, String search,
            int page, int size) {
        Transaction.TransactionType transactionType = null;
        if (type != null && !type.isBlank()) {
            transactionType = Transaction.TransactionType.valueOf(type.toUpperCase());
        }
        Pageable pageable = PageRequest.of(page, size);
        return transactionRepository.findByUserIdWithFilters(
                userId, startDate, endDate, category, transactionType, search, pageable).map(TransactionDTO::from);
    }

    @Transactional
    public TransactionDTO createTransaction(User user, CreateTransactionRequest req) {
        Transaction transaction = Transaction.builder()
                .user(user)
                .amount(req.getAmount())
                .currency(req.getCurrency() != null ? req.getCurrency() : "INR")
                .category(req.getCategory())
                .merchant(req.getMerchant())
                .description(req.getDescription())
                .transactionDate(req.getTransactionDate())
                .source(Transaction.TransactionSource.MANUAL)
                .type(req.getType())
                .accountType(req.getAccountType())
                .bankName(req.getBankName())
                .build();
        return TransactionDTO.from(transactionRepository.save(transaction));
    }

    @Transactional
    public TransactionDTO updateTransaction(UUID id, UUID userId, CreateTransactionRequest req) {
        Transaction transaction = transactionRepository.findById(id)
                .filter(t -> t.getUser().getId().equals(userId))
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        transaction.setAmount(req.getAmount());
        transaction.setCategory(req.getCategory());
        transaction.setMerchant(req.getMerchant());
        transaction.setDescription(req.getDescription());
        transaction.setTransactionDate(req.getTransactionDate());
        transaction.setType(req.getType());
        transaction.setAccountType(req.getAccountType());
        transaction.setBankName(req.getBankName());
        if (req.getCurrency() != null)
            transaction.setCurrency(req.getCurrency());

        return TransactionDTO.from(transactionRepository.save(transaction));
    }

    @Transactional
    public void deleteTransaction(UUID id, UUID userId) {
        Transaction transaction = transactionRepository.findById(id)
                .filter(t -> t.getUser().getId().equals(userId))
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        transactionRepository.delete(transaction);
    }
}
