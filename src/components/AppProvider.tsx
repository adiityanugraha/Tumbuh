"use client";

import { MotionConfig } from "motion/react";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { createDemoData } from "@/data/demo";
import { PLANT_ORDER } from "@/data/plants";
import { toDateKey } from "@/lib/date";
import { applySession, createGarden, type SessionOutcome } from "@/lib/garden";
import type { Encouragement, Garden, Grade, Session, Student } from "@/lib/types";
import { getRepository } from "@/services/repository";

interface AppState {
  ready: boolean;
  today: string;
  student: Student | null;
  garden: Garden | null;
  sessions: Session[];
  encouragements: Encouragement[];
  createStudent: (s: Omit<Student, "createdAt">) => Promise<void>;
  setGrade: (grade: Grade) => Promise<void>;
  completeSession: (s: Omit<Session, "id" | "date">) => Promise<SessionOutcome>;
  markEncouragementsRead: () => Promise<void>;
  sendEncouragement: (e: Pick<Encouragement, "from" | "message" | "sticker">) => Promise<void>;
  loadDemo: () => Promise<void>;
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
  const [encouragements, setEncouragements] = useState<Encouragement[]>([]);

  const load = useCallback(async () => {
    const repo = getRepository();
    const [st, g, se, en] = await Promise.all([
      repo.getStudent(),
      repo.getGarden(),
      repo.getSessions(),
      repo.getEncouragements(),
    ]);
    setStudent(st);
    setGarden(g);
    setSessions(se);
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

  const sendEncouragement: AppState["sendEncouragement"] = async (e) => {
    const item: Encouragement = { ...e, id: `${Date.now()}`, createdAt: toDateKey(), read: false };
    await getRepository().addEncouragement(item);
    setEncouragements((prev) => [...prev, item]);
  };

  /** Mode Demo: ganti data di perangkat ini dengan anak contoh beserta riwayat belajar seminggu. */
  const loadDemo = async () => {
    const repo = getRepository();
    const demo = createDemoData(toDateKey());
    await repo.reset();
    await repo.saveStudent(demo.student);
    await repo.saveGarden(demo.garden);
    for (const s of demo.sessions) await repo.addSession(s);
    await load();
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
        encouragements,
        createStudent,
        setGrade,
        completeSession,
        markEncouragementsRead,
        sendEncouragement,
        loadDemo,
        reset,
      }}
    >
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </AppContext.Provider>
  );
}
