package com.brewflow.api.dto.response;
 
import lombok.Builder;
import lombok.Data;
 
@Data
@Builder
public class DashboardStatsResponse {
    private long storeCount;         // HQ: 브랜드 점포 수, SYSTEM: 전체 점포 수
    private long productCount;       // HQ: 브랜드 상품 수, SYSTEM: 공용 상품 수
    private long lowStockCount;      // STORE: 기준 미달 재고 수
    private long pendingOrderCount;  // STORE: 대기 중인 발주 수
}
