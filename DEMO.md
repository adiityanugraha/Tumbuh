# Panduan Demo Tumbuh

Panduan singkat untuk juri: cara mencoba seluruh fitur Tumbuh dalam sekitar 10 menit.

- **Situs:** https://tumbuhnusantara.m1sec.my.id (cadangan: https://peserta61.m1sec.my.id)
- **Perangkat:** desktop atau laptop disarankan (desain web-first), tetap rapi di HP mulai lebar 360px.
- **Peramban:** Chrome atau Edge terbaru. Narasi suara memakai suara bawaan peramban (Web Speech API), jadi pastikan volume menyala.

## 1. Jalur tercepat: Mode Demo (tanpa akun)

1. Buka situs, di layar "Kamu siapa?" klik **Buka Mode Demo** di bagian bawah.
2. Aplikasi memuat anak contoh **Dewi (kelas 3)** dengan riwayat belajar seminggu. Data contoh diberi label "Data contoh".
3. Lanjutkan ke tur di bagian 2. Untuk keluar, ketuk avatar di pojok kanan atas, tab **Akun**, lalu **Keluar dari Mode Demo**.

## 2. Tur fitur anak

| Halaman | Yang bisa dicoba |
|---|---|
| **Kebunku** | Tanaman yang sedang tumbuh, langit berubah sesuai jam (pagi, siang, sore, malam), ketuk Kumbi (maskot) dan tanaman untuk sapaan dan fakta. Kartu Hari Ini, Tahukah Kamu (bisa dibacakan), Lencanaku (klik lencana untuk melihat caranya), tantangan dari orang tua, dan pesan semangat. |
| **Belajar** | Soal Hari Ini, kartu 4 mapel (Matematika, Bahasa Indonesia, IPAS, Bahasa Inggris) dengan progres per topik. Klik satu mapel untuk sesi 5 soal: pilihan ganda, isian angka, mencocokkan, dan mengurutkan. Tombol speaker membacakan soal. Jawaban salah diberi petunjuk dan boleh dicoba lagi. **Siram Ulang** berisi soal yang pernah salah, **Pilih Topik** untuk latihan khusus. |
| **Layar hasil** | Air dan pupuk yang didapat, tanaman naik tahap, lencana baru, dan progres tantangan. |
| **Peta** | 6 wilayah Nusantara terbuka bertahap, jalur ekspedisi dengan Kumbi berperahu, laut yang hidup, linimasa, dan **Kenali Daerah** (rumah adat, tarian, makanan, ungkapan daerah). |
| **Koleksi** | Tanaman yang sudah tumbuh penuh. Klik satu kartu: fakta, status konservasi, manfaat, dan perbandingan ukuran dengan tinggi badan anak. |
| **Kartu Kata** | Flashcard kosakata Bahasa Inggris bergambar per tema, dibacakan `en-US`. |
| **Memori Nusantara** | Permainan memasangkan tanaman dengan nama dan wilayahnya, terbuka setelah satu wilayah peta selesai. |

**Pengaturan** (ketuk avatar di pojok kanan atas): ganti avatar, tinggi badan dengan meteran dinding yang bisa digeser dan switch gambar laki-laki/perempuan, efek suara, kecepatan suara bacaan, **mode gelap/terang**, huruf besar, dan kurangi animasi.

## 3. Tur fitur orang tua

1. Di Mode Demo, klik **Orang Tua** pada pilihan peran di header (tidak perlu login atau mengerjakan soal).
2. Laporan minggu ini dalam bahasa sederhana, grafik hari belajar, materi dikuasai vs perlu latihan per mapel.
3. **Kirim Semangat**: pilih stiker dan pesan singkat, lalu kembali ke sisi anak untuk melihatnya muncul di Kebunku.
4. **Tantangan & Hadiah**: buat target (misalnya 5 sesi minggu ini) dengan hadiah. Kartunya muncul di Kebunku anak.
5. Pengaturan orang tua: sapaan bawaan (Ibu, Ayah, ...), tinggi badan anak, dan tema.

## 4. Mencoba akun sungguhan (opsional, butuh 2 tab atau 2 perangkat)

Akun disimpan di Supabase sehingga data anak dan orang tua tersinkron antarperangkat.

1. **Tab 1, anak:** "Kamu siapa?" > **Aku Anak** > **Daftar**. Isi nama pengguna (bebas, tanpa nama asli), kata sandi minimal 6 karakter, laki-laki/perempuan, avatar, dan kelas.
2. Ketuk avatar > tab **Profil**: catat **kode keluarga** 6 karakter.
3. **Tab 2 (jendela samaran atau peramban lain), orang tua:** **Saya Orang Tua** > **Daftar**, isi nama pengguna, kata sandi, dan kode keluarga tadi.
4. Coba alurnya:
   - Anak mengerjakan satu sesi, lalu laporan orang tua ikut berubah saat tab orang tua dibuka lagi (atau paling lambat 1 menit).
   - Orang tua mengirim semangat atau tantangan, lalu pesannya muncul di Kebunku anak.
   - Kelas hanya bisa diganti orang tua (Pengaturan > Profil di sisi anak hanya menampilkan kelas).

## 5. Catatan untuk juri

- Tidak ada iklan, analytics, chat bebas, atau data pribadi selain nama pengguna, laki-laki/perempuan (untuk gambar), kelas, dan tinggi badan opsional.
- Fakta tanaman, budaya, dan soal disusun mengacu Kurikulum Merdeka dan ditandai VERIFY di kode untuk ditinjau manusia (daftar lengkap di README bagian "Status Dummy dan Placeholder").
- Bila suara bacaan tidak terdengar, peramban mungkin tidak punya suara Bahasa Indonesia. Tombol speaker akan memberi pesan, aplikasi tetap berjalan.
- Dokumen proses: [PRD](docs/PRD.md), [acuan AI Agent](AGENTS.md), [jurnal 5 prompt](docs/JURNAL_PROMPT.md), dan [log prompt mentah](docs/LOG_PROMPT.md).
