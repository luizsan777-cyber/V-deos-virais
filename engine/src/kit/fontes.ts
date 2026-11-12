// Fontes empacotadas via npm (@fontsource, licença OFL) — não dependem do Google Fonts em tempo de render.
import { continueRender, delayRender } from "remotion";
import "@fontsource/anton/latin.css";
import "@fontsource/anton/latin-ext.css";
import "@fontsource/montserrat/800.css";
import "@fontsource/montserrat/900.css";
import "@fontsource/cinzel/700.css";
import "@fontsource/cinzel/900.css";
import "@fontsource/creepster/400.css";

export const FONTES = {
  impacto: "Anton",
  moderno: "Montserrat",
  biblico: "Cinzel",
  terror: "Creepster",
};

let pronto = false;
/** Chame uma vez no topo da composição: segura o render até as fontes carregarem. */
export const carregarFontes = () => {
  if (pronto || typeof document === "undefined") return;
  pronto = true;
  const h = delayRender("fontes");
  Promise.all([
    document.fonts.load('400 80px "Anton"', "ÁÉÇÃõ"),
    document.fonts.load('900 80px "Montserrat"', "ÁÉÇÃõ"),
    document.fonts.load('800 80px "Montserrat"', "ÁÉÇÃõ"),
    document.fonts.load('700 80px "Cinzel"', "ÁÉÇ"),
    document.fonts.load('900 80px "Cinzel"', "ÁÉÇ"),
    document.fonts.load('400 80px "Creepster"', "ABC"),
  ])
    .then(() => continueRender(h))
    .catch(() => continueRender(h));
};
