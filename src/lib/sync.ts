import { applySession, createGarden } from "./garden";
import type { Encouragement, Session, SyncState } from "./types";

/** Urutan sesi sesuai waktu: tanggal, lalu id (id sesi dibuat dari Date.now). */
const bySessionOrder = (a: Session, b: Session) =>
  a.date.localeCompare(b.date) ||
  a.id.localeCompare(b.id, undefined, { numeric: true });

/**
 * Gabungkan data dua perangkat tanpa saling menimpa:
 * - sesi dan pesan semangat digabung berdasarkan id (pesan dianggap dibaca bila sudah dibaca di salah satu perangkat),
 * - profil dan tantangan diambil dari versi yang paling baru diubah,
 * - kebun dihitung ulang dari seluruh sesi, karena kebun sepenuhnya ditentukan oleh urutan sesi.
 */
export function mergeStates(
  a: SyncState,
  b: SyncState,
  plantOrder: string[],
): SyncState {
  const sessions = [
    ...new Map([...a.sessions, ...b.sessions].map((s) => [s.id, s])).values(),
  ].sort(bySessionOrder);

  const encouragements = new Map<string, Encouragement>();
  for (const e of [...a.encouragements, ...b.encouragements]) {
    const prev = encouragements.get(e.id);
    encouragements.set(e.id, { ...e, read: e.read || Boolean(prev?.read) });
  }

  const [newerStudent, olderStudent] =
    (a.studentAt ?? 0) >= (b.studentAt ?? 0) ? [a, b] : [b, a];
  const [newerChallenge] =
    (a.challengeAt ?? 0) >= (b.challengeAt ?? 0) ? [a, b] : [b, a];
  const student = newerStudent.student ?? olderStudent.student;

  return {
    student,
    studentAt: Math.max(a.studentAt ?? 0, b.studentAt ?? 0) || undefined,
    garden: student
      ? sessions.reduce(
          (g, s) => applySession(g, s, plantOrder).garden,
          createGarden(plantOrder),
        )
      : null,
    sessions,
    encouragements: [...encouragements.values()].sort((x, y) =>
      x.id.localeCompare(y.id, undefined, { numeric: true }),
    ),
    challenge: newerChallenge.challenge,
    challengeAt: Math.max(a.challengeAt ?? 0, b.challengeAt ?? 0) || undefined,
  };
}
