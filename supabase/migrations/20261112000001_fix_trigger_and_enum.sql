-- ========================================================================
-- e-HADIR TUARAN — FIX: Trigger + Enum + RLS (Tampal Terus di SQL Editor)
-- Migration: 20261112000001_fix_trigger_and_enum.sql
-- ========================================================================

-- 1. Pastikan enum user_role_type ada semua nilai yang diperlukan
DO $$
BEGIN
  -- Tambah SUPER_ADMIN jika belum ada
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'SUPER_ADMIN' 
    AND enumtypid = 'public.user_role_type'::regtype
  ) THEN
    ALTER TYPE public.user_role_type ADD VALUE 'SUPER_ADMIN';
  END IF;

  -- Tambah PGB jika belum ada
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'PGB' 
    AND enumtypid = 'public.user_role_type'::regtype
  ) THEN
    ALTER TYPE public.user_role_type ADD VALUE 'PGB';
  END IF;

  -- Tambah ADMIN_ZON jika belum ada
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'ADMIN_ZON' 
    AND enumtypid = 'public.user_role_type'::regtype
  ) THEN
    ALTER TYPE public.user_role_type ADD VALUE 'ADMIN_ZON';
  END IF;

  -- Tambah MONITORING_ADMIN jika belum ada
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'MONITORING_ADMIN' 
    AND enumtypid = 'public.user_role_type'::regtype
  ) THEN
    ALTER TYPE public.user_role_type ADD VALUE 'MONITORING_ADMIN';
  END IF;
END;
$$;

-- 2. Pastikan kolum role pada profiles boleh terima nilai teks (VARCHAR fallback)
-- Jika enum masih bermasalah, ubah kolum role kepada TEXT
ALTER TABLE public.profiles 
  ALTER COLUMN role TYPE TEXT;

-- 3. Cipta semula fungsi trigger dengan TEXT (bukan enum) untuk elak konflik
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    position,
    status,
    role
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'Pegawai Pendidikan Daerah',
    'ACTIVE',
    'SUPER_ADMIN'
  ) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = 'SUPER_ADMIN',
    updated_at = NOW();

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Kalis ralat: jangan sekat pendaftaran auth.users
  RAISE WARNING 'handle_new_auth_user gagal: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- 4. Pasang semula trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 5. Pastikan polisi RLS DELETE ada
DROP POLICY IF EXISTS "Allow delete for authenticated" ON public.profiles;
CREATE POLICY "Allow delete for authenticated"
ON public.profiles FOR DELETE
TO authenticated, anon
USING (true);

-- 6. Semak hasilnya
SELECT 
  t.tgname AS trigger_name,
  p.proname AS function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgname = 'on_auth_user_created';
