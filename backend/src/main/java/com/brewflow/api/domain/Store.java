package com.brewflow.api.domain;

import com.brewflow.api.type.StoreStatus;
import com.brewflow.api.type.StoreType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Store {
    private Long storeId;
    private String storeCode;
    private String brandCode;
    private String name;
    private StoreType type;
    private StoreStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
