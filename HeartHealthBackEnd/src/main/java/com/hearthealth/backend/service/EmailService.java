package com.hearthealth.backend.service;

public interface EmailService {
    void sendOtpEmail(String toEmail, String otpCode, String purpose, String lang);
}
