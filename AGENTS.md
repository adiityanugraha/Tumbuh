<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Acuan AI Agent: Tumbuh

Dokumen ini adalah acuan untuk setiap AI Agent yang mengerjakan task di repository ini. Baca seluruhnya sebelum menulis kode. Blok di atas dibuat otomatis oleh Next.js dan dibiarkan apa adanya.

## Tujuan

Web edukasi untuk anak SD kelas 1-6: anak merawat kebun virtual dan menjelajah Peta Nusantara dengan belajar Matematika, IPAS, dan Bahasa Inggris setiap hari. Ada sisi guru dan orang tua. Spesifikasi lengkap: `docs/PRD.md` (sumber kebenaran fitur).

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript, `output: "export"` (situs statis, deploy ke hosting panitia).
- Tailwind CSS v4 (token di `src/app/globals.css` lewat `@theme`).
- `motion` untuk animasi, import dari `motion/react`.
- Vitest + Testing Library untuk test.
- Penyimpanan: localStorage lewat repository layer di `src/services/`.

Larangan teknis karena static export: tidak ada API route, server action, `cookies()`, `headers()`, atau fitur yang butuh server Node.js. Komponen yang memakai localStorage atau Web Speech API harus Client Component dan aman saat prerender (akses `window` hanya di effect/event).

## Struktur Folder

```
src/
  app/            route (lihat tabel route di PRD)
  components/     komponen UI bersama (Button, SpeakButton, Mascot, ...)
  features/
    child/        komponen sisi anak
    teacher/      komponen sisi guru
    parent/       komponen sisi orang tua
  lib/            pure function logika inti + test (*.test.ts di sebelahnya)
  services/       repository interface + implementasi localStorage
  data/           bank soal JSON per kelas/mapel, data tanaman, seed dummy
  assets/         SVG/gambar
docs/             PRD dan dokumen pendukung
```

Folder dibuat saat pertama kali dibutuhkan, bukan diisi file kosong.

## Aturan Kerja

1. **Jangan menjalankan perintah git** (commit, push, init). Pemilik repo yang melakukan commit. Di akhir tiap fase, usulkan pesan commit format Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`, `style:`, `perf:`) yang sesuai isi perubahan.
2. **Verifikasi sebelum bilang selesai**: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`. Untuk UI, jalankan dev server dan cek tampilan benar-benar ter-render di 360px dan desktop, tanpa error console. Jangan klaim berfungsi tanpa bukti.
3. **Transparan soal dummy/placeholder**: tandai di kode dengan `// DUMMY`, `// PLACEHOLDER`, atau `// VERIFY` (fakta yang perlu dicek manusia), tampilkan label di UI bila terlihat pengguna, dan catat di `README.md`.
4. **Jangan gunakan em-dash atau en-dash** di teks UI, dokumentasi, maupun komentar. Pakai "-" biasa.
5. Lingkungan Windows + PowerShell, tanpa Docker/WSL. Semua perintah harus jalan dengan Node.js native.
6. Semua teks UI dalam Bahasa Indonesia yang ramah anak (kecuali isi soal Bahasa Inggris).
7. Kerjakan per fase. Di akhir fase, berhenti dan laporkan: yang selesai, hasil verifikasi, yang masih dummy, pertanyaan. Tunggu persetujuan sebelum lanjut.
8. Bila ada keputusan ambigu atau bertentangan dengan PRD, tanyakan dulu, jangan menebak.
9. Kode sederhana dulu: tanpa abstraksi yang belum dibutuhkan, tanpa dependency baru bila bisa ditulis beberapa baris. Pengecualian: repository layer memang disengaja agar penyimpanan bisa diganti.
10. Privasi anak: hanya nama panggilan, tanpa analytics pihak ketiga, tanpa chat bebas.

## Konvensi Kode

- Komponen PascalCase, file komponen `NamaKomponen.tsx`. Hook `useNama.ts`. Pure function di `src/lib/` dengan nama kata kerja (`applyAnswer`, `getGrowthStage`).
- Logika bisnis tidak ditulis di dalam komponen. Komponen memanggil `src/lib` dan `src/services`.
- Warna, radius, dan font hanya lewat token Tailwind, bukan nilai hex langsung di komponen.
- Target sentuh minimal 48px (`min-h-touch`/`min-w-touch`).
- Animasi menghormati `prefers-reduced-motion`.

## Rencana Fase

0. Setup: scaffold, token desain, font, dokumen acuan, README, CREDITS.
1. Model data & logika inti: tipe, repository, pure function + unit test, seed tanaman, bank soal kelas 1-6, data kelas dummy.
2. Sisi anak: onboarding, Kebunku, sesi belajar, peta, koleksi, Kebun Kelas, narasi suara, maskot.
3. Sisi guru & orang tua + Mode Demo.
4. Aksesibilitas, performa, SEO (target Lighthouse mobile minimal 90).
5. Finalisasi: README, CREDITS, DEMO.md, build untuk hosting panitia.
