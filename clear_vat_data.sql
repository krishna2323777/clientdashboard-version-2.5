-- SQL Queries to Clear VAT Registration Data
-- Choose the appropriate query based on your needs

-- ============================================
-- OPTION 1: DELETE ALL RECORDS (Recommended)
-- ============================================
-- This will delete all VAT registration records
DELETE FROM vat_registrations;

-- ============================================
-- OPTION 2: DELETE RECORDS BY STATUS
-- ============================================
-- Delete only draft records
DELETE FROM vat_registrations WHERE status = 'draft';

-- Delete only pending records
DELETE FROM vat_registrations WHERE status = 'pending';

-- Delete draft and pending records
DELETE FROM vat_registrations WHERE status IN ('draft', 'pending');

-- ============================================
-- OPTION 3: DELETE RECORDS BY USER
-- ============================================
-- Replace 'your-user-id-here' with actual user ID
DELETE FROM vat_registrations WHERE user_id = 'your-user-id-here';

-- Delete records for a specific email (if you know the email)
DELETE FROM vat_registrations 
WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'user@example.com'
);

-- ============================================
-- OPTION 4: TRUNCATE TABLE (DANGEROUS - Removes ALL data)
-- ============================================
-- WARNING: This will remove ALL data and reset auto-increment counters
-- Only use if you want to completely start over
TRUNCATE TABLE vat_registrations RESTART IDENTITY CASCADE;

-- ============================================
-- OPTION 5: DROP AND RECREATE TABLE (NUCLEAR OPTION)
-- ============================================
-- WARNING: This will completely remove the table and all its data
-- Only use if you want to start completely fresh

-- Step 1: Drop the table
-- DROP TABLE IF EXISTS vat_registrations CASCADE;

-- Step 2: Re-run the original table creation script from vat_registration_table.sql

-- ============================================
-- OPTION 6: BYPASS RLS FOR ADMIN CLEANUP
-- ============================================
-- If you're having RLS issues, temporarily disable it
-- ALTER TABLE vat_registrations DISABLE ROW LEVEL SECURITY;

-- Then run your delete query
-- DELETE FROM vat_registrations;

-- Re-enable RLS after cleanup
-- ALTER TABLE vat_registrations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- OPTION 7: CHECK WHAT DATA EXISTS FIRST
-- ============================================
-- View all records before deleting
SELECT * FROM vat_registrations;

-- Count total records
SELECT COUNT(*) as total_records FROM vat_registrations;

-- Count by status
SELECT status, COUNT(*) as count 
FROM vat_registrations 
GROUP BY status;

-- Count by user
SELECT user_id, COUNT(*) as count 
FROM vat_registrations 
GROUP BY user_id;

-- ============================================
-- OPTION 8: SAFE DELETE WITH CONFIRMATION
-- ============================================
-- First, see what you're about to delete
SELECT 
    id,
    user_id,
    status,
    company_name,
    created_at
FROM vat_registrations 
ORDER BY created_at DESC;

-- Then delete with a specific condition
-- DELETE FROM vat_registrations WHERE id = 'specific-record-id';

-- ============================================
-- OPTION 9: DELETE OLD RECORDS
-- ============================================
-- Delete records older than 30 days
DELETE FROM vat_registrations 
WHERE created_at < NOW() - INTERVAL '30 days';

-- Delete records older than 7 days
DELETE FROM vat_registrations 
WHERE created_at < NOW() - INTERVAL '7 days';

-- ============================================
-- OPTION 10: RESET AUTO-INCREMENT WITHOUT DELETING DATA
-- ============================================
-- If you want to reset the sequence but keep data (not recommended)
-- ALTER SEQUENCE vat_registrations_id_seq RESTART WITH 1;

-- ============================================
-- TROUBLESHOOTING QUERIES
-- ============================================

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'vat_registrations';

-- Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'vat_registrations';

-- Check table permissions
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'vat_registrations';

-- Check current user
SELECT current_user, session_user;

-- Check if you're authenticated
SELECT auth.uid();

-- ============================================
-- RECOMMENDED APPROACH
-- ============================================

-- 1. First, check what data exists
SELECT COUNT(*) as total_records FROM vat_registrations;

-- 2. If you want to delete everything, use:
DELETE FROM vat_registrations;

-- 3. If that doesn't work due to RLS, temporarily disable it:
-- ALTER TABLE vat_registrations DISABLE ROW LEVEL SECURITY;
-- DELETE FROM vat_registrations;
-- ALTER TABLE vat_registrations ENABLE ROW LEVEL SECURITY;

-- 4. If you want to start completely fresh:
-- DROP TABLE IF EXISTS vat_registrations CASCADE;
-- Then re-run the table creation script 