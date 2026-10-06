# PRD: Tumbuh

Nama aplikasi: **Tumbuh** (kebun belajar Nusantara). Dokumen kebutuhan produk. Sumber kebenaran untuk fitur dan perilaku aplikasi. Aturan kerja AI Agent ada di `AGENTS.md`.

## 1. Latar Belakang

- Lomba: M-ONE Telkomsel Coding Competition, Kategori Umum.
- Tema: "Innovating Education Through Technology", subtema "Web Education for Kids (untuk anak SD)".
- Masalah: anak SD cepat bosan belajar mandiri, latihan terasa seperti ujian, dan orang tua/guru sulit melihat bagian mana yang belum dikuasai anak.
- Solusi: anak merawat kebun virtual dengan cara belajar singkat setiap hari. Jawaban benar menghasilkan air dan pupuk. Tanaman yang tumbuh penuh masuk koleksi Tanaman Nusantara dan membuka wilayah baru di Peta Nusantara.

## 2. Prinsip Desain

- Belajar terasa seperti merawat, bukan ujian.
- Tidak ada hukuman berat: tanaman bisa layu, tidak pernah mati, dan selalu bisa dipulihkan.
- Kerja sama (Kebun Kelas) lebih ditonjolkan daripada kompetisi. Tidak ada ranking publik antar murid.
- Teks sedikit, tombol besar, semua teks penting bisa dibacakan.

## 3. Pengguna

| Peran | Kebutuhan utama |
|---|---|
| Anak SD kelas 1-6 (utama) | Belajar singkat tiap hari, merasa dihargai, melihat kebun tumbuh |
| Guru | Melihat progres kelas, membuat tantangan kelas, tahu materi tersulit |
| Orang tua | Melihat progres anak dengan bahasa sederhana, memberi semangat |

## 4. Konsep Inti: Kebun + Peta Nusantara

- **Kebunku**: satu tanaman aktif yang dirawat anak. Tahap: Bibit > Tunas > Tumbuh > Berbunga.
- **Peta Nusantara**: peta 6 wilayah (Sumatra, Jawa, Kalimantan, Sulawesi, Bali & Nusa Tenggara, Maluku & Papua). Tiap wilayah punya tanaman khas.
- **Alur progres**: tanaman aktif berbunga > masuk koleksi > tanaman berikutnya dari wilayah yang sama jadi aktif. Semua tanaman satu wilayah selesai > wilayah berikutnya terbuka di peta.
- **Koleksi**: kartu fakta tiap tanaman (nama, asal daerah, fakta unik), bisa dibacakan.

## 5. Konten

- **Kelas**: 1, 2, 3, 4, 5, 6. Dipilih saat onboarding, bisa diganti di profil. Soal yang muncul sesuai kelas yang dipilih.
- **Mapel**: Matematika, IPAS, Bahasa Inggris. Di Kurikulum Merdeka, IPAS resmi mulai kelas 3; untuk kelas 1-2 isinya pengenalan lingkungan sekitar (tubuh, hewan, tumbuhan, cuaca).
- **Bank soal**: mengacu capaian pembelajaran Kurikulum Merdeka per kelas. Minimal 15 soal per mapel per kelas, saat ini 16 (6 x 3 x 16 = 288 soal). Disimpan sebagai JSON per kelas per mapel, contoh `src/data/questions/kelas-3/matematika.json`.
- **Tipe soal**: pilihan ganda (boleh bergambar), isian angka, mencocokkan, mengurutkan.
- **Tanaman**: 2 per wilayah (12 total), contoh Rafflesia arnoldii, Bunga Bangkai, Edelweis Jawa, Melati, Anggrek Hitam, Kantong Semar, Anggrek Bulan, Cendana, Matoa. Fakta wajib singkat dan ditandai `// VERIFY` untuk dicek manual.

## 6. Fitur

### A. Sisi Anak (prioritas tertinggi)

1. **Onboarding**: nama panggilan, avatar (pilihan bawaan), kelas. Tanpa data pribadi lain.
2. **Kebunku**: tanaman aktif di tengah, streak harian, tombol besar "Ayo Belajar!", akses ke Peta, Koleksi, Kebun Kelas. Pesan semangat dari orang tua muncul di sini.
3. **Sesi belajar**: pilih mapel, 5 soal campuran tipe. Umpan balik langsung yang ramah (animasi, suara). Jawaban salah diberi petunjuk dan boleh coba lagi. Layar hasil merayakan progres (air/pupuk yang didapat, tanaman naik tahap).
4. **Pertumbuhan**: air dan pupuk dari jawaban benar menaikkan progres tanaman. Benar di percobaan pertama memberi lebih banyak daripada benar setelah petunjuk.
5. **Layu**: tidak belajar 3 hari > tanaman tampak layu. Satu sesi selesai > langsung pulih. Tidak ada kondisi mati.
6. **Peta Nusantara**: wilayah terbuka/terkunci, tanaman per wilayah, posisi progres saat ini.
7. **Koleksi**: kartu fakta tanaman yang sudah tumbuh penuh, tanaman terkunci tampil sebagai siluet.
8. **Kebun Kelas**: pohon bersama yang tumbuh dari kontribusi semua murid, progres tantangan dari guru.
9. **Narasi suara**: Web Speech API. Soal Matematika dan IPAS dibacakan `id-ID`, soal Bahasa Inggris memakai `en-US` untuk kata/kalimat Inggris. Bila suara tidak tersedia, tombol speaker disembunyikan atau memberi pesan ramah, tidak error.
10. **Maskot**: karakter orisinal (kumbang tukang kebun) yang menyapa, menyemangati, dan memberi petunjuk.

### B. Sisi Guru (sederhana)

1. Ringkasan kelas: murid aktif hari ini, rata-rata streak, kondisi Kebun Kelas.
2. Daftar murid dengan status (aktif, tanaman layu, butuh perhatian).
3. Materi tersulit: topik dengan tingkat jawaban salah tertinggi.
4. Buat tantangan kelas: target dan hadiah. Tantangan langsung tampil di Kebun Kelas anak.

### C. Sisi Orang Tua (sederhana)

1. Progres anak minggu ini dalam bahasa sederhana.
2. Materi yang sudah dikuasai vs perlu latihan, per mapel.
3. Tombol "Kirim Semangat": pesan/stiker yang muncul di Kebunku anak.
4. Dilindungi gerbang orang tua sederhana (soal hitungan) agar anak tidak iseng masuk.

### D. Mode Demo

Pengalih peran Anak / Guru / Orang Tua yang selalu terlihat, tanpa login, agar juri bisa mencoba semua sisi. Data murid lain adalah data dummy dan diberi label "Data contoh" di UI.

## 7. Halaman (route)

| Route | Isi |
|---|---|
| `/` | Onboarding bila belum ada profil, selain itu ke Kebunku |
| `/kebun/` | Kebunku |
| `/belajar/` | Pilih mapel dan sesi belajar |
| `/peta/` | Peta Nusantara |
| `/koleksi/` | Koleksi Tanaman Nusantara |
| `/kebun-kelas/` | Kebun Kelas |
| `/guru/` | Dashboard guru |
| `/orang-tua/` | Halaman orang tua |

## 8. Arahan Teknis

- Next.js (App Router) + TypeScript + Tailwind CSS v4, `output: "export"` (situs statis).
- Animasi: `motion` (Framer Motion). Tidak memakai Lottie.
- Data: repository layer dengan antarmuka jelas, implementasi awal localStorage. Komponen tidak boleh memanggil localStorage langsung, agar nanti bisa diganti backend.
- Logika inti (pertumbuhan, streak, layu, unlock, agregasi kelas) berupa pure function dengan unit test Vitest.
- Deploy: hasil `npm run build` (folder `out/`) diunggah ke hosting panitia.
- Tidak memakai PWA. Tidak ada fitur AI di dalam website.
- Lingkungan dev: Windows + PowerShell, Node.js native, tanpa Docker/WSL.

## 9. UX, Visual, Aksesibilitas

Acuan visual lengkap: `docs/UI.md` dan prototipe `docs/mockup/index.html` (gaya batik Nusantara, web desktop dulu).


- Web desktop dulu, tetap responsif dan nyaman sampai layar 360px.
- Target sentuh minimal 48px. Kontras teks WCAG AA.
- Font: Fredoka (judul), Nunito (isi).
- Palet bertema kebun Nusantara (daun, tanah, kunyit, langit), bukan gradien ungu/biru generik.
- Animasi masuk/keluar halus, hover yang relevan, hormati `prefers-reduced-motion`.
- Semua UI berbahasa Indonesia yang ramah anak.

## 10. Aset

- Satu gaya visual konsisten: flat, bentuk bulat, cerah. Utamakan SVG.
- Hanya aset berlisensi bebas (CC0 atau yang mengizinkan) atau buatan sendiri. Tidak memakai karakter berhak cipta.
- Semua sumber dan lisensi dicatat di `CREDITS.md`.
- Selama aset final belum ada, pakai placeholder SVG yang ditandai `// PLACEHOLDER`.

## 11. Privasi Anak

- Hanya nama panggilan. Tanpa email, nomor telepon, atau foto.
- Tidak ada chat bebas antar murid.
- Tidak ada analytics pihak ketiga.

## 12. Target Kualitas

- Lighthouse mobile: Performance, Accessibility, Best Practices, SEO minimal 90.
- SEO dasar: metadata per halaman, `lang="id"`, favicon, robots dan sitemap.
- Halaman guru/orang tua di-lazy load. Aset gambar SVG/WebP.
- Satu alur demo lengkap tanpa error: onboarding > belajar > tanaman tumbuh > koleksi terbuka > wilayah peta terbuka > lihat dari sisi guru dan orang tua.

## 13. Di Luar Cakupan (rencana pengembangan)

- Login dan sinkronisasi cloud agar orang tua/guru bisa memantau dari perangkat lain.
- PWA offline.
- Asisten AI ramah anak untuk petunjuk soal.
- Notifikasi pengingat belajar ke orang tua.
