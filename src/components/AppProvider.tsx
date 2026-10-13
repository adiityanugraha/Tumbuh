"use client";

import { MotionConfig } from "motion/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createDemoData } from "@/data/demo";
import { PLANT_ORDER } from "@/data/plants";
import { toDateKey } from "@/lib/date";
import { applySession, createGarden, type SessionOutcome } from "@/lib/garden";
import { mergeStates } from "@/lib/sync";
import type {
  Encouragement,
  Garden,
  Grade,
  ParentChallenge,
  Session,
  Student,
} from "@/lib/types";
import {
  createFamily,
  familyCode,
  isCloudConfigured,
  joinFamily,
  pullFamily,
  pushFamily,
} from "@/services/cloud";
import { getRepository } from "@/services/repository";

interface AppState {
  ready: boolean;
  today: string;
  student: Student | null;
  garden: Garden | null;
  sessions: Session[];
  encouragements: Encouragement[];
  challenge: ParentChallenge | null;
  createStudent: (s: Omit<Student, "createdAt">) => Promise<void>;
  setGrade: (grade: Grade) => Promise<void>;
  completeSession: (s: Omit<Session, "id" | "date">) => Promise<SessionOutcome>;
  markEncouragementsRead: () => Promise<void>;
  sendEncouragement: (
    e: Pick<Encouragement, "from" | "message" | "sticker">,
  ) => Promise<void>;
  loadDemo: () => Promise<void>;
  setChallenge: (c: ParentChallenge | null) => Promise<void>;
  reset: () => Promise<void>;
  /** Sinkronisasi antarperangkat (opsional, butuh konfigurasi Supabase). */
  cloudAvailable: boolean;
  family: string | null;
  syncStatus: SyncStatus;
  connectFamily: () => Promise<string>;
  joinWithCode: (code: string) => Promise<void>;
  disconnectFamily: () => void;
  syncNow: () => Promise<void>;
}

export type SyncStatus = "off" | "syncing" | "ok" | "error";

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
  const [challenge, setChallengeState] = useState<ParentChallenge | null>(null);
  const [family, setFamily] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("off");
  const syncing = useRef(false);

  const load = useCallback(async () => {
    const repo = getRepository();
    const [st, g, se, en, ch] = await Promise.all([
      repo.getStudent(),
      repo.getGarden(),
      repo.getSessions(),
      repo.getEncouragements(),
      repo.getChallenge(),
    ]);
    setStudent(st);
    setGarden(g);
    setSessions(se);
    setEncouragements(en);
    setChallengeState(ch);
    setFamily(isCloudConfigured ? familyCode.get() : null);
    setToday(toDateKey());
    setReady(true);
  }, []);

  /** Tarik data keluarga, gabungkan dengan data lokal, lalu kirim balik. Aman dipanggil kapan saja. */
  const syncNow = useCallback(async () => {
    const code = isCloudConfigured ? familyCode.get() : null;
    // ponytail: satu sinkron pada satu waktu; perubahan di tengah jalan ikut terkirim pada sinkron berikutnya.
    if (!code || syncing.current) return;
    syncing.current = true;
    setSyncStatus("syncing");
    try {
      const repo = getRepository();
      const remote = await pullFamily(code);
      const local = await repo.exportState();
      const merged = remote ? mergeStates(local, remote, PLANT_ORDER) : local;
      await pushFamily(code, merged);
      // Gabung lagi dengan data lokal terbaru agar sesi yang selesai selama sinkron tidak tertimpa.
      await repo.importState(
        mergeStates(await repo.exportState(), merged, PLANT_ORDER),
      );
      await load();
      setSyncStatus("ok");
    } catch {
      setSyncStatus("error");
    } finally {
      syncing.current = false;
    }
  }, [load]);

  useEffect(() => {
    // Data hanya ada di localStorage, jadi dimuat setelah halaman tampil di browser.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load().then(syncNow);
    if (!isCloudConfigured) return;
    // Sinkron saat aplikasi dibuka lagi dan tiap menit selama terlihat, agar pesan orang tua cepat sampai.
    const whenVisible = () =>
      document.visibilityState === "visible" && void syncNow();
    document.addEventListener("visibilitychange", whenVisible);
    const timer = setInterval(whenVisible, 60_000);
    return () => {
      document.removeEventListener("visibilitychange", whenVisible);
      clearInterval(timer);
    };
  }, [load, syncNow]);

  const createStudent: AppState["createStudent"] = async (s) => {
    const repo = getRepository();
    const st: Student = { ...s, createdAt: toDateKey() };
    const g = createGarden(PLANT_ORDER);
    await repo.saveStudent(st);
    await repo.saveGarden(g);
    setStudent(st);
    setGarden(g);
    void syncNow();
  };

  const setGrade: AppState["setGrade"] = async (grade) => {
    if (!student) return;
    const st = { ...student, grade };
    await getRepository().saveStudent(st);
    setStudent(st);
    void syncNow();
  };

  const completeSession: AppState["completeSession"] = async (s) => {
    const date = toDateKey();
    const session: Session = { ...s, id: `${Date.now()}`, date };
    const outcome = applySession(
      garden ?? createGarden(PLANT_ORDER),
      session,
      PLANT_ORDER,
    );
    const repo = getRepository();
    await repo.addSession(session);
    await repo.saveGarden(outcome.garden);
    setSessions((prev) => [...prev, session]);
    setGarden(outcome.garden);
    setToday(date);
    void syncNow();
    return outcome;
  };

  const markEncouragementsRead = async () => {
    await getRepository().markEncouragementsRead();
    setEncouragements((prev) => prev.map((e) => ({ ...e, read: true })));
    void syncNow();
  };

  const sendEncouragement: AppState["sendEncouragement"] = async (e) => {
    const item: Encouragement = {
      ...e,
      id: `${Date.now()}`,
      createdAt: toDateKey(),
      read: false,
    };
    await getRepository().addEncouragement(item);
    setEncouragements((prev) => [...prev, item]);
    void syncNow();
  };

  /** Mode Demo: ganti data di perangkat ini dengan anak contoh beserta riwayat belajar seminggu. */
  const loadDemo = async () => {
    disconnectFamily(); // data contoh tidak boleh terkirim ke keluarga yang tersambung
    const repo = getRepository();
    const demo = createDemoData(toDateKey());
    await repo.reset();
    await repo.saveStudent(demo.student);
    await repo.saveGarden(demo.garden);
    for (const s of demo.sessions) await repo.addSession(s);
    await repo.saveChallenge(demo.challenge);
    await load();
  };

  const setChallenge: AppState["setChallenge"] = async (c) => {
    await getRepository().saveChallenge(c);
    setChallengeState(c);
    void syncNow();
  };

  const reset = async () => {
    disconnectFamily(); // hanya memutus perangkat ini, data keluarga di server tetap ada
    await getRepository().reset();
    await load();
  };

  /** Perangkat ini membuat kode keluarga baru dari datanya sendiri. */
  const connectFamily = async () => {
    const code = await createFamily(await getRepository().exportState());
    familyCode.set(code);
    setFamily(code);
    setSyncStatus("ok");
    return code;
  };

  /** Perangkat lain bergabung: data di perangkat ini diganti data keluarga. */
  const joinWithCode = async (code: string) => {
    const remote = await joinFamily(code);
    const repo = getRepository();
    await repo.reset();
    await repo.importState(remote);
    familyCode.set(code.trim().toUpperCase());
    await load();
    setSyncStatus("ok");
  };

  function disconnectFamily() {
    if (isCloudConfigured) familyCode.clear();
    setFamily(null);
    setSyncStatus("off");
  }

  return (
    <AppContext.Provider
      value={{
        ready,
        today,
        student,
        garden,
        sessions,
        encouragements,
        challenge,
        createStudent,
        setGrade,
        completeSession,
        markEncouragementsRead,
        sendEncouragement,
        loadDemo,
        setChallenge,
        reset,
        cloudAvailable: isCloudConfigured,
        family,
        syncStatus,
        connectFamily,
        joinWithCode,
        disconnectFamily,
        syncNow,
      }}
    >
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </AppContext.Provider>
  );
}
