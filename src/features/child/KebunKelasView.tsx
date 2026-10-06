"use client";

import { motion } from "motion/react";
import { useApp } from "@/components/AppProvider";
import { MegaMendung } from "@/components/art";
import { Page } from "@/components/Page";
import { Bar, Card, DemoTag } from "@/components/ui";
import { DEMO_CHALLENGE, DEMO_CLASSROOM } from "@/data/classroom";
import { challengeProgress, classGarden, CLASS_TREE_THRESHOLDS } from "@/lib/insights";
import type { GrowthStage } from "@/lib/types";

const TREE_LABEL: Record<GrowthStage, string> = { bibit: "Pohon kecil", tunas: "Pohon muda", tumbuh: "Pohon rindang", berbunga: "Pohon berbunga" };
const TREE_SCALE: Record<GrowthStage, number> = { bibit: 0.55, tunas: 0.7, tumbuh: 0.85, berbunga: 1 };

/** PLACEHOLDER: pohon kelas sederhana, tajuk bertambah sesuai tahap. */
function ClassTree({ stage }: { stage: GrowthStage }) {
  return (
    <motion.svg
      viewBox="0 0 200 200"
      width={340}
      height={340}
      initial={{ scale: 0.6 }}
      animate={{ scale: TREE_SCALE[stage] }}
      style={{ transformOrigin: "50% 100%" }}
      role="img"
      aria-label={TREE_LABEL[stage]}
    >
      <path d="M92 200V120h16v80z" fill="#7f3b21" />
      <circle cx="100" cy="90" r="58" fill="#3f9a5f" />
      <circle cx="62" cy="108" r="34" fill="#2e7d4f" />
      <circle cx="138" cy="108" r="34" fill="#2e7d4f" />
      {(stage === "tumbuh" || stage === "berbunga") && <circle cx="100" cy="52" r="34" fill="#8fd19e" />}
      {stage === "berbunga" &&
        [
          [70, 80],
          [120, 64],
          [140, 104],
          [92, 112],
          [58, 112],
        ].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="8" fill="#f4b63f" stroke="#b85c38" strokeWidth="2" />)}
    </motion.svg>
  );
}

export function KebunKelasView() {
  const { sessions, today, challenges, student } = useApp();
  const cls = classGarden(DEMO_CLASSROOM, sessions, today);
  const list = challenges.length ? challenges : [DEMO_CHALLENGE];
  const nextStage = (Object.entries(CLASS_TREE_THRESHOLDS) as [GrowthStage, number][]).find(([, v]) => v > cls.points);
  const learnedToday = DEMO_CLASSROOM.classmates.filter((c) => c.lastStudyDaysAgo === 0);

  return (
    <Page title={`Kebun ${DEMO_CLASSROOM.name}`} subtitle="Setiap sesi belajarmu ikut menumbuhkan pohon bersama teman sekelas." aside={<DemoTag />}>
      <div className="grid items-start gap-5 lg:grid-cols-[1fr_380px]">
        <div className="relative flex min-h-[460px] flex-col items-center justify-end overflow-hidden rounded-[32px] border-3 border-krem-tua bg-linear-to-b from-langit-300/60 via-langit-100 via-60% to-daun-100 to-60%">
          <MegaMendung className="absolute inset-x-0 top-0 h-24 w-full" />
          <div className="absolute inset-x-0 bottom-0 h-2/5 bg-kawung opacity-40" />
          <div className="relative">
            <ClassTree stage={cls.stage} />
          </div>
          <div className="relative w-full bg-white/85 px-6 pt-4 pb-5">
            <div className="flex flex-wrap justify-between gap-2 font-extrabold text-tinta-redup">
              <span className="font-display text-xl text-tinta">{TREE_LABEL[cls.stage]}</span>
              <span>{nextStage ? `${cls.points} / ${nextStage[1]} poin ke tahap berikutnya` : `${cls.points} poin, pohon sudah berbunga!`}</span>
            </div>
            <div className="mt-2">
              <Bar value={nextStage ? (cls.points / nextStage[1]) * 100 : 100} label="Progres pohon kelas" />
            </div>
          </div>
        </div>

        <div className="grid gap-5">
          {list.map((ch) => (
            <Card batik key={ch.id}>
              <h2 className="font-display text-xl font-semibold">Tantangan dari Guru</h2>
              <p className="mt-1 font-bold">{ch.title}</p>
              <div className="mt-3">
                <Bar value={challengeProgress(ch, cls.sessionsThisWeek)} motif={false} label="Progres tantangan" />
              </div>
              <p className="mt-2 text-sm font-extrabold text-tinta-redup">
                {cls.sessionsThisWeek} / {ch.targetSessions} sesi · Hadiah: {ch.reward}
              </p>
            </Card>
          ))}
          <Card>
            <h2 className="font-display text-xl font-semibold">Sudah belajar hari ini</h2>
            <p className="mt-1 text-sm font-bold text-tinta-redup">{cls.activeToday} anak menyiram kebun kelas hari ini.</p>
            <ul className="mt-3 flex flex-wrap gap-2" aria-label="Teman yang sudah belajar hari ini">
              {sessions.some((s) => s.date === today) && student && (
                <li className="flex items-center gap-1.5 rounded-full border-2 border-kunyit-400 bg-kunyit-100 py-1 pr-3 pl-1 font-extrabold">
                  <span className="text-xl">{student.avatar}</span>Kamu
                </li>
              )}
              {learnedToday.map((c) => (
                <li key={c.nickname} className="flex items-center gap-1.5 rounded-full bg-krem py-1 pr-3 pl-1 font-bold">
                  <span className="text-xl">{c.avatar}</span>
                  {c.nickname}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs font-bold text-tinta-redup">Di Kebun Kelas tidak ada peringkat. Semua sesi dihitung bersama.</p>
          </Card>
        </div>
      </div>
    </Page>
  );
}
