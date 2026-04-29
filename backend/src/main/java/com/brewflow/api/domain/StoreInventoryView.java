package com.brewflow.api.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoreInventoryView {
    private Long inventoryId;
    private Long storeId;
    private Long productId;
    private Integer currentStockQty;
    private Integer safetyStockQty;
    private Integer autoOrderQty;

    private Long categoryId;
    private String categoryName;

    private String productName;
    private String unit;
    private Integer unitCost;
    private String imageUrl;
}
