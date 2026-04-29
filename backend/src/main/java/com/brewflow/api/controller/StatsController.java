package com.brewflow.api.controller;

import com.brewflow.api.config.security.SecurityUtils;
import com.brewflow.api.domain.WeeklyStat;
import com.brewflow.api.dto.response.ApiResponse;
import com.brewflow.api.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    @GetMapping("/weekly")
    public ResponseEntity<ApiResponse<com.brewflow.api.dto.response.PageResponse<WeeklyStat>>> getWeeklyStats(
            @RequestParam(name = "storeId") long storeId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "5") int size,
            @RequestParam(name = "orderBy", defaultValue = "latest") String orderBy
    ) {
        long userId = SecurityUtils.currentUserId();
        return ResponseEntity.ok(ApiResponse.ok(statsService.getWeeklyStats(userId, storeId, page, size, orderBy)));
    }

    @PostMapping("/trigger-weekly")
    public ResponseEntity<ApiResponse<Void>> triggerWeeklyStats() {
        statsService.generateLiveWeeklyStats();
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/dashboard-summary")
    public ResponseEntity<ApiResponse<com.brewflow.api.dto.response.DashboardStatsResponse>> dashboardSummary(
            @RequestParam(name = "storeId", required = false) Long storeId
    ) {
        long userId = SecurityUtils.currentUserId();
        return ResponseEntity.ok(ApiResponse.ok(statsService.getDashboardStats(userId, storeId)));
    }
}
