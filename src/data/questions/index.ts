import { daysBetween } from "@/lib/date";
import type { DateKey, Grade, Question, Subject } from "@/lib/types";
import k1m from "./kelas-1/matematika.json";
import k1i from "./kelas-1/ipas.json";
import k1e from "./kelas-1/inggris.json";
import k1b from "./kelas-1/indonesia.json";
import k2m from "./kelas-2/matematika.json";
import k2i from "./kelas-2/ipas.json";
import k2e from "./kelas-2/inggris.json";
import k2b from "./kelas-2/indonesia.json";
import k3m from "./kelas-3/matematika.json";
import k3i from "./kelas-3/ipas.json";
import k3e from "./kelas-3/inggris.json";
import k3b from "./kelas-3/indonesia.json";
import k4m from "./kelas-4/matematika.json";
import k4i from "./kelas-4/ipas.json";
import k4e from "./kelas-4/inggris.json";
import k4b from "./kelas-4/indonesia.json";
import k5m from "./kelas-5/matematika.json";
import k5i from "./kelas-5/ipas.json";
import k5e from "./kelas-5/inggris.json";
import k5b from "./kelas-5/indonesia.json";
import k6m from "./kelas-6/matematika.json";
import k6i from "./kelas-6/ipas.json";
import k6e from "./kelas-6/inggris.json";
import k6b from "./kelas-6/indonesia.json";

// ponytail: semua bank soal (~380 soal, kecil) dimuat statis. Pindah ke dynamic import per kelas bila ukurannya membesar.
// Bentuk data JSON divalidasi oleh questions.test.ts, jadi cast di sini aman.
export const QUESTION_BANK = {
  1: { matematika: k1m, indonesia: k1b, ipas: k1i, inggris: k1e },
  2: { matematika: k2m, indonesia: k2b, ipas: k2i, inggris: k2e },
  3: { matematika: k3m, indonesia: k3b, ipas: k3i, inggris: k3e },
  4: { matematika: k4m, indonesia: k4b, ipas: k4i, inggris: k4e },
  5: { matematika: k5m, indonesia: k5b, ipas: k5i, inggris: k5e },
  6: { matematika: k6m, indonesia: k6b, ipas: k6i, inggris: k6e },
} as unknown as Record<Grade, Record<Subject, Question[]>>;

export const getQuestions = (grade: Grade, subject: Subject): Question[] =>
  QUESTION_BANK[grade][subject];

export const SUBJECTS: { id: Subject; name: string; emoji: string }[] = [
  { id: "matematika", name: "Matematika", emoji: "🔢" },
  { id: "indonesia", name: "Bahasa Indonesia", emoji: "📖" },
  { id: "ipas", name: "IPAS", emoji: "🔬" },
  { id: "inggris", name: "Bahasa Inggris", emoji: "🗣️" },
];

/** Jumlah soal per mapel (kelas ini) yang ada di daftar soal salah. */
export const reviewCounts = (grade: Grade, wrong: Set<string>) =>
  SUBJECTS.map((s) => ({
    ...s,
    count: getQuestions(grade, s.id).filter((q) => wrong.has(q.id)).length,
  }));

/** Topik unik satu mapel di kelas tertentu, sesuai urutan di bank soal. */
export const topicsOf = (grade: Grade, subject: Subject) => [
  ...new Set(getQuestions(grade, subject).map((q) => q.topic)),
];

/** Soal Hari Ini: mapel bergiliran setiap hari, soalnya tetap sama sepanjang hari itu. */
export function getDailyQuestion(
  grade: Grade,
  today: DateKey,
): { subject: Subject; question: Question } {
  const day = Math.abs(daysBetween("2026-01-01", today));
  const subject = SUBJECTS[day % SUBJECTS.length].id;
  const bank = getQuestions(grade, subject);
  return { subject, question: bank[(day * 5 + 3) % bank.length] };
}
