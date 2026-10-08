"use client";

import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import { Card } from "@/components/ui";
import { REGIONS } from "@/data/plants";
import { badgeStatus } from "@/lib/badges";

/** Kartu lencana di Kebunku. Klik lencana untuk melihat cara mendapatkannya. */
export function BadgeCard() {
  const { garden, sessions } = useApp();
  const [pickedId, setPickedId] = useState<string | null>(null);
  if (!garden) return null;

  const badges = badgeStatus({ garden, sessions, regions: REGIONS });
  const earned = badges.filter((b) => b.earned).length;
  const picked = badges.find((b) => b.id === pickedId) ?? badges.find((b) => !b.earned);

  return (
    <Card batik>
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-xl font-semibold">Lencanaku</h2>
        <span className="font-extrabold text-tinta-redup">
          {earned} / {badges.length}
        </span>
      </div>
      <ul className="mt-3 grid grid-cols-4 gap-2">
        {badges.map((b) => (
          <li key={b.id}>
            <button
              type="button"
              onClick={() => setPickedId(b.id)}
              aria-label={`${b.name}, ${b.earned ? "sudah didapat" : "belum didapat"}`}
              aria-pressed={picked?.id === b.id}
              className={`grid aspect-square w-full cursor-pointer place-items-center rounded-2xl border-3 text-3xl transition hover:-translate-y-0.5 ${
                b.earned ? "border-kunyit-400 bg-kunyit-100" : "border-transparent bg-krem-tua"
              } ${picked?.id === b.id ? "outline-3 outline-offset-2 outline-daun-500" : ""}`}
            >
              <span aria-hidden="true" className={b.earned ? "" : "opacity-35 grayscale"}>
                {b.emoji}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-3 min-h-10 pb-1 text-sm font-bold text-tinta-redup" aria-live="polite">
        {picked ? (
          <>
            {picked.earned ? "Sudah didapat: " : pickedId ? "Belum didapat: " : "Berikutnya: "}
            <b className="text-tinta">{picked.name}</b>. {picked.how}.
          </>
        ) : (
          "Hebat, semua lencana sudah kamu dapatkan!"
        )}
      </p>
    </Card>
  );
}
