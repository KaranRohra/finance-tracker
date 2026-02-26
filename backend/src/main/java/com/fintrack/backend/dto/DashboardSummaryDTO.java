package com.fintrack.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class DashboardSummaryDTO {
    private BigDecimal totalDebit;
    private BigDecimal totalCredit;
    private BigDecimal netSavings;
    private long transactionCount;
    private String month;
}
