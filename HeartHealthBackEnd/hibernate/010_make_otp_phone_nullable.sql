-- Hibernate DDL Script to make phone column nullable in otp_tokens
-- File: 010_make_otp_phone_nullable.sql
-- Description: Allows inserting OTP tokens generated for Email without requiring phone number.

ALTER TABLE otp_tokens MODIFY COLUMN phone VARCHAR(20) NULL;
