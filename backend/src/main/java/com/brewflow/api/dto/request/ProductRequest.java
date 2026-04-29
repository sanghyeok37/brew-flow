package com.brewflow.api.dto.request;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class ProductRequest {
    private String name;
    private Long categoryId;
    private String unit;
    private Integer unitCost;
    private MultipartFile image;
}
