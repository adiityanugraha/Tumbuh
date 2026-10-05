import type { ClassChallenge, Encouragement, Garden, Session, Student } from "@/lib/types";

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
  getChallenges(): Promise<ClassChallenge[]>;
  addChallenge(challenge: ClassChallenge): Promise<void>;
  getEncouragements(): Promise<Encouragement[]>;
  addEncouragement(encouragement: Encouragement): Promise<void>;
  markEncouragementsRead(): Promise<void>;
  reset(): Promise<void>;
}

interface StoredState {
  version: 1;
  student: Student | null;
  garden: Garden | null;
  sessions: Session[];
  challenges: ClassChallenge[];
  encouragements: Encouragement[];
}

const KEY = "tumbuh:v1";
const empty = (): StoredState => ({
  version: 1,
  student: null,
  garden: null,
  sessions: [],
  challenges: [],
  encouragements: [],
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
    saveStudent: async (student) => update((s) => void (s.student = student)),
    getGarden: async () => read().garden,
    saveGarden: async (garden) => update((s) => void (s.garden = garden)),
    getSessions: async () => read().sessions,
    addSession: async (session) => update((s) => void s.sessions.push(session)),
    getChallenges: async () => read().challenges,
    addChallenge: async (challenge) => update((s) => void s.challenges.push(challenge)),
    getEncouragements: async () => read().encouragements,
    addEncouragement: async (e) => update((s) => void s.encouragements.push(e)),
    markEncouragementsRead: async () =>
      update((s) => s.encouragements.forEach((e) => (e.read = true))),
    reset: async () => storage.removeItem(KEY),
  };
}

let instance: Repository | null = null;

/** Hanya dipanggil di client (effect/event), karena localStorage tidak ada saat prerender. */
export function getRepository(): Repository {
  instance ??= createLocalRepository(window.localStorage);
  return instance;
}
