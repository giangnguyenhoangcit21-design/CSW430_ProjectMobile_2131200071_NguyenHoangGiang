-- Migration to remove phone fields from database
-- Author: AI
-- Date: 2026-08-18

USE hearthealth;

-- 1. Remove phone from users table
ALTER TABLE users DROP COLUMN phone;

-- 2. Remove phone from otp_tokens table
ALTER TABLE otp_tokens DROP COLUMN phone;
