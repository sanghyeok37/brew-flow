package com.brewflow.api.domain;

import com.brewflow.api.type.ProductStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    private Long productId;
    private Long categoryId;
    private String brandCode;
    private String name;
    private String unit;
    private Integer unitCost;
    private ProductStatus status;
    private String imageUrl;
}
