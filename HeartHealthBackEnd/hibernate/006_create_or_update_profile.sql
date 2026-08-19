-- Hibernate DDL Script for User Profile Management
-- File: 006_create_or_update_profile.sql
-- Description: Ensures users table has full_name, age, gender, avatar columns 
--              and health_records has comorbidities and medications fields.

-- 1. Verify/Add profile columns in users table
ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS full_name VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS avatar VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS age INT NULL,
    ADD COLUMN IF NOT EXISTS gender VARCHAR(50) NULL;

-- 2. Verify/Add health record details in health_records table
ALTER TABLE health_records 
    ADD COLUMN IF NOT EXISTS comorbidities TEXT NULL,
    ADD COLUMN IF NOT EXISTS medications TEXT NULL,
    ADD COLUMN IF NOT EXISTS assessment_title VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS assessment_color VARCHAR(50) NULL;
