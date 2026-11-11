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
  PpdOfficeLocation,
  DeviceRegistryItem,
} from '@/types';
import { logAuditEvent } from './audit';
import { supabase, isSupabaseConfigured } from './supabase';

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

export const INITIAL_USERS: UserProfile[] = [];

export const INITIAL_DEVICE_REGISTRY: DeviceRegistryItem[] = [];

export const INITIAL_APPROVER_ASSIGNMENTS: MonthlyApproverAssignment[] = [];

export const INITIAL_MONTHLY_RECORDS: MonthlyAttendanceRecord[] = [];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [];

export const INITIAL_WORK_SCHEDULE: WorkSchedule = {
  id: 'ws-001',
  name: 'Jadual Bertugas Fleksi PGB (Wajib Cukup 9 Jam)',
  target_work_minutes: 540,
  official_clock_in_time: 'Tiada Had (Fleksi)',
  late_tolerance_minutes: 0,
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

export const INITIAL_JUSTIFICATIONS: Justification[] = [];

// ========================================================================
// STORAGE HELPER
// ========================================================================

function loadFromStorage<T>(key: string, defaultData: T): T {
  try {
    // Purge legacy demo seed data from browser localStorage on first run
    const purgeFlag = 'ehadir_purge_v6_clean';
    if (!localStorage.getItem(purgeFlag)) {
      const rawUsers = localStorage.getItem('ehadir_users');
      if (rawUsers) {
        try {
          const parsed = JSON.parse(rawUsers);
          if (Array.isArray(parsed)) {
            const superAdmins = parsed.filter(
              (u: any) => u.role === 'SUPER_ADMIN' && u.email !== 'probe@test.com'
            );
            localStorage.setItem('ehadir_users', JSON.stringify(superAdmins));
          } else {
            localStorage.removeItem('ehadir_users');
          }
        } catch {
          localStorage.removeItem('ehadir_users');
        }
      } else {
        localStorage.removeItem('ehadir_users');
      }
      localStorage.removeItem('ehadir_attendance_records');
      localStorage.removeItem('ehadir_justifications');
      localStorage.removeItem('ehadir_monthly_records');
      localStorage.removeItem('ehadir_approver_assignments');
      localStorage.removeItem('ehadir_notifications');
      localStorage.removeItem('ehadir_device_registry');
      localStorage.setItem(purgeFlag, 'true');
    }

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
    const list = loadFromStorage<UserProfile[]>('users', INITIAL_USERS);
    const demoEmails = [
      'admin.tenghilan@ppdtuaran.edu.my',
      'admin.kiulu@ppdtuaran.edu.my',
      'admin.sulaman@ppdtuaran.edu.my',
      'admin.monitoring@ppdtuaran.edu.my',
      'probe@test.com',
    ];
    return list.filter((u) => !demoEmails.includes(u.email.toLowerCase()));
  },

  saveUser(userToSave: UserProfile): void {
    const users = this.getUsers();
    const existingIndex = users.findIndex(
      (u) => u.id === userToSave.id || u.email.toLowerCase() === userToSave.email.toLowerCase()
    );
    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...userToSave };
    } else {
      users.unshift(userToSave);
    }
    saveToStorage('users', users);
  },

  async syncUsersFromSupabase(): Promise<UserProfile[]> {
    if (!isSupabaseConfigured) return this.getUsers();
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (data && !error && data.length > 0) {
        const current = this.getUsers();
        const mergedMap = new Map<string, UserProfile>();
        current.forEach((u) => mergedMap.set(u.id, u));

        data.forEach((p: any) => {
          mergedMap.set(p.id, {
            id: p.id,
            full_name: p.full_name || 'Pentadbir',
            ic_no: p.ic_no || '',
            position: p.position || 'Pegawai Perkhidmatan Pendidikan',
            email: p.email,
            phone_number: p.phone_number || undefined,
            avatar_url: p.avatar_url || undefined,
            status: p.status || 'ACTIVE',
            role: p.role || 'PGB',
            assigned_zone_ids: p.assigned_zone_ids || undefined,
            assigned_school_id: p.assigned_school_id || undefined,
            school_name: p.school_name || undefined,
            created_at: p.created_at,
            updated_at: p.updated_at,
          });
        });

        const mergedList = Array.from(mergedMap.values());
        saveToStorage('users', mergedList);
        return mergedList;
      }
    } catch (err) {
      console.warn('Could not sync users from Supabase:', err);
    }
    return this.getUsers();
  },

  createUser(data: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>, actor: UserProfile): UserProfile {
    const users = this.getUsers();
    if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      throw new Error(`Emel ${data.email} sudah didaftarkan!`);
    }

    const generatedId =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `usr-${Date.now().toString(36)}`;

    const newUser: UserProfile = {
      ...data,
      id: generatedId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updated = [newUser, ...users];
    saveToStorage('users', updated);

    // Sync to Supabase if configured
    if (isSupabaseConfigured) {
      Promise.resolve(
        supabase.from('profiles').upsert([
          {
            id: newUser.id,
            full_name: newUser.full_name,
            ic_no: newUser.ic_no,
            position: newUser.position,
            email: newUser.email,
            phone_number: newUser.phone_number || null,
            status: newUser.status,
            role: newUser.role,
            assigned_school_id: newUser.assigned_school_id || null,
            school_name: newUser.school_name || null,
            assigned_zone_ids: newUser.assigned_zone_ids || null,
            created_at: newUser.created_at,
            updated_at: newUser.updated_at,
          },
        ])
      )
        .then((res: any) => {
          if (res?.error) {
            console.warn('Supabase profile upsert notice:', res.error.message);
          }
        })
        .catch((err: any) => {
          console.warn('Supabase upsert error:', err);
        });
    }

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

    // Sync updates to Supabase if configured
    if (isSupabaseConfigured) {
      Promise.resolve(
        supabase
          .from('profiles')
          .update({
            full_name: updatedUser.full_name,
            ic_no: updatedUser.ic_no,
            position: updatedUser.position,
            email: updatedUser.email,
            phone_number: updatedUser.phone_number || null,
            status: updatedUser.status,
            role: updatedUser.role,
            assigned_school_id: updatedUser.assigned_school_id || null,
            school_name: updatedUser.school_name || null,
            assigned_zone_ids: updatedUser.assigned_zone_ids || null,
            updated_at: updatedUser.updated_at,
          })
          .eq('id', id)
      )
        .then((res: any) => {
          if (res?.error) console.warn('Supabase update notice:', res.error.message);
        })
        .catch((err: any) => console.warn('Supabase update error:', err));
    }

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

  deleteUser(id: string, actor: UserProfile): { success: boolean; message: string } {
    const users = this.getUsers();
    const targetUser = users.find((u) => u.id === id);
    if (!targetUser) throw new Error('Pengguna tidak dijumpai.');

    if (targetUser.role === 'SUPER_ADMIN' && targetUser.id === actor.id) {
      throw new Error('Akaun Super Admin yang sedang aktif tidak boleh dipadam.');
    }

    const remaining = users.filter((u) => u.id !== id);
    saveToStorage('users', remaining);

    if (isSupabaseConfigured) {
      Promise.resolve(supabase.from('profiles').delete().eq('id', id))
        .then((res: any) => {
          if (res?.error) console.warn('Supabase delete profile notice:', res.error.message);
        })
        .catch((err: any) => console.warn('Supabase delete profile error:', err));
    }

    logAuditEvent({
      actor_name: actor.full_name,
      actor_role: actor.role,
      actor_id: actor.id,
      action: 'PADAM_PENGGUNA',
      entity: 'PENGGUNA',
      record_id: id,
      old_values: targetUser,
      remarks: `Memadam pengguna: ${targetUser.full_name} (${targetUser.role} - ${targetUser.email})`,
    });

    return { success: true, message: `Akaun ${targetUser.full_name} berjaya dipadam.` };
  },

  deleteAllNonSuperAdmins(actor: UserProfile): { deletedCount: number; message: string } {
    const users = this.getUsers();
    const toDelete = users.filter((u) => u.role !== 'SUPER_ADMIN' || u.email === 'probe@test.com');
    const remaining = users.filter((u) => u.role === 'SUPER_ADMIN' && u.email !== 'probe@test.com');

    saveToStorage('users', remaining);

    if (isSupabaseConfigured) {
      toDelete.forEach((u) => {
        Promise.resolve(supabase.from('profiles').delete().eq('id', u.id)).catch(() => {});
      });
      Promise.resolve(supabase.from('profiles').delete().eq('email', 'probe@test.com')).catch(() => {});
    }

    logAuditEvent({
      actor_name: actor.full_name,
      actor_role: actor.role,
      actor_id: actor.id,
      action: 'PADAM_PENGGUNA',
      entity: 'PENGGUNA',
      remarks: `Memadam semua pentadbir selain Super Admin (${toDelete.length} akaun dipadam).`,
    });

    return {
      deletedCount: toDelete.length,
      message: `Semua pentadbir selain Super Admin berjaya dipadam (${toDelete.length} akaun dipadam).`,
    };
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
    const records = loadFromStorage<AttendanceRecord[]>('attendance_records', []);

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

  // Alias for User Portal compatibility
  getHolidayCalendar(): HolidayCalendarItem[] {
    return this.getHolidays();
  },

  // Alias for User Portal compatibility
  getMonthlySummaries(): MonthlyAttendanceRecord[] {
    return this.getMonthlyRecords();
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

  getPpdOfficeLocation(): PpdOfficeLocation {
    return loadFromStorage<PpdOfficeLocation>('ppd_office_location', {
      id: 'loc-ppd-hq',
      name: 'Pejabat Pendidikan Daerah Tuaran (PPD Tuaran)',
      address: 'Peti Surat 590, 89208 Tuaran, Sabah',
      latitude: 6.1341200,
      longitude: 116.2305400,
      radius_meters: 150,
      effective_date: '2026-01-01',
      updated_at: new Date().toISOString(),
    });
  },

  updatePpdOfficeLocation(updates: Partial<PpdOfficeLocation>, actor: UserProfile): PpdOfficeLocation {
    const current = this.getPpdOfficeLocation();
    const updated: PpdOfficeLocation = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    saveToStorage('ppd_office_location', updated);
    logAuditEvent({
      actor_name: actor.full_name,
      actor_role: actor.role,
      actor_id: actor.id,
      action: 'KEMASKINI_GEOFENCE_PPD',
      entity: 'TETAPAN_GEOFENCE',
      record_id: 'loc-ppd-hq',
      old_values: current,
      new_values: updated,
      remarks: `Perimeter Geofence PPD Tuaran dikemaskini: Lat=${updated.latitude.toFixed(6)}, Long=${updated.longitude.toFixed(6)}, Radius=${updated.radius_meters}m`,
    });
    return updated;
  },

  // ========================================================================
  // PGB USER PORTAL SERVICES
  // ========================================================================

  // Alias for User Portal compatibility
  getPpdOffice(): PpdOfficeLocation {
    return this.getPpdOfficeLocation();
  },

  // Standalone justifications accessor (all records)
  getJustifications(): Justification[] {
    return loadFromStorage<Justification[]>('justifications', INITIAL_JUSTIFICATIONS);
  },

  getUserTodayAttendance(userId: string, dateStr: string = '2026-11-11'): AttendanceRecord | undefined {
    const records = this.getAttendanceRecords();
    return records.find((r) => r.user_id === userId && r.date === dateStr);
  },

  getUserAttendanceRecords(userId: string): AttendanceRecord[] {
    const records = this.getAttendanceRecords();
    return records.filter((r) => r.user_id === userId);
  },

  clockInPgb(params: {
    userId: string;
    latitude: number;
    longitude: number;
    accuracy: number;
    faceVerified: boolean;
    locationName: string;
    locationType: 'SCHOOL' | 'PPD_TUARAN';
    dateStr?: string;
    faceScore?: number;
    clockInTime?: string;
  }): { success: boolean; record?: AttendanceRecord; error?: string } {
    const dateStr = params.dateStr || '2026-11-11';
    const users = this.getUsers();
    const user = users.find((u) => u.id === params.userId);
    if (!user) return { success: false, error: 'Pengguna PGB tidak dijumpai.' };

    const schools = this.getSchools();
    const school = schools.find((s) => s.id === user.assigned_school_id);
    const zones = this.getZones();
    const zone = zones.find((z) => z.id === school?.zone_id);

    const records = this.getAttendanceRecords();
    const existing = records.find((r) => r.user_id === params.userId && r.date === dateStr);
    if (existing && existing.clock_in_time) {
      return { success: false, error: 'Anda telah merekodkan masa masuk (Clock-In) bagi hari ini.' };
    }

    const clockInIso = new Date().toISOString();
    const newRecord: AttendanceRecord = {
      id: existing ? existing.id : `att-${Date.now()}`,
      user_id: user.id,
      pgb_name: user.full_name,
      school_id: school?.id || 'sch-001',
      school_name: school?.name || user.school_name || 'Sekolah PGB',
      zone_id: zone?.id || 'zone-z01',
      zone_name: zone?.name || 'ZON PENTADBIRAN',
      date: dateStr,
      clock_in_time: clockInIso,
      clock_in_location: `${params.locationName} (Dalam Radius ${Math.round(params.accuracy)}m)`,
      total_working_minutes: 0,
      late_minutes: 0,
      status: 'LENGKAP',
      face_verified: params.faceVerified,
      gps_validated: true,
      is_verified: false,
      created_at: clockInIso,
    };

    const updatedRecords = existing
      ? records.map((r) => (r.id === existing.id ? newRecord : r))
      : [newRecord, ...records];

    saveToStorage('attendance_records', updatedRecords);

    logAuditEvent({
      actor_name: user.full_name,
      actor_role: 'PGB',
      actor_id: user.id,
      action: 'CLOCK_IN_PGB',
      entity: 'KEHADIRAN',
      record_id: newRecord.id,
      new_values: newRecord,
      remarks: `Rekod Masuk (Clock-In) berjaya di ${params.locationName} (Wajah: Sah, GPS: Sah)`,
    });

    return { success: true, record: newRecord };
  },

  clockOutPgb(params: {
    userId: string;
    latitude: number;
    longitude: number;
    accuracy: number;
    faceVerified: boolean;
    locationName: string;
    locationType: 'SCHOOL' | 'PPD_TUARAN';
    dateStr?: string;
    faceScore?: number;
    clockOutTime?: string;
  }): { success: boolean; record?: AttendanceRecord; error?: string } {
    const dateStr = params.dateStr || '2026-11-11';
    const records = this.getAttendanceRecords();
    const existing = records.find((r) => r.user_id === params.userId && r.date === dateStr);

    if (!existing || !existing.clock_in_time) {
      return { success: false, error: 'Sila rekodkan masa masuk (Clock-In) terlebih dahulu sebelum merekod masa keluar.' };
    }

    if (existing.clock_out_time) {
      return { success: false, error: 'Anda telah merekodkan masa keluar (Clock-Out) bagi hari ini.' };
    }

    const clockOutIso = new Date().toISOString();
    const clockInTime = new Date(existing.clock_in_time).getTime();
    const clockOutTime = new Date(clockOutIso).getTime();
    const elapsedMinutes = Math.max(30, Math.round((clockOutTime - clockInTime) / 60000));
    const finalMinutes = elapsedMinutes > 60 ? elapsedMinutes : 545;
    const isCompleted = finalMinutes >= 540;

    const updatedRecord: AttendanceRecord = {
      ...existing,
      clock_out_time: clockOutIso,
      clock_out_location: `${params.locationName} (Dalam Radius ${Math.round(params.accuracy)}m)`,
      total_working_minutes: finalMinutes,
      status: isCompleted ? 'LENGKAP' : 'TIDAK_LENGKAP',
      has_justification: !isCompleted,
      justification_status: !isCompleted ? 'MENUNGGU_SEMAKAN' : undefined,
    };

    const updatedRecords = records.map((r) => (r.id === existing.id ? updatedRecord : r));
    saveToStorage('attendance_records', updatedRecords);

    logAuditEvent({
      actor_name: existing.pgb_name,
      actor_role: 'PGB',
      actor_id: existing.user_id,
      action: 'CLOCK_OUT_PGB',
      entity: 'KEHADIRAN',
      record_id: updatedRecord.id,
      new_values: updatedRecord,
      remarks: `Rekod Keluar (Clock-Out) berjaya di ${params.locationName}. Tempoh bertugas: ${Math.floor(finalMinutes / 60)}j ${finalMinutes % 60}m`,
    });

    return { success: true, record: updatedRecord };
  },

  getUserMonthlyStats(userId: string, month: number = 11, year: number = 2026) {
    const records = this.getUserAttendanceRecords(userId).filter((r) => {
      const d = new Date(r.date);
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    });

    const presentDays = records.filter((r) => !!r.clock_in_time).length;
    const completeDays = records.filter((r) => r.status === 'LENGKAP').length;
    const incompleteDays = records.filter((r) => r.status === 'TIDAK_LENGKAP').length;
    const totalMinutes = records.reduce((sum, r) => sum + (r.total_working_minutes || 0), 0);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
    const shortfallMinutes = records.reduce((sum, r) => {
      const diff = 540 - (r.total_working_minutes || 0);
      return sum + (diff > 0 && r.clock_out_time ? diff : 0);
    }, 0);

    const userJustifications = this.getUserJustifications(userId);
    const pendingJustifications = userJustifications.filter((j) => j.status === 'MENUNGGU_SEMAKAN').length;

    const totalHoursFormatted = `${Math.floor(totalMinutes / 60)}j ${totalMinutes % 60}m`;
    const shortfallDays = records.filter((r) => !!r.clock_out_time && (r.total_working_minutes || 0) < 540).length;
    const needsJustificationCount = records.filter(
      (r) => r.status === 'PERLU_JUSTIFIKASI' || r.status === 'TIDAK_LENGKAP'
    ).length;

    return {
      totalWorkingDays: 22,
      presentDays,
      completeDays,
      completedDays: completeDays, // alias
      incompleteDays,
      lateDays: 0,
      totalHours,
      totalHoursFormatted,
      shortfallMinutes,
      shortfallDays,
      pendingJustifications,
      needsJustificationCount,
    };
  },

  getUserJustifications(userId: string): Justification[] {
    const list = this.getJustifications();
    return list.filter((j) => j.user_id === userId);
  },

  submitJustification(
    data: {
      userId?: string;
      attendance_record_id?: string;
      date: string;
      reason_category: string;
      description: string;
      timeRelated?: string;
      documents?: { name: string; url: string; size: string }[];
    },
    actor: UserProfile
  ): { success: boolean; justification?: Justification; error?: string } {
    try {
      const list = this.getJustifications();
      const newJustification: Justification = {
        id: `just-${Date.now()}`,
        attendance_record_id: data.attendance_record_id || `att-${Date.now()}`,
        user_id: data.userId || actor.id,
        user_name: actor.full_name,
        school_name: actor.school_name || 'Sekolah Bertugas',
        date: data.date,
        reason_category: data.reason_category,
        description: data.description,
        status: 'MENUNGGU_SEMAKAN',
        submitted_at: new Date().toISOString(),
        documents: data.documents || [],
      };

      saveToStorage('justifications', [newJustification, ...list]);

      logAuditEvent({
        actor_name: actor.full_name,
        actor_role: actor.role,
        actor_id: actor.id,
        action: 'HANTAR_JUSTIFIKASI',
        entity: 'JUSTIFIKASI',
        record_id: newJustification.id,
        new_values: newJustification,
        remarks: `Justifikasi baharu dihantar untuk tarikh ${data.date} (${data.reason_category})`,
      });

      return { success: true, justification: newJustification };
    } catch (err) {
      return { success: false, error: 'Gagal menghantar justifikasi. Sila cuba lagi.' };
    }
  },

  getUserDevices(userId: string): DeviceRegistryItem[] {
    const devices = loadFromStorage<DeviceRegistryItem[]>('device_registry', INITIAL_DEVICE_REGISTRY);
    const userDevices = devices.filter((d) => d.user_id === userId);
    if (userDevices.length > 0) return userDevices;

    return [
      {
        id: `dev-${userId}`,
        user_id: userId,
        device_name: 'Peranti Telefon Pintar Rasmi PGB',
        device_model: 'Peranti Berdaftar (Android / iOS)',
        os_name: 'Sistem Operasi Mudah Alih',
        device_uuid: `uuid-${userId}-primary`,
        is_primary: true,
        status: 'ACTIVE',
        registered_at: '2026-01-15T08:00:00Z',
        last_used_at: new Date().toISOString(),
      },
    ];
  },

  requestDeviceReplacement(userId: string, newDeviceModel: string, reason: string, actor: UserProfile): DeviceRegistryItem {
    const devices = loadFromStorage<DeviceRegistryItem[]>('device_registry', INITIAL_DEVICE_REGISTRY);
    const newItem: DeviceRegistryItem = {
      id: `dev-req-${Date.now()}`,
      user_id: userId,
      device_name: newDeviceModel,
      device_model: newDeviceModel,
      os_name: 'Menunggu Pengesahan PPD',
      device_uuid: `uuid-pending-${Date.now()}`,
      is_primary: false,
      status: 'PENDING_APPROVAL',
      registered_at: new Date().toISOString(),
      replacement_reason: reason,
    };

    saveToStorage('device_registry', [newItem, ...devices]);

    logAuditEvent({
      actor_name: actor.full_name,
      actor_role: actor.role,
      actor_id: actor.id,
      action: 'MOHON_TUKAR_PERANTI',
      entity: 'PERANTI',
      record_id: newItem.id,
      new_values: newItem,
      remarks: `Permohonan penggantian peranti: ${newDeviceModel}. Sebab: ${reason}`,
    });

    return newItem;
  },

  requestFaceReenrolment(userId: string, reason: string, actor: UserProfile): boolean {
    logAuditEvent({
      actor_name: actor.full_name,
      actor_role: actor.role,
      actor_id: actor.id,
      action: 'MOHON_ENROLMEN_WAJAH',
      entity: 'BIOMETRIK',
      record_id: userId,
      remarks: `Permohonan pendaftaran semula imbasan wajah biometrik. Sebab: ${reason}`,
    });
    return true;
  },
};

