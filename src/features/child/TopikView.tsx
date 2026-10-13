"use client";

import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import { Page } from "@/components/Page";
import { ButtonLink } from "@/components/ui";
import { getQuestions, SUBJECTS, topicsOf } from "@/data/questions";
import { topicProgress } from "@/lib/insights";
import type { Subject } from "@/lib/types";
import { QuizSession } from "./QuizSession";
import { SUBJECT_BG } from "./KebunView";

const STATE = {
  dikuasai: {
    label: "Sudah dikuasai",
    icon: "⭐",
    cls: "bg-daun-100 text-daun-800",
  },
  berkembang: {
    label: "Sedang berkembang",
    icon: "🌱",
    cls: "bg-kunyit-100 text-tanah-700",
  },
  "perlu-latihan": {
    label: "Perlu latihan",
    icon: "💧",
    cls: "bg-tanah-100 text-tanah-700",
  },
  belum: {
    label: "Belum dicoba",
    icon: "🔒",
    cls: "bg-krem-tua text-tinta-redup",
  },
} as const;

/** Latihan per topik: pilih satu topik, lalu kerjakan soal topik itu saja. */
export function TopikView({ subject }: { subject: Subject }) {
  const { student, sessions } = useApp();
  const [topic, setTopic] = useState<string | null>(null);
  if (!student) return null;
  const meta = SUBJECTS.find((s) => s.id === subject)!;

  if (topic) {
    return (
      <>
        <button
          type="button"
          onClick={() => setTopic(null)}
          className="text-sogan mt-2 min-h-10 cursor-pointer font-bold underline"
        >
          ← Pilih topik lain
        </button>
        <QuizSession key={topic} subject={subject} topic={topic} />
      </>
    );
  }

  const bank = getQuestions(student.grade, subject);
  const topics = topicProgress(
    sessions,
    subject,
    student.grade,
    topicsOf(student.grade, subject),
  );
  return (
    <Page
      title={`${meta.emoji} Pilih Topik ${meta.name}`}
      subtitle={`Kelas ${student.grade}. Latih satu topik sampai kamu mahir. Topik bertanda 💧 paling perlu dilatih.`}
      aside={
        <ButtonLink
          href="/belajar/"
          variant="ghost"
          className="min-h-12 text-lg"
        >
          Kembali
        </ButtonLink>
      }
    >
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {topics.map((t) => {
          const st = STATE[t.mastery];
          const count = bank.filter((q) => q.topic === t.topic).length;
          return (
            <li key={t.topic}>
              <button
                type="button"
                onClick={() => setTopic(t.topic)}
                className="batik-line rounded-blob border-krem-tua hover:border-daun-300 flex h-full w-full cursor-pointer flex-col items-start gap-2 border-3 bg-white p-5 text-left transition hover:-translate-y-1"
              >
                <span
                  className={`grid size-12 place-items-center rounded-2xl text-2xl ${SUBJECT_BG[subject]}`}
                  aria-hidden="true"
                >
                  {st.icon}
                </span>
                <span className="font-display text-xl font-semibold">
                  {t.topic}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-sm font-extrabold ${st.cls}`}
                >
                  {st.label}
                </span>
                <span className="text-tinta-redup text-sm font-bold">
                  {count} soal
                  {t.answered ? `, sudah dijawab ${t.answered} kali` : ""}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Page>
  );
}
