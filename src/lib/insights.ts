import { isWithinLastWeek } from "./date";
import { sessionReward } from "./garden";
import type { ClassChallenge, Classroom, ClassmateSummary, DateKey, GrowthStage, Session, Subject } from "./types";

export interface TopicStat {
  topic: string;
  subject: Subject;
  correctFirstTry: number;
  total: number;
}

export function topicStats(sessions: Session[]): TopicStat[] {
  const map = new Map<string, TopicStat>();
  for (const s of sessions) {
    for (const r of s.results) {
      const key = `${s.subject}:${r.topic}`;
      const stat = map.get(key) ?? { topic: r.topic, subject: s.subject, correctFirstTry: 0, total: 0 };
      stat.total += 1;
      if (r.correctFirstTry) stat.correctFirstTry += 1;
      map.set(key, stat);
    }
  }
  return [...map.values()];
}

/** Dikuasai: minimal 3 soal dan 80% benar di percobaan pertama. Perlu latihan: di bawah 60%. */
export function masteryOf(stat: TopicStat): "dikuasai" | "perlu-latihan" | "berkembang" {
  const ratio = stat.correctFirstTry / stat.total;
  if (stat.total >= 3 && ratio >= 0.8) return "dikuasai";
  if (ratio < 0.6) return "perlu-latihan";
  return "berkembang";
}

export function weeklySummary(sessions: Session[], today: DateKey) {
  const week = sessions.filter((s) => isWithinLastWeek(s.date, today));
  const bySubject: Record<Subject, number> = { matematika: 0, ipas: 0, inggris: 0 };
  for (const s of week) bySubject[s.subject] += 1;
  return {
    sessions: week.length,
    activeDays: new Set(week.map((s) => s.date)).size,
    questions: week.reduce((n, s) => n + s.results.length, 0),
    bySubject,
  };
}

export const totalGrowthPoints = (sessions: Session[]) =>
  sessions.reduce((n, s) => {
    const r = sessionReward(s.results);
    return n + r.water + r.fertilizer;
  }, 0);

export type ClassmateStatus = "aktif" | "layu" | "butuh-perhatian";

export function classmateStatus(c: Pick<ClassmateSummary, "lastStudyDaysAgo">): ClassmateStatus {
  if (c.lastStudyDaysAgo >= 7) return "butuh-perhatian";
  if (c.lastStudyDaysAgo >= 3) return "layu";
  return "aktif";
}

/** Poin minimal untuk tiap tahap pohon Kebun Kelas. */
export const CLASS_TREE_THRESHOLDS: Record<GrowthStage, number> = {
  bibit: 0,
  tunas: 150,
  tumbuh: 400,
  berbunga: 800,
};

export function classTreeStage(points: number): GrowthStage {
  if (points >= CLASS_TREE_THRESHOLDS.berbunga) return "berbunga";
  if (points >= CLASS_TREE_THRESHOLDS.tumbuh) return "tumbuh";
  if (points >= CLASS_TREE_THRESHOLDS.tunas) return "tunas";
  return "bibit";
}

/** Gabungan kontribusi teman sekelas (dummy) dan anak ini ke Kebun Kelas. */
export function classGarden(classroom: Classroom, ownSessions: Session[], today: DateKey) {
  const points =
    classroom.classmates.reduce((n, c) => n + c.growthPoints, 0) + totalGrowthPoints(ownSessions);
  const sessionsThisWeek =
    classroom.classmates.reduce((n, c) => n + c.sessionsThisWeek, 0) +
    weeklySummary(ownSessions, today).sessions;
  return {
    points,
    stage: classTreeStage(points),
    sessionsThisWeek,
    activeToday:
      classroom.classmates.filter((c) => c.lastStudyDaysAgo === 0).length +
      (ownSessions.some((s) => s.date === today) ? 1 : 0),
  };
}

export const challengeProgress = (challenge: ClassChallenge, sessionsThisWeek: number) =>
  Math.min(100, Math.round((sessionsThisWeek / challenge.targetSessions) * 100));

/** Topik dengan rasio salah tertinggi, gabungan data kelas dan sesi anak ini. */
export function hardestTopics(classroom: Classroom, ownSessions: Session[], limit = 5) {
  const merged = new Map(Object.entries(classroom.topicMistakes).map(([k, v]) => [k, { ...v }]));
  for (const s of ownSessions) {
    for (const r of s.results) {
      const stat = merged.get(r.topic) ?? { wrong: 0, total: 0 };
      stat.total += 1;
      if (!r.correctFirstTry) stat.wrong += 1;
      merged.set(r.topic, stat);
    }
  }
  return [...merged.entries()]
    .filter(([, v]) => v.total > 0)
    .map(([topic, v]) => ({ topic, ...v, rate: v.wrong / v.total }))
    .sort((a, b) => b.rate - a.rate)
    .slice(0, limit);
}
