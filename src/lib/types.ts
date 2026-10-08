export type Grade = 1 | 2 | 3 | 4 | 5 | 6;
export type Subject = "matematika" | "ipas" | "inggris";
export type GrowthStage = "bibit" | "tunas" | "tumbuh" | "berbunga";
export type RegionId =
  | "sumatra"
  | "jawa"
  | "kalimantan"
  | "sulawesi"
  | "bali-nusra"
  | "maluku-papua";

/** Tanggal lokal format YYYY-MM-DD. */
export type DateKey = string;

interface QuestionBase {
  id: string;
  topic: string;
  prompt: string;
  hint: string;
  /** Emoji ilustrasi soal. */
  image?: string;
  /** Teks Bahasa Inggris yang dilafalkan dengan suara en-US (prompt tetap dibacakan id-ID). */
  say?: string;
}

export interface ChoiceQuestion extends QuestionBase {
  type: "pilihan";
  /** Diacak saat ditampilkan, jadi jawaban boleh selalu di indeks yang sama di data. */
  options: string[];
  /** Indeks jawaban benar di options (sebelum diacak). */
  answer: number;
}

export interface NumberQuestion extends QuestionBase {
  type: "isian";
  answer: number;
}

export interface MatchQuestion extends QuestionBase {
  type: "cocokkan";
  /** [kiri, kanan]. Sisi kanan diacak saat ditampilkan. */
  pairs: [string, string][];
}

export interface OrderQuestion extends QuestionBase {
  type: "urutkan";
  /** Urutan benar. Ditampilkan teracak. */
  items: string[];
}

export type Question = ChoiceQuestion | NumberQuestion | MatchQuestion | OrderQuestion;

export interface PlantSpecies {
  id: string;
  name: string;
  latinName: string;
  region: RegionId;
  origin: string;
  fact: string;
  emoji: string;
  /** Warna bunga/buah untuk ilustrasi tanaman. */
  color: string;
  /** Nama tahap akhir bila bukan bunga, misalnya "Dewasa" untuk pohon atau "Berbuah". Bawaan: "Berbunga". */
  matureLabel?: string;
}

export interface Region {
  id: RegionId;
  name: string;
  plantIds: string[];
}

export interface Student {
  nickname: string;
  avatar: string;
  grade: Grade;
  createdAt: DateKey;
  /** true bila profil dibuat dari Mode Demo (riwayat belajar contoh). */
  demo?: boolean;
}

export interface Garden {
  activePlantId: string;
  water: number;
  fertilizer: number;
  collection: string[];
  streak: number;
  lastStudyDate: DateKey | null;
}

export interface AnswerResult {
  questionId: string;
  topic: string;
  correctFirstTry: boolean;
  /** false bila jawaban akhirnya ditunjukkan setelah MAX_ATTEMPTS salah. */
  solved: boolean;
  attempts: number;
}

export interface Session {
  id: string;
  date: DateKey;
  subject: Subject;
  grade: Grade;
  results: AnswerResult[];
}

export interface Encouragement {
  id: string;
  /** Pengirim, misalnya "Ibu" atau "Ayah". */
  from?: string;
  message: string;
  sticker: string;
  createdAt: DateKey;
  read: boolean;
}

/** Tantangan mingguan buatan orang tua, berlaku 7 hari sejak startDate. */
export interface ParentChallenge {
  id: string;
  from: string;
  kind: "hari" | "sesi";
  target: number;
  reward: string;
  startDate: DateKey;
}
