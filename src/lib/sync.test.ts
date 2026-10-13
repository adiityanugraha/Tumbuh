import { describe, expect, it } from "vitest";
import { applySession, createGarden } from "./garden";
import { mergeStates } from "./sync";
import type { Session, SyncState } from "./types";

const ORDER = ["a", "b", "c"];
const s = (id: string, date: string): Session => ({
  id,
  date,
  subject: "matematika",
  grade: 3,
  results: [
    {
      questionId: id,
      topic: "t",
      correctFirstTry: true,
      solved: true,
      attempts: 1,
    },
  ],
});
const base = (over: Partial<SyncState>): SyncState => ({
  student: {
    nickname: "Dewi",
    avatar: "🦋",
    grade: 3,
    createdAt: "2026-10-01",
  },
  garden: createGarden(ORDER),
  sessions: [],
  encouragements: [],
  challenge: null,
  ...over,
});

describe("sinkronisasi antarperangkat", () => {
  it("menggabung sesi dari dua perangkat dan menghitung ulang kebun", () => {
    const anak = base({
      sessions: [s("1", "2026-10-01"), s("3", "2026-10-03")],
    });
    const ortu = base({
      sessions: [s("1", "2026-10-01"), s("2", "2026-10-02")],
    });
    const m = mergeStates(anak, ortu, ORDER);
    expect(m.sessions.map((x) => x.id)).toEqual(["1", "2", "3"]);
    const expected = m.sessions.reduce(
      (g, x) => applySession(g, x, ORDER).garden,
      createGarden(ORDER),
    );
    expect(m.garden).toEqual(expected);
  });

  it("pesan semangat digabung, status dibaca tidak hilang", () => {
    const e = {
      id: "10",
      from: "Ibu",
      message: "Semangat",
      sticker: "🌟",
      createdAt: "2026-10-02",
      read: false,
    };
    const anak = base({ encouragements: [{ ...e, read: true }] });
    const ortu = base({
      encouragements: [e, { ...e, id: "11", message: "Hebat" }],
    });
    const m = mergeStates(anak, ortu, ORDER);
    expect(m.encouragements.map((x) => [x.id, x.read])).toEqual([
      ["10", true],
      ["11", false],
    ]);
  });

  it("tantangan dan profil memakai versi yang paling baru diubah, termasuk penghapusan", () => {
    const ch = {
      id: "c",
      from: "Ibu",
      kind: "hari" as const,
      target: 5,
      reward: "Piknik",
      startDate: "2026-10-01",
    };
    const anak = base({ challenge: ch, challengeAt: 100, studentAt: 50 });
    const ortu = base({
      challenge: null,
      challengeAt: 200,
      student: {
        nickname: "Dewi",
        avatar: "🦋",
        grade: 4,
        createdAt: "2026-10-01",
      },
      studentAt: 10,
    });
    const m = mergeStates(anak, ortu, ORDER);
    expect(m.challenge).toBeNull();
    expect(m.student?.grade).toBe(3);
  });

  it("perangkat baru tanpa profil mengambil profil dari perangkat lain", () => {
    const kosong = base({ student: null, garden: null });
    const anak = base({ sessions: [s("1", "2026-10-01")], studentAt: 5 });
    expect(mergeStates(kosong, anak, ORDER).student?.nickname).toBe("Dewi");
  });
});
