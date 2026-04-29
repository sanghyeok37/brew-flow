package com.brewflow.api.controller;
 
import com.brewflow.api.config.security.SecurityUtils;
import com.brewflow.api.dto.response.ApiResponse;
import com.brewflow.api.dto.response.SettlementResponse;
import com.brewflow.api.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
 
@RestController
@RequestMapping("/api/v1/settlement")
@RequiredArgsConstructor
public class SettlementController {
 
    private final StatsService statsService;
 
    @GetMapping("/{storeId}")
    public ResponseEntity<ApiResponse<SettlementResponse>> settlement(
            @PathVariable(name = "storeId") long storeId,
            @RequestParam(name = "year") int year,
            @RequestParam(name = "month") int month
    ) {
        long userId = SecurityUtils.currentUserId();
        SettlementResponse response = statsService.getMonthlySettlementAmount(userId, storeId, year, month);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
