// DINO 03 — A onda que deu a volta ao mundo (tsunami de Chicxulub; números de Range et al. 2022). Ilustração, não registro.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Camera } from "../../engine/src/kit/Camera";
import { Globo } from "../../engine/src/kit/Globo";
import { useCena } from "../../engine/src/kit/tempo";
import { SeloCanal, TarjaCanal } from "../../engine/src/kit/canal";
import {
  TINTA, mix, Dino, Ave, CeuCretaceo, Nuvens, Selva, PrimeiroPlano, Palmeira, Vulcao, Chamas, CartaoTempo, Regua, eio, eout, ramp, clamp01, lerp, rnd,
} from "../dino_kit/kit";

const W = 1080, H = 1920;
type C = React.FC<{ inicio: number; fim: number }>;
const Tela: React.FC<{ children: React.ReactNode; op?: number }> = ({ children, op = 1 }) => <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: op }}>{children}</svg>;

/** Onda gigante vista de lado; crista em xC, altura h (px), avançando. */
const Onda: React.FC<{ xC: number; base: number; h: number; f: number; cor?: string }> = ({ xC, base, h, f, cor = "#2f86c9" }) => {
  const d = `M -1500,${base} L ${xC - 900},${base} C ${xC - 500},${base} ${xC - 250},${base - h} ${xC},${base - h} C ${xC + 160},${base - h} ${xC + 220},${base - h * 0.75} ${xC + 160},${base - h * 0.55} C ${xC + 120},${base - h * 0.4} ${xC + 60},${base - h * 0.45} ${xC + 80},${base - h * 0.6} L ${xC + 300},${base} L 3000,${base} L 3000,${base + 2000} L -1500,${base + 2000} Z`;
  return (
    <g>
      <path d={d} fill={cor} stroke={TINTA} strokeWidth={8} strokeLinejoin="round" />
      <path d={`M ${xC - 500},${base - h * 0.2} C ${xC - 300},${base - h * 0.5} ${xC - 120},${base - h * 0.9} ${xC},${base - h}`} fill="none" stroke="#bff0ff" strokeWidth={10} opacity={0.6} />
      {Array.from({ length: 10 }, (_, i) => <circle key={i} cx={xC + 100 + Math.sin(f * 0.3 + i) * 60} cy={base - h * (0.6 + 0.04 * i) + Math.cos(f * 0.2 + i) * 20} r={14 + (i % 3) * 6} fill="#ffffff" opacity={0.85} />)}
    </g>
  );
};

// ================================================================== 01 a água empurrada
export const Cena01: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const u = eout(ramp(lf, 0, dur));
  return (
    <AbsoluteFill style={{ backgroundColor: "#2f86c9" }}>
      <Camera inicio={inicio} chaves={[[0, 540, 960, 1.6], [P("empurrada"), 540, 960, 1.05], [dur, 540, 960, 0.9]]} deriva={0}>
        <rect x={-1500} y={-1500} width={4000} height={5000} fill="#2f86c9" />
        {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={-200 + rnd(`d3b${i}`) * 1500} cy={-200 + rnd(`d3by${i}`) * 2300} r={20 + rnd(`d3br${i}`) * 30} fill="#3f9ee0" opacity={0.6} />)}
        {/* anéis de água sendo empurrados para longe */}
        {[0, 1, 2].map((k) => { const r = 80 + u * 900 - k * 180; return r > 0 && <circle key={k} cx={540} cy={960} r={r} fill="none" stroke="#e8f8ff" strokeWidth={30 - k * 8} opacity={0.85 - k * 0.2} />; })}
        <circle cx={540} cy={960} r={60 + u * 220} fill="#6a3a2a" stroke={TINTA} strokeWidth={6} />
        <circle cx={540} cy={960} r={40 + u * 120} fill="#ff8a2a" opacity={0.6} />
      </Camera>
      <Tela><TarjaCanal t="VISTA DE CIMA • ILUSTRAÇÃO" f={lf} /></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 02 +10 minutos: onda de 1,5 km
export const Cena02: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const lado = P("uma", 2) - 6;
  if (lf < lado) {
    const u = eout(ramp(lf, 0, lado));
    return (
      <AbsoluteFill style={{ backgroundColor: "#2f86c9" }}>
        <Camera inicio={inicio} chaves={[[0, 540, 960, 0.9], [lado, 540, 960, 0.8]]} deriva={0}>
          <rect x={-1500} y={-1500} width={4000} height={5000} fill="#2f86c9" />
          <circle cx={540} cy={960} r={300 + u * 400} fill="none" stroke="#ffffff" strokeWidth={36} />
          <circle cx={540} cy={960} r={300 + u * 400} fill="none" stroke="#bff0ff" strokeWidth={70} opacity={0.3} />
          <circle cx={540} cy={960} r={200} fill="#6a3a2a" stroke={TINTA} strokeWidth={6} />
          <text x={540} y={1800} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={32} fill="#ffffff">frente da onda avançando em todas as direções</text>
        </Camera>
        <Tela><SeloCanal f={lf} em={P("simulação") - 2} ate={lado} t="SIMULAÇÃO PUBLICADA EM 2022" y={300} tam={54} fundo="#7fd6ff" /></Tela>
      </AbsoluteFill>
    );
  }
  const xC = lerp(1500, 620, eout(ramp(lf, lado, dur)));
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[lado, 600, 1000, 1.0], [dur, 560, 1050, 1.08]]} deriva={0}>
        <CeuCretaceo topo="#5a4ad8" base="#ffb070" id="d3c2" f={lf} />
        <Nuvens f={lf} y={260} n={4} cor="#ffd9c0" seed="d3n" />
        <Onda xC={xC} base={1500} h={900} f={lf} />
      </Camera>
      <Tela><CartaoTempo f={lf} em={lado - 40} ate={dur + 10} t="+10 MINUTOS" y={260} /><SeloCanal f={lf} em={P("um") - 2} t="≈ 1,5 km DE ALTURA" y={420} tam={60} fundo="#ffffff" /></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 03 comparação: prédio mais alto do mundo
export const Cena03: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const pxkm = 700, base = 1600;
  const predio = eout(ramp(lf, P("prédio") - 8, P("prédio") + 8));
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 540, 900, 1.0], [dur, 540, 950, 1.04]]} deriva={0}>
        <CeuCretaceo topo="#7fd0ff" base="#e8f6ff" id="d3c3" f={lf} />
        <rect x={-1000} y={base} width={3000} height={600} fill="#2f86c9" />
        <Onda xC={760} base={base} h={1.5 * pxkm} f={lf} />
        <Regua x={100} base={base} px_km={pxkm} ate={1.6} passo={0.5} />
        {/* torre esbelta genérica (828 m), sem marca */}
        <g transform={`translate(330 ${base}) scale(1 ${predio})`} opacity={predio}>
          <path d={`M -50,0 L -40,${-0.5 * pxkm} L -24,${-0.7 * pxkm} L -10,${-0.8 * pxkm} L 0,${-0.828 * pxkm} L 10,${-0.8 * pxkm} L 24,${-0.7 * pxkm} L 40,${-0.5 * pxkm} L 50,0 Z`} fill="#c9d2dc" stroke={TINTA} strokeWidth={6} />
        </g>
        <text x={330} y={base - 0.828 * pxkm - 30} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={30} fill={TINTA} opacity={predio}>prédio mais alto (828 m)</text>
      </Camera>
      <Tela><SeloCanal f={lf} em={P("dobro") - 4} t="QUASE O DOBRO" y={300} tam={64} /></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 04 dentro do golfo: > 100 m
export const Cena04: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const xC = lerp(1400, 500, eio(ramp(lf, 0, dur)));
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 540, 1100, 1.0], [dur, 520, 1150, 1.1]]} deriva={0}>
        <CeuCretaceo topo="#ff9a5a" base="#ffe0a0" id="d3c4" f={lf} />
        <Nuvens f={lf} y={250} n={3} seed="d3g" />
        {/* ilha com palmeiras para dar escala (ilustrativa) */}
        <path d="M 120,1500 C 220,1420 380,1420 480,1500 Z" fill="#e8c78f" stroke={TINTA} strokeWidth={6} />
        <Palmeira x={260} y={1470} s={0.45} f={lf} seed={1} />
        <Palmeira x={350} y={1470} s={0.35} f={lf} seed={2} />
        <Onda xC={xC} base={1500} h={380} f={lf} cor="#2a7ac8" />
        <Ave x={700 - lf * 3} y={500} s={0.4} f={lf} voa dir={-1} seed={2} />
      </Camera>
      <Tela><SeloCanal f={lf} em={P("cem") - 4} t="MAIS DE 100 m EM MAR ABERTO" y={300} tam={56} fundo="#ffffff" /></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 05 +48 horas: litorais do mundo
export const Cena05: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const origem: [number, number] = [-89.5, 21.4];
  const at: [number, number] = [-35, 45], pac: [number, number] = [-80, -15];
  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0826" }}>
      <Camera inicio={inicio} chaves={[[0, 540, 960, 0.95], [P("Atlântico"), 540, 900, 1.05], [P("pacífica"), 540, 1020, 1.05], [dur, 540, 980, 1.0]]} deriva={0}>
        <CeuCretaceo topo="#0b0826" base="#1a1446" id="d3c5" estrelas={1} f={lf} />
        <Globo cx={540} cy={960} r={430} lon0={-60 + Math.sin(lf * 0.01) * 6} lat0={10} id="d3g5"
          alertas={[{ ll: origem, cor: "#ff4d4d", inicio: inicio }, { ll: at, cor: "#7fd6ff", inicio: inicio + P("Atlântico") - 4 }, { ll: pac, cor: "#7fd6ff", inicio: inicio + P("pacífica") - 4 }]}
          rotas={[{ de: origem, para: at, cor: "#7fd6ff", inicio: inicio + P("maremoto") - 4, dur: 40, tracejada: true }, { de: origem, para: pac, cor: "#7fd6ff", inicio: inicio + P("maremoto"), dur: 40, tracejada: true }]} />
      </Camera>
      <Tela>
        <text x={540} y={1640} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={30} fill="#d6f0ff">continentes de hoje, para referência</text>
        <CartaoTempo f={lf} em={P("dois") - 4} ate={dur + 10} t="+48 HORAS" y={260} />
        <SeloCanal f={lf} em={P("dez") - 4} t="ONDAS DE MAIS DE 10 m" y={420} tam={56} fundo="#7fd6ff" />
      </Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 06 o chão tremia
export const Cena06: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const treme = clamp01(ramp(lf, P("chão") - 6, P("chão") + 4)) * (1 - ramp(lf, dur - 30, dur) * 0.5);
  const tr = Array.from({ length: 10 }, (_, k) => P("chão") + k * 22);
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 540, 1520, 1.1], [dur, 560, 1500, 1.14]]} deriva={0} tremores={tr} forcaTremor={18}>
        <Selva f={lf} cx={200} id="d3s6" />
        {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M -200,${1640 + i * 40} ${Array.from({ length: 20 }, (_, k) => `L ${-200 + k * 90},${1640 + i * 40 + Math.sin(lf * 0.8 + k + i) * 10 * treme}`).join(" ")}`} stroke="#3a2a1a" strokeWidth={4} fill="none" opacity={0.3 * treme} />)}
        <Dino tipo="tri" x={350} y={1700} s={0.85} f={lf} medo={treme} cabeca={-6} seed={14} />
        <Dino tipo="raptor" x={780} y={1690} s={0.8} f={lf} medo={treme} anda={treme} dir={-1} seed={15} />
        {Array.from({ length: 5 }, (_, i) => { const u = ((lf * 0.02 + i / 5) % 1); return <circle key={i} cx={200 + i * 180} cy={1000 + u * 600} r={16} fill="#8a6a4a" stroke={TINTA} strokeWidth={4} opacity={treme * (1 - u)} />; })}
        <PrimeiroPlano f={lf * (1 + treme * 3)} />
      </Camera>
      <Tela><SeloCanal f={lf} em={P("magnitude") - 4} t="COMO UM TERREMOTO DE MAGNITUDE 9+" y={300} tam={50} fundo="#ff9a3a" /></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 07 Índia: hipótese em debate
export const Cena07: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 540, 1050, 1.0], [P("Índia"), 560, 1000, 1.15], [dur, 560, 1000, 1.18]]} deriva={0}>
        <CeuCretaceo topo="#3a1a4a" base="#ff7a3a" id="d3c7" f={lf} />
        <Nuvens f={lf} y={300} n={4} cor="#8a5a6a" seed="d3i" />
        <Vulcao x={300} y={1450} s={1.1} f={lf} cor="#4a2a3a" />
        <Vulcao x={820} y={1500} s={0.8} f={lf + 30} cor="#5a3040" />
        <rect x={-1000} y={1440} width={3000} height={600} fill="#3a1a2a" />
        {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M ${-100 + i * 220},1460 C ${-50 + i * 220},1520 ${10 + i * 220},1560 ${80 + i * 220},1640`} stroke="#ff7a2a" strokeWidth={16 + Math.sin(lf * 0.2 + i) * 4} fill="none" strokeLinecap="round" opacity={0.9} />)}
        {[200, 520, 860].map((x, i) => <Chamas key={i} x={x} y={1460} s={0.6} f={lf} seed={i} />)}
      </Camera>
      <Tela><CartaoTempo f={lf} em={P("Índia") - 6} ate={dur + 10} t="ÍNDIA (DECCAN)" y={260} /><SeloCanal f={lf} em={P("hipótese") - 4} t="HIPÓTESE EM DEBATE" y={420} tam={60} fundo="#c9b8ff" /></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 08 as marcas no fundo do oceano
export const Cena08: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const nucleo = eout(ramp(lf, P("camadas") - 6, P("camadas") + 10));
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 540, 700, 1.0], [P("fundo"), 540, 1100, 1.05], [P("camadas"), 620, 1250, 1.3], [dur, 600, 1200, 1.25]]} deriva={0}>
        <rect x={-1000} y={-1000} width={3000} height={1800} fill="#1f5a9a" />
        {Array.from({ length: 30 }, (_, i) => <circle key={i} cx={rnd(`d3m${i}`) * 1200 - 60} cy={rnd(`d3my${i}`) * 700 + 50 - ((lf * 0.6) % 700)} r={3} fill="#cfe9ff" opacity={0.4} />)}
        {/* camadas de sedimento; a do impacto está revirada */}
        {[["#c49a6a", 800], ["#a87a52", 900], ["#7a5a8a", 1000], ["#d9b98a", 1110], ["#8a6a4a", 1210]].map(([c, y], i) => (
          <path key={i} d={`M -1000,${y} ${Array.from({ length: 30 }, (_, k) => `L ${-1000 + k * 110},${(y as number) + (i === 2 ? Math.sin(k * 1.3) * 34 : 0)}`).join(" ")} L 2000,2400 L -1000,2400 Z`} fill={c as string} stroke={TINTA} strokeWidth={3} />
        ))}
        <text x={980} y={1050} textAnchor="end" fontFamily="Montserrat" fontWeight={900} fontSize={30} fill="#ffffff">camada revirada pela onda</text>
        {/* testemunho de sedimento */}
        <g transform={`translate(300 ${lerp(1500, 1180, nucleo)})`} opacity={nucleo}>
          <rect x={-45} y={-260} width={90} height={520} rx={24} fill="#e8dcc8" stroke={TINTA} strokeWidth={6} />
          {[["#c49a6a", -240], ["#a87a52", -150], ["#7a5a8a", -60], ["#d9b98a", 50], ["#8a6a4a", 150]].map(([c, y], i) => <path key={i} d={`M -40,${y} ${i === 2 ? "q 20,-20 40,0 t 40,0" : "h 80"} v 80 h -80 Z`} fill={c as string} opacity={0.9} />)}
        </g>
      </Camera>
      <Tela><SeloCanal f={lf} em={P("rastro") - 4} t="O RASTRO DA ONDA" y={300} tam={64} /></Tela>
    </AbsoluteFill>
  );
};
