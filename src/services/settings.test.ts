import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, getSettings, saveSettings } from "./settings";

describe("pengaturan perangkat", () => {
  beforeEach(() => localStorage.clear());

  it("bawaan bila belum pernah diatur", () => {
    expect(getSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it("menyimpan dan memasang tema, huruf, dan animasi di <html>", () => {
    saveSettings({ ...DEFAULT_SETTINGS, theme: "gelap", font: "besar", reduceMotion: true, sender: "Ayah" });
    const root = document.documentElement;
    expect([root.dataset.theme, root.dataset.font, root.dataset.motion]).toEqual(["gelap", "besar", "kurangi"]);
    expect(getSettings().sender).toBe("Ayah");
    saveSettings({ ...getSettings(), theme: "terang", reduceMotion: false });
    expect(root.dataset.theme).toBe("terang");
    expect(root.dataset.motion).toBeUndefined();
  });
});
