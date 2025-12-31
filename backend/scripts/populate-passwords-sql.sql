-- =====================================================
-- SQL SCRIPT TO SET DEFAULT PASSWORDS FOR EXISTING USERS
-- =====================================================
-- WARNING: This sets plain text passwords. For production, use the Node.js script instead!
-- This is a quick solution for testing/development only.

-- For production, you should use the Node.js script (populate-passwords.js) 
-- which properly hashes passwords with bcrypt.

-- Option 1: Set a simple default password (NOT RECOMMENDED FOR PRODUCTION)
-- You'll need to hash this in your application or use bcrypt

-- For now, we'll set a placeholder that users must change
-- The backend will require password reset on first login if password is NULL

-- Update Officers - Set email-based default if email exists
UPDATE Officer 
SET Password = 'changeme123'  -- This should be hashed! Use Node.js script instead.
WHERE Password IS NULL 
AND Email IS NOT NULL;

-- Update Victims - Set a default password
UPDATE Victim 
SET Password = 'changeme123'  -- This should be hashed! Use Node.js script instead.
WHERE Password IS NULL;

-- Update Witnesses - Set a default password
UPDATE Witness 
SET Password = 'changeme123'  -- This should be hashed! Use Node.js script instead.
WHERE Password IS NULL;

COMMIT;

-- =====================================================
-- BETTER APPROACH: Use the Node.js script
-- =====================================================
-- Run: node scripts/populate-passwords.js
-- This will properly hash passwords using bcrypt

