# e-HADIR TUARAN — Panduan Penerapan (Deployment Guide)

## 1. Penyediaan Pangkalan Data Supabase
1. Cipta projek baharu di [Supabase Dashboard](https://supabase.com).
2. Pergi ke **SQL Editor**.
3. Jalankan skrip migrasi mengikut urutan:
   - `supabase/migrations/20261111000000_create_ehadir_schema.sql`
   - `supabase/migrations/20261111000001_seed_initial_zones_and_settings.sql`
   - `supabase/migrations/20261111000002_rls_and_security_policies.sql`
4. Dapatkan **Project URL** dan **anon key** daripada *Project Settings -> API*.

## 2. Penerapan ke Cloudflare Pages (CI/CD)

### Melalui Cloudflare Pages Dashboard
1. Log masuk ke akaun [Cloudflare Dashboard](https://dash.cloudflare.com).
2. Pergi ke **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**.
3. Pilih repositori GitHub `eHadir`.
4. Konfigurasikan tetapan binaan:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Tetapkan Pemboleh Ubah Persekitaran (Environment Variables):
   - `VITE_SUPABASE_URL`: URL projek Supabase anda
   - `VITE_SUPABASE_ANON_KEY`: Kunci anon Supabase
   - `VITE_GOOGLE_MAPS_API_KEY`: Kunci API Google Maps (pilihan)
   - `VITE_APP_NAME`: `e-HADIR TUARAN`
   - `VITE_ENABLE_MOCK_FALLBACK`: `false` (untuk mod pengeluaran sebenar)
6. Tekan **Save and Deploy**.

### Melalui GitHub Actions (Pilihan)
Fail alir kerja GitHub Actions boleh diletakkan di `.github/workflows/deploy.yml` untuk pemicu automatik setiap kali terdapat push ke cawangan `main`.

