import type { ClassChallenge, Classroom, ClassmateSummary } from "@/lib/types";

// DUMMY: teman sekelas fiktif untuk Mode Demo. Di UI wajib berlabel "Data contoh".
const c = (
  nickname: string,
  avatar: string,
  streak: number,
  lastStudyDaysAgo: number,
  sessionsThisWeek: number,
  growthPoints: number,
): ClassmateSummary => ({ nickname, avatar, streak, lastStudyDaysAgo, sessionsThisWeek, growthPoints });

export const DEMO_CLASSROOM: Classroom = {
  name: "Kelas Melati",
  grade: 3,
  classmates: [
    c("Bima", "🦁", 6, 0, 5, 48),
    c("Sari", "🐰", 4, 0, 4, 37),
    c("Dodi", "🐻", 0, 4, 1, 12),
    c("Rara", "🦊", 9, 0, 7, 66),
    c("Ucok", "🐯", 2, 1, 3, 25),
    c("Lala", "🐼", 0, 8, 0, 6),
    c("Tegar", "🐸", 3, 0, 3, 29),
    c("Putri", "🦄", 5, 0, 5, 41),
    c("Ari", "🐵", 1, 1, 2, 18),
    c("Wulan", "🐨", 7, 0, 6, 55),
    c("Fikri", "🐧", 0, 3, 1, 15),
    c("Nisa", "🐱", 2, 0, 2, 21),
    c("Galih", "🐶", 0, 5, 1, 9),
    c("Intan", "🦋", 4, 1, 4, 33),
    c("Yoga", "🐢", 1, 0, 2, 16),
    c("Mega", "🐞", 0, 10, 0, 4),
    c("Raka", "🐳", 3, 0, 3, 27),
    c("Tiara", "🐥", 6, 0, 5, 44),
    c("Joko", "🐮", 0, 3, 2, 14),
  ],
};

// DUMMY: tantangan kelas contoh agar Kebun Kelas tidak kosong saat demo.
export const DEMO_CHALLENGE: ClassChallenge = {
  id: "tantangan-awal",
  title: "Belajar 90 sesi bersama minggu ini",
  targetSessions: 90,
  reward: "Pohon Beringin Kelas",
  createdAt: "2026-10-05",
};
