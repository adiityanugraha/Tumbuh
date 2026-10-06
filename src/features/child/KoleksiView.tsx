"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import { Page } from "@/components/Page";
import { SpeakButton } from "@/components/SpeakButton";
import { Card, Tag } from "@/components/ui";
import { PLANTS, REGIONS } from "@/data/plants";
import type { RegionId } from "@/lib/types";

export function KoleksiView() {
  const { garden } = useApp();
  const [filter, setFilter] = useState<RegionId | "semua">("semua");
  const [selected, setSelected] = useState<string | null>(garden?.collection.at(-1) ?? null);
  if (!garden) return null;

  const plants = PLANTS.filter((p) => filter === "semua" || p.region === filter);
  const detail = PLANTS.find((p) => p.id === selected && garden.collection.includes(p.id));

  return (
    <Page title="Koleksi Tanaman Nusantara" subtitle={`${garden.collection.length} dari ${PLANTS.length} tanaman sudah kamu tumbuhkan.`}>
      <div className="grid items-start gap-5 lg:grid-cols-[1fr_380px]">
        <div>
          <div className="mb-3.5 flex flex-wrap gap-2" role="group" aria-label="Saring wilayah">
            {[{ id: "semua" as const, name: "Semua" }, ...REGIONS].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setFilter(r.id)}
                aria-pressed={filter === r.id}
                className={`min-h-11 cursor-pointer rounded-full border-2 px-4 font-extrabold transition ${filter === r.id ? "border-daun-800 bg-daun-600 text-white" : "border-krem-tua bg-white hover:border-daun-300"}`}
              >
                {r.name}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-[repeat(auto-fill,minmax(170px,1fr))]">
            {plants.map((p) => {
              const owned = garden.collection.includes(p.id);
              const region = REGIONS.find((r) => r.id === p.region)!;
              return (
                <button
                  key={p.id}
                  type="button"
                  disabled={!owned}
                  onClick={() => setSelected(p.id)}
                  aria-pressed={selected === p.id}
                  aria-label={owned ? p.name : `Tanaman terkunci dari ${region.name}`}
                  className={`relative rounded-3xl border-3 bg-white p-3 text-center transition before:pointer-events-none before:absolute before:inset-1.5 before:rounded-[18px] before:border-2 before:border-dashed before:border-tanah-300 enabled:cursor-pointer enabled:hover:-translate-y-1 enabled:hover:-rotate-1 enabled:hover:border-kunyit-400 ${selected === p.id && owned ? "border-kunyit-400" : "border-krem-tua"}`}
                >
                  <span className={`grid h-28 place-items-center rounded-[18px] bg-daun-100 bg-kawung bg-size-[28px_28px] text-5xl ${owned ? "" : "opacity-30 brightness-35 grayscale"}`}>
                    {/* PLACEHOLDER: emoji diganti ilustrasi SVG di Fase 4 */}
                    {p.emoji}
                  </span>
                  <b className="mt-2 block font-display">{owned ? p.name : "???"}</b>
                  <small className="font-bold text-tinta-redup">{region.name}</small>
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={detail?.id ?? "kosong"} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="lg:sticky lg:top-28">
            <Card className="border-kunyit-400!">
              {detail ? (
                <>
                  <div className="mb-3.5 grid h-48 place-items-center rounded-[22px] bg-tanah-100 bg-kawung bg-size-[34px_34px] text-8xl">{detail.emoji}</div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-display text-2xl font-semibold">{detail.name}</h2>
                      <i className="text-tinta-redup">{detail.latinName}</i>
                    </div>
                    <SpeakButton parts={[{ text: `${detail.name}. ${detail.fact}`, lang: "id-ID" }]} label="Bacakan fakta" />
                  </div>
                  <Tag className="mt-2.5">{detail.origin}</Tag>
                  <p className="mt-2 leading-relaxed">{detail.fact}</p>
                </>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-6xl" aria-hidden="true">🌱</p>
                  <p className="mt-3 font-display text-xl font-semibold">Belum ada tanaman yang berbunga</p>
                  <p className="mt-1 font-bold text-tinta-redup">Selesaikan sesi belajar agar tanaman pertamamu berbunga dan masuk koleksi.</p>
                </div>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </Page>
  );
}
