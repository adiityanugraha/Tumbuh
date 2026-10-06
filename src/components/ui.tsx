import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "daun" | "kunyit" | "ghost";

const VARIANT: Record<Variant, string> = {
  daun: "bg-daun-600 text-white shadow-daun",
  kunyit: "bg-kunyit-400 text-tinta shadow-kunyit",
  ghost: "border-3 border-krem-tua bg-white text-tinta shadow-krem",
};

/** Tombol tebal ala 3D: naik saat hover, turun saat ditekan. */
export const buttonClass = (variant: Variant = "daun", extra = "") =>
  `inline-flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-blob px-7 font-display text-xl font-semibold transition hover:-translate-y-0.5 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${VARIANT[variant]} ${extra}`;

export function Button({ variant, className = "", ...props }: ComponentProps<"button"> & { variant?: Variant }) {
  return <button type="button" className={buttonClass(variant, className)} {...props} />;
}

export function ButtonLink({ variant, className = "", ...props }: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={buttonClass(variant, className)} {...props} />;
}

export function Card({ batik = false, className = "", ...props }: ComponentProps<"div"> & { batik?: boolean }) {
  return (
    <div
      className={`rounded-blob border-3 border-krem-tua bg-white p-5 ${batik ? "batik-line" : "relative"} ${className}`}
      {...props}
    />
  );
}

export function Tag({ className = "", ...props }: ComponentProps<"span">) {
  return (
    <span
      className={`inline-block rounded-full bg-krem-tua px-2.5 py-0.5 text-xs font-extrabold text-sogan ${className}`}
      {...props}
    />
  );
}

/** Label wajib untuk tampilan yang memakai data dummy. */
export const DemoTag = () => <Tag title="Data teman sekelas adalah contoh untuk demo">Data contoh</Tag>;

/** Bar progres. Motif parang untuk progres tanaman, polos untuk lainnya. */
export function Bar({ value, motif = true, label }: { value: number; motif?: boolean; label: string }) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-4.5 overflow-hidden rounded-full bg-krem-tua"
    >
      <div
        className={`h-full rounded-full transition-[width] duration-700 ${motif ? "bg-parang" : "bg-daun-500"}`}
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </div>
  );
}
