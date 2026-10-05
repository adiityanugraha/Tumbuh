// Menyalin prompt peserta dari transkrip Claude Code (*.jsonl) ke docs/LOG_PROMPT.md, kata per kata.
// Pakai: npm run log:prompt [-- <folder transkrip>]
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const slug = process.cwd().replace(/[:\\/ ]/g, "-");
const dir = process.argv[2] ?? join(homedir(), ".claude", "projects", slug);
const out = join(process.cwd(), "docs", "LOG_PROMPT.md");

const wib = (iso) =>
  new Date(iso).toLocaleString("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "medium", timeStyle: "medium" }) +
  " WIB";

// Jawaban dari pertanyaan pilihan (AskUserQuestion) tersimpan sebagai tool_result.
const ANSWER = /^(The user answered|Your questions have been answered)/;
const parseAnswers = (text) => [...text.matchAll(/"([^"]+)"="([^"]*)"/g)].map(([, q, a]) => ({ q, a }));

function entriesOf(file) {
  const entries = [];
  for (const line of readFileSync(file, "utf8").split("\n")) {
    if (!line.trim()) continue;
    const o = JSON.parse(line);
    if (o.type !== "user" || o.isMeta) continue;
    const content = o.message?.content;
    if (typeof content === "string") {
      if (!content.startsWith("<")) entries.push({ time: o.timestamp, kind: "prompt", text: content });
      continue;
    }
    for (const part of content ?? []) {
      if (part.type === "text" && !part.text.startsWith("<")) {
        entries.push({ time: o.timestamp, kind: "prompt", text: part.text });
      } else if (part.type === "tool_result") {
        const text = typeof part.content === "string" ? part.content : (part.content ?? []).map((c) => c.text ?? "").join("");
        if (ANSWER.test(text)) entries.push({ time: o.timestamp, kind: "jawaban", answers: parseAnswers(text) });
      }
    }
  }
  return entries;
}

const sessions = readdirSync(dir)
  .filter((f) => f.endsWith(".jsonl"))
  .map((f) => ({ id: f.replace(".jsonl", ""), entries: entriesOf(join(dir, f)) }))
  .filter((s) => s.entries.length)
  .sort((a, b) => a.entries[0].time.localeCompare(b.entries[0].time));

let n = 0;
const lines = [
  "# Log Prompt Mentah",
  "",
  "Disalin otomatis dari transkrip Claude Code oleh `scripts/prompt-log.mjs`, kata per kata, tanpa diedit.",
  "Termasuk jawaban peserta atas pertanyaan pilihan dari AI. Waktu dalam WIB.",
  "",
  `Terakhir diperbarui: ${wib(new Date().toISOString())}`,
  "",
];
for (const s of sessions) {
  lines.push(`## Sesi ${s.id.slice(0, 8)}`, "", `Mulai: ${wib(s.entries[0].time)}`, "");
  for (const e of s.entries) {
    n += 1;
    if (e.kind === "prompt") {
      lines.push(`### ${n}. Prompt - ${wib(e.time)}`, "", "```text", e.text.trim(), "```", "");
    } else {
      lines.push(`### ${n}. Jawaban pilihan - ${wib(e.time)}`, "");
      for (const { q, a } of e.answers) lines.push(`- **${q}**`, `  - Jawaban: ${a}`);
      lines.push("");
    }
  }
}
writeFileSync(out, lines.join("\n"));
console.log(`${n} entri dari ${sessions.length} sesi ditulis ke docs/LOG_PROMPT.md`);
