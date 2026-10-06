"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { Button } from "@/components/ui";
import { shuffle, type AnswerValue } from "@/lib/session";
import type { ChoiceQuestion, MatchQuestion, NumberQuestion, OrderQuestion, Question } from "@/lib/types";

/** Status soal dari induk: masih menjawab, sudah benar, atau jawaban ditunjukkan setelah 3 kali salah. */
export type QuestionStatus = "answering" | "correct" | "revealed";

interface InputProps<Q> {
  question: Q;
  status: QuestionStatus;
  /** Mengembalikan true bila jawaban benar. */
  onAnswer: (value: AnswerValue) => boolean;
}

const chip = "min-h-14 cursor-pointer rounded-2xl border-3 px-4 font-display text-xl font-semibold transition";
const chipIdle = "border-krem-tua bg-white shadow-krem hover:-translate-y-0.5 hover:border-langit-300";
const chipRight = "border-daun-500 bg-daun-100";

/** Mengacak sekali per soal (komponen di-remount lewat key saat soal berganti). */
function useShuffled<T>(items: T[]) {
  const [order] = useState(() => shuffle(items));
  return order;
}

export function QuestionInput({ question, status, onAnswer }: InputProps<Question>) {
  switch (question.type) {
    case "pilihan":
      return <Choice question={question} status={status} onAnswer={onAnswer} />;
    case "isian":
      return <NumberInput question={question} status={status} onAnswer={onAnswer} />;
    case "cocokkan":
      return <Match question={question} status={status} onAnswer={onAnswer} />;
    case "urutkan":
      return <Order question={question} status={status} onAnswer={onAnswer} />;
  }
}

function Choice({ question, status, onAnswer }: InputProps<ChoiceQuestion>) {
  const order = useShuffled(question.options.map((_, i) => i));
  const [wrong, setWrong] = useState<number[]>([]);
  const done = status !== "answering";
  return (
    <div className={`grid gap-3.5 ${question.options.length > 3 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
      {order.map((i) => {
        const isAnswer = i === question.answer;
        const isWrong = wrong.includes(i);
        return (
          <motion.button
            key={i}
            type="button"
            disabled={done || isWrong}
            onClick={() => !onAnswer(i) && setWrong((w) => [...w, i])}
            animate={done && isAnswer ? { scale: [1, 1.06, 1] } : isWrong ? { x: [0, -6, 6, 0] } : {}}
            transition={{ duration: 0.35 }}
            className={`min-h-16 cursor-pointer rounded-3xl border-3 px-4 font-display text-2xl font-semibold transition disabled:cursor-default sm:min-h-24 sm:text-3xl ${
              done && isAnswer ? `${chipRight} shadow-[0_5px_0_var(--color-daun-500)]` : isWrong ? "border-tanah-300 bg-tanah-100 opacity-70" : chipIdle
            }`}
          >
            {question.options[i]}
          </motion.button>
        );
      })}
    </div>
  );
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "-", "0", "⌫"];

function NumberInput({ question, status, onAnswer }: InputProps<NumberQuestion>) {
  const [value, setValue] = useState("");
  const [shake, setShake] = useState(0);
  const done = status !== "answering";
  const press = (k: string) => {
    if (k === "⌫") return setValue((v) => v.slice(0, -1));
    if (k === "-") return setValue((v) => (v.startsWith("-") ? v.slice(1) : `-${v}`));
    setValue((v) => (v.replace("-", "").length >= 6 ? v : v + k));
  };
  const submit = () => {
    if (!value || value === "-") return;
    if (!onAnswer(Number(value))) {
      setValue("");
      setShake((s) => s + 1);
    }
  };
  const shown = done && status === "revealed" ? String(question.answer) : value;
  return (
    <div className="mx-auto grid w-full max-w-sm gap-3">
      <motion.output
        key={shake}
        animate={shake ? { x: [0, -8, 8, 0] } : {}}
        aria-live="polite"
        className={`grid min-h-18 place-items-center rounded-3xl border-3 font-display text-4xl font-semibold ${done ? chipRight : "border-krem-tua bg-white"}`}
      >
        {shown || <span className="text-xl text-tinta-redup">Ketik jawabanmu</span>}
      </motion.output>
      {!done && (
        <>
          <div className="grid grid-cols-3 gap-2">
            {KEYS.map((k) => (
              <button key={k} type="button" onClick={() => press(k)} aria-label={k === "⌫" ? "Hapus" : k === "-" ? "Tanda minus" : k} className={`${chip} ${chipIdle}`}>
                {k}
              </button>
            ))}
          </div>
          <Button variant="kunyit" onClick={submit} disabled={!value || value === "-"}>
            Cek jawaban
          </Button>
        </>
      )}
    </div>
  );
}

function Match({ question, status, onAnswer }: InputProps<MatchQuestion>) {
  const rights = useShuffled(question.pairs.map(([, r]) => r));
  const [picked, setPicked] = useState<number | null>(null);
  const [pairs, setPairs] = useState<(string | null)[]>(() => question.pairs.map(() => null));
  const done = status !== "answering";
  const shown = done ? question.pairs.map(([, r]) => r) : pairs;

  const chooseRight = (r: string) => {
    if (picked === null) return;
    setPairs((p) => p.map((x, i) => (i === picked ? r : x === r ? null : x)));
    setPicked(null);
  };
  const submit = () => {
    if (!onAnswer(pairs as string[])) setPairs(question.pairs.map(() => null));
  };
  const complete = pairs.every(Boolean);

  return (
    <div className="grid gap-4">
      <p className="text-center font-bold text-tinta-redup">{done ? "Pasangan yang benar:" : "Klik kotak kiri, lalu pilih pasangannya di kanan."}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-2.5">
          {question.pairs.map(([left], i) => (
            <button
              key={left}
              type="button"
              disabled={done}
              onClick={() => setPicked(i)}
              aria-pressed={picked === i}
              className={`${chip} flex items-center justify-between gap-2 text-left ${picked === i ? "border-langit-500 bg-langit-100" : shown[i] ? chipRight : chipIdle}`}
            >
              <span>{left}</span>
              <span className="text-base text-daun-800">{shown[i] ? `= ${shown[i]}` : "?"}</span>
            </button>
          ))}
        </div>
        {!done && (
          <div className="grid gap-2.5">
            {rights.map((r) => {
              const used = pairs.includes(r);
              return (
                <button key={r} type="button" onClick={() => chooseRight(r)} disabled={picked === null} className={`${chip} ${used ? "border-daun-300 bg-daun-50 text-tinta-redup" : chipIdle} disabled:cursor-not-allowed`}>
                  {r}
                </button>
              );
            })}
          </div>
        )}
      </div>
      {!done && (
        <Button variant="kunyit" onClick={submit} disabled={!complete} className="justify-self-center">
          Cek jawaban
        </Button>
      )}
    </div>
  );
}

function Order({ question, status, onAnswer }: InputProps<OrderQuestion>) {
  const pool = useShuffled(question.items);
  const [chosen, setChosen] = useState<string[]>([]);
  const done = status !== "answering";
  const shown = done ? question.items : chosen;
  const submit = () => {
    if (!onAnswer(chosen)) setChosen([]);
  };
  return (
    <div className="grid gap-4">
      <p className="text-center font-bold text-tinta-redup">{done ? "Urutan yang benar:" : "Klik kotak sesuai urutan. Klik lagi untuk membatalkan."}</p>
      <ol className="flex min-h-18 flex-wrap items-center justify-center gap-2 rounded-3xl border-3 border-dashed border-krem-tua bg-krem p-3">
        {shown.map((item, i) => (
          <li key={item}>
            <button
              type="button"
              disabled={done}
              onClick={() => setChosen((c) => c.filter((x) => x !== item))}
              className={`${chip} ${chipRight} disabled:cursor-default`}
            >
              <span className="mr-1.5 text-base text-daun-800">{i + 1}.</span>
              {item}
            </button>
          </li>
        ))}
        {shown.length === 0 && <li className="font-bold text-tinta-redup">Urutanmu muncul di sini</li>}
      </ol>
      {!done && (
        <>
          <div className="flex flex-wrap justify-center gap-2">
            {pool
              .filter((item) => !chosen.includes(item))
              .map((item) => (
                <button key={item} type="button" onClick={() => setChosen((c) => [...c, item])} className={`${chip} ${chipIdle}`}>
                  {item}
                </button>
              ))}
          </div>
          <Button variant="kunyit" onClick={submit} disabled={chosen.length !== question.items.length} className="justify-self-center">
            Cek jawaban
          </Button>
        </>
      )}
    </div>
  );
}
