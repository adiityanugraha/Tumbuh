// Pascabuild: build static export Next 16 di Windows menulis file prefetch segmen bertingkat
// (out/kebun/__next.X/kebun/__PAGE__.txt), padahal browser memintanya dengan nama bertitik
// (out/kebun/__next.X.kebun.__PAGE__.txt). Tanpa salinan ini prefetch 404 dan muncul error di konsol.
// ponytail: salin file saja, hapus skrip ini bila Next memperbaiki penamaannya.
import { copyFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const OUT = join(process.cwd(), "out");
let copied = 0;

function filesIn(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? filesIn(p) : [p];
  });
}

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (!statSync(p).isDirectory()) continue;
    if (name.startsWith("__next.")) {
      for (const f of filesIn(p)) {
        copyFileSync(f, join(dir, `${name}.${relative(p, f).split(sep).join(".")}`));
        copied++;
      }
    } else walk(p);
  }
}

walk(OUT);
console.log(`fix-segments: ${copied} file prefetch disalin ke nama bertitik`);
