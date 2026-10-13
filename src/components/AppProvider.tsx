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
import { normalizeUsername } from "@/lib/account";
import { toDateKey } from "@/lib/date";
import { applySession, createGarden, type SessionOutcome } from "@/lib/garden";
import { mergeStates } from "@/lib/sync";
import type {
  Account,
  Encouragement,
  Garden,
  Grade,
  ParentChallenge,
  Session,
  Student,
  SyncState,
} from "@/lib/types";
import * as cloud from "@/services/cloud";
import { getRepository } from "@/services/repository";
import {
  applySettings,
  DEFAULT_SETTINGS,
  getSettings,
  saveSettings,
  type Settings,
} from "@/services/settings";

interface AppState {
  ready: boolean;
  today: string;
  student: Student | null;
  garden: Garden | null;
  sessions: Session[];
  encouragements: Encouragement[];
  challenge: ParentChallenge | null;
  /** Profil lokal tanpa akun (dipakai bila Supabase tidak dikonfigurasi). */
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
  /** Akun (butuh konfigurasi Supabase). */
  cloudAvailable: boolean;
  account: Account | null;
  syncStatus: SyncStatus;
  registerChild: (input: {
    nickname: string;
    password: string;
    avatar: string;
    grade: Grade;
  }) => Promise<void>;
  registerParent: (input: {
    nickname: string;
    password: string;
    code: string;
  }) => Promise<void>;
  login: (
    role: Account["role"],
    nickname: string,
    password: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  switchChild: (childId: string) => Promise<void>;
  addChild: (code: string) => Promise<void>;
  syncNow: () => Promise<void>;
  /** Pengaturan perangkat (tema, huruf, animasi, suara, sapaan). */
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
  setAvatar: (avatar: string) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  unlinkChild: (childId: string) => Promise<void>;
}

export type SyncStatus = "off" | "syncing" | "ok" | "error";

const AppContext = createContext<AppState | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp harus dipakai di dalam AppProvider");
  return ctx;
}

/** Akun anak menyinkronkan datanya sendiri; akun orang tua menyinkronkan anak yang sedang dilihat. */
const syncTarget = (acc: Account | null) =>
  acc?.role === "anak" ? acc.userId : acc?.activeChildId;

/** Memuat data dari repository saat aplikasi dibuka di browser, lalu menyimpan setiap perubahan. */
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [today, setToday] = useState("");
  const [student, setStudent] = useState<Student | null>(null);
  const [garden, setGarden] = useState<Garden | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [encouragements, setEncouragements] = useState<Encouragement[]>([]);
  const [challenge, setChallengeState] = useState<ParentChallenge | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("off");
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
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
    setAccount(cloud.isCloudConfigured ? cloud.accountStore.get() : null);
    setSettings(getSettings());
    setToday(toDateKey());
    setReady(true);
  }, []);

  /** Tarik data dari server, gabungkan dengan data lokal, lalu kirim balik. Aman dipanggil kapan saja. */
  const syncNow = useCallback(async () => {
    const target = cloud.isCloudConfigured
      ? syncTarget(cloud.accountStore.get())
      : undefined;
    // ponytail: satu sinkron pada satu waktu; perubahan di tengah jalan ikut terkirim pada sinkron berikutnya.
    if (!target || syncing.current) return;
    syncing.current = true;
    setSyncStatus("syncing");
    try {
      const repo = getRepository();
      const remote = await cloud.pullChild(target);
      const local = await repo.exportState();
      const merged = remote ? mergeStates(local, remote, PLANT_ORDER) : local;
      // Kelas ditentukan orang tua: akun anak selalu memakai kelas dari server.
      const acc = cloud.accountStore.get();
      if (acc?.role === "anak" && remote?.student && merged.student)
        merged.student = { ...merged.student, grade: remote.student.grade };
      await cloud.pushChild(target, merged);
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
    // Tema "auto" mengikuti perubahan mode gelap perangkat.
    const scheme =
      typeof matchMedia === "function"
        ? matchMedia("(prefers-color-scheme: dark)")
        : null;
    const onScheme = () => applySettings(getSettings());
    scheme?.addEventListener("change", onScheme);
    if (!cloud.isCloudConfigured)
      return () => scheme?.removeEventListener("change", onScheme);
    // Sinkron saat aplikasi dibuka lagi dan tiap menit selama terlihat, agar pesan orang tua cepat sampai.
    const whenVisible = () =>
      document.visibilityState === "visible" && void syncNow();
    document.addEventListener("visibilitychange", whenVisible);
    const timer = setInterval(whenVisible, 60_000);
    return () => {
      scheme?.removeEventListener("change", onScheme);
      document.removeEventListener("visibilitychange", whenVisible);
      clearInterval(timer);
    };
  }, [load, syncNow]);

  /** Ganti seluruh data lokal dengan data dari server lalu simpan akun. */
  const applyRemote = async (acc: Account, state: SyncState | null) => {
    const repo = getRepository();
    await repo.reset();
    if (state) await repo.importState(state);
    cloud.accountStore.set(acc);
    await load();
    setSyncStatus("ok");
  };

  const createStudent: AppState["createStudent"] = async (s) => {
    const repo = getRepository();
    const st: Student = { ...s, createdAt: toDateKey() };
    const g = createGarden(PLANT_ORDER);
    await repo.saveStudent(st);
    await repo.saveGarden(g);
    setStudent(st);
    setGarden(g);
  };

  /** Akun anak tidak boleh mengganti kelas (juga dikunci di database). Orang tua, Mode Demo, dan profil lokal boleh. */
  const setGrade: AppState["setGrade"] = async (grade) => {
    if (!student || account?.role === "anak") return;
    const st = { ...student, grade };
    await getRepository().saveStudent(st);
    setStudent(st);
    if (account?.role === "ortu") {
      const acc = {
        ...account,
        children: account.children?.map((c) =>
          c.id === account.activeChildId ? { ...c, grade } : c,
        ),
      };
      cloud.accountStore.set(acc);
      setAccount(acc);
    }
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

  /** Mode Demo: ganti data di perangkat ini dengan anak contoh beserta riwayat belajar seminggu (tanpa akun). */
  const loadDemo = async () => {
    cloud.accountStore.clear();
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

  /** Hapus data di perangkat ini (Mode Demo / profil lokal). Data akun di server tidak terhapus. */
  const reset = async () => {
    cloud.accountStore.clear();
    await getRepository().reset();
    await load();
  };

  const registerChild: AppState["registerChild"] = async ({
    nickname,
    password,
    avatar,
    grade,
  }) => {
    const username = normalizeUsername(nickname);
    const { userId, hasProfile } = await cloud.signUpOrResume(
      username,
      password,
    );
    if (hasProfile) {
      await cloud.signOut();
      throw new Error("sudah dipakai");
    }
    const state: SyncState = {
      student: {
        nickname: nickname.trim(),
        avatar,
        grade,
        createdAt: toDateKey(),
      },
      studentAt: Date.now(),
      garden: createGarden(PLANT_ORDER),
      sessions: [],
      encouragements: [],
      challenge: null,
    };
    const familyCode = await cloud.registerChild(username, state);
    await applyRemote({ role: "anak", username, userId, familyCode }, state);
  };

  /** Ambil daftar anak orang tua, lalu tampilkan anak pilihan (atau anak pertama). */
  const openParent = async (
    username: string,
    userId: string,
    preferChild?: string,
  ) => {
    const kids = await cloud.listMyChildren();
    const active = kids.find((c) => c.id === preferChild)?.id ?? kids[0]?.id;
    const acc: Account = {
      role: "ortu",
      username,
      userId,
      children: kids,
      activeChildId: active,
    };
    await applyRemote(acc, active ? await cloud.pullChild(active) : null);
  };

  const registerParent: AppState["registerParent"] = async ({
    nickname,
    password,
    code,
  }) => {
    const username = normalizeUsername(nickname);
    const { userId, hasProfile } = await cloud.signUpOrResume(
      username,
      password,
    );
    if (hasProfile) {
      await cloud.signOut();
      throw new Error("sudah dipakai");
    }
    const childId = await cloud.registerParent(username, code);
    await openParent(username, userId, childId);
  };

  const login: AppState["login"] = async (role, nickname, password) => {
    const username = normalizeUsername(nickname);
    const userId = await cloud.signIn(username, password);
    const profile = await cloud.getMyProfile();
    if (!profile || profile.role !== role) {
      await cloud.signOut();
      throw new Error(
        profile?.role === "ortu"
          ? "akun orang tua"
          : profile
            ? "akun anak"
            : "Invalid login credentials",
      );
    }
    if (role === "anak") {
      const familyCode = await cloud.getFamilyCode(userId);
      await applyRemote(
        { role, username, userId, familyCode },
        await cloud.pullChild(userId),
      );
    } else {
      await openParent(username, userId);
    }
  };

  const logout = async () => {
    await cloud.signOut().catch(() => undefined);
    cloud.accountStore.clear();
    await getRepository().reset();
    setSyncStatus("off");
    await load();
  };

  const switchChild: AppState["switchChild"] = async (childId) => {
    if (account?.role !== "ortu") return;
    await applyRemote(
      { ...account, activeChildId: childId },
      await cloud.pullChild(childId),
    );
  };

  const updateSettings: AppState["updateSettings"] = (patch) => {
    const next = { ...getSettings(), ...patch };
    saveSettings(next);
    setSettings(next);
  };

  /** Avatar boleh diganti anak sendiri; ikut tersinkron ke orang tua. */
  const setAvatar: AppState["setAvatar"] = async (avatar) => {
    if (!student) return;
    const st = { ...student, avatar };
    await getRepository().saveStudent(st);
    setStudent(st);
    void syncNow();
  };

  const changePassword: AppState["changePassword"] = async (
    oldPassword,
    newPassword,
  ) => {
    if (!account) return;
    await cloud.changePassword(account.username, oldPassword, newPassword);
  };

  const unlinkChild: AppState["unlinkChild"] = async (childId) => {
    if (account?.role !== "ortu") return;
    await cloud.unlinkChild(childId);
    await openParent(
      account.username,
      account.userId,
      account.activeChildId === childId ? undefined : account.activeChildId,
    );
  };

  const addChild: AppState["addChild"] = async (code) => {
    if (account?.role !== "ortu") return;
    const childId = await cloud.linkChild(code);
    await openParent(account.username, account.userId, childId);
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
        challenge,
        createStudent,
        setGrade,
        completeSession,
        markEncouragementsRead,
        sendEncouragement,
        loadDemo,
        setChallenge,
        reset,
        cloudAvailable: cloud.isCloudConfigured,
        account,
        syncStatus,
        registerChild,
        registerParent,
        login,
        logout,
        switchChild,
        addChild,
        syncNow,
        settings,
        updateSettings,
        setAvatar,
        changePassword,
        unlinkChild,
      }}
    >
      <MotionConfig reducedMotion={settings.reduceMotion ? "always" : "user"}>
        {children}
      </MotionConfig>
    </AppContext.Provider>
  );
}
