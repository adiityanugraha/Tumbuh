"use client";

import Link from "next/link";
import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import { Icon, Mascot } from "@/components/art";
import { Page } from "@/components/Page";
import { PlantThumb } from "@/components/PlantVisual";
import { RoleSwitch } from "@/components/RoleSwitch";
import { FamilySyncCard, JoinFamilyForm } from "./FamilySync";
import { Button, ButtonLink, Card, DemoTag, Tag } from "@/components/ui";
import { getPlant, PLANT_ORDER, REGIONS, stageLabel } from "@/data/plants";
import { SUBJECTS } from "@/data/questions";
import { addDays, keyToDate } from "@/lib/date";
import { badgeStatus } from "@/lib/badges";
import { challengeLabel, challengeStatus } from "@/lib/challenge";
import {
  currentStreak,
  getGrowthStage,
  growthPoints,
  isWilted,
  STAGE_THRESHOLDS,
} from "@/lib/garden";
import { masteryBySubject, weeklySummary, type Mastery } from "@/lib/insights";
import type { Encouragement, ParentChallenge } from "@/lib/types";

export function ParentView() {
  const { ready, student } = useApp();
  const [unlocked, setUnlocked] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 md:px-6">
          <Link
            href="/kebun/"
            className="font-display text-daun-800 flex items-center gap-2 text-3xl font-bold"
          >
            <span className="text-daun-600">
              <Icon name="kebun" size={34} />
            </span>
            Tumbuh
          </Link>
          <Tag className="text-sm!">Untuk Orang Tua</Tag>
          <RoleSwitch active="orang-tua" className="ml-auto flex" />
        </div>
        <div className="bg-parang h-1" />
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
  const { loadDemo, cloudAvailable } = useApp();
  return (
    <Card className="mx-auto mt-10 max-w-lg text-center">
      <Mascot size={110} className="mx-auto" />
      <h1 className="font-display mt-2 text-3xl font-semibold">
        Belum ada profil anak
      </h1>
      <p className="text-tinta-redup mt-2 font-bold">
        Minta anak membuat profil dulu, atau lihat contoh laporan dengan Mode
        Demo.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/">Buat profil anak</ButtonLink>
        <Button variant="ghost" onClick={loadDemo}>
          Buka Mode Demo
        </Button>
      </div>
      {cloudAvailable && (
        <div className="border-krem-tua mt-6 border-t-3 pt-5 text-left">
          <JoinFamilyForm />
        </div>
      )}
    </Card>
  );
}

const newGate = () => ({
  a: 12 + Math.floor(Math.random() * 18),
  b: 3 + Math.floor(Math.random() * 7),
});

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
        <h1 className="font-display text-3xl font-semibold">
          Khusus orang tua
        </h1>
        <p className="text-tinta-redup font-bold">
          Jawab soal ini untuk melihat laporan belajar anak.
        </p>
        <label className="flex flex-col gap-2">
          <span className="font-display text-daun-800 text-3xl font-semibold">
            {q.a} × {q.b} = ?
          </span>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))}
            inputMode="numeric"
            autoComplete="off"
            aria-label={`Hasil ${q.a} kali ${q.b}`}
            className="border-krem-tua focus:border-langit-500 min-h-15 rounded-[20px] border-3 px-4 text-2xl font-extrabold outline-none"
          />
        </label>
        <p role="status" className="text-tanah-700 min-h-6 text-sm font-bold">
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
  {
    id: "dikuasai",
    label: "Sudah dikuasai",
    className: "bg-daun-100 text-daun-800",
  },
  {
    id: "berkembang",
    label: "Sedang berkembang",
    className: "bg-kunyit-100 text-tanah-700",
  },
  {
    id: "perlu-latihan",
    label: "Perlu latihan",
    className: "bg-tanah-100 text-tanah-700",
  },
];

function Report() {
  const { student, garden, sessions, today } = useApp();
  if (!student || !garden) return null;

  const week = weeklySummary(sessions, today);
  const pct = week.questions
    ? Math.round((week.firstTry / week.questions) * 100)
    : 0;
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
    <Page
      title={`Laporan Belajar ${name}`}
      subtitle={`Kelas ${student.grade} · 7 hari terakhir`}
      aside={student.demo && <DemoTag />}
    >
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
                <div key={label} className="bg-krem rounded-[20px] px-4 py-3">
                  <dt className="text-tinta-redup text-sm font-extrabold">
                    {label}
                  </dt>
                  <dd className="font-display text-daun-800 text-3xl font-semibold">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
            <ol
              className="mt-5 grid h-36 grid-cols-7 items-end gap-2 pb-2"
              aria-label="Jumlah sesi per hari"
            >
              {days.map((d) => {
                const n = perDay(d);
                return (
                  <li
                    key={d}
                    className="text-tinta-redup flex h-full flex-col items-center justify-end gap-1 text-xs font-extrabold"
                  >
                    <span>{n || ""}</span>
                    <span
                      className={`w-full max-w-12 rounded-t-xl ${n ? "bg-daun-500" : "bg-krem-tua"}`}
                      style={{ height: `${n ? (n / maxPerDay) * 70 : 6}%` }}
                      aria-label={`${n} sesi`}
                    />
                    <span className={d === today ? "text-tinta" : ""}>
                      {keyToDate(d).toLocaleDateString("id-ID", {
                        weekday: "short",
                      })}
                    </span>
                  </li>
                );
              })}
            </ol>
          </Card>

          <Card>
            <h2 className="font-display text-xl font-semibold">
              Materi per mapel
            </h2>
            <p className="text-tinta-redup mt-1 text-sm font-bold">
              Dihitung dari semua latihan. Sudah dikuasai: minimal 3 soal dan
              80% benar di percobaan pertama.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {SUBJECTS.map((s) => {
                const m = mastery[s.id];
                const empty = MASTERY.every((g) => !m[g.id].length);
                return (
                  <section
                    key={s.id}
                    className="border-krem-tua rounded-[22px] border-3 p-4"
                  >
                    <h3 className="font-display flex items-center gap-2 text-lg font-semibold">
                      <span aria-hidden="true">{s.emoji}</span>
                      {s.name}
                      <span className="text-tinta-redup ml-auto text-sm font-extrabold">
                        {week.bySubject[s.id]} sesi
                      </span>
                    </h3>
                    {empty ? (
                      <p className="text-tinta-redup mt-2 text-sm font-bold">
                        Belum ada latihan.
                      </p>
                    ) : (
                      MASTERY.filter((g) => m[g.id].length).map((g) => (
                        <div key={g.id} className="mt-3">
                          <p className="text-sogan text-xs font-extrabold">
                            {g.label}
                          </p>
                          <ul className="mt-1 flex flex-wrap gap-1.5">
                            {m[g.id].map((t) => (
                              <li
                                key={t}
                                className={`rounded-full px-2.5 py-0.5 text-sm font-bold ${g.className}`}
                              >
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

          <SendEncouragement />
        </div>

        <div className="grid gap-5">
          <GardenCard />
          <ChallengeEditor />
          <FamilySyncCard />
        </div>
      </div>
    </Page>
  );
}

function GardenCard() {
  const { student, garden, sessions, today } = useApp();
  if (!student || !garden) return null;
  const badges = badgeStatus({ garden, sessions, regions: REGIONS });
  const plant = getPlant(garden.activePlantId)!;
  const allDone = garden.collection.includes(plant.id);
  const stage = getGrowthStage(
    allDone ? STAGE_THRESHOLDS.berbunga : growthPoints(garden),
  );
  return (
    <Card>
      <h2 className="font-display text-xl font-semibold">
        Kebun {student.nickname}
      </h2>
      <div className="mt-3 flex items-center gap-4">
        <div className="bg-langit-100 grid size-24 flex-none place-items-center rounded-[22px]">
          <PlantThumb plant={plant} size={84} />
        </div>
        <div className="font-bold">
          <p className="font-display text-lg">{plant.name}</p>
          <p className="text-tinta-redup">Tahap: {stageLabel(plant, stage)}</p>
          <p className="text-tinta-redup">
            Koleksi {garden.collection.length} / {PLANT_ORDER.length} tanaman
          </p>
          <p className="text-tinta-redup">
            🔥 {currentStreak(garden, today)} hari berturut-turut
          </p>
          <p className="text-tinta-redup">
            🏅 Lencana {badges.filter((b) => b.earned).length} / {badges.length}
          </p>
        </div>
      </div>
      {isWilted(garden, today) && (
        <p className="bg-tanah-100 text-tanah-700 mt-3 rounded-2xl px-3 py-2 text-sm font-bold">
          Tanamannya layu karena 3 hari tidak belajar. Satu sesi singkat
          langsung memulihkannya.
        </p>
      )}
    </Card>
  );
}

const SENDERS = ["Ibu", "Ayah", "Kakak", "Nenek", "Kakek"];
const STICKERS = ["🌟", "💪", "❤️", "🎉", "🌻", "👍"];
const PRESETS = [
  "Semangat belajar ya, Nak!",
  "Hebat, kebunmu makin subur!",
  "Kami bangga padamu.",
  "Yuk, siram tanamanmu hari ini!",
];

const chip = (on: boolean) =>
  `min-h-11 cursor-pointer rounded-full border-3 px-3.5 font-bold transition ${on ? "border-daun-800 bg-daun-600 text-white" : "border-krem-tua bg-white hover:border-daun-300"}`;

const REWARDS = [
  "Piknik ke taman",
  "Masak bersama",
  "Main sepeda sore",
  "Buku cerita baru",
];
const LIMIT = { hari: 7, sesi: 20 };

/** Tantangan mingguan dari orang tua: target hari/sesi belajar dan hadiah, tampil di Kebunku anak. */
function ChallengeEditor() {
  const { challenge, setChallenge, sessions, today } = useApp();
  const [from, setFrom] = useState(SENDERS[0]);
  const [kind, setKind] = useState<ParentChallenge["kind"]>("hari");
  const [target, setTarget] = useState(5);
  const [reward, setReward] = useState("");

  if (challenge) {
    const st = challengeStatus(challenge, sessions, today);
    return (
      <Card batik>
        <h2 className="font-display text-xl font-semibold">
          Tantangan & Hadiah
        </h2>
        <p className="mt-2 font-bold">
          {challengeLabel(challenge)} · hadiah <b>{challenge.reward}</b>
        </p>
        <p className="text-tinta-redup mt-1 text-sm font-bold">
          Dari {challenge.from} · {st.done} / {challenge.target}{" "}
          {challenge.kind} ·{" "}
          {st.expired
            ? "sudah berakhir"
            : `berakhir ${keyToDate(st.endDate).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short" })}`}
        </p>
        <p
          className={`mt-3 rounded-2xl px-3 py-2 text-sm font-bold ${st.completed ? "bg-daun-100 text-daun-800" : st.expired ? "bg-tanah-100 text-tanah-700" : "bg-krem"}`}
        >
          {st.completed
            ? "Tercapai! Jangan lupa berikan hadiahnya, ya."
            : st.expired
              ? "Belum tercapai minggu ini. Coba target yang lebih ringan."
              : `Kurang ${challenge.target - st.done} ${challenge.kind} lagi. Anak melihat tantangan ini di Kebunku.`}
        </p>
        <Button
          variant="ghost"
          className="mt-3 w-full text-lg"
          onClick={() => setChallenge(null)}
        >
          {st.completed || st.expired
            ? "Buat tantangan baru"
            : "Hapus tantangan"}
        </Button>
      </Card>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reward.trim()) return;
    setChallenge({
      id: `${Date.now()}`,
      from,
      kind,
      target,
      reward: reward.trim(),
      startDate: today,
    });
  };

  return (
    <Card batik>
      <form onSubmit={submit} className="flex flex-col gap-3 pb-2">
        <h2 className="font-display text-xl font-semibold">
          Tantangan & Hadiah
        </h2>
        <p className="text-tinta-redup -mt-2 text-sm font-bold">
          Beri target seminggu dan hadiah kecil saat tercapai.
        </p>

        <fieldset>
          <legend className="text-sogan mb-1.5 text-sm font-extrabold">
            Dari
          </legend>
          <div className="flex flex-wrap gap-1.5">
            {SENDERS.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={from === s}
                onClick={() => setFrom(s)}
                className={chip(from === s)}
              >
                {s}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sogan mb-1.5 text-sm font-extrabold">
            Target 7 hari ke depan
          </legend>
          <div className="flex flex-wrap items-center gap-2">
            {(["hari", "sesi"] as const).map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={kind === k}
                onClick={() => {
                  setKind(k);
                  setTarget((t) => Math.min(t, LIMIT[k]));
                }}
                className={chip(kind === k)}
              >
                {k === "hari" ? "Hari belajar" : "Jumlah sesi"}
              </button>
            ))}
            <span className="ml-auto flex items-center gap-1.5">
              <button
                type="button"
                aria-label="Kurangi target"
                onClick={() => setTarget((t) => Math.max(1, t - 1))}
                className="border-krem-tua font-display size-11 cursor-pointer rounded-full border-3 bg-white text-xl"
              >
                −
              </button>
              <output
                aria-label="Target"
                className="font-display w-8 text-center text-2xl font-semibold"
              >
                {target}
              </output>
              <button
                type="button"
                aria-label="Tambah target"
                onClick={() => setTarget((t) => Math.min(LIMIT[kind], t + 1))}
                className="border-krem-tua font-display size-11 cursor-pointer rounded-full border-3 bg-white text-xl"
              >
                +
              </button>
            </span>
          </div>
        </fieldset>

        <label className="flex flex-col gap-1.5">
          <span className="text-sogan text-sm font-extrabold">Hadiah</span>
          <input
            value={reward}
            onChange={(e) => setReward(e.target.value)}
            maxLength={40}
            placeholder="Contoh: piknik ke taman"
            className="border-krem-tua focus:border-langit-500 min-h-12 rounded-[18px] border-3 px-3.5 font-bold outline-none"
          />
        </label>
        <div className="flex flex-wrap gap-1.5">
          {REWARDS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setReward(r)}
              className="bg-krem hover:bg-krem-tua min-h-10 cursor-pointer rounded-full px-3 text-sm font-bold"
            >
              {r}
            </button>
          ))}
        </div>
        <Button type="submit" disabled={!reward.trim()}>
          Buat tantangan
        </Button>
      </form>
    </Card>
  );
}

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

  return (
    <Card batik>
      <form onSubmit={submit} className="pb-2">
        <h2 className="font-display text-xl font-semibold">Kirim Semangat</h2>
        <p className="text-tinta-redup text-sm font-bold">
          Pesan muncul di halaman Kebunku anak.
        </p>

        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <fieldset>
              <legend className="text-sogan mb-1.5 text-sm font-extrabold">
                Dari
              </legend>
              <div className="flex flex-wrap gap-1.5">
                {SENDERS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={from === s}
                    onClick={() => setFrom(s)}
                    className={chip(from === s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sogan mb-1.5 text-sm font-extrabold">
                Stiker
              </legend>
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
          </div>

          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-sogan text-sm font-extrabold">Pesan</span>
              <textarea
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setSent(false);
                }}
                maxLength={80}
                rows={2}
                placeholder="Tulis pesan singkat"
                className="border-krem-tua focus:border-langit-500 rounded-[18px] border-3 px-3.5 py-2.5 font-bold outline-none"
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
                  className="bg-krem hover:bg-krem-tua min-h-10 cursor-pointer rounded-full px-3 text-sm font-bold"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          <Button type="submit" variant="kunyit" disabled={!message.trim()}>
            Kirim Semangat
          </Button>
          <p role="status" className="text-daun-800 text-sm font-bold">
            {sent && "Terkirim! Pesan akan muncul saat anak membuka Kebunku."}
          </p>
        </div>
      </form>

      {history.length > 0 && (
        <div className="border-krem-tua mt-4 border-t-3 pt-3">
          <h3 className="text-sogan text-sm font-extrabold">Pesan terkirim</h3>
          <ul className="mt-2 grid gap-2 md:grid-cols-2">
            {history.slice(0, 4).map((e) => (
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
    <li className="bg-krem flex items-start gap-2.5 rounded-2xl px-3 py-2 text-sm font-bold">
      <span className="text-2xl" aria-hidden="true">
        {e.sticker}
      </span>
      <div className="flex-1">
        <p>&ldquo;{e.message}&rdquo;</p>
        <p className="text-tinta-redup text-xs">
          {e.from ?? "Orang tua"} ·{" "}
          {keyToDate(e.createdAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
          })}{" "}
          · {e.read ? "Sudah dibaca ✓" : "Belum dibaca"}
        </p>
      </div>
    </li>
  );
}
