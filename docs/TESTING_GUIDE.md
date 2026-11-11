# e-HADIR TUARAN — Panduan Pengujian & Senario Verifikasi (Testing Guide)

Dokumen ini merangkumi matriks ujian fungsian, keselamatan peranan, dan pengesahan pangkalan data bagi Portal Pentadbiran e-HADIR TUARAN.

## Matriks Pengujian Mengikut Peranan (Role Verification Matrix)

| Senario Ujian | Super Admin / Head Admin | Admin Zon | Monitoring Admin | PGB (Guru Besar/Pengetua) |
|---|---|---|---|---|
| Log Masuk Portal Pentadbiran | Dibenarkan (Akses Penuh) | Dibenarkan (Skop Terhad) | Dibenarkan (Read-Only) | **Disekat** (Ralat akses ditolak) |
| Paparan Papan Pemuka | Semua 6 Zon & Semua Sekolah | Zon & Sekolah Tugasan Sahaja | Semua Sekolah (Statistik sahaja) | Akses Ditolak |
| Pengurusan 6 Zon | Tambah/Kemaskini/Ubah Status | Paparan Sahaja | Paparan Sahaja | Akses Ditolak |
| Pengurusan Sekolah | Tambah, Edit, Import/Export | Sekolah Ditugaskan Sahaja | Paparan Sahaja | Akses Ditolak |
| Tetapan Geofence & Koordinat | Boleh Ubah (50m - 500m) | Paparan Sahaja | Paparan Sahaja | Akses Ditolak |
| Penetapan Pegawai Pengesah | Boleh Tetapkan / Pinda Pengesah | Paparan Penugasan Sendiri | Paparan Sahaja | Akses Ditolak |
| Semakan & Pengesahan Bulanan | Boleh Mengesah & Pantau Semua | Mengesah Sekolah Ditugaskan | Paparan Sahaja | Akses Ditolak |
| Tetapan Sistem Global | Boleh Kemaskini | Akses Ditolak | Akses Ditolak | Akses Ditolak |
| Semakan Audit Logs | Akses Penuh Jejak Audit | Jejak Audit Sendiri Sahaja | Akses Ditolak | Akses Ditolak |

---

## Senario Ujian Integriti Pangkalan Data

1. **Integriti Satu Zon Aktif Setiap Sekolah:**
   - Cuba masukkan penetapan zon kedua yang aktif untuk sekolah yang sama dalam jadual `school_zone_assignments`.
   - *Jangkaan:* Indeks unik separa `idx_school_zone_one_active` menyekat dan menghasilkan ralat duplikasi.

2. **Integriti Satu Pengesah Bulanan Utama:**
   - Cuba tetapkan 2 orang Admin Zon berbeza sebagai pengesah utama aktif bagi sekolah dan bulan yang sama dalam jadual `monthly_approver_assignments`.
   - *Jangkaan:* Indeks unik separa `idx_monthly_approver_active` menyekat penetapan bertindih.

3. **Kekebalan Rekod Audit Logs:**
   - Cuba laksanakan perintah `UPDATE` atau `DELETE` ke atas jadual `audit_logs`.
   - *Jangkaan:* Polisi RLS menyekat transaksi dengan ralat kebenaran ditolak (append-only).
