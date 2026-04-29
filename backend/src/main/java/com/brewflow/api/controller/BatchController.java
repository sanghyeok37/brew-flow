package com.brewflow.api.controller;

import com.brewflow.api.dto.response.ApiResponse;
import com.brewflow.api.service.PurchaseOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/batch")
@RequiredArgsConstructor
public class BatchController {

    private final PurchaseOrderService purchaseOrderService;
    private final com.brewflow.api.service.StatsService statsService;

    @PostMapping("/threshold-check")
    @PreAuthorize("hasAnyRole('SYSTEM', 'HQ')")
    public ResponseEntity<ApiResponse<Void>> triggerThresholdCheck() {
        purchaseOrderService.runThresholdCheck();
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @PostMapping("/order-placement")
    @PreAuthorize("hasAnyRole('SYSTEM', 'HQ')")
    public ResponseEntity<ApiResponse<Void>> triggerOrderPlacement() {
        purchaseOrderService.runPendingToOrdered();
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @PostMapping("/stats-generation")
    @PreAuthorize("hasAnyRole('SYSTEM', 'HQ')")
    public ResponseEntity<ApiResponse<Void>> triggerStatsGeneration() {
        statsService.generateLastWeekStats();
        return ResponseEntity.ok(ApiResponse.ok());
    }
}
