package com.brewflow.api.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InventoryDeductRequest {
    @NotNull
    private Long productId;

    @NotNull
    @Min(1)
    private Integer deductQty;
}

