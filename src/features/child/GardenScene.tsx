"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useRef, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { Mascot, MegaMendung } from "@/components/art";
import { PlantVisual } from "@/components/PlantVisual";
import { Bar, Tag } from "@/components/ui";
import { stageLabel } from "@/data/plants";
import { timeOfDay, type TimeOfDay } from "@/lib/date";
import { bloomProgress, currentStreak, STAGE_THRESHOLDS } from "@/lib/garden";
import type { GrowthStage, PlantSpecies } from "@/lib/types";

const SKY: Record<TimeOfDay, string> = {
  pagi: "from-kunyit-100 to-langit-100",
  siang: "from-langit-300/60 to-langit-100",
  sore: "from-tanah-300/70 via-kunyit-100 to-langit-100",
  malam: "from-malam to-langit-700",
};
const STARS = [
  [12, 14],
  [26, 30],
  [44, 10],
  [58, 26],
  [70, 12],
  [84, 32],
  [36, 40],
];

/** Kebun utama di Kebunku: hanya tanaman yang sedang tumbuh, langit mengikuti jam, Kumbi bisa diajak bicara. */
export function GardenScene({
  plant,
  stage,
  points,
  wilted,
  allDone,
}: {
  plant: PlantSpecies;
  stage: GrowthStage;
  points: number;
  wilted: boolean;
  allDone: boolean;
}) {
  const { student, garden, sessions, today } = useApp();
  // Halaman anak hanya dirender di browser (lihat AppShell), jadi jam lokal aman dibaca di sini.
  const [tod] = useState(() => timeOfDay(new Date().getHours()));
  const [bubble, setBubble] = useState<string | null>(null);
  const greet = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  if (!student || !garden) return null;

  const say = (text: string) => {
    clearTimeout(timer.current);
    setBubble(text);
    timer.current = setTimeout(() => setBubble(null), 6000);
  };
  const studiedToday = sessions.some((s) => s.date === today);
  const streak = currentStreak(garden, today);
  const kumbiLines = [
    `Selamat ${tod}, ${student.nickname}!`,
    wilted
      ? "Tanamanmu haus. Yuk siram dengan satu sesi belajar!"
      : studiedToday
        ? "Kebunmu segar karena kamu rajin hari ini!"
        : "Tanamanmu menunggu disiram hari ini.",
    streak > 1
      ? `Wah, kamu sudah belajar ${streak} hari berturut-turut!`
      : "Belajar sedikit setiap hari membuat kebun cepat tumbuh.",
    "Ketuk tanaman untuk tahu fakta uniknya!",
  ];
  const tapKumbi = () => say(kumbiLines[greet.current++ % kumbiLines.length]);
  const tapPlant = () => say(`${plant.name}: ${plant.fact}`);

  const night = tod === "malam";
  return (
    <div
      className={`border-krem-tua relative flex min-h-[520px] flex-col items-center justify-end overflow-hidden rounded-[32px] border-3 bg-linear-to-b ${SKY[tod]} md:col-span-2 xl:col-span-1 xl:col-start-2 xl:row-start-1 xl:h-[calc(100svh-13rem)] xl:max-h-[720px]`}
    >
      <MegaMendung
        className={`absolute inset-x-0 top-0 h-28 w-full ${night ? "opacity-30" : ""}`}
      />
      {night ? (
        <Image
          src="/langit/bulan.webp"
          alt=""
          width={92}
          height={91}
          priority
          className="motion-safe:animate-bob absolute top-3 left-4 z-[1]"
        />
      ) : (
        <Image
          src="/langit/matahari.webp"
          alt=""
          width={88}
          height={89}
          priority
          className={`motion-safe:animate-spin-slow absolute left-4 z-[1] ${tod === "sore" ? "top-10 opacity-90" : "top-3"}`}
        />
      )}
      {night ? (
        STARS.map(([x, y], i) => (
          <span
            key={i}
            className="bg-kunyit-100 motion-safe:animate-twinkle absolute size-1.5 rounded-full"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              animationDelay: `${i * 0.4}s`,
            }}
            aria-hidden="true"
          />
        ))
      ) : (
        <>
          <span
            className="motion-safe:animate-flutter absolute top-[34%] left-[8%] text-2xl"
            aria-hidden="true"
          >
            🦋
          </span>
          <span
            className="motion-safe:animate-flutter absolute top-[22%] left-[40%] text-xl"
            style={{ animationDelay: "-6s", animationDuration: "18s" }}
            aria-hidden="true"
          >
            🦋
          </span>
        </>
      )}
      <Tag className="text-daun-800! absolute top-4 right-4 z-10 bg-kartu! px-3! py-1! text-sm!">
        {wilted ? "Layu" : `Tahap: ${stageLabel(plant, stage)}`}
      </Tag>

      <AnimatePresence>
        {bubble && (
          <motion.p
            key={bubble}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="status"
            className="border-kunyit-400 bg-kunyit-100 absolute inset-x-4 top-20 z-20 rounded-[20px] border-2 px-4 py-3 font-bold shadow-sm"
          >
            {bubble}
          </motion.p>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={tapKumbi}
        aria-label="Ajak Kumbi bicara"
        className="absolute top-[24%] left-4 z-20 cursor-pointer transition hover:scale-110 sm:top-[36%] sm:left-5"
      >
        <Mascot size={64} className="motion-safe:animate-bob" />
      </button>

      <div className="relative z-10 -mb-2 flex w-full items-end justify-center">
        <button
          type="button"
          onClick={tapPlant}
          aria-label={`${plant.name}, ketuk untuk fakta`}
          className="relative z-10 cursor-pointer"
        >
          <PlantVisual plant={plant} stage={stage} wilted={wilted} />
        </button>
      </div>

      <div className="relative z-10 w-full bg-kartu/85 px-6 pt-4 pb-5">
        <div className="text-tinta-redup flex flex-wrap justify-between gap-2 font-extrabold">
          <span className="font-display text-tinta text-xl">{plant.name}</span>
          <span>
            {allDone
              ? "Semua tanaman sudah tumbuh penuh!"
              : `${points} / ${STAGE_THRESHOLDS.berbunga} poin menuju ${stageLabel(plant, "berbunga").toLowerCase()}`}
          </span>
        </div>
        <div className="mt-2">
          <Bar
            value={bloomProgress(points)}
            label={`Progres menuju ${stageLabel(plant, "berbunga").toLowerCase()}`}
          />
        </div>
        <div className="text-tinta-redup mt-2 flex justify-between font-extrabold">
          <span>💧 Air {garden.water}</span>
          <span>🌱 Pupuk {garden.fertilizer}</span>
        </div>
      </div>
    </div>
  );
}
