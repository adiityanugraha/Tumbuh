import { describe, expect, it } from "vitest";
import {
  masteryBySubject,
  masteryOf,
  topicStats,
  weeklySummary,
} from "./insights";
import { checkAnswer, pickQuestions, shuffle } from "./session";
import type { Question, Session } from "./types";

const s = (date: string, topic: string, firsts: boolean[], subject: Session["subject"] = "matematika"): Session => ({
  id: date + topic,
  date,
  subject,
  grade: 3,
  results: firsts.map((f, i) => ({ questionId: `${i}`, topic, correctFirstTry: f, solved: true, attempts: f ? 1 : 2 })),
});

describe("insights", () => {
  it("menghitung penguasaan per topik", () => {
    const stats = topicStats([s("2026-10-05", "Perkalian", [true, true, true, false, true]), s("2026-10-05", "Pecahan", [false, false, true])]);
    const byTopic = Object.fromEntries(stats.map((t) => [t.topic, masteryOf(t)]));
    expect(byTopic).toEqual({ Perkalian: "dikuasai", Pecahan: "perlu-latihan" });
  });

  it("mengelompokkan topik per mapel untuk laporan orang tua", () => {
    const m = masteryBySubject([s("2026-10-05", "Perkalian", [true, true, true]), s("2026-10-05", "Hewan", [true, false], "ipas")]);
    expect(m.matematika.dikuasai).toEqual(["Perkalian"]);
    expect(m.ipas["perlu-latihan"]).toEqual(["Hewan"]);
    expect(m.inggris).toEqual({ dikuasai: [], berkembang: [], "perlu-latihan": [] });
  });

  it("ringkasan mingguan hanya 7 hari terakhir", () => {
    const sessions = [s("2026-10-05", "x", [true]), s("2026-10-05", "y", [true], "ipas"), s("2026-09-29", "z", [true]), s("2026-09-28", "z", [true])];
    const w = weeklySummary(sessions, "2026-10-05");
    expect(w.sessions).toBe(3);
    expect(w.activeDays).toBe(2);
    expect(w.bySubject).toEqual({ matematika: 2, indonesia: 0, ipas: 1, inggris: 0 });
    expect(w.firstTry).toBe(3);
  });
});

describe("session", () => {
  const choice: Question = { id: "1", type: "pilihan", topic: "t", prompt: "", hint: "", options: ["a", "b"], answer: 1 };
  const match: Question = { id: "2", type: "cocokkan", topic: "t", prompt: "", hint: "", pairs: [["1", "satu"], ["2", "dua"]] };
  const order: Question = { id: "3", type: "urutkan", topic: "t", prompt: "", hint: "", items: ["x", "y", "z"] };

  it("memeriksa jawaban semua tipe soal", () => {
    expect(checkAnswer(choice, 1)).toBe(true);
    expect(checkAnswer(choice, 0)).toBe(false);
    expect(checkAnswer({ ...choice, type: "isian", answer: 7 } as Question, 7)).toBe(true);
    expect(checkAnswer(match, ["satu", "dua"])).toBe(true);
    expect(checkAnswer(match, ["dua", "satu"])).toBe(false);
    expect(checkAnswer(order, ["x", "y", "z"])).toBe(true);
    expect(checkAnswer(order, ["x", "z"])).toBe(false);
  });

  it("acak tanpa kehilangan item dan memilih sesuai jumlah", () => {
    const items = [1, 2, 3, 4, 5, 6, 7];
    expect([...shuffle(items)].sort()).toEqual(items);
    expect(pickQuestions([choice, match, order], 2)).toHaveLength(2);
  });
});

describe("progres topik", () => {
  it("menandai topik dikuasai, perlu latihan, dan belum dilatih", async () => {
    const { topicProgress } = await import("./insights");
    const sessions = [s("2026-10-05", "Perkalian", [true, true, true]), s("2026-10-05", "Pecahan", [false, false]), { ...s("2026-10-05", "Jam", [true, true, true]), grade: 2 as const }];
    expect(topicProgress(sessions, "matematika", 3, ["Perkalian", "Pecahan", "Jam"])).toEqual([
      { topic: "Perkalian", mastery: "dikuasai", answered: 3 },
      { topic: "Pecahan", mastery: "perlu-latihan", answered: 2 },
      { topic: "Jam", mastery: "belum", answered: 0 },
    ]);
  });
});
