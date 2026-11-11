-- ========================================================================
-- e-HADIR TUARAN — PADAM SEMUA PENTADBIR SELAIN SUPER ADMIN
-- Migration: 20261112000000_delete_other_admins.sql
-- ========================================================================

-- 1. Benarkan kebenaran DELETE pada jadual public.profiles untuk semua pentadbir
DROP POLICY IF EXISTS "Allow delete for authenticated" ON public.profiles;
CREATE POLICY "Allow delete for authenticated"
ON public.profiles FOR DELETE
TO authenticated, anon
USING (true);

-- 2. Padam semua profil pentadbir selain SUPER_ADMIN dan padam profil ujian
DELETE FROM public.profiles 
WHERE role != 'SUPER_ADMIN' 
   OR email = 'probe@test.com';

-- 3. Pastikan akaun Super Admin kekal aktif
UPDATE public.profiles 
SET role = 'SUPER_ADMIN', status = 'ACTIVE' 
WHERE email = 'perancangan@ppdtuaran.edu.my';

