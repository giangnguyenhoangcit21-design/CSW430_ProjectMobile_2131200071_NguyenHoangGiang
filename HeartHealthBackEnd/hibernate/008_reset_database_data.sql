-- Hibernate DDL Script for Database Reset
-- File: 008_reset_database_data.sql
-- Description: Wipes all customer records and resets AUTO_INCREMENT counters to 1 for fresh testing.

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE daily_metrics;
TRUNCATE TABLE doctor_appointments;
TRUNCATE TABLE health_goals;
TRUNCATE TABLE health_records;
TRUNCATE TABLE medication_schedules;
TRUNCATE TABLE otp_tokens;
TRUNCATE TABLE users;

ALTER TABLE daily_metrics AUTO_INCREMENT = 1;
ALTER TABLE doctor_appointments AUTO_INCREMENT = 1;
ALTER TABLE health_goals AUTO_INCREMENT = 1;
ALTER TABLE health_records AUTO_INCREMENT = 1;
ALTER TABLE medication_schedules AUTO_INCREMENT = 1;
ALTER TABLE otp_tokens AUTO_INCREMENT = 1;
ALTER TABLE users AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;
