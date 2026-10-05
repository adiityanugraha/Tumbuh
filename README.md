# Kebun Belajar Nusantara

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

- `src/app/page.tsx`: halaman awal sementara (PLACEHOLDER), diganti onboarding di Fase 2.
# Tumbuh
