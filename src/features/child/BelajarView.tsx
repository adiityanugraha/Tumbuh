"use client";

import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { Page } from "@/components/Page";
import { Bar, ButtonLink } from "@/components/ui";
import { reviewCounts, SUBJECTS, topicsOf } from "@/data/questions";
import { topicProgress } from "@/lib/insights";
import { mistakeIds } from "@/lib/session";
import { DailyCard } from "./DailyCard";
import { SUBJECT_BG } from "./KebunView";

const DESC = {
  matematika: "Berhitung, bentuk, dan ukuran",
  indonesia: "Membaca, kosakata, ejaan, dan kalimat",
  ipas: "Alam, tubuh, dan lingkungan sekitar",
  inggris: "Kosakata dan kalimat, dengan suara",
} as const;

export function BelajarView() {
  const { student, sessions, today } = useApp();
  if (!student) return null;
  const doneToday = new Set(
    sessions.filter((s) => s.date === today && !s.daily).map((s) => s.subject),
  );
  const toReview = reviewCounts(student.grade, mistakeIds(sessions)).filter(
    (s) => s.count > 0,
  );
  return (
    <Page
      title="Mau belajar apa hari ini?"
      subtitle={`Setiap sesi berisi 5 soal kelas ${student.grade}. Jawaban benar menyiram tanamanmu.`}
    >
      <DailyCard />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {SUBJECTS.map((s) => {
          const topics = topicProgress(
            sessions,
            s.id,
            student.grade,
            topicsOf(student.grade, s.id),
          );
          const mastered = topics.filter(
            (t) => t.mastery === "dikuasai",
          ).length;
          const count = sessions.filter(
            (x) => x.subject === s.id && !x.daily,
          ).length;
          return (
            <div
              key={s.id}
              className="batik-line rounded-blob border-krem-tua flex flex-col items-center gap-2.5 border-3 bg-white p-6 text-center"
            >
              <span
                className={`grid size-20 place-items-center rounded-[26px] text-4xl ${SUBJECT_BG[s.id]}`}
                aria-hidden="true"
              >
                {s.emoji}
              </span>
              <h2 className="font-display text-2xl font-semibold">{s.name}</h2>
              <p className="text-tinta-redup text-sm font-bold">{DESC[s.id]}</p>
              <p
                className="text-lg tracking-wider"
                aria-label={`${mastered} dari ${topics.length} topik dikuasai`}
              >
                {topics
                  .map((t) => (t.mastery === "dikuasai" ? "⭐" : "☆"))
                  .join("")}
              </p>
              <div className="w-full">
                <Bar
                  value={(mastered / Math.max(1, topics.length)) * 100}
                  motif={false}
                  label={`Topik ${s.name} yang dikuasai`}
                />
                <p className="text-tinta-redup mt-1.5 text-xs font-extrabold">
                  {mastered}/{topics.length} topik dikuasai · {count} sesi
                </p>
              </div>
              {doneToday.has(s.id) && (
                <span className="bg-daun-100 text-daun-800 rounded-full px-3 py-1 text-sm font-extrabold">
                  ✓ Sudah hari ini
                </span>
              )}
              <ButtonLink
                href={`/belajar/${s.id}/`}
                className="mt-auto w-full text-lg"
              >
                Mulai 5 soal
              </ButtonLink>
              <Link
                href={`/belajar/${s.id}/topik/`}
                className="text-daun-800 min-h-10 content-center font-bold underline"
              >
                Pilih topik
              </Link>
            </div>
          );
        })}
      </div>

      {toReview.length > 0 && (
        <section id="siram-ulang" className="mt-8 scroll-mt-28">
          <h2 className="font-display text-2xl font-semibold">
            🔁 Siram Ulang
          </h2>
          <p className="text-tinta-redup mt-1 font-bold">
            Soal yang pernah salah. Jawab benar sekali coba agar soal hilang
            dari daftar ini.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            {toReview.map((s) => (
              <Link
                key={s.id}
                href={`/belajar/${s.id}/ulang/`}
                className="border-krem-tua hover:border-daun-300 flex min-h-16 items-center gap-3 rounded-[22px] border-3 bg-white px-4 py-2 font-extrabold transition hover:-translate-y-0.5"
              >
                <span
                  className={`grid size-11 place-items-center rounded-2xl text-2xl ${SUBJECT_BG[s.id]}`}
                >
                  {s.emoji}
                </span>
                <span>
                  {s.name}
                  <span className="text-tinta-redup block text-sm">
                    {s.count} soal untuk diulang
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="font-display text-2xl font-semibold">
          Belajar sambil bermain
        </h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          {[
            {
              href: "/kartu-kata/",
              emoji: "🃏",
              name: "Kartu Kata",
              desc: "Kosakata Bahasa Inggris bergambar, bisa didengarkan.",
              bg: "bg-langit-100",
            },
            {
              href: "/memori/",
              emoji: "🧩",
              name: "Memori Nusantara",
              desc: "Pasangkan gambar tanaman Nusantara dengan namanya.",
              bg: "bg-daun-100",
            },
          ].map((g) => (
            <Link
              key={g.href}
              href={g.href}
              className="rounded-blob border-krem-tua hover:border-daun-300 flex items-center gap-4 border-3 bg-white p-5 transition hover:-translate-y-1"
            >
              <span
                className={`grid size-16 flex-none place-items-center rounded-[22px] text-4xl ${g.bg}`}
              >
                {g.emoji}
              </span>
              <span>
                <span className="font-display block text-xl font-semibold">
                  {g.name}
                </span>
                <span className="text-tinta-redup font-bold">{g.desc}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </Page>
  );
}
