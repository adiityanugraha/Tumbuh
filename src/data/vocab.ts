import type { Grade } from "@/lib/types";

export interface VocabDeck {
  id: string;
  name: string;
  emoji: string;
  /** Kelas yang disarankan. Semua tema tetap bisa dibuka. */
  grade: Grade;
  /** [emoji, kata Inggris, arti]. */
  words: [string, string, string][];
}

// Kosakata dasar mengacu tema Bahasa Inggris SD Kurikulum Merdeka. Perlu ditinjau manusia (lihat README).
export const VOCAB_DECKS: VocabDeck[] = [
  {
    id: "hewan",
    name: "Hewan",
    emoji: "🐱",
    grade: 1,
    words: [
      ["🐱", "cat", "kucing"],
      ["🐶", "dog", "anjing"],
      ["🐦", "bird", "burung"],
      ["🐟", "fish", "ikan"],
      ["🐔", "chicken", "ayam"],
      ["🐮", "cow", "sapi"],
      ["🦆", "duck", "bebek"],
      ["🐰", "rabbit", "kelinci"],
      ["🐘", "elephant", "gajah"],
      ["🐵", "monkey", "monyet"],
    ],
  },
  {
    id: "buah",
    name: "Buah",
    emoji: "🍎",
    grade: 1,
    words: [
      ["🍎", "apple", "apel"],
      ["🍌", "banana", "pisang"],
      ["🍊", "orange", "jeruk"],
      ["🥭", "mango", "mangga"],
      ["🍇", "grapes", "anggur"],
      ["🍉", "watermelon", "semangka"],
      ["🍍", "pineapple", "nanas"],
      ["🥥", "coconut", "kelapa"],
      ["🍓", "strawberry", "stroberi"],
      ["🍐", "pear", "pir"],
    ],
  },
  {
    id: "warna",
    name: "Warna",
    emoji: "🎨",
    grade: 2,
    words: [
      ["🔴", "red", "merah"],
      ["🔵", "blue", "biru"],
      ["🟡", "yellow", "kuning"],
      ["🟢", "green", "hijau"],
      ["🟠", "orange", "oranye"],
      ["🟣", "purple", "ungu"],
      ["🟤", "brown", "cokelat"],
      ["⚫", "black", "hitam"],
      ["⚪", "white", "putih"],
    ],
  },
  {
    id: "tubuh",
    name: "Anggota Tubuh",
    emoji: "✋",
    grade: 2,
    words: [
      ["👁️", "eye", "mata"],
      ["👂", "ear", "telinga"],
      ["👃", "nose", "hidung"],
      ["👄", "mouth", "mulut"],
      ["👅", "tongue", "lidah"],
      ["🦷", "tooth", "gigi"],
      ["✋", "hand", "tangan"],
      ["🦵", "leg", "kaki"],
      ["🦶", "foot", "telapak kaki"],
      ["💇", "hair", "rambut"],
    ],
  },
  {
    id: "kelas",
    name: "Benda di Kelas",
    emoji: "🎒",
    grade: 3,
    words: [
      ["📕", "book", "buku"],
      ["✏️", "pencil", "pensil"],
      ["🎒", "bag", "tas"],
      ["🪑", "chair", "kursi"],
      ["📏", "ruler", "penggaris"],
      ["✂️", "scissors", "gunting"],
      ["🕰️", "clock", "jam dinding"],
      ["📄", "paper", "kertas"],
      ["🖍️", "crayon", "krayon"],
      ["💻", "computer", "komputer"],
    ],
  },
  {
    id: "profesi",
    name: "Profesi",
    emoji: "🧑‍🏫",
    grade: 4,
    words: [
      ["🧑‍🏫", "teacher", "guru"],
      ["🧑‍⚕️", "doctor", "dokter"],
      ["🧑‍🌾", "farmer", "petani"],
      ["👮", "police officer", "polisi"],
      ["🧑‍🍳", "chef", "koki"],
      ["🧑‍✈️", "pilot", "pilot"],
      ["🧑‍🚒", "firefighter", "pemadam kebakaran"],
      ["🧑‍🎤", "singer", "penyanyi"],
      ["🧑‍🎨", "painter", "pelukis"],
      ["🧑‍🔧", "mechanic", "montir"],
    ],
  },
  {
    id: "alam",
    name: "Alam dan Cuaca",
    emoji: "🌈",
    grade: 5,
    words: [
      ["☀️", "sun", "matahari"],
      ["🌙", "moon", "bulan"],
      ["⭐", "star", "bintang"],
      ["☁️", "cloud", "awan"],
      ["🌧️", "rain", "hujan"],
      ["🌈", "rainbow", "pelangi"],
      ["⛰️", "mountain", "gunung"],
      ["🌊", "sea", "laut"],
      ["🌳", "tree", "pohon"],
      ["🌋", "volcano", "gunung berapi"],
    ],
  },
  {
    id: "kegiatan",
    name: "Kata Kerja",
    emoji: "🏃",
    grade: 6,
    words: [
      ["🏃", "run", "berlari"],
      ["🏊", "swim", "berenang"],
      ["📖", "read", "membaca"],
      ["✍️", "write", "menulis"],
      ["🍽️", "eat", "makan"],
      ["😴", "sleep", "tidur"],
      ["🎤", "sing", "bernyanyi"],
      ["🍳", "cook", "memasak"],
      ["💃", "dance", "menari"],
      ["🚴", "ride a bike", "bersepeda"],
    ],
  },
];
