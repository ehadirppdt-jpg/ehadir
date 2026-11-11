import {
  Zone,
  School,
  UserProfile,
  AttendanceRecord,
  Justification,
  MonthlyAttendanceRecord,
  MonthlyApproverAssignment,
  AppNotification,
  WorkSchedule,
  HolidayCalendarItem,
  DashboardStats,
  UserRoleType,
} from '@/types';
import { logAuditEvent } from './audit';

// ========================================================================
// INITIAL SEED DATA
// ========================================================================

export const INITIAL_ZONES: Zone[] = [
  {
    id: 'zone-z01',
    code: 'Z01',
    name: 'ZON TENGHILAN',
    color_hex: '#0284C7',
    description: 'Zon Pentadbiran Sekolah Kawasan Tenghilan',
    is_active: true,
    total_schools: 14,
    total_pgb: 14,
    assigned_admin_name: 'Ustaz Azman bin Harun (Admin Zon Z01 & Z02)',
    assigned_admin_id: 'usr-admin-tenghilan',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'zone-z02',
    code: 'Z02',
    name: 'ZON MENGKABONG',
    color_hex: '#0D9488',
    description: 'Zon Pentadbiran Sekolah Kawasan Mengkabong',
    is_active: true,
    total_schools: 15,
    total_pgb: 15,
    assigned_admin_name: 'Ustaz Azman bin Harun (Admin Zon Z01 & Z02)',
    assigned_admin_id: 'usr-admin-tenghilan',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'zone-z03',
    code: 'Z03',
    name: 'ZON SULAMAN',
    color_hex: '#2563EB',
    description: 'Zon Pentadbiran Sekolah Kawasan Sulaman',
    is_active: true,
    total_schools: 16,
    total_pgb: 16,
    assigned_admin_name: 'Puan Siti Rahmah binti Salleh',
    assigned_admin_id: 'usr-admin-sulaman',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'zone-z04',
    code: 'Z04',
    name: 'ZON KIULU',
    color_hex: '#7C3AED',
    description: 'Zon Pentadbiran Sekolah Kawasan Kiulu',
    is_active: true,
    total_schools: 14,
    total_pgb: 14,
    assigned_admin_name: 'Encik Roger Majalap (Admin Zon Z04 & Z05)',
    assigned_admin_id: 'usr-admin-kiulu',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'zone-z05',
    code: 'Z05',
    name: 'ZON NABALU',
    color_hex: '#D97706',
    description: 'Zon Pentadbiran Sekolah Kawasan Nabalu',
    is_active: true,
    total_schools: 12,
    total_pgb: 12,
    assigned_admin_name: 'Encik Roger Majalap (Admin Zon Z04 & Z05)',
    assigned_admin_id: 'usr-admin-kiulu',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'zone-z06',
    code: 'Z06',
    name: 'ZON TAMPARULI',
    color_hex: '#059669', // Emerald Green (No longer red as requested)
    description: 'Zon Pentadbiran Sekolah Kawasan Tamparuli',
    is_active: true,
    total_schools: 14,
    total_pgb: 14,
    assigned_admin_name: 'Encik Hendry Gumpil',
    assigned_admin_id: 'usr-admin-tamparuli',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
];

export const INITIAL_SCHOOLS: School[] = [
  {
    id: 'sch-001',
    code: 'XBA4001',
    name: 'SK PEKAN TUARAN',
    category: 'SK',
    address: 'Peti Surat 102, 89208 Tuaran, Sabah',
    postal_code: '89208',
    phone: '088-788100',
    email: 'xba4001@moe.edu.my',
    latitude: 6.13054,
    longitude: 116.23321,
    geofence_radius_meters: 100,
    status: 'ACTIVE',
    location_status: 'VERIFIED',
    zone_id: 'zone-z03',
    zone_name: 'ZON SULAMAN',
    zone_code: 'Z03',
    assigned_pgb_name: 'En. Mohd Khairul bin Abdullah',
    assigned_pgb_id: 'pgb-001',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'sch-002',
    code: 'XEA4040',
    name: 'SMK BADIN',
    category: 'SMK',
    address: 'Peti Surat 455, 89208 Tuaran, Sabah',
    postal_code: '89208',
    phone: '088-788200',
    email: 'xea4040@moe.edu.my',
    latitude: 6.15542,
    longitude: 116.20853,
    geofence_radius_meters: 150,
    status: 'ACTIVE',
    location_status: 'VERIFIED',
    zone_id: 'zone-z02',
    zone_name: 'ZON MENGKABONG',
    zone_code: 'Z02',
    assigned_pgb_name: 'Pn. Sarah binti Othman',
    assigned_pgb_id: 'pgb-002',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'sch-003',
    code: 'XBA4015',
    name: 'SK TENGHILAN',
    category: 'SK',
    address: 'W.D.T 15, 89250 Tamparuli, Sabah',
    postal_code: '89250',
    phone: '088-782300',
    email: 'xba4015@moe.edu.my',
    latitude: 6.21624,
    longitude: 116.34812,
    geofence_radius_meters: 120,
    status: 'ACTIVE',
    location_status: 'VERIFIED',
    zone_id: 'zone-z01',
    zone_name: 'ZON TENGHILAN',
    zone_code: 'Z01',
    assigned_pgb_name: 'En. Justine Jikunan',
    assigned_pgb_id: 'pgb-003',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'sch-004',
    code: 'XBA4022',
    name: 'SK PEKAN TAMPARULI',
    category: 'SK',
    address: 'Peti Surat 12, 89257 Tamparuli, Sabah',
    postal_code: '89257',
    phone: '088-782100',
    email: 'xba4022@moe.edu.my',
    latitude: 6.13681,
    longitude: 116.26543,
    geofence_radius_meters: 100,
    status: 'ACTIVE',
    location_status: 'VERIFIED',
    zone_id: 'zone-z06',
    zone_name: 'ZON TAMPARULI',
    zone_code: 'Z06',
    assigned_pgb_name: 'Pn. Dayang Rosnah binti Awang',
    assigned_pgb_id: 'pgb-004',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'sch-005',
    code: 'XBA4030',
    name: 'SK KIULU',
    category: 'SK',
    address: 'W.D.T 08, 89250 Tamparuli, Sabah',
    postal_code: '89250',
    phone: '088-784100',
    email: 'xba4030@moe.edu.my',
    latitude: 6.05921,
    longitude: 116.29174,
    geofence_radius_meters: 100,
    status: 'ACTIVE',
    location_status: 'VERIFIED',
    zone_id: 'zone-z04',
    zone_name: 'ZON KIULU',
    zone_code: 'Z04',
    assigned_pgb_name: 'En. Richard bin Gampalid',
    assigned_pgb_id: 'pgb-005',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'sch-006',
    code: 'XBA4045',
    name: 'SK NABALU',
    category: 'SK',
    address: 'Peti Surat 32, 89250 Ranau/Tuaran, Sabah',
    postal_code: '89250',
    phone: '088-786100',
    email: 'xba4045@moe.edu.my',
    latitude: 6.01254,
    longitude: 116.42581,
    geofence_radius_meters: 100,
    status: 'ACTIVE',
    location_status: 'VERIFIED',
    zone_id: 'zone-z05',
    zone_name: 'ZON NABALU',
    zone_code: 'Z05',
    assigned_pgb_name: 'Pn. Maria binti Tingalon',
    assigned_pgb_id: 'pgb-006',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'sch-007',
    code: 'XEA4041',
    name: 'SMK SRI NANGKA',
    category: 'SMK',
    address: 'Peti Surat 512, 89208 Tuaran, Sabah',
    postal_code: '89208',
    phone: '088-788500',
    email: 'xea4041@moe.edu.my',
    latitude: 6.16200,
    longitude: 116.21500,
    geofence_radius_meters: 120,
    status: 'ACTIVE',
    location_status: 'VERIFIED',
    zone_id: 'zone-z02',
    zone_name: 'ZON MENGKABONG',
    zone_code: 'Z02',
    assigned_pgb_name: 'En. Ambrose bin Minsu',
    assigned_pgb_id: 'pgb-007',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'sch-008',
    code: 'XBC4001',
    name: 'SJK(C) CHENG HWA',
    category: 'SJKC',
    address: 'Peti Surat 45, 89257 Tamparuli, Sabah',
    postal_code: '89257',
    phone: '088-782400',
    email: 'xbc4001@moe.edu.my',
    latitude: 6.13890,
    longitude: 116.26900,
    geofence_radius_meters: 80,
    status: 'ACTIVE',
    location_status: 'VERIFIED',
    zone_id: 'zone-z06',
    zone_name: 'ZON TAMPARULI',
    zone_code: 'Z06',
    assigned_pgb_name: 'Pn. Lee Su Fong',
    assigned_pgb_id: 'pgb-008',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
];

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-super',
    full_name: 'Haji Wan Mohd Sani bin Wan Jaafar',
    ic_no: '710412125587',
    position: 'Pegawai Pendidikan Daerah / Head Admin',
    email: 'admin.super@ppdtuaran.edu.my',
    phone_number: '019-8812345',
    status: 'ACTIVE',
    role: 'SUPER_ADMIN',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'usr-admin-tenghilan',
    full_name: 'Ustaz Azman bin Harun',
    ic_no: '780615125341',
    position: 'Penolong Pegawai PPD (Sektor Pengurusan Sekolah)',
    email: 'admin.tenghilan@ppdtuaran.edu.my',
    phone_number: '013-8765432',
    status: 'ACTIVE',
    role: 'ADMIN_ZON',
    assigned_zone_ids: ['zone-z01', 'zone-z02'], // Tenghilan & Mengkabong
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'usr-admin-kiulu',
    full_name: 'Encik Roger Majalap',
    ic_no: '760920126123',
    position: 'Penolong Pegawai PPD (Sektor Perancangan)',
    email: 'admin.kiulu@ppdtuaran.edu.my',
    phone_number: '014-5566778',
    status: 'ACTIVE',
    role: 'ADMIN_ZON',
    assigned_zone_ids: ['zone-z04', 'zone-z05'], // Kiulu & Nabalu
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'usr-admin-sulaman',
    full_name: 'Puan Siti Rahmah binti Salleh',
    ic_no: '820310125442',
    position: 'Penolong Pegawai PPD (Sektor Pembelajaran)',
    email: 'admin.sulaman@ppdtuaran.edu.my',
    phone_number: '012-3456789',
    status: 'ACTIVE',
    role: 'ADMIN_ZON',
    assigned_zone_ids: ['zone-z03'], // Sulaman
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'usr-admin-monitoring',
    full_name: 'Encik Rosli bin Mansor',
    ic_no: '831122125789',
    position: 'Pegawai Pemantau Integriti PPD',
    email: 'admin.monitoring@ppdtuaran.edu.my',
    phone_number: '011-2345678',
    status: 'ACTIVE',
    role: 'MONITORING_ADMIN',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  // PGB Users (To verify that PGB accounts cannot log in to Admin Portal)
  {
    id: 'pgb-001',
    full_name: 'En. Mohd Khairul bin Abdullah',
    ic_no: '750214125541',
    position: 'Guru Besar Cemerlang DG48',
    email: 'khairul.abdullah@moe.gov.my',
    phone_number: '019-8765432',
    status: 'ACTIVE',
    role: 'PGB',
    assigned_school_id: 'sch-001',
    school_name: 'SK PEKAN TUARAN',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'pgb-002',
    full_name: 'Pn. Sarah binti Othman',
    ic_no: '800823126652',
    position: 'Pengetua DG52',
    email: 'sarah.othman@moe.gov.my',
    phone_number: '013-4567890',
    status: 'ACTIVE',
    role: 'PGB',
    assigned_school_id: 'sch-002',
    school_name: 'SMK BADIN',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
];

export const INITIAL_APPROVER_ASSIGNMENTS: MonthlyApproverAssignment[] = [
  {
    id: 'app-001',
    month: 11,
    year: 2026,
    school_id: 'sch-001',
    school_name: 'SK PEKAN TUARAN',
    school_code: 'XBA4001',
    zone_id: 'zone-z03',
    zone_name: 'ZON SULAMAN',
    assigned_admin_id: 'usr-admin-sulaman',
    assigned_admin_name: 'Puan Siti Rahmah binti Salleh',
    assigned_admin_email: 'admin.sulaman@ppdtuaran.edu.my',
    assigned_by: 'usr-super',
    assigned_at: '2026-11-01T08:00:00Z',
    is_primary: true,
    status: 'ACTIVE',
    notes: 'Penetapan rasmi Bulan November 2026',
  },
  {
    id: 'app-002',
    month: 11,
    year: 2026,
    school_id: 'sch-002',
    school_name: 'SMK BADIN',
    school_code: 'XEA4040',
    zone_id: 'zone-z02',
    zone_name: 'ZON MENGKABONG',
    assigned_admin_id: 'usr-admin-tenghilan',
    assigned_admin_name: 'Ustaz Azman bin Harun',
    assigned_admin_email: 'admin.tenghilan@ppdtuaran.edu.my',
    assigned_by: 'usr-super',
    assigned_at: '2026-11-01T08:00:00Z',
    is_primary: true,
    status: 'ACTIVE',
    notes: 'Penetapan rasmi Bulan November 2026',
  },
  {
    id: 'app-003',
    month: 11,
    year: 2026,
    school_id: 'sch-003',
    school_name: 'SK TENGHILAN',
    school_code: 'XBA4015',
    zone_id: 'zone-z01',
    zone_name: 'ZON TENGHILAN',
    assigned_admin_id: 'usr-admin-tenghilan',
    assigned_admin_name: 'Ustaz Azman bin Harun',
    assigned_admin_email: 'admin.tenghilan@ppdtuaran.edu.my',
    assigned_by: 'usr-super',
    assigned_at: '2026-11-01T08:00:00Z',
    is_primary: true,
    status: 'ACTIVE',
  },
  {
    id: 'app-004',
    month: 11,
    year: 2026,
    school_id: 'sch-005',
    school_name: 'SK KIULU',
    school_code: 'XBA4030',
    zone_id: 'zone-z04',
    zone_name: 'ZON KIULU',
    assigned_admin_id: 'usr-admin-kiulu',
    assigned_admin_name: 'Encik Roger Majalap',
    assigned_admin_email: 'admin.kiulu@ppdtuaran.edu.my',
    assigned_by: 'usr-super',
    assigned_at: '2026-11-01T08:00:00Z',
    is_primary: true,
    status: 'ACTIVE',
  },
];

export const INITIAL_MONTHLY_RECORDS: MonthlyAttendanceRecord[] = [
  {
    id: 'm-att-001',
    user_id: 'pgb-001',
    pgb_name: 'En. Mohd Khairul bin Abdullah',
    school_id: 'sch-001',
    school_name: 'SK PEKAN TUARAN',
    school_code: 'XBA4001',
    zone_id: 'zone-z03',
    zone_name: 'ZON SULAMAN',
    month: 10,
    year: 2026,
    total_working_days: 22,
    present_days: 22,
    late_days: 1,
    incomplete_days: 0,
    justified_days: 1,
    total_hours_rendered: 198.5,
    status: 'MENUNGGU_SEMAKAN',
    assigned_approver_id: 'usr-admin-sulaman',
    assigned_approver_name: 'Puan Siti Rahmah binti Salleh',
    generated_at: '2026-11-01T00:05:00Z',
    submitted_at: '2026-11-02T09:15:00Z',
  },
  {
    id: 'm-att-002',
    user_id: 'pgb-002',
    pgb_name: 'Pn. Sarah binti Othman',
    school_id: 'sch-002',
    school_name: 'SMK BADIN',
    school_code: 'XEA4040',
    zone_id: 'zone-z02',
    zone_name: 'ZON MENGKABONG',
    month: 10,
    year: 2026,
    total_working_days: 22,
    present_days: 21,
    late_days: 2,
    incomplete_days: 1,
    justified_days: 2,
    total_hours_rendered: 191.0,
    status: 'DALAM_SEMAKAN',
    assigned_approver_id: 'usr-admin-tenghilan',
    assigned_approver_name: 'Ustaz Azman bin Harun',
    generated_at: '2026-11-01T00:05:00Z',
    submitted_at: '2026-11-02T10:30:00Z',
  },
  {
    id: 'm-att-003',
    user_id: 'pgb-003',
    pgb_name: 'En. Justine Jikunan',
    school_id: 'sch-003',
    school_name: 'SK TENGHILAN',
    school_code: 'XBA4015',
    zone_id: 'zone-z01',
    zone_name: 'ZON TENGHILAN',
    month: 10,
    year: 2026,
    total_working_days: 22,
    present_days: 22,
    late_days: 0,
    incomplete_days: 0,
    justified_days: 0,
    total_hours_rendered: 202.0,
    status: 'DISAHKAN',
    assigned_approver_id: 'usr-admin-tenghilan',
    assigned_approver_name: 'Ustaz Azman bin Harun',
    generated_at: '2026-11-01T00:05:00Z',
    submitted_at: '2026-11-01T14:20:00Z',
  },
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-001',
    recipient_role: 'SUPER_ADMIN',
    title: 'Penetapan Pengesah Belum Selesai',
    message: 'Terdapat 4 buah sekolah di Zon Nabalu & Tamparuli belum mempunyai Pegawai Pengesah bagi Bulan November 2026.',
    category: 'UNASSIGNED_SCHOOL',
    link: '/admin/approver-assignments',
    is_read: false,
    created_at: '2026-11-11T08:30:00Z',
  },
  {
    id: 'notif-002',
    recipient_role: 'ADMIN_ZON',
    title: 'Penyerahan Kehadiran Bulanan Baharu',
    message: 'Pengetua SMK Badin telah menghantar rekod kehadiran Bulan Oktober 2026 untuk semakan dan pengesahan.',
    category: 'MONTHLY_SUBMISSION',
    link: '/admin/monthly-verification',
    is_read: false,
    created_at: '2026-11-10T11:20:00Z',
  },
  {
    id: 'notif-003',
    recipient_role: 'SUPER_ADMIN',
    title: 'Permohonan Pendaftaran Peranti Baharu',
    message: 'Guru Besar SK Kiulu telah memohon kebenaran pertukaran peranti rasmi (Samsung Galaxy Tab S9).',
    category: 'DEVICE_REQUEST',
    link: '/admin/users',
    is_read: false,
    created_at: '2026-11-09T14:45:00Z',
  },
];

export const INITIAL_WORK_SCHEDULE: WorkSchedule = {
  id: 'ws-001',
  name: 'Jadual Rasmi Pentadbir PGB (9 Jam)',
  target_work_minutes: 540,
  official_clock_in_time: '07:30',
  late_tolerance_minutes: 15,
  count_break_time_in_hours: false,
  is_active: true,
};

export const INITIAL_HOLIDAYS: HolidayCalendarItem[] = [
  {
    id: 'hol-001',
    holiday_date: '2026-01-01',
    name: 'Tahun Baharu',
    type: 'NATIONAL',
    applies_to_pgb: true,
    year: 2026,
    description: 'Cuti Umum Persekutuan',
  },
  {
    id: 'hol-002',
    holiday_date: '2026-05-30',
    name: 'Pesta Kaamatan (Hari Pertama)',
    type: 'STATE_SABAH',
    applies_to_pgb: true,
    year: 2026,
    description: 'Cuti Umum Negeri Sabah',
  },
  {
    id: 'hol-003',
    holiday_date: '2026-05-31',
    name: 'Pesta Kaamatan (Hari Kedua)',
    type: 'STATE_SABAH',
    applies_to_pgb: true,
    year: 2026,
    description: 'Cuti Umum Negeri Sabah',
  },
  {
    id: 'hol-004',
    holiday_date: '2026-09-16',
    name: 'Hari Malaysia',
    type: 'NATIONAL',
    applies_to_pgb: true,
    year: 2026,
    description: 'Hari Pembentukan Malaysia',
  },
];

// ========================================================================
// STORAGE HELPER
// ========================================================================

function loadFromStorage<T>(key: string, defaultData: T): T {
  try {
    const item = localStorage.getItem(`ehadir_${key}`);
    return item ? JSON.parse(item) : defaultData;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return defaultData;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`ehadir_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
}

// ========================================================================
// REPOSITORY LAYER (DATABASE SERVICE)
// ========================================================================

export const dbService = {
  // --- ZONES ---
  getZones(): Zone[] {
    let zones = loadFromStorage<Zone[]>('zones', INITIAL_ZONES);

    // Auto-migrate Z06 from old red #DC2626 to emerald green #059669 if needed
    let hasUpdatedColor = false;
    zones = zones.map((z) => {
      if (z.code === 'Z06' && z.color_hex.toLowerCase() === '#dc2626') {
        hasUpdatedColor = true;
        return { ...z, color_hex: '#059669' };
      }
      return z;
    });
    if (hasUpdatedColor) {
      saveToStorage('zones', zones);
    }

    const schools = this.getSchools();
    const users = this.getUsers();

    // Recalculate dynamic counts
    return zones.map((z) => {
      const zoneSchools = schools.filter((s) => s.zone_id === z.id && s.status === 'ACTIVE');
      const schoolIds = new Set(zoneSchools.map((s) => s.id));
      const pgbCount = users.filter(
        (u) => u.role === 'PGB' && u.assigned_school_id && schoolIds.has(u.assigned_school_id)
      ).length;

      return {
        ...z,
        total_schools: zoneSchools.length,
        total_pgb: pgbCount,
      };
    });
  },

  createZone(data: Omit<Zone, 'id' | 'created_at' | 'updated_at'>, actor: UserProfile): Zone {
    const zones = this.getZones();
    const newZone: Zone = {
      ...data,
      id: `zone-${data.code.toLowerCase()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updated = [...zones, newZone];
    saveToStorage('zones', updated);

    logAuditEvent({
      actor_name: actor.full_name,
      actor_role: actor.role,
      actor_id: actor.id,
      action: 'CIPTA_ZON',
      entity: 'ZON',
      record_id: newZone.id,
      new_values: newZone,
      remarks: `Mencipta zon pentadbiran baharu: ${newZone.name} (${newZone.code})`,
    });

    return newZone;
  },

  updateZone(id: string, updates: Partial<Zone>, actor: UserProfile): Zone {
    const zones = this.getZones();
    const index = zones.findIndex((z) => z.id === id);
    if (index === -1) throw new Error('Zon tidak dijumpai');

    const oldZone = zones[index];
    const updatedZone: Zone = {
      ...oldZone,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    zones[index] = updatedZone;
    saveToStorage('zones', zones);

    logAuditEvent({
      actor_name: actor.full_name,
      actor_role: actor.role,
      actor_id: actor.id,
      action: 'KEMASKINI_ZON',
      entity: 'ZON',
      record_id: id,
      old_values: oldZone,
      new_values: updatedZone,
      remarks: `Mengemas kini maklumat zon: ${updatedZone.name}`,
    });

    return updatedZone;
  },

  toggleZoneStatus(id: string, actor: UserProfile): Zone {
    const zones = this.getZones();
    const zone = zones.find((z) => z.id === id);
    if (!zone) throw new Error('Zon tidak dijumpai');
    return this.updateZone(id, { is_active: !zone.is_active }, actor);
  },

  // --- SCHOOLS ---
  getSchools(): School[] {
    return loadFromStorage<School[]>('schools', INITIAL_SCHOOLS);
  },

  getSchoolById(id: string): School | undefined {
    return this.getSchools().find((s) => s.id === id);
  },

  createSchool(data: Omit<School, 'id' | 'created_at' | 'updated_at'>, actor: UserProfile): School {
    const schools = this.getSchools();
    if (schools.some((s) => s.code.toUpperCase() === data.code.toUpperCase())) {
      throw new Error(`Kod sekolah ${data.code} sudah wujud dalam sistem!`);
    }

    const newSchool: School = {
      ...data,
      id: `sch-${Date.now().toString(36)}`,
      code: data.code.toUpperCase(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updated = [newSchool, ...schools];
    saveToStorage('schools', updated);

    logAuditEvent({
      actor_name: actor.full_name,
      actor_role: actor.role,
      actor_id: actor.id,
      action: 'CIPTA_SEKOLAH',
      entity: 'SEKOLAH',
      record_id: newSchool.id,
      new_values: newSchool,
      remarks: `Mendaftar sekolah baharu: ${newSchool.name} (${newSchool.code})`,
    });

    return newSchool;
  },

  updateSchool(id: string, updates: Partial<School>, actor: UserProfile): School {
    const schools = this.getSchools();
    const index = schools.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Sekolah tidak dijumpai');

    const oldSchool = schools[index];
    const updatedSchool: School = {
      ...oldSchool,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    schools[index] = updatedSchool;
    saveToStorage('schools', schools);

    logAuditEvent({
      actor_name: actor.full_name,
      actor_role: actor.role,
      actor_id: actor.id,
      action: 'KEMASKINI_SEKOLAH',
      entity: 'SEKOLAH',
      record_id: id,
      old_values: oldSchool,
      new_values: updatedSchool,
      remarks: `Mengemas kini maklumat sekolah: ${updatedSchool.name} (${updatedSchool.code})`,
    });

    return updatedSchool;
  },

  deleteSchool(id: string, actor: UserProfile): { success: boolean; deactivated: boolean; message: string } {
    const schools = this.getSchools();
    const school = schools.find((s) => s.id === id);
    if (!school) throw new Error('Sekolah tidak dijumpai');

    // Check if school has operational records (attendance or approver assignments)
    const monthlyRecords = this.getMonthlyRecords();
    const hasRecords = monthlyRecords.some((m) => m.school_id === id);

    if (hasRecords) {
      // Soft deactivate instead of hard delete
      this.updateSchool(id, { status: 'INACTIVE' }, actor);
      return {
        success: true,
        deactivated: true,
        message: `Sekolah ${school.name} mempunyai rekod kehadiran bersejarah. Status ditukar kepada TIDAK AKTIF bagi memelihara integriti data.`,
      };
    } else {
      const remaining = schools.filter((s) => s.id !== id);
      saveToStorage('schools', remaining);

      logAuditEvent({
        actor_name: actor.full_name,
        actor_role: actor.role,
        actor_id: actor.id,
        action: 'PADAM_SEKOLAH',
        entity: 'SEKOLAH',
        record_id: id,
        old_values: school,
        remarks: `Memadam rekod sekolah: ${school.name} (${school.code})`,
      });

      return {
        success: true,
        deactivated: false,
        message: `Rekod sekolah ${school.name} berjaya dipadam.`,
      };
    }
  },

  importSchools(importedData: any[], actor: UserProfile): { added: number; updated: number; errors: string[] } {
    let added = 0;
    let updated = 0;
    const errors: string[] = [];
    const zones = this.getZones();
    const existing = this.getSchools();

    importedData.forEach((row, index) => {
      try {
        const code = (row.Kod_Sekolah || row.code || '').toString().trim().toUpperCase();
        const name = (row.Nama_Sekolah || row.name || '').toString().trim();
        const category = (row.Kategori || row.category || 'SK').toString().trim().toUpperCase();
        const zoneCode = (row.Kod_Zon || row.zone_code || '').toString().trim().toUpperCase();
        const radius = parseInt(row.Radius_Geofence_Meter || row.radius || '100', 10);
        const lat = parseFloat(row.Latitud || row.latitude || '6.1340');
        const lng = parseFloat(row.Longitud || row.longitude || '116.2300');

        if (!code || !name) {
          errors.push(`Baris ${index + 1}: Kod atau nama sekolah kosong.`);
          return;
        }

        const matchedZone = zones.find((z) => z.code.toUpperCase() === zoneCode);

        const existingIdx = existing.findIndex((s) => s.code === code);
        if (existingIdx !== -1) {
          existing[existingIdx] = {
            ...existing[existingIdx],
            name,
            category: category as any,
            zone_id: matchedZone?.id || existing[existingIdx].zone_id,
            zone_name: matchedZone?.name || existing[existingIdx].zone_name,
            zone_code: matchedZone?.code || existing[existingIdx].zone_code,
            latitude: isNaN(lat) ? existing[existingIdx].latitude : lat,
            longitude: isNaN(lng) ? existing[existingIdx].longitude : lng,
            geofence_radius_meters: isNaN(radius) ? existing[existingIdx].geofence_radius_meters : radius,
            updated_at: new Date().toISOString(),
          };
          updated++;
        } else {
          existing.push({
            id: `sch-imp-${Date.now()}-${index}`,
            code,
            name,
            category: category as any,
            address: row.Alamat || '',
            postal_code: row.Poskod || '89208',
            phone: row.Telefon || '',
            email: row.Emel || '',
            latitude: isNaN(lat) ? 6.134 : lat,
            longitude: isNaN(lng) ? 116.23 : lng,
            geofence_radius_meters: isNaN(radius) ? 100 : Math.min(500, Math.max(50, radius)),
            status: 'ACTIVE',
            location_status: 'VERIFIED',
            zone_id: matchedZone?.id,
            zone_name: matchedZone?.name,
            zone_code: matchedZone?.code,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          added++;
        }
      } catch (err: any) {
        errors.push(`Baris ${index + 1}: ${err.message}`);
      }
    });

    saveToStorage('schools', existing);

    logAuditEvent({
      actor_name: actor.full_name,
      actor_role: actor.role,
      actor_id: actor.id,
      action: 'IMPORT_SEKOLAH',
      entity: 'SEKOLAH',
      remarks: `Import sekolah selesai: ${added} baharu, ${updated} dikemaskini. ${errors.length} ralat.`,
    });

    return { added, updated, errors };
  },

  // --- USERS / PGB ---
  getUsers(): UserProfile[] {
    return loadFromStorage<UserProfile[]>('users', INITIAL_USERS);
  },

  createUser(data: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>, actor: UserProfile): UserProfile {
    const users = this.getUsers();
    if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      throw new Error(`Emel ${data.email} sudah didaftarkan!`);
    }

    const newUser: UserProfile = {
      ...data,
      id: `usr-${Date.now().toString(36)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updated = [newUser, ...users];
    saveToStorage('users', updated);

    logAuditEvent({
      actor_name: actor.full_name,
      actor_role: actor.role,
      actor_id: actor.id,
      action: 'CIPTA_PENGGUNA',
      entity: 'PENGGUNA',
      record_id: newUser.id,
      new_values: newUser,
      remarks: `Mendaftar pengguna baharu: ${newUser.full_name} (${newUser.role})`,
    });

    return newUser;
  },

  updateUser(id: string, updates: Partial<UserProfile>, actor: UserProfile): UserProfile {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) throw new Error('Pengguna tidak dijumpai');

    const oldUser = users[index];
    const updatedUser: UserProfile = {
      ...oldUser,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    users[index] = updatedUser;
    saveToStorage('users', users);

    logAuditEvent({
      actor_name: actor.full_name,
      actor_role: actor.role,
      actor_id: actor.id,
      action: 'KEMASKINI_PENGGUNA',
      entity: 'PENGGUNA',
      record_id: id,
      old_values: oldUser,
      new_values: updatedUser,
      remarks: `Mengemas kini profil pengguna: ${updatedUser.full_name}`,
    });

    return updatedUser;
  },

  // --- MONTHLY APPROVER ASSIGNMENTS ---
  getApproverAssignments(month?: number, year?: number): MonthlyApproverAssignment[] {
    const assignments = loadFromStorage<MonthlyApproverAssignment[]>('approver_assignments', INITIAL_APPROVER_ASSIGNMENTS);
    if (month && year) {
      return assignments.filter((a) => a.month === month && a.year === year && a.status === 'ACTIVE');
    }
    return assignments;
  },

  assignMonthlyApprover(
    params: {
      month: number;
      year: number;
      school_id: string;
      admin_id: string;
      notes?: string;
    },
    actor: UserProfile
  ): MonthlyApproverAssignment {
    const assignments = loadFromStorage<MonthlyApproverAssignment[]>('approver_assignments', INITIAL_APPROVER_ASSIGNMENTS);
    const schools = this.getSchools();
    const users = this.getUsers();

    const school = schools.find((s) => s.id === params.school_id);
    if (!school) throw new Error('Sekolah tidak sah');

    const admin = users.find((u) => u.id === params.admin_id);
    if (!admin) throw new Error('Pegawai Admin tidak sah');

    // Deactivate previous active assignment for this school and period to preserve history without conflict
    const updatedAssignments = assignments.map((a) => {
      if (a.school_id === params.school_id && a.month === params.month && a.year === params.year && a.status === 'ACTIVE') {
        return { ...a, status: 'REASSIGNED' as const, is_primary: false };
      }
      return a;
    });

    const newAssignment: MonthlyApproverAssignment = {
      id: `app-asg-${Date.now().toString(36)}`,
      month: params.month,
      year: params.year,
      school_id: school.id,
      school_name: school.name,
      school_code: school.code,
      zone_id: school.zone_id || '',
      zone_name: school.zone_name || 'Tanpa Zon',
      assigned_admin_id: admin.id,
      assigned_admin_name: admin.full_name,
      assigned_admin_email: admin.email,
      assigned_by: actor.id,
      assigned_at: new Date().toISOString(),
      is_primary: true,
      status: 'ACTIVE',
      notes: params.notes,
    };

    updatedAssignments.push(newAssignment);
    saveToStorage('approver_assignments', updatedAssignments);

    logAuditEvent({
      actor_name: actor.full_name,
      actor_role: actor.role,
      actor_id: actor.id,
      action: 'PENETAPAN_PENGESAH_BULANAN',
      entity: 'PENGESAH_BULANAN',
      record_id: newAssignment.id,
      new_values: newAssignment,
      remarks: `Menetapkan ${admin.full_name} sebagai Pegawai Pengesah bagi ${school.name} (${params.month}/${params.year})`,
    });

    // Notify assigned admin
    this.addNotification({
      recipient_id: admin.id,
      recipient_role: admin.role,
      title: 'Tugasan Pengesah Bulanan Baharu',
      message: `Anda telah ditetapkan sebagai Pegawai Pengesah Kehadiran untuk ${school.name} bagi Bulan ${params.month}/${params.year}.`,
      category: 'PENDING_VERIFICATION',
      link: '/admin/monthly-verification',
    });

    return newAssignment;
  },

  // --- ATTENDANCE MONITORING ---
  getAttendanceRecords(filter?: {
    date?: string;
    zone_id?: string;
    school_id?: string;
    user_id?: string;
  }): AttendanceRecord[] {
    const records = loadFromStorage<AttendanceRecord[]>('attendance_records', [
      {
        id: 'att-001',
        user_id: 'pgb-001',
        pgb_name: 'En. Mohd Khairul bin Abdullah',
        school_id: 'sch-001',
        school_name: 'SK PEKAN TUARAN',
        zone_id: 'zone-z03',
        zone_name: 'ZON SULAMAN',
        date: '2026-11-11',
        clock_in_time: '2026-11-11T07:22:10Z',
        clock_out_time: '2026-11-11T16:35:40Z',
        total_working_minutes: 553,
        late_minutes: 0,
        status: 'LENGKAP',
        face_verified: true,
        gps_validated: true,
        clock_in_location: 'SK Pekan Tuaran (Dalam Radius 24m)',
        clock_out_location: 'SK Pekan Tuaran (Dalam Radius 18m)',
        is_verified: true,
        created_at: '2026-11-11T07:22:10Z',
      },
      {
        id: 'att-002',
        user_id: 'pgb-002',
        pgb_name: 'Pn. Sarah binti Othman',
        school_id: 'sch-002',
        school_name: 'SMK BADIN',
        zone_id: 'zone-z02',
        zone_name: 'ZON MENGKABONG',
        date: '2026-11-11',
        clock_in_time: '2026-11-11T07:48:30Z',
        total_working_minutes: 360,
        late_minutes: 18,
        status: 'LEWAT',
        face_verified: true,
        gps_validated: true,
        clock_in_location: 'SMK Badin (Dalam Radius 45m)',
        has_justification: true,
        justification_status: 'MENUNGGU_SEMAKAN',
        is_verified: false,
        created_at: '2026-11-11T07:48:30Z',
      },
      {
        id: 'att-003',
        user_id: 'pgb-003',
        pgb_name: 'En. Justine Jikunan',
        school_id: 'sch-003',
        school_name: 'SK TENGHILAN',
        zone_id: 'zone-z01',
        zone_name: 'ZON TENGHILAN',
        date: '2026-11-11',
        clock_in_time: '2026-11-11T07:15:00Z',
        total_working_minutes: 420,
        late_minutes: 0,
        status: 'LENGKAP',
        face_verified: true,
        gps_validated: true,
        clock_in_location: 'SK Tenghilan (Dalam Radius 30m)',
        is_verified: false,
        created_at: '2026-11-11T07:15:00Z',
      },
      {
        id: 'att-004',
        user_id: 'pgb-005',
        pgb_name: 'En. Richard bin Gampalid',
        school_id: 'sch-005',
        school_name: 'SK KIULU',
        zone_id: 'zone-z04',
        zone_name: 'ZON KIULU',
        date: '2026-11-11',
        total_working_minutes: 0,
        late_minutes: 0,
        status: 'TIDAK_LENGKAP',
        face_verified: false,
        gps_validated: false,
        has_justification: true,
        justification_status: 'MENUNGGU_SEMAKAN',
        is_verified: false,
        created_at: '2026-11-11T08:00:00Z',
      },
    ]);

    if (!filter) return records;

    return records.filter((r) => {
      if (filter.date && r.date !== filter.date) return false;
      if (filter.zone_id && r.zone_id !== filter.zone_id) return false;
      if (filter.school_id && r.school_id !== filter.school_id) return false;
      if (filter.user_id && r.user_id !== filter.user_id) return false;
      return true;
    });
  },

  // --- MONTHLY VERIFICATION ---
  getMonthlyRecords(): MonthlyAttendanceRecord[] {
    return loadFromStorage<MonthlyAttendanceRecord[]>('monthly_records', INITIAL_MONTHLY_RECORDS);
  },

  verifyMonthlySubmission(
    id: string,
    action: 'DISAHKAN' | 'DIKEMBALIKAN' | 'DITOLAK',
    remarks: string,
    actor: UserProfile
  ): MonthlyAttendanceRecord {
    const records = this.getMonthlyRecords();
    const index = records.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Rekod bulanan tidak dijumpai');

    const oldRecord = records[index];
    const updatedRecord: MonthlyAttendanceRecord = {
      ...oldRecord,
      status: action,
    };

    records[index] = updatedRecord;
    saveToStorage('monthly_records', records);

    logAuditEvent({
      actor_name: actor.full_name,
      actor_role: actor.role,
      actor_id: actor.id,
      action: `PENGESAHAN_BULANAN_${action}`,
      entity: 'PENGESAHAN_BULANAN',
      record_id: id,
      old_values: oldRecord,
      new_values: updatedRecord,
      remarks: `Tindakan: ${action}. Catatan: ${remarks || 'Tiada catatan'}`,
    });

    return updatedRecord;
  },

  // --- NOTIFICATIONS ---
  getNotifications(role?: UserRoleType, recipientId?: string): AppNotification[] {
    const list = loadFromStorage<AppNotification[]>('notifications', INITIAL_NOTIFICATIONS);
    if (!role && !recipientId) return list;
    return list.filter((n) => {
      if (recipientId && n.recipient_id === recipientId) return true;
      if (role && (n.recipient_role === role || !n.recipient_role)) return true;
      return false;
    });
  },

  addNotification(data: Omit<AppNotification, 'id' | 'is_read' | 'created_at'>): AppNotification {
    const list = this.getNotifications();
    const newNotif: AppNotification = {
      ...data,
      id: `notif-${Date.now().toString(36)}`,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    saveToStorage('notifications', [newNotif, ...list]);
    return newNotif;
  },

  markNotificationAsRead(id: string): void {
    const list = this.getNotifications();
    const updated = list.map((n) => (n.id === id ? { ...n, is_read: true } : n));
    saveToStorage('notifications', updated);
  },

  markAllNotificationsAsRead(): void {
    const list = this.getNotifications();
    const updated = list.map((n) => ({ ...n, is_read: true }));
    saveToStorage('notifications', updated);
  },

  // --- WORK SCHEDULE & RULES ---
  getWorkSchedule(): WorkSchedule {
    return loadFromStorage<WorkSchedule>('work_schedule', INITIAL_WORK_SCHEDULE);
  },

  updateWorkSchedule(updates: Partial<WorkSchedule>, actor: UserProfile): WorkSchedule {
    const current = this.getWorkSchedule();
    const updated = { ...current, ...updates };
    saveToStorage('work_schedule', updated);

    logAuditEvent({
      actor_name: actor.full_name,
      actor_role: actor.role,
      actor_id: actor.id,
      action: 'KEMASKINI_PERATURAN_JADUAL',
      entity: 'JADUAL_KERJA',
      old_values: current,
      new_values: updated,
      remarks: 'Mengemas kini konfigurasi jadual kerja dan sasaran jam bertugas.',
    });

    return updated;
  },

  // --- HOLIDAYS ---
  getHolidays(): HolidayCalendarItem[] {
    return loadFromStorage<HolidayCalendarItem[]>('holidays', INITIAL_HOLIDAYS);
  },

  addHoliday(item: Omit<HolidayCalendarItem, 'id'>, actor: UserProfile): HolidayCalendarItem {
    const list = this.getHolidays();
    const newItem: HolidayCalendarItem = {
      ...item,
      id: `hol-${Date.now().toString(36)}`,
    };
    saveToStorage('holidays', [...list, newItem]);

    logAuditEvent({
      actor_name: actor.full_name,
      actor_role: actor.role,
      actor_id: actor.id,
      action: 'TAMBAH_CUTI',
      entity: 'KALENDAR_CUTI',
      new_values: newItem,
      remarks: `Menambah cuti: ${newItem.name} (${newItem.holiday_date})`,
    });

    return newItem;
  },

  deleteHoliday(id: string, actor: UserProfile): void {
    const list = this.getHolidays();
    const item = list.find((h) => h.id === id);
    const updated = list.filter((h) => h.id !== id);
    saveToStorage('holidays', updated);

    if (item) {
      logAuditEvent({
        actor_name: actor.full_name,
        actor_role: actor.role,
        actor_id: actor.id,
        action: 'PADAM_CUTI',
        entity: 'KALENDAR_CUTI',
        old_values: item,
        remarks: `Memadam cuti: ${item.name} (${item.holiday_date})`,
      });
    }
  },

  // --- DASHBOARD METRICS ---
  getDashboardStats(zoneId?: string): DashboardStats {
    const schools = this.getSchools().filter((s) => s.status === 'ACTIVE');
    const filteredSchools = zoneId ? schools.filter((s) => s.zone_id === zoneId) : schools;
    const schoolIds = new Set(filteredSchools.map((s) => s.id));

    const allUsers = this.getUsers().filter((u) => u.status === 'ACTIVE' && u.role === 'PGB');
    const filteredUsers = zoneId
      ? allUsers.filter((u) => u.assigned_school_id && schoolIds.has(u.assigned_school_id))
      : allUsers;

    const todayRecords = this.getAttendanceRecords({ date: '2026-11-11' }).filter((r) =>
      zoneId ? r.zone_id === zoneId : true
    );

    const monthlyRecords = this.getMonthlyRecords().filter((m) =>
      zoneId ? m.zone_id === zoneId : true
    );

    const assignments = this.getApproverAssignments(11, 2026);
    const assignedSchoolIds = new Set(assignments.map((a) => a.school_id));
    const unassignedCount = filteredSchools.filter((s) => !assignedSchoolIds.has(s.id)).length;

    const presentCount = todayRecords.filter((r) => r.status === 'LENGKAP' || r.status === 'LEWAT').length;
    const totalPgb = filteredUsers.length || 1;
    const percentage = Math.round((presentCount / totalPgb) * 100);

    return {
      totalSchools: filteredSchools.length,
      totalPgb: filteredUsers.length,
      attendanceTodayCount: presentCount,
      attendanceTodayPercentage: Math.min(100, percentage),
      notClockedInCount: Math.max(0, filteredUsers.length - todayRecords.length),
      lateTodayCount: todayRecords.filter((r) => r.status === 'LEWAT').length,
      incompleteRecordsCount: todayRecords.filter((r) => r.status === 'TIDAK_LENGKAP').length,
      pendingJustificationsCount: todayRecords.filter((r) => r.has_justification && r.justification_status === 'MENUNGGU_SEMAKAN').length,
      pendingMonthlyVerificationCount: monthlyRecords.filter((m) => m.status === 'MENUNGGU_SEMAKAN' || m.status === 'DALAM_SEMAKAN').length,
      unassignedApproverCount: unassignedCount,
    };
  },
};

