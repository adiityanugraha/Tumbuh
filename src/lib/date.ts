import type { DateKey } from "./types";

const pad = (n: number) => String(n).padStart(2, "0");

/** Tanggal lokal perangkat, bukan UTC, agar pergantian hari sesuai jam anak. */
export function toDateKey(date: Date = new Date()): DateKey {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toUtcMs(key: DateKey): number {
  const [y, m, d] = key.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

/** Selisih hari kalender dari a ke b (b - a). */
export function daysBetween(a: DateKey, b: DateKey): number {
  return Math.round((toUtcMs(b) - toUtcMs(a)) / 86_400_000);
}

export function addDays(key: DateKey, days: number): DateKey {
  const d = new Date(toUtcMs(key) + days * 86_400_000);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** true bila key termasuk 7 hari terakhir (hari ini dan 6 hari sebelumnya). */
export function isWithinLastWeek(key: DateKey, today: DateKey): boolean {
  const diff = daysBetween(key, today);
  return diff >= 0 && diff < 7;
}

/** Ubah DateKey menjadi Date lokal (tengah malam), untuk format nama hari/bulan. */
export function keyToDate(key: DateKey): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}
