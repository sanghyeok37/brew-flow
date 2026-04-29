package com.brewflow.api.controller;

import com.brewflow.api.config.JwtProperties;
import com.brewflow.api.dto.request.CertSendRequest;
import com.brewflow.api.dto.request.CertVerifyRequest;
import com.brewflow.api.dto.request.LoginRequest;
import com.brewflow.api.dto.request.PasswordResetRequest;
import com.brewflow.api.dto.request.PasswordChangeRequest;
import com.brewflow.api.dto.request.RefreshRequest;
import com.brewflow.api.dto.request.SignupRequest;
import com.brewflow.api.dto.response.ApiResponse;
import com.brewflow.api.dto.response.TokenResponse;
import com.brewflow.api.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtProperties jwtProperties;

    @PostMapping("/cert/send")
    public ResponseEntity<ApiResponse<Void>> sendCert(@Valid @RequestBody CertSendRequest request) {
        authService.sendCert(request);
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @PostMapping("/cert/verify")
    public ResponseEntity<ApiResponse<Void>> verifyCert(@Valid @RequestBody CertVerifyRequest request) {
        authService.verifyCert(request);
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<Void>> signup(@Valid @RequestBody SignupRequest request) {
        authService.signup(request);
        return ResponseEntity.status(201).body(ApiResponse.<Void>builder().status(201).message("created").data(null).build());
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<TokenResponse>> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        TokenResponse tokens = authService.login(request);
        setRefreshTokenCookie(response, tokens.getRefreshToken(), (int) (jwtProperties.getRefreshExpiration() / 1000));
        return ResponseEntity.ok(ApiResponse.ok(tokens));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenResponse>> refresh(
            @RequestBody(required = false) RefreshRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse response) {
        
        String refreshToken = null;
        if (request != null && request.getRefreshToken() != null && !request.getRefreshToken().isBlank()) {
            refreshToken = request.getRefreshToken();
        } else if (httpRequest.getCookies() != null) {
            refreshToken = Arrays.stream(httpRequest.getCookies())
                    .filter(c -> "refresh_token".equals(c.getName()))
                    .map(Cookie::getValue)
                    .findFirst()
                    .orElse(null);
        }

        if (refreshToken == null) {
            return ResponseEntity.status(401).body(ApiResponse.<TokenResponse>builder().status(401).message("Refresh token missing").build());
        }

        TokenResponse tokens = authService.refresh(new RefreshRequest(refreshToken));
        setRefreshTokenCookie(response, tokens.getRefreshToken(), (int) (jwtProperties.getRefreshExpiration() / 1000));
        return ResponseEntity.ok(ApiResponse.ok(tokens));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestBody(required = false) RefreshRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse response) {
        
        String refreshToken = null;
        if (request != null && request.getRefreshToken() != null && !request.getRefreshToken().isBlank()) {
            refreshToken = request.getRefreshToken();
        } else if (httpRequest.getCookies() != null) {
            refreshToken = Arrays.stream(httpRequest.getCookies())
                    .filter(c -> "refresh_token".equals(c.getName()))
                    .map(Cookie::getValue)
                    .findFirst()
                    .orElse(null);
        }

        if (refreshToken != null) {
            authService.logout(refreshToken);
        }
        
        // 쿠키 삭제
        setRefreshTokenCookie(response, null, 0);
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @PostMapping("/password-reset")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody PasswordResetRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @PostMapping("/password-change")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody PasswordChangeRequest request) {
        long userId = com.brewflow.api.config.security.SecurityUtils.currentUserId();
        authService.changePassword(userId, request);
        return ResponseEntity.ok(ApiResponse.ok());
    }

    private void setRefreshTokenCookie(HttpServletResponse response, String token, int maxAge) {
        Cookie cookie = new Cookie("refresh_token", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // 로컬 환경이므로 false, 운영은 true 권장
        cookie.setPath("/");
        cookie.setMaxAge(maxAge);
        response.addCookie(cookie);
    }
}
