// Renderiza o projeto selecionado em src/projeto.gen.ts.
// Uso:
//   node render.mjs video <saida.mp4> [--escala 1] [--concorrencia N]
//   node render.mjs stills <pasta> <frame1,frame2,...> [--escala 0.5]
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import { webpackOverride } from "./webpack-override.mjs";

const aqui = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (k, d) => {
  const i = args.indexOf(k);
  return i >= 0 ? args[i + 1] : d;
};
const modo = args[0];
const publicDir = opt("--public", path.join(aqui, "public"));

const navegador = () => {
  if (process.env.REMOTION_BROWSER) return process.env.REMOTION_BROWSER;
  const base = "/opt/pw-browsers";
  if (fs.existsSync(base)) {
    for (const d of fs.readdirSync(base)) {
      const p = path.join(base, d, "chrome-headless-shell-linux64", "chrome-headless-shell");
      if (d.startsWith("chromium_headless_shell") && fs.existsSync(p)) return p;
    }
  }
  return null; // Remotion baixa o próprio navegador (ex.: GitHub Actions)
};

const main = async () => {
  const t0 = Date.now();
  const serveUrl = await bundle({ entryPoint: path.join(aqui, "src/index.ts"), webpackOverride, publicDir });
  const browserExecutable = navegador();
  const chromiumOptions = { gl: "swangle", ignoreCertificateErrors: false };
  const comp = await selectComposition({ serveUrl, id: "Video", browserExecutable, chromiumOptions });
  const escala = Number(opt("--escala", "1"));
  console.log(`[render] bundle ok em ${((Date.now() - t0) / 1000).toFixed(1)}s — ${comp.durationInFrames} frames`);
  if (modo === "stills") {
    const pasta = args[1];
    fs.mkdirSync(pasta, { recursive: true });
    for (const fr of args[2].split(",").map(Number)) {
      await renderStill({ serveUrl, composition: comp, frame: Math.min(fr, comp.durationInFrames - 1), output: path.join(pasta, `f${String(fr).padStart(4, "0")}.jpg`), imageFormat: "jpeg", jpegQuality: 88, scale: escala, browserExecutable, chromiumOptions });
    }
    console.log(`[render] stills em ${pasta}`);
    return;
  }
  const saida = args[1];
  let ult = -1;
  await renderMedia({
    serveUrl, composition: comp, codec: "h264", outputLocation: saida, muted: true, crf: 18, pixelFormat: "yuv420p",
    imageFormat: "jpeg", jpegQuality: 92, scale: escala, browserExecutable, chromiumOptions,
    concurrency: Number(opt("--concorrencia", String(Math.max(1, os.cpus().length)))),
    onProgress: ({ progress }) => {
      const p = Math.floor(progress * 20);
      if (p !== ult) { ult = p; console.log(`[render] ${Math.round(progress * 100)}%`); }
    },
  });
  console.log(`[render] vídeo em ${saida} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
};

main().catch((e) => { console.error(e); process.exit(1); });
