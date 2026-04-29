package com.brewflow.api.event;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class OrderStatusChangedEvent {
    private long storeId;
    private long poId;
    private String status;
}

