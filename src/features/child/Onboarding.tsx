"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { Mascot, MegaMendung } from "@/components/art";
import { Button } from "@/components/ui";
import type { Grade } from "@/lib/types";

export const AVATARS = ["🦁", "🐰", "🐼", "🦊", "🐸", "🐢", "🐨", "🦋"];
const GRADES: Grade[] = [1, 2, 3, 4, 5, 6];

export function Onboarding() {
  const { ready, student, createStudent } = useApp();
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[1]);
  const [grade, setGrade] = useState<Grade | null>(null);

  useEffect(() => {
    if (ready && student) router.replace("/kebun/");
  }, [ready, student, router]);

  const name = nickname.trim();
  const canStart = name.length > 0 && grade !== null;

  const start = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canStart) return;
    await createStudent({ nickname: name, avatar, grade });
    router.push("/kebun/");
  };

  if (!ready || student) return null;

  return (
    <main className="mx-auto grid min-h-screen max-w-6xl place-items-center p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid w-full overflow-hidden rounded-[36px] border-3 border-krem-tua bg-white md:grid-cols-[1.1fr_1fr]"
      >
        <div className="relative flex flex-col items-center justify-center bg-linear-to-b from-langit-300 via-langit-100 via-60% to-daun-100 to-60% p-8 text-center md:p-10">
          <MegaMendung className="absolute inset-x-0 top-0 h-32 w-full" />
          <div className="absolute inset-x-0 bottom-0 h-2/5 bg-kawung opacity-40" />
          <Mascot size={180} className="relative animate-sway" />
          <h1 className="relative mt-2 font-display text-4xl font-semibold text-daun-800 md:text-5xl">Halo! Aku Kumbi.</h1>
          <p className="relative mt-2 max-w-sm font-bold text-tinta-redup">
            Aku tukang kebun dari Nusantara. Yuk, belajar sedikit setiap hari dan tumbuhkan kebun bersama!
          </p>
        </div>

        <form onSubmit={start} className="flex flex-col gap-4 p-6 md:p-10">
          <h2 className="font-display text-3xl font-semibold">Kenalan dulu, yuk</h2>

          <label className="flex flex-col gap-2">
            <span className="font-extrabold text-sogan">Nama panggilanmu</span>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              autoComplete="off"
              placeholder="Contoh: Sari"
              className="min-h-15 rounded-[20px] border-3 border-krem-tua px-4 text-2xl font-extrabold outline-none placeholder:font-semibold placeholder:text-tinta-redup/60 focus:border-langit-500"
            />
            <span className="text-sm text-tinta-redup">Cukup nama panggilan saja, tidak perlu nama lengkap.</span>
          </label>

          <fieldset>
            <legend className="mb-2 font-extrabold text-sogan">Pilih teman avatarmu</legend>
            <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-8 md:grid-cols-4 lg:grid-cols-8">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAvatar(a)}
                  aria-pressed={avatar === a}
                  aria-label={`Avatar ${a}`}
                  className={`aspect-square cursor-pointer rounded-[20px] border-3 text-3xl transition hover:scale-105 ${avatar === a ? "border-kunyit-400 bg-kunyit-100" : "border-krem-tua bg-white"}`}
                >
                  {a}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 font-extrabold text-sogan">Kamu kelas berapa?</legend>
            <div className="grid grid-cols-6 gap-2.5">
              {GRADES.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGrade(g)}
                  aria-pressed={grade === g}
                  aria-label={`Kelas ${g}`}
                  className={`min-h-15 cursor-pointer rounded-[18px] border-3 font-display text-2xl font-semibold transition ${grade === g ? "border-daun-800 bg-daun-600 text-white" : "border-krem-tua bg-white hover:border-daun-300"}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </fieldset>

          <Button type="submit" disabled={!canStart} className="mt-auto">
            Mulai Berkebun
          </Button>
        </form>
      </motion.div>
    </main>
  );
}
