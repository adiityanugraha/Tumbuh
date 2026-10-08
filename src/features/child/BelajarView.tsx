"use client";

import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { Page } from "@/components/Page";
import { getQuestions, SUBJECTS } from "@/data/questions";
import { mistakeIds } from "@/lib/session";
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
  const wrong = mistakeIds(sessions);
  const toReview = SUBJECTS.map((s) => ({ ...s, count: getQuestions(student.grade, s.id).filter((q) => wrong.has(q.id)).length })).filter(
    (s) => s.count > 0,
  );
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

      {toReview.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-2xl font-semibold">🔁 Siram Ulang</h2>
          <p className="mt-1 font-bold text-tinta-redup">Soal yang pernah salah. Jawab benar sekali coba agar soal hilang dari daftar ini.</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {toReview.map((s) => (
              <Link
                key={s.id}
                href={`/belajar/${s.id}/ulang/`}
                className="flex min-h-16 items-center gap-3 rounded-[22px] border-3 border-krem-tua bg-white px-4 py-2 font-extrabold transition hover:-translate-y-0.5 hover:border-daun-300"
              >
                <span className={`grid size-11 place-items-center rounded-2xl text-2xl ${SUBJECT_BG[s.id]}`}>{s.emoji}</span>
                <span>
                  {s.name}
                  <span className="block text-sm text-tinta-redup">{s.count} soal untuk diulang</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="font-display text-2xl font-semibold">Belajar sambil bermain</h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          {[
            { href: "/kartu-kata/", emoji: "🃏", name: "Kartu Kata", desc: "Kosakata Bahasa Inggris bergambar, bisa didengarkan.", bg: "bg-langit-100" },
            { href: "/memori/", emoji: "🧩", name: "Memori Nusantara", desc: "Pasangkan gambar tanaman Nusantara dengan namanya.", bg: "bg-daun-100" },
          ].map((g) => (
            <Link
              key={g.href}
              href={g.href}
              className="flex items-center gap-4 rounded-blob border-3 border-krem-tua bg-white p-5 transition hover:-translate-y-1 hover:border-daun-300"
            >
              <span className={`grid size-16 flex-none place-items-center rounded-[22px] text-4xl ${g.bg}`}>{g.emoji}</span>
              <span>
                <span className="block font-display text-xl font-semibold">{g.name}</span>
                <span className="font-bold text-tinta-redup">{g.desc}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </Page>
  );
}
