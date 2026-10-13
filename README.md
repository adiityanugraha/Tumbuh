# Tumbuh

Web edukasi untuk anak SD kelas 1-6. Anak merawat kebun virtual dan menjelajah Peta Nusantara dengan belajar Matematika, IPAS, dan Bahasa Inggris setiap hari. Orang tua bisa melihat laporan belajar mingguan dan mengirim semangat.

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

## Deploy

1. Set alamat situs agar sitemap, robots, dan Open Graph memakai domain yang benar (PowerShell):
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
- `src/data/questions/`: 288 soal (16 per mapel per kelas) disusun mengacu Kurikulum Merdeka, perlu ditinjau ulang oleh manusia sebelum lomba.
