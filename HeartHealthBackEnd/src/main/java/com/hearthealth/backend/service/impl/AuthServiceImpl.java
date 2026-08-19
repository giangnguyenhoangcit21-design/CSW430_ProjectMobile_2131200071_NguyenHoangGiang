package com.hearthealth.backend.service.impl;

import com.hearthealth.backend.dto.*;
import com.hearthealth.backend.entity.OtpToken;
import com.hearthealth.backend.entity.User;
import com.hearthealth.backend.exception.*;
import com.hearthealth.backend.repository.OtpTokenRepository;
import com.hearthealth.backend.repository.UserRepository;
import com.hearthealth.backend.service.AuthService;
import com.hearthealth.backend.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final OtpTokenRepository otpTokenRepository;
    private final EmailService emailService;

    @Override
    public AuthResponse login(AuthRequest request) {
        String identifier = request.getEmail() != null ? request.getEmail().trim() : "";

        if (identifier.isEmpty()) {
            throw new BadRequestException("Vui lòng nhập Email để đăng nhập");
        }

        User user = userRepository.findByEmail(identifier)
                .orElseThrow(() -> new UserNotFoundException("Tài khoản không tồn tại trên hệ thống"));

        if (!user.getPassword().equals(hashPassword(request.getPassword()))) {
            throw new InvalidPasswordException("Mật khẩu không chính xác");
        }

        if ("INACTIVE".equals(user.getStatus())) {
            throw new AccountInactiveException("Tài khoản của bạn đã bị khóa");
        }

        return AuthResponse.builder()
                .token("dummy-jwt-token-for-" + user.getEmail())
                .message("Đăng nhập thành công")
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .screeningCompleted(user.getScreeningCompleted())
                .build();
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim() : null;

        if (email == null || email.isEmpty()) {
            throw new BadRequestException("Vui lòng cung cấp Email");
        }

        // Verify OTP code (supports REGISTER or GMAIL_LOGIN)
        OtpVerifyRequest verifyReq = new OtpVerifyRequest();
        verifyReq.setEmail(email);
        verifyReq.setOtpCode(request.getOtpCode());
        verifyReq.setPurpose("REGISTER");
        if (!verifyOtp(verifyReq)) {
            verifyReq.setPurpose("GMAIL_LOGIN");
            if (!verifyOtp(verifyReq)) {
                throw new InvalidOtpException("Mã xác thực OTP không chính xác hoặc đã hết hạn!");
            }
        }

        // If Gmail account already exists (Quick Login flow), return existing user response
        Optional<User> existingUserOpt = userRepository.findByEmail(email);

        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();
            return AuthResponse.builder()
                    .token("dummy-jwt-token-for-" + existingUser.getEmail())
                    .message("Đăng nhập thành công")
                    .userId(existingUser.getId())
                    .email(existingUser.getEmail())
                    .fullName(existingUser.getFullName())
                    .screeningCompleted(existingUser.getScreeningCompleted() != null ? existingUser.getScreeningCompleted() : false)
                    .build();
        }

        // If GMAIL_LOGIN and account does not exist -> Require user to register
        if ("GMAIL_LOGIN".equalsIgnoreCase(verifyReq.getPurpose())) {
            throw new UserNotFoundException("Tài khoản Gmail này chưa được đăng ký trên hệ thống! Vui lòng tạo tài khoản mới.");
        }

        // Fallback default password if user registered via Quick Login without explicit password
        String rawPassword = request.getPassword();
        if (rawPassword == null || rawPassword.trim().isEmpty()) {
            rawPassword = "GmailUser@2026";
        }

        String fullName = request.getFullName() != null && !request.getFullName().trim().isEmpty()
                ? request.getFullName().trim()
                : (email.contains("@") ? email.substring(0, email.indexOf("@")) : "Bệnh nhân");

        User newUser = User.builder()
                .email(email)
                .password(hashPassword(rawPassword))
                .fullName(fullName)
                .role("USER")
                .status("ACTIVE")
                .screeningCompleted(false)
                .build();

        userRepository.save(newUser);

        return AuthResponse.builder()
                .token("dummy-jwt-token-for-" + newUser.getEmail())
                .message("Đăng ký tài khoản thành công")
                .userId(newUser.getId())
                .email(newUser.getEmail())
                .fullName(newUser.getFullName())
                .screeningCompleted(false)
                .build();
    }

    @Override
    public void sendOtp(OtpRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim() : null;

        if (email == null || email.isEmpty()) {
            throw new BadRequestException("Vui lòng cung cấp Email để nhận mã xác nhận OTP");
        }

        // Proactive validation before sending OTP
        if ("REGISTER".equalsIgnoreCase(request.getPurpose())) {
            if (userRepository.existsByEmail(email)) {
                throw new EmailAlreadyExistsException("Email này đã được đăng ký tài khoản trên hệ thống!");
            }
        } else if ("RESET_PASSWORD".equalsIgnoreCase(request.getPurpose()) || "GMAIL_LOGIN".equalsIgnoreCase(request.getPurpose())) {
            if (!userRepository.existsByEmail(email)) {
                throw new UserNotFoundException("Tài khoản Gmail này chưa được đăng ký trên hệ thống! Vui lòng tạo tài khoản mới.");
            }
        }

        // Enforce single-active OTP: Delete any existing unverified OTP tokens for this email & purpose
        otpTokenRepository.deleteByEmailAndPurpose(email, request.getPurpose());

        // Generate 6 digit OTP
        String code = String.format("%06d", new Random().nextInt(1000000));
        
        OtpToken otpToken = OtpToken.builder()
                .email(email)
                .otpCode(code)
                .purpose(request.getPurpose())
                .expirationTime(LocalDateTime.now().plusMinutes(5)) // 5 minutes validity
                .build();

        otpTokenRepository.save(otpToken);

        String lang = request.getLang() != null ? request.getLang() : "VN";

        // Send OTP via Email
        emailService.sendOtpEmail(email, code, request.getPurpose(), lang);
    }

    @Override
    public boolean verifyOtp(OtpVerifyRequest request) {
        String identifier = request.getEmail() != null ? request.getEmail().trim() : "";

        if (identifier.isEmpty()) {
            return false;
        }

        Optional<OtpToken> tokenOpt = otpTokenRepository.findTopByEmailAndPurposeOrderByCreatedAtDesc(
                identifier, request.getPurpose());

        if (tokenOpt.isEmpty()) {
            return false;
        }

        OtpToken token = tokenOpt.get();

        if (LocalDateTime.now().isAfter(token.getExpirationTime())) {
            return false;
        }

        return token.getOtpCode().equals(request.getOtpCode());
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        String identifier = request.getEmail() != null ? request.getEmail().trim() : "";

        if (identifier.isEmpty()) {
            throw new BadRequestException("Vui lòng nhập Email để đặt lại mật khẩu");
        }

        // Verify OTP
        OtpVerifyRequest verifyReq = new OtpVerifyRequest();
        verifyReq.setEmail(identifier);
        verifyReq.setOtpCode(request.getOtpCode());
        verifyReq.setPurpose("RESET_PASSWORD");
        
        if (!verifyOtp(verifyReq)) {
            throw new InvalidOtpException("Mã xác thực OTP không chính xác hoặc đã hết hạn!");
        }

        User user = userRepository.findByEmail(identifier)
                .orElseThrow(() -> new UserNotFoundException("Tài khoản không tồn tại trên hệ thống"));

        user.setPassword(hashPassword(request.getNewPassword()));
        userRepository.save(user);
    }

    private String hashPassword(String plainText) {
        return plainText; // Plain text for prototype testing
    }
}
