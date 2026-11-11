export type UserRoleType = 'SUPER_ADMIN' | 'ADMIN_ZON' | 'MONITORING_ADMIN' | 'PGB';

export type AccountStatusType = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export type SchoolCategoryType = 'SK' | 'SMK' | 'SJKC' | 'SJKT' | 'SABK' | 'K9' | 'OTHER';

export type AttendanceStatusType = 
  | 'LENGKAP'
  | 'LEWAT'
  | 'TIDAK_LENGKAP'
  | 'PERLU_JUSTIFIKASI'
  | 'MENUNGGU_SEMAKAN'
  | 'DISAHKAN';

export type MonthlyStatusType = 
  | 'BELUM_DIJANA'
  | 'DIJANA'
  | 'MENUNGGU_SEMAKAN'
  | 'DALAM_SEMAKAN'
  | 'DIKEMBALIKAN'
  | 'DISAHKAN'
  | 'DITOLAK';

export type JustificationStatusType = 'MENUNGGU_SEMAKAN' | 'DISAHKAN' | 'DITOLAK';

export interface UserProfile {
  id: string;
  full_name: string;
  ic_no: string;
  position: string;
  email: string;
  phone_number?: string;
  avatar_url?: string;
  status: AccountStatusType;
  created_at: string;
  updated_at: string;
  role: UserRoleType;
  assigned_zone_ids?: string[]; // For Admin Zon
  assigned_school_id?: string;  // For PGB
  school_name?: string;
}

export interface Zone {
  id: string;
  code: string;
  name: string;
  color_hex: string;
  description?: string;
  is_active: boolean;
  total_schools?: number;
  total_pgb?: number;
  assigned_admin_name?: string;
  assigned_admin_id?: string;
  created_at: string;
  updated_at: string;
}

export interface School {
  id: string;
  code: string; // e.g., XBA4001
  name: string;
  category: SchoolCategoryType;
  address?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  latitude: number;
  longitude: number;
  geofence_radius_meters: number;
  status: AccountStatusType;
  location_status: 'VERIFIED' | 'UNVERIFIED' | 'PENDING';
  zone_id?: string;
  zone_name?: string;
  zone_code?: string;
  assigned_pgb_name?: string;
  assigned_pgb_id?: string;
  created_at: string;
  updated_at: string;
}

export interface AttendanceLocation {
  id: string;
  name: string;
  type: 'SCHOOL' | 'PPD' | 'EXTERNAL_APPROVED';
  school_id?: string;
  school_name?: string;
  address?: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  is_active: boolean;
  effective_date: string;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  user_id: string;
  pgb_name: string;
  school_id: string;
  school_name: string;
  zone_id?: string;
  zone_name?: string;
  date: string;
  clock_in_time?: string;
  clock_out_time?: string;
  total_working_minutes: number;
  late_minutes: number;
  status: AttendanceStatusType;
  face_verified: boolean;
  gps_validated: boolean;
  clock_in_location?: string;
  clock_out_location?: string;
  has_justification?: boolean;
  justification_status?: JustificationStatusType;
  is_verified: boolean;
  created_at: string;
}

export interface Justification {
  id: string;
  attendance_record_id: string;
  user_id: string;
  user_name: string;
  school_name: string;
  date: string;
  reason_category: string;
  description: string;
  status: JustificationStatusType;
  submitted_at: string;
  reviewed_by?: string;
  reviewed_by_name?: string;
  reviewed_at?: string;
  review_remarks?: string;
  documents?: { name: string; url: string; size: string }[];
}

export interface MonthlyAttendanceRecord {
  id: string;
  user_id: string;
  pgb_name: string;
  school_id: string;
  school_name: string;
  school_code: string;
  zone_id: string;
  zone_name: string;
  month: number;
  year: number;
  total_working_days: number;
  present_days: number;
  late_days: number;
  incomplete_days: number;
  justified_days: number;
  total_hours_rendered: number;
  status: MonthlyStatusType;
  assigned_approver_id?: string;
  assigned_approver_name?: string;
  generated_at: string;
  submitted_at?: string;
}

export interface MonthlyApproverAssignment {
  id: string;
  month: number;
  year: number;
  school_id: string;
  school_name: string;
  school_code: string;
  zone_id: string;
  zone_name: string;
  assigned_admin_id: string;
  assigned_admin_name: string;
  assigned_admin_email?: string;
  assigned_by: string;
  assigned_at: string;
  is_primary: boolean;
  status: 'ACTIVE' | 'REASSIGNED';
  notes?: string;
}

export interface AuditLog {
  id: string;
  actor_id?: string;
  actor_name: string;
  actor_role: UserRoleType;
  action: string;
  entity: string;
  record_id?: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  remarks?: string;
  created_at: string;
}

export interface AppNotification {
  id: string;
  recipient_id?: string;
  recipient_role?: UserRoleType;
  title: string;
  message: string;
  category: 
    | 'MONTHLY_SUBMISSION'
    | 'PENDING_VERIFICATION'
    | 'INCOMPLETE_ATTENDANCE'
    | 'JUSTIFICATION'
    | 'DEVICE_REQUEST'
    | 'FACE_ENROLMENT'
    | 'GEOFENCE_ALERT'
    | 'UNASSIGNED_SCHOOL'
    | 'SYSTEM';
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface WorkSchedule {
  id: string;
  name: string;
  target_work_minutes: number;
  official_clock_in_time: string;
  late_tolerance_minutes: number;
  count_break_time_in_hours: boolean;
  is_active: boolean;
}

export interface HolidayCalendarItem {
  id: string;
  holiday_date: string;
  name: string;
  type: 'NATIONAL' | 'STATE_SABAH' | 'SCHOOL_TERM' | 'SPECIAL';
  applies_to_pgb: boolean;
  year: number;
  description?: string;
}

export interface DashboardStats {
  totalSchools: number;
  totalPgb: number;
  attendanceTodayCount: number;
  attendanceTodayPercentage: number;
  notClockedInCount: number;
  lateTodayCount: number;
  incompleteRecordsCount: number;
  pendingJustificationsCount: number;
  pendingMonthlyVerificationCount: number;
  unassignedApproverCount: number;
}

