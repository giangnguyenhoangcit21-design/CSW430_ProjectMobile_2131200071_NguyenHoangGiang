package com.hearthealth.backend.service;

import com.hearthealth.backend.dto.*;

public interface AuthService {
    AuthResponse login(AuthRequest request);
    AuthResponse register(RegisterRequest request);
    void sendOtp(OtpRequest request);
    boolean verifyOtp(OtpVerifyRequest request);
    void resetPassword(ResetPasswordRequest request);
}
