import { describe, expect, it } from "vitest";
import { PLANT_ORDER, PLANTS, REGIONS } from "./plants";
import { QUESTION_BANK } from "./questions";
import type { Question } from "@/lib/types";

const MIN_PER_FILE = 15;

/** Pesan error bila soal tidak valid, null bila valid. Menjaga JSON tetap sesuai tipe Question. */
function invalid(q: Question): string | null {
  if (!q.id || !q.topic || !q.prompt || !q.hint) return "field wajib kosong";
  switch (q.type) {
    case "pilihan":
      if (q.options.length < 2) return "opsi kurang dari 2";
      if (new Set(q.options).size !== q.options.length) return "opsi duplikat";
      if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length) return "answer di luar opsi";
      return null;
    case "isian":
      return Number.isInteger(q.answer) ? null : "answer isian harus bilangan bulat";
    case "cocokkan": {
      if (q.pairs.length < 2) return "pasangan kurang dari 2";
      const rights = q.pairs.map((p) => p[1]);
      return new Set(rights).size === rights.length ? null : "sisi kanan duplikat";
    }
    case "urutkan":
      if (q.items.length < 2) return "item kurang dari 2";
      return new Set(q.items).size === q.items.length ? null : "item duplikat";
    default:
      return "tipe tidak dikenal";
  }
}

describe("bank soal", () => {
  const all = Object.entries(QUESTION_BANK).flatMap(([grade, subjects]) =>
    Object.entries(subjects).map(([subject, qs]) => ({ grade, subject, qs })),
  );

  it("ada 6 kelas x 3 mapel", () => {
    expect(all).toHaveLength(18);
  });

  it.each(all)("kelas $grade $subject valid dan cukup", ({ qs }) => {
    expect(qs.length).toBeGreaterThanOrEqual(MIN_PER_FILE);
    const errors = qs.map((q) => [q.id, invalid(q)]).filter(([, e]) => e);
    expect(errors).toEqual([]);
  });

  it("id soal unik di seluruh bank", () => {
    const ids = all.flatMap(({ qs }) => qs.map((q) => q.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("tanaman dan wilayah", () => {
  it("setiap tanaman ada di tepat satu wilayah yang cocok", () => {
    expect(PLANT_ORDER).toHaveLength(PLANTS.length);
    expect(new Set(PLANT_ORDER).size).toBe(PLANTS.length);
    for (const r of REGIONS) {
      for (const id of r.plantIds) expect(PLANTS.find((p) => p.id === id)?.region).toBe(r.id);
    }
  });
});
