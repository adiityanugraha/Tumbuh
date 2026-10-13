"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { AddChildForm } from "@/features/parent/AddChildForm";
import { authErrorText, passwordError } from "@/lib/account";
import { playCorrect } from "@/lib/sound";
import { speak } from "@/lib/speech";
import type { Grade } from "@/lib/types";
import type { Settings } from "@/services/settings";
import { useApp } from "./AppProvider";
import { Button, ButtonLink } from "./ui";

type Variant = "anak" | "ortu";
type Tab = "profil" | "suara" | "tampilan" | "akun" | "anak";

const AVATARS = ["🦁", "🐰", "🐼", "🦊", "🐸", "🐢", "🐨", "🦋"];
const SENDERS = ["Ibu", "Ayah", "Kakak", "Nenek", "Kakek"];
const TAB_LABEL: Record<Tab, string> = {
  profil: "Profil",
  suara: "Suara",
  tampilan: "Tampilan",
  akun: "Akun",
  anak: "Anak",
};

const chip = (on: boolean) =>
  `min-h-11 cursor-pointer rounded-full border-3 px-3.5 font-bold transition ${on ? "border-daun-800 bg-daun-600 text-white" : "border-krem-tua bg-kartu hover:border-daun-300"}`;

function Choice<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: [T, string][];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="mt-4">
      <legend className="text-sogan mb-1.5 text-sm font-extrabold">
        {label}
      </legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map(([v, text]) => (
          <button
            key={v}
            type="button"
            aria-pressed={value === v}
            onClick={() => onChange(v)}
            className={chip(value === v)}
          >
            {text}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function Toggle({
  label,
  desc,
  on,
  onChange,
}: {
  label: string;
  desc: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="border-krem-tua bg-kartu mt-4 flex w-full cursor-pointer items-center gap-3 rounded-[20px] border-3 p-3 text-left"
    >
      <span className="flex-1">
        <span className="block font-extrabold">{label}</span>
        <span className="text-tinta-redup text-sm font-semibold">{desc}</span>
      </span>
      <span
        className={`relative h-8 w-14 flex-none rounded-full transition ${on ? "bg-daun-600" : "bg-krem-tua"}`}
        aria-hidden="true"
      >
        <span
          className={`absolute top-1 size-6 rounded-full bg-white shadow transition-all ${on ? "left-7" : "left-1"}`}
        />
      </span>
    </button>
  );
}

/** Tombol avatar di header yang membuka Pengaturan. */
export function SettingsButton({ variant }: { variant: Variant }) {
  const { student, account } = useApp();
  const ref = useRef<HTMLDialogElement>(null);
  const face =
    variant === "anak"
      ? student?.avatar
      : account?.role === "ortu"
        ? account.username[0]?.toUpperCase()
        : "⚙️";
  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        aria-label="Buka pengaturan"
        className="border-kunyit-400 bg-kunyit-100 font-display text-tanah-700 grid size-12 cursor-pointer place-items-center rounded-full border-3 text-2xl font-semibold transition hover:scale-105"
      >
        {face}
      </button>
      <SettingsDialog dialogRef={ref} variant={variant} />
    </>
  );
}

function SettingsDialog({
  dialogRef,
  variant,
}: {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  variant: Variant;
}) {
  const { account, student } = useApp();
  const tabs: Tab[] =
    variant === "anak"
      ? ["profil", "suara", "tampilan", "akun"]
      : account?.role === "ortu"
        ? ["akun", "anak", "tampilan"]
        : ["akun", "tampilan"];
  const [tab, setTab] = useState<Tab>(tabs[0]);
  const active = tabs.includes(tab) ? tab : tabs[0];
  const close = () => dialogRef.current?.close();

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="judul-pengaturan"
      className="rounded-blob border-krem-tua bg-kartu text-tinta backdrop:bg-tinta-tetap/50 m-auto max-h-[90vh] w-[min(94vw,520px)] border-3 p-0"
    >
      <div className="bg-kartu sticky top-0 z-10 px-5 pt-5">
        <div className="flex items-center gap-3">
          <h2
            id="judul-pengaturan"
            className="font-display flex-1 text-2xl font-semibold"
          >
            Pengaturan
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Tutup pengaturan"
            className="hover:bg-krem-tua size-11 cursor-pointer rounded-full text-2xl"
          >
            ×
          </button>
        </div>
        <div
          role="tablist"
          aria-label="Bagian pengaturan"
          className="bg-krem-tua mt-3 flex gap-1 overflow-x-auto rounded-full p-1 font-extrabold"
        >
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={active === t}
              onClick={() => setTab(t)}
              className={`min-h-10 min-w-0 flex-1 cursor-pointer rounded-full px-2 text-sm whitespace-nowrap sm:px-3 sm:text-base transition ${active === t ? "bg-kartu text-tinta shadow-sm" : "text-tinta-redup"}`}
            >
              {TAB_LABEL[t]}
            </button>
          ))}
        </div>
      </div>
      <div role="tabpanel" className="px-5 pt-1 pb-6">
        {active === "profil" && student && <ProfileTab onClose={close} />}
        {active === "suara" && <SoundTab />}
        {active === "tampilan" && <DisplayTab />}
        {active === "akun" &&
          (variant === "anak" ? (
            <ChildAccountTab onClose={close} />
          ) : (
            <ParentAccountTab onClose={close} />
          ))}
        {active === "anak" && <ChildrenTab />}
      </div>
    </dialog>
  );
}

function ProfileTab({ onClose }: { onClose: () => void }) {
  const { student, account, setAvatar, setGrade } = useApp();
  if (!student) return null;
  const isAccount = account?.role === "anak";
  return (
    <>
      <div className="mt-3 flex items-center gap-3">
        <span className="border-kunyit-400 bg-kunyit-100 grid size-16 place-items-center rounded-full border-3 text-4xl">
          {student.avatar}
        </span>
        <div>
          <p className="font-display text-2xl font-semibold">
            {student.nickname}
          </p>
          <p className="text-tinta-redup font-bold">Kelas {student.grade}</p>
        </div>
      </div>
      <fieldset className="mt-4">
        <legend className="text-sogan mb-1.5 text-sm font-extrabold">
          Ganti avatar
        </legend>
        <div className="grid grid-cols-8 gap-1.5">
          {AVATARS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAvatar(a)}
              aria-pressed={student.avatar === a}
              aria-label={`Avatar ${a}`}
              className={`aspect-square cursor-pointer rounded-2xl border-3 text-2xl transition hover:scale-105 ${student.avatar === a ? "border-kunyit-400 bg-kunyit-100" : "border-krem-tua bg-kartu"}`}
            >
              {a}
            </button>
          ))}
        </div>
      </fieldset>
      {isAccount ? (
        <div className="bg-kunyit-100 mt-5 rounded-[20px] p-4 text-center">
          <p className="text-sogan font-extrabold">Kode keluarga</p>
          <p
            className="font-display text-daun-800 mt-1 text-4xl font-semibold tracking-[0.3em]"
            aria-label={`Kode keluarga ${(account.familyCode ?? "").split("").join(" ")}`}
          >
            {account.familyCode}
          </p>
          <p className="text-tinta-redup mt-1 text-sm font-bold">
            Berikan kode ini ke orang tuamu agar bisa memantau kebunmu dari
            HP-nya. Kelas hanya bisa diganti oleh orang tua.
          </p>
        </div>
      ) : (
        <>
          <fieldset className="mt-4">
            <legend className="text-sogan mb-1.5 text-sm font-extrabold">
              Ganti kelas
            </legend>
            <div className="grid grid-cols-6 gap-1.5">
              {([1, 2, 3, 4, 5, 6] as Grade[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGrade(g)}
                  aria-pressed={student.grade === g}
                  className={`font-display min-h-12 cursor-pointer rounded-2xl border-3 text-xl font-semibold ${student.grade === g ? "border-daun-800 bg-daun-600 text-white" : "border-krem-tua bg-kartu hover:border-daun-300"}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </fieldset>
          <ButtonLink
            href="/orang-tua/"
            variant="ghost"
            className="mt-4 w-full text-lg"
            onClick={onClose}
          >
            Buka halaman orang tua
          </ButtonLink>
        </>
      )}
    </>
  );
}

function SoundTab() {
  const { settings, updateSettings } = useApp();
  return (
    <>
      <Toggle
        label="🔊 Efek suara"
        desc="Bunyi saat jawaban benar, salah, dan perayaan."
        on={settings.sound}
        onChange={(sound) => updateSettings({ sound })}
      />
      <Choice<Settings["speechRate"]>
        label="🗣️ Kecepatan suara bacaan"
        value={settings.speechRate}
        options={[
          ["lambat", "Lambat"],
          ["normal", "Normal"],
          ["cepat", "Cepat"],
        ]}
        onChange={(speechRate) => updateSettings({ speechRate })}
      />
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          variant="ghost"
          className="min-h-11 px-4 text-base"
          onClick={() => playCorrect()}
          disabled={!settings.sound}
        >
          Coba bunyi
        </Button>
        <Button
          variant="ghost"
          className="min-h-11 px-4 text-base"
          onClick={() =>
            speak([
              { text: "Halo! Aku Kumbi. Ayo belajar bersama.", lang: "id-ID" },
            ])
          }
        >
          Coba suara bacaan
        </Button>
      </div>
    </>
  );
}

function DisplayTab() {
  const { settings, updateSettings } = useApp();
  return (
    <>
      <Choice<Settings["theme"]>
        label="🌗 Tema"
        value={settings.theme}
        options={[
          ["auto", "Ikuti perangkat"],
          ["terang", "Terang"],
          ["gelap", "Gelap"],
        ]}
        onChange={(theme) => updateSettings({ theme })}
      />
      <Choice<Settings["font"]>
        label="🔤 Ukuran huruf"
        value={settings.font}
        options={[
          ["normal", "Normal"],
          ["besar", "Besar"],
        ]}
        onChange={(font) => updateSettings({ font })}
      />
      <Toggle
        label="🎞️ Kurangi animasi"
        desc="Matikan gerakan seperti kupu-kupu, tanaman bergoyang, dan pergantian halaman."
        on={settings.reduceMotion}
        onChange={(reduceMotion) => updateSettings({ reduceMotion })}
      />
      <p className="text-tinta-redup mt-3 text-xs font-bold">
        Pengaturan suara dan tampilan tersimpan di perangkat ini.
      </p>
    </>
  );
}

function ChangePasswordForm() {
  const { changePassword } = useApp();
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const invalid = passwordError(newPw);
    if (invalid) return setMsg({ ok: false, text: invalid });
    setBusy(true);
    setMsg(null);
    try {
      await changePassword(oldPw, newPw);
      setOldPw("");
      setNewPw("");
      setMsg({ ok: true, text: "Kata sandi berhasil diganti." });
    } catch (err) {
      const text = authErrorText(err);
      setMsg({
        ok: false,
        text: text.startsWith("Nama pengguna atau")
          ? "Kata sandi lama salah."
          : text,
      });
    } finally {
      setBusy(false);
    }
  };
  const input =
    "min-h-12 rounded-[18px] border-3 border-krem-tua bg-kartu px-3.5 font-bold outline-none focus:border-langit-500";
  return (
    <form
      onSubmit={submit}
      className="border-krem-tua mt-4 flex flex-col gap-2 rounded-[20px] border-3 p-4"
    >
      <p className="font-extrabold">🔑 Ganti kata sandi</p>
      <label className="text-sogan flex flex-col gap-1 text-sm font-extrabold">
        Kata sandi lama
        <input
          type="password"
          value={oldPw}
          onChange={(e) => setOldPw(e.target.value)}
          autoComplete="current-password"
          className={input}
        />
      </label>
      <label className="text-sogan flex flex-col gap-1 text-sm font-extrabold">
        Kata sandi baru
        <input
          type="password"
          value={newPw}
          onChange={(e) => setNewPw(e.target.value)}
          autoComplete="new-password"
          placeholder="Minimal 6 karakter"
          className={input}
        />
      </label>
      <Button
        type="submit"
        variant="ghost"
        disabled={busy || !oldPw || !newPw}
        className="mt-1 min-h-12 text-lg"
      >
        {busy ? "Menyimpan..." : "Simpan kata sandi"}
      </Button>
      <p
        role="status"
        className={`min-h-5 text-sm font-bold ${msg?.ok ? "text-daun-800" : "text-tanah-700"}`}
      >
        {msg?.text}
      </p>
    </form>
  );
}

function LogoutButton({ onClose }: { onClose: () => void }) {
  const { logout } = useApp();
  const router = useRouter();
  return (
    <Button
      variant="kunyit"
      className="mt-4 w-full text-lg"
      onClick={async () => {
        onClose();
        await logout();
        router.replace("/");
      }}
    >
      Keluar dari akun
    </Button>
  );
}

/** Mode Demo dan profil lokal: hapus data di perangkat ini dan kembali ke layar awal. */
function ResetData({ onClose }: { onClose: () => void }) {
  const { reset, student } = useApp();
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="border-krem-tua mt-4 rounded-[20px] border-3 p-4">
      <p className="font-extrabold">
        {student?.demo ? "Keluar dari Mode Demo" : "Mulai dari awal"}
      </p>
      <p className="text-tinta-redup text-sm font-semibold">
        Kebun dan koleksi di perangkat ini akan dihapus.
      </p>
      {confirm ? (
        <Button
          variant="kunyit"
          className="mt-3 w-full text-lg"
          onClick={async () => {
            onClose();
            await reset();
            router.replace("/");
          }}
        >
          Ya, hapus dan kembali ke awal
        </Button>
      ) : (
        <button
          type="button"
          onClick={() => setConfirm(true)}
          className="text-tanah-700 mt-2 min-h-10 cursor-pointer font-bold underline"
        >
          {student?.demo ? "Keluar dari Mode Demo" : "Mulai dari awal"}
        </button>
      )}
    </div>
  );
}

function ChildAccountTab({ onClose }: { onClose: () => void }) {
  const { account } = useApp();
  if (account?.role !== "anak") return <ResetData onClose={onClose} />;
  return (
    <>
      <p className="text-tinta-redup mt-3 font-bold">
        Masuk sebagai {account.username}
      </p>
      <ChangePasswordForm />
      <LogoutButton onClose={onClose} />
    </>
  );
}

function ParentAccountTab({ onClose }: { onClose: () => void }) {
  const { account, settings, updateSettings, student } = useApp();
  const [custom, setCustom] = useState(
    SENDERS.includes(settings.sender) ? "" : settings.sender,
  );
  const isParent = account?.role === "ortu";
  return (
    <>
      {isParent && (
        <p className="text-tinta-redup mt-3 font-bold">
          Masuk sebagai {account.username}
        </p>
      )}
      <fieldset className="mt-4">
        <legend className="text-sogan mb-1.5 text-sm font-extrabold">
          🙋 Sapaan bawaan
        </legend>
        <p className="text-tinta-redup mb-2 text-sm font-semibold">
          Otomatis terpilih saat Kirim Semangat dan membuat tantangan.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {SENDERS.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={settings.sender === s}
              onClick={() => {
                setCustom("");
                updateSettings({ sender: s });
              }}
              className={chip(settings.sender === s)}
            >
              {s}
            </button>
          ))}
        </div>
        <label className="text-sogan mt-2 flex flex-col gap-1 text-sm font-extrabold">
          Sapaan lain
          <input
            value={custom}
            maxLength={15}
            placeholder="Contoh: Bunda, Papa, Om Budi"
            onChange={(e) => {
              setCustom(e.target.value);
              if (e.target.value.trim())
                updateSettings({ sender: e.target.value.trim() });
            }}
            className="border-krem-tua bg-kartu focus:border-langit-500 min-h-12 rounded-[18px] border-3 px-3.5 font-bold outline-none"
          />
        </label>
      </fieldset>
      {isParent ? (
        <>
          <ChangePasswordForm />
          <LogoutButton onClose={onClose} />
        </>
      ) : (
        student && <ResetData onClose={onClose} />
      )}
    </>
  );
}

function ChildrenTab() {
  const { account, unlinkChild } = useApp();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  if (account?.role !== "ortu") return null;
  const kids = account.children ?? [];
  return (
    <>
      <p className="text-tinta-redup mt-3 text-sm font-semibold">
        Anak yang terhubung dengan akunmu. Melepas tautan tidak menghapus data
        belajar anak.
      </p>
      <ul className="mt-3 grid gap-2">
        {kids.map((c) => (
          <li
            key={c.id}
            className="bg-krem flex flex-wrap items-center gap-3 rounded-[20px] p-3"
          >
            <span className="text-3xl" aria-hidden="true">
              {c.avatar}
            </span>
            <span className="flex-1 font-bold">
              {c.nickname}
              <span className="text-tinta-redup block text-sm">
                Kelas {c.grade}
              </span>
            </span>
            {confirmId === c.id ? (
              <Button
                variant="kunyit"
                className="min-h-11 px-4 text-base"
                onClick={async () => {
                  setError(null);
                  try {
                    await unlinkChild(c.id);
                    setConfirmId(null);
                  } catch (err) {
                    setError(authErrorText(err));
                  }
                }}
              >
                Ya, lepas
              </Button>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmId(c.id)}
                className="text-tanah-700 min-h-10 cursor-pointer text-sm font-bold underline"
              >
                Lepas tautan
              </button>
            )}
          </li>
        ))}
        {!kids.length && (
          <li className="bg-krem text-tinta-redup rounded-[20px] p-3 text-sm font-bold">
            Belum ada anak yang terhubung.
          </li>
        )}
      </ul>
      <p role="status" className="text-tanah-700 min-h-5 text-sm font-bold">
        {error}
      </p>
      <div className="border-krem-tua mt-2 rounded-[20px] border-3 p-4">
        <p className="mb-2 font-extrabold">+ Tambah anak</p>
        <AddChildForm />
      </div>
    </>
  );
}
