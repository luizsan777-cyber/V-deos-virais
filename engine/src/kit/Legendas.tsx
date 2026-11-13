// Legendas palavra a palavra, sincronizadas com a narração.
// Brancas, palavras de destaque em amarelo, pop na palavra ativa, entrada/saída animadas.
// Posição na área segura de Shorts/Reels/TikTok (fora dos 22% de baixo e da coluna de ícones à direita).
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { clamp01, eback, eout, ramp } from "./anim";
import { useTempos, Palavra } from "./tempo";
import { FONTES } from "./fontes";

export type EstiloLegenda = {
  fonte: string;
  peso: number;
  maiusculas: boolean;
  tamanho: number; // px em 1080 de largura
  cor: string;
  destaque: string;
  contorno: string;
  sombra: string;
  y: number; // centro vertical (fração da altura)
  maxPalavras: number;
  maxLetras: number;
};

export const LEGENDA_ESTILOS: Record<string, EstiloLegenda> = {
  impacto: { fonte: FONTES.impacto, peso: 400, maiusculas: true, tamanho: 104, cor: "#ffffff", destaque: "#ffd60a", contorno: "#000000", sombra: "rgba(0,0,0,0.65)", y: 0.64, maxPalavras: 3, maxLetras: 18 },
  moderno: { fonte: FONTES.moderno, peso: 900, maiusculas: true, tamanho: 84, cor: "#ffffff", destaque: "#ffd60a", contorno: "#000000", sombra: "rgba(0,0,0,0.6)", y: 0.64, maxPalavras: 3, maxLetras: 18 },
  biblico: { fonte: FONTES.biblico, peso: 900, maiusculas: true, tamanho: 76, cor: "#fffaf0", destaque: "#ffd166", contorno: "#1a0f05", sombra: "rgba(30,12,0,0.7)", y: 0.65, maxPalavras: 3, maxLetras: 18 },
  terror: { fonte: FONTES.impacto, peso: 400, maiusculas: true, tamanho: 100, cor: "#f2f2f2", destaque: "#ffd60a", contorno: "#000000", sombra: "rgba(120,0,0,0.75)", y: 0.64, maxPalavras: 3, maxLetras: 18 },
};

type Bloco = { palavras: Palavra[]; ini: number; fim: number };

const blocos = (ps: Palavra[], maxP: number, maxL: number): Bloco[] => {
  const out: Bloco[] = [];
  let atual: Palavra[] = [];
  const fecha = () => {
    if (atual.length) out.push({ palavras: atual, ini: atual[0].ini, fim: atual[atual.length - 1].fim });
    atual = [];
  };
  ps.forEach((p, i) => {
    const letras = atual.reduce((s, a) => s + a.w.length + 1, 0) + p.w.length;
    if (atual.length && (atual.length >= maxP || letras > maxL || atual[0].fala !== p.fala)) fecha();
    atual.push(p);
    if (/[.!?…,;:]$/.test(p.w) || i === ps.length - 1) fecha();
  });
  // estende cada bloco até o próximo (sem buracos curtos)
  for (let i = 0; i < out.length - 1; i++) if (out[i + 1].ini - out[i].fim < 0.6) out[i].fim = out[i + 1].ini;
  return out;
};

export const Legendas: React.FC<{ estilo?: keyof typeof LEGENDA_ESTILOS | EstiloLegenda; y?: number }> = ({ estilo = "impacto", y }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const T = useTempos();
  const E = typeof estilo === "string" ? LEGENDA_ESTILOS[estilo] : estilo;
  const bs = React.useMemo(() => blocos(T.raw.palavras, E.maxPalavras, E.maxLetras), [T.raw.palavras, E.maxPalavras, E.maxLetras]);
  const t = f / T.fps;
  const b = bs.find((x) => t >= x.ini - 0.03 && t < x.fim + 0.12);
  if (!b) return null;
  const fi = T.fr(b.ini) - 1, ff = T.fr(b.fim) + 3;
  const entra = eback(ramp(f, fi, fi + 5));
  const sai = 1 - ramp(f, ff - 3, ff);
  const k = width / 1080;
  const yc = (y ?? E.y) * height;
  const limpa = (w: string) => (E.maiusculas ? w.toUpperCase() : w).replace(/[,;:]$/, "");
  return (
    <div
      style={{
        position: "absolute", left: 70 * k, right: 150 * k, top: yc, transform: `translateY(-50%) scale(${0.75 + 0.25 * entra})`,
        opacity: clamp01(entra * 1.5) * sai, display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "baseline",
        columnGap: 30 * k, rowGap: 0, textAlign: "center", lineHeight: 1.08,
      }}
    >
      {b.palavras.map((p, i) => {
        const pi = T.fr(p.ini), pf = T.fr(p.fim);
        const ativa = f >= pi && f < pf + 2;
        const pop = ativa ? 1 + 0.08 * (1 - eout(ramp(f, pi, pi + 6))) : 1;
        const dita = f >= pi;
        const cor = p.destaque ? E.destaque : E.cor;
        return (
          <span
            key={i}
            style={{
              fontFamily: E.fonte, fontWeight: E.peso, fontSize: E.tamanho * k * (p.destaque ? 1.08 : 1), color: cor,
              transform: `scale(${pop}) translateY(${ativa ? -4 * k : 0}px) rotate(${p.destaque && ativa ? -2 : 0}deg)`,
              display: "inline-block", letterSpacing: E.fonte === FONTES.impacto ? 1 : 0,
              WebkitTextStroke: `${10 * k}px ${E.contorno}`, paintOrder: "stroke fill",
              textShadow: `0 ${6 * k}px ${14 * k}px ${E.sombra}`,
              opacity: dita ? 1 : 0.92,
            }}
          >
            {limpa(p.w)}
          </span>
        );
      })}
    </div>
  );
};
