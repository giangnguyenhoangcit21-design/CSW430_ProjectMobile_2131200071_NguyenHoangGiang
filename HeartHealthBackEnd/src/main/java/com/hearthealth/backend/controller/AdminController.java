package com.hearthealth.backend.controller;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    @PersistenceContext
    private final EntityManager entityManager;

    @PostMapping("/reset-database")
    @Transactional
    public ResponseEntity<Map<String, String>> resetDatabase() {
        entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS = 0").executeUpdate();

        entityManager.createNativeQuery("TRUNCATE TABLE daily_metrics").executeUpdate();
        entityManager.createNativeQuery("TRUNCATE TABLE doctor_appointments").executeUpdate();
        entityManager.createNativeQuery("TRUNCATE TABLE health_goals").executeUpdate();
        entityManager.createNativeQuery("TRUNCATE TABLE health_records").executeUpdate();
        entityManager.createNativeQuery("TRUNCATE TABLE medication_schedules").executeUpdate();
        entityManager.createNativeQuery("TRUNCATE TABLE otp_tokens").executeUpdate();
        entityManager.createNativeQuery("TRUNCATE TABLE users").executeUpdate();

        entityManager.createNativeQuery("ALTER TABLE otp_tokens MODIFY COLUMN phone VARCHAR(20) NULL").executeUpdate();
        entityManager.createNativeQuery("ALTER TABLE otp_tokens MODIFY COLUMN email VARCHAR(255) NULL").executeUpdate();
        entityManager.createNativeQuery("ALTER TABLE users MODIFY COLUMN phone VARCHAR(20) NULL").executeUpdate();
        entityManager.createNativeQuery("ALTER TABLE users MODIFY COLUMN email VARCHAR(255) NULL").executeUpdate();

        entityManager.createNativeQuery("ALTER TABLE daily_metrics AUTO_INCREMENT = 1").executeUpdate();
        entityManager.createNativeQuery("ALTER TABLE doctor_appointments AUTO_INCREMENT = 1").executeUpdate();
        entityManager.createNativeQuery("ALTER TABLE health_goals AUTO_INCREMENT = 1").executeUpdate();
        entityManager.createNativeQuery("ALTER TABLE health_records AUTO_INCREMENT = 1").executeUpdate();
        entityManager.createNativeQuery("ALTER TABLE medication_schedules AUTO_INCREMENT = 1").executeUpdate();
        entityManager.createNativeQuery("ALTER TABLE otp_tokens AUTO_INCREMENT = 1").executeUpdate();
        entityManager.createNativeQuery("ALTER TABLE users AUTO_INCREMENT = 1").executeUpdate();

        entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS = 1").executeUpdate();

        Map<String, String> res = new HashMap<>();
        res.put("message", "Đã xóa toàn bộ dữ liệu và reset AUTO_INCREMENT của toàn bộ các bảng về 1 thành công!");
        return ResponseEntity.ok(res);
    }

    @PostMapping("/drop-phone")
    @Transactional
    public ResponseEntity<Map<String, String>> dropPhoneColumn() {
        try {
            entityManager.createNativeQuery("ALTER TABLE users DROP COLUMN phone").executeUpdate();
        } catch(Exception e) {
            System.out.println("Could not drop users.phone: " + e.getMessage());
        }
        
        try {
            entityManager.createNativeQuery("ALTER TABLE otp_tokens DROP COLUMN phone").executeUpdate();
        } catch(Exception e) {
            System.out.println("Could not drop otp_tokens.phone: " + e.getMessage());
        }

        Map<String, String> res = new HashMap<>();
        res.put("message", "Đã xóa cột phone khỏi các bảng thành công!");
        return ResponseEntity.ok(res);
    }
}
