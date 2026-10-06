/** Efek bunyi pendek dibuat langsung dengan Web Audio, tanpa file audio. */

let ctx: AudioContext | null = null;

function tone(freq: number, start: number, duration: number) {
  ctx ??= new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  const t = ctx.currentTime + start;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + duration);
}

function play(notes: [number, number, number][]) {
  try {
    notes.forEach(([f, s, d]) => tone(f, s, d));
  } catch {
    // Browser tanpa Web Audio: diam saja.
  }
}

export const playCorrect = () => play([[660, 0, 0.15], [880, 0.12, 0.25]]);
export const playWrong = () => play([[300, 0, 0.18], [240, 0.14, 0.25]]);
export const playCelebrate = () => play([[523, 0, 0.2], [659, 0.15, 0.2], [784, 0.3, 0.2], [1047, 0.45, 0.4]]);
