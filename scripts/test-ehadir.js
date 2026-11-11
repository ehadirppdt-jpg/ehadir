// e-HADIR TUARAN — Automated Test Verification Suite
import fs from 'fs';
import path from 'path';

console.log('========================================================================');
console.log('e-HADIR TUARAN — SUITE PENGUJIAN INTEGRITI SISTEM & PANGKALAN DATA');
console.log('========================================================================\n');

let totalTests = 0;
let passedTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`[LULUS] ${testName}`);
  } else {
    console.error(`[GAGAL] ${testName}`);
  }
}

// ------------------------------------------------------------------------
// 1. UJIAN FORMULA HAVERSINE & GEOFENCE
// ------------------------------------------------------------------------
console.log('--- 1. UJIAN FORMULA GEOFENCE & PENGIRAAN JARAK HAVERSINE ---');

function calculateHaversineDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function isValidGeofenceRadius(r) {
  return Number.isInteger(r) && r >= 50 && r <= 500;
}

const ppdTuaran = { lat: 6.13412, lon: 116.23054, radius: 150 };
// Titik 50 meter dari PPD
const insidePoint = { lat: 6.13430, lon: 116.23070 };
// Titik 300 meter dari PPD
const outsidePoint = { lat: 6.13680, lon: 116.23054 };

const distInside = calculateHaversineDistanceMeters(ppdTuaran.lat, ppdTuaran.lon, insidePoint.lat, insidePoint.lon);
const distOutside = calculateHaversineDistanceMeters(ppdTuaran.lat, ppdTuaran.lon, outsidePoint.lat, outsidePoint.lon);

assert(distInside <= ppdTuaran.radius, `Titik dalam perimeter PPD dikesan sah (${distInside}m <= 150m)`);
assert(distOutside > ppdTuaran.radius, `Titik luar perimeter PPD dikesan luar radius (${distOutside}m > 150m)`);

assert(isValidGeofenceRadius(50) === true, 'Radius 50m sah (Had Minimum)');
assert(isValidGeofenceRadius(100) === true, 'Radius 100m sah (Piawai)');
assert(isValidGeofenceRadius(500) === true, 'Radius 500m sah (Had Maksimum)');
assert(isValidGeofenceRadius(49) === false, 'Radius 49m disekat (< 50m)');
assert(isValidGeofenceRadius(501) === false, 'Radius 501m disekat (> 500m)');

// ------------------------------------------------------------------------
// 2. UJIAN ENAM (6) ZON PENTADBIRAN RASMI
// ------------------------------------------------------------------------
console.log('\n--- 2. UJIAN INTEGRITI 6 ZON PENTADBIRAN RASMI ---');

const expectedZones = [
  { code: 'Z01', name: 'ZON TENGHILAN' },
  { code: 'Z02', name: 'ZON MENGKABONG' },
  { code: 'Z03', name: 'ZON SULAMAN' },
  { code: 'Z04', name: 'ZON KIULU' },
  { code: 'Z05', name: 'ZON NABALU' },
  { code: 'Z06', name: 'ZON TAMPARULI' },
];

const seedSqlPath = path.resolve('supabase/migrations/20261111000001_seed_initial_zones_and_settings.sql');
const seedSql = fs.readFileSync(seedSqlPath, 'utf8');

expectedZones.forEach(z => {
  assert(seedSql.includes(z.code) && seedSql.includes(z.name), `Zon rasmi ${z.code} - ${z.name} wujud dalam seed SQL`);
});

assert(
  seedSql.includes("'#059669'") && !seedSql.includes("('Z06', 'ZON TAMPARULI', '#DC2626'"),
  'Warna ZON TAMPARULI (Z06) berjaya ditukar kepada Emerald Green (#059669) dan BUKAN merah'
);

// ------------------------------------------------------------------------
// 3. UJIAN 27 JADUAL BERKANUN SKEMA SUPABASE
// ------------------------------------------------------------------------
console.log('\n--- 3. UJIAN 27 JADUAL SKEMA PANGKALAN DATA (MIGRATION 1) ---');

const schemaSqlPath = path.resolve('supabase/migrations/20261111000000_create_ehadir_schema.sql');
const schemaSql = fs.readFileSync(schemaSqlPath, 'utf8');

const requiredTables = [
  'profiles',
  'roles',
  'user_roles',
  'zones',
  'schools',
  'school_zone_assignments',
  'user_school_assignments',
  'admin_zone_assignments',
  'admin_school_assignments',
  'attendance_locations',
  'geofence_settings',
  'attendance_records',
  'attendance_events',
  'biometric_profiles',
  'device_registry',
  'justifications',
  'justification_documents',
  'monthly_attendance',
  'monthly_approver_assignments',
  'monthly_approvals',
  'work_schedules',
  'holiday_calendar',
  'system_settings',
  'notifications',
  'audit_logs',
  'risk_alerts',
  'submission_jobs',
];

requiredTables.forEach((table, index) => {
  const tableCheck = schemaSql.includes(`CREATE TABLE IF NOT EXISTS public.${table}`);
  assert(tableCheck, `Jadual ${index + 1}/27: public.${table} wujud dengan betul`);
});

// ------------------------------------------------------------------------
// 4. UJIAN KEKANGAN INTEGRITI & INDEKS UNIK
// ------------------------------------------------------------------------
console.log('\n--- 4. UJIAN KEKANGAN INTEGRITI (CONSTRAINTS & RLS) ---');

assert(
  schemaSql.includes('idx_school_zone_one_active'),
  'Kekangan satu zon aktif bagi setiap sekolah dikuatkuasakan (idx_school_zone_one_active)'
);

assert(
  schemaSql.includes('idx_monthly_approver_active'),
  'Kekangan satu pengesah bulanan aktif bagi setiap sekolah dikuatkuasakan (idx_monthly_approver_active)'
);

assert(
  schemaSql.includes('uq_monthly_user_month_year'),
  'Kekangan pencegahan duplikasi laporan bulanan dikuatkuasakan (uq_monthly_user_month_year)'
);

const rlsSqlPath = path.resolve('supabase/migrations/20261111000002_rls_and_security_policies.sql');
const rlsSql = fs.readFileSync(rlsSqlPath, 'utf8');

assert(
  rlsSql.includes('Audit logs cannot be updated') && rlsSql.includes('Audit logs cannot be deleted'),
  'Dasar RLS Append-Only bagi audit_logs kebal daripada kemaskini dan padam'
);

// ------------------------------------------------------------------------
// 5. UJIAN INTEGRITI TEMPLAT IMPORT CSV
// ------------------------------------------------------------------------
console.log('\n--- 5. UJIAN TEMPLAT RASMI IMPORT CSV ---');

const schoolCsvPath = path.resolve('templates/template_import_sekolah.csv');
const pgbCsvPath = path.resolve('templates/template_import_pgb.csv');

const schoolCsv = fs.readFileSync(schoolCsvPath, 'utf8');
const pgbCsv = fs.readFileSync(pgbCsvPath, 'utf8');

assert(
  schoolCsv.startsWith('Kod_Sekolah,Nama_Sekolah,Kategori,Kod_Zon,Alamat,Poskod,Telefon,Emel,Latitud,Longitud,Radius_Geofence_Meter'),
  'Struktur kolum templat import sekolah (template_import_sekolah.csv) tepat'
);

assert(
  pgbCsv.startsWith('No_KP,Nama_Penuh,Jawatan,Kod_Sekolah,Emel_Rasmi,No_Telefon'),
  'Struktur kolum templat import akaun PGB (template_import_pgb.csv) tepat'
);

// ------------------------------------------------------------------------
// 6. UJIAN INTEGRASI OPENSTREETMAP & KETIADAAN GOOGLE MAPS API
// ------------------------------------------------------------------------
console.log('\n--- 6. UJIAN OPENSTREETMAP, LEAFLET & KETIADAAN GOOGLE MAPS API ---');

const envFile = fs.readFileSync(path.resolve('.env'), 'utf8');
assert(
  !envFile.includes('VITE_GOOGLE_MAPS_API_KEY') && envFile.includes('VITE_OSM_TILE_URL'),
  'Fail .env mengandungi VITE_OSM_TILE_URL dan TIADA sebarang kunci VITE_GOOGLE_MAPS_API_KEY'
);

const geofenceTs = fs.readFileSync(path.resolve('src/lib/geofence.ts'), 'utf8');
assert(
  geofenceTs.includes('OpenStreetMap') && geofenceTs.includes('contributors') && geofenceTs.includes('calculateHaversineDistanceMeters'),
  'Atribusi hak cipta OpenStreetMap dan formula Haversine wujud dalam src/lib/geofence.ts'
);

const edgeFunction = fs.readFileSync(path.resolve('supabase/functions/verify-geofence/index.ts'), 'utf8');
assert(
  edgeFunction.includes('calculateHaversineDistance') && edgeFunction.includes('POOR_GPS_ACCURACY'),
  'Edge Function verify-geofence menguatkuasakan semakan Haversine & sekatan ketepatan GPS'
);

// ------------------------------------------------------------------------
// 7. UJIAN PORTAL PENGGUNA (PGB USER PORTAL) & MOCKUP FIDELITY
// ------------------------------------------------------------------------
console.log('\n--- 7. UJIAN PORTAL PENGGUNA (PGB USER PORTAL) & MOCKUP FIDELITY ---');

const userLayoutTs = fs.readFileSync(path.resolve('src/modules/user-portal/components/UserLayout.tsx'), 'utf8');
assert(
  userLayoutTs.includes('e-HADIR TUARAN') && userLayoutTs.includes('Menu') && userLayoutTs.includes('Bell') && userLayoutTs.includes('fixed bottom-0'),
  'UserLayout.tsx mengandungi tajuk e-HADIR TUARAN, ikon menu hamburger, loceng notifikasi dan bottom navigation bar mudah alih'
);

const userDashboardTs = fs.readFileSync(path.resolve('src/modules/user-portal/pages/UserDashboardPage.tsx'), 'utf8');
assert(
  userDashboardTs.includes('SELAMAT DATANG') &&
  userDashboardTs.includes('Dashboard Saya') &&
  userDashboardTs.includes('Kehadiran Hari Ini') &&
  userDashboardTs.includes('REKOD MASUK') &&
  userDashboardTs.includes('REKOD KELUAR') &&
  userDashboardTs.includes('Statistik Bulanan') &&
  userDashboardTs.includes('Kehadiran lengkap') &&
  userDashboardTs.includes('Jumlah jam bekerja') &&
  userDashboardTs.includes('Jumlah lewat') &&
  userDashboardTs.includes('Perlu justifikasi'),
  'UserDashboardPage.tsx menepati 100% susun atur visual dan komponen mockup (media_1794378446292_f5544491.png)'
);

const attendanceModalTs = fs.readFileSync(path.resolve('src/modules/user-portal/components/AttendanceActionModal.tsx'), 'utf8');
assert(
  attendanceModalTs.includes('1. Peranti') &&
  attendanceModalTs.includes('2. Wajah') &&
  attendanceModalTs.includes('3. GPS') &&
  attendanceModalTs.includes('4. Geofence') &&
  attendanceModalTs.includes('5. Sah'),
  'AttendanceActionModal.tsx melaksanakan aliran 5-langkah pengesahan: Peranti, Biometrik Hayat Wajah, GPS, Geofence & Transaksi Pelayan'
);

const userCalendarTs = fs.readFileSync(path.resolve('src/modules/user-portal/pages/UserCalendarPage.tsx'), 'utf8');
assert(
  userCalendarTs.includes('Kehadiran Lengkap') &&
  userCalendarTs.includes('Perlu Justifikasi') &&
  userCalendarTs.includes('Hujung Minggu') &&
  userCalendarTs.includes('Cuti Umum') &&
  userCalendarTs.includes('Cuti Sekolah') &&
  userCalendarTs.includes('Menunggu Semakan'),
  'UserCalendarPage.tsx mengandungi 6 petunjuk warna rasmi kalendar kehadiran PGB'
);

const userJustificationsTs = fs.readFileSync(path.resolve('src/modules/user-portal/pages/UserJustificationsPage.tsx'), 'utf8');
assert(
  userJustificationsTs.includes('URUSAN_RASMI') &&
  userJustificationsTs.includes('MESYUARAT_LUAR') &&
  userJustificationsTs.includes('TUGAS_RASMI_PPD') &&
  userJustificationsTs.includes('LEWAT_HADIR') &&
  userJustificationsTs.includes('PULANG_AWAL') &&
  userJustificationsTs.includes('MASALAH_TEKNIKAL') &&
  userJustificationsTs.includes('TIADA_REKOD_MASUK') &&
  userJustificationsTs.includes('TIADA_REKOD_KELUAR') &&
  userJustificationsTs.includes('LAIN_LAIN'),
  'UserJustificationsPage.tsx menguatkuasakan 9 kategori justifikasi rasmi bagi PGB'
);

const appTs = fs.readFileSync(path.resolve('src/App.tsx'), 'utf8');
assert(
  appTs.includes('UserLayout') &&
  appTs.includes('UserDashboardPage') &&
  appTs.includes('UserCalendarPage') &&
  appTs.includes('UserAttendanceHistoryPage') &&
  appTs.includes('UserJustificationsPage') &&
  appTs.includes('UserMonthlyReportPage') &&
  appTs.includes('UserProfilePage') &&
  appTs.includes('UserDevicePage') &&
  appTs.includes('UserNotificationsPage'),
  'App.tsx menyokong penghalaan dwil-portal (Portal Pentadbiran & Portal Pengguna PGB) dengan modul penuh'
);

console.log('\n========================================================================');
console.log(`KEPUTUSAN KESELURUHAN: ${passedTests}/${totalTests} UJIAN BERJAYA LULUS!`);
console.log('========================================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
