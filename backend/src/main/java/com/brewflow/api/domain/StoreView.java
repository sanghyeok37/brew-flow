package com.brewflow.api.domain;

import lombok.Data;

@Data
public class StoreView {
    private Long storeId;
    private String brandCode;
    private String name;
    private String storeCode;
    private String type;
    private String status;
    
    // Owner info (Joined from users)
    private Long ownerId;
    private String ownerName;
    private String ownerEmail;
    private String ownerContact;
    private String ownerUsername;

    private Integer monthlyOrderAmount;
}
