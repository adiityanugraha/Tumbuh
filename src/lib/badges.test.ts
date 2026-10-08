import { describe, expect, it } from "vitest";
import { badgeStatus, longestStreak } from "./badges";
import { createGarden } from "./garden";
import type { Region, Session } from "./types";

const s = (date: string, subject: Session["subject"], firsts: boolean[]): Session => ({
  id: date + subject,
  date,
  subject,
  grade: 3,
  results: firsts.map((f, i) => ({ questionId: `${i}`, topic: "t", correctFirstTry: f, solved: true, attempts: f ? 1 : 2 })),
});
const regions: Region[] = [
  { id: "sumatra", name: "Sumatra", plantIds: ["a", "b"] },
  { id: "jawa", name: "Jawa", plantIds: ["c", "d"] },
];

describe("badges", () => {
  it("streak terpanjang dari tanggal sesi, termasuk yang sudah putus", () => {
    const dates = ["2026-10-01", "2026-10-02", "2026-10-03", "2026-10-03", "2026-10-06", "2026-10-07"];
    expect(longestStreak(dates.map((d) => s(d, "ipas", [true])))).toBe(3);
    expect(longestStreak([])).toBe(0);
  });

  it("lencana terbuka sesuai progres", () => {
    const garden = { ...createGarden(["a", "b", "c", "d"]), collection: ["a", "b"], activePlantId: "c" };
    const sessions = [s("2026-10-01", "matematika", [true, true]), s("2026-10-02", "ipas", [true, false]), s("2026-10-03", "inggris", [false])];
    const earned = badgeStatus({ garden, sessions, regions }).filter((b) => b.earned).map((b) => b.id);
    expect(earned).toEqual(["pertama", "sempurna", "streak-3", "serba-bisa", "bunga", "pulau"]);
  });

  it("anak baru belum punya lencana", () => {
    expect(badgeStatus({ garden: createGarden(["a"]), sessions: [], regions }).some((b) => b.earned)).toBe(false);
  });
});
