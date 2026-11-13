import { getLocalDateStr } from './dateUtils';
import {
  Zone,
  School,
  UserProfile,
  AttendanceRecord,
  AttendanceStatusType,
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
    total_schools: 0,
    total_pgb: 0,
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
    total_schools: 0,
    total_pgb: 0,
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
    total_schools: 0,
    total_pgb: 0,
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
    total_schools: 0,
    total_pgb: 0,
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
    total_schools: 0,
    total_pgb: 0,
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
    total_schools: 0,
    total_pgb: 0,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
];

export const INITIAL_SCHOOLS: School[] = [];

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

export function normalizeAttendanceRecord(r: AttendanceRecord): AttendanceRecord {
  if (!r) return r;
  if (r.clock_in_time && r.clock_out_time) {
    const inMs = new Date(r.clock_in_time).getTime();
    const outMs = new Date(r.clock_out_time).getTime();
    if (inMs > 0 && outMs >= inMs) {
      const realMinutes = Math.max(1, Math.round((outMs - inMs) / 60000));
      const isCompleted = realMinutes >= 540;
      const shortfallMinutes = isCompleted ? 0 : 540 - realMinutes;
      const isApproved = r.justification_status === 'DISAHKAN' || r.justification_status === 'DILULUSKAN';
      const status: AttendanceStatusType = isCompleted
        ? 'LENGKAP'
        : isApproved
        ? 'LENGKAP'
        : r.justification_status === 'MENUNGGU_SEMAKAN'
        ? 'MENUNGGU_SEMAKAN'
        : 'TIDAK_LENGKAP';

      return {
        ...r,
        total_working_minutes: realMinutes,
        work_duration_minutes: realMinutes,
        shortfall_minutes: shortfallMinutes,
        status,
        has_justification: !isCompleted || !!r.has_justification,
      };
    }
  }
  return r;
}

function loadFromStorage<T>(key: string, defaultData: T): T {
  try {
    // Purge legacy demo seed data from browser localStorage on first run
    // v11: Clear attendance records and auto-normalize duration
    const purgeFlag = 'ehadir_purge_v11_sync_duration';
    if (!localStorage.getItem(purgeFlag)) {
      localStorage.removeItem('ehadir_purge_v8_purge_probe');
      localStorage.removeItem('ehadir_purge_v9_reset_all');
      localStorage.removeItem('ehadir_purge_v10_fix_duration');

      // Purge stale attendance records so tests run on fresh, normalized state
      localStorage.removeItem('ehadir_attendance_records');

      localStorage.setItem(purgeFlag, 'true');
    }

    const item = localStorage.getItem(`ehadir_${key}`);
    if (item) {
      const parsed = JSON.parse(item);
      if (key === 'users' && Array.isArray(parsed)) {
        return parsed.filter(
          (u: any) =>
            u.email?.toLowerCase() !== 'probe@test.com' &&
            !u.email?.toLowerCase()?.includes('probe@')
        ) as T;
      }
      if (key === 'attendance_records' && Array.isArray(parsed)) {
        return parsed.map((item: any) => normalizeAttendanceRecord(item)) as T;
      }
      return parsed;
    }
    return defaultData;
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

    // Recalculate dynamic counts and assigned admins
    return zones.map((z) => {
      const zoneSchools = schools.filter((s) => s.zone_id === z.id && s.status === 'ACTIVE');
      const schoolIds = new Set(zoneSchools.map((s) => s.id));
      const pgbCount = users.filter(
        (u) => u.role === 'PGB' && u.assigned_school_id && schoolIds.has(u.assigned_school_id)
      ).length;

      const zoneAdmins = users.filter(
        (u) => u.role === 'ADMIN_ZON' && (u.assigned_zone_ids || []).includes(z.id)
      );
      const assignedAdminName =
        zoneAdmins.length > 0
          ? zoneAdmins.map((a) => a.full_name).join(', ')
          : 'Belum Ditugaskan Pegawai';

      return {
        ...z,
        total_schools: zoneSchools.length,
        total_pgb: pgbCount,
        assigned_admin_name: assignedAdminName,
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

    const generatedSchoolId =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `00000000-0000-4000-8000-${Date.now().toString(16).padStart(12, '0')}`;

    const newSchool: School = {
      ...data,
      id: generatedSchoolId,
      code: data.code.toUpperCase(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updated = [newSchool, ...schools];
    saveToStorage('schools', updated);

    if (isSupabaseConfigured) {
      Promise.resolve(
        supabase.from('schools').upsert([
          {
            id: newSchool.id,
            code: newSchool.code,
            name: newSchool.name,
            category: newSchool.category,
            address: newSchool.address || null,
            postal_code: newSchool.postal_code || null,
            phone: newSchool.phone || null,
            email: newSchool.email || null,
            latitude: newSchool.latitude,
            longitude: newSchool.longitude,
            geofence_radius_meters: newSchool.geofence_radius_meters,
            status: newSchool.status,
            zone_id: newSchool.zone_id || null,
            zone_name: newSchool.zone_name || null,
            zone_code: newSchool.zone_code || null,
            created_at: newSchool.created_at,
            updated_at: newSchool.updated_at,
          },
        ])
      ).catch(() => {});
    }

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

    if (isSupabaseConfigured) {
      const payload = {
        code: updatedSchool.code,
        name: updatedSchool.name,
        category: updatedSchool.category,
        address: updatedSchool.address || null,
        postal_code: updatedSchool.postal_code || null,
        phone: updatedSchool.phone || null,
        email: updatedSchool.email || null,
        latitude: updatedSchool.latitude,
        longitude: updatedSchool.longitude,
        geofence_radius_meters: updatedSchool.geofence_radius_meters,
        status: updatedSchool.status,
        zone_id: updatedSchool.zone_id || null,
        zone_name: updatedSchool.zone_name || null,
        zone_code: updatedSchool.zone_code || null,
        updated_at: updatedSchool.updated_at,
      };

      // Use upsert with onConflict: 'code' so it inserts if not found in Supabase
      Promise.resolve(
        supabase
          .from('schools')
          .upsert([payload], { onConflict: 'code' })
      ).catch(() => {});
    }

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

      if (isSupabaseConfigured) {
        Promise.resolve(supabase.from('schools').delete().eq('id', id)).catch(() => {});
      }

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

  deleteAllSchools(actor: UserProfile): { success: boolean; message: string } {
    saveToStorage('schools', []);

    if (isSupabaseConfigured) {
      Promise.resolve(supabase.from('schools').delete().neq('id', '___none___')).catch(() => {});
    }

    logAuditEvent({
      actor_name: actor.full_name,
      actor_role: actor.role,
      actor_id: actor.id,
      action: 'PADAM_SEMUA_SEKOLAH',
      entity: 'SEKOLAH',
      record_id: 'ALL',
      remarks: 'Memadam semua rekod sekolah untuk membolehkan pendaftaran semula oleh Super Admin',
    });

    return {
      success: true,
      message: 'Semua rekod sekolah telah berjaya dipadam daripada sistem.',
    };
  },

  async syncSchoolsFromSupabase(): Promise<School[]> {
    if (!isSupabaseConfigured) return this.getSchools();
    try {
      const { data, error } = await supabase.from('schools').select('*');
      if (data && !error && data.length > 0) {
        const mapped: School[] = data.map((s: any) => ({
          id: s.id,
          code: s.code,
          name: s.name,
          category: s.category || 'SK',
          address: s.address || '',
          postal_code: s.postal_code || '89208',
          phone: s.phone || '',
          email: s.email || '',
          latitude: Number(s.latitude) || 6.134,
          longitude: Number(s.longitude) || 116.23,
          geofence_radius_meters: Number(s.geofence_radius_meters) || 100,
          status: s.status || 'ACTIVE',
          location_status: s.location_status || 'VERIFIED',
          zone_id: s.zone_id,
          zone_name: s.zone_name,
          zone_code: s.zone_code,
          assigned_pgb_name: s.assigned_pgb_name,
          assigned_pgb_id: s.assigned_pgb_id,
          created_at: s.created_at || new Date().toISOString(),
          updated_at: s.updated_at || new Date().toISOString(),
        }));
        saveToStorage('schools', mapped);
        return mapped;
      }
    } catch (err) {
      console.warn('Could not sync schools from Supabase:', err);
    }
    return this.getSchools();
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
        current.forEach((u) => {
          if (u.email?.toLowerCase() !== 'probe@test.com' && !u.email?.toLowerCase()?.includes('probe@')) {
            mergedMap.set(u.id, u);
          }
        });

        data.forEach((p: any) => {
          const emailLower = (p.email || '').toLowerCase();
          if (emailLower === 'probe@test.com' || emailLower.includes('probe@')) {
            // Delete probe test account from Supabase profiles immediately
            Promise.resolve(supabase.from('profiles').delete().eq('id', p.id)).catch(() => {});
            Promise.resolve(supabase.from('profiles').delete().eq('email', p.email)).catch(() => {});
            return;
          }

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

        const mergedList = Array.from(mergedMap.values()).filter(
          (u) => u.email?.toLowerCase() !== 'probe@test.com' && !u.email?.toLowerCase()?.includes('probe@')
        );
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
      // 1) Create Supabase Auth account so PGB/admin can login with password
      if (data.password) {
        Promise.resolve(
          supabase.auth.signUp({
            email: newUser.email,
            password: data.password,
            options: {
              data: {
                full_name: newUser.full_name,
                role: newUser.role,
                position: newUser.position,
              },
            },
          })
        )
          .then(({ data: authData, error: authErr }: any) => {
            if (authErr) {
              console.warn('Supabase Auth signUp notice:', authErr.message);
            }
            // 2) Upsert profile row (may already exist via trigger)
            const profileId = authData?.user?.id || newUser.id;
            return supabase.from('profiles').upsert([
              {
                id: profileId,
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
            ]);
          })
          .catch((err: any) => {
            console.warn('Supabase Auth/profile error:', err);
          });
      } else {
        // No password — just upsert profile row (login via admin portal only)
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
    const rawUsers = loadFromStorage<UserProfile[]>('users', []);
    const users = this.getUsers();
    const targetUser =
      users.find((u) => u.id === id || u.email?.toLowerCase() === id.toLowerCase()) ||
      rawUsers.find((u) => u.id === id || u.email?.toLowerCase() === id.toLowerCase());

    if (targetUser && targetUser.role === 'SUPER_ADMIN' && targetUser.id === actor.id) {
      throw new Error('Akaun Super Admin yang sedang aktif tidak boleh dipadam.');
    }

    const remaining = rawUsers.filter(
      (u) =>
        u.id !== id &&
        u.email?.toLowerCase() !== id.toLowerCase() &&
        (!targetUser || u.email?.toLowerCase() !== targetUser.email?.toLowerCase())
    );
    saveToStorage('users', remaining);

    if (isSupabaseConfigured) {
      Promise.resolve(supabase.from('profiles').delete().eq('id', id)).catch(() => {});
      if (targetUser?.email) {
        Promise.resolve(supabase.from('profiles').delete().eq('email', targetUser.email)).catch(() => {});
      }
      if (id === 'probe@test.com' || targetUser?.email === 'probe@test.com' || id.includes('probe')) {
        Promise.resolve(supabase.from('profiles').delete().eq('email', 'probe@test.com')).catch(() => {});
      }
    }

    logAuditEvent({
      actor_name: actor.full_name,
      actor_role: actor.role,
      actor_id: actor.id,
      action: 'PADAM_PENGGUNA',
      entity: 'PENGGUNA',
      record_id: id,
      old_values: targetUser,
      remarks: `Memadam akaun: ${targetUser?.full_name || id}`,
    });

    return {
      success: true,
      message: `Akaun ${targetUser?.full_name || id} berjaya dipadam.`,
    };
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
  getDashboardStats(zoneId?: string, targetDate?: string): DashboardStats {
    const todayStr = targetDate || getLocalDateStr();
    const schools = this.getSchools().filter((s) => s.status === 'ACTIVE');
    const filteredSchools = zoneId ? schools.filter((s) => s.zone_id === zoneId) : schools;
    const schoolIds = new Set(filteredSchools.map((s) => s.id));

    const allUsers = this.getUsers().filter((u) => u.status === 'ACTIVE' && u.role === 'PGB');
    const filteredUsers = zoneId
      ? allUsers.filter((u) => u.assigned_school_id && schoolIds.has(u.assigned_school_id))
      : allUsers;

    const allRecords = this.getAttendanceRecords();
    const todayRecords = allRecords.filter((r) => {
      const match = r.date === todayStr || (r.clock_in_time && getLocalDateStr(new Date(r.clock_in_time)) === todayStr);
      const zoneMatch = zoneId ? r.zone_id === zoneId : true;
      return match && zoneMatch;
    });

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const monthlyRecords = this.getMonthlyRecords().filter((m) =>
      zoneId ? m.zone_id === zoneId : true
    );

    const assignments = this.getApproverAssignments(currentMonth, currentYear);
    const assignedSchoolIds = new Set(assignments.map((a) => a.school_id));
    const unassignedCount = filteredSchools.filter((s) => !assignedSchoolIds.has(s.id)).length;

    const presentCount = todayRecords.filter((r) => !!r.clock_in_time).length;
    const totalPgb = filteredUsers.length || 1;
    const percentage = Math.round((presentCount / totalPgb) * 100);

    return {
      totalSchools: filteredSchools.length,
      totalPgb: filteredUsers.length,
      attendanceTodayCount: presentCount,
      attendanceTodayPercentage: Math.min(100, percentage),
      notClockedInCount: Math.max(0, filteredUsers.length - presentCount),
      lateTodayCount: todayRecords.filter((r) => r.status === 'LEWAT').length,
      incompleteRecordsCount: todayRecords.filter((r) => r.status === 'TIDAK_LENGKAP').length,
      pendingJustificationsCount: todayRecords.filter((r) => r.has_justification && r.justification_status === 'MENUNGGU_SEMAKAN').length,
      pendingMonthlyVerificationCount: monthlyRecords.filter((m) => m.status === 'MENUNGGU_SEMAKAN' || m.status === 'DALAM_SEMAKAN').length,
      unassignedApproverCount: unassignedCount,
    };
  },

  async syncAttendanceRecordsFromSupabase(): Promise<AttendanceRecord[]> {
    const local = this.getAttendanceRecords();
    if (!isSupabaseConfigured) return local;
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .order('date', { ascending: false });

      if (data && !error && data.length > 0) {
        const users = this.getUsers();
        const schools = this.getSchools();
        const merged = [...local];

        for (const row of data) {
          const user = users.find((u) => u.id === row.user_id || u.email === row.user_id);
          const school = schools.find((s) => s.id === row.school_id);
          const existingIdx = merged.findIndex(
            (m) => (m.id === row.id) || (m.user_id === row.user_id && m.date === row.date)
          );
          const existingLocal = existingIdx >= 0 ? merged[existingIdx] : null;

          let totalMins = Number(row.total_working_minutes) || (existingLocal ? existingLocal.total_working_minutes : 0);
          if (row.clock_in_time && row.clock_out_time) {
            const inMs = new Date(row.clock_in_time).getTime();
            const outMs = new Date(row.clock_out_time).getTime();
            if (inMs > 0 && outMs >= inMs) {
              totalMins = Math.max(1, Math.round((outMs - inMs) / 60000));
            }
          }
          const isCompleted = totalMins >= 540;
          const shortfall = row.clock_out_time ? (isCompleted ? 0 : Math.max(0, 540 - totalMins)) : (existingLocal?.shortfall_minutes ?? 0);

          const recordItem: AttendanceRecord = normalizeAttendanceRecord({
            id: row.id,
            user_id: row.user_id,
            pgb_name: user?.full_name || existingLocal?.pgb_name || 'Pengetua / Guru Besar',
            school_id: row.school_id || user?.assigned_school_id || existingLocal?.school_id || 'sch-001',
            school_name: school?.name || user?.school_name || existingLocal?.school_name || 'Sekolah PGB',
            zone_id: school?.zone_id || existingLocal?.zone_id || 'zone-z01',
            zone_name: school?.zone_name || existingLocal?.zone_name || 'ZON PENTADBIRAN',
            date: row.date,
            clock_in_time: row.clock_in_time || existingLocal?.clock_in_time,
            clock_out_time: row.clock_out_time || existingLocal?.clock_out_time,
            clock_in_location: existingLocal?.clock_in_location || (school ? `${school.name} (Dalam Geofence)` : 'Lokasi Sah Geofence'),
            clock_out_location: row.clock_out_time
              ? (existingLocal?.clock_out_location || (school ? `${school.name} (Dalam Geofence)` : 'Lokasi Sah Geofence'))
              : undefined,
            clock_in_lat: existingLocal?.clock_in_lat ?? school?.latitude,
            clock_in_lng: existingLocal?.clock_in_lng ?? school?.longitude,
            clock_in_accuracy: existingLocal?.clock_in_accuracy ?? 12,
            clock_out_lat: existingLocal?.clock_out_lat ?? school?.latitude,
            clock_out_lng: existingLocal?.clock_out_lng ?? school?.longitude,
            clock_out_accuracy: existingLocal?.clock_out_accuracy ?? 12,
            total_working_minutes: totalMins,
            work_duration_minutes: totalMins,
            shortfall_minutes: shortfall,
            late_minutes: Number(row.late_minutes) || 0,
            status: (row.status as any) || (isCompleted ? 'LENGKAP' : row.clock_out_time ? 'TIDAK_LENGKAP' : 'LENGKAP'),
            face_verified: existingLocal?.face_verified ?? true,
            gps_validated: existingLocal?.gps_validated ?? true,
            has_justification: existingLocal?.has_justification ?? (!isCompleted && !!row.clock_out_time),
            justification_status: existingLocal?.justification_status,
            is_verified: row.is_verified || false,
            created_at: row.created_at || existingLocal?.created_at || new Date().toISOString(),
            location_name: school?.name || existingLocal?.location_name || 'Sekolah',
          });

          if (existingIdx >= 0) {
            merged[existingIdx] = { ...existingLocal, ...recordItem };
          } else {
            merged.push(recordItem);
          }
        }

        saveToStorage('attendance_records', merged);
        return merged;
      }
    } catch (_) {}
    return local;
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

  async syncPpdOfficeFromSupabase(): Promise<PpdOfficeLocation> {
    const current = this.getPpdOfficeLocation();
    if (!isSupabaseConfigured) return current;
    try {
      const { data, error } = await supabase
        .from('attendance_locations')
        .select('*')
        .eq('type', 'PPD')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data && !error && data.latitude && data.longitude) {
        const synced: PpdOfficeLocation = {
          id: data.id || current.id,
          name: data.name || current.name,
          address: data.address || current.address,
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
          radius_meters: Number(data.radius_meters) || current.radius_meters,
          effective_date: data.effective_date || current.effective_date,
          updated_at: data.updated_at || new Date().toISOString(),
        };
        saveToStorage('ppd_office_location', synced);
        return synced;
      }
    } catch (_) {}
    return current;
  },

  updatePpdOfficeLocation(updates: Partial<PpdOfficeLocation>, actor: UserProfile): PpdOfficeLocation {
    const current = this.getPpdOfficeLocation();
    const updated: PpdOfficeLocation = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    saveToStorage('ppd_office_location', updated);

    if (isSupabaseConfigured) {
      const locationPayload = {
        name: updated.name,
        type: 'PPD',
        latitude: updated.latitude,
        longitude: updated.longitude,
        radius_meters: updated.radius_meters,
        address: updated.address || null,
        is_active: true,
        updated_at: updated.updated_at,
      };

      // Try updating existing PPD record first; if no rows affected, insert new record
      Promise.resolve(
        supabase
          .from('attendance_locations')
          .update(locationPayload)
          .eq('type', 'PPD')
          .select()
      )
        .then(({ data }: any) => {
          if (!data || data.length === 0) {
            return Promise.resolve(supabase.from('attendance_locations').insert([locationPayload]));
          }
        })
        .catch(() => {});
    }

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

  async syncJustificationsFromSupabase(): Promise<Justification[]> {
    const local = this.getJustifications();
    if (!isSupabaseConfigured) return local;
    try {
      const { data, error } = await supabase
        .from('justifications')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) {
        console.warn('Could not sync justifications from Supabase:', error.message);
        return local;
      }

      if (data) {
        const users = this.getUsers();
        const schools = this.getSchools();
        const zones = this.getZones();

        const mapped: Justification[] = data.map((d: any) => {
          const user = users.find((u) => u.id === d.user_id || u.email === d.user_id);
          const school = user ? schools.find((s) => s.id === user.assigned_school_id || s.id === (user as any).school_id) : undefined;
          const zone = school ? zones.find((z) => z.id === school.zone_id) : undefined;

          return {
            id: d.id,
            attendance_record_id: d.attendance_record_id || `att-${d.id}`,
            user_id: d.user_id,
            user_name: user?.full_name || d.user_name || 'Pengetua / Guru Besar',
            school_name: school?.name || user?.school_name || 'Sekolah Bertugas',
            date: d.date || (d.submitted_at ? d.submitted_at.split('T')[0] : new Date().toISOString().split('T')[0]),
            reason_category: d.reason_category || 'URUSAN_RASMI',
            description: d.description || '',
            status: d.status || 'MENUNGGU_SEMAKAN',
            submitted_at: d.submitted_at || d.created_at || new Date().toISOString(),
            reviewed_by: d.reviewed_by,
            reviewed_at: d.reviewed_at,
            review_remarks: d.review_remarks,
            documents: d.documents || [],
          };
        });

        saveToStorage('justifications', mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('Error during justifications sync:', e);
    }
    return local;
  },

  updateJustificationStatus(
    id: string,
    status: 'DISAHKAN' | 'DITOLAK' | 'DILULUSKAN',
    remarks: string,
    reviewer: UserProfile
  ): boolean {
    try {
      const list = this.getJustifications();
      const updated = list.map((j) => {
        if (j.id === id) {
          return {
            ...j,
            status,
            reviewed_by: reviewer.id,
            reviewed_by_name: reviewer.full_name,
            reviewed_at: new Date().toISOString(),
            review_remarks: remarks,
          };
        }
        return j;
      });
      saveToStorage('justifications', updated);

      const targetJustification = list.find((j) => j.id === id);
      if (targetJustification) {
        // Update matching attendance record
        const attRecords = this.getAttendanceRecords();
        const matchingAtt = attRecords.find(
          (a) =>
            a.id === targetJustification.attendance_record_id ||
            (a.user_id === targetJustification.user_id && a.date === targetJustification.date)
        );
        if (matchingAtt) {
          matchingAtt.has_justification = true;
          matchingAtt.justification_status = status;
          if (status === 'DISAHKAN' || status === 'DILULUSKAN') {
            matchingAtt.status = 'LENGKAP';
          }
          saveToStorage('attendance_records', attRecords);
        }

        // Notify PGB
        this.addNotification({
          recipient_id: targetJustification.user_id,
          recipient_role: 'PGB',
          title: status === 'DISAHKAN' || status === 'DILULUSKAN' ? 'Justifikasi Diluluskan' : 'Justifikasi Ditolak',
          message: `Justifikasi anda bagi tarikh ${targetJustification.date} (${targetJustification.reason_category.replace(/_/g, ' ')}) telah ${status === 'DISAHKAN' || status === 'DILULUSKAN' ? 'diluluskan' : 'ditolak'}. Catatan: ${remarks || 'Tiada catatan.'}`,
          category: 'JUSTIFICATION',
          link: '/user/justifications',
        });
      }

      if (isSupabaseConfigured) {
        Promise.resolve(
          supabase
            .from('justifications')
            .update({
              status,
              reviewed_by: reviewer.id,
              reviewed_at: new Date().toISOString(),
              review_remarks: remarks,
            })
            .eq('id', id)
        ).catch(console.error);
      }

      logAuditEvent({
        actor_name: reviewer.full_name,
        actor_role: reviewer.role,
        actor_id: reviewer.id,
        action: status === 'DISAHKAN' || status === 'DILULUSKAN' ? 'LULUS_JUSTIFIKASI' : 'TOLAK_JUSTIFIKASI',
        entity: 'JUSTIFIKASI',
        record_id: id,
        remarks: `Semakan justifikasi: ${status}. Catatan: ${remarks || '-'}`,
      });

      return true;
    } catch (e) {
      console.error('Failed to update justification status:', e);
      return false;
    }
  },

  getUserTodayAttendance(userId: string, dateStr?: string): AttendanceRecord | undefined {
    const today = dateStr || getLocalDateStr();
    const records = this.getAttendanceRecords();
    const users = this.getUsers();
    const currentUser = users.find((u) => u.id === userId || u.email === userId);

    return records.find(
      (r) =>
        (r.user_id === userId ||
          (currentUser && (r.user_id === currentUser.id || r.user_id === currentUser.email))) &&
        (r.date === today || (r.clock_in_time && getLocalDateStr(new Date(r.clock_in_time)) === today))
    );
  },

  getUserAttendanceRecords(userId: string): AttendanceRecord[] {
    const records = this.getAttendanceRecords();
    const users = this.getUsers();
    const currentUser = users.find((u) => u.id === userId || u.email === userId);
    return records.filter(
      (r) =>
        r.user_id === userId ||
        (currentUser && (r.user_id === currentUser.id || r.user_id === currentUser.email))
    );
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
    const dateStr = params.dateStr || getLocalDateStr(); // today YYYY-MM-DD
    const users = this.getUsers();
    const user = users.find((u) => u.id === params.userId || u.email === params.userId);
    if (!user) return { success: false, error: 'Pengguna PGB tidak dijumpai.' };

    const schools = this.getSchools();
    const school = schools.find((s) => s.id === user.assigned_school_id);
    const zones = this.getZones();
    const zone = zones.find((z) => z.id === school?.zone_id);

    const records = this.getAttendanceRecords();
    const existing = records.find(
      (r) =>
        (r.user_id === user.id || r.user_id === params.userId) &&
        (r.date === dateStr || (r.clock_in_time && getLocalDateStr(new Date(r.clock_in_time)) === dateStr))
    );
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
      clock_in_lat: params.latitude,
      clock_in_lng: params.longitude,
      clock_in_accuracy: params.accuracy,
      total_working_minutes: 0,
      work_duration_minutes: 0,
      shortfall_minutes: 540,
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

    // Sync to Supabase attendance_records if configured (Clock In)
    if (isSupabaseConfigured) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const payload: any = {
        date: newRecord.date,
        clock_in_time: newRecord.clock_in_time,
        status: newRecord.status,
        is_verified: newRecord.is_verified || false,
        total_working_minutes: newRecord.total_working_minutes || 0,
        late_minutes: newRecord.late_minutes || 0,
        updated_at: newRecord.created_at,
      };

      if (isUuid.test(newRecord.user_id)) {
        payload.user_id = newRecord.user_id;
      }
      if (school?.id && isUuid.test(school.id)) {
        payload.school_id = school.id;
      }

      if (payload.user_id) {
        Promise.resolve(
          supabase
            .from('attendance_records')
            .upsert([payload], { onConflict: 'user_id,date' })
        ).catch(() => {});
      }
    }

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
    const dateStr = params.dateStr || getLocalDateStr(); // today YYYY-MM-DD
    const records = this.getAttendanceRecords();
    const users = this.getUsers();
    const currentUser = users.find((u) => u.id === params.userId || u.email === params.userId);

    const existing = records.find(
      (r) =>
        (r.user_id === params.userId ||
          (currentUser && (r.user_id === currentUser.id || r.user_id === currentUser.email))) &&
        (r.date === dateStr || (r.clock_in_time && getLocalDateStr(new Date(r.clock_in_time)) === dateStr))
    );

    if (!existing || !existing.clock_in_time) {
      return { success: false, error: 'Sila rekodkan masa masuk (Clock-In) terlebih dahulu sebelum merekod masa keluar.' };
    }

    if (existing.clock_out_time) {
      return { success: false, error: 'Anda telah merekodkan masa keluar (Clock-Out) bagi hari ini.' };
    }

    const clockOutIso = new Date().toISOString();
    const clockInTime = new Date(existing.clock_in_time).getTime();
    const clockOutTime = new Date(clockOutIso).getTime();

    // Calculate actual elapsed minutes worked
    const elapsedMinutes = Math.max(1, Math.round((clockOutTime - clockInTime) / 60000));
    const targetMinutes = 540; // 9 jam fleksi (540 minit)
    const isCompleted = elapsedMinutes >= targetMinutes;
    const shortfallMinutes = isCompleted ? 0 : (targetMinutes - elapsedMinutes);

    const updatedRecord: AttendanceRecord = {
      ...existing,
      clock_out_time: clockOutIso,
      clock_out_location: `${params.locationName} (Dalam Radius ${Math.round(params.accuracy)}m)`,
      clock_out_lat: params.latitude,
      clock_out_lng: params.longitude,
      clock_out_accuracy: params.accuracy,
      total_working_minutes: elapsedMinutes,
      work_duration_minutes: elapsedMinutes,
      shortfall_minutes: shortfallMinutes,
      status: isCompleted ? 'LENGKAP' : 'TIDAK_LENGKAP',
      has_justification: !isCompleted,
      justification_status: !isCompleted ? 'MENUNGGU_SEMAKAN' : undefined,
    };

    const updatedRecords = records.map((r) => (r.id === existing.id ? updatedRecord : r));
    saveToStorage('attendance_records', updatedRecords);

    // Sync to Supabase attendance_records if configured (Clock Out)
    if (isSupabaseConfigured) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (isUuid.test(updatedRecord.user_id)) {
        Promise.resolve(
          supabase
            .from('attendance_records')
            .update({
              clock_out_time: updatedRecord.clock_out_time,
              total_working_minutes: updatedRecord.total_working_minutes,
              status: updatedRecord.status,
              updated_at: updatedRecord.clock_out_time,
            })
            .eq('user_id', updatedRecord.user_id)
            .eq('date', updatedRecord.date)
        ).catch(() => {});
      }
    }

    logAuditEvent({
      actor_name: existing.pgb_name,
      actor_role: 'PGB',
      actor_id: existing.user_id,
      action: 'CLOCK_OUT_PGB',
      entity: 'KEHADIRAN',
      record_id: updatedRecord.id,
      new_values: updatedRecord,
      remarks: isCompleted
        ? `Rekod Keluar (Clock-Out) berjaya di ${params.locationName}. Tempoh: ${Math.floor(elapsedMinutes / 60)}j ${elapsedMinutes % 60}m (Sasaran 9 Jam dipenuhi).`
        : `Rekod Keluar (Clock-Out) dengan KEKURANGAN JAM di ${params.locationName}. Tempoh: ${Math.floor(elapsedMinutes / 60)}j ${elapsedMinutes % 60}m (Kurang ${Math.floor(shortfallMinutes / 60)}j ${shortfallMinutes % 60}m daripada 9 jam). Perlu justifikasi.`,
    });

    return { success: true, record: updatedRecord };
  },

  getUserMonthlyStats(
    userId: string,
    month: number = new Date().getMonth() + 1,
    year: number = new Date().getFullYear()
  ) {
    const records = this.getUserAttendanceRecords(userId).filter((r) => {
      const d = new Date(r.date);
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    });

    const presentDays = records.filter((r) => !!r.clock_in_time).length;
    const completeDays = records.filter((r) => r.status === 'LENGKAP' && !!r.clock_out_time).length;
    const incompleteDays = records.filter((r) => (r.status === 'TIDAK_LENGKAP' || (!!r.clock_out_time && (r.total_working_minutes || 0) < 540))).length;
    const totalMinutes = records.reduce((sum, r) => sum + (r.total_working_minutes || 0), 0);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
    const shortfallMinutes = records.reduce((sum, r) => {
      const diff = 540 - (r.total_working_minutes || 0);
      return sum + (diff > 0 && r.clock_out_time ? diff : 0);
    }, 0);

    const userJustifications = this.getUserJustifications(userId);
    const pendingJustifications = userJustifications.filter((j) => j.status === 'MENUNGGU_SEMAKAN').length;
    const approvedJustifications = userJustifications.filter(
      (j) => j.status === 'DILULUSKAN' || j.status === 'DISAHKAN'
    ).length;

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
      justifiedDays: approvedJustifications,
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

      // Link and update matching attendance record if exists
      const attRecords = this.getAttendanceRecords();
      const matchingAtt = attRecords.find(
        (a) =>
          a.id === newJustification.attendance_record_id ||
          (a.user_id === newJustification.user_id && a.date === newJustification.date)
      );
      if (matchingAtt) {
        matchingAtt.has_justification = true;
        matchingAtt.justification_status = 'MENUNGGU_SEMAKAN';
        saveToStorage('attendance_records', attRecords);
      }

      // Notify Admins
      this.addNotification({
        recipient_role: 'ADMIN_ZON',
        title: 'Permohonan Justifikasi Baharu',
        message: `${actor.full_name} (${actor.school_name || 'Sekolah'}) telah menghantar justifikasi kehadiran bagi tarikh ${data.date}. Sila buat semakan.`,
        category: 'JUSTIFICATION',
        link: '/admin/attendance/justifications',
      });

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

