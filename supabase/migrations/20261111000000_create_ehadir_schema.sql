-- ========================================================================
-- e-HADIR TUARAN — MASTER SCHEMA MIGRATION
-- Database: PostgreSQL (Supabase)
-- Target: Pejabat Pendidikan Daerah Tuaran (PPD Tuaran)
-- Tables: 27 Main Tables + Enums, Indexes, Constraints
-- ========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================================================
-- 1. ENUMS & DOMAINS
-- ========================================================================
DO $$ BEGIN
  CREATE TYPE user_role_type AS ENUM ('SUPER_ADMIN', 'ADMIN_ZON', 'MONITORING_ADMIN', 'PGB');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE account_status_type AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE school_category_type AS ENUM ('SK', 'SMK', 'SJKC', 'SJKT', 'SABK', 'K9', 'OTHER');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE attendance_status_type AS ENUM (
    'LENGKAP',
    'LEWAT',
    'TIDAK_LENGKAP',
    'PERLU_JUSTIFIKASI',
    'MENUNGGU_SEMAKAN',
    'DISAHKAN'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE monthly_verification_status_type AS ENUM (
    'BELUM_DIJANA',
    'DIJANA',
    'MENUNGGU_SEMAKAN',
    'DALAM_SEMAKAN',
    'DIKEMBALIKAN',
    'DISAHKAN',
    'DITOLAK'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE justification_status_type AS ENUM (
    'MENUNGGU_SEMAKAN',
    'DISAHKAN',
    'DITOLAK'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ========================================================================
-- 2. CORE IDENTITY & ROLES (Tables 1-3)
-- ========================================================================

-- 1. profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    ic_no VARCHAR(20) UNIQUE,
    position VARCHAR(150) NOT NULL DEFAULT 'Pegawai Perkhidmatan Pendidikan',
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(30),
    avatar_url TEXT,
    status account_status_type NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    deactivated_at TIMESTAMPTZ
);

-- 2. roles
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code user_role_type UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE RESTRICT,
    assigned_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_user_role UNIQUE (user_id, role_id)
);

-- ========================================================================
-- 3. ORGANISATION: ZONES & SCHOOLS (Tables 4-9)
-- ========================================================================

-- 4. zones (6 initial zones)
CREATE TABLE IF NOT EXISTS public.zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    color_hex VARCHAR(20) NOT NULL DEFAULT '#1E40AF',
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. schools (~85 schools under PPD Tuaran)
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category school_category_type NOT NULL DEFAULT 'SK',
    address TEXT,
    postal_code VARCHAR(10) DEFAULT '89208',
    phone VARCHAR(30),
    email VARCHAR(255),
    latitude NUMERIC(10, 7) NOT NULL DEFAULT 6.1340000,
    longitude NUMERIC(10, 7) NOT NULL DEFAULT 116.2300000,
    geofence_radius_meters INTEGER NOT NULL DEFAULT 100 CHECK (geofence_radius_meters >= 50 AND geofence_radius_meters <= 500),
    status account_status_type NOT NULL DEFAULT 'ACTIVE',
    location_status VARCHAR(50) NOT NULL DEFAULT 'VERIFIED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    deleted_at TIMESTAMPTZ
);

-- 6. school_zone_assignments (One active zone per school, historical preserved)
CREATE TABLE IF NOT EXISTS public.school_zone_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE RESTRICT,
    zone_id UUID NOT NULL REFERENCES public.zones(id) ON DELETE RESTRICT,
    assigned_by UUID REFERENCES public.profiles(id),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT,
    deassigned_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_school_zone_one_active 
ON public.school_zone_assignments(school_id) WHERE is_active = TRUE;

-- 7. user_school_assignments (PGB assigned to School)
CREATE TABLE IF NOT EXISTS public.user_school_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE RESTRICT,
    position_title VARCHAR(150) NOT NULL DEFAULT 'Guru Besar',
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    assigned_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_school_one_active 
ON public.user_school_assignments(user_id) WHERE is_active = TRUE;

-- 8. admin_zone_assignments (Admin Zon assigned to Zones)
CREATE TABLE IF NOT EXISTS public.admin_zone_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    zone_id UUID NOT NULL REFERENCES public.zones(id) ON DELETE RESTRICT,
    assigned_by UUID REFERENCES public.profiles(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_admin_zone UNIQUE (admin_id, zone_id)
);

-- 9. admin_school_assignments (Granular school assignments if needed)
CREATE TABLE IF NOT EXISTS public.admin_school_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE RESTRICT,
    assigned_by UUID REFERENCES public.profiles(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_admin_school UNIQUE (admin_id, school_id)
);

-- ========================================================================
-- 4. LOCATIONS & GEOFENCE (Tables 10-11)
-- ========================================================================

-- 10. attendance_locations (School & PPD Tuaran official location)
CREATE TABLE IF NOT EXISTS public.attendance_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'SCHOOL', -- SCHOOL, PPD, EXTERNAL_APPROVED
    school_id UUID REFERENCES public.schools(id),
    address TEXT,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    radius_meters INTEGER NOT NULL DEFAULT 100 CHECK (radius_meters >= 50 AND radius_meters <= 500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. geofence_settings
CREATE TABLE IF NOT EXISTS public.geofence_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL DEFAULT 'GLOBAL', -- GLOBAL, SCHOOL, PPD
    entity_id UUID,
    min_radius_meters INTEGER NOT NULL DEFAULT 50,
    max_radius_meters INTEGER NOT NULL DEFAULT 500,
    default_radius_meters INTEGER NOT NULL DEFAULT 100,
    strict_mode BOOLEAN NOT NULL DEFAULT TRUE,
    allow_mock_gps BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ========================================================================
-- 5. ATTENDANCE OPERATIONS & BIOMETRICS (Tables 12-15)
-- ========================================================================

-- 12. attendance_records
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE RESTRICT,
    date DATE NOT NULL,
    clock_in_time TIMESTAMPTZ,
    clock_out_time TIMESTAMPTZ,
    total_working_minutes INTEGER NOT NULL DEFAULT 0,
    late_minutes INTEGER NOT NULL DEFAULT 0,
    status attendance_status_type NOT NULL DEFAULT 'LENGKAP',
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_user_attendance_date UNIQUE (user_id, date)
);

-- 13. attendance_events (Individual clock-in/clock-out events)
CREATE TABLE IF NOT EXISTS public.attendance_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attendance_record_id UUID NOT NULL REFERENCES public.attendance_records(id) ON DELETE CASCADE,
    event_type VARCHAR(20) NOT NULL, -- CLOCK_IN, CLOCK_OUT
    timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    accuracy_meters NUMERIC(8, 2),
    location_id UUID REFERENCES public.attendance_locations(id),
    is_within_geofence BOOLEAN NOT NULL DEFAULT FALSE,
    distance_meters NUMERIC(10, 2),
    device_id VARCHAR(100),
    face_verified BOOLEAN NOT NULL DEFAULT FALSE,
    face_match_score NUMERIC(5, 4),
    biometric_log_id VARCHAR(100),
    raw_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 14. biometric_profiles (Secure non-raw face template representation)
CREATE TABLE IF NOT EXISTS public.biometric_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    enrolment_status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, ENROLLED, REJECTED
    template_hash TEXT,
    algorithm_version VARCHAR(50) DEFAULT 'v1.0-facenet',
    enrolled_at TIMESTAMPTZ,
    last_verified_at TIMESTAMPTZ,
    re_enrolment_requested BOOLEAN NOT NULL DEFAULT FALSE,
    re_enrolment_reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 15. device_registry
CREATE TABLE IF NOT EXISTS public.device_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    device_uuid VARCHAR(100) NOT NULL,
    device_model VARCHAR(150),
    os_version VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'APPROVED', -- PENDING, APPROVED, REJECTED, BLOCKED
    requested_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    approved_by UUID REFERENCES public.profiles(id),
    approved_at TIMESTAMPTZ,
    notes TEXT,
    CONSTRAINT uq_user_device UNIQUE (user_id, device_uuid)
);

-- ========================================================================
-- 6. JUSTIFICATIONS (Tables 16-17)
-- ========================================================================

-- 16. justifications
CREATE TABLE IF NOT EXISTS public.justifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attendance_record_id UUID NOT NULL REFERENCES public.attendance_records(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason_category VARCHAR(100) NOT NULL, -- KURSUS, TUGASAN_RASMI_LUAR, KECEMASAN, MASALAH_TEKNIKAL, CUTI_SAKIT, LAIN_LAIN
    description TEXT NOT NULL,
    status justification_status_type NOT NULL DEFAULT 'MENUNGGU_SEMAKAN',
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMPTZ,
    review_remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 17. justification_documents
CREATE TABLE IF NOT EXISTS public.justification_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    justification_id UUID NOT NULL REFERENCES public.justifications(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size_bytes BIGINT,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ========================================================================
-- 7. MONTHLY APPROVAL & VERIFICATION (Tables 18-20)
-- ========================================================================

-- 18. monthly_attendance
CREATE TABLE IF NOT EXISTS public.monthly_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE RESTRICT,
    month SMALLINT NOT NULL CHECK (month >= 1 AND month <= 12),
    year SMALLINT NOT NULL CHECK (year >= 2020),
    total_working_days SMALLINT NOT NULL DEFAULT 0,
    present_days SMALLINT NOT NULL DEFAULT 0,
    late_days SMALLINT NOT NULL DEFAULT 0,
    incomplete_days SMALLINT NOT NULL DEFAULT 0,
    justified_days SMALLINT NOT NULL DEFAULT 0,
    total_hours_rendered NUMERIC(6, 2) NOT NULL DEFAULT 0,
    status monthly_verification_status_type NOT NULL DEFAULT 'BELUM_DIJANA',
    generated_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_monthly_user_month_year UNIQUE (user_id, month, year)
);

-- 19. monthly_approver_assignments (Crucial module requirement)
CREATE TABLE IF NOT EXISTS public.monthly_approver_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month SMALLINT NOT NULL CHECK (month >= 1 AND month <= 12),
    year SMALLINT NOT NULL CHECK (year >= 2020),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE RESTRICT,
    zone_id UUID REFERENCES public.zones(id) ON DELETE RESTRICT,
    assigned_admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    assigned_by UUID REFERENCES public.profiles(id),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    is_primary BOOLEAN NOT NULL DEFAULT TRUE,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, REASSIGNED
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_monthly_approver_active 
ON public.monthly_approver_assignments(school_id, month, year) 
WHERE is_primary = TRUE AND status = 'ACTIVE';

-- 20. monthly_approvals
CREATE TABLE IF NOT EXISTS public.monthly_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    monthly_attendance_id UUID NOT NULL REFERENCES public.monthly_attendance(id) ON DELETE CASCADE,
    approver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    assignment_id UUID REFERENCES public.monthly_approver_assignments(id),
    action VARCHAR(50) NOT NULL, -- VERIFY, RETURN, REJECT
    status monthly_verification_status_type NOT NULL,
    remarks TEXT,
    signed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ========================================================================
-- 8. SYSTEM CONFIGURATION & CALENDAR (Tables 21-23)
-- ========================================================================

-- 21. work_schedules
CREATE TABLE IF NOT EXISTS public.work_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL DEFAULT 'Jadual Rasmi Pentadbir Sekolah (9 Jam)',
    target_work_minutes INTEGER NOT NULL DEFAULT 540, -- 9 Hours
    official_clock_in_time TIME NOT NULL DEFAULT '07:30:00',
    late_tolerance_minutes INTEGER NOT NULL DEFAULT 15,
    count_break_time_in_hours BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 22. holiday_calendar
CREATE TABLE IF NOT EXISTS public.holiday_calendar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    holiday_date DATE NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'STATE_SABAH', -- NATIONAL, STATE_SABAH, SCHOOL_TERM, SPECIAL
    applies_to_pgb BOOLEAN NOT NULL DEFAULT TRUE, -- School holidays false by default for PGB unless gazetted
    year SMALLINT NOT NULL DEFAULT 2026,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 23. system_settings
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'GENERAL', -- GENERAL, ATTENDANCE, SECURITY, NOTIFICATION
    description TEXT,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    updated_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ========================================================================
-- 9. AUDITING, ALERTS & JOBS (Tables 24-27)
-- ========================================================================

-- 24. notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipient_role user_role_type,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    link VARCHAR(255),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 25. audit_logs (Immutable activity trail)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_role user_role_type,
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    record_id VARCHAR(100),
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 26. risk_alerts
CREATE TABLE IF NOT EXISTS public.risk_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL, -- ATTENDANCE, DEVICE, GEOFENCE, APPROVAL
    entity_id UUID,
    alert_type VARCHAR(100) NOT NULL, -- GEOFENCE_BREACH, MULTIPLE_DEVICES, UNASSIGNED_APPROVER, CONSECUTIVE_ABSENCE
    severity VARCHAR(20) NOT NULL DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, CRITICAL
    details JSONB,
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_by UUID REFERENCES public.profiles(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 27. submission_jobs (Automated monthly job runner records)
CREATE TABLE IF NOT EXISTS public.submission_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month SMALLINT NOT NULL,
    year SMALLINT NOT NULL,
    job_status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, RUNNING, COMPLETED, FAILED
    total_schools_processed INTEGER NOT NULL DEFAULT 0,
    total_pgb_processed INTEGER NOT NULL DEFAULT 0,
    errors_log JSONB,
    executed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ========================================================================
-- INDEXES FOR PERFORMANCE
-- ========================================================================
CREATE INDEX IF NOT EXISTS idx_schools_code ON public.schools(code);
CREATE INDEX IF NOT EXISTS idx_schools_category ON public.schools(category);
CREATE INDEX IF NOT EXISTS idx_attendance_records_date ON public.attendance_records(date);
CREATE INDEX IF NOT EXISTS idx_attendance_records_status ON public.attendance_records(status);
CREATE INDEX IF NOT EXISTS idx_monthly_attendance_month_year ON public.monthly_attendance(month, year);
CREATE INDEX IF NOT EXISTS idx_monthly_attendance_status ON public.monthly_attendance(status);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity, record_id);

