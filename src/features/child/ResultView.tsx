"use client";

import { motion } from "motion/react";
import { useEffect } from "react";
import { useApp } from "@/components/AppProvider";
import { PlantArt } from "@/components/art";
import { Button, ButtonLink, Card, Tag } from "@/components/ui";
import { getPlant, REGIONS } from "@/data/plants";
import { currentStreak, getGrowthStage, growthPoints, type SessionOutcome } from "@/lib/garden";
import { playCelebrate } from "@/lib/sound";
import type { AnswerResult, Garden } from "@/lib/types";

const STAGE_LABEL = { bibit: "Bibit", tunas: "Tunas", tumbuh: "Tumbuh", berbunga: "Berbunga" } as const;

export function ResultView({
  outcome,
  before,
  results,
  onAgain,
}: {
  outcome: SessionOutcome;
  before: Garden;
  results: AnswerResult[];
  onAgain: () => void;
}) {
  const { student, today } = useApp();
  const firstTry = results.filter((r) => r.correctFirstTry).length;
  const bloomed = outcome.bloomedPlantId ? getPlant(outcome.bloomedPlantId) : null;
  const nextPlant = outcome.nextPlantId ? getPlant(outcome.nextPlantId) : null;
  const newRegion = bloomed && nextPlant && nextPlant.region !== bloomed.region ? REGIONS.find((r) => r.id === nextPlant.region) : null;

  const stageBefore = getGrowthStage(growthPoints(before));
  const stageAfter = getGrowthStage(growthPoints(outcome.garden));
  const shownPlant = bloomed ?? getPlant(outcome.garden.activePlantId)!;
  const shownStage = bloomed ? "berbunga" : stageAfter;

  useEffect(() => {
    if (bloomed || stageAfter !== stageBefore) playCelebrate();
  }, [bloomed, stageAfter, stageBefore]);

  const title = bloomed
    ? `Hore! ${bloomed.name} berbunga!`
    : stageAfter !== stageBefore
      ? `Tanamanmu naik ke tahap ${STAGE_LABEL[stageAfter]}!`
      : "Sesi selesai, kerja bagus!";

  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", bounce: 0.35 }}>
      <Card batik className="mx-auto mt-6 grid max-w-5xl items-center gap-8 p-6 md:grid-cols-2 md:p-9">
        <div className="relative mx-auto grid size-64 place-items-center md:size-80">
          <div className="absolute inset-0 animate-spin-slow rounded-full border-5 border-kunyit-400 bg-kunyit-100 bg-kawung bg-size-[36px_36px]" />
          <motion.div initial={{ scale: 0.4, y: 30 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", bounce: 0.5, delay: 0.2 }} className="relative">
            <PlantArt stage={shownStage} color={shownPlant.color} size={170} />
          </motion.div>
        </div>
        <div>
          <Tag>Sesi selesai</Tag>
          <h1 className="mt-2 font-display text-3xl leading-tight font-semibold text-daun-800 md:text-4xl">{title}</h1>
          <p className="mt-2 font-bold text-tinta-redup">
            {firstTry} dari {results.length} soal benar di percobaan pertama. {firstTry >= 4 ? `Hebat, ${student?.nickname}!` : "Terus berlatih, ya!"}
          </p>
          <div className="my-5 flex flex-wrap gap-3">
            {[
              ["💧", `+${outcome.reward.water}`, "Air"],
              ["🌱", `+${outcome.reward.fertilizer}`, "Pupuk"],
              ["🔥", `${currentStreak(outcome.garden, today)}`, "Hari beruntun"],
            ].map(([icon, value, label]) => (
              <div key={label} className="rounded-[20px] border-2 border-krem-tua bg-krem px-4 py-3 font-display text-2xl font-semibold">
                {icon} {value}
                <span className="block font-sans text-sm text-tinta-redup">{label}</span>
              </div>
            ))}
          </div>
          {nextPlant && (
            <div className="mb-5 flex items-start gap-3 rounded-[20px] border-2 border-dashed border-kunyit-400 bg-kunyit-100 p-4 font-bold">
              <span className="text-3xl" aria-hidden="true">
                🗺️
              </span>
              <p>
                {newRegion ? `Wilayah baru terbuka: ${newRegion.name}! ` : "Tanaman baru terbuka! "}
                <b>{nextPlant.name}</b> dari {nextPlant.origin} siap ditanam.
              </p>
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            {bloomed ? (
              <ButtonLink href="/koleksi/" variant="kunyit">
                Lihat Koleksi
              </ButtonLink>
            ) : (
              <Button variant="kunyit" onClick={onAgain}>
                Belajar lagi
              </Button>
            )}
            <ButtonLink href="/kebun/">Kembali ke Kebun</ButtonLink>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
