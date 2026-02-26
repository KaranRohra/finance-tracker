package com.fintrack.backend.dto;

import com.fintrack.backend.model.Transaction;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CreateTransactionRequest {
    @NotNull
    private BigDecimal amount;
    private String currency = "INR";
    private String category;
    private String merchant;
    private String description;
    @NotNull
    private LocalDate transactionDate;
    @NotNull
    private Transaction.TransactionType type;
    private Transaction.AccountType accountType;
    private String bankName;
}
