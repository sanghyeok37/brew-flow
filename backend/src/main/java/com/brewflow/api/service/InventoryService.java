package com.brewflow.api.service;

import com.brewflow.api.domain.StoreInventoryView;
import com.brewflow.api.dto.response.PageResponse;

import java.util.List;

public interface InventoryService {
    PageResponse<StoreInventoryView> getInventory(long userId, long storeId, int page, int size);

    void updateSettings(long userId, long storeId, long productId, int safetyStockQty, int autoOrderQty);

    void deduct(long userId, long storeId, long productId, int deductQty);

    void register(long userId, long storeId, com.brewflow.api.dto.request.InventoryRegisterRequest request);
    void removeInventory(long userId, long storeId, long productId);

    PageResponse<com.brewflow.api.domain.InventoryLog> getInventoryLogs(long userId, long storeId, Long productId, int page, int size);
}

