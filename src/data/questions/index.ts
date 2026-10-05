import type { Grade, Question, Subject } from "@/lib/types";
import k1m from "./kelas-1/matematika.json";
import k1i from "./kelas-1/ipas.json";
import k1e from "./kelas-1/inggris.json";
import k2m from "./kelas-2/matematika.json";
import k2i from "./kelas-2/ipas.json";
import k2e from "./kelas-2/inggris.json";
import k3m from "./kelas-3/matematika.json";
import k3i from "./kelas-3/ipas.json";
import k3e from "./kelas-3/inggris.json";
import k4m from "./kelas-4/matematika.json";
import k4i from "./kelas-4/ipas.json";
import k4e from "./kelas-4/inggris.json";
import k5m from "./kelas-5/matematika.json";
import k5i from "./kelas-5/ipas.json";
import k5e from "./kelas-5/inggris.json";
import k6m from "./kelas-6/matematika.json";
import k6i from "./kelas-6/ipas.json";
import k6e from "./kelas-6/inggris.json";

// ponytail: semua bank soal (~290 soal, kecil) dimuat statis. Pindah ke dynamic import per kelas bila ukurannya membesar.
// Bentuk data JSON divalidasi oleh questions.test.ts, jadi cast di sini aman.
export const QUESTION_BANK = {
  1: { matematika: k1m, ipas: k1i, inggris: k1e },
  2: { matematika: k2m, ipas: k2i, inggris: k2e },
  3: { matematika: k3m, ipas: k3i, inggris: k3e },
  4: { matematika: k4m, ipas: k4i, inggris: k4e },
  5: { matematika: k5m, ipas: k5i, inggris: k5e },
  6: { matematika: k6m, ipas: k6i, inggris: k6e },
} as unknown as Record<Grade, Record<Subject, Question[]>>;

export const getQuestions = (grade: Grade, subject: Subject): Question[] =>
  QUESTION_BANK[grade][subject];

export const SUBJECTS: { id: Subject; name: string; emoji: string }[] = [
  { id: "matematika", name: "Matematika", emoji: "🔢" },
  { id: "ipas", name: "IPAS", emoji: "🔬" },
  { id: "inggris", name: "Bahasa Inggris", emoji: "🗣️" },
];
