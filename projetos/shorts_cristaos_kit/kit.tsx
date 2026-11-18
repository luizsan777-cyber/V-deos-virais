// Kit dos shorts cristãos de 5 s: personagens fixos, gestos, halo, legendas em blocos e ícones desenhados.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Visual, Estilo, ESTILOS_PERSONAGEM } from "../../engine/src/kit/Personagem";
import { parado, Pose } from "../../engine/src/kit/poses";
import { clamp01, eback, lerp } from "../../engine/src/kit/anim";
import { useTempos } from "../../engine/src/kit/tempo";
import { maoDoRig, TINTA_CANAL as TINTA } from "../../engine/src/kit/canal";

export const W = 1080, H = 1920;
export { TINTA };
export const Tela: React.FC<{ children: React.ReactNode; op?: number }> = ({ children, op = 1 }) => <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: op }}>{children}</svg>;

// mesma representação de Jesus usada no vídeo "Deus em silêncio"
export const JESUS: Visual = { pele: "#c99a74", cabelo: "longo", corCabelo: "#5a3a22", roupa: "tunica", cor: "#f4efe4", cor2: "#c9a46a", calca: "#f4efe4", sapato: "#8a6a4a", barba: "longa", corpo: "medio", corOlho: "#3a2416" };
export const ESTILO_JESUS: Estilo = { ...ESTILOS_PERSONAGEM.conto, brilho: 0.6, corBrilho: "#fff1c4" };
export const estiloLuz = (quente: number, cor = "#ffd98a"): Estilo => ({ ...ESTILOS_PERSONAGEM.conto, brilho: lerp(0.3, 0.6, quente), corBrilho: cor });

export const mix = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return "#" + pa.map((v, i) => Math.round(lerp(v, pb[i], clamp01(t))).toString(16).padStart(2, "0")).join("");
};

// sentado na beira da cama: pernas para baixo, escondidas pela frente do colchão
export const sentado = (f: number, seed = 1, extra: Partial<Pose> = {}): Pose => ({ ...parado(f, seed), agachar: 120, bracoE: [20, 60], bracoD: [20, 60], ...extra, pernaE: [6, 4], pernaD: [6, 4] });

// braço direito alcança um ponto (busca simples de ângulos)
export const alcanca = (x: number, y: number, esc: number, base: Pose, alvo: [number, number], dir: 1 | -1 = 1): Pose => {
  let melhor: Pose = base, dmin = 1e9;
  for (let a = 30; a <= 170; a += 4) for (let b = 0; b <= 100; b += 8) {
    const p = { ...base, bracoD: [a, b] as [number, number], frenteD: true };
    const [mx, my] = maoDoRig(x, y, esc, p, 1, dir);
    const d = Math.hypot(mx - alvo[0], my - alvo[1]);
    if (d < dmin) { dmin = d; melhor = p; }
  }
  return melhor;
};

export const Halo: React.FC<{ x: number; y?: number; id: string; op?: number; rx?: number; ry?: number }> = ({ x, y = 1250, id, op = 1, rx = 330, ry = 560 }) => (
  <g opacity={op}>
    <defs><radialGradient id={`${id}h`} cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#fff3cc" stopOpacity={0.55} /><stop offset="0.6" stopColor="#ffe6a8" stopOpacity={0.18} /><stop offset="1" stopColor="#ffe6a8" stopOpacity={0} /></radialGradient></defs>
    <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={`url(#${id}h)`} />
  </g>
);

// ícones desenhados (no lugar de emoji, que depende de fonte)
export const Coracao: React.FC<{ s?: number; cor?: string }> = ({ s = 1, cor = "#ff3b5c" }) => (
  <path transform={`scale(${s})`} d="M 0,26 C -44,-2 -36,-34 -12,-32 C -4,-31 0,-24 0,-18 C 0,-24 4,-31 12,-32 C 36,-34 44,-2 0,26 Z" fill={cor} stroke={TINTA} strokeWidth={5} />
);
export const Brilho: React.FC<{ s?: number; f: number }> = ({ s = 1, f }) => (
  <g transform={`scale(${s}) rotate(${Math.sin(f * 0.1) * 8})`}>
    <path d="M 0,-34 C 4,-8 8,-4 34,0 C 8,4 4,8 0,34 C -4,8 -8,4 -34,0 C -8,-4 -4,-8 0,-34 Z" fill="#ffd60a" stroke={TINTA} strokeWidth={5} />
    <path transform="translate(26 -24) scale(0.4)" d="M 0,-34 C 4,-8 8,-4 34,0 C 8,4 4,8 0,34 C -4,8 -8,4 -34,0 C -8,-4 -4,-8 0,-34 Z" fill="#fff4b0" stroke={TINTA} strokeWidth={8} />
  </g>
);

// ------------------------------------------------------------------ legendas em blocos (sincronizadas pelas palavras reais)
export type Bloco = { de: number; texto: string; amarelo?: string[]; icone?: "coracao" | "brilho" | "coracaoBranco" };
export const LegendaBlocos: React.FC<{ blocos: Bloco[]; y?: number; tam?: number }> = ({ blocos, y = 1490, tam = 92 }) => {
  const f = useCurrentFrame();
  const T = useTempos();
  const pal = T.raw.palavras;
  const ini = blocos.map((b) => Math.max(0, T.fr(pal[b.de].ini) - 2));
  let k = -1;
  for (let i = 0; i < blocos.length; i++) if (f >= ini[i]) k = i;
  if (k < 0) return null;
  const b = blocos[k];
  const s = eback(clamp01((f - ini[k]) / 6));
  const palavras = b.texto.split(" ");
  const linhas: string[][] = b.texto.length > 16 ? (() => { const m = Math.ceil(palavras.length / 2); return [palavras.slice(0, m), palavras.slice(m)]; })() : [palavras];
  const lh = tam * 1.12;
  const y0 = y - ((linhas.length - 1) * lh) / 2;
  const largura = (ws: string[]) => ws.join(" ").length * tam * 0.47;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={W} height={H}>
        <g transform={`translate(540 ${y}) scale(${0.85 + 0.15 * s}) translate(-540 ${-y})`} opacity={clamp01((f - ini[k]) / 3)}>
          {linhas.map((ws, li) => {
            const yy = y0 + li * lh;
            const ultima = li === linhas.length - 1;
            const desloc = ultima && b.icone ? -tam * 0.36 : 0;
            return (
              <g key={li}>
                <text x={540 + desloc} y={yy + tam * 0.35} textAnchor="middle" fontFamily="Anton" fontSize={tam} letterSpacing={1}
                  stroke={TINTA} strokeWidth={14} strokeLinejoin="round" paintOrder="stroke">
                  {ws.map((w, i) => <tspan key={i} fill={(b.amarelo ?? []).includes(w.replace(/[^A-ZÀ-Ú]/g, "")) ? "#ffd60a" : "#ffffff"}>{(i ? " " : "") + w}</tspan>)}
                </text>
                {ultima && b.icone && (
                  <g transform={`translate(${540 + desloc + largura(ws) / 2 + tam * 0.5} ${yy}) scale(${eback(clamp01((f - ini[k] - 4) / 8))})`}>
                    {b.icone === "coracao" && <Coracao s={1.25} />}
                    {b.icone === "coracaoBranco" && <Coracao s={1.25} cor="#ffffff" />}
                    {b.icone === "brilho" && <Brilho s={1.1} f={f} />}
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
