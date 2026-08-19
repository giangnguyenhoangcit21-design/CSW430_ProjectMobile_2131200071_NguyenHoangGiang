-- Tự động lưu lịch sử theo dõi sức khỏe cho mỗi phiên đánh giá
-- Chức năng: Lưu trữ chỉ số (Huyết áp, nhịp tim, triệu chứng,...) để liên kết với User

CREATE TABLE IF NOT EXISTS `health_records` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `age` int DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `blood_pressure` varchar(255) DEFAULT NULL,
  `heart_rate` int DEFAULT NULL,
  `weight` double DEFAULT NULL,
  `cholesterol` int DEFAULT NULL,
  `chest_pain` varchar(255) DEFAULT NULL,
  `breathlessness` varchar(255) DEFAULT NULL,
  `comorbidities` text DEFAULT NULL,
  `medications` text DEFAULT NULL,
  `assessment_title` varchar(255) DEFAULT NULL,
  `assessment_color` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_health_record_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
