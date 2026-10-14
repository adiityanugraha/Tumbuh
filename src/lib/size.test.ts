import { describe, expect, it } from "vitest";
import { childHeight, formatSize, sizeComparison } from "./size";

describe("perbandingan ukuran tanaman", () => {
  it("memakai pembanding yang mudah dibayangkan anak", () => {
    expect(sizeComparison(10, 125)).toBe("kira-kira seukuran telapak tanganmu");
    expect(sizeComparison(20, 125)).toBe(
      "kira-kira sepanjang penggaris sekolahmu",
    );
    expect(sizeComparison(100, 125)).toBe("lebih pendek dari tinggi badanmu");
    expect(sizeComparison(150, 125)).toBe("kira-kira setinggi badanmu");
    expect(sizeComparison(4000, 125)).toBe("kira-kira 32 kali tinggi badanmu");
    expect(sizeComparison(4000, 160)).toBe("kira-kira 25 kali tinggi badanmu");
  });

  it("tinggi anak dari isian, atau perkiraan kelas bila kosong", () => {
    expect(childHeight({ grade: 1 })).toBe(118);
    expect(childHeight({ grade: 6 })).toBe(144);
    expect(childHeight({ grade: 1, heightCm: 131 })).toBe(131);
  });

  it("ukuran besar ditulis dalam meter", () => {
    expect(formatSize(100)).toBe("100 cm");
    expect(formatSize(300)).toBe("3 m");
    expect(formatSize(1500)).toBe("15 m");
  });
});
