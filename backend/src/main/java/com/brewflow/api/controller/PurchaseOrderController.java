package com.brewflow.api.controller;
 
import com.brewflow.api.config.security.SecurityUtils;
import com.brewflow.api.domain.PurchaseOrderView;
import com.brewflow.api.dto.request.UpdateQtyRequest;
import com.brewflow.api.dto.response.ApiResponse;
import com.brewflow.api.service.PurchaseOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
 
import java.time.LocalDateTime;
import java.util.List;
 
import com.brewflow.api.dto.response.PageResponse;
 
@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class PurchaseOrderController {
 
    private final PurchaseOrderService purchaseOrderService;
 
    @GetMapping("/{storeId}")
    public ResponseEntity<ApiResponse<PageResponse<PurchaseOrderView>>> list(
            @PathVariable(name = "storeId") long storeId,
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(name = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size
    ) {
        long userId = SecurityUtils.currentUserId();
        return ResponseEntity.ok(ApiResponse.ok(purchaseOrderService.getOrders(userId, storeId, status, startDate, endDate, page, size)));
    }
 
    @PutMapping("/{storeId}/{poId}/items/{productId}")
    public ResponseEntity<ApiResponse<Void>> updatePendingQty(
            @PathVariable(name = "storeId") long storeId,
            @PathVariable(name = "poId") long poId,
            @PathVariable(name = "productId") long productId,
            @RequestBody UpdateQtyRequest request
    ) {
        long userId = SecurityUtils.currentUserId();
        purchaseOrderService.updatePendingItemQty(userId, storeId, poId, productId, request.getOrderQty());
        return ResponseEntity.ok(ApiResponse.ok());
    }
 
    @PostMapping("/{storeId}/{poId}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancel(
            @PathVariable(name = "storeId") long storeId,
            @PathVariable(name = "poId") long poId
    ) {
        long userId = SecurityUtils.currentUserId();
        purchaseOrderService.cancelPending(userId, storeId, poId);
        return ResponseEntity.ok(ApiResponse.ok());
    }
 
    @PostMapping("/{storeId}/{poId}/deliver")
    public ResponseEntity<ApiResponse<Void>> deliver(
            @PathVariable(name = "storeId") long storeId,
            @PathVariable(name = "poId") long poId
    ) {
        long userId = SecurityUtils.currentUserId();
        purchaseOrderService.deliver(userId, storeId, poId);
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @PostMapping("/{storeId}/{poId}/confirm")
    public ResponseEntity<ApiResponse<Void>> confirm(
            @PathVariable(name = "storeId") long storeId,
            @PathVariable(name = "poId") long poId
    ) {
        long userId = SecurityUtils.currentUserId();
        purchaseOrderService.confirmOrder(userId, storeId, poId);
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @DeleteMapping("/{storeId}/{poId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable(name = "storeId") long storeId,
            @PathVariable(name = "poId") long poId
    ) {
        long userId = SecurityUtils.currentUserId();
        purchaseOrderService.deleteOrder(userId, storeId, poId);
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @PostMapping("/trigger-threshold-check")
    public ResponseEntity<ApiResponse<Void>> triggerThresholdCheck() {
        purchaseOrderService.runThresholdCheck();
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @PostMapping("/trigger-pending-to-ordered")
    public ResponseEntity<ApiResponse<Void>> triggerPendingToOrdered() {
        purchaseOrderService.runPendingToOrdered();
        return ResponseEntity.ok(ApiResponse.ok());
    }
}
