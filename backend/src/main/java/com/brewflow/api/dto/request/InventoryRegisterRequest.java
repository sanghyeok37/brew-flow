package com.brewflow.api.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InventoryRegisterRequest {
    @NotNull(message = "상품 ID는 필수입니다.")
    private Long productId;

    @Min(value = 0, message = "현재 재고는 0 이상이어야 합니다.")
    private int currentStockQty;

    @Min(value = 0, message = "최소 기준 수량은 0 이상이어야 합니다.")
    private int safetyStockQty;

    @Min(value = 0, message = "자동 주문 수량은 0 이상이어야 합니다.")
    private int autoOrderQty;
}
