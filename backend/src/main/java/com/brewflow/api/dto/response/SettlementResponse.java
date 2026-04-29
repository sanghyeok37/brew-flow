package com.brewflow.api.dto.response;
 
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
 
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SettlementResponse {
    private long storeId;
    private int year;
    private int month;
    private int amount; // Legacy support (points to confirmedAmount)
    private int confirmedAmount; // DELIVERED
    private int orderedAmount;   // ORDERED
    private int pendingAmount;   // PENDING
}
