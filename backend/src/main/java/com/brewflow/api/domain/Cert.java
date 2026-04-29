package com.brewflow.api.domain;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class Cert {
    private String email;
    private String certNumber;
    private LocalDateTime certTime;
    private LocalDateTime expiresAt;
}

