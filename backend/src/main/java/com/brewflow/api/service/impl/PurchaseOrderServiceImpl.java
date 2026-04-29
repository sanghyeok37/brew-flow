package com.brewflow.api.service.impl;

import com.brewflow.api.domain.PurchaseOrder;
import com.brewflow.api.domain.PurchaseOrderItem;
import com.brewflow.api.domain.PurchaseOrderView;
import com.brewflow.api.domain.StoreInventoryView;
import com.brewflow.api.domain.ThresholdTarget;
import com.brewflow.api.event.OrderCreatedEvent;
import com.brewflow.api.event.OrderStatusChangedEvent;
import com.brewflow.api.exception.BusinessException;
import com.brewflow.api.exception.NotFoundException;
import com.brewflow.api.mapper.InventoryMapper;
import com.brewflow.api.mapper.ProductMapper;
import com.brewflow.api.mapper.PurchaseOrderMapper;
import com.brewflow.api.service.PurchaseOrderService;
import com.brewflow.api.service.StoreAccessService;
import com.brewflow.api.type.ErrorCode;
import com.brewflow.api.type.OrderStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import com.brewflow.api.dto.response.PageResponse;

@Service
@RequiredArgsConstructor
public class PurchaseOrderServiceImpl implements PurchaseOrderService {

    private final StoreAccessService storeAccessService;
    private final InventoryMapper inventoryMapper;
    private final PurchaseOrderMapper purchaseOrderMapper;
    private final ProductMapper productMapper;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PurchaseOrderView> getOrders(long userId, long storeId, String status, LocalDateTime startDate, LocalDateTime endDate, int page, int size) {
        storeAccessService.assertUserHasStore(userId, storeId);
        
        int offset = page * size;
        List<Long> poIds = purchaseOrderMapper.findOrderIdsByStore(storeId, status, startDate, endDate, size, offset);
        long totalElements = purchaseOrderMapper.countOrdersByStore(storeId, status, startDate, endDate);
        
        List<PurchaseOrderView> content = poIds.isEmpty() 
            ? List.of() 
            : purchaseOrderMapper.findOrdersByIds(poIds);
            
        return PageResponse.of(content, page, size, totalElements);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updatePendingItemQty(long userId, long storeId, long poId, long productId, int orderQty) {
        storeAccessService.assertUserHasStore(userId, storeId);
        PurchaseOrderView header = purchaseOrderMapper.findOrderHeaderForUpdate(poId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));
        if (header.getStoreId() != storeId) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        if (OrderStatus.PENDING != header.getStatus()) {
            throw new BusinessException(ErrorCode.ORDER_NOT_MODIFIABLE);
        }

        purchaseOrderMapper.updateOrderItemQty(poId, productId, orderQty);

        int total = recomputeTotalAmount(poId);
        purchaseOrderMapper.updateOrderTotalAmount(poId, total);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void cancelPending(long userId, long storeId, long poId) {
        storeAccessService.assertUserHasStore(userId, storeId);
        PurchaseOrderView header = purchaseOrderMapper.findOrderHeaderForUpdate(poId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));
        if (header.getStoreId() != storeId) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        if (OrderStatus.PENDING != header.getStatus()) {
            throw new BusinessException(ErrorCode.ORDER_NOT_CANCELABLE);
        }
        purchaseOrderMapper.cancelPending(poId);
        eventPublisher.publishEvent(new OrderStatusChangedEvent(storeId, poId, OrderStatus.CANCELED.name()));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deliver(long userId, long storeId, long poId) {
        storeAccessService.assertUserHasStore(userId, storeId);
        PurchaseOrderView header = purchaseOrderMapper.findOrderHeaderForUpdate(poId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));
        if (header.getStoreId() != storeId) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        if (OrderStatus.ORDERED != header.getStatus()) {
            throw new BusinessException(ErrorCode.INVALID_STATE_TRANSITION);
        }

        purchaseOrderMapper.markDelivered(poId, LocalDateTime.now());
        List<PurchaseOrderItem> items = purchaseOrderMapper.findItemsForInbound(poId);
        for (PurchaseOrderItem item : items) {
            StoreInventoryView inv = inventoryMapper.findInventoryRowForUpdate(storeId, item.getProductId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));
            int before = inv.getCurrentStockQty();
            int after = before + item.getOrderQty();
            inventoryMapper.updateCurrentStockQty(storeId, item.getProductId(), after);
            inventoryMapper.insertInventoryLog(storeId, item.getProductId(), "DELIVERED_INBOUND", before,
                    item.getOrderQty(), after);
            
            // Publish inventory update event for real-time UI sync
            eventPublisher.publishEvent(new com.brewflow.api.event.InventoryUpdatedEvent(
                storeId, item.getProductId(), after, inv.getProductName()
            ));
        }

        eventPublisher.publishEvent(new OrderStatusChangedEvent(storeId, poId, OrderStatus.DELIVERED.name()));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void runThresholdCheck() {
        List<ThresholdTarget> targets = inventoryMapper.findThresholdTargets();
        for (ThresholdTarget t : targets) {
            if (t.getAutoOrderQty() == null || t.getAutoOrderQty() <= 0)
                continue;
            if (purchaseOrderMapper.findPendingPoIdByStoreAndProduct(t.getStoreId(), t.getProductId()).isPresent()) {
                continue;
            }
            createPendingForOneItem(t.getStoreId(), t.getProductId(), t.getAutoOrderQty());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void runPendingToOrdered() {
        List<Long> pendingIds = purchaseOrderMapper.findPendingPoIds();
        LocalDateTime now = LocalDateTime.now();
        for (Long poId : pendingIds) {
            PurchaseOrderView header = purchaseOrderMapper.findOrderHeaderForUpdate(poId).orElse(null);
            if (header == null)
                continue;
            if (OrderStatus.PENDING != header.getStatus())
                continue;
            purchaseOrderMapper.markOrdered(poId, now);
            eventPublisher.publishEvent(new OrderStatusChangedEvent(header.getStoreId(), poId, OrderStatus.ORDERED.name()));
        }
    }

    @Transactional(readOnly = true)
    protected int recomputeTotalAmount(long poId) {
        List<PurchaseOrderView.PurchaseOrderItemView> items = purchaseOrderMapper.findOrderItems(poId);
        long total = 0;
        for (PurchaseOrderView.PurchaseOrderItemView i : items) {
            total += (long) i.getOrderQty() * (long) i.getUnitCostSnapshot();
        }
        if (total < 0)
            total = 0;
        return (int) Math.min(total, Integer.MAX_VALUE);
    }

    @Transactional(rollbackFor = Exception.class)
    public long createPendingForOneItem(long storeId, long productId, int orderQty) {
        com.brewflow.api.domain.Product product = productMapper.findById(productId);
        if (product == null) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND);
        }
        Integer unitCost = product.getUnitCost();
        int total = orderQty * unitCost;

        PurchaseOrder order = PurchaseOrder.builder()
                .storeId(storeId)
                .totalAmount(total)
                .status(OrderStatus.PENDING)
                .build();

        purchaseOrderMapper.insertPurchaseOrder(order);
        long poId = order.getPoId();

        purchaseOrderMapper.insertPurchaseOrderItem(PurchaseOrderItem.builder()
                .poId(poId)
                .productId(productId)
                .orderQty(orderQty)
                .unitCostSnapshot(unitCost)
                .build());
        eventPublisher.publishEvent(new OrderCreatedEvent(storeId, poId));
        return poId;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void confirmOrder(long userId, long storeId, long poId) {
        storeAccessService.assertUserHasStore(userId, storeId);
        PurchaseOrderView header = purchaseOrderMapper.findOrderHeaderForUpdate(poId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));
        
        if (header.getStoreId() != storeId) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        if (OrderStatus.PENDING != header.getStatus()) {
            throw new BusinessException(ErrorCode.INVALID_STATE_TRANSITION);
        }
        
        purchaseOrderMapper.markOrdered(poId, LocalDateTime.now());
        eventPublisher.publishEvent(new OrderStatusChangedEvent(storeId, poId, OrderStatus.ORDERED.name()));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteOrder(long userId, long storeId, long poId) {
        storeAccessService.assertUserHasStore(userId, storeId);
        PurchaseOrderView header = purchaseOrderMapper.findOrderHeaderForUpdate(poId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));
        if (header.getStoreId() != storeId) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        purchaseOrderMapper.deleteOrder(poId);
    }
}
