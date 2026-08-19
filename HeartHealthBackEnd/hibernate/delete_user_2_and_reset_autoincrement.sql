-- Script reset AUTO_INCREMENT và xóa tài khoản ID = 2
USE hearthealth;

-- Xóa dữ liệu liên quan ở các bảng con (nếu có)
DELETE FROM health_records WHERE user_id = 2;
DELETE FROM daily_metrics WHERE user_id = 2;
DELETE FROM health_goals WHERE user_id = 2;
DELETE FROM medication_schedules WHERE user_id = 2;
DELETE FROM doctor_appointments WHERE user_id = 2;
DELETE FROM otp_tokens WHERE email = 'giangphuc789@gmail.com';

-- Xóa người dùng ID 2
DELETE FROM users WHERE id = 2;

-- Reset số thứ tự tự động tăng (AUTO_INCREMENT) về 2
ALTER TABLE users AUTO_INCREMENT = 2;
