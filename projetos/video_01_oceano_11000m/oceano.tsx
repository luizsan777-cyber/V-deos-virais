// VÍDEO 01 — kit visual EXCLUSIVO deste episódio (IDs prefixados "oc01-"). Nada aqui é usado pelos vídeos 03/04.
import React from "react";
import { clamp01, eio, eout, lerp, ramp, rnd, wobble, piscar } from "../../engine/src/kit/anim";

export const TINTA = "#0b1626";
export const VERMELHO = "#e2453c";
export const CINZA = "#8c97a6";
export const AMARELO = "#ffd23f";
export const AZUL_SETA = "#7fd6ff";
export const BIO = "#7dffcf";

/** cor da água conforme a profundidade relativa p (0 superfície → 1 abismo). Nunca preto chapado. */
export const corAgua = (p: number): [string, string] => {
  const pal: [number, string, string][] = [
    [0, "#3fd0d4", "#1f9fc0"], [0.25, "#1f8fc0", "#155f9a"], [0.5, "#0f3f78", "#0a2856"], [0.75, "#081c40", "#06122c"], [1, "#061230", "#030a1c"],
  ];
  for (let i = 0; i < pal.length - 1; i++) {
    const [a, ca1, ca2] = pal[i], [b, cb1, cb2] = pal[i + 1];
    if (p <= b) { const t = (p - a) / (b - a); return [mix(ca1, cb1, t), mix(ca2, cb2, t)]; }
  }
  return [pal[4][1], pal[4][2]];
};
export const mix = (a: string, b: string, t: number) => {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const c = (s: number) => Math.round(lerp((pa >> s) & 255, (pb >> s) & 255, clamp01(t)));
  return `#${((c(16) << 16) | (c(8) << 8) | c(0)).toString(16).padStart(6, "0")}`;
};

/** Água de fundo (preenche muito além da tela) com gradiente da profundidade p. */
export const Agua: React.FC<{ p: number; id: string }> = ({ p, id }) => {
  const [c1, c2] = corAgua(p);
  return (
    <g>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c1} /><stop offset="1" stopColor={c2} /></linearGradient></defs>
      <rect x={-3000} y={-3000} width={7000} height={9000} fill={`url(#${id})`} />
    </g>
  );
};

/** Feixes de sol que ondulam; alcance e força caem com a profundidade. */
export const FeixesSol: React.FC<{ f: number; x?: number; y?: number; forca: number; comp?: number }> = ({ f, x = 540, y = -200, forca, comp = 1900 }) => (
  <g opacity={forca} style={{ mixBlendMode: "screen" }}>
    {Array.from({ length: 8 }, (_, i) => {
      const a = -26 + i * 7.5 + Math.sin(f * 0.02 + i) * 2.5;
      const w = 40 + 30 * rnd(`oc01fs${i}`);
      return <path key={i} transform={`rotate(${a} ${x} ${y})`} d={`M ${x - w / 2},${y} L ${x + w / 2},${y} L ${x + w * 1.6},${y + comp} L ${x - w * 1.6},${y + comp} Z`} fill="#e9fff8" opacity={0.08 + 0.06 * Math.sin(f * 0.05 + i * 2)} />;
    })}
  </g>
);

/** Neve marinha / partículas em suspensão com parallax (velocidade varia por camada). */
export const NeveMarinha: React.FC<{ f: number; n?: number; area?: [number, number, number, number]; cor?: string; seed?: string; vy?: number; op?: number }> = ({
  f, n = 50, area = [-200, -400, 1480, 2700], cor = "#dff6ff", seed = "nm", vy = 0.35, op = 0.55,
}) => {
  const [ax, ay, aw, ah] = area;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const r0 = rnd(`oc01${seed}a${i}`), r1 = rnd(`oc01${seed}b${i}`), r2 = rnd(`oc01${seed}c${i}`);
        const x = ax + ((r0 * aw + Math.sin(f * 0.02 + i) * 18 + f * 0.15 * (r2 - 0.5)) % aw + aw) % aw;
        const y = ay + ((r1 * ah + f * vy * (0.4 + r2)) % ah + ah) % ah;
        return <circle key={i} cx={x} cy={y} r={1.5 + r2 * 3.5} fill={cor} opacity={op * (0.4 + 0.6 * r2)} />;
      })}
    </g>
  );
};

/** Bolhas que sobem de (x,y), trajetórias variadas e oscilação lateral. */
export const Bolhas: React.FC<{ f: number; x: number; y: number; n?: number; seed?: string; altura?: number; tam?: number; op?: number }> = ({
  f, x, y, n = 10, seed = "b", altura = 420, tam = 1, op = 0.85,
}) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const per = 40 + rnd(`oc01${seed}p${i}`) * 50;
      const u = ((f + rnd(`oc01${seed}o${i}`) * per) % per) / per;
      const r = (4 + rnd(`oc01${seed}r${i}`) * 9) * tam * (0.6 + u * 0.6);
      const bx = x + Math.sin(u * 9 + i) * 14 * tam + (rnd(`oc01${seed}x${i}`) - 0.5) * 30 * tam;
      return (
        <g key={i} opacity={op * (1 - u) * clamp01(u * 8)}>
          <circle cx={bx} cy={y - u * altura} r={r} fill="#dffbff" fillOpacity={0.25} stroke="#ffffff" strokeWidth={2.5} />
          <circle cx={bx - r * 0.35} cy={y - u * altura - r * 0.35} r={r * 0.25} fill="#fff" />
        </g>
      );
    })}
  </g>
);

/** Superfície do mar vista de lado: céu, horizonte, ondas em 3 planos e espuma. Linha d'água em y. */
export const Superficie: React.FC<{ f: number; y: number }> = ({ f, y }) => {
  const onda = (amp: number, comp: number, vel: number, dy: number, fase: number) => {
    let d = `M -1400,${y + dy}`;
    for (let x = -1400; x <= 2500; x += 40) d += ` L ${x},${y + dy + Math.sin((x / comp) * Math.PI * 2 + f * vel + fase) * amp}`;
    return d;
  };
  return (
    <g>
      <defs>
        <linearGradient id="oc01ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6ec9ff" /><stop offset="1" stopColor="#ffe9b0" /></linearGradient>
      </defs>
      <rect x={-1400} y={y - 2600} width={3900} height={2600} fill="url(#oc01ceu)" />
      <circle cx={820} cy={y - 330} r={90} fill="#fff4c2" opacity={0.95} />
      <circle cx={820} cy={y - 330} r={170} fill="#fff4c2" opacity={0.25} />
      {[0, 1, 2].map((i) => <ellipse key={i} cx={((f * (0.4 + i * 0.2) + i * 500) % 2400) - 900} cy={y - 700 - i * 160} rx={130} ry={34} fill="#fff" opacity={0.85} />)}
      <path d={`${onda(10, 260, 0.06, -26, 0)} L 2500,${y + 400} L -1400,${y + 400} Z`} fill="#69d9e0" opacity={0.75} />
      <path d={`${onda(14, 340, 0.08, -8, 1.3)} L 2500,${y + 400} L -1400,${y + 400} Z`} fill="#3fc3d0" />
      <path d={onda(14, 340, 0.08, -8, 1.3)} fill="none" stroke="#f2ffff" strokeWidth={8} opacity={0.9} />
      <path d={`${onda(8, 200, 0.1, 10, 2.1)} L 2500,${y + 400} L -1400,${y + 400} Z`} fill="#2fb2c8" opacity={0.6} />
    </g>
  );
};

/** Régua vertical de profundidade (em coordenadas do mundo). marcas: [yMundo, rótulo]. */
export const Regua: React.FC<{ x: number; marcas: [number, string][]; y0: number; y1: number; cor?: string; op?: number; tam?: number }> = ({ x, marcas, y0, y1, cor = "#ffffff", op = 1, tam = 34 }) => (
  <g opacity={op}>
    <line x1={x} y1={y0} x2={x} y2={y1} stroke={cor} strokeWidth={5} opacity={0.75} />
    {marcas.map(([y, t], i) => (
      <g key={i}>
        <line x1={x - 18} y1={y} x2={x + 18} y2={y} stroke={cor} strokeWidth={5} />
        <text x={x + 30} y={y + tam * 0.36} fontFamily="Montserrat" fontWeight={900} fontSize={tam} fill={cor} stroke={TINTA} strokeWidth={6} paintOrder="stroke">{t}</text>
      </g>
    ))}
  </g>
);

/** Setas de pressão apontando para o centro (cx,cy) vindas de todas as direções. */
export const SetasPressao: React.FC<{ f: number; cx: number; cy: number; rx: number; ry: number; n: number; forca?: number; cor?: string; op?: number; seed?: string }> = ({
  f, cx, cy, rx, ry, n, forca = 1, cor = AZUL_SETA, op = 0.85, seed = "sp",
}) => (
  <g opacity={op}>
    {Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2 + rnd(`oc01${seed}${i}`) * 0.2;
      const pulso = 0.5 + 0.5 * Math.sin(f * 0.12 - i * 0.7);
      const d = 1.0 + 0.18 * (1 - pulso);
      const ex = cx + Math.cos(a) * rx * d, ey = cy + Math.sin(a) * ry * d;
      const L = 60 + 40 * forca;
      const sx = ex + Math.cos(a) * L, sy = ey + Math.sin(a) * L;
      const ang = (Math.atan2(cy - ey, cx - ex) * 180) / Math.PI;
      return (
        <g key={i}>
          <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={cor} strokeWidth={9 + 3 * forca} strokeLinecap="round" />
          <path transform={`translate(${ex} ${ey}) rotate(${ang})`} d="M 6,0 L -22,-17 L -22,17 Z" fill={cor} />
        </g>
      );
    })}
  </g>
);

// ------------------------------------------------------------------ MERGULHADOR (rig lateral, voltado para a direita)
export type PoseMerg = {
  kick: number; // fase da pernada
  forcaKick?: number;
  bracoD?: [number, number]; // ombro, cotovelo (graus; 0 = ao longo do corpo para trás)
  bracoE?: [number, number];
  cabeca?: number; // inclinação da cabeça
  tensao?: number; // sobrancelha franzida 0..1
  olhar?: [number, number];
  pisca?: number;
  lanterna?: number; // 0..1 acesa
  translucido?: number; // 0..1 roupa fica translúcida (raio-X)
};
const seg = (comp: number, larg: number, cor: string, L: number) => (
  <rect x={-larg / 2} y={-larg / 2} width={comp + larg} height={larg} rx={larg / 2} fill={cor} stroke={TINTA} strokeWidth={L} />
);
export const Mergulhador: React.FC<{ x: number; y: number; escala?: number; ang?: number; f: number; pose: PoseMerg; id: string; dentro?: React.ReactNode }> = ({
  x, y, escala = 1, ang = 0, f, pose, id, dentro,
}) => {
  const L = 6;
  const k = pose.forcaKick ?? 1;
  const coxa = (s: number) => 180 + (s * 14 * Math.sin(pose.kick)) * k;
  const joelho = (s: number) => 12 + 10 * Math.sin(pose.kick + s * 1.2) * k;
  const nad = (s: number) => -8 + 18 * Math.sin(pose.kick + s * 0.8 + 1.4) * k;
  const bD = pose.bracoD ?? [150, 20], bE = pose.bracoE ?? [160, 10];
  const tr = pose.translucido ?? 0;
  const roupa = mix(VERMELHO, "#9fd4ff", tr * 0.7);
  const perna = (s: number, front: boolean) => (
    <g transform={`translate(-95 ${s > 0 ? 10 : -6}) rotate(${coxa(s)})`} opacity={front ? 1 : 0.9}>
      {seg(95, 46, front ? roupa : mix(roupa, "#000", 0.2), L)}
      <g transform={`translate(95 0) rotate(${joelho(s)})`}>
        {seg(90, 40, front ? roupa : mix(roupa, "#000", 0.2), L)}
        <rect x={20} y={-22} width={22} height={44} fill={CINZA} opacity={0.9} />
        <g transform={`translate(98 0) rotate(${nad(s)})`}>
          <path d="M -8,-22 L 18,-24 L 150,-40 C 160,-20 160,20 150,40 L 18,24 L -8,22 Z" fill={front ? "#ffcf1f" : "#e6b000"} stroke={TINTA} strokeWidth={L} strokeLinejoin="round" />
          <line x1={20} y1={0} x2={140} y2={0} stroke={TINTA} strokeWidth={3} opacity={0.5} />
        </g>
      </g>
    </g>
  );
  const braco = (b: [number, number], front: boolean, item?: React.ReactNode) => (
    <g transform={`translate(55 ${front ? -2 : -12}) rotate(${b[0]})`}>
      {seg(70, 36, front ? roupa : mix(roupa, "#000", 0.2), L)}
      <g transform={`translate(70 0) rotate(${b[1]})`}>
        {seg(64, 32, front ? roupa : mix(roupa, "#000", 0.2), L)}
        <circle cx={74} cy={0} r={21} fill="#2b3240" stroke={TINTA} strokeWidth={L} />
        {item && <g transform="translate(78 0)">{item}</g>}
      </g>
    </g>
  );
  const pisca = pose.pisca ?? piscar(f, 3);
  const [ox, oy] = pose.olhar ?? [0.6, 0.1];
  const lant = pose.lanterna ?? 0;
  const lanterna = (
    <g>
      <rect x={-12} y={-14} width={46} height={28} rx={6} fill="#3a4250" stroke={TINTA} strokeWidth={5} />
      <rect x={30} y={-17} width={12} height={34} rx={3} fill={lant > 0 ? "#fff6c8" : "#9aa3b0"} stroke={TINTA} strokeWidth={4} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) rotate(${ang}) scale(${escala})`}>
      {/* cone de luz da lanterna (antes do corpo) */}
      {lant > 0 && (
        <g transform={`translate(55 -2) rotate(${bD[0]}) translate(70 0) rotate(${bD[1]}) translate(120 0)`} opacity={lant}>
          <path d="M 0,-14 L 900,-260 C 960,-120 960,120 900,260 L 0,14 Z" fill="#fff6c8" opacity={0.22} />
          <path d="M 0,-10 L 700,-150 C 740,-60 740,60 700,150 L 0,10 Z" fill="#fff6c8" opacity={0.18} />
        </g>
      )}
      {braco(bE, false)}
      {perna(-1, false)}
      {/* cilindro */}
      <g transform="translate(-10 -62)">
        <rect x={-95} y={-22} width={170} height={46} rx={22} fill="#c9d2dc" stroke={TINTA} strokeWidth={L} />
        <rect x={-60} y={-22} width={14} height={46} fill="#7d8896" />
        <rect x={74} y={-12} width={22} height={26} rx={4} fill="#4b5563" stroke={TINTA} strokeWidth={4} />
      </g>
      {/* mangueira do regulador */}
      <path d="M 82,-62 C 150,-90 175,-40 160,-6" fill="none" stroke="#2b3240" strokeWidth={9} />
      {/* tronco */}
      <rect x={-112} y={-44} width={200} height={88} rx={42} fill={roupa} stroke={TINTA} strokeWidth={L} opacity={1 - tr * 0.55} />
      <rect x={-112} y={-6} width={200} height={14} fill={CINZA} opacity={(1 - tr) * 0.9} />
      <rect x={-20} y={-44} width={14} height={88} fill={CINZA} opacity={(1 - tr) * 0.9} />
      {dentro && <g opacity={tr}>{dentro}</g>}
      {perna(1, true)}
      {/* cabeça */}
      <g transform={`translate(120 -14) rotate(${pose.cabeca ?? 0})`}>
        <rect x={-34} y={20} width={30} height={24} fill={roupa} stroke={TINTA} strokeWidth={L} />
        <circle cx={0} cy={0} r={46} fill="#c58c63" stroke={TINTA} strokeWidth={L} />
        {/* cabelo escuro curto (topo e nuca) */}
        <path d="M -44,-10 C -46,-46 -10,-58 18,-50 C 34,-46 44,-34 44,-24 C 20,-30 -10,-28 -30,-8 Z" fill="#17131a" stroke={TINTA} strokeWidth={4} />
        <circle cx={-14} cy={6} r={10} fill="#b47a52" stroke={TINTA} strokeWidth={4} />
        {/* máscara: armação + lente transparente com olho visível */}
        <rect x={10} y={-26} width={48} height={40} rx={12} fill="#bfefff" fillOpacity={0.35} stroke="#1f2733" strokeWidth={7} />
        <path d="M 10,-14 L -30,-20" stroke="#1f2733" strokeWidth={8} />
        <ellipse cx={34} cy={-6} rx={9} ry={11 * pisca + 0.5} fill="#fff" />
        {pisca > 0.3 && <circle cx={34 + ox * 4} cy={-6 + oy * 4} r={5} fill="#2a1a12" />}
        <path d={`M 22,${-24 - 2 * (pose.tensao ?? 0)} L 44,${-22 + 4 * (pose.tensao ?? 0)}`} stroke="#17131a" strokeWidth={5} strokeLinecap="round" />
        <path d="M 22,-20 L 40,-24" stroke="#ffffff" strokeWidth={4} opacity={0.6} />
        {/* regulador */}
        <rect x={30} y={16} width={26} height={18} rx={6} fill="#2b3240" stroke={TINTA} strokeWidth={4} />
      </g>
      {braco(bD, true, lanterna)}
    </g>
  );
};

/** Close frontal do rosto do mergulhador (mesmo personagem) — usado no plano 1 da abertura. */
export const RostoMergulhador: React.FC<{ f: number; agua: number; tensao: number; olhar: [number, number] }> = ({ f, agua, tensao, olhar }) => {
  const pisca = piscar(f, 3);
  return (
    <g>
      <rect x={-200} y={-200} width={1480} height={2400} fill="#ffe2a6" />
      <rect x={-200} y={-200} width={1480} height={900} fill="#8fd8ff" />
      {/* pescoço e roupa */}
      <path d="M 300,1500 C 300,1350 380,1300 540,1300 C 700,1300 780,1350 780,1500 L 900,2100 L 180,2100 Z" fill={VERMELHO} stroke={TINTA} strokeWidth={12} />
      <rect x={180} y={1600} width={720} height={40} fill={CINZA} />
      {/* cabeça */}
      <ellipse cx={540} cy={980} rx={330} ry={380} fill="#c58c63" stroke={TINTA} strokeWidth={12} />
      <ellipse cx={212} cy={1010} rx={46} ry={80} fill="#b47a52" stroke={TINTA} strokeWidth={10} />
      <ellipse cx={868} cy={1010} rx={46} ry={80} fill="#b47a52" stroke={TINTA} strokeWidth={10} />
      <path d="M 220,900 C 200,620 380,560 540,560 C 720,560 880,620 860,900 C 820,760 700,700 540,700 C 380,700 260,760 220,900 Z" fill="#17131a" stroke={TINTA} strokeWidth={10} />
      {/* tira da máscara */}
      <rect x={196} y={860} width={688} height={46} rx={20} fill="#1f2733" />
      {/* máscara */}
      <path d="M 300,820 C 300,780 340,760 400,760 L 680,760 C 740,760 780,780 780,820 L 780,1000 C 780,1050 740,1070 680,1060 L 590,1050 C 560,1010 520,1010 490,1050 L 400,1060 C 340,1070 300,1050 300,1000 Z" fill="#bfefff" fillOpacity={0.4} stroke="#1f2733" strokeWidth={20} />
      {[430, 650].map((ex, i) => (
        <g key={i}>
          <ellipse cx={ex} cy={905} rx={56} ry={62 * pisca + 1} fill="#fff" stroke={TINTA} strokeWidth={6} />
          {pisca > 0.3 && <circle cx={ex + olhar[0] * 22} cy={905 + olhar[1] * 26} r={26} fill="#2a1a12" />}
          {pisca > 0.3 && <circle cx={ex + olhar[0] * 22 - 8} cy={905 + olhar[1] * 26 - 9} r={8} fill="#fff" />}
          <path d={`M ${ex - 60},${812 - (i ? -tensao * 14 : tensao * 14) * 0 - tensao * 6} Q ${ex},${790 + tensao * (i ? 14 : 14)} ${ex + 60},${812 + (i ? -1 : 1) * tensao * 12}`} stroke="#17131a" strokeWidth={14} fill="none" strokeLinecap="round" />
        </g>
      ))}
      <path d="M 340,800 L 420,780" stroke="#fff" strokeWidth={10} opacity={0.7} strokeLinecap="round" />
      <path d="M 700,790 L 740,800" stroke="#fff" strokeWidth={8} opacity={0.5} strokeLinecap="round" />
      {/* regulador */}
      <rect x={470} y={1150} width={140} height={90} rx={30} fill="#2b3240" stroke={TINTA} strokeWidth={10} />
      <circle cx={540} cy={1195} r={22} fill="#4b5563" />
      {/* água cobrindo metade do rosto */}
      <g opacity={agua}>
        <path d={`M -200,${1040 + Math.sin(f * 0.15) * 10} ${Array.from({ length: 30 }, (_, i) => `L ${-200 + i * 52},${1040 + Math.sin(f * 0.15 + i * 0.7) * 16}`).join(" ")} L 1300,2200 L -200,2200 Z`} fill="#2fb8d0" opacity={0.62} />
        <path d={`M -200,${1040} ${Array.from({ length: 30 }, (_, i) => `L ${-200 + i * 52},${1040 + Math.sin(f * 0.15 + i * 0.7) * 16}`).join(" ")}`} stroke="#effcff" strokeWidth={10} fill="none" />
        <Bolhas f={f} x={700} y={1260} n={12} seed="rosto" altura={240} tam={1.4} />
        <Bolhas f={f} x={380} y={1240} n={8} seed="rosto2" altura={220} tam={1.1} />
      </g>
    </g>
  );
};

// ------------------------------------------------------------------ ANATOMIA 2D
/** Corte do ouvido: canal externo (esq.), tímpano, ouvido médio com AR e tuba auditiva. Origem no tímpano. */
export const OuvidoCorte: React.FC<{ f: number; dif: number; setas: number; ar?: number }> = ({ f, dif, setas, ar = 1 }) => {
  const curva = 18 + dif * 26 + Math.sin(f * 0.15) * 2;
  return (
    <g>
      {/* osso/tecido */}
      <path d="M -520,-330 C -200,-380 300,-420 520,-300 L 520,380 C 300,440 -200,420 -520,360 Z" fill="#f2c7a5" stroke={TINTA} strokeWidth={8} />
      {/* canal auditivo externo */}
      <path d="M -540,-90 C -320,-110 -120,-100 0,-120 L 0,120 C -120,100 -320,110 -540,90 Z" fill="#7ad0f0" stroke={TINTA} strokeWidth={8} />
      {/* ouvido médio (ar) */}
      <path d="M 0,-170 C 140,-200 260,-170 280,-60 C 300,40 270,150 160,170 L 120,320 L 70,320 L 80,170 C 40,160 0,150 0,150 Z" fill={AMARELO} fillOpacity={0.55 * ar} stroke={TINTA} strokeWidth={8} />
      <text x={150} y={20} textAnchor="middle" fontFamily="Anton" fontSize={64} fill={TINTA} opacity={ar}>AR</text>
      {/* ossículos */}
      <path d={`M ${curva * 0.4},-40 C 60,-90 110,-110 150,-80 C 180,-60 200,-90 230,-70`} fill="none" stroke="#fff6e8" strokeWidth={16} strokeLinecap="round" />
      <path d={`M ${curva * 0.4},-40 C 60,-90 110,-110 150,-80 C 180,-60 200,-90 230,-70`} fill="none" stroke={TINTA} strokeWidth={4} strokeLinecap="round" opacity={0.6} />
      {/* tímpano: curva para dentro conforme a diferença */}
      <path d={`M 0,-130 Q ${curva},0 0,130`} fill="none" stroke="#e56b8f" strokeWidth={16} strokeLinecap="round" />
      <text x={-30} y={-160} textAnchor="end" fontFamily="Montserrat" fontWeight={900} fontSize={34} fill={TINTA}>tímpano</text>
      <text x={-300} y={-140} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={30} fill={TINTA}>canal do ouvido</text>
      <text x={250} y={300} fontFamily="Montserrat" fontWeight={900} fontSize={28} fill={TINTA}>tuba auditiva</text>
      {/* setas de pressão da água entrando pelo canal */}
      {Array.from({ length: 4 }, (_, i) => {
        const u = ((f * 0.025 + i / 4) % 1);
        return <g key={i} opacity={setas * Math.sin(u * Math.PI)} transform={`translate(${-520 + u * 440} ${-50 + i * 34})`}><line x1={0} y1={0} x2={60} y2={0} stroke="#1b6fd1" strokeWidth={10} strokeLinecap="round" /><path d="M 80,0 L 56,-14 L 56,14 Z" fill="#1b6fd1" /></g>;
      })}
    </g>
  );
};

/** Tórax lateral 2D (origem no centro): costelas, diafragma, dois pulmões; resp 0..1 = ciclo respiratório. */
export const ToraxLateral: React.FC<{ resp: number; destaque?: number }> = ({ resp, destaque = 0 }) => {
  const e = 1 + resp * 0.06, dd = resp * 14;
  return (
    <g>
      <g transform={`scale(${e} ${1 + resp * 0.04})`}>
        <path d="M -70,-90 C -110,-60 -120,20 -100,80 C -60,90 -20,70 -10,40 L -10,-80 Z" fill="#ff9fb0" stroke={TINTA} strokeWidth={5} />
        <path d="M 70,-90 C 110,-60 120,20 100,80 C 60,90 20,70 10,40 L 10,-80 Z" fill="#ff8fa3" stroke={TINTA} strokeWidth={5} />
        <circle r={150} fill={AMARELO} opacity={0.18 * destaque} />
      </g>
      <path d="M 0,-140 L 0,-80 M 0,-80 L -40,-60 M 0,-80 L 40,-60" stroke="#ffdbe2" strokeWidth={14} strokeLinecap="round" />
      {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M -118,${-80 + i * 34} Q 0,${-60 + i * 34 + 22} 118,${-80 + i * 34}`} fill="none" stroke="#fff6e8" strokeWidth={9} opacity={0.9} />)}
      <path d={`M -120,${100 + dd} Q 0,${50 + dd} 120,${100 + dd}`} fill="none" stroke="#4f86e8" strokeWidth={14} strokeLinecap="round" />
    </g>
  );
};

/** Silhueta humana frontal 2D (origem no peito). focos: ouvido/seios (gás), pulmão (gás), tecidos (água). */
export const SilhuetaCorpo: React.FC<{ f: number; gasCab: number; gasPulmao: number; tecidos: number; op?: number }> = ({ f, gasCab, gasPulmao, tecidos, op = 1 }) => {
  const pul = (a: number) => a * (0.75 + 0.25 * Math.sin(f * 0.18));
  return (
    <g opacity={op}>
      <path d="M 0,-470 C 70,-470 100,-420 100,-360 C 100,-300 70,-260 40,-250 L 40,-220 C 140,-210 200,-180 210,-100 L 230,200 C 232,230 190,240 180,210 L 160,-40 L 150,250 L 140,620 C 140,660 70,660 70,620 L 30,280 L -30,280 L -70,620 C -70,660 -140,660 -140,620 L -150,250 L -160,-40 L -180,210 C -190,240 -232,230 -230,200 L -210,-100 C -200,-180 -140,-210 -40,-220 L -40,-250 C -70,-260 -100,-300 -100,-360 C -100,-420 -70,-470 0,-470 Z"
        fill="#9fd4ff" fillOpacity={0.22} stroke="#d8f1ff" strokeWidth={7} />
      {/* tecidos com muita água (azul) */}
      <g opacity={tecidos}>
        <path d="M -150,0 L 150,0 L 140,250 L -140,250 Z" fill="#3aa0ff" opacity={0.35} />
        <path d="M -130,300 L -50,300 L -80,600 L -125,600 Z M 130,300 L 50,300 L 80,600 L 125,600 Z" fill="#3aa0ff" opacity={0.35} />
        <path d="M -190,-80 L -170,180 L -200,180 Z M 190,-80 L 170,180 L 200,180 Z" fill="#3aa0ff" opacity={0.35} />
      </g>
      {/* gás na cabeça: seios da face e ouvidos */}
      <g opacity={gasCab}>
        {[[-98, -360], [98, -360]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={18 + 6 * pul(1)} ry={24 + 6 * pul(1)} fill={AMARELO} stroke={TINTA} strokeWidth={4} />)}
        {[[-30, -385], [30, -385], [0, -350]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={18} ry={14} fill={AMARELO} opacity={0.85} stroke={TINTA} strokeWidth={3} />)}
      </g>
      {/* pulmões (gás) */}
      <g opacity={gasPulmao}>
        <path d="M -20,-170 C -110,-170 -140,-60 -130,30 C -90,50 -40,30 -20,0 Z" fill={AMARELO} fillOpacity={0.8} stroke={TINTA} strokeWidth={5} />
        <path d="M 20,-170 C 110,-170 140,-60 130,30 C 90,50 40,30 20,0 Z" fill={AMARELO} fillOpacity={0.8} stroke={TINTA} strokeWidth={5} />
      </g>
    </g>
  );
};

// ------------------------------------------------------------------ FUNDO HADAL E VIDA
/** Fundo da fossa: sedimento fino, rochas e dobras de terreno. Topo do sedimento em y0. */
export const FundoHadal: React.FC<{ f: number; y0: number; luz?: number }> = ({ f, y0, luz = 0.4 }) => (
  <g>
    <path d={`M -1400,${y0 + 40} C -900,${y0 - 120} -500,${y0 - 60} -200,${y0 - 160} C 100,${y0 - 260} 380,${y0 - 40} 700,${y0 - 90} C 1000,${y0 - 140} 1300,${y0 - 30} 2500,${y0 - 80} L 2500,${y0 + 1600} L -1400,${y0 + 1600} Z`} fill={mix("#1c2b4a", "#5d6f8f", luz)} />
    <path d={`M -1400,${y0 + 140} C -800,${y0 + 40} -300,${y0 + 160} 200,${y0 + 70} C 600,${y0} 1000,${y0 + 140} 2500,${y0 + 60} L 2500,${y0 + 1600} L -1400,${y0 + 1600} Z`} fill={mix("#25365a", "#8193b3", luz)} />
    {[[-200, 120, 160], [260, 90, 90], [820, 150, 140], [1180, 100, 70], [-620, 140, 120]].map(([x, dy, r], i) => (
      <path key={i} d={`M ${x - r},${y0 + dy} C ${x - r * 0.8},${y0 + dy - r * 0.9} ${x + r * 0.6},${y0 + dy - r} ${x + r},${y0 + dy} Z`} fill={mix("#18233d", "#4a5a7a", luz)} stroke={TINTA} strokeWidth={6} />
    ))}
    {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={-1000 + rnd(`oc01sed${i}`) * 3200} cy={y0 + 120 + rnd(`oc01sedy${i}`) * 500} r={3 + rnd(`oc01sedr${i}`) * 4} fill="#a9b8d6" opacity={0.25 * (0.5 + luz)} />)}
  </g>
);

/** Anfípode estilizado (crustáceo pequeno), andando para a direita. */
export const Anfipode: React.FC<{ x: number; y: number; f: number; escala?: number; dir?: number; seed?: number }> = ({ x, y, f, escala = 1, dir = 1, seed = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${escala * dir} ${escala})`}>
    {Array.from({ length: 6 }, (_, i) => (
      <line key={`p${i}`} x1={-50 + i * 20} y1={6} x2={-56 + i * 20 + Math.sin(f * 0.5 + i + seed) * 8} y2={34} stroke="#f1d6c8" strokeWidth={5} strokeLinecap="round" />
    ))}
    <path d="M -70,0 C -70,-40 -20,-46 20,-44 C 50,-42 70,-30 76,-8 C 60,6 20,10 -20,10 C -50,10 -70,8 -70,0 Z" fill="#f6e3d6" stroke={TINTA} strokeWidth={5} />
    {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M ${-50 + i * 22},-40 Q ${-44 + i * 22},-14 ${-50 + i * 22},8`} stroke="#d9b8a6" strokeWidth={4} fill="none" />)}
    <circle cx={60} cy={-20} r={5} fill={TINTA} />
    <path d={`M 74,-20 C 100,-40 ${120 + Math.sin(f * 0.3 + seed) * 6},-60 130,-70`} stroke="#f1d6c8" strokeWidth={4} fill="none" />
    <path d={`M -70,-4 C -96,0 -110,${-10 + Math.sin(f * 0.4 + seed) * 6} -120,-20`} stroke="#f1d6c8" strokeWidth={4} fill="none" />
  </g>
);

// ------------------------------------------------------------------ SUBMERSÍVEL (didático, sem modelo real)
export const Submersivel: React.FC<{ x: number; y: number; f: number; escala?: number; dir?: number; corte?: number; farol?: number; braco?: number; dentro?: React.ReactNode; setas?: number }> = ({
  x, y, f, escala = 1, dir = -1, corte = 0, farol = 1, braco = 0, dentro, setas = 0,
}) => {
  const helice = (cx: number, cy: number) => (
    <g transform={`translate(${cx} ${cy})`}>
      <rect x={-34} y={-30} width={68} height={60} rx={14} fill="#3b4656" stroke={TINTA} strokeWidth={6} />
      <ellipse cx={-38} cy={0} rx={8} ry={40 * Math.abs(Math.cos(f * 0.9))} fill="#9aa3b0" stroke={TINTA} strokeWidth={4} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${escala * dir} ${escala})`}>
      {/* feixe do farol (para a frente = +x local) */}
      <path d={`M 250,10 L 1300,${-120 + Math.sin(f * 0.03) * 60} L 1300,${380 + Math.sin(f * 0.03) * 60} Z`} fill="#fff6c8" opacity={0.2 * farol} />
      <path d={`M 250,10 L 1000,${-40 + Math.sin(f * 0.03) * 50} L 1000,${260 + Math.sin(f * 0.03) * 50} Z`} fill="#fff6c8" opacity={0.16 * farol} />
      {/* estrutura externa (flutuação) */}
      <path d="M -300,-150 C -300,-220 -200,-240 0,-240 C 200,-240 280,-200 280,-130 L 280,40 L -300,40 Z" fill="#ffd23f" stroke={TINTA} strokeWidth={8} opacity={1 - corte * 0.75} />
      <rect x={-300} y={40} width={580} height={30} fill="#d9dee5" stroke={TINTA} strokeWidth={6} />
      {helice(-330, -60)}
      {helice(-200, -250)}
      {/* esfera de pressão (tripulantes) */}
      <circle cx={60} cy={150} r={150} fill="#e6ebf0" stroke={TINTA} strokeWidth={10} />
      <circle cx={60} cy={150} r={150 - 22} fill={corte > 0 ? mix("#e6ebf0", "#203454", corte) : "#e6ebf0"} stroke="#7d8896" strokeWidth={4} />
      {corte > 0 && <g opacity={corte}>{dentro}</g>}
      {corte < 1 && <circle cx={190} cy={150} r={26} fill="#89d6ff" stroke={TINTA} strokeWidth={7} opacity={1 - corte} />}
      {setas > 0 && <SetasPressao f={f} cx={60} cy={150} rx={175} ry={175} n={12} forca={1} op={setas} seed="sub" />}
      {/* faróis */}
      <circle cx={250} cy={10} r={22} fill="#fff6c8" stroke={TINTA} strokeWidth={6} />
      <circle cx={250} cy={10} r={50} fill="#fff6c8" opacity={0.3 * farol} />
      {/* braço mecânico articulado */}
      <g transform={`translate(200 250) rotate(${20 - 30 * braco})`}>
        <rect x={0} y={-12} width={140} height={24} rx={10} fill="#8c97a6" stroke={TINTA} strokeWidth={6} />
        <g transform={`translate(140 0) rotate(${40 + 30 * braco})`}>
          <rect x={0} y={-10} width={110} height={20} rx={8} fill="#8c97a6" stroke={TINTA} strokeWidth={6} />
          <path d={`M 110,0 L 140,${-16 - 8 * Math.sin(f * 0.1)} M 110,0 L 140,${16 + 8 * Math.sin(f * 0.1)}`} stroke={TINTA} strokeWidth={8} strokeLinecap="round" />
        </g>
      </g>
      {/* luzes de navegação */}
      <circle cx={-260} cy={-160} r={9} fill={Math.sin(f * 0.2) > 0 ? "#ff5a5a" : "#7a2a2a"} />
    </g>
  );
};

export const clampP = clamp01;
export { eio, eout, ramp, wobble };
