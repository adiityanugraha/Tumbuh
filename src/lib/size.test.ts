import { describe, expect, it } from "vitest";
import { formatSize, sizeComparison } from "./size";

describe("perbandingan ukuran tanaman", () => {
  it("memakai pembanding yang mudah dibayangkan anak", () => {
    expect(sizeComparison(10)).toBe("kira-kira seukuran telapak tanganmu");
    expect(sizeComparison(20)).toBe("kira-kira sepanjang penggaris sekolahmu");
    expect(sizeComparison(100)).toBe("lebih pendek dari tinggi badanmu");
    expect(sizeComparison(150)).toBe("kira-kira setinggi badanmu");
    expect(sizeComparison(4000)).toBe("kira-kira 32 kali tinggi badanmu");
  });

  it("ukuran besar ditulis dalam meter", () => {
    expect(formatSize(100)).toBe("100 cm");
    expect(formatSize(300)).toBe("3 m");
    expect(formatSize(1500)).toBe("15 m");
  });
});
