"use client";

import { useRef, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { Mascot } from "@/components/art";
import { Page } from "@/components/Page";
import { PlantThumb } from "@/components/PlantVisual";
import { Button, ButtonLink, Card } from "@/components/ui";
import { getPlant, PLANT_ORDER, REGIONS } from "@/data/plants";
import { getRegionStatus } from "@/lib/garden";
import { createMemoryDeck, isPair, type MemoryCard } from "@/lib/memory";
import { shuffle } from "@/lib/session";
import { playCelebrate, playCorrect } from "@/lib/sound";

const PAIRS = 6;
const newDeck = () => createMemoryDeck(shuffle(PLANT_ORDER).slice(0, PAIRS));
const regionName = (plantId: string) =>
  REGIONS.find((r) => r.id === getPlant(plantId)?.region)?.name;

/** Permainan memori: pasangkan gambar tanaman dengan namanya. Terbuka setelah 1 wilayah selesai. */
export function MemoriView() {
  const { garden } = useApp();
  const [deck, setDeck] = useState(newDeck);
  const [open, setOpen] = useState<MemoryCard[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  if (!garden) return null;

  const unlocked = REGIONS.some(
    (r) => getRegionStatus(r, garden) === "selesai",
  );
  if (!unlocked) {
    return (
      <Page title="Memori Nusantara">
        <Card batik className="mx-auto max-w-lg text-center">
          <Mascot size={110} className="mx-auto" />
          <h2 className="font-display mt-2 text-2xl font-semibold">
            Permainan masih terkunci
          </h2>
          <p className="text-tinta-redup mt-2 font-bold">
            Tumbuhkan semua tanaman di satu wilayah peta untuk membuka permainan
            ini.
          </p>
          <ButtonLink href="/peta/" className="mt-5">
            Lihat Peta
          </ButtonLink>
        </Card>
      </Page>
    );
  }

  const won = matched.size === deck.length;

  const flip = (card: MemoryCard) => {
    if (
      open.length === 2 ||
      matched.has(card.key) ||
      open.some((c) => c.key === card.key)
    )
      return;
    if (open.length === 0) return setOpen([card]);
    const [first] = open;
    setMoves((m) => m + 1);
    if (isPair(first, card)) {
      const next = new Set(matched).add(first.key).add(card.key);
      setMatched(next);
      setOpen([]);
      if (next.size === deck.length) playCelebrate();
      else playCorrect();
      return;
    }
    setOpen([first, card]);
    timer.current = setTimeout(() => setOpen([]), 900);
  };

  const restart = () => {
    clearTimeout(timer.current);
    setDeck(newDeck());
    setOpen([]);
    setMatched(new Set());
    setMoves(0);
  };

  return (
    <Page
      title="Memori Nusantara"
      subtitle="Buka dua kartu. Pasangkan gambar tanaman dengan namanya!"
      aside={
        <span className="font-display text-tinta-redup text-xl font-semibold">
          Langkah: {moves}
        </span>
      }
    >
      {won && (
        <Card batik className="mb-5 flex flex-wrap items-center gap-4">
          <span className="text-4xl" aria-hidden="true">
            🎉
          </span>
          <p
            className="font-display flex-1 text-xl font-semibold"
            role="status"
          >
            Hebat! Semua pasangan ketemu dalam {moves} langkah.
          </p>
          <Button variant="kunyit" onClick={restart}>
            Main lagi
          </Button>
        </Card>
      )}
      <ul className="mx-auto grid max-w-5xl grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {deck.map((card) => {
          const plant = getPlant(card.plantId)!;
          const shown =
            matched.has(card.key) || open.some((c) => c.key === card.key);
          return (
            <li key={card.key}>
              <button
                type="button"
                onClick={() => flip(card)}
                aria-label={
                  !shown
                    ? "Kartu tertutup"
                    : card.face === "gambar"
                      ? `Gambar ${plant.name}`
                      : undefined
                }
                className={`grid aspect-square w-full cursor-pointer place-items-center rounded-[22px] border-3 p-2 text-center transition ${
                  matched.has(card.key)
                    ? "border-daun-300 bg-daun-100"
                    : shown
                      ? "border-kunyit-400 bg-kartu"
                      : "border-kunyit-400 bg-kunyit-100 bg-kawung hover:-translate-y-1"
                }`}
              >
                {!shown ? (
                  <span
                    className="font-display text-tanah-700 text-4xl font-semibold"
                    aria-hidden="true"
                  >
                    ?
                  </span>
                ) : card.face === "gambar" ? (
                  <PlantThumb plant={plant} size={110} />
                ) : (
                  <span>
                    <span className="font-display block text-lg leading-tight font-semibold md:text-xl">
                      {plant.name}
                    </span>
                    <span className="text-tinta-redup mt-1 block text-xs font-bold md:text-sm">
                      {regionName(plant.id)}
                    </span>
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      {!won && (
        <p className="mt-4 text-center">
          <button
            type="button"
            onClick={restart}
            className="text-sogan min-h-10 cursor-pointer font-bold underline"
          >
            Acak ulang kartu
          </button>
        </p>
      )}
    </Page>
  );
}
