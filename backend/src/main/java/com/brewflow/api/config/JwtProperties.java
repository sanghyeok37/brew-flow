package com.brewflow.api.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "custom.jwt")
public class JwtProperties {
    private String keyStr;
    private String issuer;
    private long expiration;
    private long refreshExpiration;
}

