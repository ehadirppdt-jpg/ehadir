# e-HADIR TUARAN — Aliran Kerja Sistem Pentadbiran (Admin Flowcharts)

## 1. Aliran Log Masuk & Kawalan Akses Berperingkat (RBAC Flowchart)

```mermaid
flowchart TD
    A([Pengguna Membuka /admin/login]) --> B[Masukkan Emel & Kata Laluan]
    B --> C{Pengesahan Kredensial Supabase Auth}
    
    C -- Tidak Sah --> D[Papar Ralat: Kredensial Tidak Sah]
    D --> B
    
    C -- Sah --> E{Semak Status Akaun Profiles}
    E -- INACTIVE / SUSPENDED --> F[Papar Ralat: Akaun Dinyahaktifkan. Sila Hubungi Super Admin]
    
    E -- ACTIVE --> G{Semak Kod Peranan Sistem}
    
    G -- PGB --> H[SEKAT: Akaun PGB Tidak Dibenarkan Mengakses Portal Admin]
    
    G -- SUPER_ADMIN --> I[Akses Penuh: 6 Zon, 85 Sekolah, Pengurusan Sistem, Audit Log]
    G -- ADMIN_ZON --> J[Akses Terhad: Sekolah & Kehadiran Dalam Zon Ditugaskan Sahaja]
    G -- MONITORING_ADMIN --> K[Akses Read-Only: Papan Pemuka & Laporan Tanpa Butang Mutasi]
    
    I --> L([Halaman /admin/dashboard])
    J --> L
    K --> L
```

## 2. Aliran Penetapan Pegawai Pengesah Bulanan (Monthly Approver Assignment)

```mermaid
flowchart TD
    S1([Head Admin Pilih Bulan & Tahun]) --> S2[Sistem Papar Senarai Sekolah Mengikut 6 Zon]
    S2 --> S3{Sekolah Mempunyai Pengesah Aktif?}
    
    S3 -- Belum Ada --> S4[Tanda: Lencana Merah 'Belum Ditetapkan']
    S3 -- Telah Ada --> S5[Tanda: Lencana Hijau 'Ditetapkan']
    
    S4 --> S6[Pilih Pegawai Admin Zon]
    S5 --> S7[Tukar Pegawai Pengesah]
    
    S6 --> S8[Sahkan Penetapan]
    S7 --> S8
    
    S8 --> S9[Simpan Rekod dalam monthly_approver_assignments]
    S9 --> S10[Cipta Rekod Audit Log & Notifikasi kepada Admin Zon]
    S10 --> S11([Penetapan Berjaya Tanpa Menjejaskan Arkib Sejarah Lalu])
```

## 3. Aliran Semakan & Pengesahan Kehadiran Bulanan

```mermaid
flowchart TD
    M1([Penjanaan Laporan Bulanan Automatik]) --> M2[Sistem Kumpul Rekod Kehadiran 1hb - Hujung Bulan]
    M2 --> M3{Ada Rekod Tidak Lengkap / Lewat?}
    
    M3 -- Ya --> M4[Lampirkan Justifikasi & Dokumen Sokongan]
    M3 -- Tidak --> M5[Status: Menunggu Semakan]
    M4 --> M5
    
    M5 --> M6[Agih kepada Pegawai Pengesah Ditugaskan]
    M6 --> M7[Admin Zon Buka Modul Pengesahan Bulanan]
    M7 --> M8[Semak Log Kehadiran Harian & Justifikasi]
    
    M8 --> M9{Keputusan Semakan}
    M9 -- Sahkan --> M10[Status: DISAHKAN - Cap Digital & Audit Trail Disimpan]
    M9 -- Kembalikan --> M11[Status: DIKEMBALIKAN - Catatan Pembetulan Direkodkan]
    M9 -- Tolak --> M12[Status: DITOLAK - Nyatakan Sebab Penolakan Rasmi]
    
    M10 --> M13([Selesai: Sedia Dijana Sebagai Laporan Rasmi PPD Tuaran])
    M11 --> M14([PGB Terima Notifikasi Pembetulan])
    M12 --> M14
```

