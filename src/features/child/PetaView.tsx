"use client";

import Image from "next/image";
import { Fragment, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { Page } from "@/components/Page";
import { PlantThumb } from "@/components/PlantVisual";
import { ButtonLink, Card, Tag } from "@/components/ui";
import { getPlant, REGIONS, stageLabel } from "@/data/plants";
import { bloomProgress, getRegionStatus, growthPoints, type RegionStatus } from "@/lib/garden";
import type { RegionId } from "@/lib/types";

// Peta: public/peta/peta.webp (aset peserta). Mask per wilayah dibuat otomatis dari bentuk daratan.
// box = kotak klik (persen), badge = posisi ikon gembok bawaan gambar yang ditutup lencana status.
const AREAS: Record<RegionId, { box: [number, number, number, number]; badge: [number, number] }> = {
  sumatra: { box: [3.5, 13.2, 24.3, 47.3], badge: [14.5, 29] },
  kalimantan: { box: [29, 17.1, 24.6, 35.7], badge: [36.65, 34.05] },
  sulawesi: { box: [54.7, 26, 12.6, 33.4], badge: [61.1, 36.9] },
  "maluku-papua": { box: [67.3, 16.1, 30.6, 53], badge: [77.25, 47.3] },
  jawa: { box: [21.8, 69.4, 25.6, 16], badge: [35.15, 78.7] },
  "bali-nusra": { box: [47.5, 73.5, 30, 17.4], badge: [57.15, 83.8] },
};

const DESC: Record<RegionId, string> = {
  sumatra: "Pulau dengan hutan hujan lebat, rumah bunga-bunga raksasa.",
  jawa: "Pulau terpadat di Indonesia, rumah melati dan edelweis.",
  kalimantan: "Hutan tropis luas dengan anggrek dan kantong semar.",
  sulawesi: "Pulau berbentuk unik, asal kayu eboni.",
  "bali-nusra": "Kepulauan asal kayu cendana yang harum.",
  "maluku-papua": "Kepulauan rempah dan buah matoa.",
};

// Warna pulau diganti lewat mix-blend "color": tekstur gambar tetap, warnanya berubah sesuai status.
const TINT: Record<RegionStatus, string | null> = { selesai: "bg-kunyit-400", aktif: "bg-daun-500", terkunci: null };
const BADGE: Record<RegionStatus, string> = { selesai: "✓", aktif: "📍", terkunci: "🔒" };

const maskStyle = (id: RegionId) => ({
  maskImage: `url(/peta/${id}.png)`,
  WebkitMaskImage: `url(/peta/${id}.png)`,
  maskSize: "100% 100%",
  WebkitMaskSize: "100% 100%",
});
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
          <div className="relative aspect-[1600/893] overflow-hidden rounded-[32px] border-3 border-langit-300 bg-langit-100">
            <Image src="/peta/peta.webp" alt="Peta kepulauan Indonesia" fill priority sizes="(min-width: 1024px) 860px, 100vw" />
            {REGIONS.map((r) => {
              const st = getRegionStatus(r, garden);
              const tint = TINT[st];
              return (
                <div key={r.id} aria-hidden="true">
                  {tint && <div className={`absolute inset-0 opacity-85 mix-blend-color ${tint}`} style={maskStyle(r.id)} />}
                  {r.id === selected && <div className="absolute inset-0 animate-pulse bg-white/20" style={maskStyle(r.id)} />}
                </div>
              );
            })}
            {REGIONS.map((r) => {
              const { box, badge } = AREAS[r.id];
              const st = getRegionStatus(r, garden);
              return (
                <Fragment key={r.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(r.id)}
                    aria-pressed={r.id === selected}
                    aria-label={`${r.name}, ${STATUS_LABEL[st]}`}
                    className="absolute cursor-pointer rounded-3xl focus-visible:outline-4 focus-visible:outline-kunyit-400"
                    style={{ left: `${box[0]}%`, top: `${box[1]}%`, width: `${box[2]}%`, height: `${box[3]}%` }}
                  />
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute grid size-[3.2%] min-h-6 min-w-6 -translate-1/2 place-items-center rounded-full border-2 bg-white text-[clamp(10px,1.4vw,18px)] font-bold shadow ${st === "aktif" ? "animate-bob border-daun-500" : st === "selesai" ? "border-kunyit-400 text-kunyit-600" : "border-krem-tua"}`}
                    style={{ left: `${badge[0]}%`, top: `${badge[1]}%` }}
                  >
                    {BADGE[st]}
                  </span>
                </Fragment>
              );
            })}
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
                  {collected || growing ? <PlantThumb plant={p} size={52} /> : "❔"}
                </span>
                <div>
                  <b className="font-display">{collected || growing ? p.name : "Tanaman rahasia"}</b>
                  <p className={`text-sm font-extrabold ${collected ? "text-kunyit-600" : growing ? "text-daun-600" : "text-tinta-redup"}`}>
                    {collected ? `Sudah ${stageLabel(p, "berbunga").toLowerCase()}` : growing ? `Sedang tumbuh, ${bloomProgress(growthPoints(garden))}%` : "Belum terbuka"}
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
