package com.brewflow.api.notification;

import com.brewflow.api.event.OrderCreatedEvent;
import com.brewflow.api.event.OrderStatusChangedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OrderNotificationListener {

    private final SseEmitterManager emitterManager;

    @Async
    @EventListener
    public void onOrderCreated(OrderCreatedEvent event) {
        emitterManager.send(event.getStoreId(), "발주 대기 목록이 생성되었습니다.");
    }

    @Async
    @EventListener
    public void onOrderStatusChanged(OrderStatusChangedEvent event) {
        emitterManager.send(event.getStoreId(), "발주 상태가 변경되었습니다. (" + event.getStatus() + ")");
    }

    @Async
    @EventListener
    public void onInventoryUpdated(com.brewflow.api.event.InventoryUpdatedEvent event) {
        // Send as a structured event named "inventory"
        emitterManager.sendEvent(event.getStoreId(), "inventory", event);
    }
}

