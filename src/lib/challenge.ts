import { addDays, daysBetween } from "./date";
import type { DateKey, ParentChallenge, Session } from "./types";

export const CHALLENGE_DAYS = 7;

/** Progres tantangan orang tua: dihitung dari sesi selama 7 hari sejak tantangan dibuat. */
export function challengeStatus(ch: ParentChallenge, sessions: Session[], today: DateKey) {
  const endDate = addDays(ch.startDate, CHALLENGE_DAYS - 1);
  const inRange = sessions.filter((s) => s.date >= ch.startDate && s.date <= endDate);
  const done = ch.kind === "hari" ? new Set(inRange.map((s) => s.date)).size : inRange.length;
  return {
    done: Math.min(done, ch.target),
    completed: done >= ch.target,
    expired: today > endDate,
    endDate,
    daysLeft: Math.max(0, daysBetween(today, endDate)),
  };
}

export const challengeLabel = (ch: ParentChallenge) =>
  ch.kind === "hari" ? `Belajar ${ch.target} hari` : `Selesaikan ${ch.target} sesi belajar`;
