# Panduan UI: Tumbuh

Acuan visual yang disetujui peserta pada 5 Okt 2026. Prototipe yang bisa diklik: `docs/mockup/index.html` (versi web, acuan utama) dan `docs/mockup/mobile.html` (versi HP, referensi). Jalankan `npx serve docs/mockup -l 4000` untuk melihatnya.

## 1. Arah Visual

- **Gaya**: ilustrasi flat bulat dengan aksen motif batik Nusantara.
- **Prioritas**: web desktop dulu, tetap responsif sampai layar HP 360px.
- **Prinsip**: motif hanya sebagai aksen tipis agar layar tetap tenang untuk anak. Teks sedikit, tombol besar.

## 2. Motif Batik

| Motif | Dipakai di |
|---|---|
| Kawung | Pola latar halaman (opasitas sekitar 6%), pot tanaman, latar gambar kartu koleksi, lingkaran perayaan |
| Mega mendung | Pita awan biru berlapis di bawah header, langit kebun, panel onboarding |
| Parang | Garis bawah header, bar progres tanaman, garis aksen bawah kartu, garis atas navigasi bawah (HP) |

Warna sogan (`#8a5a2b`) dipakai untuk garis motif dan label. Palet lain mengikuti token di `src/app/globals.css`.

## 3. Tipografi dan Komponen

- Judul: Fredoka 600. Isi: Nunito 700/800.
- Tombol utama: tinggi minimal 56px, radius 28px, bayangan bawah tebal (efek 3D), turun saat ditekan.
- Varian tombol: daun (utama), kunyit (aksi kedua), ghost putih (aksi netral).
- Kartu: putih, border krem 3px, radius 28px, opsional garis parang di bawah (`batik`).
- Tombol bacakan: lingkaran biru langit 52px dengan ikon speaker.
- Gelembung maskot: latar kunyit muda, border kunyit.
- Label kecil (tag): pil krem dengan teks sogan. Label "Data contoh" memakai komponen ini.
- Ikon navigasi: SVG garis buatan sendiri (bukan emoji).

## 4. Navigasi

- **Desktop**: header sticky berisi logo, menu (Kebunku, Belajar, Peta, Koleksi), pengalih Mode Demo (Anak / Guru / Orang Tua), streak, avatar.
- **HP (di bawah 760px)**: menu pindah ke tab bawah 4 ikon, pengalih Mode Demo disembunyikan dari header.
- Header dan menu disembunyikan di layar onboarding.

## 5. Layout per Halaman

| Halaman | Desktop | Layar kecil |
|---|---|---|
| Onboarding | Layar terbagi: ilustrasi Kumbi + mega mendung (kiri), formulir nama/avatar/kelas (kanan) | Satu kolom |
| Kebunku | 3 kolom: profil + kalender 7 hari + pesan semangat + Kebun Kelas / kebun besar / kartu Ayo Belajar (3 mapel) + Jelajah Nusantara | 2 kolom lalu 1 kolom, kebun paling atas |
| Sesi belajar | Panel maskot sticky (kiri), kartu soal + pilihan jawaban 3 kolom (kanan), tombol Berhenti dan Berikutnya | Maskot di atas, pilihan 1 kolom |
| Hasil sesi | Kartu lebar 2 kolom: tanaman dalam lingkaran kawung berputar / teks, air dan pupuk, tanaman baru, tombol | Satu kolom |
| Peta | Peta 16:9 dengan pulau bisa diklik + kompas (kiri), panel detail wilayah (kanan) | Panel di bawah peta |
| Koleksi | Filter wilayah + grid kartu (kiri), panel detail sticky (kanan) | Detail di bawah grid |

Tipe soal lain: **cocokkan** (klik kiri lalu kanan), **urutkan** (klik berurutan), **isian** (papan angka besar).

## 6. Animasi

- Pergantian halaman: muncul dari bawah sambil memudar (sekitar 0.45 detik).
- Tanaman dan maskot: bergoyang pelan.
- Jawaban benar: membesar sesaat. Jawaban salah: bergetar, lalu maskot memberi petunjuk.
- Hover: kartu dan pilihan sedikit naik, pulau membesar.
- Semua animasi mati bila `prefers-reduced-motion` aktif.

## 7. Breakpoint

| Lebar | Perubahan |
|---|---|
| di bawah 1100px | Kebunku 2 kolom, pengalih Mode Demo disembunyikan |
| di bawah 900px | Sesi belajar, peta, koleksi, hasil, onboarding jadi 1 kolom |
| di bawah 760px | Navigasi pindah ke bawah, ukuran huruf soal mengecil |

## 8. Masih Sketsa (PLACEHOLDER)

- Maskot **Kumbi** (kumbang tukang kebun): nama dan bentuk bisa diganti.
- Ilustrasi tanaman per tahap dan bentuk pulau di peta.
- Emoji tanaman di koleksi, diganti ilustrasi SVG di Fase 4.
