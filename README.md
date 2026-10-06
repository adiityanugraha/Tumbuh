# Tumbuh

Web edukasi untuk anak SD kelas 1-6. Anak merawat kebun virtual dan menjelajah Peta Nusantara dengan belajar Matematika, IPAS, dan Bahasa Inggris setiap hari. Guru dan orang tua bisa memantau progres dan memberi semangat.

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

Jalankan `npm run build`, lalu unggah seluruh isi folder `out/` ke direktori publik hosting (misalnya `public_html`). Tidak butuh Node.js di server.

## Status Dummy dan Placeholder

- `src/components/art.tsx`: maskot Kumbi, ilustrasi tanaman per tahap, pot, dan awan adalah SVG sederhana (PLACEHOLDER), dipoles di Fase 4.
- `src/features/child/PetaView.tsx`: bentuk dan posisi pulau di peta masih sketsa (PLACEHOLDER).
- `src/features/child/KoleksiView.tsx`: gambar tanaman di koleksi masih emoji (PLACEHOLDER), diganti ilustrasi SVG di Fase 4.
- Kebun Kelas memakai data teman sekelas dummy dan berlabel "Data contoh" di UI.
- `src/data/classroom.ts`: 19 teman sekelas, statistik topik, dan tantangan awal adalah DUMMY untuk Mode Demo.
- `src/data/plants.ts`: fakta 12 tanaman Nusantara bertanda VERIFY, wajib dicek manual.
- `src/data/questions/`: 288 soal (16 per mapel per kelas) disusun mengacu Kurikulum Merdeka, perlu ditinjau ulang oleh manusia sebelum lomba.
