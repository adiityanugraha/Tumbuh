"use client";

import { useApp } from "@/components/AppProvider";
import { Bar, Card } from "@/components/ui";
import { challengeLabel, challengeStatus } from "@/lib/challenge";
import { keyToDate } from "@/lib/date";

/** Tantangan dari orang tua di Kebunku. Tidak tampil bila belum ada atau sudah lewat 7 hari. */
export function ChallengeCard() {
  const { challenge, sessions, today } = useApp();
  if (!challenge) return null;
  const st = challengeStatus(challenge, sessions, today);
  if (st.expired) return null;
  const unit = challenge.kind === "hari" ? "hari" : "sesi";

  return (
    <Card batik>
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-xl font-semibold">Tantangan dari {challenge.from}</h2>
        <span className="text-2xl" aria-hidden="true">
          {st.completed ? "🎁" : "🎯"}
        </span>
      </div>
      <p className="mt-1 text-sm font-bold text-tinta-redup">
        {challengeLabel(challenge)} sampai {keyToDate(st.endDate).toLocaleDateString("id-ID", { weekday: "long" })}
      </p>
      <div className="mt-2.5">
        <Bar value={(st.done / challenge.target) * 100} motif={false} label="Progres tantangan dari orang tua" />
      </div>
      <p className="mt-2 text-sm font-extrabold text-tinta-redup">
        {st.done} / {challenge.target} {unit}
      </p>
      <p className={`mt-2 rounded-2xl px-3 py-2 text-sm font-bold ${st.completed ? "bg-daun-100 text-daun-800" : "bg-krem"}`}>
        {st.completed ? `Tantangan selesai! Tagih hadiahmu ke ${challenge.from}: ` : "Hadiah: "}
        <b>{challenge.reward}</b>
      </p>
    </Card>
  );
}
