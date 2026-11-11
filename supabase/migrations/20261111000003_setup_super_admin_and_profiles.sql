-- ========================================================================
-- e-HADIR TUARAN — SETUP SUPER ADMIN, PROFILES SCHEMA & AUTO-TRIGGER
-- Migration: 20261111000003_setup_super_admin_and_profiles.sql
-- ========================================================================

-- 1. Pastikan kekangan profiles_id_fkey fleksibel untuk penciptaan akaun PGB/Zon
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 2. Pastikan kolum-kolum peranan dan penetapan sekolah/zon wujud pada jadual profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS role user_role_type DEFAULT 'PGB',
  ADD COLUMN IF NOT EXISTS assigned_school_id VARCHAR(50),
  ADD COLUMN IF NOT EXISTS school_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS assigned_zone_ids TEXT[];

-- 3. Trigger automatik apabila pengguna dicipta dalam Supabase Authentication (auth.users)
-- Memastikan akaun yang dicipta dalam Supabase Dashboard menjadi SUPER_ADMIN secara kalis ralat
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public, auth
AS $$
BEGIN
  -- Cipta profil dalam public.profiles
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
    'Pegawai Pendidikan Daerah / Head Admin',
    'ACTIVE',
    'SUPER_ADMIN'
  ) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = 'SUPER_ADMIN';

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Kalis ralat: jangan sekali-kali sekat pendaftaran auth.users sekiranya berlaku sebarang ralat profil
  RETURN NEW;
END;
$$;

-- Pasang trigger pada auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 4. Polisi RLS (Row Level Security) untuk Profiles
DROP POLICY IF EXISTS "Super admin has full control over profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow select for authenticated" ON public.profiles;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.profiles;
DROP POLICY IF EXISTS "Allow update for authenticated" ON public.profiles;

CREATE POLICY "Allow select for authenticated"
ON public.profiles FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Allow insert for authenticated"
ON public.profiles FOR INSERT
TO authenticated, anon
WITH CHECK (true);

CREATE POLICY "Allow update for authenticated"
ON public.profiles FOR UPDATE
TO authenticated, anon
USING (true)
WITH CHECK (true);

