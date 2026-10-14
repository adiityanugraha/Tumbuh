import { addDays } from "@/lib/date";
import { applySession, createGarden } from "@/lib/garden";
import type {
  DateKey,
  Garden,
  ParentChallenge,
  Session,
  Student,
  Subject,
} from "@/lib/types";
import { PLANT_ORDER } from "./plants";
import { getQuestions } from "./questions";

// DUMMY: profil dan riwayat belajar contoh untuk Mode Demo, agar juri langsung melihat
// kebun yang sudah tumbuh, koleksi, peta terbuka, dan laporan orang tua yang terisi.
const GRADE = 3;

/** [hari ke belakang dari hari ini, mapel]. Hari ini sengaja kosong agar juri bisa mencoba sesi sendiri. */
const PLAN: [number, Subject][] = [
  [6, "matematika"],
  [6, "ipas"],
  [5, "inggris"],
  [4, "matematika"],
  [4, "inggris"],
  [2, "indonesia"],
  [1, "matematika"],
  [1, "ipas"],
];

/** Topik ke-2 tiap mapel dibuat sering salah, supaya laporan menampilkan "perlu latihan". */
function demoSession(
  i: number,
  daysAgo: number,
  subject: Subject,
  today: DateKey,
): Session {
  const bank = getQuestions(GRADE, subject);
  const weakTopic = [...new Set(bank.map((q) => q.topic))][1];
  const start = (i * 5) % bank.length;
  const picked = Array.from(
    { length: 5 },
    (_, j) => bank[(start + j) % bank.length],
  );
  return {
    id: `demo-${i}`,
    date: addDays(today, -daysAgo),
    subject,
    grade: GRADE,
    results: picked.map((q, j) => {
      const correctFirstTry =
        q.topic === weakTopic ? j % 3 === 0 : (i + j) % 6 !== 0;
      return {
        questionId: q.id,
        topic: q.topic,
        correctFirstTry,
        solved: true,
        attempts: correctFirstTry ? 1 : 2,
      };
    }),
  };
}

export function createDemoData(today: DateKey): {
  student: Student;
  garden: Garden;
  sessions: Session[];
  challenge: ParentChallenge;
} {
  const sessions = PLAN.map(([daysAgo, subject], i) =>
    demoSession(i, daysAgo, subject, today),
  );
  const garden = sessions.reduce(
    (g, s) => applySession(g, s, PLANT_ORDER).garden,
    createGarden(PLANT_ORDER),
  );
  return {
    student: {
      nickname: "Dewi",
      avatar: "🦋",
      grade: GRADE,
      gender: "perempuan",
      createdAt: addDays(today, -6),
      demo: true,
    },
    garden,
    sessions,
    // Sudah 5 dari 6 hari: satu sesi hari ini langsung menyelesaikan tantangan saat demo.
    challenge: {
      id: "demo-tantangan",
      from: "Ibu",
      kind: "hari",
      target: 6,
      reward: "Piknik ke taman kota",
      startDate: addDays(today, -6),
    },
  };
}
