# Jurnal Prompt Pilihan

Lima prompt yang paling menentukan arah proyek Tumbuh, masing-masing mewakili satu kategori: PRD, debugging, audit/optimasi, finishing, dan bebas. Teks prompt disalin apa adanya dari [log prompt mentah](LOG_PROMPT.md) (nomor entri dicantumkan). AI yang dipakai: Claude Code, dengan aturan kerja di [`AGENTS.md`](../AGENTS.md).

Pola kerja yang dipakai di semua prompt:

1. Peserta memberi arah dan keputusan, AI bertanya balik lewat pilihan bila ada yang ambigu (jawaban pilihan juga tercatat di log).
2. AI mengerjakan per fase, lalu memverifikasi dengan lint, typecheck, test, build, dan pengecekan di browser (360px dan desktop).
3. AI tidak menjalankan git. Peserta yang commit dengan pesan yang diusulkan, sehingga riwayat commit mengikuti urutan prompt.

---

## 1. PRD: dari ide ke spesifikasi

**Log #7, 5 Okt 2026, 20.59 WIB**

```text
@"E:\Tugas Kuliah\Lomba\Lomba Web SD\BLUEPRINT.md" @"E:\Tugas Kuliah\Lomba\Lomba Web SD\CLAUDE_CODE_PROMPT.md"
ini merupakan konsep ide, untuk teknis nya ikuti ide brainstorming kita tadi
```

**Konteks.** Sebelumnya peserta dan AI sudah brainstorming lewat pilihan (log #3 sampai #5): edukasi umum SD kelas 1-6, Next.js + Tailwind, konsep petualangan peta, narasi suara, dan dashboard orang tua. Prompt ini menggabungkan hasil brainstorming dengan blueprint ide awal peserta ([`docs/prompt-awal/`](prompt-awal/)).

**Yang dilakukan AI.** AI tidak langsung menulis kode. AI menemukan empat pertentangan antara blueprint dan brainstorming, lalu menanyakannya (log #8):
- Konsep: kebun virtual atau peta petualangan? Dijawab **gabungan kebun + peta**.
- Mapel, cakupan kelas, dan fitur teknis (Motion, Vitest).

**Hasil.**
- [`docs/PRD.md`](PRD.md): sumber kebenaran fitur, route, privasi anak, dan target kualitas.
- [`AGENTS.md`](../AGENTS.md): acuan AI Agent berisi stack, larangan teknis static export, aturan kerja, dan rencana 6 fase.
- Konsep inti "Kebun + Peta Nusantara": jawaban benar menyiram tanaman, tanaman yang tumbuh penuh membuka wilayah peta.

**Pelajaran.** Memberi AI dua sumber (blueprint dan hasil diskusi) dan membiarkannya menandai pertentangan menghasilkan spesifikasi yang konsisten sebelum satu baris kode pun ditulis.

---

## 2. Debugging: tanaman tumpang tindih di kebun

**Log #62, 13 Okt 2026, 09.58 WIB**

```text
pada halaman dashboard, bunga padma raksasa sudah selesai tumbuh, namun masih ada di dalam frame yang membuat image tumpang tindih, remove image tanaman yang sudah tumbuh dari halaman dashboard dan fokus ke yang belum tumbuh
```

**Konteks.** Peserta menemukan bug visual saat mencoba Mode Demo: di Kebunku, Padma Raksasa yang sudah tumbuh penuh masih digambar di dalam bingkai kebun dan menimpa tanaman yang sedang dirawat. Prompt menyebut gejala, lokasi, dan perilaku yang diharapkan sekaligus.

**Yang dilakukan AI.**
- Melacak penyebabnya: tambahan "barisan koleksi di kebun" (log #51) menggambar semua tanaman koleksi di bingkai yang sama dengan tanaman aktif, sehingga bertumpuk saat koleksi bertambah.
- Memperbaiki di sumbernya: kebun hanya menggambar tanaman yang sedang tumbuh. Tanaman penuh tetap terlihat di Koleksi, linimasa Peta, dan laporan orang tua.
- Menyesuaikan PRD agar spesifikasi sama dengan perilaku baru.

**Hasil.** Diverifikasi di browser dengan Mode Demo (hanya Anggrek Hitam tahap Tunas yang tampil), lint, typecheck, 53 test, dan build lolos. Commit: `style: kebun hanya menampilkan tanaman yang sedang tumbuh`.

**Pelajaran.** Laporan bug yang menyebut gejala dan hasil yang diinginkan membuat AI bisa langsung mencari penyebab, bukan menebak. Bug ini juga menunjukkan fitur tambahan perlu dicek lagi saat data bertambah.

---

## 3. Audit dan optimasi: Fase 4

**Log #61, 13 Okt 2026, 09.30 WIB**

```text
lanjut fase 4
```

**Konteks.** Prompt singkat ini bekerja karena isi fasenya sudah disepakati di [`AGENTS.md`](../AGENTS.md): "Aksesibilitas, performa, SEO (target Lighthouse mobile minimal 90)". Aturan verifikasi juga sudah tertulis, jadi AI tahu standar selesainya.

**Yang dilakukan AI.**
- Mengukur dulu: Lighthouse mobile di 9 halaman build statis dengan data Mode Demo. Skor terendah awal: performa 87 (Peta), aksesibilitas 96 (Kebunku), best practices 93.
- Menemukan dan memperbaiki masalah yang tidak terlihat saat dev:
  - Error 404 prefetch di semua halaman anak karena build Next 16 di Windows menyimpan file di folder bertingkat. Diperbaiki dengan `scripts/fix-segments.mjs` setelah build.
  - Halaman Peta melebar sampai 922px di layar 360px karena teks khusus pembaca layar keluar dari wadah geser.
- Optimasi gambar: thumbnail 300px untuk koleksi, peta, dan memori (1.154 KB menjadi 219 KB).
- Aksesibilitas: label tombol cocok dengan teks yang terlihat, fokus keyboard selalu terlihat, animasi berhenti saat pengguna memilih kurangi gerak.
- SEO: `robots.txt`, `sitemap.xml`, Open Graph, deskripsi per halaman, ikon tab.

**Hasil.** Semua 9 halaman: performa 93-100, aksesibilitas 100, best practices 100, SEO 100. Commit: `perf: optimasi gambar, aksesibilitas, SEO, dan perbaikan prefetch build`.

**Pelajaran.** Prompt pendek cukup bila tujuan dan definisi selesai sudah ditulis di dokumen acuan. Mengukur sebelum dan sesudah membuat optimasi bisa dibuktikan, bukan diklaim.

---

## 4. Finishing: Fase 5

**Log #89, 14 Okt 2026, 12.15 WIB**

```text
lanjut ke fase 5
```

**Konteks.** Sehari sebelum batas pengumpulan. Sebelumnya peserta meminta AI mendaftar pekerjaan yang belum selesai, sehingga isi Fase 5 sudah jelas: README final, panduan demo, jurnal prompt, dan build untuk hosting panitia.

**Yang dilakukan AI.**
- [`DEMO.md`](../DEMO.md): panduan juri untuk mencoba semua fitur dalam sekitar 10 menit lewat Mode Demo, plus alur akun anak dan orang tua.
- Jurnal ini, disusun dari log mentah.
- README final: ringkasan fitur, dokumen proses, dan status dummy/placeholder.
- Daftar sisa pekerjaan yang butuh keputusan peserta: domain hosting untuk `NEXT_PUBLIC_SITE_URL`, dan peninjauan fakta bertanda VERIFY.

**Pelajaran.** Finishing bukan hanya kode: dokumentasi yang jujur soal data contoh dan fakta yang belum dicek sama pentingnya dengan fitur.

---

## 5. Bebas: merancang sistem akun anak dan orang tua

**Log #71, 13 Okt 2026, 13.22 WIB**

```text
menurut saya seperti ini saja, login tetap dilakukan, awalnya sistem menayakan anda merupakan anak atau orang tua, jika anda memilih anak, akan ada opsi login/registrasi, pada registrasi kredensial yang diminta adalah nama (username), password, avatar, kelas, pada login hanya meminta nama(username) dan password, saat login sukses dibagian profil anak akan terdapat sebuah kode yaitu kode keluarga, lalu jika memilih orang tua akan diminta nama (username) dan kode keluarganya (dibawah form kode keluarga terdapat bantuan cara menemukan kode keluarga di akun anak) jika kode nya sinkron maka akun orang tua akan terhubung dengan akun anak tersebut, hanya orang tua yang dapat mengganti kelas dari anak namun anak yang memilih kelas nya diawal, ada pertanyaan? jika ada silahkan tanya langsung
```

**Konteks.** Awalnya situs hanya menyimpan data di localStorage, sehingga laporan orang tua hanya berfungsi di perangkat yang sama. Setelah membahas dampak dan pilihan stack database (log #67), peserta merancang sendiri alur akunnya dalam satu prompt dan mengundang AI bertanya.

**Yang dilakukan AI.**
- Bertanya empat hal yang belum tercakup (log #72): cara login orang tua, nasib Mode Demo untuk juri, jumlah anak per orang tua, dan lupa kata sandi.
- Menjaga situs tetap statis: Supabase diakses langsung dari browser, nama pengguna dipetakan ke email internal sehingga anak tidak perlu email.
- Mengamankan di database, bukan hanya di tampilan: Row Level Security per tabel, trigger yang mengunci kelas agar hanya orang tua yang bisa menggantinya, dan fungsi `register_child`, `register_parent`, `link_child` ([`supabase/schema.sql`](../supabase/schema.sql)).
- Sinkronisasi yang aman dari kehilangan data: localStorage tetap jadi cache, data lokal dan server digabung per id (`src/lib/sync.ts`, dengan unit test).
- Menguji alur lengkap dengan dua origin browser sebagai dua perangkat: daftar anak, daftar orang tua dengan kode keluarga, ganti kelas, kirim semangat, dan pesan error salah kata sandi atau salah peran.

**Hasil.** Commit: `akun anak dan orang tua dengan kode keluarga di Supabase`. Fitur lanjutan dibangun di atasnya: pengaturan kedua peran, tinggi badan, dan beberapa anak per orang tua.

**Pelajaran.** Peserta menentukan alur pengguna, AI melengkapi sisi teknis dan keamanan lalu menanyakan celahnya. Kombinasi ini lebih cepat dan lebih aman daripada meminta "buatkan fitur login" tanpa rancangan.
