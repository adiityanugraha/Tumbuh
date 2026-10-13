"use client";

import { useState } from "react";
import { useApp, type SyncStatus } from "@/components/AppProvider";
import { Button, Card } from "@/components/ui";

const STATUS: Record<SyncStatus, string> = {
  off: "",
  syncing: "Menyinkronkan...",
  ok: "Tersinkron ✓",
  error: "Gagal tersambung. Periksa internet lalu coba lagi.",
};

const errorText = (e: unknown) =>
  String((e as { message?: string })?.message ?? e).includes("tidak ditemukan")
    ? "Kode tidak ditemukan. Periksa lagi, ya."
    : "Gagal tersambung. Periksa internet lalu coba lagi.";

/** Masukkan kode keluarga dari perangkat lain. Data di perangkat ini diganti data keluarga. */
export function JoinFamilyForm() {
  const { joinWithCode } = useApp();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await joinWithCode(code);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <label className="flex flex-col gap-1.5">
        <span className="text-sogan text-sm font-extrabold">
          Punya kode keluarga dari perangkat lain?
        </span>
        <input
          value={code}
          onChange={(e) =>
            setCode(e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, ""))
          }
          maxLength={6}
          autoComplete="off"
          placeholder="Contoh: 3FA9C1"
          aria-describedby="kode-catatan"
          className="border-krem-tua font-display focus:border-langit-500 min-h-12 rounded-[18px] border-3 px-3.5 text-center text-2xl tracking-[0.3em] uppercase outline-none"
        />
      </label>
      <Button
        type="submit"
        variant="ghost"
        disabled={code.length !== 6 || busy}
        className="text-lg"
      >
        {busy ? "Menyambungkan..." : "Sambungkan"}
      </Button>
      <p id="kode-catatan" className="text-tinta-redup text-xs font-bold">
        Data di perangkat ini akan diganti dengan data dari kode keluarga.
      </p>
      <p role="status" className="text-tanah-700 min-h-5 text-sm font-bold">
        {error}
      </p>
    </form>
  );
}

/** Kartu sinkronisasi di halaman orang tua: buat kode keluarga atau bergabung, lalu pantau statusnya. */
export function FamilySyncCard() {
  const {
    cloudAvailable,
    family,
    syncStatus,
    connectFamily,
    disconnectFamily,
    syncNow,
  } = useApp();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOff, setConfirmOff] = useState(false);
  if (!cloudAvailable) return null;

  const create = async () => {
    setBusy(true);
    setError(null);
    try {
      await connectFamily();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card batik>
      <h2 className="font-display text-xl font-semibold">
        Pantau dari HP Lain
      </h2>
      {family ? (
        <div className="flex flex-col gap-3 pb-2">
          <p className="text-tinta-redup text-sm font-bold">
            Ketik kode ini di halaman Orang Tua pada HP lain agar datanya
            tersambung.
          </p>
          <p
            className="bg-krem font-display text-daun-800 rounded-[18px] py-3 text-center text-4xl font-semibold tracking-[0.3em]"
            aria-label={`Kode keluarga ${family.split("").join(" ")}`}
          >
            {family}
          </p>
          <p
            role="status"
            className={`min-h-5 text-sm font-bold ${syncStatus === "error" ? "text-tanah-700" : "text-daun-800"}`}
          >
            {STATUS[syncStatus]}
          </p>
          <Button
            variant="ghost"
            className="text-lg"
            onClick={syncNow}
            disabled={syncStatus === "syncing"}
          >
            Sinkronkan sekarang
          </Button>
          {confirmOff ? (
            <Button
              variant="kunyit"
              className="text-lg"
              onClick={disconnectFamily}
            >
              Ya, putuskan perangkat ini
            </Button>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmOff(true)}
              className="text-tanah-700 min-h-10 cursor-pointer text-sm font-bold underline"
            >
              Putuskan perangkat ini
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3 pb-2">
          <p className="text-tinta-redup text-sm font-bold">
            Sambungkan perangkat anak dengan HP orang tua. Laporan dan Kirim
            Semangat lalu bisa dipakai dari kedua perangkat.
          </p>
          <Button onClick={create} disabled={busy} className="text-lg">
            {busy ? "Membuat kode..." : "Buat kode keluarga"}
          </Button>
          <p role="status" className="text-tanah-700 min-h-5 text-sm font-bold">
            {error}
          </p>
          <div className="border-krem-tua border-t-3 pt-3">
            <JoinFamilyForm />
          </div>
        </div>
      )}
      <p className="text-tinta-redup mt-1 pb-1 text-xs font-semibold">
        Yang disimpan di server (Supabase): nama panggilan, avatar, kelas, dan
        riwayat belajar. Tanpa email, nomor HP, atau foto.
      </p>
    </Card>
  );
}
