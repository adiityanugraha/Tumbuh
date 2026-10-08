"use client";

import Link from "next/link";
import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import { Icon, Mascot } from "@/components/art";
import { Page } from "@/components/Page";
import { PlantThumb } from "@/components/PlantVisual";
import { RoleSwitch } from "@/components/RoleSwitch";
import { Button, ButtonLink, Card, DemoTag, Tag } from "@/components/ui";
import { getPlant, PLANT_ORDER, stageLabel } from "@/data/plants";
import { SUBJECTS } from "@/data/questions";
import { addDays, keyToDate } from "@/lib/date";
import { currentStreak, getGrowthStage, growthPoints, isWilted, STAGE_THRESHOLDS } from "@/lib/garden";
import { masteryBySubject, weeklySummary, type Mastery } from "@/lib/insights";
import type { Encouragement } from "@/lib/types";

export function ParentView() {
  const { ready, student } = useApp();
  const [unlocked, setUnlocked] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 md:px-6">
          <Link href="/kebun/" className="flex items-center gap-2 font-display text-3xl font-bold text-daun-800">
            <span className="text-daun-600">
              <Icon name="kebun" size={34} />
            </span>
            Tumbuh
          </Link>
          <Tag className="text-sm!">Untuk Orang Tua</Tag>
          <RoleSwitch active="orang-tua" className="ml-auto flex" />
        </div>
        <div className="h-1 bg-parang" />
      </header>
      <main id="isi" className="mx-auto max-w-7xl px-4 pt-4 pb-12 md:px-6">
        {!ready ? null : !student ? (
          <NoStudent />
        ) : unlocked ? (
          <Report />
        ) : (
          <ParentGate onPass={() => setUnlocked(true)} />
        )}
      </main>
    </>
  );
}

function NoStudent() {
  const { loadDemo } = useApp();
  return (
    <Card className="mx-auto mt-10 max-w-lg text-center">
      <Mascot size={110} className="mx-auto" />
      <h1 className="mt-2 font-display text-3xl font-semibold">Belum ada profil anak</h1>
      <p className="mt-2 font-bold text-tinta-redup">Minta anak membuat profil dulu, atau lihat contoh laporan dengan Mode Demo.</p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/">Buat profil anak</ButtonLink>
        <Button variant="ghost" onClick={loadDemo}>
          Buka Mode Demo
        </Button>
      </div>
    </Card>
  );
}

const newGate = () => ({ a: 12 + Math.floor(Math.random() * 18), b: 3 + Math.floor(Math.random() * 7) });

/** Gerbang sederhana agar anak tidak iseng masuk: soal perkalian yang mudah bagi orang dewasa. */
function ParentGate({ onPass }: { onPass: () => void }) {
  const [q, setQ] = useState(newGate);
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(value) === q.a * q.b) return onPass();
    setWrong(true);
    setValue("");
    setQ(newGate());
  };

  return (
    <Card batik className="mx-auto mt-10 max-w-md">
      <form onSubmit={submit} className="flex flex-col gap-3 pb-2">
        <h1 className="font-display text-3xl font-semibold">Khusus orang tua</h1>
        <p className="font-bold text-tinta-redup">Jawab soal ini untuk melihat laporan belajar anak.</p>
        <label className="flex flex-col gap-2">
          <span className="font-display text-3xl font-semibold text-daun-800">
            {q.a} × {q.b} = ?
          </span>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))}
            inputMode="numeric"
            autoComplete="off"
            aria-label={`Hasil ${q.a} kali ${q.b}`}
            className="min-h-15 rounded-[20px] border-3 border-krem-tua px-4 text-2xl font-extrabold outline-none focus:border-langit-500"
          />
        </label>
        <p role="status" className="min-h-6 text-sm font-bold text-tanah-700">
          {wrong && "Belum tepat. Coba soal yang baru ini."}
        </p>
        <Button type="submit" disabled={!value}>
          Masuk
        </Button>
      </form>
    </Card>
  );
}

const MASTERY: { id: Mastery; label: string; className: string }[] = [
  { id: "dikuasai", label: "Sudah dikuasai", className: "bg-daun-100 text-daun-800" },
  { id: "berkembang", label: "Sedang berkembang", className: "bg-kunyit-100 text-tanah-700" },
  { id: "perlu-latihan", label: "Perlu latihan", className: "bg-tanah-100 text-tanah-700" },
];

function Report() {
  const { student, garden, sessions, today } = useApp();
  if (!student || !garden) return null;

  const week = weeklySummary(sessions, today);
  const pct = week.questions ? Math.round((week.firstTry / week.questions) * 100) : 0;
  const mastery = masteryBySubject(sessions);
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
  const perDay = (d: string) => sessions.filter((s) => s.date === d).length;
  const maxPerDay = Math.max(1, ...days.map(perDay));

  const name = student.nickname;
  const summary = !week.sessions
    ? `${name} belum belajar minggu ini. Ajak belajar 5 menit saja, misalnya setelah makan malam.`
    : `${name} belajar ${week.activeDays} hari minggu ini dan menjawab ${week.questions} soal. ${
        pct >= 80
          ? "Hasilnya sangat baik, berikan pujian ya!"
          : pct >= 60
            ? "Sudah bagus, terus dampingi ya."
            : "Masih butuh pendampingan, coba belajar bersama."
      }`;

  return (
    <Page title={`Laporan Belajar ${name}`} subtitle={`Kelas ${student.grade} · 7 hari terakhir`} aside={student.demo && <DemoTag />}>
      <div className="grid items-start gap-5 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-5">
          <Card batik>
            <h2 className="font-display text-xl font-semibold">Minggu ini</h2>
            <p className="mt-1 text-lg font-bold">{summary}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["Hari belajar", `${week.activeDays} / 7`],
                ["Sesi", week.sessions],
                ["Soal dijawab", week.questions],
                ["Benar sekali coba", `${pct}%`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[20px] bg-krem px-4 py-3">
                  <dt className="text-sm font-extrabold text-tinta-redup">{label}</dt>
                  <dd className="font-display text-3xl font-semibold text-daun-800">{value}</dd>
                </div>
              ))}
            </dl>
            <ol className="mt-5 grid h-36 grid-cols-7 items-end gap-2 pb-2" aria-label="Jumlah sesi per hari">
              {days.map((d) => {
                const n = perDay(d);
                return (
                  <li key={d} className="flex h-full flex-col items-center justify-end gap-1 text-xs font-extrabold text-tinta-redup">
                    <span>{n || ""}</span>
                    <span
                      className={`w-full max-w-12 rounded-t-xl ${n ? "bg-daun-500" : "bg-krem-tua"}`}
                      style={{ height: `${n ? (n / maxPerDay) * 70 : 6}%` }}
                      aria-label={`${n} sesi`}
                    />
                    <span className={d === today ? "text-tinta" : ""}>{keyToDate(d).toLocaleDateString("id-ID", { weekday: "short" })}</span>
                  </li>
                );
              })}
            </ol>
          </Card>

          <Card>
            <h2 className="font-display text-xl font-semibold">Materi per mapel</h2>
            <p className="mt-1 text-sm font-bold text-tinta-redup">
              Dihitung dari semua latihan. Sudah dikuasai: minimal 3 soal dan 80% benar di percobaan pertama.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {SUBJECTS.map((s) => {
                const m = mastery[s.id];
                const empty = MASTERY.every((g) => !m[g.id].length);
                return (
                  <section key={s.id} className="rounded-[22px] border-3 border-krem-tua p-4">
                    <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
                      <span aria-hidden="true">{s.emoji}</span>
                      {s.name}
                      <span className="ml-auto text-sm font-extrabold text-tinta-redup">{week.bySubject[s.id]} sesi</span>
                    </h3>
                    {empty ? (
                      <p className="mt-2 text-sm font-bold text-tinta-redup">Belum ada latihan.</p>
                    ) : (
                      MASTERY.filter((g) => m[g.id].length).map((g) => (
                        <div key={g.id} className="mt-3">
                          <p className="text-xs font-extrabold text-sogan">{g.label}</p>
                          <ul className="mt-1 flex flex-wrap gap-1.5">
                            {m[g.id].map((t) => (
                              <li key={t} className={`rounded-full px-2.5 py-0.5 text-sm font-bold ${g.className}`}>
                                {t}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))
                    )}
                  </section>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="grid gap-5">
          <GardenCard />
          <SendEncouragement />
        </div>
      </div>
    </Page>
  );
}

function GardenCard() {
  const { student, garden, today } = useApp();
  if (!student || !garden) return null;
  const plant = getPlant(garden.activePlantId)!;
  const allDone = garden.collection.includes(plant.id);
  const stage = getGrowthStage(allDone ? STAGE_THRESHOLDS.berbunga : growthPoints(garden));
  return (
    <Card>
      <h2 className="font-display text-xl font-semibold">Kebun {student.nickname}</h2>
      <div className="mt-3 flex items-center gap-4">
        <div className="grid size-24 flex-none place-items-center rounded-[22px] bg-langit-100">
          <PlantThumb plant={plant} size={84} />
        </div>
        <div className="font-bold">
          <p className="font-display text-lg">{plant.name}</p>
          <p className="text-tinta-redup">Tahap: {stageLabel(plant, stage)}</p>
          <p className="text-tinta-redup">
            Koleksi {garden.collection.length} / {PLANT_ORDER.length} tanaman
          </p>
          <p className="text-tinta-redup">🔥 {currentStreak(garden, today)} hari berturut-turut</p>
        </div>
      </div>
      {isWilted(garden, today) && (
        <p className="mt-3 rounded-2xl bg-tanah-100 px-3 py-2 text-sm font-bold text-tanah-700">
          Tanamannya layu karena 3 hari tidak belajar. Satu sesi singkat langsung memulihkannya.
        </p>
      )}
    </Card>
  );
}

const SENDERS = ["Ibu", "Ayah", "Kakak", "Nenek", "Kakek"];
const STICKERS = ["🌟", "💪", "❤️", "🎉", "🌻", "👍"];
const PRESETS = ["Semangat belajar ya, Nak!", "Hebat, kebunmu makin subur!", "Kami bangga padamu.", "Yuk, siram tanamanmu hari ini!"];

function SendEncouragement() {
  const { encouragements, sendEncouragement } = useApp();
  const [from, setFrom] = useState(SENDERS[0]);
  const [sticker, setSticker] = useState(STICKERS[0]);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const history = [...encouragements].reverse();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    await sendEncouragement({ from, sticker, message: message.trim() });
    setMessage("");
    setSent(true);
  };

  const chip = (on: boolean) =>
    `min-h-11 cursor-pointer rounded-full border-3 px-3.5 font-bold transition ${on ? "border-daun-800 bg-daun-600 text-white" : "border-krem-tua bg-white hover:border-daun-300"}`;

  return (
    <Card batik>
      <form onSubmit={submit} className="flex flex-col gap-3 pb-2">
        <h2 className="font-display text-xl font-semibold">Kirim Semangat</h2>
        <p className="-mt-2 text-sm font-bold text-tinta-redup">Pesan muncul di halaman Kebunku anak.</p>

        <fieldset>
          <legend className="mb-1.5 text-sm font-extrabold text-sogan">Dari</legend>
          <div className="flex flex-wrap gap-1.5">
            {SENDERS.map((s) => (
              <button key={s} type="button" aria-pressed={from === s} onClick={() => setFrom(s)} className={chip(from === s)}>
                {s}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-1.5 text-sm font-extrabold text-sogan">Stiker</legend>
          <div className="grid grid-cols-6 gap-1.5">
            {STICKERS.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={sticker === s}
                aria-label={`Stiker ${s}`}
                onClick={() => setSticker(s)}
                className={`aspect-square min-h-11 cursor-pointer rounded-2xl border-3 text-2xl transition ${sticker === s ? "border-kunyit-400 bg-kunyit-100" : "border-krem-tua bg-white"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-extrabold text-sogan">Pesan</span>
          <textarea
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setSent(false);
            }}
            maxLength={80}
            rows={2}
            placeholder="Tulis pesan singkat"
            className="rounded-[18px] border-3 border-krem-tua px-3.5 py-2.5 font-bold outline-none focus:border-langit-500"
          />
        </label>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setMessage(p);
                setSent(false);
              }}
              className="min-h-10 cursor-pointer rounded-full bg-krem px-3 text-sm font-bold hover:bg-krem-tua"
            >
              {p}
            </button>
          ))}
        </div>
        <Button type="submit" variant="kunyit" disabled={!message.trim()}>
          Kirim Semangat
        </Button>
        <p role="status" className="min-h-6 text-center text-sm font-bold text-daun-800">
          {sent && "Terkirim! Pesan akan muncul saat anak membuka Kebunku."}
        </p>
      </form>

      {history.length > 0 && (
        <div className="mt-2 border-t-3 border-krem-tua pt-3">
          <h3 className="text-sm font-extrabold text-sogan">Pesan terkirim</h3>
          <ul className="mt-2 grid gap-2">
            {history.slice(0, 5).map((e) => (
              <SentItem key={e.id} e={e} />
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

function SentItem({ e }: { e: Encouragement }) {
  return (
    <li className="flex items-start gap-2.5 rounded-2xl bg-krem px-3 py-2 text-sm font-bold">
      <span className="text-2xl" aria-hidden="true">
        {e.sticker}
      </span>
      <div className="flex-1">
        <p>&ldquo;{e.message}&rdquo;</p>
        <p className="text-xs text-tinta-redup">
          {e.from ?? "Orang tua"} · {keyToDate(e.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} ·{" "}
          {e.read ? "Sudah dibaca ✓" : "Belum dibaca"}
        </p>
      </div>
    </li>
  );
}
