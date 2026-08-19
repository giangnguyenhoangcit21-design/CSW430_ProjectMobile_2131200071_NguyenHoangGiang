-- Hibernate DDL Script to make email column nullable in users and otp_tokens tables
-- File: 012_make_auth_columns_nullable.sql
-- Description: Allows inserting records generated for Phone (Zalo/SDT) registration without requiring an email.

ALTER TABLE users MODIFY COLUMN email VARCHAR(255) NULL;
ALTER TABLE otp_tokens MODIFY COLUMN email VARCHAR(255) NULL;
