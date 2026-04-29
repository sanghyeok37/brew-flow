package com.brewflow.api.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ThresholdTarget {
    private Long storeId;
    private Long productId;
    private Integer autoOrderQty;
}
