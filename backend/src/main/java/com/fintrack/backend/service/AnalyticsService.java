package com.fintrack.backend.service;

import com.fintrack.backend.dto.DashboardSummaryDTO;
import com.fintrack.backend.model.Transaction;
import com.fintrack.backend.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final TransactionRepository transactionRepository;

    public DashboardSummaryDTO getCurrentMonthSummary(UUID userId) {
        LocalDate start = LocalDate.now().withDayOfMonth(1);
        LocalDate end = LocalDate.now();

        BigDecimal totalDebit = transactionRepository.sumByUserIdAndTypeAndDateRange(
                userId, Transaction.TransactionType.DEBIT, start, end).orElse(BigDecimal.ZERO);
        BigDecimal totalCredit = transactionRepository.sumByUserIdAndTypeAndDateRange(
                userId, Transaction.TransactionType.CREDIT, start, end).orElse(BigDecimal.ZERO);
        long count = transactionRepository.countByUserIdAndTransactionDateBetween(userId, start, end);

        return DashboardSummaryDTO.builder()
                .totalDebit(totalDebit)
                .totalCredit(totalCredit)
                .netSavings(totalCredit.subtract(totalDebit))
                .transactionCount(count)
                .month(start.format(DateTimeFormatter.ofPattern("MMMM yyyy")))
                .build();
    }

    public List<Map<String, Object>> getCategoryBreakdown(UUID userId, LocalDate startDate, LocalDate endDate) {
        List<Object[]> raw = transactionRepository.findCategoryBreakdown(userId, startDate, endDate);
        BigDecimal total = raw.stream()
                .map(r -> (BigDecimal) r[1])
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : raw) {
            String category = row[0] != null ? (String) row[0] : "Uncategorized";
            BigDecimal amount = (BigDecimal) row[1];
            BigDecimal pct = total.compareTo(BigDecimal.ZERO) > 0
                    ? amount.divide(total, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                    : BigDecimal.ZERO;

            result.add(Map.of(
                    "category", category,
                    "total", amount,
                    "percentage", pct.setScale(1, RoundingMode.HALF_UP),
                    "count", row[2]));
        }
        return result;
    }

    public List<Map<String, Object>> getMonthlyTrend(UUID userId, int months) {
        LocalDate startDate = LocalDate.now().minusMonths(months).withDayOfMonth(1);
        List<Object[]> raw = transactionRepository.findMonthlyTotals(userId, startDate);

        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : raw) {
            result.add(Map.of(
                    "year", row[0],
                    "month", row[1],
                    "totalDebit", row[2] != null ? row[2] : BigDecimal.ZERO,
                    "totalCredit", row[3] != null ? row[3] : BigDecimal.ZERO));
        }
        return result;
    }

    public List<Map<String, Object>> getTopMerchants(UUID userId, LocalDate startDate, LocalDate endDate, int limit) {
        List<Object[]> raw = transactionRepository.findTopMerchants(
                userId, startDate, endDate, PageRequest.of(0, limit));

        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : raw) {
            result.add(Map.of(
                    "merchant", row[0],
                    "total", row[1]));
        }
        return result;
    }
}
