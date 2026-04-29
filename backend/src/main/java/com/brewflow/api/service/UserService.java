package com.brewflow.api.service;

import com.brewflow.api.domain.User;
import com.brewflow.api.dto.request.ProfileUpdateRequest;
import com.brewflow.api.dto.response.TokenResponse;

public interface UserService {
    User getProfile(long userId);
    TokenResponse updateProfile(long userId, ProfileUpdateRequest request);
    void withdrawUser(long userId);
}
