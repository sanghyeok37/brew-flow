package com.brewflow.api.config.security;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Component;

import com.brewflow.api.config.JwtProperties;
import com.brewflow.api.type.UserRole;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

    private final JwtProperties props;

    private SecretKey key() {
        String raw = props.getKeyStr();
        return Keys.hmacShaKeyFor(raw.getBytes(StandardCharsets.UTF_8));
    }

    public String createAccessToken(AuthenticatedUser auth) {
        Instant now = Instant.now();
        return Jwts.builder()
                .issuer(props.getIssuer())
                .subject(String.valueOf(auth.getUserId()))
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(props.getExpiration())))
                .claim("typ", "access")
                .claim("nickname", auth.getNickname())
                .claim("role", auth.getRole().name())
                .claim("brand", auth.getBrandCode())
                .claim("storeId", auth.getStoreId())
                .claim("storeName", auth.getStoreName())
                .signWith(key())
                .compact();
    }


    public String createRefreshToken(long userId) {
        Instant now = Instant.now();
        return Jwts.builder()
                .issuer(props.getIssuer())
                .subject(String.valueOf(userId))
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(props.getRefreshExpiration())))
                .claim("typ", "refresh")
                .signWith(key())
                .compact();
    }

    public Jws<Claims> parse(String token) throws JwtException {
        return Jwts.parser()
                .verifyWith(key())
                .requireIssuer(props.getIssuer())
                .build()
                .parseSignedClaims(token);
    }

    public AuthenticatedUser getAuthenticatedUser(String token) {
        Claims claims = parse(token).getPayload();
        String roleStr = claims.get("role", String.class);
        UserRole role = null;
        if (roleStr != null) {
            try {
                role = UserRole.valueOf(roleStr);
            } catch (IllegalArgumentException e) {
                // 구버전 역할명이거나 잘못된 역할명인 경우 null 처리
            }
        }
        return AuthenticatedUser.builder()
                .userId(Long.parseLong(claims.getSubject()))
                .nickname(claims.get("nickname", String.class))
                .role(role)
                .brandCode(claims.get("brand", String.class))
                .storeId(claims.get("storeId", Long.class))
                .storeName(claims.get("storeName", String.class))
                .build();
    }

    public long getUserId(String token) {
        return Long.parseLong(parse(token).getPayload().getSubject());
    }
}
