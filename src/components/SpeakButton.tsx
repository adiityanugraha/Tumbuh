"use client";

import { useEffect, useState } from "react";
import { hasVoice, isSpeechSupported, speak, stopSpeaking, type SpeechPart } from "@/lib/speech";
import { Icon } from "./art";

/** Tombol bacakan. Disembunyikan bila browser tidak mendukung narasi suara. */
export function SpeakButton({ parts, label = "Bacakan" }: { parts: SpeechPart[]; label?: string }) {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [noVoice, setNoVoice] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported(isSpeechSupported());
    return () => {
      stopSpeaking();
    };
  }, []);

  if (!supported) return null;

  const onClick = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    setNoVoice(!parts.every((p) => hasVoice(p.lang)));
    setSpeaking(true);
    speak(parts, () => setSpeaking(false));
  };

  return (
    <span className="relative inline-flex flex-none">
      <button
        type="button"
        onClick={onClick}
        aria-label={speaking ? "Hentikan suara" : label}
        title={label}
        className={`grid size-13 cursor-pointer place-items-center rounded-full border-2 border-langit-300 text-langit-700 transition hover:bg-langit-300 ${speaking ? "animate-bob bg-langit-300" : "bg-langit-100"}`}
      >
        <Icon name="speaker" />
      </button>
      {noVoice && (
        <span role="status" className="absolute top-full right-0 z-10 mt-2 w-52 rounded-2xl bg-white p-2 text-xs font-bold shadow-lg">
          Suara bahasa ini belum terpasang di perangkatmu, jadi suaranya mungkin terdengar berbeda.
        </span>
      )}
    </span>
  );
}
