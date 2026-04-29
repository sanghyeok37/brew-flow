package com.brewflow.api.config.security;

import com.brewflow.api.type.UserRole;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthenticatedUser {
    private Long userId;
    private String nickname;
    private UserRole role;
    private String brandCode;
    private Long storeId;
    private String storeName;
}
