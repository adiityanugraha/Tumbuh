"use client";

import Image from "next/image";
import { useRef } from "react";
import { PLANT_INFO } from "@/data/plant-info";
import { childHeight, HEIGHT_MAX, HEIGHT_MIN } from "@/lib/size";
import { useApp } from "./AppProvider";

/** Tinggi dinding pada gambar (cm), sedikit di atas batas isian agar kepala tidak terpotong. */
const WALL_CM = 200;
const TICKS = Array.from({ length: WALL_CM / 10 - 1 }, (_, i) => (i + 1) * 10);
const PLANT_SIZES = Object.values(PLANT_INFO).map((p) => p.sizeCm);
export const GENDERS = [
  ["laki", "Laki-laki"],
  ["perempuan", "Perempuan"],
] as const;
const btn =
  "border-krem-tua bg-kartu hover:border-daun-300 grid size-12 flex-none cursor-pointer place-items-center rounded-full border-3 text-2xl font-extrabold transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40";

/**
 * Pengukur tinggi badan bergaya meteran dinding: geser kepala anak di gambar, slider, atau tombol -/+.
 * Dipakai di Pengaturan anak (Profil) dan orang tua (Anak).
 */
export function HeightPicker({ who }: { who: "anak" | "ortu" }) {
  const { student, updateStudent } = useApp();
  const wall = useRef<HTMLDivElement>(null);
  if (!student) return null;

  const cm = childHeight(student);
  const measured = student.heightCm !== undefined;
  const shorter = PLANT_SIZES.filter((s) => s < cm).length;
  const set = (v: number) => {
    const next = Math.min(HEIGHT_MAX, Math.max(HEIGHT_MIN, Math.round(v)));
    if (next !== student.heightCm) void updateStudent({ heightCm: next });
  };
  // Geser di gambar: posisi jari dari lantai menjadi tinggi badan.
  const fromPointer = (e: React.PointerEvent) => {
    const r = wall.current?.getBoundingClientRect();
    if (r) set(((r.bottom - e.clientY) / r.height) * WALL_CM);
  };
  const you = who === "anak" ? "kamu" : student.nickname;
  const gender = student.gender ?? "laki";

  return (
    <section className="border-krem-tua mt-5 rounded-[20px] border-3 p-4">
      <h3 className="font-extrabold">
        <span aria-hidden="true">📏</span>{" "}
        {who === "anak" ? "Tinggi badanku" : `Tinggi badan ${student.nickname}`}
      </h3>
      {/* Switch gambar badan: jempol putih bergeser ke pilihan yang aktif. */}
      <div
        role="radiogroup"
        aria-label="Gambar badan"
        className="bg-krem-tua relative mt-3 grid grid-cols-2 rounded-full p-1"
      >
        <span
          aria-hidden="true"
          className={`bg-kartu absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full shadow-sm transition-transform ${gender === "perempuan" ? "translate-x-full" : ""}`}
        />
        {GENDERS.map(([g, label]) => (
          <button
            key={g}
            type="button"
            role="radio"
            aria-checked={gender === g}
            onClick={() => updateStudent({ gender: g })}
            className={`relative flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full font-extrabold transition-colors ${gender === g ? "text-tinta" : "text-tinta-redup"}`}
          >
            <Image
              src={`/badan/${g}.webp`}
              alt=""
              width={265}
              height={800}
              className={`bg-langit-100 size-8 rounded-full object-cover object-top ${gender === g ? "" : "opacity-60 grayscale"}`}
            />
            {label}
          </button>
        ))}
      </div>
      <div className="mt-3 grid items-center gap-4 sm:grid-cols-[176px_1fr]">
        <div
          ref={wall}
          aria-hidden="true"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            fromPointer(e);
          }}
          onPointerMove={(e) => e.buttons && fromPointer(e)}
          className="bg-langit-100 bg-kawung relative h-64 cursor-ns-resize touch-none overflow-hidden rounded-[18px] bg-size-[30px_30px] select-none"
        >
          {/* Meteran dinding */}
          <div className="bg-kunyit-100 border-kunyit-400 absolute inset-y-0 left-3 w-9 border-x-3">
            {TICKS.map((t) => (
              <div
                key={t}
                className="absolute left-0 flex items-center"
                style={{ bottom: `${(t / WALL_CM) * 100}%` }}
              >
                <span
                  className={`bg-tanah-700 block h-0.5 ${t % 50 === 0 ? "w-4" : "w-2"}`}
                />
                {t % 50 === 0 && (
                  <span className="text-tanah-700 ml-0.5 text-[10px] leading-none font-extrabold">
                    {t}
                  </span>
                )}
              </div>
            ))}
          </div>
          {/* Lantai */}
          <div className="bg-tanah-100 border-tanah-300 absolute inset-x-0 bottom-0 h-2 border-t-3" />
          {/* Garis kepala */}
          <div
            className="border-daun-600 absolute right-2 left-3 border-t-3 border-dashed transition-[bottom]"
            style={{ bottom: `${(cm / WALL_CM) * 100}%` }}
          >
            <span className="bg-daun-600 absolute right-0 -translate-y-1/2 rounded-full px-2 py-0.5 text-xs font-extrabold text-white">
              {cm} cm
            </span>
          </div>
          {/* Anak berdiri di lantai, tinggi gambar sesuai isian */}
          <Image
            src={`/badan/${gender}.webp`}
            alt=""
            width={265}
            height={800}
            draggable={false}
            className="absolute bottom-2 left-[58%] w-auto max-w-none -translate-x-1/2 transition-[height]"
            style={{ height: `calc(${(cm / WALL_CM) * 100}% - 0.5rem)` }}
          />
        </div>

        <div>
          <p className="text-center sm:text-left">
            <span className="font-display text-daun-800 text-6xl font-semibold">
              {cm}
            </span>
            <span className="text-tinta-redup ml-1 text-xl font-extrabold">
              cm
            </span>
          </p>
          <p
            className={`mx-auto mt-1 w-fit rounded-full px-3 py-0.5 text-sm font-extrabold sm:mx-0 ${measured ? "bg-daun-100 text-daun-800" : "bg-kunyit-100 text-tanah-700"}`}
          >
            {measured ? "✓ Sudah diukur" : `Perkiraan anak kelas ${student.grade}`}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => set(cm - 1)}
              disabled={cm <= HEIGHT_MIN}
              aria-label="Kurangi 1 cm"
              className={btn}
            >
              −
            </button>
            <input
              type="range"
              min={HEIGHT_MIN}
              max={HEIGHT_MAX}
              value={cm}
              onChange={(e) => set(Number(e.target.value))}
              aria-label="Tinggi badan"
              aria-valuetext={`${cm} sentimeter`}
              className="accent-daun-600 h-12 min-w-0 flex-1 cursor-pointer"
            />
            <button
              type="button"
              onClick={() => set(cm + 1)}
              disabled={cm >= HEIGHT_MAX}
              aria-label="Tambah 1 cm"
              className={btn}
            >
              +
            </button>
          </div>
          <p className="bg-krem mt-2 rounded-2xl px-3 py-2 text-sm font-bold">
            <span aria-hidden="true">🌱</span>{" "}
            {you[0].toUpperCase() + you.slice(1)} lebih tinggi dari {shorter}{" "}
            tanaman Nusantara. Masih ada {PLANT_SIZES.length - shorter} yang
            lebih tinggi!
          </p>
          {measured && (
            <button
              type="button"
              onClick={() => updateStudent({ heightCm: undefined })}
              className="text-tanah-700 mt-1 min-h-10 cursor-pointer text-sm font-bold underline"
            >
              Pakai perkiraan kelas saja
            </button>
          )}
        </div>
      </div>
      <p className="text-tinta-redup mt-3 text-sm font-semibold">
        {who === "anak"
          ? "Belum tahu tinggimu? Berdiri tegak menempel dinding, lalu minta Ayah atau Ibu menandai di atas kepalamu."
          : "Ukur anak berdiri tegak tanpa alas kaki. Dipakai untuk membandingkan ukuran tanaman di Koleksi."}
      </p>
    </section>
  );
}
