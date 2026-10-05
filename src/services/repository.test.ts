import { beforeEach, describe, expect, it } from "vitest";
import { createLocalRepository } from "./repository";

describe("createLocalRepository", () => {
  beforeEach(() => localStorage.clear());

  it("menyimpan dan membaca kembali data, termasuk dari instance baru", async () => {
    const repo = createLocalRepository(localStorage);
    await repo.saveStudent({ nickname: "Bima", avatar: "🦁", grade: 3, createdAt: "2026-10-05" });
    await repo.addEncouragement({ id: "1", message: "Hebat!", sticker: "🌟", createdAt: "2026-10-05", read: false });
    await repo.markEncouragementsRead();

    const fresh = createLocalRepository(localStorage);
    expect((await fresh.getStudent())?.nickname).toBe("Bima");
    expect((await fresh.getEncouragements())[0].read).toBe(true);
    expect(await fresh.getSessions()).toEqual([]);
  });

  it("data rusak tidak membuat crash", async () => {
    localStorage.setItem("tumbuh:v1", "{bukan json");
    const repo = createLocalRepository(localStorage);
    expect(await repo.getStudent()).toBeNull();
  });

  it("reset menghapus semua data", async () => {
    const repo = createLocalRepository(localStorage);
    await repo.saveStudent({ nickname: "Sari", avatar: "🐰", grade: 1, createdAt: "2026-10-05" });
    await repo.reset();
    expect(await repo.getStudent()).toBeNull();
  });
});
