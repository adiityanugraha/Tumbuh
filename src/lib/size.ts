import type { Grade, Student } from "./types";

/** VERIFY: perkiraan tinggi anak per kelas (usia 7-12 tahun, mendekati median WHO), dipakai bila tinggi belum diisi. */
const GRADE_CM: Record<Grade, number> = {
  1: 118,
  2: 123,
  3: 128,
  4: 133,
  5: 138,
  6: 144,
};
export const HEIGHT_MIN = 90;
export const HEIGHT_MAX = 180;

/** Tinggi anak yang diisi sendiri atau orang tua; bila kosong, perkiraan dari kelas. */
export const childHeight = (s: Pick<Student, "grade" | "heightCm">) =>
  s.heightCm ?? GRADE_CM[s.grade];

/** Kalimat perbandingan ukuran tanaman dengan tubuh anak, agar angka cm mudah dibayangkan. */
export function sizeComparison(cm: number, childCm: number): string {
  if (cm <= 15) return "kira-kira seukuran telapak tanganmu";
  if (cm <= 40) return "kira-kira sepanjang penggaris sekolahmu";
  if (cm < childCm * 0.9) return "lebih pendek dari tinggi badanmu";
  if (cm <= childCm * 1.3) return "kira-kira setinggi badanmu";
  return `kira-kira ${Math.round(cm / childCm)} kali tinggi badanmu`;
}

/** "4.000 cm" jadi "40 m" agar mudah dibaca. */
export const formatSize = (cm: number) =>
  cm >= 200 ? `${(cm / 100).toLocaleString("id-ID")} m` : `${cm} cm`;
