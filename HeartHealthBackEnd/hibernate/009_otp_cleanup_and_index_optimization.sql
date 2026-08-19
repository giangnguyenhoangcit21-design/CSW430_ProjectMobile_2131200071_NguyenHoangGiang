-- Hibernate DDL Script for OTP Cleanup and Index Optimization
-- File: 009_otp_cleanup_and_index_optimization.sql
-- Description: Creates composite index on email, purpose, and expiration_time for fast OTP cleanup operations.

-- Create composite index for email and purpose lookup
CREATE INDEX IF NOT EXISTS idx_otps_email_purpose ON otp_tokens(email, purpose);

-- Create index for background expired token purging
CREATE INDEX IF NOT EXISTS idx_otps_expiration_time ON otp_tokens(expiration_time);
