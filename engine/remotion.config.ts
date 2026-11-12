import path from "node:path";
import { Config } from "@remotion/cli/config";
// Mesma regra de engine/webpack-override.mjs (usado pelo render.mjs): o código dos vídeos fica em
// ../projetos/<slug>/ e usa os pacotes de engine/node_modules. O CLI roda a partir da pasta engine/.
Config.overrideWebpackConfig((c) => ({
  ...c,
  resolve: { ...c.resolve, modules: [path.join(process.cwd(), "node_modules"), "node_modules"] },
}));
Config.setVideoImageFormat("jpeg");
Config.setChromiumOpenGlRenderer("swangle");
