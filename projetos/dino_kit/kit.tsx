// Kit 2D da série "O dia em que os dinossauros morreram" (5 shorts). Desenhos ORIGINAIS do canal (não copiados da referência).
// Usado só pelos projetos dino_0x. IDs prefixados "dk-".
import React from "react";
import { clamp01, eio, eout, lerp, ramp, rnd, wobble, piscar } from "../../engine/src/kit/anim";

export const TINTA = "#14102a";
export const mix = (a: string, b: string, t: number) => {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const c = (s: number) => Math.round(lerp((pa >> s) & 255, (pb >> s) & 255, clamp01(t)));
  return `#${((c(16) << 16) | (c(8) << 8) | c(0)).toString(16).padStart(6, "0")}`;
};

// ------------------------------------------------------------------ DINOSSAUROS (vista lateral, voltados para a direita)
export type TipoDino = "rex" | "tri" | "hadro" | "titano" | "raptor";
const PALETA: Record<TipoDino, [string, string, string]> = {
  rex: ["#4f6bd8", "#2f45a6", "#ffcf5a"],
  tri: ["#e8743b", "#b9542a", "#ffe08a"],
  hadro: ["#3fae7a", "#2b8058", "#ffd27a"],
  titano: ["#9a6bd8", "#7149ad", "#f2c6ff"],
  raptor: ["#d9455f", "#a32c45", "#ffd166"],
};
export const Dino: React.FC<{
  tipo: TipoDino; x: number; y: number; s?: number; f: number; dir?: 1 | -1; anda?: number; cabeca?: number; boca?: number;
  olhar?: number; medo?: number; cor?: [string, string, string]; seed?: number; deitado?: number; brilho?: number;
}> = ({ tipo, x, y, s = 1, f, dir = 1, anda = 0, cabeca = 0, boca = 0, olhar = 0, medo = 0, cor, seed = 1, deitado = 0, brilho = 0 }) => {
  const [c1, c2, c3] = cor ?? PALETA[tipo];
  const fase = f * 0.22 * (anda > 0 ? 1 : 0) + seed;
  const passo = (k: number) => Math.sin(fase + k * Math.PI) * 22 * anda;
  const sobe = Math.abs(Math.sin(fase)) * 6 * anda;
  const resp = Math.sin(f * 0.08 + seed) * 2;
  const cauda = Math.sin(f * 0.07 + seed) * 6 + anda * Math.sin(fase) * 4;
  const pisca = piscar(f, seed + 3);
  const L = 7;
  const bip = tipo === "rex" || tipo === "raptor";
  // medidas por espécie
  const M = {
    rex: { cw: 230, ch: 120, pl: 150, ng: 30, cab: 95, rabo: 260 },
    raptor: { cw: 130, ch: 64, pl: 110, ng: 40, cab: 54, rabo: 180 },
    tri: { cw: 250, ch: 130, pl: 90, ng: 10, cab: 110, rabo: 160 },
    hadro: { cw: 230, ch: 110, pl: 120, ng: 60, cab: 70, rabo: 220 },
    titano: { cw: 280, ch: 140, pl: 120, ng: 240, cab: 50, rabo: 300 },
  }[tipo];
  const pernaY = -M.pl;
  const perna = (px: number, k: number, frente: boolean, larg: number) => (
    <g transform={`translate(${px} ${pernaY}) rotate(${passo(k)})`} opacity={frente ? 1 : 0.85}>
      <path d={`M ${-larg / 2},0 L ${larg / 2},0 L ${larg * 0.35},${M.pl - 14} L ${larg * 0.75},${M.pl} L ${-larg * 0.5},${M.pl} L ${-larg * 0.4},${M.pl - 14} Z`}
        fill={frente ? c1 : c2} stroke={TINTA} strokeWidth={L} strokeLinejoin="round" />
    </g>
  );
  const corpoY = pernaY - M.ch * 0.25 - sobe;
  const ang = -deitado * 90;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * dir} ${s}) rotate(${ang * 0})`}>
      <g transform={deitado ? `translate(0 ${deitado * M.pl * 0.9}) rotate(${deitado * 8})` : ""}>
        {/* pernas de trás (lado oposto) */}
        {bip ? perna(-20, 1, false, 46) : <>{perna(-M.cw * 0.32, 1, false, 52)}{perna(M.cw * 0.3, 0, false, 46)}</>}
        {/* cauda */}
        <path d={`M ${-M.cw * 0.4},${corpoY - 20} Q ${-M.cw * 0.4 - M.rabo * 0.6},${corpoY - 10 + cauda} ${-M.cw * 0.4 - M.rabo},${corpoY + 20 + cauda * 1.8} Q ${-M.cw * 0.4 - M.rabo * 0.5},${corpoY + 30 + cauda} ${-M.cw * 0.4},${corpoY + 40} Z`}
          fill={c1} stroke={TINTA} strokeWidth={L} strokeLinejoin="round" />
        {/* corpo */}
        <ellipse cx={0} cy={corpoY + resp * 0.3} rx={M.cw / 2} ry={M.ch / 2} fill={c1} stroke={TINTA} strokeWidth={L} />
        <path d={`M ${-M.cw * 0.35},${corpoY + M.ch * 0.18} Q 0,${corpoY + M.ch * 0.55} ${M.cw * 0.38},${corpoY + M.ch * 0.15}`} fill="none" stroke={c3} strokeWidth={14} strokeLinecap="round" opacity={0.8} />
        {[0, 1, 2, 3].map((i) => <path key={i} d={`M ${-M.cw * 0.25 + i * M.cw * 0.16},${corpoY - M.ch * 0.42} l 14,-16 l 10,18`} fill={c2} opacity={tipo === "titano" || tipo === "hadro" ? 0 : 0.9} />)}
        {/* pescoço + cabeça */}
        <g transform={`translate(${M.cw * 0.42} ${corpoY - M.ch * 0.2}) rotate(${cabeca - (tipo === "titano" ? 35 : 0)})`}>
          <path d={`M -20,-${M.ch * 0.3} L ${M.ng},-${M.ch * 0.18 + M.ng * 0.35} L ${M.ng + 10},${M.ch * 0.05 - M.ng * 0.25} L -10,${M.ch * 0.3} Z`} fill={c1} stroke={TINTA} strokeWidth={L} strokeLinejoin="round" />
          <g transform={`translate(${M.ng} ${-M.ng * 0.3 - (tipo === "titano" ? M.ng * 0.3 : 0)}) rotate(${tipo === "titano" ? 35 : 0})`}>
            {tipo === "tri" && <path d={`M -10,-70 C 30,-120 90,-90 70,-30 L 0,0 Z`} fill={c2} stroke={TINTA} strokeWidth={L} />}
            {/* mandíbula */}
            <path d={`M 0,6 L ${M.cab},${10 + boca * 26} L ${M.cab * 0.9},${24 + boca * 30} L 0,26 Z`} fill={c2} stroke={TINTA} strokeWidth={L} strokeLinejoin="round" />
            {/* crânio */}
            <path d={`M -10,-${M.cab * 0.38} C ${M.cab * 0.4},-${M.cab * 0.55} ${M.cab * 1.05},-${M.cab * 0.3} ${M.cab * 1.1},0 C ${M.cab * 1.0},${10 + boca * 6} ${M.cab * 0.4},14 -6,16 Z`}
              fill={c1} stroke={TINTA} strokeWidth={L} strokeLinejoin="round" />
            {tipo === "tri" && <><path d={`M ${M.cab * 0.45},-${M.cab * 0.42} l 18,-58 l 6,58 Z`} fill="#fff6dc" stroke={TINTA} strokeWidth={5} /><path d={`M ${M.cab * 1.0},-${M.cab * 0.12} l 22,-26 l 0,26 Z`} fill="#fff6dc" stroke={TINTA} strokeWidth={5} /></>}
            {tipo === "hadro" && <path d={`M 0,-${M.cab * 0.4} C -30,-90 -70,-90 -60,-60`} fill="none" stroke={c2} strokeWidth={16} strokeLinecap="round" />}
            {(tipo === "rex" || tipo === "raptor") && boca > 0.1 && [0, 1, 2, 3].map((i) => <path key={i} d={`M ${M.cab * 0.4 + i * M.cab * 0.15},12 l 6,${10 * boca} l 6,${-10 * boca}`} fill="#fff" />)}
            {/* olho */}
            <ellipse cx={M.cab * 0.55} cy={-M.cab * 0.18} rx={11 + medo * 4} ry={(11 + medo * 4) * pisca + 0.5} fill="#fff" stroke={TINTA} strokeWidth={4} />
            {pisca > 0.3 && <circle cx={M.cab * 0.55 + 3 + olhar * 3} cy={-M.cab * 0.18 - olhar * 3} r={6 - medo * 1.5} fill={TINTA} />}
            <path d={`M ${M.cab * 0.4},${-M.cab * 0.32 - medo * 6} L ${M.cab * 0.72},${-M.cab * 0.36 + medo * 2}`} stroke={TINTA} strokeWidth={6} strokeLinecap="round" />
          </g>
        </g>
        {/* braços dos bípedes */}
        {bip && <path d={`M ${M.cw * 0.3},${corpoY + 10} l 30,${26 + Math.sin(fase) * 4} l 10,-6`} fill="none" stroke={c2} strokeWidth={12} strokeLinecap="round" />}
        {/* pernas da frente (lado de cá) */}
        {bip ? perna(20, 0, true, 54) : <>{perna(-M.cw * 0.25, 0, true, 56)}{perna(M.cw * 0.36, 1, true, 50)}</>}
        {brilho > 0 && <ellipse cx={0} cy={corpoY} rx={M.cw * 0.7} ry={M.ch} fill="#ffd36b" opacity={brilho * 0.25} />}
      </g>
    </g>
  );
};

/** Ave pequena (dinossauro aviano) — pousada ou voando. */
export const Ave: React.FC<{ x: number; y: number; s?: number; f: number; voa?: boolean; dir?: 1 | -1; cor?: string; seed?: number }> = ({ x, y, s = 1, f, voa, dir = 1, cor = "#ff7b54", seed = 0 }) => {
  const asa = voa ? Math.sin(f * 0.5 + seed) * 40 : Math.sin(f * 0.05 + seed) * 4;
  const pisca = piscar(f, seed + 9);
  return (
    <g transform={`translate(${x} ${y}) scale(${s * dir} ${s})`}>
      {!voa && <><line x1={-6} y1={22} x2={-10} y2={46} stroke="#f2a33a" strokeWidth={5} /><line x1={8} y1={22} x2={10} y2={46} stroke="#f2a33a" strokeWidth={5} /></>}
      <path d="M -50,0 L -80,-14 L -78,10 Z" fill={mix(cor, "#000", 0.25)} stroke={TINTA} strokeWidth={4} />
      <ellipse rx={46} ry={30} fill={cor} stroke={TINTA} strokeWidth={5} />
      <path d={`M -10,-6 Q -30,${-30 - asa} -60,${-10 - asa * 0.6} Q -20,8 -10,-6 Z`} fill={mix(cor, "#000", 0.2)} stroke={TINTA} strokeWidth={4} />
      <circle cx={38} cy={-24} r={20} fill={cor} stroke={TINTA} strokeWidth={5} />
      <path d="M 54,-28 L 78,-22 L 54,-16 Z" fill="#ffd23f" stroke={TINTA} strokeWidth={3} />
      <ellipse cx={44} cy={-28} rx={5} ry={6 * pisca + 0.5} fill={TINTA} />
    </g>
  );
};
/** Pequeno mamífero do Cretáceo (tipo musaranho). */
export const Mamifero: React.FC<{ x: number; y: number; s?: number; f: number; dir?: 1 | -1; anda?: number }> = ({ x, y, s = 1, f, dir = 1, anda = 0 }) => (
  <g transform={`translate(${x} ${y - Math.abs(Math.sin(f * 0.4)) * 4 * anda}) scale(${s * dir} ${s})`}>
    <path d={`M -40,-10 C -70,-6 -90,${-20 + Math.sin(f * 0.2) * 6} -110,-30`} fill="none" stroke="#7a5638" strokeWidth={6} strokeLinecap="round" />
    {[-20, 20].map((px, i) => <line key={i} x1={px} y1={0} x2={px + Math.sin(f * 0.6 + i * 3) * 8 * anda} y2={14} stroke={TINTA} strokeWidth={6} strokeLinecap="round" />)}
    <ellipse cx={0} cy={-14} rx={46} ry={24} fill="#a87a52" stroke={TINTA} strokeWidth={5} />
    <path d="M 36,-26 Q 70,-18 66,-6 Q 50,0 34,-4 Z" fill="#a87a52" stroke={TINTA} strokeWidth={5} />
    <circle cx={30} cy={-34} r={9} fill="#d9a07a" stroke={TINTA} strokeWidth={4} />
    <circle cx={48} cy={-20} r={4} fill={TINTA} /><circle cx={66} cy={-8} r={4} fill="#3a2a22" />
  </g>
);

// ------------------------------------------------------------------ CENÁRIOS DO CRETÁCEO
export const CeuCretaceo: React.FC<{ topo: string; base: string; id: string; estrelas?: number; f: number }> = ({ topo, base, id, estrelas = 0, f }) => (
  <g>
    <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={topo} /><stop offset="1" stopColor={base} /></linearGradient></defs>
    <rect x={-3000} y={-3000} width={7000} height={7000} fill={`url(#${id})`} />
    {estrelas > 0 && Array.from({ length: 120 }, (_, i) => <circle key={i} cx={-800 + rnd(`dke${i}`) * 2700} cy={-600 + rnd(`dkey${i}`) * 1800} r={1.5 + rnd(`dker${i}`) * 2.5} fill="#fff" opacity={estrelas * (0.35 + 0.65 * Math.abs(Math.sin(f * 0.05 + i)))} />)}
  </g>
);
export const Nuvens: React.FC<{ f: number; y: number; cor?: string; n?: number; op?: number; seed?: string }> = ({ f, y, cor = "#ffffff", n = 5, op = 0.9, seed = "n" }) => (
  <g opacity={op}>
    {Array.from({ length: n }, (_, i) => {
      const x = ((rnd(`dkn${seed}${i}`) * 2600 + f * (0.3 + rnd(`dknv${seed}${i}`) * 0.5)) % 2600) - 800;
      const s = 0.7 + rnd(`dkns${seed}${i}`) * 0.8, yy = y + rnd(`dkny${seed}${i}`) * 300;
      return <g key={i} transform={`translate(${x} ${yy}) scale(${s})`}><ellipse rx={150} ry={46} fill={cor} /><ellipse cx={-60} cy={-28} rx={80} ry={50} fill={cor} /><ellipse cx={50} cy={-36} rx={95} ry={60} fill={cor} /></g>;
    })}
  </g>
);
export const Montanhas: React.FC<{ y: number; cor: string; alt?: number; seed?: string; desloc?: number }> = ({ y, cor, alt = 300, seed = "m", desloc = 0 }) => {
  let d = `M -1500,${y}`;
  for (let i = 0; i <= 30; i++) { const x = -1500 + i * 150; d += ` L ${x + desloc},${y - alt * (0.4 + 0.6 * rnd(`dkm${seed}${i}`))}`; }
  return <path d={`${d} L 3000,${y + 2000} L -1500,${y + 2000} Z`} fill={cor} />;
};
export const Vulcao: React.FC<{ x: number; y: number; s?: number; f: number; fumaca?: number; cor?: string }> = ({ x, y, s = 1, f, fumaca = 1, cor = "#5a3a6a" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -320,0 L -60,-360 L 60,-360 L 320,0 Z" fill={cor} stroke={TINTA} strokeWidth={8} />
    <path d="M -60,-360 L 60,-360 L 40,-320 L -40,-320 Z" fill="#ff7a2f" />
    {Array.from({ length: 6 }, (_, i) => { const u = ((f * 0.008 + i / 6) % 1); return <circle key={i} cx={Math.sin(i * 2 + f * 0.01) * 40 * u} cy={-380 - u * 420} r={40 + u * 90} fill="#8a7a9a" opacity={fumaca * 0.5 * (1 - u)} />; })}
  </g>
);
export const Palmeira: React.FC<{ x: number; y: number; s?: number; f: number; seed?: number; cor?: string }> = ({ x, y, s = 1, f, seed = 0, cor = "#2f9a52" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d={`M -10,0 C -20,-120 ${10 + wobble(f, seed, 0.3) * 4},-240 0,-330 L 20,-330 C 30,-240 10,-120 14,0 Z`} fill="#7a5235" stroke={TINTA} strokeWidth={6} />
    <g transform={`translate(10 -330) rotate(${wobble(f, seed + 1, 0.4) * 4})`}>
      {[-150, -110, -60, -20, 30, 70].map((a, i) => <path key={i} transform={`rotate(${a})`} d="M 0,0 C 60,-30 130,-20 170,20 C 120,0 60,6 0,0 Z" fill={i % 2 ? cor : mix(cor, "#000", 0.2)} stroke={TINTA} strokeWidth={5} />)}
    </g>
  </g>
);
export const Samambaia: React.FC<{ x: number; y: number; s?: number; f: number; seed?: number; cor?: string }> = ({ x, y, s = 1, f, seed = 0, cor = "#3fbf6a" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-50, -20, 10, 40].map((a, i) => (
      <g key={i} transform={`rotate(${a + wobble(f, seed + i, 0.5) * 5})`}>
        <path d="M 0,0 Q 10,-90 0,-170" fill="none" stroke={mix(cor, "#000", 0.3)} strokeWidth={6} />
        {Array.from({ length: 6 }, (_, k) => <ellipse key={k} cx={(k % 2 ? 14 : -14)} cy={-30 - k * 24} rx={20} ry={8} fill={cor} transform={`rotate(${k % 2 ? 20 : -20} ${(k % 2 ? 14 : -14)} ${-30 - k * 24})`} />)}
      </g>
    ))}
  </g>
);
export const Chao: React.FC<{ y: number; cor: string; cor2?: string }> = ({ y, cor, cor2 }) => (
  <g>
    <path d={`M -1500,${y} C -500,${y - 40} 500,${y + 30} 3000,${y - 20} L 3000,${y + 2000} L -1500,${y + 2000} Z`} fill={cor} />
    {cor2 && <path d={`M -1500,${y + 120} C -400,${y + 80} 600,${y + 160} 3000,${y + 100} L 3000,${y + 2000} L -1500,${y + 2000} Z`} fill={cor2} />}
  </g>
);

// ------------------------------------------------------------------ ESPAÇO E IMPACTO
/** Asteroide com crateras; brasa = 0..1 (entrando na atmosfera); rastro em direção -ang. */
export const Asteroide: React.FC<{ x: number; y: number; r: number; f: number; brasa?: number; ang?: number; rastro?: number }> = ({ x, y, r, f, brasa = 0, ang = -35, rastro = 0 }) => (
  <g transform={`translate(${x} ${y})`}>
    {rastro > 0 && (
      <g transform={`rotate(${ang + 180})`} opacity={rastro}>
        <path d={`M 0,${-r} L ${r * 7},${-r * 0.3} L ${r * 7},${r * 0.3} L 0,${r} Z`} fill="#ffb347" opacity={0.55} />
        <path d={`M 0,${-r * 0.6} L ${r * 4},0 L 0,${r * 0.6} Z`} fill="#fff1b8" opacity={0.8} />
      </g>
    )}
    {brasa > 0 && <circle r={r * (1.35 + 0.08 * Math.sin(f * 0.6))} fill="#ff8a2a" opacity={0.45 * brasa} />}
    <g transform={`rotate(${f * 0.4})`}>
      <path d={`M ${-r},0 C ${-r},${-r * 0.7} ${-r * 0.5},${-r * 1.05} ${r * 0.1},${-r} C ${r * 0.8},${-r * 0.95} ${r * 1.05},${-r * 0.3} ${r * 0.95},${r * 0.2} C ${r * 0.85},${r * 0.85} ${r * 0.2},${r * 1.05} ${-r * 0.4},${r * 0.9} C ${-r * 0.9},${r * 0.7} ${-r},${r * 0.4} ${-r},0 Z`}
        fill={mix("#8a7bb0", "#ff9a3a", brasa)} stroke={TINTA} strokeWidth={Math.max(3, r * 0.06)} />
      {[[-0.4, -0.3, 0.22], [0.35, 0.1, 0.18], [-0.1, 0.45, 0.14], [0.3, -0.5, 0.12]].map(([cx, cy, cr], i) => <circle key={i} cx={cx * r} cy={cy * r} r={cr * r} fill={mix("#6a5b92", "#ff6a2a", brasa)} />)}
    </g>
  </g>
);
/** Terra estilizada (continentes do fim do Cretáceo, simplificados). */
export const TerraCretacea: React.FC<{ x: number; y: number; r: number; f: number; escuro?: number; giro?: number }> = ({ x, y, r, f, escuro = 0, giro = 0 }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r * 1.1} fill="#7fd0ff" opacity={0.18} />
    <clipPath id={`dk-terra-${Math.round(r)}`}><circle r={r} /></clipPath>
    <circle r={r} fill="#2f86c9" stroke={TINTA} strokeWidth={6} />
    <g clipPath={`url(#dk-terra-${Math.round(r)})`}>
      <g transform={`translate(${(giro * r) % (r * 4) - r} 0)`}>
        {[-1, 1, 3].map((k) => (
          <g key={k} transform={`translate(${k * r * 2} 0) scale(${r / 300})`}>
            <path d="M -260,-180 C -180,-240 -80,-220 -60,-160 C -40,-100 -120,-60 -150,0 C -180,40 -240,20 -260,-40 Z" fill="#79c27a" />
            <path d="M -120,40 C -60,30 -20,80 -40,160 C -60,220 -110,240 -130,180 C -150,120 -150,70 -120,40 Z" fill="#79c27a" />
            <path d="M 40,-200 C 140,-230 250,-180 240,-100 C 230,-40 120,-40 60,-80 C 20,-110 10,-170 40,-200 Z" fill="#79c27a" />
            <path d="M 60,0 C 120,-20 170,20 160,90 C 150,170 90,190 60,140 C 40,100 30,40 60,0 Z" fill="#79c27a" />
          </g>
        ))}
      </g>
      <circle r={r} fill="#05040f" opacity={0.55 * escuro} />
      <path d={`M ${r * 0.2},${-r} A ${r},${r} 0 0 1 ${r * 0.2},${r} A ${r * 0.7},${r} 0 0 0 ${r * 0.2},${-r} Z`} fill="#000" opacity={0.25} />
    </g>
  </g>
);
export const Clarao: React.FC<{ x: number; y: number; t: number; r?: number; cor?: string }> = ({ x, y, t, r = 600, cor = "#fff6c8" }) => t <= 0 ? null : (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r * eout(clamp01(t * 2))} fill={cor} opacity={0.9 * (1 - clamp01((t - 0.5) * 2))} />
    <circle r={r * 0.5 * eout(clamp01(t * 3))} fill="#ffffff" opacity={1 - clamp01(t * 1.5)} />
  </g>
);

// ------------------------------------------------------------------ ESCALA
export const Everest: React.FC<{ x: number; base: number; h: number; rotulo?: boolean }> = ({ x, base, h, rotulo = true }) => (
  <g>
    <path d={`M ${x - h * 0.9},${base} L ${x - h * 0.2},${base - h * 0.7} L ${x},${base - h} L ${x + h * 0.25},${base - h * 0.75} L ${x + h * 1.0},${base} Z`} fill="#8a9bb8" stroke={TINTA} strokeWidth={6} />
    <path d={`M ${x - h * 0.2},${base - h * 0.7} L ${x},${base - h} L ${x + h * 0.25},${base - h * 0.75} L ${x + h * 0.1},${base - h * 0.68} L ${x - h * 0.05},${base - h * 0.78} Z`} fill="#ffffff" />
    {rotulo && <text x={x} y={base - h - 24} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={34} fill={TINTA}>Everest</text>}
  </g>
);
export const Regua: React.FC<{ x: number; base: number; px_km: number; ate: number; passo?: number; cor?: string }> = ({ x, base, px_km, ate, passo = 2, cor = TINTA }) => (
  <g>
    <line x1={x} y1={base} x2={x} y2={base - ate * px_km} stroke={cor} strokeWidth={5} />
    {Array.from({ length: Math.floor(ate / passo) + 1 }, (_, i) => (
      <g key={i}><line x1={x - 14} y1={base - i * passo * px_km} x2={x + 14} y2={base - i * passo * px_km} stroke={cor} strokeWidth={5} />
        <text x={x + 24} y={base - i * passo * px_km + 11} fontFamily="Montserrat" fontWeight={900} fontSize={30} fill={cor}>{i * passo} km</text></g>
    ))}
  </g>
);

// ------------------------------------------------------------------ FOGO, CINZA, METEOROS
export const Chamas: React.FC<{ x: number; y: number; s?: number; f: number; seed?: number; forca?: number }> = ({ x, y, s = 1, f, seed = 0, forca = 1 }) => forca <= 0 ? null : (
  <g transform={`translate(${x} ${y}) scale(${s * forca})`}>
    {[0, 1, 2].map((k) => {
      const h = 120 - k * 30 + Math.sin(f * 0.5 + seed + k) * 16;
      return <path key={k} d={`M ${-50 + k * 14},0 C ${-60 + k * 10},${-h * 0.5} ${-10},${-h * 0.7} 0,${-h} C 10,${-h * 0.7} ${60 - k * 10},${-h * 0.5} ${50 - k * 14},0 Z`} fill={["#ff4d2e", "#ff9a2e", "#ffe36b"][k]} />;
    })}
  </g>
);
export const Meteoros: React.FC<{ f: number; n?: number; op?: number; ang?: number; seed?: string; area?: [number, number, number, number] }> = ({ f, n = 30, op = 1, ang = 60, seed = "mt", area = [-300, -400, 1700, 1600] }) => op <= 0 ? null : (
  <g opacity={op}>
    {Array.from({ length: n }, (_, i) => {
      const per = 40 + rnd(`dkmt${seed}${i}`) * 50;
      const u = ((f + rnd(`dkmto${seed}${i}`) * per) % per) / per;
      const x0 = area[0] + rnd(`dkmtx${seed}${i}`) * area[2], y0 = area[1] + rnd(`dkmty${seed}${i}`) * area[3] * 0.4;
      const dx = Math.cos((ang * Math.PI) / 180), dy = Math.sin((ang * Math.PI) / 180);
      const L = 600 * u, cx = x0 + dx * L, cy = y0 + dy * L;
      return <g key={i} opacity={Math.sin(u * Math.PI)}><line x1={cx - dx * 90} y1={cy - dy * 90} x2={cx} y2={cy} stroke="#ffb347" strokeWidth={6} strokeLinecap="round" /><circle cx={cx} cy={cy} r={7} fill="#fff1b8" /></g>;
    })}
  </g>
);
export const Cinzas: React.FC<{ f: number; n?: number; cor?: string; op?: number; vy?: number; seed?: string }> = ({ f, n = 80, cor = "#cfc6e0", op = 0.7, vy = 1.2, seed = "cz" }) => (
  <g opacity={op}>
    {Array.from({ length: n }, (_, i) => {
      const x = (((rnd(`dkcz${seed}${i}`) * 2600 + Math.sin(f * 0.02 + i) * 30) % 2600) + 2600) % 2600 - 800;
      const y = ((rnd(`dkczy${seed}${i}`) * 2600 + f * vy * (0.5 + rnd(`dkczv${seed}${i}`))) % 2600) - 500;
      return <circle key={i} cx={x} cy={y} r={2 + rnd(`dkczr${seed}${i}`) * 5} fill={cor} />;
    })}
  </g>
);

/** Cartão de tempo (ex.: "+10 MINUTOS"). */
export const CartaoTempo: React.FC<{ f: number; em: number; ate: number; t: string; x?: number; y?: number; cor?: string }> = ({ f, em, ate, t, x = 540, y = 250, cor = "#ffd23f" }) => {
  if (f < em || f > ate) return null;
  const s = eout(ramp(f, em, em + 8)) * (1 - eio(ramp(f, ate - 6, ate)));
  const w = t.length * 26 + 70;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-w / 2} y={-38} width={w} height={70} rx={35} fill={TINTA} stroke={cor} strokeWidth={5} opacity={0.92} />
      <text y={12} textAnchor="middle" fontFamily="Anton" fontSize={42} fill={cor} letterSpacing={2}>{t}</text>
    </g>
  );
};
export { eio, eout, ramp, clamp01, lerp, rnd, wobble };

/** Selva do Cretáceo em camadas com parallax. clima: 0 dia, 1 noite; luz: clarão; fogo: céu em brasa; cinza: inverno de impacto. */
export const Selva: React.FC<{ f: number; cx?: number; noite?: number; luz?: number; fogo?: number; cinza?: number; id: string; vulcao?: boolean; raios?: boolean }> = ({
  f, cx = 0, noite = 0, luz = 0, fogo = 0, cinza = 0, id, vulcao = true, raios = true,
}) => {
  const tom = (dia: string, nt: string, fg: string, cz: string) => mix(mix(mix(mix(dia, nt, noite), fg, fogo), cz, cinza), "#fff1c4", luz * 0.6);
  return (
    <g>
      <CeuCretaceo topo={tom("#2b8fe8", "#120c3a", "#5a0f2a", "#1a1630")} base={tom("#ffe0a0", "#4a2a7a", "#ff7a2a", "#4a4458")} id={id} estrelas={noite * (1 - cinza)} f={f} />
      {raios && noite < 0.5 && fogo < 0.3 && cinza < 0.3 && <g opacity={0.25 * (1 - noite * 2)}>{Array.from({ length: 6 }, (_, i) => <path key={i} d={`M ${700 + i * 40},-200 L ${300 + i * 160},1700 L ${380 + i * 160},1700 Z`} fill="#fff6c8" opacity={0.25 + 0.15 * Math.sin(f * 0.03 + i)} />)}</g>}
      <Nuvens f={f} y={260} cor={tom("#ffffff", "#5a4a9a", "#ffb070", "#6a6478")} n={5} op={0.85} seed={id} />
      <g transform={`translate(${-cx * 0.08} 0)`}>
        <Montanhas y={1180} cor={tom("#8a7ae8", "#2a2060", "#8a2a3a", "#3a3648")} alt={480} seed="selA" />
        {vulcao && <Vulcao x={1250} y={1120} s={0.9} f={f} cor={tom("#7a5ad0", "#2a1a50", "#5a1a2a", "#2a2838")} />}
      </g>
      <g transform={`translate(${-cx * 0.2} 0)`}><Montanhas y={1330} cor={tom("#22a884", "#1a2a5a", "#a03a2a", "#3a3a44")} alt={320} seed="selB" /></g>
      <g transform={`translate(${-cx * 0.4} 0)`}>
        {[-350, 120, 560, 1050, 1500, 1950, 2400].map((x, i) => <Palmeira key={i} x={x} y={1560 - (i % 2) * 30} s={1.05 + (i % 3) * 0.15} f={f} seed={i} cor={tom("#1f9a4a", "#1a3a4a", "#7a2a1a", "#3a3a3a")} />)}
      </g>
      <Chao y={1600} cor={tom("#5fc84a", "#22385a", "#7a2a1a", "#55505e")} cor2={tom("#3fa040", "#1a2a48", "#5a1a12", "#45404e")} />
    </g>
  );
};
/** Folhagem de primeiro plano (cantos), com balanço — dá profundidade. */
export const PrimeiroPlano: React.FC<{ f: number; cor?: string; lado?: "ambos" | "esq" | "dir" }> = ({ f, cor = "#1a7a3a", lado = "ambos" }) => (
  <g>
    {(lado !== "dir") && <g transform={`translate(-80 1980) rotate(${wobble(f, 21, 0.4) * 3})`}>{[-70, -40, -10].map((a, i) => <path key={i} transform={`rotate(${a})`} d="M 0,0 C 80,-120 260,-160 380,-120 C 260,-90 120,-40 0,0 Z" fill={i % 2 ? cor : mix(cor, "#000", 0.25)} stroke={TINTA} strokeWidth={6} />)}</g>}
    {(lado !== "esq") && <g transform={`translate(1160 2000) scale(-1 1) rotate(${wobble(f, 22, 0.4) * 3})`}>{[-75, -45, -15].map((a, i) => <path key={i} transform={`rotate(${a})`} d="M 0,0 C 80,-120 260,-160 380,-120 C 260,-90 120,-40 0,0 Z" fill={i % 2 ? cor : mix(cor, "#000", 0.25)} stroke={TINTA} strokeWidth={6} />)}</g>}
  </g>
);
