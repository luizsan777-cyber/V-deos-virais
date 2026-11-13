// Gera assets/lib/vve-kit.js (kit de personagens da VVE para o navegador) dentro de um projeto HyperFrames.
// Uso: node rig/build.mjs <pasta-do-projeto-hyperframes>
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
const aqui = path.dirname(fileURLToPath(import.meta.url));
const destino = path.resolve(process.argv[2] ?? path.join(aqui, "..", "teste-alerta"));
await build({
  entryPoints: [path.join(aqui, "vve-kit.tsx")],
  outfile: path.join(destino, "assets", "lib", "vve-kit.js"),
  bundle: true, minify: true, format: "iife", target: "chrome120", jsx: "automatic",
  nodePaths: [path.join(aqui, "..", "..", "..", "engine", "node_modules")],
  alias: {
    remotion: path.join(aqui, "remotion-shim.ts"),
    react: path.join(aqui, "..", "..", "..", "engine", "node_modules", "react"),
    "react-dom": path.join(aqui, "..", "..", "..", "engine", "node_modules", "react-dom"),
  },
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "info",
});
