package com.brewflow.api.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InventoryUpdateRequest {
    @NotNull
    private Long productId;

    @NotNull
    @Min(0)
    private Integer safetyStockQty;

    @NotNull
    @Min(1)
    private Integer autoOrderQty;
}

