/** Perkiraan tinggi anak SD (sekitar kelas 3), dipakai sebagai pembanding ukuran tanaman. */
export const CHILD_CM = 125;

/** Kalimat perbandingan ukuran tanaman dengan tubuh anak, agar angka cm mudah dibayangkan. */
export function sizeComparison(cm: number): string {
  if (cm <= 15) return "kira-kira seukuran telapak tanganmu";
  if (cm <= 40) return "kira-kira sepanjang penggaris sekolahmu";
  if (cm < CHILD_CM * 0.9) return "lebih pendek dari tinggi badanmu";
  if (cm <= CHILD_CM * 1.3) return "kira-kira setinggi badanmu";
  return `kira-kira ${Math.round(cm / CHILD_CM)} kali tinggi badanmu`;
}

/** "4.000 cm" jadi "40 m" agar mudah dibaca. */
export const formatSize = (cm: number) =>
  cm >= 200 ? `${(cm / 100).toLocaleString("id-ID")} m` : `${cm} cm`;
