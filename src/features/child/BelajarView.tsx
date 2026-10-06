"use client";

import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { Page } from "@/components/Page";
import { SUBJECTS } from "@/data/questions";
import { SUBJECT_BG } from "./KebunView";

const DESC = {
  matematika: "Berhitung, bentuk, dan ukuran",
  ipas: "Alam, tubuh, dan lingkungan sekitar",
  inggris: "Kosakata dan kalimat, dengan suara",
} as const;

export function BelajarView() {
  const { student, sessions, today } = useApp();
  if (!student) return null;
  const doneToday = new Set(sessions.filter((s) => s.date === today).map((s) => s.subject));
  return (
    <Page title="Mau belajar apa hari ini?" subtitle={`Setiap sesi berisi 5 soal kelas ${student.grade}. Jawaban benar menyiram tanamanmu.`}>
      <div className="grid gap-5 md:grid-cols-3">
        {SUBJECTS.map((s) => (
          <Link
            key={s.id}
            href={`/belajar/${s.id}/`}
            className="batik-line group flex flex-col items-center gap-3 rounded-blob border-3 border-krem-tua bg-white p-8 text-center transition hover:-translate-y-1.5 hover:border-daun-300"
          >
            <span className={`grid size-24 place-items-center rounded-[28px] text-5xl transition group-hover:rotate-6 ${SUBJECT_BG[s.id]}`}>{s.emoji}</span>
            <span className="font-display text-2xl font-semibold">{s.name}</span>
            <span className="font-bold text-tinta-redup">{DESC[s.id]}</span>
            {doneToday.has(s.id) && <span className="rounded-full bg-daun-100 px-3 py-1 text-sm font-extrabold text-daun-800">✓ Sudah hari ini</span>}
          </Link>
        ))}
      </div>
    </Page>
  );
}
