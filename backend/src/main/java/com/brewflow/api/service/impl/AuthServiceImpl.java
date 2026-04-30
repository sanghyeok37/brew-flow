package com.brewflow.api.service.impl;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Random;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.brewflow.api.config.JwtProperties;
import com.brewflow.api.config.security.AuthenticatedUser;
import com.brewflow.api.config.security.JwtTokenProvider;
import com.brewflow.api.domain.Cert;
import com.brewflow.api.domain.RefreshToken;
import com.brewflow.api.domain.Store;
import com.brewflow.api.domain.User;
import com.brewflow.api.dto.request.CertSendRequest;
import com.brewflow.api.dto.request.CertVerifyRequest;
import com.brewflow.api.dto.request.LoginRequest;
import com.brewflow.api.dto.request.PasswordChangeRequest;
import com.brewflow.api.dto.request.PasswordResetRequest;
import com.brewflow.api.dto.request.RefreshRequest;
import com.brewflow.api.dto.request.SignupRequest;
import com.brewflow.api.dto.response.TokenResponse;
import com.brewflow.api.exception.BusinessException;
import com.brewflow.api.exception.UnauthorizedException;
import com.brewflow.api.mapper.AuthMapper;
import com.brewflow.api.service.AuthService;
import com.brewflow.api.service.EmailService;
import com.brewflow.api.type.ErrorCode;
import com.brewflow.api.type.UserRole;
import com.brewflow.api.type.UserStatus;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

	private final AuthMapper authMapper;
	private final PasswordEncoder passwordEncoder;
	private final JwtTokenProvider tokenProvider;
	private final JwtProperties jwtProperties;
	private final EmailService emailService;

	@Override
	@Transactional(rollbackFor = Exception.class)
	public void sendCert(CertSendRequest request) {
		String purpose = request.getPurpose().trim().toUpperCase();
		if (!purpose.equals("SIGNUP") && !purpose.equals("PASSWORD_RESET")) {
			throw new BusinessException(ErrorCode.INVALID_INPUT);
		}

		boolean userExists = authMapper.findUserByEmail(request.getEmail()).isPresent();
		if (purpose.equals("SIGNUP") && userExists) {
			throw new BusinessException(ErrorCode.EMAIL_ALREADY_EXISTS);
		}
		if (purpose.equals("PASSWORD_RESET") && !userExists) {
			throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND);
		}

		String code = randomDigits(8);
		log.info(">>>> [CERTIFICATION CODE for {}]: {} <<<<", request.getEmail(), code);

		authMapper.deleteCertByEmail(request.getEmail());
		authMapper.insertCert(Cert.builder().email(request.getEmail()).certNumber(code).build());

		emailService.sendCertEmail(request.getEmail(), code);
	}

	@Override
	@Transactional(readOnly = true)
	public void verifyCert(CertVerifyRequest request) {
		Cert cert = authMapper.findCertByEmail(request.getEmail())
				.orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));
		if (cert.getExpiresAt() != null && cert.getExpiresAt().isBefore(LocalDateTime.now())) {
			throw new BusinessException(ErrorCode.CERT_EXPIRED);
		}
		if (!cert.getCertNumber().equals(request.getCertNumber())) {
			throw new BusinessException(ErrorCode.CERT_MISMATCH);
		}
	}

	@Override
	@Transactional(rollbackFor = Exception.class)
	public void signup(SignupRequest request) {
		Cert cert = authMapper.findCertByEmail(request.getEmail())
				.orElseThrow(() -> new BusinessException(ErrorCode.CERT_REQUIRED));

		if (!cert.getCertNumber().equals(request.getCertNumber())) {
			throw new BusinessException(ErrorCode.CERT_MISMATCH);
		}

		if (cert.getExpiresAt() != null && cert.getExpiresAt().isBefore(LocalDateTime.now())) {
			throw new BusinessException(ErrorCode.CERT_EXPIRED);
		}

		String storeCode = request.getStoreCode().trim().toUpperCase();
		UserRole role;
		if ("ADM12345".equals(storeCode)) {
			role = UserRole.SYSTEM;
		} else if (storeCode.endsWith("00000")) {
			role = UserRole.HQ;
		} else {
			role = UserRole.STORE;
		}

		Long storeId = authMapper.findStoreIdByStoreCode(storeCode)
				.orElseThrow(() -> new BusinessException(ErrorCode.INVALID_STORE_CODE));

		if (authMapper.findUserByUsername(request.getUsername()).isPresent()) {
			throw new BusinessException(ErrorCode.USERNAME_ALREADY_EXISTS);
		}
		if (authMapper.findUserByEmail(request.getEmail()).isPresent()) {
			throw new BusinessException(ErrorCode.EMAIL_ALREADY_EXISTS);
		}

		User user = User.builder().username(request.getUsername()).name(request.getName())
				.nickname(request.getNickname()).contact(request.getContact()).email(request.getEmail())
				.password(passwordEncoder.encode(request.getPassword())).role(role).status(UserStatus.ACTIVE).build();

		authMapper.insertUser(user);

		if (storeId != null) {
			authMapper.insertUsersStores(user.getUserId(), storeId);
		}

		authMapper.deleteCertByEmail(request.getEmail());
	}

	@Override
	@Transactional(rollbackFor = Exception.class)
	public TokenResponse login(LoginRequest request) {
		User user = authMapper.findUserByUsername(request.getUsername())
				.orElseThrow(() -> new BusinessException(ErrorCode.INVALID_CREDENTIALS));
		if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
			throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
		}
		
		if (user.getStatus() != UserStatus.ACTIVE) {
			throw new BusinessException(ErrorCode.ACCOUNT_INACTIVE, "탈퇴한 계정이거나 이용이 제한된 계정입니다.");
		}

		Store store = authMapper.findMainStoreByUserId(user.getUserId()).orElse(null);

		AuthenticatedUser auth = AuthenticatedUser.builder().userId(user.getUserId()).nickname(user.getNickname())
				.role(user.getRole()).brandCode(store != null ? store.getBrandCode() : null)
				.storeId(store != null ? store.getStoreId() : null).storeName(store != null ? store.getName() : null)
				.build();

		String access = tokenProvider.createAccessToken(auth);
		String refresh = tokenProvider.createRefreshToken(user.getUserId());
		LocalDateTime refreshExpiresAt = LocalDateTime
				.ofInstant(Instant.now().plusMillis(jwtProperties.getRefreshExpiration()), ZoneId.systemDefault());

		authMapper.insertRefreshToken(
				RefreshToken.builder().userId(user.getUserId()).token(refresh).expiresAt(refreshExpiresAt).build());

		return TokenResponse.builder().accessToken(access).refreshToken(refresh).build();
	}

	@Override
	@Transactional(rollbackFor = Exception.class)
	public TokenResponse refresh(RefreshRequest request) {
		RefreshToken stored = authMapper.findRefreshToken(request.getRefreshToken())
				.orElseThrow(() -> new UnauthorizedException("invalid refresh token"));
		if (stored.getExpiresAt().isBefore(LocalDateTime.now())) {
			authMapper.deleteRefreshToken(request.getRefreshToken());
			throw new UnauthorizedException("refresh token expired");
		}

		long userId = tokenProvider.getUserId(request.getRefreshToken());
		User user = authMapper.findUserById(userId).orElseThrow(() -> new UnauthorizedException("user not found"));

		authMapper.deleteRefreshToken(request.getRefreshToken());

		Store store = authMapper.findMainStoreByUserId(userId).orElse(null);

		AuthenticatedUser auth = AuthenticatedUser.builder().userId(userId).nickname(user.getNickname())
				.role(user.getRole()).brandCode(store != null ? store.getBrandCode() : null)
				.storeId(store != null ? store.getStoreId() : null).storeName(store != null ? store.getName() : null)
				.build();

		String newAccess = tokenProvider.createAccessToken(auth);
		String newRefresh = tokenProvider.createRefreshToken(userId);

		LocalDateTime refreshExpiresAt = LocalDateTime
				.ofInstant(Instant.now().plusMillis(jwtProperties.getRefreshExpiration()), ZoneId.systemDefault());
		authMapper.insertRefreshToken(
				RefreshToken.builder().userId(userId).token(newRefresh).expiresAt(refreshExpiresAt).build());

		return TokenResponse.builder().accessToken(newAccess).refreshToken(newRefresh).build();
	}

	@Override
	@Transactional(rollbackFor = Exception.class)
	public void logout(String refreshToken) {
		if (refreshToken != null && !refreshToken.isBlank()) {
			authMapper.deleteRefreshToken(refreshToken);
		}
	}

	@Override
	@Transactional(rollbackFor = Exception.class)
	public void resetPassword(PasswordResetRequest request) {
		Cert cert = authMapper.findCertByEmail(request.getEmail())
				.orElseThrow(() -> new BusinessException(ErrorCode.CERT_REQUIRED));
		if (cert.getExpiresAt() != null && cert.getExpiresAt().isBefore(LocalDateTime.now())) {
			throw new BusinessException(ErrorCode.CERT_EXPIRED);
		}
		if (!cert.getCertNumber().equals(request.getCertNumber())) {
			throw new BusinessException(ErrorCode.CERT_MISMATCH);
		}

		User user = authMapper.findUserByEmail(request.getEmail())
				.orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

		authMapper.updateUserPassword(user.getUserId(), passwordEncoder.encode(request.getNewPassword()));
		authMapper.deleteRefreshTokensByUserId(user.getUserId());
		authMapper.deleteCertByEmail(request.getEmail());
	}

	@Override
	@Transactional(rollbackFor = Exception.class)
	public void changePassword(long userId, PasswordChangeRequest request) {
		User user = authMapper.findUserById(userId)
				.orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

		if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
			throw new BusinessException(ErrorCode.INVALID_INPUT, "현재 비밀번호가 일치하지 않습니다.");
		}

		authMapper.updateUserPassword(user.getUserId(), passwordEncoder.encode(request.getNewPassword()));
		authMapper.deleteRefreshTokensByUserId(user.getUserId());
	}

	private String randomDigits(int len) {
		Random r = new Random();
		StringBuilder sb = new StringBuilder(len);
		for (int i = 0; i < len; i++) {
			sb.append(r.nextInt(10));
		}
		return sb.toString();
	}

}
