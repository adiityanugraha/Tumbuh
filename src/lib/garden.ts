import { daysBetween } from "./date";
import type { AnswerResult, DateKey, Garden, GrowthStage, Region, Session } from "./types";

export const MAX_ATTEMPTS = 3;
export const WILT_AFTER_DAYS = 3;
/** Poin tumbuh (air + pupuk) minimal untuk tiap tahap. */
export const STAGE_THRESHOLDS: Record<GrowthStage, number> = {
  bibit: 0,
  tunas: 4,
  tumbuh: 10,
  berbunga: 16,
};
const BLOOM = STAGE_THRESHOLDS.berbunga;

/** Benar di percobaan pertama: air + pupuk. Benar setelah petunjuk: air saja. */
export function rewardFor(result: AnswerResult): { water: number; fertilizer: number } {
  if (!result.solved) return { water: 0, fertilizer: 0 };
  return result.correctFirstTry ? { water: 1, fertilizer: 1 } : { water: 1, fertilizer: 0 };
}

export function sessionReward(results: AnswerResult[]) {
  return results.reduce(
    (sum, r) => {
      const { water, fertilizer } = rewardFor(r);
      return { water: sum.water + water, fertilizer: sum.fertilizer + fertilizer };
    },
    { water: 0, fertilizer: 0 },
  );
}

export const growthPoints = (g: Pick<Garden, "water" | "fertilizer">) => g.water + g.fertilizer;

export function getGrowthStage(points: number): GrowthStage {
  if (points >= STAGE_THRESHOLDS.berbunga) return "berbunga";
  if (points >= STAGE_THRESHOLDS.tumbuh) return "tumbuh";
  if (points >= STAGE_THRESHOLDS.tunas) return "tunas";
  return "bibit";
}

/** Persentase menuju berbunga, 0-100. */
export const bloomProgress = (points: number) => Math.min(100, Math.round((points / BLOOM) * 100));

export function nextStreak(lastStudyDate: DateKey | null, streak: number, today: DateKey): number {
  if (!lastStudyDate) return 1;
  const diff = daysBetween(lastStudyDate, today);
  if (diff <= 0) return Math.max(streak, 1);
  if (diff === 1) return streak + 1;
  return 1;
}

/** Streak yang ditampilkan: 0 bila kemarin tidak belajar. */
export function currentStreak(garden: Garden, today: DateKey): number {
  if (!garden.lastStudyDate) return 0;
  return daysBetween(garden.lastStudyDate, today) <= 1 ? garden.streak : 0;
}

/** Layu bila tidak belajar 3 hari atau lebih. Tidak ada kondisi mati. */
export function isWilted(garden: Garden, today: DateKey): boolean {
  if (!garden.lastStudyDate) return false;
  return daysBetween(garden.lastStudyDate, today) >= WILT_AFTER_DAYS;
}

export function createGarden(plantOrder: string[]): Garden {
  return {
    activePlantId: plantOrder[0],
    water: 0,
    fertilizer: 0,
    collection: [],
    streak: 0,
    lastStudyDate: null,
  };
}

export interface SessionOutcome {
  garden: Garden;
  reward: { water: number; fertilizer: number };
  /** Tanaman yang baru berbunga dan masuk koleksi. */
  bloomedPlantId: string | null;
  /** Tanaman aktif yang baru (setelah berbunga). */
  nextPlantId: string | null;
}

/**
 * Terapkan hasil satu sesi ke kebun: tambah air/pupuk, perbarui streak (otomatis memulihkan layu),
 * dan bila berbunga, masukkan ke koleksi lalu aktifkan tanaman berikutnya sesuai urutan peta.
 */
export function applySession(
  garden: Garden,
  session: Session,
  plantOrder: string[],
): SessionOutcome {
  const reward = sessionReward(session.results);
  let next: Garden = {
    ...garden,
    water: garden.water + reward.water,
    fertilizer: garden.fertilizer + reward.fertilizer,
    streak: nextStreak(garden.lastStudyDate, garden.streak, session.date),
    lastStudyDate: session.date,
  };

  const alreadyCollected = garden.collection.includes(garden.activePlantId);
  if (alreadyCollected || growthPoints(next) < BLOOM) {
    return { garden: next, reward, bloomedPlantId: null, nextPlantId: null };
  }

  const collection = [...garden.collection, garden.activePlantId];
  const nextPlantId = plantOrder.find((id) => !collection.includes(id)) ?? null;
  if (nextPlantId) {
    // Sisa poin dibawa ke tanaman berikutnya sebagai air.
    next = { ...next, collection, activePlantId: nextPlantId, water: growthPoints(next) - BLOOM, fertilizer: 0 };
  } else {
    // Semua tanaman terkumpul: tanaman terakhir tetap mekar.
    next = { ...next, collection };
  }
  return { garden: next, reward, bloomedPlantId: garden.activePlantId, nextPlantId };
}

export type RegionStatus = "selesai" | "aktif" | "terkunci";

export function getRegionStatus(region: Region, garden: Garden): RegionStatus {
  if (region.plantIds.every((id) => garden.collection.includes(id))) return "selesai";
  if (region.plantIds.includes(garden.activePlantId)) return "aktif";
  return "terkunci";
}
