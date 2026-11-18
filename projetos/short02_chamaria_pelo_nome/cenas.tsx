// SHORT 02 — "Mesmo depois de tudo, Jesus ainda te chamaria pelo nome." (5 s, rua ao amanhecer)
// Reflexão do vídeo, não citação bíblica.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Camera } from "../../engine/src/kit/Camera";
import { Personagem, Visual } from "../../engine/src/kit/Personagem";
import { parado, andando, misturaPose, Pose } from "../../engine/src/kit/poses";
import { EXPRESSOES, misturaExpr } from "../../engine/src/kit/expressoes";
import { clamp01, eio, lerp, piscar, ramp, rnd, wobble } from "../../engine/src/kit/anim";
import { useCena } from "../../engine/src/kit/tempo";
import { JESUS, ESTILO_JESUS, estiloLuz, Halo, TINTA } from "../shorts_cristaos_kit/kit";

const PESSOA: Visual = { pele: "#d6a27c", cabelo: "coque", corCabelo: "#2a1a10", roupa: "moletom", cor: "#2f8f8a", cor2: "#3fa8a2", calca: "#3b3550", sapato: "#5a4a40", corpo: "medio", corOlho: "#2a1a10" };

const Casa: React.FC<{ x: number; y: number; w: number; h: number; cor: string; tel: string; s: number }> = ({ x, y, w, h, cor, tel, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-w / 2} y={-h} width={w} height={h} fill={cor} stroke={TINTA} strokeWidth={7} />
    <path d={`M ${-w / 2 - 20},${-h} L 0,${-h - w * 0.45} L ${w / 2 + 20},${-h} Z`} fill={tel} stroke={TINTA} strokeWidth={7} />
    <rect x={-w * 0.32} y={-h * 0.72} width={w * 0.24} height={h * 0.26} fill="#ffe6a8" stroke={TINTA} strokeWidth={5} />
    <rect x={w * 0.08} y={-h * 0.72} width={w * 0.24} height={h * 0.26} fill="#ffe6a8" stroke={TINTA} strokeWidth={5} />
    <rect x={-w * 0.12} y={-h * 0.38} width={w * 0.24} height={h * 0.38} fill="#8a5a3a" stroke={TINTA} strokeWidth={5} />
  </g>
);
const Moita: React.FC<{ x: number; y: number; s: number; flor: string; seed: number; f: number }> = ({ x, y, s, flor, seed, f }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-40, 0, 40].map((dx, k) => <circle key={k} cx={dx} cy={-30 - (k === 1 ? 20 : 0)} r={50} fill={["#3fae5a", "#4cc26a", "#36a050"][k]} stroke={TINTA} strokeWidth={6} />)}
    {Array.from({ length: 5 }, (_, k) => <circle key={k} cx={-50 + rnd(`fl${seed}${k}`) * 100} cy={-70 + rnd(`fy${seed}${k}`) * 50 + Math.sin(f * 0.08 + k) * 2} r={9} fill={flor} stroke={TINTA} strokeWidth={3} />)}
  </g>
);

const Rua: React.FC<{ f: number; sol: number }> = ({ f, sol }) => (
  <g>
    <defs>
      <linearGradient id="s2ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff7aa8" /><stop offset="0.45" stopColor="#ff9a5c" /><stop offset="0.8" stopColor="#ffd27a" /><stop offset="1" stopColor="#fff0b8" /></linearGradient>
      <radialGradient id="s2sol" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#fff6c8" /><stop offset="0.3" stopColor="#ffe08a" stopOpacity={0.8} /><stop offset="1" stopColor="#ffe08a" stopOpacity={0} /></radialGradient>
      <linearGradient id="s2rua" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f7d29a" /><stop offset="1" stopColor="#c9946a" /></linearGradient>
    </defs>
    <rect x={-600} y={-400} width={2300} height={1500} fill="url(#s2ceu)" />
    <circle cx={560} cy={1010} r={520 + sol * 60} fill="url(#s2sol)" />
    <circle cx={560} cy={1010} r={90} fill="#fff6d0" />
    {Array.from({ length: 12 }, (_, i) => { const a = Math.PI + (i / 11) * Math.PI; return <path key={i} d={`M 560,1010 L ${560 + Math.cos(a - 0.05) * 1500},${1010 + Math.sin(a - 0.05) * 1500} L ${560 + Math.cos(a + 0.05) * 1500},${1010 + Math.sin(a + 0.05) * 1500} Z`} fill="#fff4c8" opacity={0.12 + 0.06 * Math.sin(f * 0.05 + i)} />; })}
    {/* nuvens rosadas */}
    {[[150, 320, 1.0], [820, 240, 0.8], [520, 420, 0.6]].map(([x, y, s], i) => <ellipse key={i} cx={(x as number) + f * 0.3 * (i + 1)} cy={y} rx={150 * (s as number)} ry={40 * (s as number)} fill="#ffd0e0" opacity={0.85} />)}
    {/* chão e rua em perspectiva até o sol */}
    <rect x={-600} y={1040} width={2300} height={1300} fill="#8fcf7a" />
    <path d="M 500,1040 L 620,1040 L 1400,2100 L -300,2100 Z" fill="url(#s2rua)" stroke={TINTA} strokeWidth={6} />
    {[0, 1, 2, 3, 4].map((k) => { const t = (k + 1) / 6, y = 1040 + Math.pow(t, 1.7) * 1060; return <rect key={k} x={560 - 6 - t * 18} y={y} width={12 + t * 36} height={20 + t * 50} fill="#fff6dc" opacity={0.85} />; })}
    {/* casas quentes dos dois lados */}
    <Casa x={170} y={1080} w={260} h={300} cor="#ffb36b" tel="#d9534f" s={1.0} />
    <Casa x={-60} y={1220} w={300} h={330} cor="#ffcf6b" tel="#c0563f" s={1.15} />
    <Casa x={930} y={1080} w={260} h={300} cor="#ff8f7a" tel="#a8463a" s={1.0} />
    <Casa x={1170} y={1220} w={300} h={330} cor="#ffd9a0" tel="#c0563f" s={1.15} />
    <Moita x={340} y={1120} s={0.6} flor="#ff6fa0" seed={1} f={f} />
    <Moita x={760} y={1120} s={0.6} flor="#ffe14d" seed={2} f={f} />
    <Moita x={60} y={1500} s={1.0} flor="#ff6fa0" seed={3} f={f} />
    <Moita x={1040} y={1520} s={1.0} flor="#ffffff" seed={4} f={f} />
  </g>
);

export const Cena01: React.FC<{ inicio: number; fim: number }> = ({ inicio, fim }) => {
  const { lf } = useCena(inicio);
  const dur = fim - inicio;
  const olha = eio(ramp(lf, 40, 62));            // levanta o olhar e vê Jesus
  const mao = eio(ramp(lf, 55, 80));             // Jesus estende a mão
  const passo = eio(ramp(lf, 104, 132));         // pequeno passo em direção a Jesus
  const sorri = eio(ramp(lf, 104, 122));
  const px = lerp(400, 460, passo), py = 1840, esc = 1.18;
  const andandoP = andando(lf, 1.0, 3);
  const baseP: Pose = { ...parado(lf, 3), cabecaIncl: lerp(16, -4, olha), olhar: [lerp(0, 0.6, olha), lerp(0.9, -0.4, olha)], virar: lerp(0, 0.35, olha), bracoE: [12, 20], bracoD: [12, 20] };
  const pPose = passo > 0 && passo < 1 ? misturaPose(baseP, { ...andandoP, cabecaIncl: -4, olhar: [0.6, -0.4], virar: 0.35 }, Math.sin(passo * Math.PI)) : baseP;
  const arrep = { ...misturaExpr(EXPRESSOES.triste, EXPRESSOES.pensativo, 0.2), palpebra: 0.45 };
  const exprP = misturaExpr(misturaExpr(arrep, EXPRESSOES.surpreso, olha * 0.5), { ...EXPRESSOES.sereno, bocaCurva: 0.35 }, sorri);
  const jx = 790, jy = 1430, jesc = 0.82;
  const jPose: Pose = { ...parado(lf, 6), bracoD: [lerp(12, 44, mao), lerp(10, 34, mao)], maoD: "aberta", frenteD: mao > 0.5, olhar: [-0.7, 0.3], cabecaIncl: 4 };
  const exprJ = misturaExpr(EXPRESSOES.sereno, { ...EXPRESSOES.feliz, bocaAbre: 0.05, dentes: 0 }, eio(ramp(lf, 108, 128)) * 0.6);
  return (
    <AbsoluteFill style={{ backgroundColor: "#ff9a6a" }}>
      <Camera inicio={inicio} chaves={[[0, 420, 1250, 2.05], [38, 430, 1240, 2.1], [72, 570, 1250, 1.3], [dur, 590, 1250, 1.38]]} deriva={0}>
        <Rua f={lf} sol={olha} />
        <Halo x={jx} y={1180} id="s2" rx={240} ry={420} op={0.6 + 0.4 * olha} />
        <Personagem id="s2-j" x={jx} y={jy} escala={jesc} dir={-1} visual={JESUS} estilo={ESTILO_JESUS} pose={jPose} expr={exprJ} olhosAbertos={piscar(lf, 8)} />
        <Personagem id="s2-p" x={px} y={py} escala={esc} visual={PESSOA} estilo={estiloLuz(0.6 + 0.4 * olha, "#ffe0a0")} pose={pPose} expr={exprP} olhosAbertos={piscar(lf, 5)} />
      </Camera>
    </AbsoluteFill>
  );
};
