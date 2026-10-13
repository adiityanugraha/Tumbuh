"use client";

import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import { Button } from "@/components/ui";
import { authErrorText } from "@/lib/account";

/** Hubungkan anak lain lewat kode keluarga. */
export function AddChildForm({ onDone }: { onDone?: () => void }) {
  const { addChild } = useApp();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await addChild(code);
      onDone?.();
    } catch (err) {
      setError(authErrorText(err));
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="text-sogan text-sm font-extrabold">
          Kode keluarga anak
        </span>
        <input
          value={code}
          onChange={(e) =>
            setCode(e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, ""))
          }
          maxLength={6}
          autoComplete="off"
          placeholder="3FA9C1"
          className="border-krem-tua font-display focus:border-langit-500 min-h-12 w-44 rounded-[18px] border-3 px-3 text-center text-xl tracking-[0.3em] uppercase outline-none"
        />
      </label>
      <Button
        type="submit"
        variant="kunyit"
        disabled={code.length !== 6 || busy}
        className="min-h-12 text-lg"
      >
        {busy ? "Menghubungkan..." : "Hubungkan"}
      </Button>
      <p className="text-tinta-redup w-full text-xs font-bold">
        Kode ada di profil akun anak: ketuk avatar di pojok kanan atas.
      </p>
      <p role="status" className="text-tanah-700 w-full text-sm font-bold">
        {error}
      </p>
    </form>
  );
}
