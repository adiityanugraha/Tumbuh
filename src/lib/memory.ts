import { shuffle } from "./session";

export interface MemoryCard {
  key: string;
  plantId: string;
  face: "gambar" | "nama";
}

/** Dua kartu per tanaman (gambar dan nama), diacak. */
export function createMemoryDeck(plantIds: string[], random: () => number = Math.random): MemoryCard[] {
  const cards = plantIds.flatMap((plantId) =>
    (["gambar", "nama"] as const).map((face) => ({ key: `${plantId}-${face}`, plantId, face })),
  );
  return shuffle(cards, random);
}

export const isPair = (a: MemoryCard, b: MemoryCard) => a.plantId === b.plantId && a.face !== b.face;
