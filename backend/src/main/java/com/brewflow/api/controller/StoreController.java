package com.brewflow.api.controller;
 
import com.brewflow.api.config.security.SecurityUtils;
import com.brewflow.api.domain.StoreView;
import com.brewflow.api.dto.response.ApiResponse;
import com.brewflow.api.dto.response.MonthlyProductSummary;
import com.brewflow.api.dto.response.PageResponse;
import com.brewflow.api.service.StoreService;
import com.brewflow.api.type.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
 
import java.util.List;
 
@RestController
@RequestMapping("/api/v1/admin/stores")
@RequiredArgsConstructor
public class StoreController {
 
    private final StoreService storeService;
 
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<StoreView>>> getStores(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "status", required = false) String status) {
        // 권한 체크: SYSTEM 또는 HQ만 허용
        SecurityUtils.assertAnyRole(UserRole.SYSTEM, UserRole.HQ);
        
        long userId = SecurityUtils.currentUserId();
        return ResponseEntity.ok(ApiResponse.ok(storeService.getStoresForManagement(userId, keyword, status, page, size)));
    }
 
    @GetMapping("/{storeId}")
    public ResponseEntity<ApiResponse<StoreView>> getStoreDetail(@PathVariable(name = "storeId") long storeId) {
        SecurityUtils.assertAnyRole(UserRole.SYSTEM, UserRole.HQ);
        
        long userId = SecurityUtils.currentUserId();
        return ResponseEntity.ok(ApiResponse.ok(storeService.getStoreDetail(userId, storeId)));
    }
 
    @GetMapping("/{storeId}/monthly-order")
    public ResponseEntity<ApiResponse<Long>> getMonthlyOrderAmount(
            @PathVariable(name = "storeId") long storeId,
            @RequestParam(name = "year") int year,
            @RequestParam(name = "month") int month) {
        SecurityUtils.assertAnyRole(UserRole.SYSTEM, UserRole.HQ);
        return ResponseEntity.ok(ApiResponse.ok(storeService.getMonthlyOrderAmount(storeId, year, month)));
    }
 
    @GetMapping("/{storeId}/monthly-products")
    public ResponseEntity<ApiResponse<List<MonthlyProductSummary>>> getMonthlyProducts(
            @PathVariable(name = "storeId") long storeId,
            @RequestParam(name = "year") int year,
            @RequestParam(name = "month") int month) {
        SecurityUtils.assertAnyRole(UserRole.SYSTEM, UserRole.HQ);
        return ResponseEntity.ok(ApiResponse.ok(storeService.getMonthlyProductSummaries(storeId, year, month)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> createStore(@RequestBody com.brewflow.api.dto.request.StoreCreateRequest request) {
        SecurityUtils.assertAnyRole(UserRole.SYSTEM, UserRole.HQ);
        
        long userId = SecurityUtils.currentUserId();
        storeService.createStore(request, userId);
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @GetMapping("/check-code")
    public ResponseEntity<ApiResponse<Boolean>> checkCode(@RequestParam(name = "storeCode") String storeCode) {
        SecurityUtils.assertAnyRole(UserRole.SYSTEM, UserRole.HQ);
        return ResponseEntity.ok(ApiResponse.ok(storeService.isStoreCodeDuplicate(storeCode)));
    }
}
