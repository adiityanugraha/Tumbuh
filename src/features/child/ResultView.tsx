"use client";

import { motion } from "motion/react";
import { useEffect } from "react";
import { useApp } from "@/components/AppProvider";
import { PlantVisual } from "@/components/PlantVisual";
import { Button, ButtonLink, Card, Tag } from "@/components/ui";
import { getPlant, REGIONS, stageLabel } from "@/data/plants";
import { badgeStatus } from "@/lib/badges";
import { challengeStatus } from "@/lib/challenge";
import {
  currentStreak,
  getGrowthStage,
  growthPoints,
  type SessionOutcome,
} from "@/lib/garden";
import { playCelebrate } from "@/lib/sound";
import type { AnswerResult, Garden } from "@/lib/types";
import { BADGE_IKON, Ikon } from "@/components/Ikon";

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
  const { student, today, sessions, challenge } = useApp();
  const firstTry = results.filter((r) => r.correctFirstTry).length;
  const bloomed = outcome.bloomedPlantId
    ? getPlant(outcome.bloomedPlantId)
    : null;
  const nextPlant = outcome.nextPlantId ? getPlant(outcome.nextPlantId) : null;
  const newRegion =
    bloomed && nextPlant && nextPlant.region !== bloomed.region
      ? REGIONS.find((r) => r.id === nextPlant.region)
      : null;

  const stageBefore = getGrowthStage(growthPoints(before));
  const stageAfter = getGrowthStage(growthPoints(outcome.garden));
  const shownPlant = bloomed ?? getPlant(outcome.garden.activePlantId)!;
  const shownStage = bloomed ? "berbunga" : stageAfter;

  // sessions sudah berisi sesi ini, jadi kondisi sebelumnya = tanpa sesi terakhir.
  const hadBefore = new Set(
    badgeStatus({
      garden: before,
      sessions: sessions.slice(0, -1),
      regions: REGIONS,
    })
      .filter((b) => b.earned)
      .map((b) => b.id),
  );
  const newBadges = badgeStatus({
    garden: outcome.garden,
    sessions,
    regions: REGIONS,
  }).filter((b) => b.earned && !hadBefore.has(b.id));
  const challengeDone =
    challenge &&
    challengeStatus(challenge, sessions, today).completed &&
    !challengeStatus(challenge, sessions.slice(0, -1), today).completed;
  const celebrate =
    Boolean(bloomed) ||
    stageAfter !== stageBefore ||
    newBadges.length > 0 ||
    Boolean(challengeDone);

  useEffect(() => {
    if (celebrate) playCelebrate();
  }, [celebrate]);

  const title = bloomed
    ? `Hore! ${bloomed.name} sudah ${stageLabel(bloomed, "berbunga").toLowerCase()}!`
    : stageAfter !== stageBefore
      ? `Tanamanmu naik ke tahap ${stageLabel(shownPlant, stageAfter)}!`
      : "Sesi selesai, kerja bagus!";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", bounce: 0.35 }}
    >
      <Card
        batik
        className="mx-auto mt-6 grid max-w-5xl items-center gap-8 p-6 md:grid-cols-2 md:p-9"
      >
        <div className="relative mx-auto grid size-64 place-items-center md:size-80">
          <div className="animate-spin-slow border-kunyit-400 bg-kunyit-100 bg-kawung absolute inset-0 rounded-full border-5 bg-size-[36px_36px]" />
          <motion.div
            initial={{ scale: 0.4, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
            className="relative"
          >
            <PlantVisual
              plant={shownPlant}
              stage={shownStage}
              potWidth={110}
              maxHeight={230}
            />
          </motion.div>
        </div>
        <div>
          <Tag>Sesi selesai</Tag>
          <h1 className="font-display text-daun-800 mt-2 text-3xl leading-tight font-semibold md:text-4xl">
            {title}
          </h1>
          <p className="text-tinta-redup mt-2 font-bold">
            {firstTry} dari {results.length} soal benar di percobaan pertama.{" "}
            {firstTry >= 4
              ? `Hebat, ${student?.nickname}!`
              : "Terus berlatih, ya!"}
          </p>
          <div className="my-5 flex flex-wrap gap-3">
            {[
              ["💧", `+${outcome.reward.water}`, "Air"],
              ["🌱", `+${outcome.reward.fertilizer}`, "Pupuk"],
              [
                "🔥",
                `${currentStreak(outcome.garden, today)}`,
                "Hari beruntun",
              ],
            ].map(([icon, value, label]) => (
              <div
                key={label}
                className="border-krem-tua bg-krem font-display rounded-[20px] border-2 px-4 py-3 text-2xl font-semibold"
              >
                {icon} {value}
                <span className="text-tinta-redup block font-sans text-sm">
                  {label}
                </span>
              </div>
            ))}
          </div>
          {nextPlant && (
            <div className="border-kunyit-400 bg-kunyit-100 mb-5 flex items-start gap-3 rounded-[20px] border-2 border-dashed p-4 font-bold">
              <span className="text-3xl" aria-hidden="true">
                🗺️
              </span>
              <p>
                {newRegion
                  ? `Wilayah baru terbuka: ${newRegion.name}! `
                  : "Tanaman baru terbuka! "}
                <b>{nextPlant.name}</b> dari {nextPlant.origin} siap ditanam.
              </p>
            </div>
          )}
          {challengeDone && (
            <div className="border-daun-300 bg-daun-100 text-daun-800 mb-5 flex items-center gap-3 rounded-[20px] border-2 p-4 font-bold">
              <span className="text-3xl" aria-hidden="true">
                🎁
              </span>
              <p>
                Tantangan dari {challenge.from} selesai! Tagih hadiahmu:{" "}
                <b>{challenge.reward}</b>
              </p>
            </div>
          )}
          {newBadges.length > 0 && (
            <div className="border-kunyit-400 bg-kunyit-100 mb-5 flex items-center gap-3 rounded-[20px] border-2 p-4 font-bold">
              <span className="text-3xl" aria-hidden="true">
                {newBadges.map((b) => (
                  <Ikon key={b.id} name={BADGE_IKON[b.id]} />
                ))}
              </span>
              <p>
                Lencana baru: <b>{newBadges.map((b) => b.name).join(", ")}</b>!
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
