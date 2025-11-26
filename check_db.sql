-- Create a test admin user with email and password hash
-- Password: admin123
-- Hash is from Django's PBKDF2PasswordHasher

USE student_management;

-- First, let's check if the user table exists and has data
SELECT * FROM users LIMIT 5;
