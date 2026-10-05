# Prompt Handoff untuk Claude Code

Salin seluruh isi di bawah garis ke Claude Code. Letakkan `BLUEPRINT.md` di root folder proyek sebelum mulai.

---

Saya sedang mengikuti lomba web bertema "menunjang semangat belajar anak SD". Saya ingin kamu membangun web app **Kebun Belajar Nusantara** sesuai spesifikasi di `BLUEPRINT.md` (baca seluruhnya dulu sebelum menulis kode).

## Aturan kerja

1. **Jangan commit atau push ke git** kecuali saya minta secara eksplisit.
2. **Verifikasi sebelum bilang selesai**: jalankan build, lint, type-check, dan test. Untuk UI, jalankan dev server dan cek tampilannya benar-benar ter-render. Jangan klaim sesuatu berfungsi tanpa bukti.
3. **Transparan soal dummy/placeholder**: setiap data contoh, aset placeholder, atau fitur yang belum benar-benar berfungsi harus ditandai jelas di kode (komentar `// DUMMY` atau `// PLACEHOLDER`) dan di UI bila terlihat pengguna. Catat juga di `README.md`.
4. **Jangan gunakan karakter em-dash atau en-dash** di teks UI, dokumentasi, maupun komentar. Pakai tanda "-" biasa.
5. Lingkungan saya Windows tanpa Docker dan WSL. Semua perintah harus jalan di Node.js native (PowerShell).
6. Semua teks UI dalam Bahasa Indonesia yang ramah anak.
7. Kerjakan per fase di bawah. Di akhir tiap fase, berhenti dan laporkan: apa yang selesai, hasil verifikasi, apa yang masih dummy, dan pertanyaan bila ada. Tunggu persetujuan saya sebelum lanjut ke fase berikutnya.
8. Jika ada keputusan yang ambigu atau bertentangan dengan blueprint, tanyakan dulu, jangan menebak.

## Fase 0: Setup & Rencana

- Tanyakan apakah saya punya guidebook atau aturan teknis lomba (batasan framework, larangan aset AI, format pengumpulan, tenggat). Sesuaikan rencana bila ada.
- Scaffold proyek: Vite + React + TypeScript + Tailwind CSS, ESLint, Prettier, Vitest + Testing Library.
- Siapkan struktur folder: `components/`, `features/` (child, teacher, parent), `data/` (bank soal JSON, data tanaman), `services/` (repository layer), `assets/`.
- Siapkan design tokens di Tailwind (warna, radius, ukuran font, ukuran target sentuh minimal 48px) dan font Fredoka/Baloo 2 + Nunito.
- Buat `README.md` awal dan `CREDITS.md` kosong.
- **Verifikasi**: `npm run build`, `npm run lint`, dan dev server menampilkan halaman awal.

## Fase 1: Model Data & Logika Inti

- Definisikan tipe TypeScript: Student, Plant, PlantSpecies, Question, Session, Classroom, ClassChallenge, Encouragement.
- Buat repository layer dengan antarmuka yang jelas dan implementasi localStorage/IndexedDB, agar nanti bisa diganti Firebase tanpa mengubah komponen.
- Implementasikan logika murni (pure functions) yang mudah diuji:
  - perhitungan air/pupuk dari jawaban
  - tahap pertumbuhan tanaman (Bibit, Tunas, Tumbuh, Berbunga)
  - streak harian dan status layu (3 hari tidak belajar), tanpa kondisi mati
  - pemulihan tanaman setelah satu sesi
  - pembukaan tanaman koleksi berikutnya
  - agregasi kontribusi ke Kebun Kelas
- Buat seed data: 6-8 tanaman khas Indonesia dengan kartu fakta singkat, dan minimal 30 soal per mapel (Matematika, Bahasa Indonesia, IPAS) Fase B. Tandai fakta tanaman dengan komentar `// VERIFY` agar saya cek manual.
- Seed data kelas dummy (1 kelas, sekitar 20 murid dengan nama panggilan fiktif) bertanda DUMMY.
- **Verifikasi**: unit test untuk semua logika inti, termasuk kasus tepi (pergantian hari, streak terputus, tanaman layu lalu pulih).

## Fase 2: Sisi Anak (paling penting, poles maksimal)

- Onboarding: nama panggilan, avatar, kelas.
- Halaman Kebunku: tanaman aktif dengan animasi tahap pertumbuhan, streak, tombol "Ayo Belajar!", akses koleksi dan Kebun Kelas.
- Sesi belajar: 5-10 soal campuran tipe (pilihan ganda bergambar, isian angka, mencocokkan, urutkan), umpan balik animasi dan suara, petunjuk saat salah dan boleh coba lagi, layar hasil sesi yang merayakan progres.
- Narasi suara memakai Web Speech API (`id-ID`), dengan tombol speaker di soal dan teks penting. Tangani dengan baik bila suara Bahasa Indonesia tidak tersedia di perangkat.
- Koleksi Tanaman Nusantara dan kartu fakta (bisa dibacakan).
- Halaman Kebun Kelas dengan progres tantangan.
- Maskot orisinal sebagai placeholder SVG sederhana yang memberi sapaan dan semangat.
- **Verifikasi**: jalankan dev server, cek alur lengkap di viewport 360px dan desktop, ambil screenshot tiap halaman utama. Pastikan tidak ada error di console.

## Fase 3: Sisi Guru & Orang Tua (versi sederhana)

- Pengalih peran Mode Demo (Anak / Guru / Orang Tua) yang jelas terlihat, tanpa login.
- Dashboard guru: ringkasan kelas, daftar murid dengan status, materi tersulit, form buat tantangan kelas.
- Halaman orang tua: progres mingguan dalam bahasa sederhana, materi dikuasai vs perlu latihan, tombol "Kirim Semangat" yang muncul di kebun anak.
- Label "Data contoh" pada semua tampilan yang memakai data dummy.
- **Verifikasi**: tantangan yang dibuat guru muncul di Kebun Kelas anak; semangat dari orang tua muncul di Kebunku. Uji alur ini secara nyata di browser.

## Fase 4: PWA, Aksesibilitas & Performa

- Jadikan PWA (manifest, service worker, ikon placeholder) agar sisi anak bisa jalan offline.
- Audit aksesibilitas: kontras WCAG AA, label untuk pembaca layar, fokus keyboard, target sentuh 48px.
- Optimasi: SVG/WebP, lazy load halaman guru/orang tua, kompres audio.
- **Verifikasi**: jalankan Lighthouse mobile dan laporkan skornya (target minimal 90 untuk Performance, Accessibility, Best Practices). Uji mode offline dengan mematikan jaringan di DevTools.

## Fase 5: Finalisasi untuk Lomba

- Lengkapi `README.md`: deskripsi, cara menjalankan, fitur, daftar semua yang masih dummy/placeholder, dan rencana pengembangan (Firebase, asisten AI, konten Fase A dan C, notifikasi orang tua).
- Lengkapi `CREDITS.md` dengan sumber dan lisensi setiap aset.
- Siapkan konfigurasi deploy statis (Vercel/Netlify).
- Buat skenario demo singkat (langkah demi langkah untuk juri) di `DEMO.md`.
- **Verifikasi**: `npm run build` bersih, preview build produksi berjalan, alur demo lengkap berhasil dari awal sampai akhir.

Mulai dari membaca `BLUEPRINT.md`, lalu kerjakan Fase 0.
