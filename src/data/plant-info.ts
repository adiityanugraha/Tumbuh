export type ConservationStatus = "dilindungi" | "langka" | "umum";

export interface PlantInfo {
  status: ConservationStatus;
  /** Label status yang tampil, misalnya "Dilindungi" atau "Banyak dibudidayakan". */
  statusLabel: string;
  benefit: string;
  /** Ukuran khas dalam cm, dan bagian yang diukur. */
  sizeCm: number;
  sizeOf: string;
}

// VERIFY: status konservasi, manfaat, dan ukuran disusun dari pengetahuan umum, wajib dicek manusia sebelum lomba.
export const PLANT_INFO: Record<string, PlantInfo> = {
  rafflesia: {
    status: "dilindungi",
    statusLabel: "Dilindungi",
    benefit:
      "Menjadi daya tarik wisata alam dan tanda bahwa hutan di sekitarnya masih sehat.",
    sizeCm: 100,
    sizeOf: "Lebar bunga",
  },
  "bunga-bangkai": {
    status: "dilindungi",
    statusLabel: "Dilindungi",
    benefit:
      "Umbinya menyimpan cadangan makanan, dan baunya mengundang kumbang yang membantu penyerbukan.",
    sizeCm: 300,
    sizeOf: "Tinggi bunga",
  },
  melati: {
    status: "umum",
    statusLabel: "Banyak dibudidayakan",
    benefit:
      "Bunganya dipakai untuk teh melati, minyak wangi, dan hiasan pada upacara adat.",
    sizeCm: 150,
    sizeOf: "Tinggi tanaman",
  },
  edelweis: {
    status: "dilindungi",
    statusLabel: "Dilindungi",
    benefit:
      "Bunganya menjadi sumber makanan serangga di puncak gunung yang dingin.",
    sizeCm: 200,
    sizeOf: "Tinggi tanaman",
  },
  "anggrek-hitam": {
    status: "dilindungi",
    statusLabel: "Dilindungi",
    benefit: "Menjadi kebanggaan daerah dan dikembangkan sebagai anggrek hias.",
    sizeCm: 10,
    sizeOf: "Lebar bunga",
  },
  "kantong-semar": {
    status: "dilindungi",
    statusLabel: "Dilindungi",
    benefit:
      "Memangsa serangga sehingga jumlah serangga di hutan tetap seimbang.",
    sizeCm: 20,
    sizeOf: "Tinggi kantong",
  },
  eboni: {
    status: "langka",
    statusLabel: "Langka",
    benefit: "Kayunya dipakai untuk mebel, ukiran, dan alat musik.",
    sizeCm: 4000,
    sizeOf: "Tinggi pohon",
  },
  "anggrek-bulan": {
    status: "dilindungi",
    statusLabel: "Dilindungi",
    benefit: "Bunganya tahan lama sehingga disukai sebagai tanaman hias.",
    sizeCm: 10,
    sizeOf: "Lebar bunga",
  },
  cendana: {
    status: "langka",
    statusLabel: "Langka",
    benefit: "Kayunya dipakai untuk minyak wangi, dupa, dan kerajinan ukiran.",
    sizeCm: 1500,
    sizeOf: "Tinggi pohon",
  },
  majegau: {
    status: "langka",
    statusLabel: "Perlu dijaga",
    benefit: "Kayunya dipakai untuk bangunan pura dan ukiran khas Bali.",
    sizeCm: 3000,
    sizeOf: "Tinggi pohon",
  },
  pala: {
    status: "umum",
    statusLabel: "Banyak dibudidayakan",
    benefit:
      "Biji dan selaput bijinya (fuli) dipakai sebagai bumbu dan obat tradisional.",
    sizeCm: 1500,
    sizeOf: "Tinggi pohon",
  },
  matoa: {
    status: "umum",
    statusLabel: "Banyak dibudidayakan",
    benefit: "Buahnya manis untuk dimakan, dan kayunya kuat untuk bangunan.",
    sizeCm: 2000,
    sizeOf: "Tinggi pohon",
  },
};
