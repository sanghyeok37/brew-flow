package com.brewflow.api.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryLog {
    private Long logId;
    private Long storeId;
    private Long productId;
    private String changeType;
    private Integer beforeQty;
    private Integer changeQty;
    private Integer resultQty;
    private LocalDateTime createdAt;
    
    // UI용 필드
    private String productName;
}
