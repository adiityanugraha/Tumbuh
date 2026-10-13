import type {
  Encouragement,
  Garden,
  ParentChallenge,
  Session,
  Student,
  SyncState,
} from "@/lib/types";

/**
 * Antarmuka penyimpanan. Komponen hanya memakai ini, tidak menyentuh localStorage langsung,
 * sehingga implementasi bisa diganti backend (misalnya Firebase) tanpa mengubah komponen.
 * Async agar implementasi jaringan cocok tanpa mengubah pemanggil.
 */
export interface Repository {
  getStudent(): Promise<Student | null>;
  saveStudent(student: Student): Promise<void>;
  getGarden(): Promise<Garden | null>;
  saveGarden(garden: Garden): Promise<void>;
  getSessions(): Promise<Session[]>;
  addSession(session: Session): Promise<void>;
  getEncouragements(): Promise<Encouragement[]>;
  addEncouragement(encouragement: Encouragement): Promise<void>;
  markEncouragementsRead(): Promise<void>;
  getChallenge(): Promise<ParentChallenge | null>;
  saveChallenge(challenge: ParentChallenge | null): Promise<void>;
  /** Seluruh data sekaligus, untuk sinkronisasi antarperangkat. */
  exportState(): Promise<SyncState>;
  importState(state: SyncState): Promise<void>;
  reset(): Promise<void>;
}

type StoredState = { version: 1 } & SyncState;

const KEY = "tumbuh:v1";
const empty = (): StoredState => ({
  version: 1,
  student: null,
  garden: null,
  sessions: [],
  encouragements: [],
  challenge: null,
});

/** Implementasi localStorage. Seluruh data disimpan sebagai satu objek JSON. */
export function createLocalRepository(storage: Storage): Repository {
  const read = (): StoredState => {
    try {
      const raw = storage.getItem(KEY);
      return raw ? { ...empty(), ...JSON.parse(raw) } : empty();
    } catch {
      // Data rusak atau storage diblokir: mulai dari kosong daripada aplikasi crash.
      return empty();
    }
  };
  const update = (fn: (s: StoredState) => void) => {
    const state = read();
    fn(state);
    try {
      storage.setItem(KEY, JSON.stringify(state));
    } catch {
      // ponytail: storage penuh/diblokir (mode privat) diabaikan, progres hanya hilang saat reload.
    }
  };

  return {
    getStudent: async () => read().student,
    saveStudent: async (student) =>
      update((s) => void ((s.student = student), (s.studentAt = Date.now()))),
    getGarden: async () => read().garden,
    saveGarden: async (garden) => update((s) => void (s.garden = garden)),
    getSessions: async () => read().sessions,
    addSession: async (session) => update((s) => void s.sessions.push(session)),
    getEncouragements: async () => read().encouragements,
    addEncouragement: async (e) => update((s) => void s.encouragements.push(e)),
    markEncouragementsRead: async () =>
      update((s) => s.encouragements.forEach((e) => (e.read = true))),
    getChallenge: async () => read().challenge,
    saveChallenge: async (challenge) =>
      update(
        (s) => void ((s.challenge = challenge), (s.challengeAt = Date.now())),
      ),
    exportState: async () => {
      const { version, ...state } = read();
      void version;
      return state;
    },
    importState: async (state) => update((s) => void Object.assign(s, state)),
    reset: async () => storage.removeItem(KEY),
  };
}

let instance: Repository | null = null;

/** Hanya dipanggil di client (effect/event), karena localStorage tidak ada saat prerender. */
export function getRepository(): Repository {
  instance ??= createLocalRepository(window.localStorage);
  return instance;
}
