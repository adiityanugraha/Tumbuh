# Tumbuh

Web edukasi untuk anak SD kelas 1-6. Anak merawat kebun virtual dan menjelajah Peta Nusantara dengan belajar Matematika, Bahasa Indonesia, IPAS, dan Bahasa Inggris setiap hari. Orang tua bisa melihat laporan belajar mingguan dan mengirim semangat.

Karya untuk M-ONE Telkomsel Coding Competition, Kategori Umum, tema "Innovating Education Through Technology", subtema "Web Education for Kids (untuk anak SD)".

**Situs:** [tumbuhnusantara.m1sec.my.id](https://tumbuhnusantara.m1sec.my.id) (cadangan: [peserta61.m1sec.my.id](https://peserta61.m1sec.my.id))

| Dokumen | Isi |
|---|---|
| [`DEMO.md`](DEMO.md) | Panduan juri: mencoba semua fitur dalam sekitar 10 menit (Mode Demo tanpa akun) |
| [`docs/PRD.md`](docs/PRD.md) | Spesifikasi produk, sumber kebenaran fitur |
| [`AGENTS.md`](AGENTS.md) | Acuan AI Agent: stack, aturan kerja, rencana fase |
| [`docs/UI.md`](docs/UI.md) | Acuan visual (motif batik, warna, komponen) |
| [`docs/JURNAL_PROMPT.md`](docs/JURNAL_PROMPT.md) | 5 prompt pilihan: PRD, debugging, audit/optimasi, finishing, bebas |
| [`docs/LOG_PROMPT.md`](docs/LOG_PROMPT.md) | Log prompt mentah, disalin otomatis kata per kata |
| [`CREDITS.md`](CREDITS.md) | Sumber dan lisensi aset |

## Fitur

**Anak**
- **Kebunku**: tanaman Nusantara tumbuh dari jawaban benar (air dan pupuk), layu bila 3 hari tidak belajar tapi tidak pernah mati. Langit mengikuti jam, maskot Kumbi, streak, lencana, dan tantangan dari orang tua.
- **Belajar**: 4 mapel (Matematika, Bahasa Indonesia, IPAS, Bahasa Inggris) untuk kelas 1-6, 384 soal Kurikulum Merdeka dengan 4 tipe (pilihan ganda, isian angka, mencocokkan, mengurutkan). Ada Soal Hari Ini, latihan per topik, dan Siram Ulang untuk soal yang pernah salah. Soal bisa dibacakan (Web Speech API).
- **Peta Nusantara**: 6 wilayah terbuka bertahap, jalur ekspedisi, linimasa, dan Kenali Daerah (rumah adat, tarian, makanan, ungkapan).
- **Koleksi**: fakta, status konservasi, manfaat, dan ukuran tanaman dibanding tinggi badan anak.
- **Kartu Kata** (kosakata Inggris bergambar) dan **Memori Nusantara** (permainan memasangkan kartu).

**Orang tua**
- Laporan mingguan dalam bahasa sederhana, materi dikuasai vs perlu latihan per mapel.
- Kirim Semangat (stiker + pesan) dan Tantangan & Hadiah.
- Satu akun bisa terhubung ke beberapa anak lewat kode keluarga.

**Untuk semua**
- Pengaturan: mode gelap/terang, huruf besar, kurangi animasi, suara, avatar, tinggi badan.
- Mode Demo tanpa akun untuk juri. Tanpa iklan, analytics, atau chat bebas.

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

- **Aku Anak**: daftar dengan nama pengguna, kata sandi, laki-laki/perempuan, avatar, dan kelas, atau masuk dengan nama pengguna + kata sandi. Profil anak (ketuk avatar) menampilkan **kode keluarga** 6 karakter.
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

Ketuk avatar di pojok kanan atas (anak) atau lingkaran inisial (orang tua) untuk membuka **Pengaturan**: ganti avatar, **tinggi badan** (switch gambar anak laki-laki/perempuan dan meteran dinding yang bisa digeser, dipakai untuk perbandingan ukuran di Koleksi; bisa diisi anak maupun orang tua), suara (efek bunyi, kecepatan bacaan), tampilan (**mode gelap/terang**, huruf besar, kurangi animasi), ganti kata sandi, sapaan bawaan orang tua, dan kelola anak. Mode gelap memakai token warna yang sama (`src/app/globals.css`, `:root[data-theme="gelap"]`) dan dipasang sebelum halaman tampil sehingga tidak berkedip.

## Deploy

### Dokploy (dipakai untuk lomba)

Repo sudah berisi `Dockerfile` (Node 22 membangun situs statis, nginx menyajikan folder `out/`) dan `nginx.conf` (padanan `.htaccess`: kompresi, cache aset, halaman 404, redirect garis miring yang aman di belakang proxy).

1. **Push** repo ke GitHub (publik).
2. **Dokploy** > Create Project > Create Service > **Application**.
   - Provider: GitHub (atau Git dengan URL repo publik), branch `main`.
   - Build Type: **Dockerfile**, Docker File: `Dockerfile`.
3. **Environment** > Build-time Arguments (nilai `NEXT_PUBLIC_*` dibaca saat build, bukan saat jalan):
   ```
   NEXT_PUBLIC_SITE_URL=https://tumbuhnusantara.m1sec.my.id
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=anon-key-dari-supabase
   ```
   Tanpa dua variabel Supabase, situs tetap jalan dengan profil lokal tanpa akun.
4. **Deploy**, lalu pantau tab Logs sampai build selesai.
5. **Domains** > Add Domain: host `tumbuhnusantara.m1sec.my.id` (subdomain dari domain panitia), Path `/`, Container Port **80**. **Matikan HTTPS** karena domain panitia sudah di belakang Cloudflare (Cloudflare yang memasang HTTPS); bila dinyalakan, Traefik dan Cloudflare saling mengalihkan dan terjadi redirect loop.
6. Untuk domain sendiri (misalnya dari Hostinger): buat record **A** ke IP asli server Dokploy (bukan IP Cloudflare), lalu tambahkan host-nya di Domains dengan HTTPS dan Let's Encrypt.
7. Opsional: nyalakan **Auto Deploy** di Dokploy agar setiap push ke `main` langsung dideploy ulang.

### Hosting statis lain (cPanel/Apache)

1. Build dengan alamat situs, misalnya lewat PowerShell:
   ```powershell
   $env:NEXT_PUBLIC_SITE_URL = "https://tumbuhnusantara.m1sec.my.id"; npm run build
   ```
   Tanpa variabel ini dipakai alamat bawaan `https://tumbuhnusantara.m1sec.my.id` (lihat `src/lib/site.ts`).
2. Unggah seluruh isi folder `out/` ke direktori publik (misalnya `public_html`). `out/.htaccess` ikut terunggah untuk Apache.

`npm run build` juga menjalankan `scripts/fix-segments.mjs`, yang menyalin file prefetch Next ke nama yang diminta browser (tanpa ini muncul error 404 di konsol pada build Windows).

## Kualitas (Lighthouse mobile, situs live, Mode Demo)

| Halaman | Performa | Aksesibilitas | Best Practices | SEO |
|---|---|---|---|---|
| Layar awal `/` | 100 | 100 | 100 | 100 |
| Kebunku | 97 | 100 | 100 | 100 |
| Belajar | 97 | 100 | 100 | 100 |
| Sesi belajar (Matematika) | 98 | 100 | 100 | 100 |
| Peta | 92 | 100 | 100 | 100 |
| Koleksi | 97 | 100 | 100 | 100 |
| Kartu Kata | 98 | 100 | 100 | 100 |
| Memori | 100 | 100 | 100 | 100 |
| Orang Tua | 100 | 100 | 100 | 100 |

Diukur 14 Okt 2026 dengan Lighthouse 12 (Edge headless, emulasi mobile) terhadap situs yang sudah dideploy di Dokploy panitia (`https://peserta61.m1sec.my.id`, aplikasi yang sama dengan alamat utama).

## Status Dummy dan Placeholder

- `src/components/art.tsx`: maskot Kumbi, pot, dan awan adalah SVG sederhana (PLACEHOLDER).
- `src/components/PlantVisual.tsx`: ke-12 tanaman sudah punya ilustrasi 4 tahap.
- `src/data/demo.ts`: anak contoh "Dewi" beserta riwayat belajar seminggu beserta tantangan dari Ibu adalah DUMMY untuk tombol "Buka Mode Demo". Berlabel "Data contoh" di UI.
- `src/data/plants.ts`: fakta 12 tanaman Nusantara bertanda VERIFY, wajib dicek manual.
- `src/data/plant-info.ts`: status konservasi, manfaat, dan ukuran 12 tanaman bertanda VERIFY, wajib dicek manual.
- `src/data/culture.ts`: fakta budaya 6 wilayah (rumah adat, tarian, makanan, ungkapan) bertanda VERIFY, wajib dicek manual.
- `supabase/buka-lencana.sql`: skrip DUMMY untuk demo, menambahkan 14 sesi contoh ke satu akun anak agar semua lencana terbuka. Jangan dipakai untuk akun sungguhan.
- `src/lib/size.ts`: perkiraan tinggi anak per kelas (118-144 cm) saat tinggi badan belum diisi, bertanda VERIFY.
- `src/data/vocab.ts`: 79 kosakata Kartu Kata (8 tema), perlu ditinjau ulang oleh manusia.
- `src/data/questions/`: 384 soal (16 per mapel per kelas, termasuk 96 soal Bahasa Indonesia baru) disusun mengacu Kurikulum Merdeka, perlu ditinjau ulang oleh manusia sebelum lomba.
