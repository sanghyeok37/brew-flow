package com.brewflow.api.controller;
 
import com.brewflow.api.config.security.SecurityUtils;
import com.brewflow.api.domain.StoreInventoryView;
import com.brewflow.api.dto.request.InventoryDeductRequest;
import com.brewflow.api.dto.request.InventoryUpdateRequest;
import com.brewflow.api.dto.response.ApiResponse;
import com.brewflow.api.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
 
import com.brewflow.api.dto.response.PageResponse;
 
@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
public class InventoryController {
 
    private final InventoryService inventoryService;
 
    @GetMapping("/{storeId}")
    public ResponseEntity<ApiResponse<PageResponse<StoreInventoryView>>> getInventory(
            @PathVariable(name = "storeId") long storeId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size
    ) {
        long userId = SecurityUtils.currentUserId();
        return ResponseEntity.ok(ApiResponse.ok(inventoryService.getInventory(userId, storeId, page, size)));
    }
 
    @PutMapping("/{storeId}/settings")
    public ResponseEntity<ApiResponse<Void>> updateSettings(
            @PathVariable(name = "storeId") long storeId,
            @Valid @RequestBody InventoryUpdateRequest request
    ) {
        long userId = SecurityUtils.currentUserId();
        inventoryService.updateSettings(userId, storeId, request.getProductId(), request.getSafetyStockQty(), request.getAutoOrderQty());
        return ResponseEntity.ok(ApiResponse.ok());
    }
 
    @PostMapping("/{storeId}/deduct")
    public ResponseEntity<ApiResponse<Void>> deduct(
            @PathVariable(name = "storeId") long storeId,
            @Valid @RequestBody InventoryDeductRequest request
    ) {
        long userId = SecurityUtils.currentUserId();
        inventoryService.deduct(userId, storeId, request.getProductId(), request.getDeductQty());
        return ResponseEntity.ok(ApiResponse.ok());
    }
 
    @PostMapping("/{storeId}")
    public ResponseEntity<ApiResponse<Void>> register(
            @PathVariable(name = "storeId") long storeId,
            @Valid @RequestBody com.brewflow.api.dto.request.InventoryRegisterRequest request
    ) {
        long userId = SecurityUtils.currentUserId();
        inventoryService.register(userId, storeId, request);
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @DeleteMapping("/{storeId}/{productId}")
    public ResponseEntity<ApiResponse<Void>> remove(
            @PathVariable(name = "storeId") long storeId,
            @PathVariable(name = "productId") long productId
    ) {
        long userId = SecurityUtils.currentUserId();
        inventoryService.removeInventory(userId, storeId, productId);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/{storeId}/logs")
    public ResponseEntity<ApiResponse<PageResponse<com.brewflow.api.domain.InventoryLog>>> getLogs(
            @PathVariable(name = "storeId") long storeId,
            @RequestParam(name = "productId", required = false) Long productId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size
    ) {
        long userId = SecurityUtils.currentUserId();
        return ResponseEntity.ok(ApiResponse.ok(inventoryService.getInventoryLogs(userId, storeId, productId, page, size)));
    }
}
