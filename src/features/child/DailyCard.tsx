"use client";

import Link from "next/link";
import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import { SpeakButton } from "@/components/SpeakButton";
import { getDailyQuestion, SUBJECTS } from "@/data/questions";
import { getPlant } from "@/data/plants";
import { MAX_ATTEMPTS } from "@/lib/garden";
import { checkAnswer, type AnswerValue } from "@/lib/session";
import { playCelebrate, playCorrect, playWrong } from "@/lib/sound";
import { QuestionInput, type QuestionStatus } from "./QuestionInput";
import { revealText } from "./QuizSession";

/** Soal Hari Ini: satu soal spesial per hari, disimpan sebagai sesi 1 soal (ikut menyiram tanaman dan streak). */
export function DailyCard() {
  const { student, sessions, today, completeSession } = useApp();
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState<QuestionStatus>("answering");
  const [message, setMessage] = useState<string | null>(null);
  if (!student) return null;

  const { subject, question: q } = getDailyQuestion(student.grade, today);
  const meta = SUBJECTS.find((s) => s.id === subject)!;
  const done = sessions.find((s) => s.daily && s.date === today);

  const finish = async (
    correctFirstTry: boolean,
    solved: boolean,
    tries: number,
  ) => {
    const outcome = await completeSession({
      subject,
      grade: student.grade,
      daily: true,
      results: [
        {
          questionId: q.id,
          topic: q.topic,
          correctFirstTry,
          solved,
          attempts: tries,
        },
      ],
    });
    const bloomed = outcome.bloomedPlantId
      ? getPlant(outcome.bloomedPlantId)
      : null;
    if (bloomed) playCelebrate();
    return bloomed ? ` Hore, ${bloomed.name} berbunga!` : "";
  };

  const onAnswer = (value: AnswerValue) => {
    const tries = attempts + 1;
    if (checkAnswer(q, value)) {
      playCorrect();
      setStatus("correct");
      finish(tries === 1, true, tries).then((extra) =>
        setMessage(
          (tries === 1
            ? "Hebat! Kamu dapat 1 air dan 1 pupuk."
            : "Betul! Kamu dapat 1 air.") + extra,
        ),
      );
      return true;
    }
    playWrong();
    setAttempts(tries);
    if (tries >= MAX_ATTEMPTS) {
      setStatus("revealed");
      setMessage(`Jawabannya ${revealText(q)}. Besok ada soal baru, ya!`);
      finish(false, false, tries);
    } else {
      setMessage(`Hampir! Petunjuk: ${q.hint}`);
    }
    return false;
  };

  const speech = [
    { text: q.prompt, lang: "id-ID" as const },
    ...(q.say ? [{ text: q.say, lang: "en-US" as const }] : []),
  ];

  return (
    <section
      className="batik-line rounded-blob border-kunyit-400 bg-kunyit-100 mb-6 border-3 p-5 md:p-6"
      aria-labelledby="soal-hari-ini"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <h2 id="soal-hari-ini" className="font-display text-2xl font-semibold">
          🌞 Soal Hari Ini
        </h2>
        <span className="text-sogan rounded-full bg-white px-3 py-0.5 text-sm font-extrabold">
          {meta.emoji} {meta.name} · {q.topic}
        </span>
        <span className="text-tanah-700 ml-auto text-sm font-extrabold">
          Benar sekali coba: 💧 +1 🌱 +1
        </span>
      </div>

      {done && status === "answering" ? (
        <p className="mt-3 rounded-[20px] bg-white px-4 py-3 font-bold">
          {done.results[0]?.correctFirstTry
            ? "✓ Kamu sudah menjawab Soal Hari Ini dengan benar. Hebat!"
            : "✓ Soal Hari Ini sudah dikerjakan."}{" "}
          Besok ada soal baru dari mapel lain.{" "}
          <Link href="/kebun/" className="text-daun-800 underline">
            Lihat kebunmu
          </Link>
        </p>
      ) : (
        <div className="mt-3 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <div className="rounded-[22px] bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="font-display text-xl leading-snug font-semibold md:text-2xl">
                {q.prompt}
              </p>
              <SpeakButton parts={speech} label="Bacakan Soal Hari Ini" />
            </div>
            {q.image && (
              <p className="pt-3 text-center text-5xl" aria-hidden="true">
                {q.image}
              </p>
            )}
            <p role="status" className="text-tanah-700 mt-3 min-h-6 font-bold">
              {message}
            </p>
          </div>
          <QuestionInput question={q} status={status} onAnswer={onAnswer} />
        </div>
      )}
    </section>
  );
}
