package com.brewflow.api.domain;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class RefreshToken {
    private Long tokenId;
    private Long userId;
    private String token;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
}

