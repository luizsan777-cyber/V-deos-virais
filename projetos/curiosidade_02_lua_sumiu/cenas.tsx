// CURIOSIDADE 02 — E se a Lua desaparecesse de repente? (simulação fictícia, sem explosão; 2D colorido, sem terror)
import React from "react";
import { AbsoluteFill } from "remotion";
import { Camera } from "../../engine/src/kit/Camera";
import { Personagem } from "../../engine/src/kit/Personagem";
import { parado, andando, apontando, pensando, Pose } from "../../engine/src/kit/poses";
import { EXPRESSOES, exprEm } from "../../engine/src/kit/expressoes";
import { Globo } from "../../engine/src/kit/Globo";
import { chaves, clamp01, eback, eio, eout, lerp, piscar, ramp, rnd, wobble } from "../../engine/src/kit/anim";
import { useCena } from "../../engine/src/kit/tempo";
import { Avatar, AMIGO_CANAL, EST_CANAL, EST_CANAL_NOITE, SeloCanal, TarjaCanal, cabecaDoRig, TINTA_CANAL as TINTA } from "../../engine/src/kit/canal";

const W = 1080, H = 1920;
type C = React.FC<{ inicio: number; fim: number }>;
const Tela: React.FC<{ children: React.ReactNode; op?: number }> = ({ children, op = 1 }) => <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: op }}>{children}</svg>;

const CeuNoite: React.FC<{ f: number; lua: number; estrelas: number; id: string; lx?: number; ly?: number; contorno?: number }> = ({ f, lua, estrelas, id, lx = 760, ly = 380, contorno = 0 }) => (
  <g>
    <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0b1640" /><stop offset="1" stopColor={lua > 0 ? "#2b3f8a" : "#1a2660"} /></linearGradient></defs>
    <rect x={-1500} y={-1500} width={4200} height={4200} fill={`url(#${id})`} />
    {Array.from({ length: 140 }, (_, i) => {
      const x = -600 + rnd(`lu${i}`) * 2300, y = -400 + rnd(`luy${i}`) * 1900, r = 1.5 + rnd(`lur${i}`) * 3;
      return <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity={(0.25 + 0.75 * estrelas * (0.5 + 0.5 * Math.sin(f * 0.08 + i))) * (r > 3.5 || estrelas > 0.5 ? 1 : 0.7)} />;
    })}
    {lua > 0 && (
      <g opacity={lua}>
        <circle cx={lx} cy={ly} r={260} fill="#fff6d8" opacity={0.12} />
        <circle cx={lx} cy={ly} r={150} fill="#fff6d8" opacity={0.18} />
        <circle cx={lx} cy={ly} r={95} fill="#f4efe0" stroke={TINTA} strokeWidth={6} />
        {[[-30, -20, 18], [25, 15, 14], [-10, 35, 10], [35, -30, 9]].map(([x, y, r], i) => <circle key={i} cx={lx + x} cy={ly + y} r={r} fill="#d8d2c0" />)}
      </g>
    )}
    {contorno > 0 && <circle cx={lx} cy={ly} r={95} fill="none" stroke="#cfe0ff" strokeWidth={4} strokeDasharray="12 10" opacity={contorno * 0.6} />}
  </g>
);
const Nuvens: React.FC<{ f: number; luz: number }> = ({ f, luz }) => (
  <g>{[0, 1, 2].map((i) => { const x = ((f * (0.5 + i * 0.2) + i * 700) % 2200) - 600; return <g key={i} transform={`translate(${x} ${500 + i * 140})`}><ellipse rx={170} ry={42} fill={luz > 0 ? "#c9d4ff" : "#3a4680"} opacity={0.55} /><ellipse cx={-70} cy={-20} rx={90} ry={40} fill={luz > 0 ? "#dfe6ff" : "#3a4680"} opacity={0.5 + 0.3 * luz} /></g>; })}</g>
);
const Oceano: React.FC<{ f: number; y: number; brilho: number }> = ({ f, y, brilho }) => (
  <g>
    <rect x={-1500} y={y} width={4200} height={2000} fill="#123a6b" />
    {Array.from({ length: 9 }, (_, k) => {
      const yy = y + 20 + k * k * 18;
      let d = `M -1500,${yy}`;
      for (let x = -1500; x <= 2700; x += 60) d += ` L ${x},${yy + Math.sin((x + f * (2 + k)) / (90 + k * 30)) * (3 + k * 2)}`;
      return <path key={k} d={d} fill="none" stroke="#7fc4ff" strokeWidth={2 + k} opacity={0.15 + 0.05 * k} />;
    })}
    {brilho > 0 && Array.from({ length: 30 }, (_, i) => <rect key={i} x={640 + (rnd(`lbr${i}`) - 0.5) * 260 * (1 + i / 30)} y={y + 20 + i * 18} width={40 + rnd(`lbw${i}`) * 50} height={5} rx={3} fill="#fff6d8" opacity={brilho * (0.4 + 0.6 * Math.abs(Math.sin(f * 0.1 + i)))} />)}
  </g>
);
const Praia: React.FC<{ f: number; mare: number; marcas?: number }> = ({ f, mare, marcas = 0 }) => {
  const nivel = 1250 + mare * 70;
  return (
    <g>
      <rect x={-1500} y={-1500} width={4200} height={2700} fill="#9fd8ff" />
      <rect x={-1500} y={1000} width={4200} height={260} fill="#2f86c9" />
      <rect x={-1500} y={1240} width={4200} height={1500} fill="#f2d79b" />
      {/* marcas de onde a água chega (alternam) */}
      {marcas > 0 && [0, 1, 2].map((i) => <path key={i} d={`M -400,${1300 + i * 90} C 0,${1280 + i * 90} 600,${1320 + i * 90} 1500,${1295 + i * 90}`} fill="none" stroke="#c9a868" strokeWidth={6} strokeDasharray="20 14" opacity={marcas * 0.8} />)}
      <path d={`M -1500,${nivel} ${Array.from({ length: 50 }, (_, i) => `L ${-1500 + i * 90},${nivel + Math.sin(f * 0.08 + i * 0.7) * 10}`).join(" ")} L 2700,900 L -1500,900 Z`} fill="#3a9ee0" opacity={0.92} />
      <path d={`M -1500,${nivel} ${Array.from({ length: 50 }, (_, i) => `L ${-1500 + i * 90},${nivel + Math.sin(f * 0.08 + i * 0.7) * 10}`).join(" ")}`} fill="none" stroke="#fff" strokeWidth={8} opacity={0.8} />
    </g>
  );
};

// ================================================================== 01 O CÉU VAZIO
export const Cena01: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const some = eio(ramp(lf, P("sumiu") - 6, P("sumiu") + 10));
  const corte = P("mudança") - 6;
  const pose: Pose = { ...parado(lf, 1), bracoD: [150, 150], bracoE: [150, 150], olhar: [0.6, -0.9], cabecaIncl: -6 };
  const binoculo = <g transform="rotate(-30)"><rect x={-30} y={-20} width={60} height={40} rx={10} fill="#2b2f3a" stroke={TINTA} strokeWidth={5} /></g>;
  if (lf >= corte) {
    return (
      <AbsoluteFill>
        <Camera inicio={inicio} chaves={[[corte, 540, 1000, 1.25], [dur, 560, 1050, 1.1]]} deriva={0}>
          <CeuNoite f={lf} lua={0} estrelas={0.8} id="lu1b" contorno={0.6} />
          <Oceano f={lf} y={1000} brilho={0.35} />
        </Camera>
        <Tela><SeloCanal f={lf} em={4} t="E SE A LUA SUMISSE?" y={330} tam={72} /></Tela>
      </AbsoluteFill>
    );
  }
  const cab = cabecaDoRig(420, 1880, 1.15, pose);
  const olhoZoom = eio(ramp(lf, P("sumiu") - 24, P("sumiu") - 10)) * (1 - eio(ramp(lf, P("sumiu") + 16, P("sumiu") + 26)));
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 560, 1000, 1.0], [P("sumiu") - 24, 540, 1100, 1.1], [P("sumiu") - 10, cab[0] + 12, cab[1] - 6, 4.2], [P("sumiu") + 16, cab[0] + 12, cab[1] - 6, 4.0], [P("sumiu") + 30, 560, 1050, 1.05], [corte, 600, 900, 1.1]]} deriva={0}>
        <CeuNoite f={lf} lua={1 - some} estrelas={0.3 + 0.4 * some} id="lu1" />
        <Nuvens f={lf} luz={1 - some} />
        {/* varanda */}
        <rect x={-600} y={1500} width={2300} height={600} fill="#3a2f5a" />
        <Avatar id="lu2-avatar-c1" x={420} y={1880} escala={1.15} pose={pose} f={lf} estilo={EST_CANAL_NOITE} expr={exprEm(lf, [[0, "maravilhado"], [P("sumiu"), "surpreso"], [P("noite"), "pensativo"]])}
          itemD={binoculo} />
        {/* reflexo da Lua no olho, que se apaga */}
        <circle cx={cab[0] + 28} cy={cab[1] - 2} r={5} fill="#fff6d8" opacity={(1 - some) * olhoZoom} />
        <rect x={-600} y={1520} width={2300} height={30} fill="#c9b8f2" opacity={0.6} />
        {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-200 + i * 120} y={1550} width={14} height={260} fill="#c9b8f2" opacity={0.6} />)}
      </Camera>
    </AbsoluteFill>
  );
};

// ================================================================== 02 UMA HIPÓTESE (Terra–Lua e o sinal de ~1,3 s: HyperFrames por cima)
export const Cena02: C = ({ inicio }) => {
  const { lf } = useCena(inicio);
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 540, 960, 1.05], [250, 540, 960, 1.0]]} deriva={0}>
        <CeuNoite f={lf} lua={0} estrelas={0.6} id="lu2" />
      </Camera>
      <Tela><TarjaCanal t="SIMULAÇÃO" f={lf} /></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 03 AS NOITES
export const Cena03: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const campo = eio(ramp(lf, 0, 40));
  const luar = 1 - eio(ramp(lf, P("luar") - 4, P("escuras") + 10));
  const estrelas = lerp(0.3, 1, eio(ramp(lf, P("compensação"), P("estrelas"))));
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 300, 1000, 1.0], [40, 540, 1050, 1.05], [P("compensação"), 640, 900, 1.15], [dur, 700, 820, 1.25]]} deriva={0}>
        <CeuNoite f={lf} lua={0} estrelas={estrelas} id="lu3" />
        {/* cidade ao longe (luzes) */}
        <g opacity={1 - campo * 0.6}>{Array.from({ length: 14 }, (_, i) => <g key={i}><rect x={-600 + i * 110} y={1300 - (120 + (i * 53) % 220)} width={90} height={120 + (i * 53) % 220} fill="#1b2350" />{Array.from({ length: 4 }, (_, k) => <rect key={k} x={-585 + i * 110 + (k % 2) * 40} y={1300 - (100 + (i * 53) % 220) + Math.floor(k / 2) * 50} width={20} height={20} fill="#ffd98a" opacity={0.8} />)}</g>)}</g>
        {/* colina do campo */}
        <path d="M -600,1500 C 0,1250 700,1300 1700,1450 L 1700,2300 L -600,2300 Z" fill={lerp(0, 1, luar) > 0.5 ? "#2f5a4a" : "#1f3a34"} />
        <rect x={-600} y={-600} width={2300} height={3000} fill="#fff6d8" opacity={0.08 * luar} />
        <Avatar id="lu2-avatar-c3" x={520} y={1640} escala={0.95} pose={{ ...parado(lf, 1), olhar: [0.3, -0.9], cabecaIncl: -8 }} f={lf} estilo={EST_CANAL_NOITE} expr={exprEm(lf, [[0, "pensativo"], [P("estrelas") - 10, "maravilhado"]])} />
        <Personagem id="lu2-amigo-c3" x={760} y={1660} escala={0.95} visual={AMIGO_CANAL} estilo={EST_CANAL_NOITE} pose={{ ...apontando(lf, 160, 5), olhar: [0.2, -0.9] }} expr={EXPRESSOES.maravilhado} olhosAbertos={piscar(lf, 5)} />
      </Camera>
      <Tela><SeloCanal f={lf} em={P("escuras") - 4} ate={P("escuras") + 70} t="NOITES MAIS ESCURAS" y={300} tam={64} fundo="#c9b8f2" /></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 04 OCEANO E A LUA (esquema simplificado)
const EsquemaMares: React.FC<{ f: number; lua: number; sol: number; bojo: number }> = ({ f, lua, sol, bojo }) => {
  const b = bojo * (0.85 + 0.15 * Math.sin(f * 0.06));
  return (
    <g>
      <ellipse cx={0} cy={0} rx={250 + 70 * b} ry={250} fill="#3a9ee0" opacity={0.85} stroke={TINTA} strokeWidth={6} />
      <circle r={230} fill="#79c27a" stroke={TINTA} strokeWidth={8} />
      <path d="M -120,-80 C -60,-140 40,-120 80,-60 C 120,0 60,60 0,40 C -60,20 -150,0 -120,-80 Z" fill="#5aa65c" />
      {lua > 0 && <g opacity={lua}><circle cx={430} cy={0} r={60} fill="#f4efe0" stroke={TINTA} strokeWidth={6} />{[0, 1, 2].map((k) => <g key={k} transform={`translate(${360 - ((f * 2 + k * 40) % 120)} ${(k - 1) * 40})`}><line x1={0} y1={0} x2={-40} y2={0} stroke="#cfe0ff" strokeWidth={7} strokeLinecap="round" /><path d="M -52,0 L -34,-12 L -34,12 Z" fill="#cfe0ff" /></g>)}</g>}
      {sol > 0 && <g opacity={sol}><circle cx={0} cy={-560} r={80} fill="#ffd24a" stroke={TINTA} strokeWidth={6} />{[0, 1].map((k) => <line key={k} x1={(k - 0.5) * 60} y1={-470} x2={(k - 0.5) * 60} y2={-300 - ((f * 2) % 40)} stroke="#ffd24a" strokeWidth={4} strokeDasharray="10 8" />)}</g>}
    </g>
  );
};
export const Cena04: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const praia = P("marés") - 4;
  if (lf < praia) {
    return (
      <AbsoluteFill style={{ backgroundColor: "#0b1640" }}>
        <Camera inicio={inicio} chaves={[[0, 600, 960, 1.0], [P("gravidade"), 640, 960, 1.1], [praia, 640, 960, 1.15]]} deriva={0}>
          <CeuNoite f={lf} lua={0} estrelas={0.5} id="lu4" />
          <g transform="translate(470 960) scale(0.85)"><EsquemaMares f={lf} lua={1} sol={0} bojo={eio(ramp(lf, P("puxa"), P("gravidade") + 10))} /></g>
          <text x={540} y={1600} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={30} fill="#cfe0ff">esquema simplificado • sem escala</text>
        </Camera>
      </AbsoluteFill>
    );
  }
  const mare = Math.sin(lf * 0.05);
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[praia, 540, 1250, 1.3], [dur, 560, 1280, 1.4]]} deriva={0}>
        <Praia f={lf} mare={mare} />
        <Avatar id="lu2-avatar-c4" x={520} y={1720} escala={1.0} pose={apontando(lf, 30, 1)} f={lf} expr={EXPRESSOES.empolgado} />
        <path d="M 640,1580 l 30,20 l -30,20" fill="none" stroke="#a37c3a" strokeWidth={6} />
      </Camera>
    </AbsoluteFill>
  );
};

// ================================================================== 05 O SOL AINDA ESTÁ AQUI
export const Cena05: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const luaSai = 1 - eio(ramp(lf, 6, 26));
  const sol = eio(ramp(lf, P("Mas") - 6, P("Sol") + 4));
  const praia = P("força") - 4;
  if (lf < praia) {
    return (
      <AbsoluteFill style={{ backgroundColor: "#0b1640" }}>
        <Camera inicio={inicio} chaves={[[0, 640, 960, 1.15], [P("Sol"), 520, 820, 1.0], [praia, 520, 820, 1.0]]} deriva={0}>
          <CeuNoite f={lf} lua={0} estrelas={0.5} id="lu5" />
          <g transform="translate(470 1060) scale(0.85)"><EsquemaMares f={lf} lua={luaSai} sol={sol} bojo={lerp(1, 0.45, 1 - luaSai)} /></g>
        </Camera>
        <Tela><SeloCanal f={lf} em={P("Sol") - 2} t="O SOL TAMBÉM INFLUENCIA" y={330} tam={60} fundo="#ffd24a" /></Tela>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[praia, 540, 1250, 1.3], [dur, 520, 1230, 1.35]]} deriva={0}>
        <Praia f={lf} mare={Math.sin(lf * 0.06) * 0.7} />
        <circle cx={950} cy={300} r={90} fill="#ffd24a" stroke={TINTA} strokeWidth={6} />
        <Avatar id="lu2-avatar-c5" x={480} y={1720} escala={1.0} pose={{ ...parado(lf, 1), olhar: [0.6, 0.6] }} f={lf} expr={EXPRESSOES.pensativo} />
      </Camera>
      <Tela><SeloCanal f={lf} em={0} t="O SOL TAMBÉM INFLUENCIA" y={330} tam={60} fundo="#ffd24a" /></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 06 VIDA NO LITORAL
const Caranguejo: React.FC<{ x: number; y: number; f: number }> = ({ x, y, f }) => (
  <g transform={`translate(${x} ${y})`}>
    {[-1, 1].map((s) => [0, 1, 2].map((k) => <line key={`${s}${k}`} x1={s * 30} y1={-10 + k * 10} x2={s * (60 + Math.sin(f * 0.5 + k) * 6)} y2={6 + k * 12} stroke="#c0392b" strokeWidth={6} strokeLinecap="round" />))}
    <ellipse rx={44} ry={28} fill="#e4572e" stroke={TINTA} strokeWidth={5} />
    {[-1, 1].map((s) => <g key={s}><circle cx={s * 50} cy={-36} r={14 + 2 * Math.sin(f * 0.3)} fill="#e4572e" stroke={TINTA} strokeWidth={4} /><line x1={s * 12} y1={-24} x2={s * 16} y2={-44} stroke={TINTA} strokeWidth={4} /><circle cx={s * 16} cy={-46} r={5} fill={TINTA} /></g>)}
  </g>
);
const Ave: React.FC<{ x: number; y: number; f: number; seed: number }> = ({ x, y, f, seed }) => (
  <g transform={`translate(${x} ${y})`}>
    <line x1={-8} y1={0} x2={-8 + Math.sin(f * 0.4 + seed) * 6} y2={40} stroke="#e8a33c" strokeWidth={4} />
    <line x1={8} y1={0} x2={8 - Math.sin(f * 0.4 + seed) * 6} y2={40} stroke="#e8a33c" strokeWidth={4} />
    <ellipse rx={36} ry={22} fill="#f4f4f4" stroke={TINTA} strokeWidth={4} />
    <circle cx={30} cy={-22 + Math.sin(f * 0.2 + seed) * 4} r={14} fill="#f4f4f4" stroke={TINTA} strokeWidth={4} />
    <path d={`M 42,${-22 + Math.sin(f * 0.2 + seed) * 4} l 18,4 l -18,4 Z`} fill="#e8a33c" />
  </g>
);
export const Cena06: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const cx = lerp(160, 420, eout(ramp(lf, 10, 90)));
  const poses: Pose[] = [{ ...parado(lf, 1), olhar: [0.6, 0.8] }, { ...pensando(lf, 1) }, { ...apontando(lf, 60, 1) }];
  const k = Math.min(2, Math.floor((lf / dur) * 3));
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 420, 1450, 1.6], [P("animais"), 500, 1400, 1.4], [dur, 560, 1350, 1.25]]} deriva={0}>
        <Praia f={lf} mare={Math.sin(lf * 0.04) * 0.8} marcas={clamp01(ramp(lf, P("ritmo") - 20, P("ritmo")))} />
        {[[100, 1600, 90], [300, 1640, 60], [-60, 1620, 70]].map(([x, y, r], i) => <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.6} fill="#8a8f99" stroke={TINTA} strokeWidth={5} />)}
        <Caranguejo x={cx} y={1660} f={lf} />
        {[0, 1, 2].map((i) => <Ave key={i} x={700 + i * 150 + Math.sin(lf * 0.02 + i) * 40} y={1460 + i * 20} f={lf} seed={i} />)}
        <Avatar id="lu2-avatar-c6" x={860} y={1900} escala={0.95} dir={-1} pose={poses[k]} f={lf} expr={EXPRESSOES.pensativo} />
      </Camera>
    </AbsoluteFill>
  );
};

// ================================================================== 07 A TERRA CONTINUA GIRANDO
export const Cena07: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  return (
    <AbsoluteFill style={{ backgroundColor: "#0b1640" }}>
      <Camera inicio={inicio} chaves={[[0, 540, 960, 1.0], [P("dias"), 560, 980, 1.08]]} deriva={0}>
        <CeuNoite f={lf} lua={0} estrelas={0.6} id="lu7" />
        <circle cx={1050} cy={960} r={150} fill="#ffd24a" stroke={TINTA} strokeWidth={8} />
        <circle cx={1050} cy={960} r={230} fill="#ffd24a" opacity={0.15} />
        <Globo cx={480} cy={960} r={320} lon0={-40 + lf * 0.9} lat0={10} id="lu7g" />
        {/* lado da noite (oposto ao Sol) */}
        <path d="M 480,640 A 320,320 0 0 0 480,1280 A 120,320 0 0 1 480,640 Z" fill="#020617" opacity={0.55} />
      </Camera>
      <Tela>
        <SeloCanal f={lf} em={P("dias")} t="DIA" x={800} y={500} tam={70} fundo="#ffd24a" />
        <SeloCanal f={lf} em={P("noites") - 2} t="NOITE" x={280} y={1640} tam={70} fundo="#3b4a8a" cor="#ffffff" />
      </Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 08 TEMPO LONGO
export const Cena08: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const incl = 23 + Math.sin(lf * 0.03) * 6 * eio(ramp(lf, P("estabilidade") - 10, P("estabilidade") + 30));
  const folhas = lf * 0.3;
  return (
    <AbsoluteFill style={{ backgroundColor: "#0b1640" }}>
      <Camera inicio={inicio} chaves={[[0, 540, 960, 1.0], [P("clima"), 560, 920, 1.08], [dur, 560, 920, 1.1]]} deriva={0}>
        <CeuNoite f={lf} lua={0} estrelas={0.5} id="lu8" />
        <g transform={`rotate(${incl} 480 960)`}>
          <line x1={480} y1={560} x2={480} y2={1360} stroke="#ffffff" strokeWidth={6} strokeDasharray="16 12" />
          <Globo cx={480} cy={960} r={280} lon0={lf * 0.8} lat0={0} id="lu8g" grade />
        </g>
        <text x={480} y={1600} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={30} fill="#cfe0ff">inclinação do eixo (ilustrativa)</text>
        {/* calendário folheando muitos anos (sem datas) */}
        <g transform="translate(880 600)">
          <rect x={-110} y={-110} width={220} height={220} rx={14} fill="#fff" stroke={TINTA} strokeWidth={7} />
          <rect x={-110} y={-110} width={220} height={50} fill="#e4572e" />
          {[0, 1, 2].map((i) => { const u = (folhas + i / 3) % 1; return <rect key={i} x={-100} y={-55} width={200} height={155} fill="#fdf6e6" stroke="#ccc" strokeWidth={2} transform={`rotate(${-u * 80} -100 -55)`} opacity={1 - u} />; })}
        </g>
      </Camera>
      <Tela><SeloCanal f={lf} em={P("longos") - 4} t="A LONGO PRAZO" y={300} tam={70} fundo="#c9b8f2" /></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 09 ENCERRAMENTO
export const Cena09: C = ({ inicio, fim }) => {
  const { lf, P, T } = useCena(inicio);
  const dur = fim - inicio;
  const oceano = P("Você") - 4;
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 560, 1100, 1.1], [oceano - 6, 640, 800, 1.2], [oceano + 10, 560, 1000, 1.05], [dur, 560, 1020, 1.0]]} deriva={0}>
        <CeuNoite f={lf} lua={0} estrelas={1} id="lu9" contorno={1} />
        {lf < oceano ? (
          <g>
            <path d="M -600,1500 C 0,1250 700,1300 1700,1450 L 1700,2300 L -600,2300 Z" fill="#1f3a34" />
            <Avatar id="lu2-avatar-c9" x={480} y={1640} escala={0.95} pose={{ ...parado(lf, 1), olhar: [0.5, -0.9], cabecaIncl: -8 }} f={lf} estilo={EST_CANAL_NOITE} expr={EXPRESSOES.maravilhado} />
            <Personagem id="lu2-amigo-c9" x={720} y={1660} escala={0.95} visual={AMIGO_CANAL} estilo={EST_CANAL_NOITE} pose={{ ...parado(lf, 5), olhar: [0.2, -0.9], cabecaIncl: -6 }} expr={EXPRESSOES.sereno} olhosAbertos={piscar(lf, 5)} />
          </g>
        ) : <Oceano f={lf} y={1150} brilho={0} />}
      </Camera>
      <Tela><SeloCanal f={lf} em={oceano + 4} t="O CÉU SERIA DIFERENTE" y={330} tam={66} fundo="#c9b8f2" /></Tela>
    </AbsoluteFill>
  );
};
