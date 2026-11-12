-- ========================================================================
-- e-HADIR TUARAN — FIX: Geofence Locations, Schools & RLS Permissions
-- Migration: 20261112000003_fix_locations_and_rls.sql
-- ========================================================================

-- 1. Buka akses RLS untuk table attendance_locations (PPD & Sekolah)
ALTER TABLE IF EXISTS public.attendance_locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select for all attendance_locations" ON public.attendance_locations;
CREATE POLICY "Allow select for all attendance_locations"
ON public.attendance_locations FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Allow insert/update/delete for attendance_locations" ON public.attendance_locations;
CREATE POLICY "Allow insert/update/delete for attendance_locations"
ON public.attendance_locations FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 2. Pastikan unik untuk type = 'PPD' supaya upsert tidak ralat
-- Bersihkan duplikasi jika ada
DELETE FROM public.attendance_locations a
USING public.attendance_locations b
WHERE a.id > b.id 
  AND a.type = 'PPD' 
  AND b.type = 'PPD';

-- Tambah indeks unik bagi type PPD
CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_locations_type_ppd 
ON public.attendance_locations (type) 
WHERE type = 'PPD';

-- 3. Buka akses RLS untuk table schools (supaya Super Admin boleh simpan geofence)
ALTER TABLE IF EXISTS public.schools ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select for all schools" ON public.schools;
CREATE POLICY "Allow select for all schools"
ON public.schools FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Allow insert/update/delete for schools" ON public.schools;
CREATE POLICY "Allow insert/update/delete for schools"
ON public.schools FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 4. Kemaskini fungsi get_current_user_role() supaya baca profiles.role jika tiada dalam user_roles
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
DECLARE
    v_role TEXT;
BEGIN
    -- Semak jadual user_roles dahulu jika ada
    BEGIN
        SELECT r.code::text INTO v_role
        FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        LIMIT 1;
    EXCEPTION WHEN OTHERS THEN
        v_role := NULL;
    END;
    
    -- Jika tiada, semak jadual profiles
    IF v_role IS NULL THEN
        SELECT p.role INTO v_role
        FROM public.profiles p
        WHERE p.id = auth.uid()
        LIMIT 1;
    END IF;

    -- Jika tiada, semak user metadata
    IF v_role IS NULL THEN
        v_role := auth.jwt()->'user_metadata'->>'role';
    END IF;
    
    RETURN COALESCE(v_role, 'PGB');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Kemaskini fungsi is_super_admin()
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.get_current_user_role() = 'SUPER_ADMIN';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
