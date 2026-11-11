# e-HADIR TUARAN — PORTAL PENTADBIRAN (ADMIN PORTAL)
### Pejabat Pendidikan Daerah Tuaran (PPD Tuaran), Sabah

Sistem Pengurusan, Pemantauan, Konfigurasi dan Pengesahan Kehadiran Pengetua dan Guru Besar (PGB) bagi ~85 buah sekolah di bawah pentadbiran PPD Tuaran.

---

## 1. Ringkasan Seni Bina Sistem (Architecture Overview)

Sistem ini dibangunkan dengan pemisahan logik yang lengkap antara **Portal Pentadbiran (Admin Portal)** dan **Portal Pengguna (PGB User Portal)** bagi fasa hadapan. Pangkalan data PostgreSQL (Supabase) direka bentuk dengan 27 jadual berkanun, kekangan integriti, pencetus (triggers), dan dasar keselamatan peringkat baris (Row Level Security - RLS).

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
    ├── components/                                         # Komponen UI boleh guna semula
    ├── context/                                            # AuthContext (RBAC) & ToastContext
    ├── lib/                                                # Database Service, Geofence, Audit & Eksport
    ├── modules/                                            # 14 Modul Pentadbiran Utama
    └── types/                                              # Skema TypeScript komprehensif
```

---

## 2. Enam (6) Zon Pentadbiran Rasmi PPD Tuaran

| Kod Zon | Nama Zon Pentadbiran | Warna Pengenalan | Skop Kawasan |
|---|---|---|---|
| **Z01** | **ZON TENGHILAN** | `#0284C7` (Sky Blue) | Kawasan Pekan Tenghilan & Pedalaman |
| **Z02** | **ZON MENGKABONG** | `#0D9488` (Teal) | Kawasan Pesisir & Mengkabong |
| **Z03** | **ZON SULAMAN** | `#2563EB` (Royal Blue) | Kawasan Sulaman & Pekan Tuaran |
| **Z04** | **ZON KIULU** | `#7C3AED` (Purple) | Kawasan Lembah Kiulu & Bukit |
| **Z05** | **ZON NABALU** | `#D97706` (Amber) | Kawasan Kaki Gunung Kinabalu / Nabalu |
| **Z06** | **ZON TAMPARULI** | `#059669` (Emerald Green) | Kawasan Pekan Tamparuli & Sekitar |

> **Peraturan Integriti Zon:** Sekolah tidak diagihkan secara automatik. Ketua Pentadbir (Head Admin) menetapkan sekolah ke dalam zon masing-masing secara manual atau melalui fail import CSV/Excel. Setiap sekolah hanya mempunyai satu (1) zon aktif pada satu-satu masa.

---

## 3. Tahap Capaian & Peranan Pengguna (Role-Based Access Control - RBAC)

1. **SUPER ADMIN / HEAD ADMIN (Ketua Pentadbir)**
   - Akses penuh ke semua 6 zon dan 85 sekolah.
   - Mengurus akaun Admin Zon dan PGB.
   - Menetapkan Pegawai Pengesah Bulanan (*Monthly Approver Assignment*).
   - Menyelaras koordinat GPS dan radius geofence sekolah (50m - 500m).
   - Meminda tetapan global sistem dan menyemak semua rekod jejak audit (*audit logs*).

2. **ADMIN ZON (Pentadbir Zon)**
   - Terhad secara ketat kepada zon dan sekolah yang ditugaskan sahaja (*scoped permissions*).
   - Menyemak log kehadiran harian dan justifikasi ketidakhadiran/kelewatan.
   - Melaksanakan pengesahan bulanan (*verify, return for correction, reject*).
   - Menjana laporan bagi zon kawalannya.
   - Disekat daripada mengakses sekolah luar zon atau tetapan sistem global.

3. **MONITORING ADMIN (Pentadbir Pemantau)**
   - Akses melihat papan pemuka (*dashboard*), statistik dan laporan (*Read-Only*).
   - Tidak dibenarkan mengubah sebarang data, meluluskan justifikasi atau mengesahkan kehadiran.

4. **PGB (Pengetua dan Guru Besar)**
   - **Disekat secara langsung** daripada mengakses Portal Pentadbiran ini. Hanya dibenarkan pada Portal Pengguna fasa seterusnya.

---

## 4. Dua Lokasi Kehadiran Sah (Dual Geofenced Locations)

Setiap Pengetua dan Guru Besar (PGB) dipautkan kepada dua titik geofence yang sah:
1. **Sekolah Masing-Masing:** Perimeter bulat berpusat pada koordinat sekolah dengan radius boleh laras antara **50 meter hingga 500 meter** (piawai: 100m).
2. **Pejabat Pendidikan Daerah Tuaran (PPD Tuaran):**
   - **Latitud:** `6.1341200` | **Longitud:** `116.2305400`
   - **Radius:** `150 Meter`
   - Dibenarkan untuk semua PGB secara sah semasa menghadiri taklimat atau urusan rasmi jabatan.

---

## 5. Arahan Pemasangan & Pembangunan Tempatan

### Keperluan:
- Node.js v18+ atau v20+
- npm v9+

### Langkah Pemasangan:
```bash
# 1. Masuk ke direktori projek
cd eHadir

# 2. Pasang dependensi
npm install

# 3. Tetapkan pemboleh ubah persekitaran
cp .env.example .env

# 4. Jalankan pelayan pembangunan tempatan
npm run dev

# 5. Bina untuk pengeluaran (Production Build)
npm run build
```

---

## 6. Kredensial Ujian Demonstrasi (Quick Test Accounts)

Di laman log masuk (`/admin/login`), butang ujian pantas telah disediakan untuk menguji sempadan keselamatan peranan:

| Peranan | Emel Rasmi | Kata Laluan | Keterangan Ujian |
|---|---|---|---|
| **Head Admin** | `admin.super@ppdtuaran.edu.my` | `Password@123` | Akses penuh 6 zon & 85 sekolah |
| **Admin Zon** | `admin.tenghilan@ppdtuaran.edu.my` | `Password@123` | Dihadkan ke Zon Z01 & Z02 sahaja |
| **Monitoring** | `admin.monitoring@ppdtuaran.edu.my` | `Password@123` | Akses Read-Only sahaja |
| **Akaun PGB** | `khairul.abdullah@moe.gov.my` | `Password@123` | **Ujian Sekatan:** Log masuk disekat |

---

## 7. Penerapan ke Cloudflare Pages (Production)

1. Sambungkan repositori GitHub ke **Cloudflare Pages**.
2. Konfigurasi binaan:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
3. Masukkan pemboleh ubah persekitaran (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_OSM_TILE_URL`).
4. Tekan **Deploy**.

