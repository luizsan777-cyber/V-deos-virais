// Identidade do canal "Contos depois da meia Noite": avatar jovem (cabelo escuro, camiseta escura, fone) + utilidades
// comuns das curiosidades 2D (posição de cabeça/mão do rig, selos, sobreposição HyperFrames). Novo arquivo: não altera o kit existente.
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { Personagem, Visual, Estilo, ESTILOS_PERSONAGEM } from "./Personagem";
import { Pose } from "./poses";
import { Expr } from "./expressoes";
import { eback, eio, piscar, ramp } from "./anim";

export const TINTA_CANAL = "#10121f";
export const AVATAR: Visual = { pele: "#c68e66", cabelo: "topete", corCabelo: "#16121a", roupa: "camiseta", cor: "#262b38", cor2: "#3b4252", calca: "#3b4a6b", sapato: "#f0f0f0", corOlho: "#2a1a12", corpo: "medio" };
export const AMIGO_CANAL: Visual = { pele: "#8d5a3b", cabelo: "cacheado", corCabelo: "#1d1210", roupa: "moletom", cor: "#ff8c42", cor2: "#ffd2b0", calca: "#2b2d42", sapato: "#ffffff", corOlho: "#2a1a12", corpo: "medio" };
export const EST_CANAL: Estilo = ESTILOS_PERSONAGEM.conto;
export const EST_CANAL_NOITE: Estilo = { ...ESTILOS_PERSONAGEM.noite, brilho: 0.35 };

const rad = (d: number) => (d * Math.PI) / 180;
const rot = ([x, y]: [number, number], d: number): [number, number] => [x * Math.cos(rad(d)) - y * Math.sin(rad(d)), x * Math.sin(rad(d)) + y * Math.cos(rad(d))];
/** centro da cabeça do Personagem corpo "medio" (mesma conta do rig) */
export const cabecaDoRig = (x: number, y: number, escala: number, p: Pose, dir: 1 | -1 = 1): [number, number] => {
  const lean = p.tronco ?? 0;
  const q = -235 + (p.bob ?? 0) + (p.agachar ?? 0);
  const pe = rot([0, -205], lean);
  const a = rot([0, -90], lean + (p.cabecaIncl ?? 0) * 0.3);
  return [x + dir * escala * ((p.dx ?? 0) + pe[0] + a[0]), y + escala * (q + pe[1] + a[1])];
};
/** posição da mão (lado 1 = bracoD, -1 = bracoE) */
export const maoDoRig = (x: number, y: number, escala: number, p: Pose, lado: 1 | -1, dir: 1 | -1 = 1): [number, number] => {
  const lean = p.tronco ?? 0;
  const resp = Math.sin(p.respirar ?? 0) * 2.2;
  const q: [number, number] = [p.dx ?? 0, -235 + (p.bob ?? 0) + (p.agachar ?? 0)];
  const pe = rot([0, -205 - resp], lean);
  const om = rot([lado * 64, 26], lean);
  const S: [number, number] = [q[0] + pe[0] + om[0], q[1] + pe[1] + om[1]];
  const a = lado > 0 ? p.bracoD : p.bracoE;
  const d1 = rot([lado * Math.sin(rad(a[0])), Math.cos(rad(a[0]))], lean);
  const C: [number, number] = [S[0] + d1[0] * 108, S[1] + d1[1] * 108];
  const d2 = rot([lado * Math.sin(rad(a[0] - a[1])), Math.cos(rad(a[0] - a[1]))], lean);
  return [x + dir * escala * (C[0] + d2[0] * 98), y + escala * (C[1] + d2[1] * 98)];
};

/** Fone de ouvido sobre a cabeça do avatar (arco + conchas), acompanha inclinação. */
export const Fone: React.FC<{ c: [number, number]; escala: number; incl?: number; cor?: string }> = ({ c, escala, incl = 0, cor = "#e53935" }) => (
  <g transform={`translate(${c[0]} ${c[1]}) rotate(${incl}) scale(${escala})`}>
    <path d="M -96,-6 C -100,-120 100,-120 96,-6" fill="none" stroke="#1b1d26" strokeWidth={16} strokeLinecap="round" />
    <path d="M -96,-6 C -100,-120 100,-120 96,-6" fill="none" stroke={cor} strokeWidth={6} strokeLinecap="round" opacity={0.9} />
    {[-1, 1].map((s) => <rect key={s} x={s > 0 ? 82 : -112} y={-30} width={30} height={60} rx={14} fill={cor} stroke="#1b1d26" strokeWidth={7} />)}
  </g>
);

/** O avatar do canal com o fone já posicionado. */
export const Avatar: React.FC<{ id: string; x: number; y: number; escala: number; pose: Pose; expr: Expr; f: number; dir?: 1 | -1; estilo?: Estilo; fone?: boolean; itemD?: React.ReactNode; itemE?: React.ReactNode; boca?: number; visual?: Visual }> = ({
  id, x, y, escala, pose, expr, f, dir = 1, estilo = EST_CANAL, fone = true, itemD, itemE, boca, visual = AVATAR,
}) => (
  <g>
    <Personagem id={id} x={x} y={y} escala={escala} dir={dir} visual={visual} estilo={estilo} pose={pose} expr={expr} olhosAbertos={piscar(f, 4)} itemD={itemD} itemE={itemE} boca={boca} />
    {fone && <Fone c={cabecaDoRig(x, y, escala, pose, dir)} escala={escala} incl={dir * (pose.cabecaIncl ?? 0) * 0.3 + dir * (pose.tronco ?? 0)} />}
  </g>
);

/** Selo de texto curto (pop de entrada/saída). */
export const SeloCanal: React.FC<{ f: number; em: number; ate?: number; t: string; x?: number; y?: number; tam?: number; cor?: string; fundo?: string }> = ({
  f, em, ate = 1e9, t, x = 540, y = 330, tam = 66, cor = TINTA_CANAL, fundo = "#ffd60a",
}) => {
  if (f < em || f > ate) return null;
  const s = eback(ramp(f, em, em + 9)) * (1 - eio(ramp(f, ate - 7, ate)));
  const w = Math.min(980, t.length * tam * 0.56 + 70);
  return (
    <g transform={`translate(${x} ${y}) rotate(${-2 + Math.sin(f * 0.06) * 0.8}) scale(${s})`}>
      <rect x={-w / 2 + 8} y={-tam * 0.8 + 10} width={w} height={tam * 1.45} rx={18} fill={TINTA_CANAL} opacity={0.45} />
      <rect x={-w / 2} y={-tam * 0.8} width={w} height={tam * 1.45} rx={18} fill={fundo} stroke={TINTA_CANAL} strokeWidth={7} />
      <text y={tam * 0.32} textAnchor="middle" fontFamily="Anton" fontSize={tam} fill={cor} letterSpacing={1}>{t}</text>
    </g>
  );
};

/** Tarja discreta fixa (ex.: "SIMULAÇÃO"), fora das áreas de interface. */
export const TarjaCanal: React.FC<{ t: string; f: number; cor?: string }> = ({ t, f, cor = "#ffd60a" }) => (
  <g transform="translate(40 150)" opacity={0.92}>
    <rect width={t.length * 17 + 80} height={56} rx={16} fill="#111a2e" stroke={cor} strokeWidth={4} />
    <circle cx={30} cy={28} r={9} fill={cor} opacity={0.5 + 0.5 * Math.sin(f * 0.2)} />
    <text x={52} y={38} fontFamily="Montserrat" fontWeight={900} fontSize={26} fill="#fff3b3">{t}</text>
  </g>
);

/** Sobreposição renderizada pelo HyperFrames (sequência PNG com transparência em engine/public/hf/<nome>/). */
export const OverlayHyperFrames: React.FC<{ nome: string; inicio: number; quadros: number }> = ({ nome, inicio, quadros }) => {
  const f = useCurrentFrame() - inicio;
  if (f < 0 || f >= quadros) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Img src={staticFile(`hf/${nome}/frame_${String(f + 1).padStart(6, "0")}.png`)} style={{ width: "100%", height: "100%" }} />
    </AbsoluteFill>
  );
};
