import type { PlantSpecies, Region } from "@/lib/types";

// VERIFY: semua fakta tanaman di bawah wajib dicek manual oleh pemilik proyek sebelum lomba.
export const PLANTS: PlantSpecies[] = [
  {
    id: "rafflesia",
    name: "Padma Raksasa",
    latinName: "Rafflesia arnoldii",
    region: "sumatra",
    origin: "Hutan Bengkulu, Sumatra",
    fact: "Bunga tunggal terbesar di dunia, lebarnya bisa hampir 1 meter. Ia tidak punya daun dan menumpang hidup pada tumbuhan lain.",
    emoji: "🌺",
  },
  {
    id: "bunga-bangkai",
    name: "Bunga Bangkai",
    latinName: "Amorphophallus titanum",
    region: "sumatra",
    origin: "Hutan hujan Sumatra",
    fact: "Bunganya bisa lebih tinggi dari orang dewasa. Saat mekar, baunya seperti bangkai untuk menarik serangga penyerbuk.",
    emoji: "🌷",
  },
  {
    id: "melati",
    name: "Melati Putih",
    latinName: "Jasminum sambac",
    region: "jawa",
    origin: "Banyak ditanam di Pulau Jawa",
    fact: "Melati putih adalah Puspa Bangsa Indonesia. Bunganya kecil, putih, dan sangat harum.",
    emoji: "🤍",
  },
  {
    id: "edelweis",
    name: "Edelweis Jawa",
    latinName: "Anaphalis javanica",
    region: "jawa",
    origin: "Puncak gunung tinggi di Jawa",
    fact: "Dijuluki bunga abadi karena tidak mudah layu. Edelweis dilindungi, jadi tidak boleh dipetik.",
    emoji: "🌼",
  },
  {
    id: "anggrek-hitam",
    name: "Anggrek Hitam",
    latinName: "Coelogyne pandurata",
    region: "kalimantan",
    origin: "Hutan Kalimantan Timur",
    fact: "Kelopaknya hijau muda dengan bagian tengah bercorak hitam. Anggrek ini menjadi maskot Kalimantan Timur.",
    emoji: "🪻",
  },
  {
    id: "kantong-semar",
    name: "Kantong Semar",
    latinName: "Nepenthes",
    region: "kalimantan",
    origin: "Hutan Kalimantan dan pulau lain",
    fact: "Tumbuhan pemakan serangga. Serangga yang masuk ke kantongnya tergelincir lalu dicerna oleh cairan di dalamnya.",
    emoji: "🫖",
  },
  {
    id: "eboni",
    name: "Eboni",
    latinName: "Diospyros celebica",
    region: "sulawesi",
    origin: "Hutan Sulawesi",
    fact: "Disebut kayu hitam Sulawesi. Kayunya sangat keras dan berwarna hitam bergaris cokelat.",
    emoji: "🌳",
  },
  {
    id: "anggrek-bulan",
    name: "Anggrek Bulan",
    latinName: "Phalaenopsis amabilis",
    region: "sulawesi",
    origin: "Tersebar di banyak pulau, termasuk Sulawesi",
    fact: "Anggrek bulan adalah Puspa Pesona Indonesia. Bunganya putih dan bentuknya seperti kupu-kupu.",
    emoji: "🌸",
  },
  {
    id: "cendana",
    name: "Cendana",
    latinName: "Santalum album",
    region: "bali-nusra",
    origin: "Nusa Tenggara Timur",
    fact: "Kayunya harum dan dipakai untuk membuat minyak wangi serta kerajinan. Sejak dulu cendana dari NTT terkenal sampai luar negeri.",
    emoji: "🪵",
  },
  {
    id: "majegau",
    name: "Majegau",
    latinName: "Dysoxylum densiflorum",
    region: "bali-nusra",
    origin: "Bali",
    fact: "Pohon identitas Provinsi Bali. Kayunya kuat dan harum.",
    emoji: "🌲",
  },
  {
    id: "pala",
    name: "Pala",
    latinName: "Myristica fragrans",
    region: "maluku-papua",
    origin: "Kepulauan Banda, Maluku",
    fact: "Rempah asli Maluku yang dulu sangat dicari pedagang dari Eropa. Bijinya dipakai sebagai bumbu masakan.",
    emoji: "🌰",
  },
  {
    id: "matoa",
    name: "Matoa",
    latinName: "Pometia pinnata",
    region: "maluku-papua",
    origin: "Papua",
    fact: "Buah khas Papua. Rasanya manis, seperti campuran rambutan dan lengkeng.",
    emoji: "🟤",
  },
];

/** Urutan wilayah di Peta Nusantara, dari barat ke timur. */
export const REGIONS: Region[] = [
  { id: "sumatra", name: "Sumatra", plantIds: ["rafflesia", "bunga-bangkai"] },
  { id: "jawa", name: "Jawa", plantIds: ["melati", "edelweis"] },
  { id: "kalimantan", name: "Kalimantan", plantIds: ["anggrek-hitam", "kantong-semar"] },
  { id: "sulawesi", name: "Sulawesi", plantIds: ["eboni", "anggrek-bulan"] },
  { id: "bali-nusra", name: "Bali & Nusa Tenggara", plantIds: ["cendana", "majegau"] },
  { id: "maluku-papua", name: "Maluku & Papua", plantIds: ["pala", "matoa"] },
];

export const PLANT_ORDER = REGIONS.flatMap((r) => r.plantIds);

export const getPlant = (id: string) => PLANTS.find((p) => p.id === id);
