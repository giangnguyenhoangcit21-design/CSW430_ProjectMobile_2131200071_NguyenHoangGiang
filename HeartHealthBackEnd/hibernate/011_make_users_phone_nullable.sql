-- Hibernate DDL Script to make phone column nullable in users table
-- File: 011_make_users_phone_nullable.sql
-- Description: Allows inserting User records generated for Gmail registration without requiring phone number.

ALTER TABLE users MODIFY COLUMN phone VARCHAR(20) NULL;
