"use client";

import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { PlantThumb } from "@/components/PlantVisual";
import { SpeakButton } from "@/components/SpeakButton";
import { Page } from "@/components/Page";
import { ButtonLink, Card, DemoTag, Tag } from "@/components/ui";
import { getPlant, PLANTS, REGIONS } from "@/data/plants";
import { reviewCounts, SUBJECTS } from "@/data/questions";
import { addDays, daysBetween, keyToDate } from "@/lib/date";
import {
  getGrowthStage,
  getRegionStatus,
  growthPoints,
  isWilted,
  STAGE_THRESHOLDS,
} from "@/lib/garden";
import { mistakeIds } from "@/lib/session";
import { BadgeCard } from "./BadgeCard";
import { ChallengeCard } from "./ChallengeCard";
import { GardenScene } from "./GardenScene";
import { Avatar, Sticker, SubjectIkon } from "@/components/Ikon";

export const SUBJECT_BG = {
  matematika: "bg-kunyit-100",
  indonesia: "bg-tanah-100",
  ipas: "bg-daun-100",
  inggris: "bg-langit-100",
} as const;

export function KebunView() {
  const {
    student,
    garden,
    sessions,
    today,
    encouragements,
    markEncouragementsRead,
  } = useApp();
  if (!student || !garden) return null;

  const plant = getPlant(garden.activePlantId)!;
  const allDone = garden.collection.includes(garden.activePlantId);
  const points = allDone ? STAGE_THRESHOLDS.berbunga : growthPoints(garden);
  const stage = getGrowthStage(points);
  const wilted = isWilted(garden, today);
  const studiedToday = sessions.some((s) => s.date === today);

  const week = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
  const studyDays = new Set(sessions.map((s) => s.date));

  const latest = [...encouragements].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  )[0];
  const region =
    REGIONS.find((r) => getRegionStatus(r, garden) === "aktif") ??
    REGIONS.at(-1)!;

  const status = wilted
    ? "Tanamanmu layu karena lama tidak disiram. Satu sesi belajar langsung memulihkannya!"
    : studiedToday
      ? "Hebat, kamu sudah menyiram tanaman hari ini!"
      : "Tanamanmu menunggu disiram hari ini!";

  return (
    <Page
      title="Kebunku"
      subtitle={`${keyToDate(today).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}. ${status}`}
    >
      <div className="grid items-start gap-5 md:grid-cols-2 xl:grid-cols-[290px_1fr_330px]">
        {/* Kebun di tengah (paling atas di layar kecil) */}
        <GardenScene
          plant={plant}
          stage={stage}
          points={points}
          wilted={wilted}
          allDone={allDone}
        />

        {/* Kolom kiri */}
        <div className="grid gap-5 xl:col-start-1 xl:row-start-1">
          <Card>
            <div className="flex items-center gap-3.5">
              <span className="border-kunyit-400 bg-kunyit-100 grid size-16 flex-none place-items-center rounded-full border-3 text-4xl">
                <Avatar emoji={student.avatar} />
              </span>
              <div>
                <p className="font-display text-2xl font-semibold">
                  Hai, {student.nickname}!
                </p>
                <Tag>Kelas {student.grade}</Tag> {student.demo && <DemoTag />}
              </div>
            </div>
            <ol
              className="text-tinta-redup mt-4 grid grid-cols-7 gap-1.5 text-center text-xs font-extrabold"
              aria-label="Belajar 7 hari terakhir"
            >
              {week.map((d) => {
                const done = studyDays.has(d);
                return (
                  <li key={d}>
                    {keyToDate(d).toLocaleDateString("id-ID", {
                      weekday: "short",
                    })}
                    <span
                      className={`mt-1 grid h-8.5 place-items-center rounded-xl ${done ? "bg-daun-500 text-white" : "bg-krem-tua"} ${d === today ? "outline-kunyit-400 outline-3" : ""}`}
                      role="img"
                      aria-label={done ? "sudah belajar" : "belum belajar"}
                    >
                      {done ? "✓" : ""}
                    </span>
                  </li>
                );
              })}
            </ol>
          </Card>

          <div className="border-kunyit-400 bg-kunyit-100 flex items-start gap-3 rounded-[20px] border-2 border-dashed p-4 font-bold">
            <span className="text-3xl" aria-hidden="true">
              {latest ? <Sticker emoji={latest.sticker} /> : "🐞"}
            </span>
            <div className="flex-1">
              {latest ? (
                <>
                  Pesan dari {latest.from ?? "orang tua"}
                  {!latest.read && (
                    <Tag className="bg-kunyit-400! text-tinta-tetap! ml-2">
                      Baru
                    </Tag>
                  )}
                  <p className="font-semibold">
                    &ldquo;{latest.message}&rdquo;
                  </p>
                  {!latest.read && (
                    <button
                      type="button"
                      onClick={markEncouragementsRead}
                      className="text-sogan mt-1 min-h-10 cursor-pointer text-sm underline"
                    >
                      Terima kasih!
                    </button>
                  )}
                </>
              ) : (
                <>
                  Kumbi berkata
                  <p className="font-semibold">
                    &ldquo;Belajar sebentar saja setiap hari, kebunmu pasti
                    tumbuh!&rdquo;
                  </p>
                </>
              )}
            </div>
          </div>

          <ChallengeCard />
          <BadgeCard />
          <FactCard />
        </div>

        {/* Kolom kanan */}
        <div className="grid gap-5 xl:col-start-3 xl:row-start-1">
          <Card batik>
            <h2 className="font-display mb-2.5 text-xl font-semibold">
              Ayo Belajar!
            </h2>
            <div className="grid gap-2.5">
              {SUBJECTS.map((s) => (
                <Link
                  key={s.id}
                  href={`/belajar/${s.id}/`}
                  className="border-krem-tua hover:border-daun-300 bg-kartu flex min-h-18 items-center gap-3.5 rounded-[22px] border-3 px-4 py-2.5 transition hover:translate-x-1"
                >
                  <span
                    className={`grid size-12 flex-none place-items-center rounded-2xl text-2xl ${SUBJECT_BG[s.id]}`}
                  >
                    <SubjectIkon subject={s.id} />
                  </span>
                  <span>
                    <span className="font-display block text-lg font-semibold">
                      {s.name}
                    </span>
                    <span className="text-tinta-redup text-sm font-bold">
                      5 soal kelas {student.grade}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </Card>
          <TodayCard />
          <Card>
            <h2 className="font-display text-xl font-semibold">
              Jelajah Nusantara
            </h2>
            <p className="text-tinta-redup mt-1 text-sm font-bold">
              Sedang di <b className="text-daun-800">{region.name}</b>,{" "}
              {garden.collection.length} dari 12 tanaman terkumpul
            </p>
            <div className="mt-2 flex gap-1.5" aria-hidden="true">
              {REGIONS.map((r) => {
                const st = getRegionStatus(r, garden);
                return (
                  <i
                    key={r.id}
                    className={`h-3 flex-1 rounded-full ${st === "selesai" ? "bg-kunyit-400" : st === "aktif" ? "bg-daun-500" : "bg-krem-tua"}`}
                  />
                );
              })}
            </div>
            <ButtonLink
              href="/peta/"
              variant="ghost"
              className="mt-3.5 min-h-12 w-full text-lg"
            >
              Buka Peta
            </ButtonLink>
          </Card>
        </div>
      </div>
    </Page>
  );
}

/** Ringkasan belajar hari ini dan pengingat Siram Ulang. */
function TodayCard() {
  const { student, sessions, today } = useApp();
  if (!student) return null;
  const solved = (list: typeof sessions) =>
    list.reduce((n, s) => n + s.results.filter((r) => r.solved).length, 0);
  const todays = sessions.filter((s) => s.date === today);
  const toReview = reviewCounts(student.grade, mistakeIds(sessions)).reduce(
    (n, s) => n + s.count,
    0,
  );
  return (
    <Card>
      <h2 className="font-display text-xl font-semibold">Hari ini</h2>
      <dl className="mt-2.5 grid grid-cols-3 gap-2 text-center">
        {[
          ["Sesi", todays.length],
          ["Benar", solved(todays)],
          ["Total benar", solved(sessions)],
        ].map(([label, value]) => (
          <div key={label} className="bg-krem rounded-2xl px-2 py-2">
            <dd className="font-display text-daun-800 text-2xl font-semibold">
              {value}
            </dd>
            <dt className="text-tinta-redup text-xs font-extrabold">{label}</dt>
          </div>
        ))}
      </dl>
      {toReview > 0 ? (
        <Link
          href="/belajar/#siram-ulang"
          className="border-langit-300 bg-langit-100 text-langit-700 hover:border-langit-500 mt-3 flex min-h-12 items-center gap-2 rounded-2xl border-2 border-dashed px-3 py-2 text-sm font-extrabold"
        >
          🔁 {toReview} soal menunggu disiram ulang
          <span className="ml-auto underline">Ulangi</span>
        </Link>
      ) : (
        <p className="text-tinta-redup mt-3 text-sm font-bold">
          Tidak ada soal yang perlu diulang. Hebat!
        </p>
      )}
    </Card>
  );
}

/** Satu fakta tanaman Nusantara yang berganti setiap hari. */
function FactCard() {
  const { today } = useApp();
  const plant =
    PLANTS[
      ((daysBetween("2026-01-01", today) % PLANTS.length) + PLANTS.length) %
        PLANTS.length
    ];
  const region = REGIONS.find((r) => r.id === plant.region)!;
  return (
    <Card batik>
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-xl font-semibold">Tahukah kamu?</h2>
        <SpeakButton
          parts={[{ text: `${plant.name}. ${plant.fact}`, lang: "id-ID" }]}
          label="Bacakan fakta"
        />
      </div>
      <div className="mt-2 flex items-center gap-3">
        <span className="bg-langit-100 grid size-16 flex-none place-items-center rounded-2xl">
          <PlantThumb plant={plant} size={56} />
        </span>
        <p className="font-bold">
          <span className="font-display block text-lg">{plant.name}</span>
          <span className="text-tinta-redup text-sm">{region.name}</span>
        </p>
      </div>
      <p className="mt-2 pb-1 font-semibold">{plant.fact}</p>
    </Card>
  );
}
