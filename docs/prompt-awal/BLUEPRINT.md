# Blueprint: Kebun Belajar Nusantara

Web app edukasi untuk lomba bertema "menunjang semangat belajar anak SD".

## 1. Konsep Inti

Anak merawat kebun virtual dengan cara belajar setiap hari. Setiap jawaban benar menghasilkan air dan pupuk untuk tanaman. Tanaman yang tumbuh penuh membuka koleksi tanaman khas Indonesia baru, lengkap dengan kartu fakta. Satu kelas bersama-sama menumbuhkan "Kebun Kelas", sementara guru dan orang tua bisa memantau progres dan memberi dukungan.

Prinsip desain:
- Belajar terasa seperti merawat, bukan ujian
- Tidak ada hukuman berat: tanaman bisa layu, tapi tidak pernah mati, dan selalu bisa dipulihkan
- Kerja sama (kebun kelas) lebih ditonjolkan daripada kompetisi (tidak ada ranking publik antar murid)

## 2. Pengguna

| Peran | Kebutuhan utama |
|---|---|
| Anak SD (utama) | Belajar singkat tiap hari, merasa dihargai, melihat kebunnya tumbuh |
| Guru | Melihat progres kelas, membuat tantangan kelas, tahu materi yang sulit |
| Orang tua | Melihat progres anak dengan bahasa sederhana, memberi semangat |

Fokus demo: Fase B Kurikulum Merdeka (kelas 3-4). Struktur data harus mendukung Fase A (kelas 1-2) dan Fase C (kelas 5-6) agar mudah ditambah.

## 3. Fitur

### A. Sisi Anak (prioritas tertinggi, harus paling dipoles)

1. **Onboarding singkat**: pilih nama panggilan dan avatar, pilih kelas. Tidak meminta data pribadi lain.
2. **Kebunku (halaman utama)**: tanaman aktif di tengah, indikator streak harian, tombol besar "Ayo Belajar!", akses ke koleksi.
3. **Sesi belajar harian**: 5-10 soal, mapel Matematika, Bahasa Indonesia, IPAS. Tipe soal: pilihan ganda bergambar, isian angka, mencocokkan, urutkan. Umpan balik langsung yang ramah (animasi, suara). Jawaban salah diberi petunjuk, boleh coba lagi.
4. **Pertumbuhan tanaman**: tahap Bibit > Tunas > Tumbuh > Berbunga/Berbuah. Air dan pupuk dari jawaban benar menaikkan progres.
5. **Mekanik layu**: jika tidak belajar 3 hari, tanaman tampak layu. Satu sesi belajar langsung memulihkannya. Tidak ada kondisi mati.
6. **Koleksi Tanaman Nusantara**: tanaman yang tumbuh penuh masuk koleksi dan membuka tanaman berikutnya. Setiap tanaman punya kartu fakta singkat (asal daerah, fakta unik, bisa dibacakan).
7. **Kebun Kelas**: kontribusi semua murid menumbuhkan pohon besar bersama. Menampilkan progres tantangan kelas yang dibuat guru.
8. **Narasi suara**: semua soal dan teks penting bisa dibacakan (Web Speech API, bahasa id-ID) untuk anak yang belum lancar membaca.
9. **Maskot**: karakter orisinal (misal kupu-kupu atau kumbang tukang kebun) yang memberi sapaan, semangat, dan petunjuk.

### B. Sisi Guru (versi sederhana)

1. Ringkasan kelas: jumlah murid aktif hari ini, rata-rata streak, kondisi kebun kelas.
2. Daftar murid dengan status (aktif, tanaman layu, butuh perhatian).
3. Materi tersulit: topik dengan tingkat jawaban salah tertinggi.
4. Buat tantangan kelas: target (misal "semua murid belajar 5 hari minggu ini") dan hadiah (tanaman spesial untuk kebun kelas).

### C. Sisi Orang Tua (versi sederhana)

1. Progres anak minggu ini dalam bahasa sederhana.
2. Materi yang sudah dikuasai dan yang masih perlu latihan.
3. Tombol "Kirim Semangat": pesan atau stiker yang muncul di kebun anak.

### D. Mode Demo

Pengalih peran (Anak / Guru / Orang Tua) yang terlihat jelas, karena juri perlu mencoba semua sisi tanpa login. Data kelas dan murid lain adalah **data dummy** dan harus diberi label "Data contoh" di UI.

## 4. Konten Awal (MVP)

- Tanaman koleksi (6-8): contoh Anggrek Bulan, Melati, Rafflesia arnoldii, Bunga Bangkai, Edelweis Jawa, Kantong Semar, Cendana. Fakta di kartu wajib singkat dan diverifikasi manual sebelum lomba.
- Bank soal: minimal 30 soal per mapel untuk Fase B, mengacu capaian pembelajaran Kurikulum Merdeka. Disimpan sebagai JSON terpisah agar mudah ditambah.

## 5. Arahan Teknis

- **Frontend**: React + Vite + TypeScript, Tailwind CSS
- **Animasi**: Framer Motion untuk UI, Lottie untuk efek (confetti, benar/salah)
- **Data**: lapisan repository/service dengan implementasi awal localStorage (atau IndexedDB). Antarmuka dibuat agar bisa diganti Firebase tanpa mengubah komponen.
- **PWA**: bisa dipasang dan berjalan offline untuk sisi anak
- **Deploy**: statis (Vercel/Netlify/GitHub Pages)
- **Lingkungan dev**: Windows, tanpa Docker/WSL. Semua harus jalan dengan Node.js native.

## 6. UX & Aksesibilitas

- Target sentuh minimal 48px, tombol besar, teks sedikit
- Warna cerah tapi tidak ramai, kontras teks memenuhi WCAG AA
- Font ramah anak: Fredoka atau Baloo 2 (judul), Nunito (isi)
- Mobile-first, harus nyaman di HP murah (layar 360px)
- Semua UI berbahasa Indonesia

## 7. Aset

- Gunakan satu gaya visual konsisten (flat, bentuk bulat, cerah)
- Hanya aset berlisensi bebas (CC0 atau lisensi yang mengizinkan), atau buatan sendiri
- Tidak boleh memakai karakter berhak cipta
- Semua sumber dan lisensi dicatat di `CREDITS.md`
- Selama aset final belum ada, gunakan placeholder SVG sederhana yang jelas ditandai sebagai placeholder

## 8. Privasi Anak

- Hanya nama panggilan, tanpa email, nomor telepon, atau foto
- Tidak ada fitur chat bebas antar murid
- Tidak ada analytics pihak ketiga

## 9. Target Kualitas

- Lighthouse mobile: Performance, Accessibility, Best Practices minimal 90
- Bundle awal ringan, aset gambar dalam SVG/WebP
- Satu alur demo lengkap tanpa error: onboarding > belajar > tanaman tumbuh > koleksi terbuka > lihat dari sisi guru dan orang tua

## 10. Di Luar Cakupan MVP (bahan "rencana pengembangan" di presentasi)

- Login dan sinkronisasi cloud (Firebase)
- Asisten AI ramah anak untuk petunjuk soal
- Konten Fase A dan Fase C lengkap
- Notifikasi pengingat belajar ke orang tua
