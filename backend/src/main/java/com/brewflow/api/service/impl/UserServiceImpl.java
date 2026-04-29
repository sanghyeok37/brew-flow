package com.brewflow.api.service.impl;

import com.brewflow.api.config.security.AuthenticatedUser;
import com.brewflow.api.config.JwtProperties;
import com.brewflow.api.config.security.JwtTokenProvider;
import com.brewflow.api.domain.RefreshToken;
import com.brewflow.api.domain.Store;
import com.brewflow.api.domain.User;
import com.brewflow.api.dto.request.ProfileUpdateRequest;
import com.brewflow.api.dto.response.TokenResponse;
import com.brewflow.api.exception.BusinessException;
import com.brewflow.api.type.ErrorCode;
import com.brewflow.api.mapper.AuthMapper;
import com.brewflow.api.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final AuthMapper authMapper;
    private final JwtTokenProvider tokenProvider;
    private final JwtProperties jwtProperties;

    @Override
    @Transactional(readOnly = true)
    public User getProfile(long userId) {
        return authMapper.findUserById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TokenResponse updateProfile(long userId, ProfileUpdateRequest request) {
        User user = authMapper.findUserById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

        user.setName(request.getName());
        user.setNickname(request.getNickname());
        user.setContact(request.getContact());
        authMapper.updateUser(user);

        // 프로필 업데이트 시 토큰 재발급 (정보 동기화)
        Store store = authMapper.findMainStoreByUserId(userId).orElse(null);
        AuthenticatedUser auth = AuthenticatedUser.builder()
                .userId(userId)
                .nickname(user.getNickname())
                .role(user.getRole())
                .brandCode(store != null ? store.getBrandCode() : null)
                .storeId(store != null ? store.getStoreId() : null)
                .storeName(store != null ? store.getName() : null)
                .build();

        String access = tokenProvider.createAccessToken(auth);
        String refresh = tokenProvider.createRefreshToken(userId);

        LocalDateTime refreshExpiresAt = LocalDateTime.ofInstant(
                Instant.now().plusMillis(jwtProperties.getRefreshExpiration()), 
                ZoneId.systemDefault()
        );
        
        authMapper.insertRefreshToken(RefreshToken.builder()
                .userId(userId)
                .token(refresh)
                .expiresAt(refreshExpiresAt)
                .build());

        return TokenResponse.builder()
                .accessToken(access)
                .refreshToken(refresh)
                .build();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void withdrawUser(long userId) {
        User user = authMapper.findUserById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));
        
        user.setStatus(com.brewflow.api.type.UserStatus.INACTIVE);
        authMapper.updateUser(user);
        
        // 연관된 리프레시 토큰도 모두 삭제
        authMapper.deleteRefreshTokensByUserId(userId);
    }
}
