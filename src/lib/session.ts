import type { Question, Session } from "./types";

export const SESSION_SIZE = 5;

export function shuffle<T>(items: T[], random: () => number = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function pickQuestions(
  bank: Question[],
  count = SESSION_SIZE,
  random: () => number = Math.random,
): Question[] {
  return shuffle(bank, random).slice(0, count);
}

/** Id soal yang terakhir kali tidak benar di percobaan pertama. Hilang dari daftar setelah dijawab benar sekali coba. */
export function mistakeIds(sessions: Session[]): Set<string> {
  const last = new Map<string, boolean>();
  // sessions tersimpan berurutan waktu, jadi hasil terakhir menimpa yang lama.
  for (const s of sessions) for (const r of s.results) last.set(r.questionId, r.correctFirstTry);
  return new Set([...last].filter(([, ok]) => !ok).map(([id]) => id));
}

/** Jawaban per tipe: pilihan = indeks, isian = angka, cocokkan = pasangan kanan sesuai urutan kiri, urutkan = urutan item. */
export type AnswerValue = number | string[];

export function checkAnswer(question: Question, value: AnswerValue): boolean {
  switch (question.type) {
    case "pilihan":
    case "isian":
      return value === question.answer;
    case "cocokkan":
      return (
        Array.isArray(value) &&
        value.length === question.pairs.length &&
        question.pairs.every(([, right], i) => value[i] === right)
      );
    case "urutkan":
      return (
        Array.isArray(value) &&
        value.length === question.items.length &&
        question.items.every((item, i) => value[i] === item)
      );
  }
}
