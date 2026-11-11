# e-HADIR TUARAN — SISTEM PENGURUSAN KEHADIRAN PGB
### Pejabat Pendidikan Daerah Tuaran (PPD Tuaran), Sabah

Aplikasi pengurusan, pemantauan, konfigurasi dan pengesahan kehadiran digital berkanun untuk **Pengetua dan Guru Besar (PGB)** merangkumi ~85 buah sekolah di bawah Pejabat Pendidikan Daerah Tuaran.

---

## 1. Seni Bina Dwil-Portal (Dual-Portal Architecture)

Sistem ini merangkumi dua antara muka utama yang beroperasi di atas satu pangkalan data PostgreSQL berpusat (Supabase) dengan dasar keselamatan peringkat baris (Row Level Security - RLS):

1. **PORTAL PENTADBIRAN (ADMIN PORTAL):**
   - Dikhaskan untuk Pegawai PPD Tuaran (Super Admin / Head Admin, Admin Zon, dan Monitoring Admin).
   - Pengurusan 6 Zon rasmi, 85 sekolah, akaun pengguna, pemetaan Leaflet OpenStreetMap, tetapan geofence, penetapan pengesah bulanan, pemantauan kehadiran, semakan justifikasi, verifikasi bulanan, dan audit logs kebal (*append-only*).

2. **PORTAL PENGGUNA (PGB USER PORTAL - PWA):**
   - Dikhaskan untuk Pengetua dan Guru Besar (PGB).
   - Reka bentuk gelap moden (*Dark Navy UI*) menepati 100% susun atur visual mockup rasmi.
   - Modul Rekod Masuk & Keluar dengan **Aliran 5 Langkah Pengesahan**:
     1. Semakan Kesahan Peranti (Device Binding).
     2. Pengesahan Wajah Biometrik (Webcam Live Feed & Pengesanan Hayat / Liveness).
     3. Pengesanan Lokasi GPS (Ketepatan Tinggi navigator.geolocation).
     4. Semakan Geofence Haversine (Sekolah Anda atau PPD Tuaran).
     5. Transaksi Kehadiran Pelayan (Pengiraan Wajib Minimum 9 Jam Bekerja / 540 Minit).
   - Kalendar kehadiran interaktif dengan 6 petunjuk warna rasmi.
   - Penyerahan justifikasi rasmi mengikut 9 kategori.
   - Status pengesahan bulanan automatik dan eksport penyata ke format PDF.
   - Pengurusan peranti berdaftar dan keselamatan biometrik.

---

## 2. Struktur Direktori Projek

```
eHadir/
├── supabase/
│   ├── migrations/
│   │   ├── 20261111000000_create_ehadir_schema.sql         # 27 Jadual teras, enums & indeks
│   │   ├── 20261111000001_seed_initial_zones_and_settings.sql # 6 Zon rasmi & konfigurasi
│   │   └── 20261111000002_rls_and_security_policies.sql      # Dasar RLS & kekebalan audit log
│   └── functions/
│       ├── verify-geofence/index.ts                        # Server-side Geofence Haversine Validator
│       └── auto-monthly-submission/index.ts                # Auto scheduler pengesahan bulanan
├── docs/
│   ├── DATABASE_ERD.md                                     # Gambar rajah ERD Mermaid
│   ├── FLOWCHART.md                                        # Carta alir kerja log masuk, pengesah & semakan
│   ├── API_DOCUMENTATION.md                                # Spesifikasi PostgREST & Edge Functions
│   ├── TESTING_GUIDE.md                                    # Matriks pengujian peranan & keselamatan
│   └── DEPLOYMENT.md                                       # Panduan Cloudflare Pages & CI/CD
├── templates/
│   ├── template_import_sekolah.csv                         # Templat rasmi import sekolah
│   └── template_import_pgb.csv                             # Templat rasmi import akaun PGB
└── src/
    ├── components/                                         # Komponen UI boleh guna semula (Layout & Map)
    ├── context/                                            # AuthContext (Dwil-Portal RBAC) & ToastContext
    ├── lib/                                                # Database Service, Geofence, Audit & Eksport PDF
    ├── modules/
    │   ├── approver-assignments/                           # Penetapan Pengesah Bulanan (Admin)
    │   ├── attendance/                                     # Pemantauan Kehadiran & Semakan Justifikasi
    │   ├── auth/                                           # Halaman Log Masuk Bersepadu (PGB & Admin)
    │   ├── dashboard/                                      # Dashboard Pentadbiran PPD
    │   ├── locations/                                      # Peta Leaflet Sekolah & Geofence Interaktif
    │   ├── profile/                                        # Profil Pentadbir
    │   ├── schools/                                        # Pengurusan Sekolah (~85 Buah)
    │   ├── system/                                         # Audit Log, Laporan & Notifikasi
    │   ├── users/                                          # Pengurusan Pentadbir & Akaun PGB
    │   ├── verification/                                   # Verifikasi Bulanan (PDF Export)
    │   ├── zones/                                          # Pengurusan 6 Zon Pentadbiran
    │   └── user-portal/                                    # FASA 2: PORTAL PENGGUNA (PGB)
    │       ├── components/
    │       │   ├── UserLayout.tsx                          # Header Mockup, Drawer & Bottom Bar PWA
    │       │   └── AttendanceActionModal.tsx               # 5-Langkah Biometrik Wajah + Geofence
    │       └── pages/
    │           ├── UserDashboardPage.tsx                   # Dashboard Gelap Mengikut Mockup
    │           ├── UserCalendarPage.tsx                    # Kalendar 6 Warna & Perincian Harian
    │           ├── UserAttendanceHistoryPage.tsx           # Sejarah Kehadiran & Eksport PDF
    │           ├── UserJustificationsPage.tsx              # 9 Kategori Justifikasi & Lampiran
    │           ├── UserMonthlyReportPage.tsx               # Verifikasi Bulanan Automatik
    │           ├── UserProfilePage.tsx                     # Profil PGB, Biometrik & Peranti
    │           ├── UserDevicePage.tsx                      # Pengikatan Peranti (Device Binding)
    │           └── UserNotificationsPage.tsx               # Pusat Notifikasi & Makluman
    └── types/                                              # Skema TypeScript komprehensif
```

---

## 3. Enam (6) Zon Pentadbiran Rasmi PPD Tuaran

| Kod Zon | Nama Zon Pentadbiran | Warna Pengenalan | Skop Kawasan |
|---|---|---|---|
| **Z01** | **ZON TENGHILAN** | `#0284C7` (Sky Blue) | Kawasan Pekan Tenghilan & Pedalaman |
| **Z02** | **ZON MENGKABONG** | `#0D9488` (Teal) | Kawasan Pesisir & Mengkabong |
| **Z03** | **ZON SULAMAN** | `#2563EB` (Royal Blue) | Kawasan Sulaman & Pekan Tuaran |
| **Z04** | **ZON KIULU** | `#7C3AED` (Purple) | Kawasan Lembah Kiulu & Bukit |
| **Z05** | **ZON NABALU** | `#D97706` (Amber) | Kawasan Kaki Gunung Kinabalu / Nabalu |
| **Z06** | **ZON TAMPARULI** | `#059669` (Emerald Green) | Kawasan Pekan Tamparuli & Sekitar |

---

## 4. Peraturan Masa & Waktu Bekerja (Wajib Cukup 9 Jam)

Sesuai dengan arahan pentadbiran terkini:
- **Tiada Had Masa Rasmi Clock-In:** Pengetua dan Guru Besar mempunyai fleksibiliti waktu masuk.
- **Kecukupan 9 Jam Bekerja (540 Minit):** Setiap rekod kehadiran harian wajib mencatatkan perbezaan masa bertugas sekurang-kurangnya **540 minit (9 jam)** untuk diklasifikasikan sebagai `LENGKAP`.
- **Kekurangan Jam:** Rekod yang mencatatkan masa kurang daripada 540 minit akan diklasifikasikan sebagai `TIDAK_LENGKAP` dan menjana keperluan justifikasi rasmi secara automatik.
- **Lokasi Dibenarkan:** Kehadiran hanya sah jika direkodkan di dalam radius geofence (50m–500m) bagi:
  1. Sekolah yang ditugaskan kepada PGB; ATAU
  2. Pejabat Pendidikan Daerah Tuaran (PPD Tuaran).

---

## 5. Integrasi Peta & GPS Tanpa Google Maps API

Sistem mematuhi peraturan ketat **bebas sepenuhnya daripada Google Maps API**:
- **Pustaka Pemetaan:** Leaflet.js
- **Sumber Data Peta & Jubin:** OpenStreetMap (OSM) Standard Raster Tiles dengan atribusi rasmi:  
  `© OpenStreetMap contributors`
- **Formula Pengiraan Jarak:** Formula Matematik Haversine disahkan pada pelayan:
  $$\Delta\sigma = 2 \arcsin \left( \sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)} \right)$$
- **Geofence PPD Tuaran:** Boleh dikonfigurasi secara interaktif (penanda boleh seret, klik-untuk-letak koordinat, dan gelangsar radius 50m–500m) sama seperti sekolah.

---

## 6. Kredensial Log Masuk & Akaun Demonstrasi Pantas

Akses sistem di `http://localhost:3000/`. Pada halaman log masuk, terdapat penukar tab pantas antara **Portal Pengguna (PGB)** dan **Portal Pentadbiran**:

### A. Akaun PGB (Portal Pengguna)
- **Pn. Sarah binti Othman** (Pengetua SMK Badin, Zon Mengkabong): `sarah.othman@moe.gov.my`
- **En. Mohd Khairul bin Abdullah** (Guru Besar SK Pekan Tuaran, Zon Sulaman): `khairul.abdullah@moe.gov.my`
- **En. Justine Jikunan** (Guru Besar SK Tenghilan, Zon Tenghilan): `justine.jikunan@moe.gov.my`
- **En. Richard bin Gampalid** (Guru Besar SK Kiulu, Zon Kiulu): `richard.gampalid@moe.gov.my`
- *Kata Laluan Umum Demo:* `Password@123`

### B. Akaun Pentadbiran (Admin Portal)
- **Super Admin / Head Admin:** `admin.super@ppdtuaran.edu.my`
- **Admin Zon (Tenghilan & Mengkabong):** `admin.tenghilan@ppdtuaran.edu.my`
- **Monitoring Admin (Read-Only):** `admin.monitoring@ppdtuaran.edu.my`
- *Kata Laluan Umum Demo:* `Password@123`

---

## 7. Pengesahan Kualiti & Ujian Sistem

Pengesahan binari dan ujian unit:
```bash
# Menjalankan keseluruhan suite pengujian (56 ujian automatik)
npm test

# Menjalankan binaan pengeluaran (production build)
npm run build
```

Semua 56 ujian disahkan lulus dengan rekod tanpa ralat:
- [x] Formula Haversine & Batas Geofence 50m–500m
- [x] 6 Zon Rasmi PPD Tuaran & Warna Emerald Green Zon Tamparuli
- [x] 27 Jadual Skema PostgreSQL, Kekangan RLS & Append-Only Audit Logs
- [x] Templat Rasmi Import CSV Sekolah & PGB
- [x] OpenStreetMap & Ketiadaan Google Maps API
- [x] Portal Pengguna (PGB): Mockup Visual Fidelity, 5-Step Biometric/GPS Modal, Kalendar 6 Warna, 9 Kategori Justifikasi, dan Dwil-Portal Routing
