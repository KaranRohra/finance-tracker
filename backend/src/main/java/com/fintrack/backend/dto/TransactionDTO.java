package com.fintrack.backend.dto;

import com.fintrack.backend.model.Transaction;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class TransactionDTO {
    private UUID id;
    private BigDecimal amount;
    private String currency;
    private String category;
    private String merchant;
    private String description;
    private LocalDate transactionDate;
    private String source;
    private String type;
    private String accountType;
    private String bankName;

    public static TransactionDTO from(Transaction t) {
        return TransactionDTO.builder()
                .id(t.getId())
                .amount(t.getAmount())
                .currency(t.getCurrency())
                .category(t.getCategory())
                .merchant(t.getMerchant())
                .description(t.getDescription())
                .transactionDate(t.getTransactionDate())
                .source(t.getSource() != null ? t.getSource().name() : null)
                .type(t.getType() != null ? t.getType().name() : null)
                .accountType(t.getAccountType() != null ? t.getAccountType().name() : null)
                .bankName(t.getBankName())
                .build();
    }
}
