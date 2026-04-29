package com.brewflow.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyProductSummary {
    private String productName;
    private Integer totalQty;
    private String unit;
}
