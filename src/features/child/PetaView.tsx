"use client";

import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import { Page } from "@/components/Page";
import { ButtonLink, Card, Tag } from "@/components/ui";
import { getPlant, REGIONS } from "@/data/plants";
import { bloomProgress, getRegionStatus, growthPoints, type RegionStatus } from "@/lib/garden";
import type { RegionId } from "@/lib/types";

// PLACEHOLDER: posisi dan bentuk pulau masih sketsa (persen terhadap kotak peta 16:9).
const ISLANDS: Record<RegionId, { left: string; top: string; width: string; height: string; rotate?: number }> = {
  sumatra: { left: "4%", top: "8%", width: "21%", height: "58%", rotate: -38 },
  jawa: { left: "25%", top: "74%", width: "25%", height: "10%" },
  kalimantan: { left: "32%", top: "14%", width: "19%", height: "42%" },
  sulawesi: { left: "56%", top: "18%", width: "10%", height: "44%" },
  "bali-nusra": { left: "52%", top: "82%", width: "20%", height: "8%" },
  "maluku-papua": { left: "71%", top: "30%", width: "26%", height: "36%" },
};

const DESC: Record<RegionId, string> = {
  sumatra: "Pulau dengan hutan hujan lebat, rumah bunga-bunga raksasa.",
  jawa: "Pulau terpadat di Indonesia, rumah melati dan edelweis.",
  kalimantan: "Hutan tropis luas dengan anggrek dan kantong semar.",
  sulawesi: "Pulau berbentuk unik, asal kayu eboni.",
  "bali-nusra": "Kepulauan asal kayu cendana yang harum.",
  "maluku-papua": "Kepulauan rempah dan buah matoa.",
};

const FILL: Record<RegionStatus, string> = {
  selesai: "bg-kunyit-400 text-tinta",
  aktif: "bg-daun-500 text-white",
  terkunci: "bg-kunci text-tinta-redup",
};
const STATUS_LABEL: Record<RegionStatus, string> = { selesai: "Selesai", aktif: "Sedang dijelajah", terkunci: "Terkunci" };

export function PetaView() {
  const { garden } = useApp();
  const active = garden ? (REGIONS.find((r) => getRegionStatus(r, garden) === "aktif") ?? REGIONS[0]) : REGIONS[0];
  const [selected, setSelected] = useState<RegionId>(active.id);
  if (!garden) return null;

  const region = REGIONS.find((r) => r.id === selected)!;
  const status = getRegionStatus(region, garden);
  const index = REGIONS.indexOf(region);

  return (
    <Page
      title="Peta Nusantara"
      subtitle="Tumbuhkan tanaman untuk membuka pulau berikutnya, dari barat ke timur."
      aside={
        <span className="rounded-full border-2 border-tanah-300 bg-tanah-100 px-3.5 py-1.5 font-display text-lg font-semibold text-tanah-700">
          🌸 {garden.collection.length} / 12 tanaman
        </span>
      }
    >
      <div className="grid items-start gap-5 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="relative aspect-video overflow-hidden rounded-[32px] border-3 border-langit-300 bg-langit-100">
            <div className="absolute inset-0 bg-[repeating-radial-gradient(circle_at_40%_45%,transparent_0_18px,rgb(47_128_201/0.07)_18px_20px)]" />
            {REGIONS.map((r) => {
              const pos = ISLANDS[r.id];
              const st = getRegionStatus(r, garden);
              const isSel = r.id === selected;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelected(r.id)}
                  aria-pressed={isSel}
                  aria-label={`${r.name}, ${STATUS_LABEL[st]}`}
                  className="group absolute grid cursor-pointer place-items-center"
                  style={{ left: pos.left, top: pos.top, width: pos.width, height: pos.height, rotate: `${pos.rotate ?? 0}deg` }}
                >
                  <span
                    className={`absolute inset-0 rounded-[46%_54%_40%_60%/55%_45%_55%_45%] shadow-[0_5px_0_rgb(0_0_0/0.14)] transition group-hover:scale-105 ${FILL[st]} ${isSel ? "scale-105 ring-5 ring-kunyit-400" : ""}`}
                  />
                  <span className={`relative px-1 text-center font-display text-xs leading-tight font-semibold sm:text-base ${FILL[st].split(" ")[1]}`} style={{ rotate: `${-(pos.rotate ?? 0)}deg` }}>
                    {st === "terkunci" ? "🔒 " : ""}
                    {r.name}
                  </span>
                </button>
              );
            })}
            {(() => {
              const pos = ISLANDS[active.id];
              return (
                <span className="pointer-events-none absolute animate-bob text-3xl" style={{ left: `calc(${pos.left} + ${pos.width} / 2)`, top: `calc(${pos.top} - 2%)` }} aria-hidden="true">
                  📍
                </span>
              );
            })()}
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-sm font-extrabold text-tinta-redup">
            <span><i className="mr-1.5 inline-block size-3.5 rounded bg-daun-500 align-[-2px]" />Sedang dijelajah</span>
            <span><i className="mr-1.5 inline-block size-3.5 rounded bg-kunyit-400 align-[-2px]" />Selesai</span>
            <span><i className="mr-1.5 inline-block size-3.5 rounded bg-kunci align-[-2px]" />Terkunci</span>
          </div>
        </div>

        <Card batik>
          <Tag>
            Wilayah {index + 1} dari {REGIONS.length} · {STATUS_LABEL[status]}
          </Tag>
          <h2 className="mt-2 font-display text-3xl font-semibold">{region.name}</h2>
          <p className="font-bold text-tinta-redup">{DESC[region.id]}</p>
          {region.plantIds.map((id) => {
            const p = getPlant(id)!;
            const collected = garden.collection.includes(id);
            const growing = !collected && garden.activePlantId === id;
            return (
              <div key={id} className={`mt-2.5 flex items-center gap-3 rounded-[18px] bg-krem p-2.5 ${!collected && !growing ? "opacity-60" : ""}`}>
                <span className={`grid size-14 flex-none place-items-center rounded-2xl bg-daun-100 bg-kawung bg-size-[22px_22px] text-3xl ${!collected && !growing ? "grayscale" : ""}`}>
                  {collected || growing ? p.emoji : "❔"}
                </span>
                <div>
                  <b className="font-display">{collected || growing ? p.name : "Tanaman rahasia"}</b>
                  <p className={`text-sm font-extrabold ${collected ? "text-kunyit-600" : growing ? "text-daun-600" : "text-tinta-redup"}`}>
                    {collected ? "Sudah berbunga" : growing ? `Sedang tumbuh, ${bloomProgress(growthPoints(garden))}%` : "Belum terbuka"}
                  </p>
                </div>
              </div>
            );
          })}
          {status === "aktif" && (
            <ButtonLink href="/belajar/" className="mt-4 w-full">
              Belajar untuk {region.name}
            </ButtonLink>
          )}
        </Card>
      </div>
    </Page>
  );
}
