package com.fintrack.backend.controller;

import com.fintrack.backend.dto.DashboardSummaryDTO;
import com.fintrack.backend.model.User;
import com.fintrack.backend.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryDTO> getCurrentMonthSummary(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(analyticsService.getCurrentMonthSummary(user.getId()));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<Map<String, Object>>> getCategoryBreakdown(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        if (startDate == null)
            startDate = LocalDate.now().minusMonths(1);
        if (endDate == null)
            endDate = LocalDate.now();
        return ResponseEntity.ok(analyticsService.getCategoryBreakdown(user.getId(), startDate, endDate));
    }

    @GetMapping("/monthly-trend")
    public ResponseEntity<List<Map<String, Object>>> getMonthlyTrend(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "6") int months) {
        return ResponseEntity.ok(analyticsService.getMonthlyTrend(user.getId(), months));
    }

    @GetMapping("/top-merchants")
    public ResponseEntity<List<Map<String, Object>>> getTopMerchants(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "10") int limit) {
        if (startDate == null)
            startDate = LocalDate.now().minusMonths(1);
        if (endDate == null)
            endDate = LocalDate.now();
        return ResponseEntity.ok(analyticsService.getTopMerchants(user.getId(), startDate, endDate, limit));
    }
}
