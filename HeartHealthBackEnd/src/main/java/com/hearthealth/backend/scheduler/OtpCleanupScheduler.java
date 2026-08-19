package com.hearthealth.backend.scheduler;

import com.hearthealth.backend.repository.OtpTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class OtpCleanupScheduler {

    private final OtpTokenRepository otpTokenRepository;

    // Run every hour to purge expired OTP tokens from database
    @Scheduled(cron = "0 0 * * * *")
    public void cleanupExpiredOtpTokens() {
        try {
            log.info(">>> Running scheduled background task: Cleaning up expired OTP tokens...");
            otpTokenRepository.deleteByExpirationTimeBefore(LocalDateTime.now());
            log.info(">>> Expired OTP tokens successfully purged from database.");
        } catch (Exception e) {
            log.error("Failed to clean up expired OTP tokens: {}", e.getMessage());
        }
    }
}
