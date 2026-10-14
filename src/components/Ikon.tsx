import Image from "next/image";
import type { Subject } from "@/lib/types";

/** Gambar ikon (public/ikon/*.webp, aset peserta) pengganti emoji agar tampilan sama di semua perangkat. */
const AVATAR: Record<string, [string, string]> = {
  "🦁": ["avatar-singa", "singa"],
  "🐰": ["avatar-kelinci", "kelinci"],
  "🐼": ["avatar-panda", "panda"],
  "🦊": ["avatar-rubah", "rubah"],
  "🐸": ["avatar-katak", "katak"],
  "🐢": ["avatar-kura", "kura-kura"],
  "🐨": ["avatar-koala", "koala"],
  "🦋": ["avatar-kupu", "kupu-kupu"],
};
const STICKER: Record<string, [string, string]> = {
  "🌟": ["stiker-bintang", "bintang"],
  "💪": ["stiker-otot", "otot kuat"],
  "❤️": ["stiker-hati", "hati"],
  "🎉": ["stiker-terompet", "terompet pesta"],
  "🌻": ["stiker-bunga", "bunga matahari"],
  "👍": ["stiker-jempol", "jempol"],
};
export const SUBJECT_IKON: Record<Subject, string> = {
  matematika: "mapel-matematika",
  indonesia: "mapel-indonesia",
  ipas: "mapel-ipas",
  inggris: "mapel-inggris",
};
export const BADGE_IKON: Record<string, string> = {
  pertama: "lencana-pertama",
  sempurna: "lencana-sempurna",
  "streak-3": "lencana-streak3",
  "serba-bisa": "lencana-serbabisa",
  bunga: "lencana-bunga",
  pulau: "lencana-pulau",
  "streak-7": "lencana-streak7",
  separuh: "lencana-separuh",
};
export const CULTURE_IKON: Record<string, string> = {
  "Rumah adat": "budaya-rumah",
  Tarian: "budaya-tarian",
  "Makanan khas": "budaya-makanan",
  "Ungkapan daerah": "budaya-ungkapan",
};

/** Ikon seukuran teks di sekitarnya (1.2em). Tanpa label dianggap hiasan. */
export function Ikon({
  name,
  label,
  className = "",
}: {
  name: string;
  label?: string;
  className?: string;
}) {
  return (
    <Image
      src={`/ikon/${name}.webp`}
      alt={label ?? ""}
      aria-hidden={label ? undefined : true}
      width={128}
      height={128}
      className={`inline-block size-[1.2em] max-w-none align-[-0.2em] ${className}`}
    />
  );
}

/** Avatar anak disimpan sebagai emoji (data lama tetap berlaku); tampil sebagai gambar bila tersedia. */
export function Avatar({
  emoji,
  className,
}: {
  emoji: string;
  className?: string;
}) {
  const found = AVATAR[emoji];
  return found ? (
    <Ikon name={found[0]} className={className} />
  ) : (
    <span className={className}>{emoji}</span>
  );
}
export const avatarName = (emoji: string) => AVATAR[emoji]?.[1] ?? emoji;

export function Sticker({
  emoji,
  className,
}: {
  emoji: string;
  className?: string;
}) {
  const found = STICKER[emoji];
  return found ? (
    <Ikon name={found[0]} className={className} />
  ) : (
    <span className={className}>{emoji}</span>
  );
}
export const stickerName = (emoji: string) => STICKER[emoji]?.[1] ?? emoji;

export const SubjectIkon = ({
  subject,
  className,
}: {
  subject: Subject;
  className?: string;
}) => <Ikon name={SUBJECT_IKON[subject]} className={className} />;
export const LockIkon = ({ className }: { className?: string }) => (
  <Ikon name="kunci" className={className} />
);
