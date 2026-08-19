-- Thêm cột screening_completed vào bảng users
-- Logic: Đánh dấu user đã hoàn thành bài nhập liệu sàng lọc ban đầu hay chưa
-- Nếu TRUE: đăng nhập → vào app luôn
-- Nếu FALSE: đăng nhập → bắt nhập liệu trước

ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `screening_completed` TINYINT(1) NOT NULL DEFAULT 0 AFTER `gender`;
