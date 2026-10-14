"use client";

import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import { Page } from "@/components/Page";
import { SpeakButton } from "@/components/SpeakButton";
import { Button, Tag } from "@/components/ui";
import { VOCAB_DECKS } from "@/data/vocab";
import { shuffle } from "@/lib/session";

/** Flashcard kosakata Bahasa Inggris: ketuk kartu untuk membalik, tombol biru untuk mendengar lafalnya. */
export function KartuKataView() {
  const { student } = useApp();
  const suggested =
    VOCAB_DECKS.findLast((d) => d.grade <= (student?.grade ?? 1)) ??
    VOCAB_DECKS[0];
  const [deckId, setDeckId] = useState(suggested.id);
  const [order, setOrder] = useState(() => suggested.words.map((_, i) => i));
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const deck = VOCAB_DECKS.find((d) => d.id === deckId)!;
  const [emoji, word, meaning] = deck.words[order[pos]];

  const pickDeck = (id: string) => {
    const d = VOCAB_DECKS.find((x) => x.id === id)!;
    setDeckId(id);
    setOrder(d.words.map((_, i) => i));
    setPos(0);
    setFlipped(false);
  };
  const go = (step: number) => {
    setPos((p) => (p + step + order.length) % order.length);
    setFlipped(false);
  };

  return (
    <Page
      title="Kartu Kata"
      subtitle="Kenali kata Bahasa Inggris lewat gambar. Ketuk kartu untuk melihat artinya."
    >
      <div className="grid items-start gap-6 lg:grid-cols-[300px_1fr]">
        <nav
          aria-label="Pilih tema"
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:grid lg:px-0"
        >
          {VOCAB_DECKS.map((d) => (
            <button
              key={d.id}
              type="button"
              aria-pressed={d.id === deckId}
              onClick={() => pickDeck(d.id)}
              // Di HP daftar tema digeser ke samping: pastikan tema terpilih terlihat.
              ref={
                d.id === deckId
                  ? (el) =>
                      void (
                        el?.parentElement &&
                        (el.parentElement.scrollLeft = el.offsetLeft - 16)
                      )
                  : undefined
              }
              className={`flex min-h-14 flex-none cursor-pointer items-center gap-2.5 rounded-[20px] border-3 px-3 text-left font-extrabold whitespace-nowrap transition ${d.id === deckId ? "border-daun-600 bg-daun-100 text-daun-800" : "border-krem-tua hover:border-daun-300 bg-kartu"}`}
            >
              <span className="text-2xl" aria-hidden="true">
                {d.emoji}
              </span>
              <span className="flex-1 leading-tight">{d.name}</span>
              <Tag className="max-lg:hidden">Kelas {d.grade}</Tag>
            </button>
          ))}
        </nav>

        <div className="flex flex-col items-center gap-5">
          <div className="relative w-full max-w-md perspective-[1200px]">
            <button
              type="button"
              onClick={() => setFlipped((f) => !f)}
              className={`relative block aspect-[4/3] w-full cursor-pointer transition-transform duration-500 transform-3d motion-reduce:transition-none ${flipped ? "rotate-y-180" : ""}`}
            >
              <span
                aria-hidden={flipped}
                className="rounded-blob border-krem-tua bg-kartu absolute inset-0 flex flex-col items-center justify-center gap-2 border-3 backface-hidden"
              >
                <span className="text-8xl" aria-hidden="true">
                  {emoji}
                </span>
                <span className="font-display text-daun-800 text-5xl font-semibold">
                  {word}
                </span>
                <span className="text-tinta-redup text-sm font-bold">
                  Ketuk untuk melihat arti
                </span>
              </span>
              <span
                aria-hidden={!flipped}
                className="rounded-blob border-kunyit-400 bg-kunyit-100 bg-kawung absolute inset-0 flex rotate-y-180 flex-col items-center justify-center gap-2 border-3 backface-hidden"
              >
                <span className="text-6xl" aria-hidden="true">
                  {emoji}
                </span>
                <span className="font-display text-tanah-700 text-5xl font-semibold">
                  {meaning}
                </span>
                <span className="text-tinta-redup font-bold">{word}</span>
              </span>
            </button>
            <span className="absolute top-3 right-3">
              <SpeakButton
                parts={[{ text: word, lang: "en-US" }]}
                label={`Dengarkan ${word}`}
              />
            </span>
          </div>

          <div className="flex w-full max-w-md items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={() => go(-1)}
              aria-label="Kartu sebelumnya"
            >
              ◀
            </Button>
            <span className="font-display text-tinta-redup text-xl font-semibold">
              {pos + 1} / {order.length}
            </span>
            <Button
              variant="ghost"
              onClick={() => go(1)}
              aria-label="Kartu berikutnya"
            >
              ▶
            </Button>
          </div>
          <Button
            variant="kunyit"
            onClick={() => {
              setOrder(shuffle(order));
              setPos(0);
              setFlipped(false);
            }}
          >
            Acak kartu
          </Button>
        </div>
      </div>
    </Page>
  );
}
