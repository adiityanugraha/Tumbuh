"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import { Mascot } from "@/components/art";
import { SpeakButton } from "@/components/SpeakButton";
import { Button, ButtonLink, Card } from "@/components/ui";
import { getQuestions, SUBJECTS } from "@/data/questions";
import { MAX_ATTEMPTS, type SessionOutcome } from "@/lib/garden";
import { checkAnswer, pickQuestions, type AnswerValue } from "@/lib/session";
import { playCorrect, playWrong } from "@/lib/sound";
import type { AnswerResult, Garden, Question, Subject } from "@/lib/types";
import { QuestionInput, type QuestionStatus } from "./QuestionInput";
import { ResultView } from "./ResultView";

const PRAISE = ["Hebat!", "Pintar sekali!", "Betul!", "Keren!", "Mantap!"];

function revealText(q: Question) {
  switch (q.type) {
    case "pilihan":
      return q.options[q.answer];
    case "isian":
      return String(q.answer);
    default:
      return "seperti yang ditunjukkan";
  }
}

export function QuizSession({ subject }: { subject: Subject }) {
  const { student, garden, completeSession } = useApp();
  const meta = SUBJECTS.find((s) => s.id === subject)!;
  // AppShell baru merender halaman ini setelah data dimuat di browser, jadi aman mengacak di sini.
  const draw = () => (student ? pickQuestions(getQuestions(student.grade, subject)) : []);
  const [questions, setQuestions] = useState<Question[]>(draw);
  const [round, setRound] = useState(0);
  const [index, setIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState<QuestionStatus>("answering");
  const [results, setResults] = useState<AnswerResult[]>([]);
  const [message, setMessage] = useState("Baca soalnya baik-baik, ya. Tekan tombol biru kalau mau soalnya dibacakan!");
  const [finished, setFinished] = useState<{ outcome: SessionOutcome; before: Garden } | null>(null);

  if (!student || !garden || questions.length === 0) return null;

  if (finished) {
    return (
      <ResultView
        outcome={finished.outcome}
        before={finished.before}
        results={results}
        onAgain={() => {
          setFinished(null);
          setResults([]);
          setIndex(0);
          setAttempts(0);
          setStatus("answering");
          setRound((r) => r + 1);
          setQuestions(draw());
        }}
      />
    );
  }

  const q = questions[index];
  const last = index === questions.length - 1;

  const record = (r: Omit<AnswerResult, "questionId" | "topic">) =>
    setResults((prev) => [...prev, { questionId: q.id, topic: q.topic, ...r }]);

  const onAnswer = (value: AnswerValue) => {
    const tries = attempts + 1;
    if (checkAnswer(q, value)) {
      playCorrect();
      setStatus("correct");
      setMessage(`${PRAISE[index % PRAISE.length]} ${tries === 1 ? "Tanamanmu dapat 1 air dan 1 pupuk." : "Tanamanmu dapat 1 air."}`);
      record({ correctFirstTry: tries === 1, solved: true, attempts: tries });
      return true;
    }
    playWrong();
    setAttempts(tries);
    if (tries >= MAX_ATTEMPTS) {
      setStatus("revealed");
      setMessage(`Tidak apa-apa! Jawabannya ${revealText(q)}. Kita coba lagi lain kali, ya.`);
      record({ correctFirstTry: false, solved: false, attempts: tries });
    } else {
      setMessage(`Hampir! Petunjuk: ${q.hint}`);
    }
    return false;
  };

  const next = async () => {
    if (!last) {
      setIndex((i) => i + 1);
      setAttempts(0);
      setStatus("answering");
      setMessage("Soal berikutnya. Kamu pasti bisa!");
      return;
    }
    const before = garden;
    const outcome = await completeSession({ subject, grade: student.grade, results });
    setFinished({ outcome, before });
  };

  const speech = [{ text: q.prompt, lang: "id-ID" as const }, ...(q.say ? [{ text: q.say, lang: "en-US" as const }] : [])];
  const earned = results.reduce((n, r) => n + (r.solved ? 1 : 0) + (r.correctFirstTry ? 1 : 0), 0);

  return (
    <section>
      <div className="relative mt-2 mb-5 flex flex-wrap items-center gap-x-5 gap-y-2">
        <h1 className="font-display text-2xl font-semibold whitespace-nowrap text-daun-800 md:text-3xl">
          {meta.emoji} {meta.name}
        </h1>
        <ol className="order-last flex w-full gap-2 md:order-none md:w-auto md:flex-1" aria-label={`Soal ${index + 1} dari ${questions.length}`}>
          {questions.map((x, i) => (
            <li key={x.id} className={`h-3.5 flex-1 rounded-full ${i < index || (i === index && status !== "answering") ? "bg-daun-500" : i === index ? "bg-kunyit-400" : "bg-krem-tua"}`} />
          ))}
        </ol>
        <span className="ml-auto font-extrabold whitespace-nowrap text-tinta-redup md:ml-0">
          Soal {index + 1} dari {questions.length}
        </span>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="flex items-center gap-3 lg:sticky lg:top-28 lg:flex-col lg:text-center">
          <Mascot size={120} className="flex-none animate-sway max-lg:size-20" />
          <AnimatePresence mode="wait">
            <motion.p
              key={message}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              role="status"
              className="rounded-[22px] border-2 border-kunyit-400 bg-kunyit-100 px-4 py-3 text-left font-bold"
            >
              {message}
            </motion.p>
          </AnimatePresence>
          <p className="hidden text-sm font-extrabold text-tinta-redup lg:block">Poin sesi ini: {earned} 🌱</p>
        </aside>

        <AnimatePresence mode="wait">
          <motion.div key={`${round}-${q.id}`} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }}>
            <Card batik className="mb-6">
              <p className="text-xs font-extrabold tracking-wide text-tanah-500 uppercase">{q.topic}</p>
              <div className="mt-2 flex items-start justify-between gap-4">
                <h2 className="font-display text-2xl leading-tight font-semibold md:text-3xl">{q.prompt}</h2>
                <SpeakButton parts={speech} label="Bacakan soal" />
              </div>
              {q.image && (
                <p className="pt-4 pb-1 text-center text-6xl tracking-widest" aria-hidden="true">
                  {q.image}
                </p>
              )}
            </Card>

            <QuestionInput key={`${round}-${q.id}`} question={q} status={status} onAnswer={onAnswer} />

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <ButtonLink href="/kebun/" variant="ghost">
                Berhenti dulu
              </ButtonLink>
              {status !== "answering" && (
                <Button variant="kunyit" onClick={next} autoFocus>
                  {last ? "Lihat hasil" : "Soal berikutnya"}
                </Button>
              )}
            </div>
            <p className="mt-3 text-sm font-bold text-tinta-redup">Air dan pupuk ditambahkan ke tanaman setelah sesi selesai.</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

