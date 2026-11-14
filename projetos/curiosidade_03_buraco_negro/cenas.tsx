// CURIOSIDADE 03 — E se você caísse em um buraco negro? Viagem imaginária (supermassivo idealizado, sem disco quente). 2D científico, sem terror.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Camera } from "../../engine/src/kit/Camera";
import { Personagem, Visual } from "../../engine/src/kit/Personagem";
import { parado, apontando, pensando, falando, Pose } from "../../engine/src/kit/poses";
import { EXPRESSOES, exprEm } from "../../engine/src/kit/expressoes";
import { chaves, clamp01, eback, eio, eout, lerp, piscar, ramp, rnd } from "../../engine/src/kit/anim";
import { useCena } from "../../engine/src/kit/tempo";
import { Avatar, AVATAR, EST_CANAL, EST_CANAL_NOITE, SeloCanal, TarjaCanal, cabecaDoRig, TINTA_CANAL as TINTA } from "../../engine/src/kit/canal";

const W = 1080, H = 1920;
type C = React.FC<{ inicio: number; fim: number }>;
const Tela: React.FC<{ children: React.ReactNode; op?: number }> = ({ children, op = 1 }) => <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: op }}>{children}</svg>;
const TRAJE: Visual = { ...AVATAR, roupa: "moletom", cor: "#e8ecf2", cor2: "#ff8c42", calca: "#cfd6e0", sapato: "#8a96a8" };
const CIENT_A: Visual = { pele: "#8d5a3b", cabelo: "coque", corCabelo: "#1d1210", roupa: "jaleco", cor: "#5b4bd8", cor2: "#ffcf3f", calca: "#2b2d42", sapato: "#3a2a20", oculos: true, corpo: "medio" };
const CIENT_B: Visual = { pele: "#f0c8a0", cabelo: "curto", corCabelo: "#8a4b22", roupa: "jaleco", cor: "#2fb3c9", calca: "#34344a", sapato: "#222", corpo: "magro" };

/** Espaço com estrelas; perto do buraco negro as estrelas aparecem curvadas (lente gravitacional estilizada). */
const Espaco: React.FC<{ f: number; bx: number; by: number; r: number; id: string; lente?: number }> = ({ f, bx, by, r, id, lente = 1 }) => (
  <g>
    <defs><radialGradient id={id} cx="0.5" cy="0.4" r="0.8"><stop offset="0" stopColor="#1b1446" /><stop offset="1" stopColor="#05030f" /></radialGradient></defs>
    <rect x={-3000} y={-3000} width={7000} height={7000} fill={`url(#${id})`} />
    {Array.from({ length: 160 }, (_, i) => {
      const x = -900 + rnd(`bn${i}`) * 2900, y = -700 + rnd(`bny${i}`) * 3300;
      const d = Math.hypot(x - bx, y - by);
      if (d < r * 1.05) return null;
      const perto = clamp01((r * 3 - d) / (r * 2)) * lente;
      const ang = Math.atan2(y - by, x - bx);
      if (perto > 0.05) {
        const a0 = ang - perto * 0.5, a1 = ang + perto * 0.5;
        return <path key={i} d={`M ${bx + Math.cos(a0) * d},${by + Math.sin(a0) * d} A ${d},${d} 0 0 1 ${bx + Math.cos(a1) * d},${by + Math.sin(a1) * d}`} stroke="#fff" strokeWidth={2 + rnd(`bnr${i}`) * 2} fill="none" opacity={0.7} strokeLinecap="round" />;
      }
      return <circle key={i} cx={x} cy={y} r={1.5 + rnd(`bnr${i}`) * 2.5} fill="#fff" opacity={0.4 + 0.6 * Math.abs(Math.sin(f * 0.05 + i))} />;
    })}
  </g>
);
/** Buraco negro idealizado: região escura + anel fino de luz desviada (sem disco de acreção). */
const BuracoNegro: React.FC<{ x: number; y: number; r: number; f: number; horizonte?: number }> = ({ x, y, r, f, horizonte = 0 }) => (
  <g>
    <circle cx={x} cy={y} r={r * 1.5} fill="#9fb6ff" opacity={0.06} />
    <circle cx={x} cy={y} r={r * 1.12} fill="none" stroke="#cfe0ff" strokeWidth={r * 0.05} opacity={0.55 + 0.1 * Math.sin(f * 0.05)} />
    <circle cx={x} cy={y} r={r} fill="#000" />
    {horizonte > 0 && <circle cx={x} cy={y} r={r * 1.02} fill="none" stroke="#ffd60a" strokeWidth={6} strokeDasharray="18 14" strokeDashoffset={-f} opacity={horizonte} />}
  </g>
);
/** Cápsula vista de fora (lado), com janela e luz. */
const Capsula: React.FC<{ x: number; y: number; s: number; ang?: number; f: number; estica?: number }> = ({ x, y, s, ang = 0, f, estica = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${ang}) scale(${s * (1 + estica * 0.6)} ${s * (1 - estica * 0.25)})`}>
    <path d="M -120,-60 C -60,-90 80,-90 130,-30 C 150,0 150,20 130,40 C 80,90 -60,90 -120,60 Z" fill="#e8ecf2" stroke={TINTA} strokeWidth={7} />
    <circle cx={60} cy={0} r={30} fill="#7fd6ff" stroke={TINTA} strokeWidth={6} />
    <rect x={-150} y={-28} width={36} height={56} rx={8} fill="#8a96a8" stroke={TINTA} strokeWidth={5} />
    <circle cx={-20} cy={-50} r={7} fill={Math.sin(f * 0.25) > 0 ? "#43e08a" : "#1a4a2a"} />
  </g>
);
/** Interior da cápsula: janela grande, painel e luzes. */
const Cabine: React.FC<{ f: number; children?: React.ReactNode; painel?: React.ReactNode }> = ({ f, children, painel }) => (
  <g>
    <rect x={-800} y={-800} width={2700} height={3600} fill="#2b3346" />
    <clipPath id="bn-jan"><ellipse cx={560} cy={760} rx={430} ry={470} /></clipPath>
    <g clipPath="url(#bn-jan)">{children}</g>
    <ellipse cx={560} cy={760} rx={430} ry={470} fill="none" stroke="#c9d2dc" strokeWidth={30} />
    <ellipse cx={560} cy={760} rx={430} ry={470} fill="none" stroke={TINTA} strokeWidth={8} />
    <path d="M -800,1300 L 1900,1300 L 1900,2800 L -800,2800 Z" fill="#3a4258" />
    <rect x={120} y={1330} width={840} height={180} rx={20} fill="#1b2230" stroke={TINTA} strokeWidth={8} />
    {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={180 + i * 100} cy={1380} r={12} fill={(Math.floor(f / 8) + i) % 3 ? "#43e08a" : "#ffd60a"} />)}
    {painel}
  </g>
);
const Capacete: React.FC<{ c: [number, number]; s: number }> = ({ c, s }) => (
  <g transform={`translate(${c[0]} ${c[1]}) scale(${s})`}>
    <circle r={128} fill="#bfefff" opacity={0.18} stroke="#e8ecf2" strokeWidth={10} />
    <path d="M -80,-80 A 110,110 0 0 1 20,-118" stroke="#fff" strokeWidth={10} fill="none" opacity={0.6} strokeLinecap="round" />
  </g>
);
const Astronauta: React.FC<{ id: string; x: number; y: number; s: number; pose: Pose; expr: typeof EXPRESSOES.neutro; f: number; dir?: 1 | -1 }> = ({ id, x, y, s, pose, expr, f, dir = 1 }) => (
  <g>
    <Avatar id={id} x={x} y={y} escala={s} pose={pose} expr={expr} f={f} dir={dir} visual={TRAJE} fone={false} estilo={EST_CANAL_NOITE} />
    <Capacete c={cabecaDoRig(x, y, s, pose, dir)} s={s} />
  </g>
);

// ================================================================== 01 QUEDA
export const Cena01: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const pose: Pose = { ...parado(lf, 1), virar: 0.5, olhar: [0.8, -0.5], bracoD: [40, 60] };
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 560, 1000, 1.0], [P("volta"), 560, 900, 1.2], [dur, 600, 820, 1.45]]} deriva={0}>
        <Cabine f={lf}>
          <Espaco f={lf} bx={620} by={700} r={140 + lf * 0.15} id="bn1" />
          <BuracoNegro x={620} y={700} r={140 + lf * 0.15} f={lf} />
          <path d={`M 260,420 Q 420,500 ${560 + Math.sin(lf * 0.03) * 10},640`} fill="none" stroke="#ffd60a" strokeWidth={8} strokeDasharray="20 14" strokeDashoffset={-lf * 2} />
          <path d="M 560,640 l -10,-34 l 30,22 Z" fill="#ffd60a" />
        </Cabine>
        <Astronauta id="bn3-astro-c1" x={300} y={1900} s={1.15} pose={pose} f={lf} expr={exprEm(lf, [[0, "pensativo"], [P("estranho"), "maravilhado"], [P("parede"), "pensativo"]])} />
      </Camera>
      <Tela><SeloCanal f={lf} em={P("ponto") - 2} t="O PONTO SEM VOLTA" y={300} tam={70} fundo="#c9b8ff" /></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 02 OBJETO ESCURO
export const Cena02: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const instr = eio(ramp(lf, P("Assim") - 6, P("Assim") + 10));
  const pose: Pose = { ...parado(lf, 1), dx: lerp(0, 60, instr), bracoD: [lerp(40, 70, instr), lerp(60, 90, instr)], olhar: instr > 0.5 ? [0.6, -0.4] : [0.3, 0.7] };
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 540, 820, 1.25], [P("supermassivo"), 560, 780, 1.4], [P("Assim"), 500, 1000, 1.0], [dur, 520, 980, 1.05]]} deriva={0}>
        <Cabine f={lf} painel={<g><rect x={620} y={1100} width={260} height={160} rx={14} fill="#0d1a24" stroke={TINTA} strokeWidth={6} /><circle cx={750} cy={1180} r={50} fill="#000" stroke="#cfe0ff" strokeWidth={4} /><circle cx={840} cy={1130} r={6} fill="#ffd60a" /></g>}>
          <Espaco f={lf} bx={560} by={760} r={200} id="bn2" />
          <BuracoNegro x={560} y={760} r={200} f={lf} />
          {/* escala simbólica: a cápsula é um pontinho perto do objeto */}
          <g opacity={clamp01(ramp(lf, P("isolado"), P("isolado") + 10))}><Capsula x={860} y={460} s={0.25} ang={30} f={lf} /><text x={860} y={430} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={22} fill="#fff">cápsula (fora de escala)</text></g>
        </Cabine>
        <Astronauta id="bn3-astro-c2" x={260} y={1900} s={1.1} pose={pose} f={lf} expr={EXPRESSOES.pensativo} />
      </Camera>
      <Tela><TarjaCanal t="SIMULAÇÃO • SUPERMASSIVO" f={lf} /></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 03 NÃO É ASPIRADOR
export const Cena03: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const a = lf * 0.02;
  const u = eio(ramp(lf, 10, dur));
  const cx = lerp(1000, 700, u), cy = lerp(300, 820, u);
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 700, 600, 1.0], [P("Mas"), 620, 900, 0.9], [dur, 600, 1000, 1.0]]} deriva={0}>
        <Espaco f={lf} bx={540} by={1100} r={180} id="bn3" />
        <BuracoNegro x={540} y={1100} r={180} f={lf} />
        {/* planeta em órbita distante (estável nesta ilustração) */}
        <ellipse cx={540} cy={1100} rx={620} ry={300} fill="none" stroke="#7fd6ff" strokeWidth={4} strokeDasharray="10 12" opacity={0.6} />
        <circle cx={540 + Math.cos(a) * 620} cy={1100 + Math.sin(a) * 300} r={34} fill="#e8a35a" stroke={TINTA} strokeWidth={5} />
        <text x={540 + Math.cos(a) * 620} y={1100 + Math.sin(a) * 300 - 50} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={24} fill="#7fd6ff">órbita distante</text>
        {/* cápsula em trajetória que se aproxima */}
        <path d="M 1000,300 Q 900,600 700,820 Q 640,900 620,960" fill="none" stroke="#ff8c42" strokeWidth={6} strokeDasharray="16 12" opacity={0.8} />
        <Capsula x={cx} y={cy} s={0.45} ang={110} f={lf} />
        <text x={cx + 70} y={cy - 40} fontFamily="Montserrat" fontWeight={900} fontSize={24} fill="#ffb27a">trajetória de queda</text>
      </Camera>
      <Tela><SeloCanal f={lf} em={P("aspirador") - 4} ate={P("Mas")} t="NÃO É UM ASPIRADOR" y={300} tam={66} fundo="#7fd6ff" /></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 04 HORIZONTE DE EVENTOS
export const Cena04: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const hz = eio(ramp(lf, P("horizonte") - 10, P("eventos") + 6));
  const luz = clamp01(ramp(lf, P("luz") - 10, P("luz")));
  const pose: Pose = { ...parado(lf, 1), dx: 50, bracoD: [70, 30 + 20 * clamp01(ramp(lf, P("Depois"), P("Depois") + 10))], olhar: [0.6, 0.2] };
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 560, 800, 1.25], [P("horizonte"), 560, 760, 1.35], [P("luz"), 520, 980, 1.0], [dur, 520, 980, 1.02]]} deriva={0}>
        <Cabine f={lf}>
          <Espaco f={lf} bx={560} by={760} r={180} id="bn4" />
          <BuracoNegro x={560} y={760} r={180} f={lf} horizonte={hz} />
          {/* setas de luz: fora escapam em várias direções; dentro, voltadas para dentro (esquema didático) */}
          {Array.from({ length: 8 }, (_, i) => {
            const ang = (i / 8) * Math.PI * 2, u = ((lf * 0.02 + i / 8) % 1);
            const r0 = 230 + u * 160;
            return <g key={`o${i}`} opacity={luz * (1 - u)}><line x1={560 + Math.cos(ang) * r0} y1={760 + Math.sin(ang) * r0} x2={560 + Math.cos(ang) * (r0 + 40)} y2={760 + Math.sin(ang) * (r0 + 40)} stroke="#fff6c8" strokeWidth={8} strokeLinecap="round" /></g>;
          })}
          {Array.from({ length: 6 }, (_, i) => {
            const ang = (i / 6) * Math.PI * 2 + 0.3;
            return <g key={`i${i}`} opacity={luz}><line x1={560 + Math.cos(ang) * 150} y1={760 + Math.sin(ang) * 150} x2={560 + Math.cos(ang) * 110} y2={760 + Math.sin(ang) * 110} stroke="#ffd60a" strokeWidth={7} strokeLinecap="round" /><circle cx={560 + Math.cos(ang) * 105} cy={760 + Math.sin(ang) * 105} r={7} fill="#ffd60a" /></g>;
          })}
        </Cabine>
        <Astronauta id="bn3-astro-c4" x={260} y={1900} s={1.1} pose={pose} f={lf} expr={EXPRESSOES.pensativo} />
      </Camera>
      <Tela><SeloCanal f={lf} em={P("horizonte") - 2} t="HORIZONTE DE EVENTOS" y={300} tam={66} fundo="#ffd60a" /></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 05 SEM PORTA
export const Cena05: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const u = eio(ramp(lf, 20, dur - 30));
  const bx = 540, by = 1250, R = 900;
  const cy = lerp(by - R - 260, by - R + 220, u);
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 540, cy + 100, 1.2], [dur, 560, cy + 60, 1.3]]} deriva={0}>
        <Espaco f={lf} bx={bx} by={by} r={R} id="bn5" lente={0.6} />
        <BuracoNegro x={bx} y={by} r={R} f={lf} horizonte={1} />
        {/* distorção estilizada do fundo */}
        {[0, 1, 2].map((i) => <path key={i} d={`M -200,${cy - 300 + i * 120} Q 540,${cy - 200 + i * 120 + Math.sin(lf * 0.05 + i) * 30} 1300,${cy - 300 + i * 120}`} stroke="#9fb6ff" strokeWidth={3} fill="none" opacity={0.25} />)}
        <Capsula x={540} y={cy} s={1.0} ang={90} f={lf} />
        {/* luzes da cabine seguem funcionando momentaneamente */}
        <circle cx={540} cy={cy + 60} r={40 + 6 * Math.sin(lf * 0.3)} fill="#7fd6ff" opacity={0.25} />
      </Camera>
      <Tela>
        <SeloCanal f={lf} em={P("parede") - 2} t="SEM PAREDE SÓLIDA" y={300} tam={66} fundo="#ffd60a" />
        <text x={540} y={1610} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={28} fill="#cfe0ff" opacity={0.85}>linha tracejada = horizonte (não é uma superfície)</text>
      </Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 06 FORÇAS DE MARÉ (painel em HyperFrames por cima)
export const Cena06: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const pose: Pose = { ...apontando(lf, 95, 1), dx: 20, olhar: [0.8, -0.3] };
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 540, 1000, 1.0], [dur, 540, 1000, 1.03]]} deriva={0}>
        <Cabine f={lf}>
          <Espaco f={lf} bx={560} by={900} r={260} id="bn6" />
          <BuracoNegro x={560} y={900} r={260} f={lf} />
        </Cabine>
        <rect x={-800} y={-800} width={2700} height={3600} fill="#05030f" opacity={0.35} />
        <Astronauta id="bn3-astro-c6" x={230} y={1900} s={1.1} pose={pose} f={lf} expr={exprEm(lf, [[0, "pensativo"], [P("extrema") - 4, "surpreso"]])} />
      </Camera>
    </AbsoluteFill>
  );
};

// ================================================================== 07 ESPAGUETIFICAÇÃO
export const Cena07: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const estica = Math.sin(clamp01(ramp(lf, 10, P("espaguetificação") + 30)) * Math.PI) * 0.9; // estica e volta (simbólico)
  const capE = Math.sin(clamp01(ramp(lf, P("espaguetificação") + 20, P("depende"))) * Math.PI) * 0.5;
  const pose: Pose = { ...parado(lf, 1), olhar: [0.3, -0.6] };
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 540, 900, 1.0], [P("A"), 540, 900, 1.05], [dur, 560, 980, 1.0]]} deriva={0}>
        <Espaco f={lf} bx={540} by={1500} r={300} id="bn7" />
        <BuracoNegro x={540} y={1500} r={300} f={lf} />
        {/* ícone educativo: massa elástica entre setas */}
        <g transform="translate(540 640)">
          <line x1={0} y1={-260 - estica * 80} x2={0} y2={-180 - estica * 80} stroke="#7fd6ff" strokeWidth={10} markerEnd="" />
          <path d={`M 0,${-280 - estica * 80} l -18,26 l 36,0 Z`} fill="#7fd6ff" />
          <line x1={0} y1={180 + estica * 120} x2={0} y2={260 + estica * 200} stroke="#ff8c42" strokeWidth={14} />
          <path d={`M 0,${280 + estica * 200} l -22,-30 l 44,0 Z`} fill="#ff8c42" />
          <rect x={-90 * (1 - estica * 0.5)} y={-150 - estica * 80} width={180 * (1 - estica * 0.5)} height={300 + estica * 200} rx={90 * (1 - estica * 0.5)} fill="#ffb3d1" stroke={TINTA} strokeWidth={7} />
          <circle cx={-22} cy={-60 - estica * 40} r={10} fill={TINTA} /><circle cx={22} cy={-60 - estica * 40} r={10} fill={TINTA} />
        </g>
        <Capsula x={850} y={1100} s={0.6} ang={90} f={lf} estica={capE} />
        <Astronauta id="bn3-astro-c7" x={220} y={1640} s={0.75} pose={pose} f={lf} expr={EXPRESSOES.pensativo} />
      </Camera>
      <Tela>
        <SeloCanal f={lf} em={P("espaguetificação") - 2} t="ESPAGUETIFICAÇÃO" y={300} tam={70} fundo="#ffb3d1" />
        <text x={540} y={1610} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={28} fill="#cfe0ff" opacity={0.85}>representação simbólica</text>
      </Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 08 O MISTÉRIO
export const Cena08: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const lab = P("ciência") - 8;
  if (lf < lab) {
    return (
      <AbsoluteFill>
        <Camera inicio={inicio} chaves={[[0, 540, 960, 1.0], [lab, 540, 960, 1.15]]} deriva={0}>
          <Espaco f={lf} bx={540} by={960} r={300} id="bn8" />
          <BuracoNegro x={540} y={960} r={300} f={lf} />
          {Array.from({ length: 6 }, (_, i) => { const u = ((lf * 0.012 + i / 6) % 1); return <text key={i} x={540 + Math.cos(i) * 120 * (1 - u)} y={980 + Math.sin(i * 2) * 100 * (1 - u)} textAnchor="middle" fontFamily="Anton" fontSize={130 - u * 50} fill="#efe6ff" stroke="#7a5cff" strokeWidth={4} opacity={(1 - u) * Math.min(1, u * 5)}>?</text>; })}
        </Camera>
        <Tela><SeloCanal f={lf} em={P("centro") - 2} t="AINDA HÁ MISTÉRIOS" y={300} tam={68} fundo="#c9b8ff" /></Tela>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[lab, 540, 1150, 1.2], [dur, 560, 1150, 1.25]]} deriva={0}>
        <rect x={-800} y={-800} width={2700} height={3600} fill="#1b2240" />
        {[0, 1].map((i) => (
          <g key={i} transform={`translate(${300 + i * 480} 760)`}>
            <rect x={-200} y={-150} width={400} height={300} rx={18} fill="#0d1a24" stroke={TINTA} strokeWidth={8} />
            <circle r={70} fill="#000" stroke="#cfe0ff" strokeWidth={4} />
            {Array.from({ length: 4 }, (_, k) => <ellipse key={k} rx={110 + k * 18} ry={30 + k * 8} fill="none" stroke="#7fd6ff" strokeWidth={2} opacity={0.5} transform={`rotate(${lf * (1 + k) * (i ? -1 : 1)})`} />)}
          </g>
        ))}
        <rect x={-800} y={1720} width={2700} height={800} fill="#2b3346" />
        <Personagem id="bn3-cient-a" x={330} y={1760} escala={1.0} visual={CIENT_A} estilo={EST_CANAL} pose={apontando(lf, 150, 3)} expr={EXPRESSOES.pensativo} olhosAbertos={piscar(lf, 3)} />
        <Personagem id="bn3-cient-b" x={760} y={1760} escala={1.0} dir={-1} visual={CIENT_B} estilo={EST_CANAL} pose={{ ...pensando(lf, 4) }} expr={EXPRESSOES.desconfiado} olhosAbertos={piscar(lf, 4)} />
      </Camera>
    </AbsoluteFill>
  );
};

// ================================================================== 09 CONCLUSÃO
export const Cena09: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 540, 1250, 1.6], [P("Você"), 540, 1150, 1.15], [dur, 540, 1000, 0.85]]} deriva={0}>
        <Espaco f={lf} bx={-900} by={-900} r={10} id="bn9" lente={0} />
        {/* observatório espacial (local seguro) */}
        <path d="M -400,1400 C -200,1100 1280,1100 1480,1400 L 1480,2400 L -400,2400 Z" fill="#3a4258" stroke={TINTA} strokeWidth={8} />
        <path d="M -200,1200 C 0,700 1080,700 1280,1200" fill="#9fd8ff" opacity={0.12} stroke="#c9d2dc" strokeWidth={14} />
        {/* holograma do buraco negro */}
        <g transform="translate(700 1150)" opacity={0.9}>
          <path d="M -150,200 L 150,200 L 60,40 L -60,40 Z" fill="#7fd6ff" opacity={0.12} />
          <circle cy={-40} r={70} fill="#000" stroke="#7fd6ff" strokeWidth={5} />
          <circle cy={-40} r={92} fill="none" stroke="#7fd6ff" strokeWidth={3} opacity={0.6 + 0.3 * Math.sin(lf * 0.1)} />
          <rect x={-90} y={200} width={180} height={30} rx={10} fill="#8a96a8" stroke={TINTA} strokeWidth={5} />
        </g>
        <Avatar id="bn3-avatar-c9" x={380} y={1700} escala={1.0} pose={{ ...parado(lf, 1), virar: 0.4, olhar: [0.8, -0.2] }} f={lf} estilo={EST_CANAL_NOITE}
          expr={exprEm(lf, [[0, "maravilhado"], [P("Você"), "feliz"]])} />
      </Camera>
    </AbsoluteFill>
  );
};
