-- ========================================================================
-- e-HADIR TUARAN — PADAM AKAUN TEST PROBE DARIPADA SUPABASE
-- Migration: 20261112000002_delete_probe_user.sql
-- ========================================================================

-- 1. Padam rekod Test Probe daripada public.profiles
DELETE FROM public.profiles 
WHERE email = 'probe@test.com' 
   OR email ILIKE '%probe%' 
   OR full_name ILIKE '%probe%';

-- 2. Padam pengguna Test Probe daripada auth.users (jika ada)
DELETE FROM auth.users 
WHERE email = 'probe@test.com' 
   OR email ILIKE '%probe%';

-- 3. Sahkan hanya akaun rasmi Super Admin yang kekal
SELECT id, full_name, email, role, status 
FROM public.profiles;
