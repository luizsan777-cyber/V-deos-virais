// Elenco e cenário do episódio. Rafael é definido UMA vez e reaproveitado em todas as cenas.
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { useTempos } from "../../engine/src/kit/tempo";
import { Visual, ESTILOS_PERSONAGEM, Estilo } from "../../engine/src/kit/Personagem";
import { rnd, wobble } from "../../engine/src/kit/anim";

export const RAFAEL: Visual = { pele: "#c98f69", cabelo: "curto", corCabelo: "#141217", roupa: "camiseta", cor: "#8fcaf2", cor2: "#5aa2d6", calca: "#26304a", sapato: "#f5f5f5", corOlho: "#2a1a12", corpo: "medio" };
export const CIENTISTA: Visual = { pele: "#8d5a3b", cabelo: "coque", corCabelo: "#1d1210", roupa: "jaleco", cor: "#5b4bd8", cor2: "#ffcf3f", calca: "#2b2d42", sapato: "#3a2a20", oculos: true, corpo: "medio" };
export const EST: Estilo = ESTILOS_PERSONAGEM.conto;
export const EST_QUENTE: Estilo = { ...ESTILOS_PERSONAGEM.conto, brilho: 0.3, corBrilho: "#ffd59a" };

const TINTA = "#1a1424";

/** Sala de estar (mundo 1080 x 1920). Chão em y ≈ 1700. quente 0..1 deixa a luz mais dourada. */
export const Sala: React.FC<{ f: number; quente?: number }> = ({ f, quente = 0 }) => (
  <g>
    <defs>
      <linearGradient id="salaParede" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f6e7c8" /><stop offset="1" stopColor="#e8d2a6" /></linearGradient>
      <linearGradient id="salaCeu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7fc4ff" /><stop offset="1" stopColor="#d6efff" /></linearGradient>
      <radialGradient id="salaLuz"><stop offset="0" stopColor="#ffd28a" stopOpacity="0.55" /><stop offset="1" stopColor="#ffd28a" stopOpacity="0" /></radialGradient>
    </defs>
    <rect x={-600} y={-500} width={2300} height={2300} fill="url(#salaParede)" />
    {Array.from({ length: 26 }, (_, i) => <rect key={i} x={-600 + i * 90} y={-500} width={4} height={2300} fill="#d9c08f" opacity={0.35} />)}
    {/* janela com céu e nuvens */}
    <g transform="translate(760 620)">
      <rect x={-220} y={-260} width={440} height={520} rx={16} fill="url(#salaCeu)" stroke={TINTA} strokeWidth={12} />
      {[0, 1].map((i) => <ellipse key={i} cx={((f * (0.5 + i * 0.3) + i * 200) % 520) - 260} cy={-150 + i * 90} rx={70} ry={26} fill="#fff" opacity={0.85} />)}
      <path d="M -220,170 C -120,120 -40,160 40,130 C 120,100 170,150 220,130 L 220,260 L -220,260 Z" fill="#6fbf73" />
      <rect x={-6} y={-260} width={12} height={520} fill={TINTA} /><rect x={-220} y={-6} width={440} height={12} fill={TINTA} />
      <path d={`M -250,-290 C -220,-80 ${-270 + wobble(f, 1, 0.3) * 6},120 -235,290 L -170,290 C -200,110 -180,-70 -180,-290 Z`} fill="#e2795a" stroke={TINTA} strokeWidth={8} />
      <path d={`M 250,-290 C 220,-80 ${270 + wobble(f, 2, 0.3) * 6},120 235,290 L 170,290 C 200,110 180,-70 180,-290 Z`} fill="#e2795a" stroke={TINTA} strokeWidth={8} />
    </g>
    {/* quadro */}
    <g transform="translate(200 560) rotate(-2)"><rect x={-110} y={-140} width={220} height={280} fill="#2e86ab" stroke={TINTA} strokeWidth={9} /><circle cx={0} cy={-20} r={56} fill="#ffd23f" /><path d="M -80,110 L -10,20 L 80,110 Z" fill="#e4572e" /></g>
    {/* abajur de pé */}
    <g transform="translate(70 1700)">
      <ellipse cx={0} cy={-760} rx={260} ry={300} fill="url(#salaLuz)" opacity={0.6 + 0.4 * quente} />
      <rect x={-8} y={-640} width={16} height={640} fill="#3a2a22" />
      <path d="M -80,-640 L 80,-640 L 55,-760 L -55,-760 Z" fill="#ffe0a3" stroke={TINTA} strokeWidth={7} />
      <ellipse cx={0} cy={0} rx={70} ry={14} fill="#3a2a22" />
    </g>
    {/* chão */}
    <rect x={-600} y={1690} width={2300} height={500} fill="#b98a5e" />
    <rect x={-600} y={1680} width={2300} height={18} fill="#7a5638" />
    {Array.from({ length: 12 }, (_, i) => <line key={i} x1={-600 + i * 200} y1={1700} x2={-750 + i * 230} y2={2200} stroke="#9a7048" strokeWidth={4} />)}
    {/* sofá azul (encosto + assento) */}
    <rect x={60} y={1180} width={960} height={300} rx={60} fill="#3d7bd9" stroke={TINTA} strokeWidth={12} />
    <rect x={40} y={1420} width={1000} height={230} rx={40} fill="#2f63b3" stroke={TINTA} strokeWidth={12} />
    <rect x={20} y={1300} width={120} height={360} rx={50} fill="#3d7bd9" stroke={TINTA} strokeWidth={12} />
    <rect x={940} y={1300} width={120} height={360} rx={50} fill="#3d7bd9" stroke={TINTA} strokeWidth={12} />
    <rect x={60} y={1650} width={30} height={50} fill="#3a2a22" /><rect x={990} y={1650} width={30} height={50} fill="#3a2a22" />
    {/* luz quente */}
    <rect x={-600} y={-500} width={2300} height={2700} fill="#ffb347" opacity={0.12 * quente} style={{ mixBlendMode: "multiply" }} />
  </g>
);

/** Primeiro plano: mesa baixa com livro e caneca + planta (desenhar DEPOIS do personagem sentado). */
export const SalaFrente: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <g transform="translate(540 1720)">
      <rect x={-330} y={-70} width={660} height={44} rx={14} fill="#8a5a3c" stroke={TINTA} strokeWidth={9} />
      <rect x={-300} y={-26} width={26} height={140} fill="#6b4530" /><rect x={274} y={-26} width={26} height={140} fill="#6b4530" />
      <rect x={-220} y={-96} width={150} height={28} rx={4} fill="#e4572e" stroke={TINTA} strokeWidth={5} />
      <g transform="translate(150 -70)"><rect x={-28} y={-62} width={56} height={62} rx={8} fill="#f6f6f6" stroke={TINTA} strokeWidth={5} /><path d="M 28,-50 q 26,0 26,22 q 0,22 -26,22" stroke={TINTA} strokeWidth={5} fill="none" />
        {[0, 1].map((k) => { const u = ((f * 0.02 + k * 0.5) % 1); return <path key={k} d={`M ${-6 + k * 12},${-70 - u * 60} q 10,-12 0,-24`} stroke="#ffffff" strokeWidth={5} fill="none" opacity={(1 - u) * 0.8} />; })}
      </g>
    </g>
    <g transform="translate(1010 1880)">
      <path d="M -70,0 L 70,0 L 55,-150 L -55,-150 Z" fill="#c8553d" stroke={TINTA} strokeWidth={9} />
      {[[-40, -330, -200, -360], [20, -330, 150, -470], [-60, -260, -40, -520]].map(([a, b, c, d], i) => (
        <path key={i} transform={`rotate(${wobble(f, i, 0.4) * 3} 0 -150)`} d={`M 0,-150 C ${a},${b} ${c},${d} ${c * 0.9},${d - 20} C ${c * 0.6},${d * 0.8} ${a / 2},${b / 1.5} 0,-150 Z`} fill={i % 2 ? "#3b9156" : "#2f7a46"} stroke={TINTA} strokeWidth={7} />
      ))}
    </g>
  </g>
);

/** Tempo local: lf e P(palavra) procurando a partir do início da cena. */
export const useCena = (inicio: number) => {
  const f = useCurrentFrame();
  const T = useTempos();
  const limpa = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
  const P = (w: string, n = 1) => {
    let c = 0;
    for (const p of T.raw.palavras) if (T.fr(p.ini) >= inicio && limpa(p.w) === limpa(w) && ++c === n) return T.fr(p.ini) - inicio;
    throw new Error(`palavra '${w}' não existe depois do frame ${inicio}`);
  };
  return { lf: f - inicio, f, T, P };
};

/** Sobreposição renderizada pelo HyperFrames (sequência PNG com transparência em engine/public/hf/<nome>/). */
export const OverlayHF: React.FC<{ nome: string; inicio: number; quadros: number }> = ({ nome, inicio, quadros }) => {
  const f = useCurrentFrame() - inicio;
  if (f < 0 || f >= quadros) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Img src={staticFile(`hf/${nome}/frame_${String(f + 1).padStart(6, "0")}.png`)} style={{ width: "100%", height: "100%" }} />
    </AbsoluteFill>
  );
};

export const semente = rnd;
