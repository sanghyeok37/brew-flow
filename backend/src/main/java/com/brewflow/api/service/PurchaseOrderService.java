package com.brewflow.api.service;

import com.brewflow.api.domain.PurchaseOrderView;
import com.brewflow.api.dto.response.PageResponse;

import java.util.List;

public interface PurchaseOrderService {
    PageResponse<PurchaseOrderView> getOrders(long userId, long storeId, String status, java.time.LocalDateTime startDate, java.time.LocalDateTime endDate, int page, int size);

    void updatePendingItemQty(long userId, long storeId, long poId, long productId, int orderQty);

    void cancelPending(long userId, long storeId, long poId);

    void deliver(long userId, long storeId, long poId);

    void runThresholdCheck();

    void runPendingToOrdered();
    void confirmOrder(long userId, long storeId, long poId);
    void deleteOrder(long userId, long storeId, long poId);
}

