"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import { Page } from "@/components/Page";
import { SpeakButton } from "@/components/SpeakButton";
import { PlantThumb } from "@/components/PlantVisual";
import { Card, Tag } from "@/components/ui";
import { PLANT_INFO, type ConservationStatus } from "@/data/plant-info";
import { PLANTS, REGIONS } from "@/data/plants";
import { Avatar } from "@/components/Ikon";
import { childHeight, formatSize, sizeComparison } from "@/lib/size";
import type { PlantSpecies, RegionId } from "@/lib/types";

export function KoleksiView() {
  const { garden } = useApp();
  const [filter, setFilter] = useState<RegionId | "semua">("semua");
  const [selected, setSelected] = useState<string | null>(
    garden?.collection.at(-1) ?? null,
  );
  if (!garden) return null;

  const plants = PLANTS.filter(
    (p) => filter === "semua" || p.region === filter,
  );
  const detail = PLANTS.find(
    (p) => p.id === selected && garden.collection.includes(p.id),
  );

  return (
    <Page
      title="Koleksi Tanaman Nusantara"
      subtitle={`${garden.collection.length} dari ${PLANTS.length} tanaman sudah kamu tumbuhkan.`}
    >
      <div className="grid items-start gap-5 lg:grid-cols-[1fr_380px]">
        <div>
          <div
            className="mb-3.5 flex flex-wrap gap-2"
            role="group"
            aria-label="Saring wilayah"
          >
            {[{ id: "semua" as const, name: "Semua" }, ...REGIONS].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setFilter(r.id)}
                aria-pressed={filter === r.id}
                className={`min-h-11 cursor-pointer rounded-full border-2 px-4 font-extrabold transition ${filter === r.id ? "border-daun-800 bg-daun-600 text-white" : "border-krem-tua hover:border-daun-300 bg-kartu"}`}
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
                  className={`before:border-tanah-300 enabled:hover:border-kunyit-400 bg-kartu relative rounded-3xl border-3 p-3 text-center transition before:pointer-events-none before:absolute before:inset-1.5 before:rounded-[18px] before:border-2 before:border-dashed enabled:cursor-pointer enabled:hover:-translate-y-1 enabled:hover:-rotate-1 ${selected === p.id && owned ? "border-kunyit-400" : "border-krem-tua"}`}
                >
                  <span
                    className={`bg-daun-100 bg-kawung grid h-28 place-items-center rounded-[18px] bg-size-[28px_28px] text-5xl ${owned ? "" : "opacity-30 brightness-35 grayscale"}`}
                  >
                    <PlantThumb plant={p} size={104} />
                  </span>
                  <b className="font-display mt-2 block">
                    {owned ? (
                      p.name
                    ) : (
                      <>
                        <span aria-hidden="true">???</span>
                        <span className="sr-only">Tanaman terkunci</span>
                      </>
                    )}
                  </b>
                  <small className="text-tinta-redup font-bold">
                    {region.name}
                  </small>
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={detail?.id ?? "kosong"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="lg:sticky lg:top-28"
          >
            <Card className="border-kunyit-400!">
              {detail ? (
                <>
                  <div className="bg-tanah-100 bg-kawung mb-3.5 grid h-48 place-items-center rounded-[22px] bg-size-[34px_34px]">
                    <PlantThumb plant={detail} size={180} />
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-display text-2xl font-semibold">
                        {detail.name}
                      </h2>
                      <i className="text-tinta-redup">{detail.latinName}</i>
                    </div>
                    <SpeakButton
                      parts={[
                        {
                          text: `${detail.name}. ${detail.fact} Status: ${PLANT_INFO[detail.id].statusLabel}. Manfaat: ${PLANT_INFO[detail.id].benefit}`,
                          lang: "id-ID",
                        },
                      ]}
                      label="Bacakan fakta"
                    />
                  </div>
                  <Tag className="mt-2.5">{detail.origin}</Tag>
                  <p className="mt-2 leading-relaxed">{detail.fact}</p>
                  <PlantDetails plant={detail} />
                </>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-6xl" aria-hidden="true">
                    🌱
                  </p>
                  <p className="font-display mt-3 text-xl font-semibold">
                    Belum ada tanaman yang berbunga
                  </p>
                  <p className="text-tinta-redup mt-1 font-bold">
                    Selesaikan sesi belajar agar tanaman pertamamu berbunga dan
                    masuk koleksi.
                  </p>
                </div>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </Page>
  );
}

const STATUS_STYLE: Record<ConservationStatus, string> = {
  dilindungi: "bg-tanah-100 text-tanah-700",
  langka: "bg-kunyit-100 text-tanah-700",
  umum: "bg-daun-100 text-daun-800",
};

const LABEL = "flex items-center gap-1.5 text-xs font-extrabold text-sogan";

/** Status konservasi, manfaat, dan perbandingan ukuran tanaman dengan tinggi anak. */
function PlantDetails({ plant }: { plant: PlantSpecies }) {
  const { student } = useApp();
  const info = PLANT_INFO[plant.id];
  const childCm = student ? childHeight(student) : 125;
  const max = Math.max(info.sizeCm, childCm);
  const bars: [React.ReactNode, string, number, string][] = [
    [
      student ? <Avatar emoji={student.avatar} /> : "🧒",
      "Kamu",
      childCm,
      "bg-langit-300",
    ],
    [plant.emoji, plant.name, info.sizeCm, "bg-daun-500"],
  ];
  return (
    <dl className="border-krem-tua mt-4 grid gap-3 border-t-3 pt-4">
      <div>
        <dt className={LABEL}>
          <span aria-hidden="true">🛡️</span> Status
        </dt>
        <dd className="mt-1">
          <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-sm font-extrabold ${STATUS_STYLE[info.status]}`}
          >
            {info.statusLabel}
          </span>
          {info.status !== "umum" && (
            <span className="text-tinta-redup mt-1 block text-sm font-semibold">
              Jangan dipetik atau ditebang, biarkan tumbuh di alam.
            </span>
          )}
        </dd>
      </div>
      <div>
        <dt className={LABEL}>
          <span aria-hidden="true">🌿</span> Manfaat
        </dt>
        <dd className="mt-1 font-semibold">{info.benefit}</dd>
      </div>
      <div>
        <dt className={LABEL}>
          <span aria-hidden="true">📏</span> Ukuran
        </dt>
        <dd className="mt-1">
          <span className="font-semibold">
            {info.sizeOf} sekitar {formatSize(info.sizeCm)},{" "}
            {sizeComparison(info.sizeCm, childCm)}.
          </span>
          <div className="mt-2 grid gap-1.5" aria-hidden="true">
            {bars.map(([icon, label, cm, color]) => (
              <div
                key={label}
                className="text-tinta-redup flex items-center gap-2 text-xs font-extrabold"
              >
                <span className="w-5 text-base">{icon}</span>
                <span className="bg-krem-tua h-3 flex-1 rounded-full">
                  <span
                    className={`block h-full rounded-full ${color}`}
                    style={{ width: `${Math.max(3, (cm / max) * 100)}%` }}
                  />
                </span>
                <span className="w-12 text-right">{formatSize(cm)}</span>
              </div>
            ))}
          </div>
        </dd>
      </div>
    </dl>
  );
}
