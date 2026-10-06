/** Narasi suara lewat Web Speech API. Hanya dipanggil dari event/effect di client. */

export const isSpeechSupported = () => typeof window !== "undefined" && "speechSynthesis" in window;

export type SpeechPart = { text: string; lang: "id-ID" | "en-US" };

function pickVoice(lang: string) {
  const voices = window.speechSynthesis.getVoices();
  const prefix = lang.slice(0, 2);
  return voices.find((v) => v.lang === lang) ?? voices.find((v) => v.lang.startsWith(prefix));
}

/** true bila perangkat punya suara untuk bahasa ini. Daftar suara bisa kosong sesaat setelah halaman dibuka. */
export function hasVoice(lang: SpeechPart["lang"]): boolean {
  if (!isSpeechSupported()) return false;
  const voices = window.speechSynthesis.getVoices();
  return voices.length === 0 || Boolean(pickVoice(lang));
}

/** Bacakan beberapa bagian berurutan, misalnya soal (id-ID) lalu kata Inggris (en-US). */
export function speak(parts: SpeechPart[], onEnd?: () => void) {
  if (!isSpeechSupported()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  parts.forEach((part, i) => {
    const u = new SpeechSynthesisUtterance(part.text);
    u.lang = part.lang;
    u.rate = 0.9;
    const voice = pickVoice(part.lang);
    if (voice) u.voice = voice;
    if (i === parts.length - 1 && onEnd) u.onend = onEnd;
    synth.speak(u);
  });
}

export const stopSpeaking = () => isSpeechSupported() && window.speechSynthesis.cancel();
