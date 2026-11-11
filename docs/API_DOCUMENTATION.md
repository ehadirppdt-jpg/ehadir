# e-HADIR TUARAN — Dokumentasi API & Edge Functions

## 1. Supabase REST Endpoints (PostgREST)

Semua permintaan API melalui Supabase Client mengguna pakai token JWT pengguna (`auth.uid()`) dan mematuhi polisi keselamatan peringkat baris (Row Level Security - RLS).

### A. Pengurusan Zon (`/rest/v1/zones`)
- `GET /rest/v1/zones?select=*,schools(count)` : Mendapatkan senarai 6 zon beserta bilangan sekolah berdaftar.
- `PATCH /rest/v1/zones?id=eq.{id}` : Mengemas kini maklumat zon (Super Admin sahaja).

### B. Pengurusan Sekolah (`/rest/v1/schools`)
- `GET /rest/v1/schools?select=*,school_zone_assignments(zone_id,zones(name,code))` : Mendapatkan sekolah bersama zon aktif.
- `POST /rest/v1/schools` : Menambah sekolah baharu.
- `PATCH /rest/v1/schools?id=eq.{id}` : Mengemas kini butiran sekolah / status.
- `DELETE /rest/v1/schools?id=eq.{id}` : Dinyahaktifkan jika mempunyai rekod operasi (soft delete).

### C. Penetapan Pegawai Pengesah Bulanan (`/rest/v1/monthly_approver_assignments`)
- `GET /rest/v1/monthly_approver_assignments?month=eq.{m}&year=eq.{y}` : Memeriksa penetapan pengesah bagi bulan dan tahun dipilih.
- `POST /rest/v1/monthly_approver_assignments` : Menetapkan atau meminda pegawai pengesah bagi sekolah.

---

## 2. Supabase Edge Functions

### A. Geofence & Device Validator (`/functions/v1/verify-geofence`)
Mengesahkan sama ada koordinat GPS berada dalam lingkungan geofence sekolah atau PPD Tuaran (150m) sebelum membenarkan clock-in/out.

**Request Payload:**
```json
{
  "user_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "school_id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
  "latitude": 6.1341200,
  "longitude": 116.2305400,
  "device_uuid": "f81d4fae-7dec-11d0-a765-00a0c91e6bf6"
}
```

**Response Payload:**
```json
{
  "valid": true,
  "is_at_ppd": true,
  "distance_to_ppd_meters": 12,
  "message": "Lokasi disahkan di Pejabat Pendidikan Daerah Tuaran (PPD Tuaran)"
}
```

### B. Penjana Laporan Kehadiran Bulanan Automatik (`/functions/v1/auto-monthly-submission`)
Dipanggil secara berjadual (Cron Job) pada setiap 1 hari bulan untuk mengagregat rekod kehadiran bulanan PGB dan mengagihkan kepada Pegawai Pengesah Zon.

**Response Payload:**
```json
{
  "status": "SUCCESS",
  "message": "Laporan bulanan bagi Bulan 10/2026 berjaya dijana dan diagihkan kepada Pegawai Pengesah Zon.",
  "month": 10,
  "year": 2026,
  "executed_at": "2026-11-01T00:00:00.000Z"
}
```

