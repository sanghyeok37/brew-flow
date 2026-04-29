package com.brewflow.api.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderItem {
    private Long poItemId;
    private Long poId;
    private Long productId;
    private Integer orderQty;
    private Integer unitCostSnapshot;
}

