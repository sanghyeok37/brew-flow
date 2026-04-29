package com.brewflow.api.service.impl;

import com.brewflow.api.domain.StoreInventoryView;
import com.brewflow.api.exception.BusinessException;
import com.brewflow.api.exception.NotFoundException;
import com.brewflow.api.mapper.InventoryMapper;
import com.brewflow.api.service.InventoryService;
import com.brewflow.api.service.StoreAccessService;
import com.brewflow.api.type.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import com.brewflow.api.dto.response.PageResponse;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final StoreAccessService storeAccessService;
    private final InventoryMapper inventoryMapper;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<StoreInventoryView> getInventory(long userId, long storeId, int page, int size) {
        storeAccessService.assertUserHasStore(userId, storeId);
        
        int offset = page * size;
        List<StoreInventoryView> content = inventoryMapper.findInventoryByStoreId(storeId, size, offset);
        long totalElements = inventoryMapper.countInventoryByStoreId(storeId);
        
        return PageResponse.of(content, page, size, totalElements);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateSettings(long userId, long storeId, long productId, int safetyStockQty, int autoOrderQty) {
        storeAccessService.assertUserHasStore(userId, storeId);
        inventoryMapper.findInventoryRowForUpdate(storeId, productId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));
        inventoryMapper.updateInventorySettings(storeId, productId, safetyStockQty, autoOrderQty);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deduct(long userId, long storeId, long productId, int deductQty) {
        storeAccessService.assertUserHasStore(userId, storeId);
        StoreInventoryView row = inventoryMapper.findInventoryRowForUpdate(storeId, productId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

        int before = row.getCurrentStockQty();
        int after = before - deductQty;
        if (after < 0) {
            throw new BusinessException(ErrorCode.INSUFFICIENT_STOCK);
        }

        inventoryMapper.updateCurrentStockQty(storeId, productId, after);
        inventoryMapper.insertInventoryLog(storeId, productId, "MANUAL_DEDUCT", before, -deductQty, after);

        // Publish event for real-time UI sync
        eventPublisher.publishEvent(new com.brewflow.api.event.InventoryUpdatedEvent(
            storeId, productId, after, row.getProductName()
        ));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void register(long userId, long storeId, com.brewflow.api.dto.request.InventoryRegisterRequest request) {
        storeAccessService.assertUserHasStore(userId, storeId);
        
        // 1. 이미 등록된 품목인지 확인
        inventoryMapper.findInventoryRowForUpdate(storeId, request.getProductId())
                .ifPresent(r -> {
                    throw new BusinessException(ErrorCode.INVALID_INPUT, "이미 등록된 상품입니다.");
                });

        // 2. 신규 등록
        inventoryMapper.insertInventory(
                storeId, 
                request.getProductId(), 
                request.getCurrentStockQty(), 
                request.getSafetyStockQty(), 
                request.getAutoOrderQty()
        );

        inventoryMapper.insertInventoryLog(
                storeId, 
                request.getProductId(), 
                "INITIAL_REGISTER", 
                0, 
                request.getCurrentStockQty(), 
                request.getCurrentStockQty()
        );
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void removeInventory(long userId, long storeId, long productId) {
        storeAccessService.assertUserHasStore(userId, storeId);
        inventoryMapper.deleteInventory(storeId, productId);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<com.brewflow.api.domain.InventoryLog> getInventoryLogs(long userId, long storeId, Long productId, int page, int size) {
        storeAccessService.assertUserHasStore(userId, storeId);
        long total = inventoryMapper.countInventoryLogs(storeId, productId);
        int offset = page * size;
        List<com.brewflow.api.domain.InventoryLog> content = inventoryMapper.findInventoryLogs(storeId, productId, size, offset);
        return PageResponse.of(content, page, size, total);
    }
}
