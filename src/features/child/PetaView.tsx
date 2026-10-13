"use client";

import Image from "next/image";
import { Fragment, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { Page } from "@/components/Page";
import { SpeakButton } from "@/components/SpeakButton";
import { PlantThumb } from "@/components/PlantVisual";
import { ButtonLink, Card, Tag } from "@/components/ui";
import { CULTURE } from "@/data/culture";
import { getPlant, REGIONS, stageLabel } from "@/data/plants";
import {
  bloomProgress,
  getRegionStatus,
  growthPoints,
  type RegionStatus,
} from "@/lib/garden";
import type { Garden, RegionId } from "@/lib/types";

// Peta: public/peta/peta.webp (aset peserta). Mask per wilayah dibuat otomatis dari bentuk daratan.
// box = kotak klik (persen), badge = posisi ikon gembok bawaan gambar yang ditutup lencana status,
// boat = titik laut di dekat wilayah tempat perahu Kumbi berlabuh.
type Pt = [number, number];
const AREAS: Record<
  RegionId,
  { box: [number, number, number, number]; badge: Pt; boat: Pt }
> = {
  sumatra: { box: [3.5, 13.2, 24.3, 47.3], badge: [14.5, 29], boat: [8, 66] },
  kalimantan: {
    box: [29, 17.1, 24.6, 35.7],
    badge: [36.65, 34.05],
    boat: [44, 66],
  },
  sulawesi: {
    box: [54.7, 26, 12.6, 33.4],
    badge: [61.1, 36.9],
    boat: [64, 74],
  },
  "maluku-papua": {
    box: [67.3, 16.1, 30.6, 53],
    badge: [77.25, 47.3],
    boat: [87, 86],
  },
  jawa: { box: [21.8, 69.4, 25.6, 16], badge: [35.15, 78.7], boat: [52, 68] },
  "bali-nusra": {
    box: [47.5, 73.5, 30, 17.4],
    badge: [57.15, 83.8],
    boat: [50, 97],
  },
};
const W = 1600;
const H = 893; // ukuran gambar peta, dipakai sebagai viewBox agar SVG jalur tidak gepeng

const DESC: Record<RegionId, string> = {
  sumatra: "Pulau dengan hutan hujan lebat, rumah bunga-bunga raksasa.",
  jawa: "Pulau terpadat di Indonesia, rumah melati dan edelweis.",
  kalimantan: "Hutan tropis luas dengan anggrek dan kantong semar.",
  sulawesi: "Pulau berbentuk unik, asal kayu eboni.",
  "bali-nusra": "Kepulauan asal kayu cendana yang harum.",
  "maluku-papua": "Kepulauan rempah dan buah matoa.",
};

// Warna pulau diganti lewat mix-blend "color": tekstur gambar tetap, warnanya berubah sesuai status.
const TINT: Record<RegionStatus, string | null> = {
  selesai: "bg-kunyit-400",
  aktif: "bg-daun-500",
  terkunci: null,
};
const BADGE: Record<RegionStatus, string> = {
  selesai: "✓",
  aktif: "📍",
  terkunci: "🔒",
};

const maskStyle = (id: RegionId) => ({
  maskImage: `url(/peta/${id}.png)`,
  WebkitMaskImage: `url(/peta/${id}.png)`,
  maskSize: "100% 100%",
  WebkitMaskSize: "100% 100%",
});
const STATUS_LABEL: Record<RegionStatus, string> = {
  selesai: "Selesai",
  aktif: "Sedang dijelajah",
  terkunci: "Terkunci",
};

export function PetaView() {
  const { garden } = useApp();
  const active = garden
    ? (REGIONS.find((r) => getRegionStatus(r, garden) === "aktif") ??
      REGIONS[0])
    : REGIONS[0];
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
        <span className="border-tanah-300 bg-tanah-100 font-display text-tanah-700 rounded-full border-2 px-3.5 py-1.5 text-lg font-semibold">
          🌸 {garden.collection.length} / 12 tanaman
        </span>
      }
    >
      <div className="grid items-start gap-5 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0">
          <div className="border-langit-300 bg-langit-100 relative aspect-[1600/893] overflow-hidden rounded-[32px] border-3">
            <Image
              src="/peta/peta.webp"
              alt="Peta kepulauan Indonesia"
              fill
              priority
              className="object-cover"
              sizes="(min-width: 1024px) 860px, 100vw"
            />
            <Sea />
            {REGIONS.map((r) => {
              const st = getRegionStatus(r, garden);
              const tint = TINT[st];
              return (
                <div key={r.id} aria-hidden="true">
                  {tint && (
                    <div
                      className={`absolute inset-0 opacity-85 mix-blend-color ${tint}`}
                      style={maskStyle(r.id)}
                    />
                  )}
                  {r.id === selected && (
                    <div
                      className="absolute inset-0 animate-pulse bg-kartu/20"
                      style={maskStyle(r.id)}
                    />
                  )}
                </div>
              );
            })}
            <Route garden={garden} />
            <KumbiBoat
              at={
                AREAS[
                  (
                    REGIONS.find(
                      (r) => getRegionStatus(r, garden) === "aktif",
                    ) ?? REGIONS.at(-1)!
                  ).id
                ].boat
              }
            />
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
                    className="focus-visible:outline-kunyit-400 absolute cursor-pointer rounded-3xl focus-visible:outline-4"
                    style={{
                      left: `${box[0]}%`,
                      top: `${box[1]}%`,
                      width: `${box[2]}%`,
                      height: `${box[3]}%`,
                    }}
                  />
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute grid size-[3.2%] min-h-6 min-w-6 -translate-1/2 place-items-center rounded-full border-2 bg-kartu text-[clamp(10px,1.4vw,18px)] font-bold shadow ${st === "aktif" ? "animate-bob border-daun-500" : st === "selesai" ? "border-kunyit-400 text-kunyit-600" : "border-krem-tua"}`}
                    style={{ left: `${badge[0]}%`, top: `${badge[1]}%` }}
                  >
                    {BADGE[st]}
                  </span>
                </Fragment>
              );
            })}
          </div>
          <div className="text-tinta-redup mt-3 flex flex-wrap gap-4 text-sm font-extrabold">
            <span>
              <i className="bg-daun-500 mr-1.5 inline-block size-3.5 rounded align-[-2px]" />
              Sedang dijelajah
            </span>
            <span>
              <i className="bg-kunyit-400 mr-1.5 inline-block size-3.5 rounded align-[-2px]" />
              Selesai
            </span>
            <span>
              <i className="bg-kunci mr-1.5 inline-block size-3.5 rounded align-[-2px]" />
              Terkunci
            </span>
          </div>
          <Timeline
            garden={garden}
            selected={selected}
            onSelect={setSelected}
          />
        </div>

        <Card batik>
          <Tag>
            Wilayah {index + 1} dari {REGIONS.length} · {STATUS_LABEL[status]}
          </Tag>
          <h2 className="font-display mt-2 text-3xl font-semibold">
            {region.name}
          </h2>
          <p className="text-tinta-redup font-bold">{DESC[region.id]}</p>
          {region.plantIds.map((id) => {
            const p = getPlant(id)!;
            const collected = garden.collection.includes(id);
            const growing = !collected && garden.activePlantId === id;
            return (
              <div
                key={id}
                className={`bg-krem mt-2.5 flex items-center gap-3 rounded-[18px] p-2.5 ${!collected && !growing ? "opacity-60" : ""}`}
              >
                <span
                  className={`bg-daun-100 bg-kawung grid size-14 flex-none place-items-center rounded-2xl bg-size-[22px_22px] text-3xl ${!collected && !growing ? "grayscale" : ""}`}
                >
                  {collected || growing ? (
                    <PlantThumb plant={p} size={52} />
                  ) : (
                    "❔"
                  )}
                </span>
                <div>
                  <b className="font-display">
                    {collected || growing ? p.name : "Tanaman rahasia"}
                  </b>
                  <p
                    className={`text-sm font-extrabold ${collected ? "text-kunyit-600" : growing ? "text-daun-600" : "text-tinta-redup"}`}
                  >
                    {collected
                      ? `Sudah ${stageLabel(p, "berbunga").toLowerCase()}`
                      : growing
                        ? `Sedang tumbuh, ${bloomProgress(growthPoints(garden))}%`
                        : "Belum terbuka"}
                  </p>
                </div>
              </div>
            );
          })}
          <Culture id={region.id} locked={status === "terkunci"} />
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

/** Garis perjalanan antarwilayah sesuai urutan buka. Ruas yang sudah dilalui berwarna kunyit. */
function Route({ garden }: { garden: Garden }) {
  const pts = REGIONS.map(
    (r) => AREAS[r.id].badge.map((v, i) => (v / 100) * (i ? H : W)) as Pt,
  );
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="pointer-events-none absolute inset-0 size-full"
      aria-hidden="true"
    >
      {pts.slice(1).map(([x2, y2], i) => {
        const [x1, y1] = pts[i];
        // Lengkung kecil: titik kendali digeser tegak lurus dari tengah ruas.
        const mx = (x1 + x2) / 2 - (y2 - y1) * 0.18;
        const my = (y1 + y2) / 2 + (x2 - x1) * 0.18;
        const done = getRegionStatus(REGIONS[i], garden) === "selesai";
        return (
          <path
            key={i}
            d={`M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`}
            fill="none"
            stroke={done ? "var(--color-kunyit-400)" : "white"}
            strokeWidth={done ? 7 : 5}
            strokeDasharray={done ? undefined : "4 14"}
            strokeLinecap="round"
            opacity={done ? 0.95 : 0.85}
          />
        );
      })}
    </svg>
  );
}

/** Kumbi naik perahu di dekat wilayah yang sedang dijelajah. */
function KumbiBoat({ at }: { at: Pt }) {
  // Ombak di bagian bawah gambar diletakkan tepat di titik laut, jadi digeser naik 80%.
  return (
    <Image
      src="/peta/kumbi-perahu.webp"
      alt=""
      width={386}
      height={400}
      className="motion-safe:animate-bob pointer-events-none absolute w-[7%] -translate-x-1/2 -translate-y-[80%]"
      style={{ left: `${at[0]}%`, top: `${at[1]}%` }}
    />
  );
}

const SEA: { at: Pt; text: string; cls: string; delay?: string }[] = [
  {
    at: [24, 6],
    text: "☁️",
    cls: "text-[clamp(18px,3vw,40px)] motion-safe:animate-drift",
  },
  {
    at: [60, 5],
    text: "☁️",
    cls: "text-[clamp(14px,2.2vw,30px)] motion-safe:animate-drift",
    delay: "-3s",
  },
  {
    at: [90, 8],
    text: "☁️",
    cls: "text-[clamp(16px,2.6vw,34px)] motion-safe:animate-drift",
    delay: "-5s",
  },
  {
    at: [57, 15],
    text: "⛵",
    cls: "text-[clamp(14px,2.2vw,30px)] motion-safe:animate-drift",
    delay: "-2s",
  },
  {
    at: [92, 90],
    text: "🐟",
    cls: "text-[clamp(14px,2vw,28px)] motion-safe:animate-bob",
  },
  {
    at: [76, 93],
    text: "🐠",
    cls: "text-[clamp(12px,1.7vw,24px)] motion-safe:animate-bob",
    delay: "-0.8s",
  },
  {
    at: [20, 70],
    text: "〰",
    cls: "text-[clamp(14px,2.4vw,32px)] font-bold text-langit-500/50 motion-safe:animate-drift",
  },
  {
    at: [57, 62],
    text: "〰",
    cls: "text-[clamp(12px,2vw,26px)] font-bold text-langit-500/50 motion-safe:animate-drift",
    delay: "-4s",
  },
  {
    at: [84, 70],
    text: "〰",
    cls: "text-[clamp(12px,2vw,26px)] font-bold text-langit-500/50 motion-safe:animate-drift",
    delay: "-1s",
  },
  {
    at: [44, 8],
    text: "〰",
    cls: "text-[clamp(12px,2vw,26px)] font-bold text-langit-500/50 motion-safe:animate-drift",
    delay: "-6s",
  },
];

/** Dekorasi laut di area kosong: awan, ombak, perahu, ikan, dan kompas. */
function Sea() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {SEA.map((d, i) => (
        <span
          key={i}
          className={`absolute -translate-1/2 leading-none ${d.cls}`}
          style={{
            left: `${d.at[0]}%`,
            top: `${d.at[1]}%`,
            animationDelay: d.delay,
          }}
        >
          {d.text}
        </span>
      ))}
      <svg
        viewBox="-50 -62 100 112"
        className="absolute bottom-[5%] left-[3%] w-[8%] opacity-90"
      >
        <circle
          r="34"
          fill="white"
          fillOpacity=".7"
          stroke="var(--color-sogan)"
          strokeWidth="2"
        />
        <path
          d="M0-44 7-7 44 0 7 7 0 44-7 7-44 0-7-7Z"
          fill="var(--color-kunyit-400)"
          stroke="var(--color-sogan)"
          strokeWidth="2"
        />
        <path d="M0-44 7-7 0 0Z M0 44-7 7 0 0Z" fill="var(--color-tanah-500)" />
        <text
          y="-49"
          textAnchor="middle"
          fontSize="14"
          fontWeight="800"
          fill="var(--color-tanah-700)"
        >
          U
        </text>
      </svg>
    </div>
  );
}

/** Linimasa 6 wilayah di bawah peta, bisa diklik untuk memilih wilayah. */
function Timeline({
  garden,
  selected,
  onSelect,
}: {
  garden: Garden;
  selected: RegionId;
  onSelect: (id: RegionId) => void;
}) {
  return (
    <ol
      className="-mx-4 mt-5 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0 xl:grid-cols-6"
      aria-label="Linimasa ekspedisi"
    >
      {REGIONS.map((r, i) => {
        const st = getRegionStatus(r, garden);
        return (
          <li key={r.id} className="w-36 flex-none sm:w-auto">
            <button
              type="button"
              onClick={() => onSelect(r.id)}
              aria-pressed={r.id === selected}
              className={`relative flex h-full w-full cursor-pointer flex-col items-center gap-1.5 rounded-[22px] border-3 bg-kartu p-3 text-center transition hover:-translate-y-0.5 ${
                r.id === selected
                  ? "border-daun-500"
                  : "border-krem-tua hover:border-daun-300"
              } ${st === "terkunci" ? "opacity-70" : ""}`}
            >
              <span
                className={`font-display grid size-8 place-items-center rounded-full font-semibold ${
                  st === "selesai"
                    ? "bg-kunyit-400 text-tinta-tetap"
                    : st === "aktif"
                      ? "bg-daun-500 text-white"
                      : "bg-krem-tua text-tinta-redup"
                }`}
              >
                {st === "selesai" ? "✓" : st === "terkunci" ? "🔒" : i + 1}
              </span>
              <span className="text-sm leading-tight font-extrabold">
                {r.name}
                <span className="sr-only">, {STATUS_LABEL[st]}</span>
              </span>
              <span className="flex h-11 items-end justify-center gap-1">
                {r.plantIds.map((id) => {
                  const seen =
                    garden.collection.includes(id) ||
                    garden.activePlantId === id;
                  return seen ? (
                    <PlantThumb key={id} plant={getPlant(id)!} size={40} />
                  ) : (
                    <span
                      key={id}
                      className="bg-krem grid size-9 place-items-center rounded-xl text-lg grayscale"
                    >
                      ❔
                    </span>
                  );
                })}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

/** Kartu budaya wilayah: rumah adat, tarian, makanan, ungkapan daerah. */
function Culture({ id, locked }: { id: RegionId; locked: boolean }) {
  const items = CULTURE[id];
  return (
    <section className="border-krem-tua mt-5 border-t-3 pt-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-xl font-semibold">Kenali Daerah</h3>
        {!locked && (
          <SpeakButton
            parts={[
              {
                text: items
                  .map((c) => `${c.kind}: ${c.name}. ${c.note}.`)
                  .join(" "),
                lang: "id-ID",
              },
            ]}
            label="Bacakan budaya daerah"
          />
        )}
      </div>
      {locked ? (
        <p className="bg-krem text-tinta-redup mt-2 rounded-[18px] p-3 text-sm font-bold">
          🔒 Buka wilayah ini untuk mengenal rumah adat, tarian, makanan, dan
          ungkapan daerahnya.
        </p>
      ) : (
        <ul className="mt-2 grid gap-2">
          {items.map((c) => (
            <li
              key={c.kind}
              className="bg-krem flex items-start gap-3 rounded-[18px] p-2.5"
            >
              <span
                className="grid size-11 flex-none place-items-center rounded-2xl bg-kartu text-2xl"
                aria-hidden="true"
              >
                {c.icon}
              </span>
              <span>
                <span className="text-sogan block text-xs font-extrabold">
                  {c.kind}
                </span>
                <b className="font-display">{c.name}</b>
                <span className="text-tinta-redup block text-sm font-semibold">
                  {c.note}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
