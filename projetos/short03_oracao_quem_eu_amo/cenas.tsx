// SHORT 03 — "Jesus, cuida de quem eu amo, mesmo quando está longe." (5 s, janela ao entardecer)
// Tema: distância e saudade (não luto). A pessoa querida aparece viva, em outro lugar, recebendo uma mensagem.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Camera } from "../../engine/src/kit/Camera";
import { Personagem, Visual, ESTILOS_PERSONAGEM } from "../../engine/src/kit/Personagem";
import { parado, misturaPose, Pose } from "../../engine/src/kit/poses";
import { EXPRESSOES, misturaExpr } from "../../engine/src/kit/expressoes";
import { clamp01, eback, eio, lerp, piscar, ramp, wobble } from "../../engine/src/kit/anim";
import { useCena } from "../../engine/src/kit/tempo";
import { estiloLuz, Coracao, Tela, TINTA } from "../shorts_cristaos_kit/kit";

const PESSOA: Visual = { pele: "#e8b88f", cabelo: "longo", corCabelo: "#4a2a18", roupa: "moletom", cor: "#c77dba", cor2: "#d896cc", calca: "#3b3550", sapato: "#5a4a40", corpo: "medio", corOlho: "#3a2416" };
const QUERIDO: Visual = { pele: "#a8744f", cabelo: "curto", corCabelo: "#1d1210", roupa: "camiseta", cor: "#3f8fd8", calca: "#2b2d42", sapato: "#fff", corpo: "medio" };

// porta-retrato com desenho simples (sem rostos realistas)
const PortaRetrato: React.FC = () => (
  <g transform="translate(-6 -10) rotate(-6)">
    <rect x={-58} y={-74} width={116} height={140} rx={10} fill="#c58a4a" stroke={TINTA} strokeWidth={6} />
    <rect x={-44} y={-60} width={88} height={112} rx={4} fill="#bfe3ff" />
    <circle cx={-14} cy={-14} r={14} fill="#e8b88f" stroke={TINTA} strokeWidth={3} />
    <circle cx={16} cy={-12} r={14} fill="#a8744f" stroke={TINTA} strokeWidth={3} />
    <path d="M -36,40 C -32,6 6,6 4,40 Z" fill="#c77dba" stroke={TINTA} strokeWidth={3} />
    <path d="M -4,40 C -2,8 36,8 38,40 Z" fill="#3f8fd8" stroke={TINTA} strokeWidth={3} />
  </g>
);

const Quarto: React.FC<{ f: number; luz: number }> = ({ f, luz }) => (
  <g>
    <defs>
      <linearGradient id="s3ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3f6fd8" /><stop offset="0.45" stopColor="#ff8fa8" /><stop offset="0.8" stopColor="#ffa95c" /><stop offset="1" stopColor="#ffd98a" /></linearGradient>
      <linearGradient id="s3feixe" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd27a" stopOpacity={0.8} /><stop offset="1" stopColor="#ffd27a" stopOpacity={0} /></linearGradient>
    </defs>
    <rect x={-600} y={-400} width={2300} height={1900} fill="#f3d2b8" />
    {Array.from({ length: 14 }, (_, i) => <rect key={i} x={-600 + i * 160} y={-400} width={60} height={1900} fill="#efc7aa" />)}
    {/* janela grande com céu do entardecer */}
    <g transform="translate(520 280)">
      <rect x={0} y={0} width={560} height={760} fill="url(#s3ceu)" />
      <circle cx={300} cy={560} r={95} fill="#fff1c0" />
      {[[40, 200], [330, 140], [180, 320]].map(([x, y], i) => <ellipse key={i} cx={x + f * 0.25 * (i + 1)} cy={y} rx={110} ry={28} fill="#ffd0e0" opacity={0.85} />)}
      {[0, 70, 130, 200, 280, 350, 430, 490].map((x, i) => <rect key={i} x={x} y={760 - (90 + (i * 53) % 120)} width={64} height={90 + (i * 53) % 120} fill="#7a4a8a" opacity={0.75} />)}
      <rect x={0} y={0} width={560} height={760} fill="none" stroke="#f7efe6" strokeWidth={24} />
      <line x1={280} y1={0} x2={280} y2={760} stroke="#f7efe6" strokeWidth={14} />
      <rect x={-30} y={756} width={620} height={36} rx={8} fill="#f7efe6" stroke={TINTA} strokeWidth={6} />
      {/* cortinas */}
      <path d={`M -60,-20 C 0,${200 + Math.sin(f * 0.05) * 6} -40,520 -10,800 L -90,800 L -90,-20 Z`} fill="#ff9fb8" stroke={TINTA} strokeWidth={6} />
      <path d={`M 620,-20 C 560,${200 + Math.sin(f * 0.05 + 1) * 6} 600,520 570,800 L 650,800 L 650,-20 Z`} fill="#ff9fb8" stroke={TINTA} strokeWidth={6} />
    </g>
    {/* luz dourada entrando */}
    <path d="M 560,1040 L 1080,1040 L 700,1900 L -100,1900 Z" fill="url(#s3feixe)" opacity={0.35 + 0.5 * luz} />
    {/* prateleira com planta e porta-retrato pequeno */}
    <g transform="translate(40 700)">
      <rect x={0} y={0} width={340} height={22} rx={6} fill="#a8744f" stroke={TINTA} strokeWidth={6} />
      <path d="M 40,0 L 100,0 L 92,-60 L 48,-60 Z" fill="#e0703a" stroke={TINTA} strokeWidth={5} />
      {[-40, -10, 20].map((a, k) => <path key={k} transform={`translate(70 -60) rotate(${a + wobble(f, k, 0.3) * 3})`} d="M 0,0 C 10,-40 26,-60 36,-80 C 18,-66 4,-46 0,0 Z" fill="#3fbf6a" stroke={TINTA} strokeWidth={4} />)}
      <rect x={200} y={-80} width={70} height={80} rx={6} fill="#ffe6c8" stroke={TINTA} strokeWidth={5} />
    </g>
    <rect x={-600} y={1500} width={2300} height={600} fill="#c98a5a" />
  </g>
);

export const Cena01: React.FC<{ inicio: number; fim: number }> = ({ inicio, fim }) => {
  const { lf } = useCena(inicio);
  const dur = fim - inicio;
  const peito = eio(ramp(lf, 42, 66));          // aproxima o porta-retrato do coração
  const fecha = clamp01(ramp(lf, 58, 66)) * (1 - clamp01(ramp(lf, 92, 100)));
  const ceu = eio(ramp(lf, 98, 118));           // olha para o céu e sorri
  const longe = eback(ramp(lf, 104, 122));       // pessoa querida, em outro lugar, recebendo mensagem
  const luz = eio(ramp(lf, 40, 100));
  const px = 400, py = 1820, esc = 1.15;
  const pose: Pose = {
    ...parado(lf, 2),
    bracoD: [lerp(52, 34, peito), lerp(128, 150, peito)], frenteD: true, maoD: "aberta",
    bracoE: [lerp(18, 40, peito), lerp(30, 130, peito)], frenteE: peito > 0.4,
    olhar: [lerp(0.3, 0.6, ceu), lerp(0.85, -0.9, ceu)], cabecaIncl: lerp(10, -10, ceu), virar: lerp(0.2, 0.45, ceu),
  };
  const exprBase = { ...misturaExpr(EXPRESSOES.sereno, EXPRESSOES.triste, 0.45), palpebra: 0.3 };
  const expr = misturaExpr(exprBase, { ...EXPRESSOES.sereno, bocaCurva: 0.5 }, ceu);
  return (
    <AbsoluteFill style={{ backgroundColor: "#f3d2b8" }}>
      <Camera inicio={inicio} chaves={[[0, 430, 1340, 2.1], [42, 440, 1350, 2.15], [92, 620, 1080, 1.3], [dur, 640, 1100, 1.25]]} deriva={0}>
        <Quarto f={lf} luz={luz} />
        <Personagem id="s3-p" x={px} y={py} escala={esc} visual={PESSOA} estilo={estiloLuz(luz, "#ffd98a")} pose={pose} expr={expr} olhosAbertos={1 - fecha} itemD={<PortaRetrato />} />
      </Camera>
      {/* em outro lugar: a pessoa querida, viva e bem, recebe uma mensagem com um coração */}
      {longe > 0 && (
        <Tela>
          <g transform={`translate(780 560) scale(${longe})`}>
            <circle r={210} fill="#bfe6ff" stroke="#ffffff" strokeWidth={12} />
            <clipPath id="s3lg"><circle r={204} /></clipPath>
            <g clipPath="url(#s3lg)">
              <rect x={-220} y={-220} width={440} height={300} fill="#9fd8ff" />
              {[[-170, 60], [-90, 110], [40, 80], [120, 130]].map(([x, h], i) => <rect key={i} x={x} y={60 - h} width={60} height={h} fill="#7ab0d8" />)}
              <rect x={-220} y={60} width={440} height={200} fill="#8fcf7a" />
              <Personagem id="s3-q" x={-20} y={330} escala={0.62} dir={-1} visual={QUERIDO} estilo={ESTILOS_PERSONAGEM.conto}
                pose={{ ...parado(lf, 9), bracoD: [40, 120], frenteD: true, olhar: [-0.2, 0.8], cabecaIncl: 8 }} expr={EXPRESSOES.feliz} olhosAbertos={piscar(lf, 9)}
                itemD={<g><rect x={-20} y={-34} width={40} height={68} rx={7} fill="#1b1e2a" stroke={TINTA} strokeWidth={3} /><rect x={-15} y={-28} width={30} height={54} rx={3} fill="#fff4f8" /></g>} />
              <g transform={`translate(70 -60) scale(${eback(ramp(lf, 116, 128))})`}><rect x={-62} y={-30} width={124} height={60} rx={20} fill="#ffffff" stroke={TINTA} strokeWidth={5} /><g transform="translate(0 2) scale(0.7)"><Coracao /></g></g>
            </g>
          </g>
        </Tela>
      )}
    </AbsoluteFill>
  );
};
