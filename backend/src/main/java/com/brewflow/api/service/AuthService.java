package com.brewflow.api.service;

import com.brewflow.api.dto.request.*;
import com.brewflow.api.dto.response.TokenResponse;

public interface AuthService {
    void sendCert(CertSendRequest request);
    void verifyCert(CertVerifyRequest request);
    void signup(SignupRequest request);
    TokenResponse login(LoginRequest request);
    TokenResponse refresh(RefreshRequest request);
    void logout(String refreshToken);
    void resetPassword(PasswordResetRequest request);
    void changePassword(long userId, PasswordChangeRequest request);
}
