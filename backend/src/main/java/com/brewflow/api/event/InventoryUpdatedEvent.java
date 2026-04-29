package com.brewflow.api.event;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class InventoryUpdatedEvent {
    private final long storeId;
    private final long productId;
    private final int currentStock;
    private final String productName;
}
