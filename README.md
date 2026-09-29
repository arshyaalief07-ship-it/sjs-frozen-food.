# SJS Frozen Food — Website

React + TypeScript + Vite + Tailwind + Supabase. Siap di-deploy ke Vercel.

## 1. Setup Supabase
1. Buat project baru di https://supabase.com.
2. Buka **SQL Editor**, jalankan berurutan:
   1. `supabase/schema.sql` (tabel, RLS, bucket storage, policy)
   2. `supabase/seed.sql` (kategori, 6 produk contoh, 3 kontak WhatsApp, pengaturan default)
3. Buka **Authentication > Users > Add user**, buat akun admin (email + password, centang auto-confirm).
4. Jadikan akun itu admin (SQL Editor):
   ```sql
   update public.profiles set role = 'admin' where email = 'email-admin-kamu@contoh.com';
   ```
5. Ambil **Project URL** dan **anon / publishable key** di *Project Settings > API*.
   Jangan pernah memakai `service_role` key di frontend.

## 2. Jalankan lokal
```bash
npm install
cp .env.example .env     # isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY
npm run dev
```
Buka http://localhost:5173. Admin: http://localhost:5173/admin/login

## 3. GitHub
```bash
git init && git add . && git commit -m "SJS Frozen Food"
git branch -M main
git remote add origin https://github.com/USERNAME/sjs-frozen-food.git
git push -u origin main
```

## 4. Deploy ke Vercel
1. Import repo di https://vercel.com/new (preset Vite terdeteksi otomatis).
2. Tambahkan Environment Variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
3. Deploy. `vercel.json` sudah mengatur rewrite agar rute seperti `/produk/:id` dan `/admin` berfungsi.

## Upload gambar (Admin > Website / Produk / Promo)
- Pilih file -> preview lokal -> file BARU diunggah ke Supabase Storage hanya saat menekan **Simpan**.
- Setelah database berhasil diperbarui, gambar lama dihapus otomatis. Bila penyimpanan gagal, file baru dihapus kembali (tidak ada file yatim).
- Bucket: `product-images`, `promo-images`, `site-images` (logo, favicon, hero). Favicon dari Supabase dipasang otomatis oleh `SiteHead`.
- Format: JPG, PNG, WEBP, GIF, SVG, ICO; maksimal 5 MB.

## Peta
Bagian lokasi memakai iframe `google.com/maps?...&output=embed` (tanpa API key). Tombol "Lihat Lokasi di Google Maps" selalu tersedia walau peta gagal dimuat.

## Catatan
- Semua konten (produk, kategori, promo, kontak WhatsApp, hero, teks, alamat, SEO) diubah dari `/admin`.
- Hak akses admin dijaga oleh RLS di database (fungsi `is_admin()`), bukan hanya disembunyikan di UI.
- Gambar diunggah ke bucket `product-images`, `promo-images`, `site-images`.
- Promo kedaluwarsa otomatis tidak tampil (difilter berdasarkan `start_at` / `end_at`).
