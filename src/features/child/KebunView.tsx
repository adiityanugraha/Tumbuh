"use client";

import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { MegaMendung } from "@/components/art";
import { PlantVisual } from "@/components/PlantVisual";
import { Page } from "@/components/Page";
import { Bar, ButtonLink, Card, DemoTag, Tag } from "@/components/ui";
import { DEMO_CHALLENGE, DEMO_CLASSROOM } from "@/data/classroom";
import { getPlant, REGIONS, stageLabel } from "@/data/plants";
import { SUBJECTS } from "@/data/questions";
import { addDays, keyToDate } from "@/lib/date";
import { bloomProgress, getGrowthStage, getRegionStatus, growthPoints, isWilted, STAGE_THRESHOLDS } from "@/lib/garden";
import { challengeProgress, classGarden } from "@/lib/insights";

export const SUBJECT_BG = { matematika: "bg-kunyit-100", ipas: "bg-daun-100", inggris: "bg-langit-100" } as const;

export function KebunView() {
  const { student, garden, sessions, today, challenges, encouragements, markEncouragementsRead } = useApp();
  if (!student || !garden) return null;

  const plant = getPlant(garden.activePlantId)!;
  const allDone = garden.collection.includes(garden.activePlantId);
  const points = allDone ? STAGE_THRESHOLDS.berbunga : growthPoints(garden);
  const stage = getGrowthStage(points);
  const wilted = isWilted(garden, today);
  const studiedToday = sessions.some((s) => s.date === today);

  const week = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
  const studyDays = new Set(sessions.map((s) => s.date));

  const latest = [...encouragements].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  const cls = classGarden(DEMO_CLASSROOM, sessions, today);
  const challenge = challenges.at(-1) ?? DEMO_CHALLENGE;
  const region = REGIONS.find((r) => getRegionStatus(r, garden) === "aktif") ?? REGIONS.at(-1)!;

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
        <div className="relative flex min-h-[520px] flex-col items-center justify-end overflow-hidden rounded-[32px] border-3 border-krem-tua bg-linear-to-b from-langit-300/60 via-langit-100 via-55% to-daun-100 to-55% md:col-span-2 xl:col-span-1 xl:col-start-2 xl:row-start-1">
          <MegaMendung className="absolute inset-x-0 top-0 h-28 w-full" />
          <div className="absolute inset-x-0 bottom-0 h-[45%] bg-kawung opacity-40" />
          <Tag className="absolute top-4 right-4 z-10 bg-white! px-3! py-1! text-sm! text-daun-800!">
            {wilted ? "Layu" : `Tahap: ${stageLabel(plant, stage)}`}
          </Tag>
          <div className="relative z-10 -mb-2">
            <PlantVisual plant={plant} stage={stage} wilted={wilted} />
          </div>
          <div className="relative z-10 w-full bg-white/85 px-6 pt-4 pb-5">
            <div className="flex flex-wrap justify-between gap-2 font-extrabold text-tinta-redup">
              <span className="font-display text-xl text-tinta">{plant.name}</span>
              <span>{allDone ? "Semua tanaman sudah tumbuh penuh!" : `${points} / ${STAGE_THRESHOLDS.berbunga} poin menuju ${stageLabel(plant, "berbunga").toLowerCase()}`}</span>
            </div>
            <div className="mt-2">
              <Bar value={bloomProgress(points)} label={`Progres menuju ${stageLabel(plant, "berbunga").toLowerCase()}`} />
            </div>
            <div className="mt-2 flex justify-between font-extrabold text-tinta-redup">
              <span>💧 Air {garden.water}</span>
              <span>🌱 Pupuk {garden.fertilizer}</span>
            </div>
          </div>
        </div>

        {/* Kolom kiri */}
        <div className="grid gap-5 xl:col-start-1 xl:row-start-1">
          <Card>
            <div className="flex items-center gap-3.5">
              <span className="grid size-16 flex-none place-items-center rounded-full border-3 border-kunyit-400 bg-kunyit-100 text-4xl">
                {student.avatar}
              </span>
              <div>
                <p className="font-display text-2xl font-semibold">Hai, {student.nickname}!</p>
                <Tag>Kelas {student.grade}</Tag>
              </div>
            </div>
            <ol className="mt-4 grid grid-cols-7 gap-1.5 text-center text-xs font-extrabold text-tinta-redup" aria-label="Belajar 7 hari terakhir">
              {week.map((d) => {
                const done = studyDays.has(d);
                return (
                  <li key={d}>
                    {keyToDate(d).toLocaleDateString("id-ID", { weekday: "short" })}
                    <span
                      className={`mt-1 grid h-8.5 place-items-center rounded-xl ${done ? "bg-daun-500 text-white" : "bg-krem-tua"} ${d === today ? "outline-3 outline-kunyit-400" : ""}`}
                      aria-label={done ? "sudah belajar" : "belum belajar"}
                    >
                      {done ? "✓" : ""}
                    </span>
                  </li>
                );
              })}
            </ol>
          </Card>

          <div className="flex items-start gap-3 rounded-[20px] border-2 border-dashed border-kunyit-400 bg-kunyit-100 p-4 font-bold">
            <span className="text-3xl" aria-hidden="true">
              {latest?.sticker ?? "🐞"}
            </span>
            <div className="flex-1">
              {latest ? (
                <>
                  Pesan dari orang tua{!latest.read && <Tag className="ml-2 bg-kunyit-400! text-tinta!">Baru</Tag>}
                  <p className="font-semibold">&ldquo;{latest.message}&rdquo;</p>
                  {!latest.read && (
                    <button type="button" onClick={markEncouragementsRead} className="mt-1 min-h-10 cursor-pointer text-sm text-sogan underline">
                      Terima kasih!
                    </button>
                  )}
                </>
              ) : (
                <>
                  Kumbi berkata
                  <p className="font-semibold">&ldquo;Belajar sebentar saja setiap hari, kebunmu pasti tumbuh!&rdquo;</p>
                </>
              )}
            </div>
          </div>

          <Card batik>
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-xl font-semibold">Kebun Kelas</h2>
              <DemoTag />
            </div>
            <p className="mt-1 text-sm font-bold text-tinta-redup">{challenge.title}</p>
            <div className="mt-2.5">
              <Bar value={challengeProgress(challenge, cls.sessionsThisWeek)} motif={false} label="Progres tantangan kelas" />
            </div>
            <div className="mt-2 flex items-center justify-between text-sm font-extrabold text-tinta-redup">
              <span>
                {cls.sessionsThisWeek} / {challenge.targetSessions} sesi
              </span>
              <Link href="/kebun-kelas/" className="min-h-10 content-center text-daun-800 underline">
                Lihat
              </Link>
            </div>
          </Card>
        </div>

        {/* Kolom kanan */}
        <div className="grid gap-5 xl:col-start-3 xl:row-start-1">
          <Card batik>
            <h2 className="mb-2.5 font-display text-xl font-semibold">Ayo Belajar!</h2>
            <div className="grid gap-2.5">
              {SUBJECTS.map((s) => (
                <Link
                  key={s.id}
                  href={`/belajar/${s.id}/`}
                  className="flex min-h-18 items-center gap-3.5 rounded-[22px] border-3 border-krem-tua bg-white px-4 py-2.5 transition hover:translate-x-1 hover:border-daun-300"
                >
                  <span className={`grid size-12 flex-none place-items-center rounded-2xl text-2xl ${SUBJECT_BG[s.id]}`}>{s.emoji}</span>
                  <span>
                    <span className="block font-display text-lg font-semibold">{s.name}</span>
                    <span className="text-sm font-bold text-tinta-redup">5 soal kelas {student.grade}</span>
                  </span>
                </Link>
              ))}
            </div>
          </Card>
          <Card>
            <h2 className="font-display text-xl font-semibold">Jelajah Nusantara</h2>
            <p className="mt-1 text-sm font-bold text-tinta-redup">
              Sedang di <b className="text-daun-800">{region.name}</b>, {garden.collection.length} dari 12 tanaman terkumpul
            </p>
            <div className="mt-2 flex gap-1.5" aria-hidden="true">
              {REGIONS.map((r) => {
                const st = getRegionStatus(r, garden);
                return <i key={r.id} className={`h-3 flex-1 rounded-full ${st === "selesai" ? "bg-kunyit-400" : st === "aktif" ? "bg-daun-500" : "bg-krem-tua"}`} />;
              })}
            </div>
            <ButtonLink href="/peta/" variant="ghost" className="mt-3.5 min-h-12 w-full text-lg">
              Buka Peta
            </ButtonLink>
          </Card>
        </div>
      </div>
    </Page>
  );
}
