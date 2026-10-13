# Tumbuh

Web edukasi untuk anak SD kelas 1-6. Anak merawat kebun virtual dan menjelajah Peta Nusantara dengan belajar Matematika, Bahasa Indonesia, IPAS, dan Bahasa Inggris setiap hari. Orang tua bisa melihat laporan belajar mingguan dan mengirim semangat.

Karya untuk M-ONE Telkomsel Coding Competition, Kategori Umum, tema "Innovating Education Through Technology", subtema "Web Education for Kids (untuk anak SD)".

- Spesifikasi produk: [`docs/PRD.md`](docs/PRD.md)
- Acuan AI Agent: [`AGENTS.md`](AGENTS.md)
- Sumber aset: [`CREDITS.md`](CREDITS.md)

## Stack

Next.js 16 (static export) + React 19 + TypeScript, Tailwind CSS v4, Motion, Vitest.

## Menjalankan

Butuh Node.js 22 atau lebih baru.

```bash
npm install
npm run dev        # dev server di http://localhost:3000
npm run lint
npm run typecheck
npm test
npm run build      # hasil statis di folder out/
npm run preview    # menyajikan folder out/ secara lokal
```

## Akun Anak dan Orang Tua (Supabase)

Bila Supabase dikonfigurasi, layar awal menanyakan **"Kamu siapa?"**:

- **Aku Anak**: daftar dengan nama pengguna, kata sandi, avatar, dan kelas, atau masuk dengan nama pengguna + kata sandi. Profil anak (ketuk avatar) menampilkan **kode keluarga** 6 karakter.
- **Saya Orang Tua**: daftar dengan nama pengguna, kata sandi, dan kode keluarga anak (ada bantuan cara menemukannya), lalu masuk berikutnya cukup nama pengguna + kata sandi. Satu akun orang tua bisa menghubungkan beberapa anak (tombol "+ Tambah anak").
- Kelas dipilih anak saat mendaftar. Setelah itu **hanya orang tua** yang bisa menggantinya (juga dikunci trigger di database).
- **Mode Demo** tetap tersedia tanpa akun untuk juri.

Tanpa konfigurasi Supabase, aplikasi memakai profil lokal tanpa akun seperti versi awal.

Pengaturan Supabase:

1. Buat project di [supabase.com](https://supabase.com).
2. Authentication > Sign In / Providers > Email: matikan **Confirm email** (nama pengguna dipetakan ke email internal `nama@tumbuh.app`, tidak ada email sungguhan).
3. SQL Editor: jalankan isi [`supabase/schema.sql`](supabase/schema.sql) (tabel `profiles`, `children`, `parent_links` dengan Row Level Security, trigger kunci kelas, fungsi `register_child`, `register_parent`, `link_child`).
4. Salin `.env.example` menjadi `.env.local`, isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Project Settings > API), lalu `npm run build`.

Cara kerja: localStorage tetap menjadi cache sehingga aplikasi cepat. Saat masuk, data diambil dari server; saat keluar, data di perangkat dihapus. Perubahan disinkronkan dengan menggabungkan data lokal dan server (`src/lib/sync.ts`: sesi dan pesan digabung per id, profil dan tantangan memakai versi terbaru, kebun dihitung ulang dari sesi) saat aplikasi dibuka, setelah setiap perubahan, dan tiap menit selama halaman terlihat. Lupa kata sandi belum didukung (rencana pengembangan).

## Pengaturan Pengguna

Ketuk avatar di pojok kanan atas (anak) atau lingkaran inisial (orang tua) untuk membuka **Pengaturan**: ganti avatar, suara (efek bunyi, kecepatan bacaan), tampilan (**mode gelap/terang**, huruf besar, kurangi animasi), ganti kata sandi, sapaan bawaan orang tua, dan kelola anak. Mode gelap memakai token warna yang sama (`src/app/globals.css`, `:root[data-theme="gelap"]`) dan dipasang sebelum halaman tampil sehingga tidak berkedip.

## Deploy

1. Set alamat situs (dan Supabase bila dipakai) di `.env.local`, atau lewat PowerShell:
   ```powershell
   $env:NEXT_PUBLIC_SITE_URL = "https://domain-hosting-panitia"; npm run build
   ```
   Tanpa variabel ini dipakai placeholder `https://tumbuh.example.com` (VERIFY, lihat `src/lib/site.ts`).
2. Unggah seluruh isi folder `out/` ke direktori publik hosting (misalnya `public_html`). Tidak butuh Node.js di server.
3. Untuk hosting Apache/cPanel, `out/.htaccess` ikut terunggah: kompresi, cache aset, dan halaman 404. Server lain mengabaikannya.

`npm run build` juga menjalankan `scripts/fix-segments.mjs`, yang menyalin file prefetch Next ke nama yang diminta browser (tanpa ini muncul error 404 di konsol pada build Windows).

## Kualitas (Lighthouse mobile, build statis, Mode Demo)

| Halaman | Performa | Aksesibilitas | Best Practices | SEO |
|---|---|---|---|---|
| Onboarding `/` | 100 | 100 | 100 | 100 |
| Kebunku, Belajar, Sesi belajar, Peta, Koleksi, Kartu Kata, Memori, Orang Tua | 93-100 | 100 | 100 | 100 |

Diukur 13 Okt 2026 dengan Lighthouse 12 (Edge headless) di laptop pengembang; angka performa bisa berbeda di server hosting.

## Status Dummy dan Placeholder

- `src/components/art.tsx`: maskot Kumbi, pot, dan awan adalah SVG sederhana (PLACEHOLDER).
- `src/components/PlantVisual.tsx`: ke-12 tanaman sudah punya ilustrasi 4 tahap.
- `src/data/demo.ts`: anak contoh "Dewi" beserta riwayat belajar seminggu beserta tantangan dari Ibu adalah DUMMY untuk tombol "Buka Mode Demo". Berlabel "Data contoh" di UI.
- `src/data/plants.ts`: fakta 12 tanaman Nusantara bertanda VERIFY, wajib dicek manual.
- `src/data/plant-info.ts`: status konservasi, manfaat, dan ukuran 12 tanaman bertanda VERIFY, wajib dicek manual.
- `src/data/culture.ts`: fakta budaya 6 wilayah (rumah adat, tarian, makanan, ungkapan) bertanda VERIFY, wajib dicek manual.
- `src/lib/site.ts`: alamat situs placeholder `https://tumbuh.example.com` (VERIFY), ganti lewat `NEXT_PUBLIC_SITE_URL` saat build.
- `src/data/vocab.ts`: 79 kosakata Kartu Kata (8 tema), perlu ditinjau ulang oleh manusia.
- `src/data/questions/`: 384 soal (16 per mapel per kelas, termasuk 96 soal Bahasa Indonesia baru) disusun mengacu Kurikulum Merdeka, perlu ditinjau ulang oleh manusia sebelum lomba.
