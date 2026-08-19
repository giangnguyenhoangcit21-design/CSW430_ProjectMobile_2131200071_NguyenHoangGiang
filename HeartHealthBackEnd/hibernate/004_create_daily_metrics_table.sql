-- Bảng lưu vết chỉ số sức khỏe cập nhật theo ngày (hoặc khởi tạo từ Sàng lọc)
-- Chức năng: Lưu trữ Huyết áp, Nhịp tim, SpO2, Cholesterol, Đường huyết, Cân nặng

CREATE TABLE IF NOT EXISTS `daily_metrics` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `sys_bp` int DEFAULT NULL,
  `dia_bp` int DEFAULT NULL,
  `blood_pressure` varchar(255) DEFAULT NULL,
  `heart_rate` int DEFAULT NULL,
  `spo2` int DEFAULT NULL,
  `cholesterol` int DEFAULT NULL,
  `blood_sugar` double DEFAULT NULL,
  `weight` double DEFAULT NULL,
  `source` varchar(55) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_daily_metric_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
