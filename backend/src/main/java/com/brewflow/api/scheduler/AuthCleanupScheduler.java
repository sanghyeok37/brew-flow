package com.brewflow.api.scheduler;

import com.brewflow.api.mapper.AuthMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuthCleanupScheduler {

    private final AuthMapper authMapper;

    /**
     * 매 시간 정각에 만료된 인증 데이터(인증 코드 및 리프레시 토큰)를 삭제합니다.
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void cleanupExpiredAuthData() {
        log.info("Starting scheduled cleanup for expired authentication data...");
        
        LocalDateTime now = LocalDateTime.now();
        
        // 1. 만료된 이메일 인증 코드 삭제
        authMapper.deleteExpiredCerts(now);
        log.info("Finished cleaning up expired certification codes.");
        
        // 2. 만료된 리프레시 토큰 삭제
        authMapper.deleteExpiredRefreshTokens(now);
        log.info("Finished cleaning up expired refresh tokens.");
        
        log.info("All expired authentication data cleanup finished.");
    }
}
