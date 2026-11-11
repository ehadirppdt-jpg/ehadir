-- ========================================================================
-- e-HADIR TUARAN — SEED DATA: 6 OFFICIAL ZONES & INITIAL SETTINGS
-- ========================================================================

-- 1. SEED ROLES
INSERT INTO public.roles (code, name, description)
VALUES 
    ('SUPER_ADMIN', 'Ketua Pentadbir (Head Admin / Super Admin)', 'Akses penuh ke semua zon, sekolah, tetapan sistem dan pengesahan kehadiran.'),
    ('ADMIN_ZON', 'Pentadbir Zon', 'Pengurusan dan verifikasi kehadiran sekolah dalam zon yang ditugaskan sahaja.'),
    ('MONITORING_ADMIN', 'Pentadbir Pemantau (Read-Only)', 'Akses melihat papan pemuka, statistik dan laporan tanpa kebenaran modifikasi.'),
    ('PGB', 'Pengetua dan Guru Besar', 'Akaun pengguna sekolah (Portal Pengguna fasa hadapan).')
ON CONFLICT (code) DO UPDATE SET 
    name = EXCLUDED.name, 
    description = EXCLUDED.description;

-- 2. SEED THE EXACT 6 ADMINISTRATIVE ZONES
-- Official Zones under Pejabat Pendidikan Daerah Tuaran
INSERT INTO public.zones (code, name, color_hex, description, is_active)
VALUES
    ('Z01', 'ZON TENGHILAN', '#0284C7', 'Zon Pentadbiran Sekolah Kawasan Tenghilan', TRUE),
    ('Z02', 'ZON MENGKABONG', '#0D9488', 'Zon Pentadbiran Sekolah Kawasan Mengkabong', TRUE),
    ('Z03', 'ZON SULAMAN', '#2563EB', 'Zon Pentadbiran Sekolah Kawasan Sulaman', TRUE),
    ('Z04', 'ZON KIULU', '#7C3AED', 'Zon Pentadbiran Sekolah Kawasan Kiulu', TRUE),
    ('Z05', 'ZON NABALU', '#D97706', 'Zon Pentadbiran Sekolah Kawasan Nabalu', TRUE),
    ('Z06', 'ZON TAMPARULI', '#059669', 'Zon Pentadbiran Sekolah Kawasan Tamparuli', TRUE)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    color_hex = EXCLUDED.color_hex,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active;

-- 3. SEED OFFICIAL PPD TUARAN LOCATION
-- PPD Tuaran coordinates (Tuaran District Education Office, Sabah)
INSERT INTO public.attendance_locations (name, type, address, latitude, longitude, radius_meters, is_active)
VALUES (
    'Pejabat Pendidikan Daerah Tuaran (PPD Tuaran)',
    'PPD',
    'Peti Surat 590, 89208 Tuaran, Sabah, Malaysia',
    6.1341200,
    116.2305400,
    150,
    TRUE
);

-- 4. SEED WORK SCHEDULES
INSERT INTO public.work_schedules (name, target_work_minutes, official_clock_in_time, late_tolerance_minutes, count_break_time_in_hours, is_active)
VALUES (
    'Jadual Piawai Pentadbir PGB (9 Jam)',
    540,
    '07:30:00',
    15,
    FALSE,
    TRUE
);

-- 5. SEED SYSTEM SETTINGS
INSERT INTO public.system_settings (key, value, category, description, is_public)
VALUES
    ('general_settings', '{"system_name": "e-HADIR TUARAN", "organization": "Pejabat Pendidikan Daerah Tuaran", "academic_year": 2026, "contact_support": "ppd.tuaran@moe.gov.my"}'::jsonb, 'GENERAL', 'Maklumat asas sistem pentadbiran', TRUE),
    ('attendance_rules', '{"daily_target_minutes": 540, "late_tolerance_minutes": 15, "official_clock_in": "07:30", "face_verification_required": true, "offline_attendance_allowed": false, "calculation_mode": "ELAPSED_TIME"}'::jsonb, 'ATTENDANCE', 'Peraturan pengiraan dan verifikasi kehadiran', FALSE),
    ('geofence_defaults', '{"default_radius": 100, "min_radius": 50, "max_radius": 500, "strict_gps_enforcement": true, "detect_mock_gps": true}'::jsonb, 'ATTENDANCE', 'Tetapan piawai pagar geografi (geofence)', FALSE),
    ('monthly_submission_schedule', '{"auto_generate_day": 1, "submission_deadline_day": 5, "verification_deadline_day": 10, "auto_notify_approver": true}'::jsonb, 'ATTENDANCE', 'Jadual penjanaan automatik laporan bulanan', FALSE),
    ('notification_channels', '{"email_enabled": true, "in_app_enabled": true, "system_alerts_enabled": true}'::jsonb, 'NOTIFICATION', 'Saluran penghantaran notifikasi', FALSE)
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description;

