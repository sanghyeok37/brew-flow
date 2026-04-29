package com.brewflow.api.controller;

import com.brewflow.api.config.security.SecurityUtils;
import com.brewflow.api.domain.User;
import com.brewflow.api.dto.request.ProfileUpdateRequest;
import com.brewflow.api.dto.response.ApiResponse;
import com.brewflow.api.dto.response.TokenResponse;
import com.brewflow.api.service.StoreAccessService;
import com.brewflow.api.service.UserService;
import jakarta.validation.Valid;
import lombok.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users/me")
@RequiredArgsConstructor
public class MyProfileController {

    private final UserService userService;
    private final StoreAccessService storeAccessService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<ProfileResponse>> getProfile() {
        long userId = SecurityUtils.currentUserId();
        User user = userService.getProfile(userId);
        
        ProfileResponse resp = ProfileResponse.builder()
                .username(user.getUsername())
                .name(user.getName())
                .nickname(user.getNickname())
                .email(user.getEmail())
                .contact(user.getContact())
                .role(user.getRole().name())
                .build();
                
        return ResponseEntity.ok(ApiResponse.ok(resp));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<TokenResponse>> updateProfile(@Valid @RequestBody ProfileUpdateRequest request) {
        long userId = SecurityUtils.currentUserId();
        TokenResponse tokens = userService.updateProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.ok(tokens));
    }

    @GetMapping("/stores")
    public ResponseEntity<ApiResponse<StoresResponse>> myStores() {
        long userId = SecurityUtils.currentUserId();
        List<Long> storeIds = storeAccessService.getUserStoreIds(userId);
        return ResponseEntity.ok(ApiResponse.ok(StoresResponse.builder().storeIds(storeIds).build()));
    }

    @PostMapping("/withdraw")
    public ResponseEntity<ApiResponse<Void>> withdraw() {
        long userId = SecurityUtils.currentUserId();
        userService.withdrawUser(userId);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ProfileResponse {
        private String username;
        private String name;
        private String nickname;
        private String email;
        private String contact;
        private String role;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class StoresResponse {
        private List<Long> storeIds;
    }
}
