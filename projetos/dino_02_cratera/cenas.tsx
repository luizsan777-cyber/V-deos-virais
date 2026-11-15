// DINO 02 — Os primeiros minutos depois do impacto (cratera de Chicxulub). Ilustrações esquemáticas, fora de escala real.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Camera } from "../../engine/src/kit/Camera";
import { Personagem, Visual, ESTILOS_PERSONAGEM } from "../../engine/src/kit/Personagem";
import { parado, apontando } from "../../engine/src/kit/poses";
import { EXPRESSOES } from "../../engine/src/kit/expressoes";
import { piscar } from "../../engine/src/kit/anim";
import { useCena } from "../../engine/src/kit/tempo";
import { SeloCanal, TarjaCanal } from "../../engine/src/kit/canal";
import {
  TINTA, mix, Dino, CeuCretaceo, Nuvens, Selva, PrimeiroPlano, Asteroide, Clarao, Everest, CartaoTempo, Chamas, eio, eout, ramp, clamp01, lerp, rnd,
} from "../dino_kit/kit";

const W = 1080, H = 1920;
type C = React.FC<{ inicio: number; fim: number }>;
const Tela: React.FC<{ children: React.ReactNode; op?: number }> = ({ children, op = 1 }) => <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: op }}>{children}</svg>;
const CIENT_A: Visual = { pele: "#8d5a3b", cabelo: "coque", corCabelo: "#1d1210", roupa: "jaleco", cor: "#ff8a2a", cor2: "#ffd23f", calca: "#2b2d42", sapato: "#3a2a20", oculos: true, corpo: "medio" };
const CIENT_B: Visual = { pele: "#f0c8a0", cabelo: "curto", corCabelo: "#5a3a22", roupa: "jaleco", cor: "#2fb3c9", calca: "#34344a", sapato: "#222", corpo: "medio" };

/** Corte do terreno (esquemático): céu, mar raso, crosta em camadas e manto. Cratera controlada por parâmetros. */
const Corte: React.FC<{ f: number; abre: number; liquido?: number; pico?: number; anel?: number; brilho?: number; mostraEscala?: number }> = ({ f, abre, liquido = 0, pico = 0, anel = 0, brilho = 0, mostraEscala = 0 }) => {
  const S = 600, cx = 540; // superfície em y = S
  const larg = 470 * abre, prof = 520 * abre * (1 - pico * 0.85);
  const onda = (y: number, k: number) => Math.sin(f * 0.25 + k) * 10 * liquido;
  let fundo = `M ${cx - larg},${S}`;
  for (let i = 0; i <= 40; i++) {
    const t = i / 40, x = cx - larg + t * 2 * larg;
    const u = (t - 0.5) * 2;
    let y = S + prof * (1 - u * u);
    y -= pico * 900 * Math.exp(-(u * u) / 0.02) * (1 - anel);              // pico central subindo
    y -= anel * 260 * (Math.exp(-((u - 0.45) ** 2) / 0.008) + Math.exp(-((u + 0.45) ** 2) / 0.008)); // anel de picos
    y += onda(y, i * 0.6);
    fundo += ` L ${x},${y}`;
  }
  fundo += ` L ${cx + larg},${S}`;
  return (
    <g>
      <rect x={-1000} y={-1000} width={3000} height={1000 + S} fill="#3a9ee8" />
      <rect x={-1000} y={S - 60} width={3000} height={60} fill="#2a7ac8" />
      {/* crosta em camadas e manto */}
      {[["#b06a4a", 0], ["#8a4a6a", 180], ["#6a3a7a", 420], ["#4a2a6a", 760]].map(([c, dy], i) => <rect key={i} x={-1000} y={S + (dy as number)} width={3000} height={2000} fill={c as string} />)}
      {[S + 180, S + 420, S + 760].map((y, i) => <path key={i} d={`M -1000,${y} ${Array.from({ length: 30 }, (_, k) => `L ${-1000 + k * 110},${y + onda(y, k) * (Math.abs(-1000 + k * 110 - cx) < larg * 1.3 ? 1 : 0)}`).join(" ")}`} stroke={TINTA} strokeWidth={4} fill="none" opacity={0.35} />)}
      <text x={60} y={S - 18} fontFamily="Montserrat" fontWeight={900} fontSize={30} fill="#e8f6ff">mar raso</text>
      <text x={60} y={S + 90} fontFamily="Montserrat" fontWeight={900} fontSize={30} fill="#ffe2d6">crosta</text>
      <text x={60} y={S + 830} fontFamily="Montserrat" fontWeight={900} fontSize={30} fill="#e6d6ff">manto</text>
      {/* cratera (ar quente / rocha derretida) */}
      {abre > 0 && <path d={`${fundo} Z`} fill={mix("#ffb347", "#3a9ee8", 1 - brilho)} stroke={TINTA} strokeWidth={6} />}
      {abre > 0 && <path d={fundo} fill="none" stroke="#ff5a2a" strokeWidth={14} opacity={0.6 + 0.3 * Math.sin(f * 0.3)} />}
      {mostraEscala > 0 && <g opacity={mostraEscala}><line x1={cx - larg} y1={S - 90} x2={cx + larg} y2={S - 90} stroke="#ffffff" strokeWidth={6} /><path d={`M ${cx - larg},${S - 110} v 40 M ${cx + larg},${S - 110} v 40`} stroke="#ffffff" strokeWidth={6} /><text x={cx} y={S - 110} textAnchor="middle" fontFamily="Anton" fontSize={50} fill="#ffffff" stroke={TINTA} strokeWidth={6} paintOrder="stroke">≈ 100 km</text></g>}
    </g>
  );
};

// ================================================================== 01 o impacto
export const Cena01: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const bate = P("bater") - 2;
  const u = eio(ramp(lf, 0, bate));
  const flash = ramp(lf, bate, bate + 30);
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 560, 1000, 1.1], [bate, 520, 1150, 1.25], [dur, 540, 1100, 1.15]]} deriva={0} tremores={[bate + 2, bate + 10]} forcaTremor={26}>
        <CeuCretaceo topo="#2b8fe8" base="#ffe0a0" id="d2c1" f={lf} />
        <Nuvens f={lf} y={300} n={4} seed="d2a" />
        <rect x={-1000} y={1300} width={3000} height={900} fill="#3fb6e0" />
        {Array.from({ length: 8 }, (_, k) => <path key={k} d={`M -400,${1330 + k * 40} q 200,-14 400,0 t 400,0 t 400,0 t 400,0`} stroke="#bff0ff" strokeWidth={5} fill="none" opacity={0.5} transform={`translate(${(lf * 2 + k * 60) % 400 - 200} 0)`} />)}
        <path d="M -400,1320 C 0,1260 200,1290 360,1310 L 360,1340 L -400,1340 Z" fill="#79c27a" stroke={TINTA} strokeWidth={6} />
        {lf < bate + 4 && <Asteroide x={lerp(1150, 600, u)} y={lerp(-200, 1290, u)} r={70} f={lf} brasa={1} rastro={1} ang={-55} />}
        <Clarao x={600} y={1290} t={flash} r={1400} />
      </Camera>
      {flash > 0 && <AbsoluteFill style={{ backgroundColor: "#fffbe8", opacity: Math.max(0, 1 - flash * 1.6) }} />}
      <Tela><CartaoTempo f={lf} em={bate} ate={dur + 10} t="0 SEGUNDO" y={260} /></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 02 vaporização + energia
export const Cena02: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const domo = eout(ramp(lf, 0, P("existir") + 10));
  const energia = clamp01(ramp(lf, P("energia") - 6, P("energia") + 6));
  const zoom = eio(ramp(lf, P("bilhões") - 4, P("atômica") + 14));
  return (
    <AbsoluteFill style={{ backgroundColor: "#1a1446" }}>
      <Camera inicio={inicio} chaves={[[0, 540, 1100, 1.2], [P("energia") - 8, 540, 1000, 1.0], [dur, 540, 960, 1.0]]} deriva={0.4}>
        <CeuCretaceo topo="#ff7a2a" base="#ffe0a0" id="d2c2" f={lf} />
        <rect x={-1000} y={1300} width={3000} height={900} fill="#2a7ac8" />
        <g opacity={1 - energia}>
          <ellipse cx={540} cy={1300} rx={620 * domo} ry={520 * domo} fill="#fff6c8" />
          <ellipse cx={540} cy={1300} rx={460 * domo} ry={380 * domo} fill="#ffffff" />
          {Array.from({ length: 18 }, (_, i) => { const a = Math.PI + (i / 17) * Math.PI; const d = 300 + domo * 500; return <circle key={i} cx={540 + Math.cos(a) * d} cy={1300 + Math.sin(a) * d * 0.8} r={14} fill="#ffb347" opacity={1 - domo * 0.6} />; })}
        </g>
        {/* energia: 1 bomba atômica (ícone) × bilhões */}
        <g opacity={energia}>
          <rect x={-1000} y={-1000} width={3000} height={4000} fill="#1a1446" />
          <g transform={`translate(540 900) scale(${lerp(1, 0.06, zoom)})`}>
            {Array.from({ length: zoom > 0.05 ? 900 : 1 }, (_, i) => {
              const gx = (i % 30) - 15, gy = Math.floor(i / 30) - 15;
              return <g key={i} transform={`translate(${i ? gx * 120 : 0} ${i ? gy * 120 : 0})`}><circle r={36} fill="#ffb347" /><circle r={20} fill="#fff1b8" /></g>;
            })}
          </g>
          <text x={540} y={1120} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={34} fill="#ffe0a0" opacity={1 - zoom}>1 bomba atômica</text>
        </g>
      </Camera>
      <Tela><SeloCanal f={lf} em={P("bilhões") - 2} t="BILHÕES DE VEZES MAIS ENERGIA" y={300} tam={56} fundo="#ff9a3a" /></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 03 a cratera abre em segundos (corte)
export const Cena03: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const abre = eout(ramp(lf, 0, P("largura") + 4));
  const esc = clamp01(ramp(lf, P("cem") - 4, P("cem") + 8));
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 540, 900, 1.15], [P("cem"), 540, 820, 1.0], [P("profundidade"), 540, 1000, 1.05], [dur, 540, 1000, 1.08]]} deriva={0}>
        <Corte f={lf} abre={abre} brilho={1} mostraEscala={esc} />
        <text x={540} y={1240} textAnchor="middle" fontFamily="Anton" fontSize={46} fill="#ffffff" stroke={TINTA} strokeWidth={6} paintOrder="stroke" opacity={clamp01(ramp(lf, P("dezenas") - 4, P("dezenas") + 6))}>dezenas de km de profundidade</text>
      </Camera>
      <Tela><TarjaCanal t="CORTE ESQUEMÁTICO • FORA DE ESCALA" f={lf} /><CartaoTempo f={lf} em={4} ate={dur + 10} t="+ POUCOS SEGUNDOS" y={260} /></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 04 rochas como líquido; pico central
export const Cena04: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const liq = clamp01(ramp(lf, P("rochas") - 6, P("líquidas") + 6));
  const pico = eio(ramp(lf, P("centro") - 4, P("Everest") + 10));
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 540, 1000, 1.08], [P("centro"), 540, 700, 0.95], [dur, 540, 560, 0.9]]} deriva={0}>
        <Corte f={lf} abre={1} liquido={liq} pico={pico} brilho={1 - pico * 0.5} />
        <g opacity={clamp01(ramp(lf, P("Everest") - 8, P("Everest") + 4))}><Everest x={880} base={600} h={330} /></g>
      </Camera>
      <Tela><SeloCanal f={lf} em={P("líquidas") - 4} ate={P("centro") + 10} t="ROCHA QUE FLUI COMO LÍQUIDO" y={300} tam={54} /><SeloCanal f={lf} em={P("montanha") - 2} t="MAIS ALTA QUE O EVEREST" y={300} tam={58} fundo="#ff9a3a" /><TarjaCanal t="CORTE ESQUEMÁTICO • FORA DE ESCALA" f={lf} /></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 05 desaba e vira anel
export const Cena05: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const anel = eio(ramp(lf, P("Desabou") - 6, P("anel") + 10));
  const enterra = clamp01(ramp(lf, P("enterrado") - 10, P("enterrado") + 10));
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 540, 560, 0.9], [P("Desabou"), 540, 800, 1.0], [dur, 540, 880, 1.1]]} deriva={0} tremores={[P("Desabou")]} forcaTremor={14}>
        <Corte f={lf} abre={1} liquido={0.4 * (1 - anel)} pico={1 - anel * 0.0} anel={anel} brilho={0.5 - anel * 0.4} />
        {/* sedimentos cobrindo com o tempo (enterrado) */}
        <rect x={-1000} y={540} width={3000} height={90 * enterra} fill="#d9b98a" opacity={enterra} />
        {anel > 0.6 && <g opacity={clamp01((anel - 0.6) * 3)}>{[-1, 1].map((sg) => <path key={sg} d={`M ${540 + sg * 212},${640} l ${sg * 20},-120`} stroke="#ffd23f" strokeWidth={6} />)}<text x={540} y={430} textAnchor="middle" fontFamily="Anton" fontSize={48} fill="#ffd23f" stroke={TINTA} strokeWidth={6} paintOrder="stroke">ANEL DE MONTANHAS</text></g>}
      </Camera>
      <Tela><TarjaCanal t="CORTE ESQUEMÁTICO • FORA DE ESCALA" f={lf} /></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 06 a perfuração de 2016
export const Cena06: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const desce = eio(ramp(lf, P("perfuraram") - 6, P("encontraram") + 6));
  const amostra = clamp01(ramp(lf, P("rochas") - 4, P("rochas") + 8));
  const sobe = eio(ramp(lf, P("empurradas") - 4, P("minutos") + 10));
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 540, 900, 1.0], [P("perfuraram"), 540, 1100, 0.95], [P("rochas"), 640, 900, 1.25], [dur, 540, 960, 1.05]]} deriva={0}>
        <CeuCretaceo topo="#7fd0ff" base="#e8f6ff" id="d2c6" f={lf} />
        <Nuvens f={lf} y={150} n={3} seed="d2f" />
        <rect x={-1000} y={700} width={3000} height={200} fill="#3a9ee8" />
        {[["#d9b98a", 900], ["#c49a6a", 1100], ["#8a4a6a", 1300]].map(([c, y], i) => <rect key={i} x={-1000} y={y as number} width={3000} height={1200} fill={c as string} />)}
        <path d="M 200,1460 C 300,1330 380,1330 440,1460 Z M 640,1460 C 700,1330 780,1330 880,1460 Z" fill="#a85a7a" stroke={TINTA} strokeWidth={6} />
        <text x={540} y={1520} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={30} fill="#ffffff">anel enterrado</text>
        {/* plataforma de perfuração */}
        <g transform="translate(330 700)">
          <rect x={-120} y={-60} width={240} height={50} fill="#ff8a2a" stroke={TINTA} strokeWidth={6} />
          {[-100, 100].map((x) => <rect key={x} x={x - 8} y={-10} width={16} height={180} fill="#8a96a8" stroke={TINTA} strokeWidth={4} />)}
          <path d="M -20,-60 L 0,-260 L 20,-60 Z" fill="none" stroke="#5a6070" strokeWidth={8} />
          <line x1={0} y1={-20} x2={0} y2={lerp(0, 700, desce)} stroke="#2b2f3a" strokeWidth={10} />
        </g>
        {/* testemunho de rocha (amostra) com rocha profunda */}
        <g transform={`translate(760 ${lerp(880, 640, sobe)})`} opacity={amostra}>
          <rect x={-40} y={-160} width={80} height={320} rx={20} fill="#e8dcc8" stroke={TINTA} strokeWidth={6} />
          {Array.from({ length: 10 }, (_, k) => <circle key={k} cx={-20 + (k % 3) * 20} cy={-130 + k * 28} r={7} fill={["#ff9ab0", "#8a8a9a", "#2b2b3a"][k % 3]} />)}
          <text x={0} y={200} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={28} fill={TINTA}>rocha de grande profundidade</text>
        </g>
        <Personagem id="d2-cient-a" x={150} y={980} escala={0.42} visual={CIENT_A} estilo={ESTILOS_PERSONAGEM.conto} pose={apontando(lf, 120, 3)} expr={EXPRESSOES.empolgado} olhosAbertos={piscar(lf, 3)} />
        <Personagem id="d2-cient-b" x={520} y={980} escala={0.42} dir={-1} visual={CIENT_B} estilo={ESTILOS_PERSONAGEM.conto} pose={parado(lf, 4)} expr={EXPRESSOES.maravilhado} olhosAbertos={piscar(lf, 4)} />
      </Camera>
      <Tela><CartaoTempo f={lf} em={P("2016") - 4} ate={dur + 10} t="PERFURAÇÃO • 2016" y={260} cor="#7fd6ff" /></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 07 a cratera de Chicxulub hoje (mapa esquemático)
export const Cena07: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const aneis = eout(ramp(lf, P("cratera") - 6, P("largura") + 6));
  return (
    <AbsoluteFill style={{ backgroundColor: "#2a7ac8" }}>
      <Camera inicio={inicio} chaves={[[0, 540, 900, 0.9], [P("Chicxulub"), 540, 960, 1.1], [dur, 540, 980, 1.15]]} deriva={0}>
        <rect x={-1000} y={-1000} width={3000} height={4000} fill="#2f86c9" />
        {/* península (terra) ao sul, mar ao norte — linha de costa cortando a cratera */}
        <path d="M -500,1000 C -100,940 200,1010 420,960 C 640,910 860,990 1600,940 L 1600,2400 L -500,2400 Z" fill="#79c27a" stroke={TINTA} strokeWidth={7} />
        {[1, 0.7, 0.45].map((k, i) => <circle key={i} cx={540} cy={980} r={420 * k * aneis} fill="none" stroke={i ? "#ffd23f" : "#ff8a2a"} strokeWidth={10 - i * 2} strokeDasharray={i ? "18 12" : undefined} opacity={0.9} />)}
        <line x1={120} y1={1440} x2={960} y2={1440} stroke="#ffffff" strokeWidth={6} opacity={aneis} />
        <text x={540} y={1500} textAnchor="middle" fontFamily="Anton" fontSize={48} fill="#ffffff" opacity={aneis}>≈ 180 km</text>
        <text x={540} y={700} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={32} fill="#d6f0ff">golfo do México</text>
        <text x={540} y={1300} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={32} fill="#1f4a2a">península de Iucatã</text>
      </Camera>
      <Tela><SeloCanal f={lf} em={P("Chicxulub") - 4} t="CRATERA DE CHICXULUB" y={300} tam={64} /><text x={540} y={1600} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={26} fill="#d6f0ff">mapa esquemático: a cratera está enterrada, não se vê na superfície</text></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 08 poucos minutos — e o resto do planeta
export const Cena08: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const brilho = clamp01(ramp(lf, P("resto") - 6, dur));
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 540, 1250, 1.2], [P("resto"), 560, 1150, 1.1], [dur, 620, 900, 1.0]]} deriva={0}>
        <Selva f={lf} cx={200} id="d2sel" luz={0} />
        <ellipse cx={1100} cy={1150} rx={500} ry={200} fill="#ffb347" opacity={0.35 * brilho} />
        <Dino tipo="hadro" x={380} y={1690} s={0.85} f={lf} cabeca={10} seed={11} />
        <Dino tipo="titano" x={820} y={1660} s={0.55} f={lf} cabeca={-6 + brilho * -10} seed={12} dir={-1} />
        <PrimeiroPlano f={lf} />
      </Camera>
      <Tela><CartaoTempo f={lf} em={4} ate={P("E") - 4} t="+ ALGUNS MINUTOS" y={260} /><SeloCanal f={lf} em={P("vir") - 2} t="O QUE VEM AGORA?" y={300} tam={60} fundo="#ff9a3a" /></Tela>
    </AbsoluteFill>
  );
};
