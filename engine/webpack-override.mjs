// Permite que o código dos vídeos fique em ../projetos/<slug>/ e ainda use os pacotes de engine/node_modules.
import path from "node:path";
import { fileURLToPath } from "node:url";
const aqui = path.dirname(fileURLToPath(import.meta.url));
export const webpackOverride = (c) => ({
  ...c,
  resolve: { ...c.resolve, modules: [path.join(aqui, "node_modules"), "node_modules"] },
});
