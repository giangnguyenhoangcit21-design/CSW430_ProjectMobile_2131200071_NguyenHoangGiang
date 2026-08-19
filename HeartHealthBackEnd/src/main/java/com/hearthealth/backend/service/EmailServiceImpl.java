package com.hearthealth.backend.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:hearthhealthmobile@gmail.com}")
    private String fromEmail;

    @Override
    public void sendOtpEmail(String toEmail, String otpCode, String purpose, String lang) {
        boolean isEn = "EN".equalsIgnoreCase(lang);

        String titleSubject;
        String actionTitle;

        if ("REGISTER".equalsIgnoreCase(purpose)) {
            titleSubject = isEn ? "❤️ [Heart Health] Account Registration Verification Code" : "❤️ [Heart Health] Mã xác nhận Đăng ký tài khoản";
            actionTitle = isEn ? "Account Registration Verification" : "Xác nhận Đăng ký Tài khoản";
        } else if ("GMAIL_LOGIN".equalsIgnoreCase(purpose) || "LOGIN".equalsIgnoreCase(purpose)) {
            titleSubject = isEn ? "🔑 [Heart Health] Login Verification Code" : "🔑 [Heart Health] Mã xác nhận Đăng nhập";
            actionTitle = isEn ? "Login Verification" : "Xác nhận Đăng nhập";
        } else {
            titleSubject = isEn ? "🔐 [Heart Health] Password Reset Verification Code" : "🔐 [Heart Health] Mã xác nhận Quên mật khẩu";
            actionTitle = isEn ? "Password Reset Request" : "Yêu cầu Đặt lại Mật khẩu";
        }

        String htmlContent = buildOtpEmailHtml(actionTitle, otpCode, isEn);

        // Always print to console so dev environment is 100% unblocked
        log.info("=================================================");
        log.info(">>> [MAIL OTP CONSOLE] Sent to: {} | OTP Code: {} | Purpose: {} | Lang: {}", toEmail, otpCode, purpose, lang);
        log.info("=================================================");

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, "Heart Health Mobile App");
            helper.setTo(toEmail);
            helper.setSubject(titleSubject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Successfully sent OTP email to {}", toEmail);
        } catch (Exception e) {
            log.error("Could not send email via SMTP to {}: {}", toEmail, e.getMessage());
            // Intentionally swallow exception so app testing continues with console OTP
        }
    }

    private String buildOtpEmailHtml(String actionTitle, String otpCode, boolean isEn) {
        String subtitle = isEn 
            ? "Please use the verification code below to continue the process on the Heart Health Mobile app."
            : "Bạn sử dụng mã xác nhận bên dưới để tiếp tục quy trình trên ứng dụng Heart Health Mobile.";
        String expireNotice = isEn
            ? "This verification code is valid for 5 minutes. Please do not share it with anyone!"
            : "Mã xác nhận này có hiệu lực trong vòng 5 phút. Vui lòng không chia sẻ cho bất kỳ ai!";
        String footer = isEn
            ? "© 2026 Heart Health App. Professional Cardiovascular Health Tracking Assistant."
            : "© 2026 Heart Health App. Trợ lý Theo dõi Sức khỏe Tim mạch Chuyên nghiệp.";

        return """
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #FFF5F7; margin: 0; padding: 20px; }
            .container { max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; padding: 30px; border: 1px solid #FFE4E6; box-shadow: 0 10px 25px rgba(225,29,72,0.05); }
            .logo { text-align: center; margin-bottom: 20px; }
            .logo-icon { font-size: 42px; line-height: 1; }
            .logo-title { font-size: 24px; font-weight: 800; color: #E11D48; margin-top: 6px; }
            .content { text-align: center; color: #334155; }
            .title { font-size: 20px; font-weight: 700; color: #1E293B; margin-bottom: 12px; }
            .subtitle { font-size: 14px; color: #64748B; margin-bottom: 24px; line-height: 1.5; }
            .otp-box { background-color: #FFF1F2; border: 2px dashed #FDA4AF; border-radius: 16px; padding: 20px; margin: 20px 0; text-align: center; }
            .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #E11D48; margin: 0; }
            .expire-notice { font-size: 12px; color: #94A3B8; margin-top: 10px; font-style: italic; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #94A3B8; border-top: 1px solid #F1F5F9; padding-top: 16px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <div class="logo-icon">❤️</div>
              <div class="logo-title">Heart Health</div>
            </div>
            <div class="content">
              <div class="title">%s</div>
              <div class="subtitle">%s</div>
              <div class="otp-box">
                <div class="otp-code">%s</div>
                <div class="expire-notice">%s</div>
              </div>
            </div>
            <div class="footer">
              %s
            </div>
          </div>
        </body>
        </html>
        """.formatted(actionTitle, subtitle, otpCode, expireNotice, footer);
    }
}
