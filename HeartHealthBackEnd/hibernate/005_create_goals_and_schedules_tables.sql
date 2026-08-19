-- Database Schema cho Mục tiêu Sức khỏe và Lịch trình Nhắc nhở
-- Hibernate DDL Script: health_goals, doctor_appointments, medication_schedules

CREATE TABLE IF NOT EXISTS `health_goals` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `bp_target` varchar(255) DEFAULT NULL,
  `active_mins` int DEFAULT NULL,
  `fat_target` varchar(255) DEFAULT NULL,
  `sugar_target` varchar(255) DEFAULT NULL,
  `weight_target` double DEFAULT NULL,
  `week_range` varchar(255) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_health_goal_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `doctor_appointments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `doctor_name` varchar(255) DEFAULT NULL,
  `appointment_type` varchar(255) DEFAULT NULL,
  `appointment_date` date DEFAULT NULL,
  `appointment_time` varchar(55) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `status` varchar(55) NOT NULL DEFAULT 'SCHEDULED',
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_doc_appt_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `medication_schedules` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `medication_name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `time_of_day` varchar(55) DEFAULT NULL,
  `taken` tinyint(1) NOT NULL DEFAULT 0,
  `last_taken_date` date DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_med_schedule_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
