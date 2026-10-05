import { describe, expect, it } from "vitest";
import {
  applySession,
  bloomProgress,
  createGarden,
  currentStreak,
  getGrowthStage,
  getRegionStatus,
  isWilted,
  nextStreak,
  rewardFor,
} from "./garden";
import { addDays, daysBetween, toDateKey } from "./date";
import type { AnswerResult, Garden, Session } from "./types";

const ORDER = ["a", "b", "c"];
const ok = (correctFirstTry = true): AnswerResult => ({
  questionId: "q",
  topic: "t",
  correctFirstTry,
  solved: true,
  attempts: correctFirstTry ? 1 : 2,
});
const session = (date: string, results: AnswerResult[]): Session => ({
  id: date,
  date,
  subject: "matematika",
  grade: 3,
  results,
});
const perfect = (date: string) => session(date, [ok(), ok(), ok(), ok(), ok()]);

describe("date", () => {
  it("menghitung selisih hari melewati pergantian bulan dan tahun", () => {
    expect(daysBetween("2026-10-31", "2026-11-01")).toBe(1);
    expect(daysBetween("2026-12-31", "2027-01-01")).toBe(1);
    expect(addDays("2026-02-28", 1)).toBe("2026-03-01");
  });

  it("memakai tanggal lokal, bukan UTC", () => {
    expect(toDateKey(new Date(2026, 9, 5, 23, 59))).toBe("2026-10-05");
  });
});

describe("reward dan tahap", () => {
  it("benar pertama = air + pupuk, setelah petunjuk = air, tidak terjawab = 0", () => {
    expect(rewardFor(ok(true))).toEqual({ water: 1, fertilizer: 1 });
    expect(rewardFor(ok(false))).toEqual({ water: 1, fertilizer: 0 });
    expect(rewardFor({ ...ok(false), solved: false })).toEqual({ water: 0, fertilizer: 0 });
  });

  it("tahap pertumbuhan sesuai ambang", () => {
    expect([0, 4, 10, 16, 99].map(getGrowthStage)).toEqual([
      "bibit",
      "tunas",
      "tumbuh",
      "berbunga",
      "berbunga",
    ]);
    expect(bloomProgress(8)).toBe(50);
    expect(bloomProgress(40)).toBe(100);
  });
});

describe("streak dan layu", () => {
  it("streak naik bila belajar berturut-turut, tetap bila hari yang sama, reset bila terputus", () => {
    expect(nextStreak(null, 0, "2026-10-05")).toBe(1);
    expect(nextStreak("2026-10-04", 3, "2026-10-05")).toBe(4);
    expect(nextStreak("2026-10-05", 3, "2026-10-05")).toBe(3);
    expect(nextStreak("2026-10-02", 3, "2026-10-05")).toBe(1);
  });

  it("streak tampil 0 bila kemarin tidak belajar", () => {
    const g: Garden = { ...createGarden(ORDER), streak: 5, lastStudyDate: "2026-10-03" };
    expect(currentStreak(g, "2026-10-04")).toBe(5);
    expect(currentStreak(g, "2026-10-05")).toBe(0);
  });

  it("layu setelah 3 hari tidak belajar, profil baru tidak layu", () => {
    const g = { ...createGarden(ORDER), lastStudyDate: "2026-10-01" };
    expect(isWilted(g, "2026-10-03")).toBe(false);
    expect(isWilted(g, "2026-10-04")).toBe(true);
    expect(isWilted(createGarden(ORDER), "2026-10-04")).toBe(false);
  });

  it("satu sesi memulihkan tanaman yang layu", () => {
    const wilted = { ...createGarden(ORDER), lastStudyDate: "2026-09-20", streak: 4 };
    const { garden } = applySession(wilted, perfect("2026-10-05"), ORDER);
    expect(isWilted(garden, "2026-10-05")).toBe(false);
    expect(garden.streak).toBe(1);
  });
});

describe("applySession", () => {
  it("menambah air dan pupuk tanpa berbunga", () => {
    const out = applySession(createGarden(ORDER), perfect("2026-10-05"), ORDER);
    expect(out.reward).toEqual({ water: 5, fertilizer: 5 });
    expect(out.garden.water + out.garden.fertilizer).toBe(10);
    expect(out.bloomedPlantId).toBeNull();
  });

  it("berbunga: masuk koleksi, tanaman berikutnya aktif, sisa poin dibawa", () => {
    const first = applySession(createGarden(ORDER), perfect("2026-10-05"), ORDER).garden;
    const out = applySession(first, perfect("2026-10-06"), ORDER);
    expect(out.bloomedPlantId).toBe("a");
    expect(out.nextPlantId).toBe("b");
    expect(out.garden.collection).toEqual(["a"]);
    expect(out.garden.activePlantId).toBe("b");
    expect(out.garden.water + out.garden.fertilizer).toBe(4);
  });

  it("tanaman terakhir tetap mekar setelah semua terkumpul", () => {
    const g: Garden = { ...createGarden(ORDER), activePlantId: "c", collection: ["a", "b"], water: 15 };
    const out = applySession(g, perfect("2026-10-05"), ORDER);
    expect(out.bloomedPlantId).toBe("c");
    expect(out.nextPlantId).toBeNull();
    expect(out.garden.collection).toEqual(["a", "b", "c"]);
    const again = applySession(out.garden, perfect("2026-10-06"), ORDER);
    expect(again.bloomedPlantId).toBeNull();
  });

  it("status wilayah: selesai, aktif, terkunci", () => {
    const g: Garden = { ...createGarden(ORDER), activePlantId: "c", collection: ["a", "b"] };
    expect(getRegionStatus({ id: "sumatra", name: "S", plantIds: ["a", "b"] }, g)).toBe("selesai");
    expect(getRegionStatus({ id: "jawa", name: "J", plantIds: ["c", "d"] }, g)).toBe("aktif");
    expect(getRegionStatus({ id: "kalimantan", name: "K", plantIds: ["e"] }, g)).toBe("terkunci");
  });
});
