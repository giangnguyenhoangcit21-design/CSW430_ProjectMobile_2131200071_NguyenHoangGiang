-- Hibernate DDL Script for Refactoring Authentication to Email (Gmail)
-- File: 007_refactor_user_email_auth.sql
-- Description: Adds email column to users table and otps table, sets email as unique key, makes phone optional.

-- 1. Update users table to add email column and index
ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS email VARCHAR(255) NULL,
    MODIFY COLUMN phone VARCHAR(20) NULL;

-- Create unique index on email if not exists
CREATE UNIQUE INDEX IF NOT EXISTS uk_users_email ON users(email);

-- 2. Update otp_tokens table to add email column
ALTER TABLE otp_tokens 
    ADD COLUMN IF NOT EXISTS email VARCHAR(255) NULL,
    MODIFY COLUMN phone VARCHAR(20) NULL;

-- Create index on email and purpose in otp_tokens table
CREATE INDEX IF NOT EXISTS idx_otps_email_purpose ON otp_tokens(email, purpose);
