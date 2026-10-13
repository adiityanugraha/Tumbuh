import { daysBetween } from "./date";
import { getRegionStatus } from "./garden";
import type { Garden, Region, Session } from "./types";

export interface Badge {
  id: string;
  emoji: string;
  name: string;
  /** Cara mendapatkannya, ditampilkan ke anak. */
  how: string;
}

interface Progress {
  garden: Garden;
  sessions: Session[];
  regions: Region[];
}

/** Hari belajar berturut-turut terpanjang. Lencana tidak hilang walau streak sekarang putus. */
export function longestStreak(sessions: Session[]): number {
  const days = [...new Set(sessions.map((s) => s.date))].sort();
  let best = 0;
  let run = 0;
  days.forEach((d, i) => {
    run = i > 0 && daysBetween(days[i - 1], d) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
  });
  return best;
}

const doneRegions = ({ garden, regions }: Progress) => regions.filter((r) => getRegionStatus(r, garden) === "selesai").length;

/** Urutan dari yang paling mudah, sehingga lencana berikutnya selalu yang terdekat. */
const RULES: (Badge & { earned: (p: Progress) => boolean })[] = [
  { id: "pertama", emoji: "🌱", name: "Langkah Pertama", how: "Selesaikan 1 sesi belajar", earned: (p) => p.sessions.length >= 1 },
  {
    id: "sempurna",
    emoji: "🎯",
    name: "Tepat Sasaran",
    how: "Benar semua soal dalam satu sesi tanpa salah",
    earned: (p) => p.sessions.some((s) => s.results.length > 0 && s.results.every((r) => r.correctFirstTry)),
  },
  { id: "streak-3", emoji: "🔥", name: "Rajin 3 Hari", how: "Belajar 3 hari berturut-turut", earned: (p) => longestStreak(p.sessions) >= 3 },
  {
    id: "serba-bisa",
    emoji: "📚",
    name: "Serba Bisa",
    how: "Coba 3 mapel yang berbeda",
    earned: (p) => new Set(p.sessions.map((s) => s.subject)).size >= 3,
  },
  { id: "bunga", emoji: "🌸", name: "Tanaman Pertama", how: "Tumbuhkan 1 tanaman sampai penuh", earned: (p) => p.garden.collection.length >= 1 },
  { id: "pulau", emoji: "🗺️", name: "Penjelajah Pulau", how: "Selesaikan 1 wilayah di peta", earned: (p) => doneRegions(p) >= 1 },
  { id: "streak-7", emoji: "🌟", name: "Rajin 7 Hari", how: "Belajar 7 hari berturut-turut", earned: (p) => longestStreak(p.sessions) >= 7 },
  { id: "separuh", emoji: "🏝️", name: "Separuh Nusantara", how: "Selesaikan 3 wilayah di peta", earned: (p) => doneRegions(p) >= 3 },
];

export function badgeStatus(p: Progress): (Badge & { earned: boolean })[] {
  return RULES.map(({ earned, ...b }) => ({ ...b, earned: earned(p) }));
}
