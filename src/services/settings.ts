/** Pengaturan tampilan dan suara, disimpan per perangkat (tidak ikut sinkron). Hanya dipanggil di client. */
export interface Settings {
  theme: "auto" | "terang" | "gelap";
  font: "normal" | "besar";
  reduceMotion: boolean;
  sound: boolean;
  speechRate: "lambat" | "normal" | "cepat";
  /** Sapaan bawaan orang tua saat Kirim Semangat dan membuat tantangan. */
  sender: string;
}

const KEY = "tumbuh:pengaturan";
export const DEFAULT_SETTINGS: Settings = {
  theme: "auto",
  font: "normal",
  reduceMotion: false,
  sound: true,
  speechRate: "normal",
  sender: "Ibu",
};
export const SPEECH_RATE = { lambat: 0.7, normal: 0.9, cepat: 1.1 } as const;

/** Mode gelap perangkat. matchMedia tidak ada di beberapa lingkungan (misalnya test), anggap terang. */
export const prefersDark = () =>
  typeof matchMedia === "function" &&
  matchMedia("(prefers-color-scheme: dark)").matches;

export function getSettings(): Settings {
  try {
    return {
      ...DEFAULT_SETTINGS,
      ...JSON.parse(localStorage.getItem(KEY) ?? "{}"),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/** Pasang atribut tema, ukuran huruf, dan animasi di <html>. "auto" mengikuti pengaturan perangkat. */
export function applySettings(s: Settings) {
  const root = document.documentElement;
  const dark = s.theme === "gelap" || (s.theme === "auto" && prefersDark());
  root.dataset.theme = dark ? "gelap" : "terang";
  root.dataset.font = s.font;
  if (s.reduceMotion) root.dataset.motion = "kurangi";
  else delete root.dataset.motion;
}

export function saveSettings(s: Settings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // ponytail: storage diblokir (mode privat), pengaturan hanya berlaku sampai halaman ditutup.
  }
  applySettings(s);
}

/** Versi mini applySettings untuk <head>, dijalankan sebelum halaman tampil agar tidak berkedip. */
export const SETTINGS_BOOT_SCRIPT = `(function(){try{var s=JSON.parse(localStorage.getItem("${KEY}")||"{}"),r=document.documentElement,t=s.theme;if(t!=="gelap"&&t!=="terang")t=matchMedia("(prefers-color-scheme: dark)").matches?"gelap":"terang";r.dataset.theme=t;if(s.font==="besar")r.dataset.font="besar";if(s.reduceMotion)r.dataset.motion="kurangi"}catch(e){}})();`;
