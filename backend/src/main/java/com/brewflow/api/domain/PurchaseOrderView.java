package com.brewflow.api.domain;

import com.brewflow.api.type.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderView {
    private Long poId;
    private Long storeId;
    private Integer totalAmount;
    private OrderStatus status;
    private LocalDateTime orderedAt;
    private LocalDateTime deliveredAt;
    private LocalDateTime createdAt;

    private List<PurchaseOrderItemView> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PurchaseOrderItemView {
        private Long productId;
        private String productName;
        private String unit;
        private Integer orderQty;
        private Integer unitCostSnapshot;
    }
}
