import { describe, expect, it } from "vitest";
import {
  challengeProgress,
  classGarden,
  classmateStatus,
  hardestTopics,
  masteryOf,
  topicStats,
  weeklySummary,
} from "./insights";
import { checkAnswer, pickQuestions, shuffle } from "./session";
import type { Classroom, Question, Session } from "./types";

const s = (date: string, topic: string, firsts: boolean[], subject: Session["subject"] = "matematika"): Session => ({
  id: date + topic,
  date,
  subject,
  grade: 3,
  results: firsts.map((f, i) => ({ questionId: `${i}`, topic, correctFirstTry: f, solved: true, attempts: f ? 1 : 2 })),
});

const classroom: Classroom = {
  name: "Tes",
  grade: 3,
  classmates: [
    { nickname: "A", avatar: "", streak: 1, lastStudyDaysAgo: 0, sessionsThisWeek: 3, growthPoints: 20 },
    { nickname: "B", avatar: "", streak: 0, lastStudyDaysAgo: 8, sessionsThisWeek: 0, growthPoints: 5 },
  ],
  topicMistakes: { Pecahan: { wrong: 5, total: 10 }, Jam: { wrong: 1, total: 10 } },
};

describe("insights", () => {
  it("menghitung penguasaan per topik", () => {
    const stats = topicStats([s("2026-10-05", "Perkalian", [true, true, true, false, true]), s("2026-10-05", "Pecahan", [false, false, true])]);
    const byTopic = Object.fromEntries(stats.map((t) => [t.topic, masteryOf(t)]));
    expect(byTopic).toEqual({ Perkalian: "dikuasai", Pecahan: "perlu-latihan" });
  });

  it("ringkasan mingguan hanya 7 hari terakhir", () => {
    const sessions = [s("2026-10-05", "x", [true]), s("2026-10-05", "y", [true], "ipas"), s("2026-09-29", "z", [true]), s("2026-09-28", "z", [true])];
    const w = weeklySummary(sessions, "2026-10-05");
    expect(w.sessions).toBe(3);
    expect(w.activeDays).toBe(2);
    expect(w.bySubject).toEqual({ matematika: 2, ipas: 1, inggris: 0 });
  });

  it("status teman: aktif, layu, butuh perhatian", () => {
    expect([0, 2, 3, 6, 7].map((d) => classmateStatus({ lastStudyDaysAgo: d }))).toEqual([
      "aktif",
      "aktif",
      "layu",
      "layu",
      "butuh-perhatian",
    ]);
  });

  it("kebun kelas menggabungkan kontribusi teman dan anak ini", () => {
    const own = [s("2026-10-05", "x", [true, true])];
    const g = classGarden(classroom, own, "2026-10-05");
    expect(g.points).toBe(29);
    expect(g.sessionsThisWeek).toBe(4);
    expect(g.activeToday).toBe(2);
    expect(challengeProgress({ id: "c", title: "", targetSessions: 8, reward: "", createdAt: "" }, 4)).toBe(50);
    expect(challengeProgress({ id: "c", title: "", targetSessions: 2, reward: "", createdAt: "" }, 4)).toBe(100);
  });

  it("materi tersulit diurutkan dari rasio salah tertinggi", () => {
    const top = hardestTopics(classroom, [s("2026-10-05", "Jam", [false, false, false, false, false, false, false, false, false, false])]);
    expect(top.map((t) => t.topic)).toEqual(["Jam", "Pecahan"]);
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
