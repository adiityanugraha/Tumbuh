"use client";

import { MotionConfig } from "motion/react";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { PLANT_ORDER } from "@/data/plants";
import { toDateKey } from "@/lib/date";
import { applySession, createGarden, type SessionOutcome } from "@/lib/garden";
import type { ClassChallenge, Encouragement, Garden, Grade, Session, Student } from "@/lib/types";
import { getRepository } from "@/services/repository";

interface AppState {
  ready: boolean;
  today: string;
  student: Student | null;
  garden: Garden | null;
  sessions: Session[];
  challenges: ClassChallenge[];
  encouragements: Encouragement[];
  createStudent: (s: Omit<Student, "createdAt">) => Promise<void>;
  setGrade: (grade: Grade) => Promise<void>;
  completeSession: (s: Omit<Session, "id" | "date">) => Promise<SessionOutcome>;
  markEncouragementsRead: () => Promise<void>;
  reset: () => Promise<void>;
}

const AppContext = createContext<AppState | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp harus dipakai di dalam AppProvider");
  return ctx;
}

/** Memuat data dari repository saat aplikasi dibuka di browser, lalu menyimpan setiap perubahan. */
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [today, setToday] = useState("");
  const [student, setStudent] = useState<Student | null>(null);
  const [garden, setGarden] = useState<Garden | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [challenges, setChallenges] = useState<ClassChallenge[]>([]);
  const [encouragements, setEncouragements] = useState<Encouragement[]>([]);

  const load = useCallback(async () => {
    const repo = getRepository();
    const [st, g, se, ch, en] = await Promise.all([
      repo.getStudent(),
      repo.getGarden(),
      repo.getSessions(),
      repo.getChallenges(),
      repo.getEncouragements(),
    ]);
    setStudent(st);
    setGarden(g);
    setSessions(se);
    setChallenges(ch);
    setEncouragements(en);
    setToday(toDateKey());
    setReady(true);
  }, []);

  useEffect(() => {
    // Data hanya ada di localStorage, jadi dimuat setelah halaman tampil di browser.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const createStudent: AppState["createStudent"] = async (s) => {
    const repo = getRepository();
    const st: Student = { ...s, createdAt: toDateKey() };
    const g = createGarden(PLANT_ORDER);
    await repo.saveStudent(st);
    await repo.saveGarden(g);
    setStudent(st);
    setGarden(g);
  };

  const setGrade: AppState["setGrade"] = async (grade) => {
    if (!student) return;
    const st = { ...student, grade };
    await getRepository().saveStudent(st);
    setStudent(st);
  };

  const completeSession: AppState["completeSession"] = async (s) => {
    const date = toDateKey();
    const session: Session = { ...s, id: `${Date.now()}`, date };
    const outcome = applySession(garden ?? createGarden(PLANT_ORDER), session, PLANT_ORDER);
    const repo = getRepository();
    await repo.addSession(session);
    await repo.saveGarden(outcome.garden);
    setSessions((prev) => [...prev, session]);
    setGarden(outcome.garden);
    setToday(date);
    return outcome;
  };

  const markEncouragementsRead = async () => {
    await getRepository().markEncouragementsRead();
    setEncouragements((prev) => prev.map((e) => ({ ...e, read: true })));
  };

  const reset = async () => {
    await getRepository().reset();
    await load();
  };

  return (
    <AppContext.Provider
      value={{
        ready,
        today,
        student,
        garden,
        sessions,
        challenges,
        encouragements,
        createStudent,
        setGrade,
        completeSession,
        markEncouragementsRead,
        reset,
      }}
    >
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </AppContext.Provider>
  );
}
