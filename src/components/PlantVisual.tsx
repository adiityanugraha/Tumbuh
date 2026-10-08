import Image from "next/image";
import type { GrowthStage, PlantSpecies } from "@/lib/types";
import { PlantArt, Pot } from "./art";

/**
 * Tanaman yang punya ilustrasi per tahap di public/tanaman/{id}-{tahap}.webp (tanaman + pot, latar transparan).
 * Ukuran [lebar, tinggi] gambar. Semua gambar diskalakan agar dasar pot selebar POT_PX.
 */
const ILLUSTRATED: Record<string, [number, number]> = {
  rafflesia: [761, 762],
  "bunga-bangkai": [607, 1419],
  melati: [511, 1308],
  edelweis: [508, 1305],
  "anggrek-hitam": [712, 1306],
  "kantong-semar": [796, 1299],
  "anggrek-bulan": [604, 1301],
  // Pohon tanpa pot: gundukan tanah + rumput, gundukan selebar 400 px (setara pot 300 px).
  eboni: [880, 585],
  cendana: [880, 579],
  majegau: [880, 578],
  pala: [880, 565],
  matoa: [880, 585],
};
const POT_PX = 300;

const src = (id: string, stage: GrowthStage) => `/tanaman/${id}-${stage}.webp`;

/** Hitung ukuran tampil: pot selebar potWidth, tapi tidak lebih tinggi dari maxHeight. */
function fit([w, h]: [number, number], potWidth: number, maxHeight: number) {
  const k = Math.min(potWidth / POT_PX, maxHeight / h);
  return { width: Math.round(w * k), height: Math.round(h * k) };
}

/** Tanaman di pot sesuai tahap. Tanpa ilustrasi: SVG sementara. Layu: warna pudar dan sedikit merunduk. */
export function PlantVisual({
  plant,
  stage,
  wilted = false,
  potWidth = 180,
  maxHeight = 520,
}: {
  plant: PlantSpecies;
  stage: GrowthStage;
  wilted?: boolean;
  potWidth?: number;
  maxHeight?: number;
}) {
  const dims = ILLUSTRATED[plant.id];
  if (dims) {
    return (
      <Image
        src={src(plant.id, stage)}
        alt={`${plant.name}, tahap ${stage}${wilted ? ", sedang layu" : ""}`}
        {...fit(dims, potWidth, maxHeight)}
        priority
        className={`origin-bottom ${wilted ? "-rotate-3 saturate-[.35] sepia-[.4]" : "animate-breathe"}`}
      />
    );
  }
  // PLACEHOLDER: ilustrasi SVG umum sampai aset tanaman ini tersedia.
  return (
    <div className="flex flex-col items-center">
      <div className={wilted ? "saturate-50" : "animate-sway"} style={{ transformOrigin: "50% 100%" }}>
        <PlantArt stage={stage} color={plant.color} wilted={wilted} size={potWidth * 1.1} />
      </div>
      <div className="-mt-1.5">
        <Pot width={potWidth * 1.15} />
      </div>
    </div>
  );
}

/** Gambar kecil tanaman untuk kartu koleksi dan peta: ilustrasi tahap berbunga dalam kotak, atau emoji. */
export function PlantThumb({ plant, size }: { plant: PlantSpecies; size: number }) {
  const dims = ILLUSTRATED[plant.id];
  if (dims) {
    const k = size / Math.max(...dims);
    return <Image src={src(plant.id, "berbunga")} alt="" width={Math.round(dims[0] * k)} height={Math.round(dims[1] * k)} />;
  }
  // PLACEHOLDER: emoji sampai ilustrasi tersedia.
  return <span style={{ fontSize: size * 0.55 }}>{plant.emoji}</span>;
}
