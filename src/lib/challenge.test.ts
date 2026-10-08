import { describe, expect, it } from "vitest";
import { challengeStatus } from "./challenge";
import { createMemoryDeck, isPair } from "./memory";
import { mistakeIds } from "./session";
import type { ParentChallenge, Session } from "./types";

const s = (date: string, results: [string, boolean][] = [["q", true]]): Session => ({
  id: date,
  date,
  subject: "matematika",
  grade: 3,
  results: results.map(([questionId, correctFirstTry]) => ({ questionId, topic: "t", correctFirstTry, solved: true, attempts: 1 })),
});

describe("tantangan orang tua", () => {
  const ch: ParentChallenge = { id: "c", from: "Ibu", kind: "hari", target: 3, reward: "Piknik", startDate: "2026-10-05" };
  const sessions = [s("2026-10-04"), s("2026-10-05"), s("2026-10-05"), s("2026-10-07")];

  it("menghitung hari unik sejak tantangan dibuat", () => {
    expect(challengeStatus(ch, sessions, "2026-10-07")).toMatchObject({ done: 2, completed: false, expired: false, daysLeft: 4 });
    expect(challengeStatus(ch, [...sessions, s("2026-10-11")], "2026-10-11")).toMatchObject({ done: 3, completed: true, expired: false });
  });

  it("jenis sesi menghitung semua sesi, kedaluwarsa setelah 7 hari", () => {
    const st = challengeStatus({ ...ch, kind: "sesi" }, sessions, "2026-10-12");
    expect(st).toMatchObject({ done: 3, completed: true, expired: true, endDate: "2026-10-11" });
  });
});

describe("ulang soal salah", () => {
  it("soal salah keluar dari daftar setelah dijawab benar sekali coba", () => {
    const ids = mistakeIds([
      s("2026-10-01", [["a", false], ["b", false], ["c", true]]),
      s("2026-10-02", [["a", true], ["c", false]]),
    ]);
    expect([...ids].sort()).toEqual(["b", "c"]);
  });
});

describe("memori Nusantara", () => {
  it("dua kartu per tanaman dan hanya gambar-nama yang cocok", () => {
    const deck = createMemoryDeck(["rafflesia", "melati"]);
    expect(deck).toHaveLength(4);
    const [g, n] = ["gambar", "nama"].map((f) => deck.find((c) => c.plantId === "melati" && c.face === f)!);
    expect(isPair(g, n)).toBe(true);
    expect(isPair(g, g)).toBe(false);
    expect(isPair(g, deck.find((c) => c.plantId === "rafflesia")!)).toBe(false);
  });
});
