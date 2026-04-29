package com.brewflow.api.domain;

import com.brewflow.api.type.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrder {
    private Long poId;
    private Long storeId;
    private Integer totalAmount;
    private OrderStatus status;
    private LocalDateTime orderedAt;
    private LocalDateTime deliveredAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
