"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { Button } from "@/components/ui";
import { authErrorText, passwordError, usernameError } from "@/lib/account";
import type { Grade } from "@/lib/types";
import { AVATARS, GRADES, KumbiPanel, Onboarding } from "./Onboarding";

type Step = "pilih" | "anak" | "ortu";
type Mode = "masuk" | "daftar";

const INPUT =
  "min-h-14 rounded-[18px] border-3 border-krem-tua px-4 text-xl font-extrabold outline-none placeholder:font-semibold placeholder:text-tinta-redup/60 focus:border-langit-500";

/** Layar awal: pilih peran (anak atau orang tua), lalu masuk atau daftar. Tanpa Supabase: profil lokal seperti biasa. */
export function Welcome() {
  const { ready, student, account, cloudAvailable } = useApp();
  const router = useRouter();
  const [step, setStep] = useState<Step>("pilih");

  useEffect(() => {
    if (!ready) return;
    if (account?.role === "ortu") router.replace("/orang-tua/");
    else if (student) router.replace("/kebun/");
  }, [ready, student, account, router]);

  if (!cloudAvailable) return <Onboarding />;
  if (!ready || student || account) return null;

  return (
    <main className="mx-auto grid min-h-screen max-w-6xl place-items-center p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-krem-tua grid w-full overflow-hidden rounded-[36px] border-3 bg-kartu md:grid-cols-[1.1fr_1fr]"
      >
        <KumbiPanel />
        <div className="flex flex-col gap-4 p-6 md:p-10">
          {step === "pilih" ? (
            <PickRole onPick={setStep} />
          ) : (
            <AuthForm role={step} onBack={() => setStep("pilih")} />
          )}
        </div>
      </motion.div>
    </main>
  );
}

function PickRole({ onPick }: { onPick: (s: Step) => void }) {
  const { loadDemo } = useApp();
  const router = useRouter();
  const roles = [
    {
      id: "anak" as const,
      emoji: "🧒",
      title: "Aku Anak",
      desc: "Belajar dan merawat kebunku",
    },
    {
      id: "ortu" as const,
      emoji: "👨‍👩‍👧",
      title: "Saya Orang Tua",
      desc: "Lihat laporan dan kirim semangat",
    },
  ];
  return (
    <>
      <h2 className="font-display text-3xl font-semibold">Kamu siapa?</h2>
      <div className="grid gap-3">
        {roles.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => onPick(r.id)}
            className="border-krem-tua hover:border-daun-300 flex min-h-20 cursor-pointer items-center gap-4 rounded-[24px] border-3 bg-kartu px-5 text-left transition hover:-translate-y-0.5"
          >
            <span className="text-4xl" aria-hidden="true">
              {r.emoji}
            </span>
            <span>
              <span className="font-display block text-2xl font-semibold">
                {r.title}
              </span>
              <span className="text-tinta-redup font-bold">{r.desc}</span>
            </span>
          </button>
        ))}
      </div>
      <p className="text-tinta-redup mt-auto text-center text-sm font-bold">
        Juri atau ingin melihat contoh dulu?{" "}
        <button
          type="button"
          onClick={async () => {
            await loadDemo();
            router.push("/kebun/");
          }}
          className="text-daun-800 min-h-10 cursor-pointer underline"
        >
          Buka Mode Demo
        </button>
        <br />
        Tanpa akun, berisi anak contoh dengan riwayat belajar seminggu.
      </p>
    </>
  );
}

function AuthForm({
  role,
  onBack,
}: {
  role: "anak" | "ortu";
  onBack: () => void;
}) {
  const { login, registerChild, registerParent } = useApp();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("masuk");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[1]);
  const [grade, setGrade] = useState<Grade | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const daftar = mode === "daftar";
  const invalid =
    usernameError(nickname) ??
    passwordError(password) ??
    (daftar && role === "anak" && !grade ? "Pilih kelasmu dulu." : null) ??
    (daftar && role === "ortu" && code.length !== 6
      ? "Kode keluarga berisi 6 karakter."
      : null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (invalid) return setError(invalid);
    setBusy(true);
    setError(null);
    try {
      if (!daftar) await login(role, nickname, password);
      else if (role === "anak")
        await registerChild({ nickname, password, avatar, grade: grade! });
      else await registerParent({ nickname, password, code });
      router.push(role === "anak" ? "/kebun/" : "/orang-tua/");
    } catch (err) {
      setError(authErrorText(err));
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      <button
        type="button"
        onClick={onBack}
        className="text-sogan min-h-10 w-fit cursor-pointer font-bold underline"
      >
        ← Kembali
      </button>
      <h2 className="font-display text-3xl font-semibold">
        {role === "anak" ? "Akun Anak" : "Akun Orang Tua"}
      </h2>

      <div
        role="tablist"
        aria-label="Masuk atau daftar"
        className="bg-krem-tua grid grid-cols-2 gap-1 rounded-full p-1 font-extrabold"
      >
        {(["masuk", "daftar"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            className={`min-h-11 cursor-pointer rounded-full transition ${mode === m ? "text-tinta bg-kartu shadow-sm" : "text-tinta-redup"}`}
          >
            {m === "masuk" ? "Masuk" : "Daftar"}
          </button>
        ))}
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-sogan font-extrabold">Nama pengguna</span>
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value.replace(/\s/g, ""))}
          maxLength={20}
          autoComplete="username"
          autoCapitalize="none"
          placeholder={role === "anak" ? "Contoh: sari" : "Contoh: ibu_sari"}
          className={INPUT}
        />
        {daftar && (
          <span className="text-tinta-redup text-sm">
            3-20 huruf atau angka, tanpa spasi. Jangan pakai nama lengkap.
          </span>
        )}
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sogan font-extrabold">Kata sandi</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={daftar ? "new-password" : "current-password"}
          placeholder="Minimal 6 karakter"
          className={INPUT}
        />
      </label>

      {daftar && role === "anak" && (
        <>
          <fieldset>
            <legend className="text-sogan mb-2 font-extrabold">
              Pilih teman avatarmu
            </legend>
            <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-8 md:grid-cols-4 lg:grid-cols-8">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAvatar(a)}
                  aria-pressed={avatar === a}
                  aria-label={`Avatar ${a}`}
                  className={`aspect-square cursor-pointer rounded-[20px] border-3 text-3xl transition hover:scale-105 ${avatar === a ? "border-kunyit-400 bg-kunyit-100" : "border-krem-tua bg-kartu"}`}
                >
                  {a}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-sogan mb-2 font-extrabold">
              Kamu kelas berapa?
            </legend>
            <div className="grid grid-cols-6 gap-2.5">
              {GRADES.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGrade(g)}
                  aria-pressed={grade === g}
                  aria-label={`Kelas ${g}`}
                  className={`font-display min-h-14 cursor-pointer rounded-[18px] border-3 text-2xl font-semibold transition ${grade === g ? "border-daun-800 bg-daun-600 text-white" : "border-krem-tua hover:border-daun-300 bg-kartu"}`}
                >
                  {g}
                </button>
              ))}
            </div>
            <span className="text-tinta-redup mt-1.5 block text-sm">
              Setelah ini, kelas hanya bisa diganti oleh orang tua.
            </span>
          </fieldset>
        </>
      )}

      {daftar && role === "ortu" && (
        <label className="flex flex-col gap-1.5">
          <span className="text-sogan font-extrabold">Kode keluarga anak</span>
          <input
            value={code}
            onChange={(e) =>
              setCode(e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, ""))
            }
            maxLength={6}
            autoComplete="off"
            placeholder="Contoh: 3FA9C1"
            aria-describedby="bantuan-kode"
            className={`${INPUT} text-center tracking-[0.3em] uppercase`}
          />
          <span
            id="bantuan-kode"
            className="bg-kunyit-100 rounded-[18px] p-3 text-sm font-bold"
          >
            <b>Cara menemukan kode keluarga:</b>
            <br />
            1. Buka Tumbuh di perangkat anak, lalu masuk ke akun anak.
            <br />
            2. Ketuk avatar anak di pojok kanan atas.
            <br />
            3. Kode keluarga (6 karakter) tertulis di bagian profil.
          </span>
        </label>
      )}

      <p role="status" className="text-tanah-700 min-h-6 text-sm font-bold">
        {error}
      </p>
      <Button type="submit" disabled={busy}>
        {busy
          ? "Sebentar..."
          : daftar
            ? role === "anak"
              ? "Daftar dan Mulai Berkebun"
              : "Daftar dan Hubungkan"
            : "Masuk"}
      </Button>
    </form>
  );
}
