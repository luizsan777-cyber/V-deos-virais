// DINO 04 — O dia em que o céu virou um forno (pulso de calor e incêndios: tema em debate científico). Ilustração, não registro.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Camera } from "../../engine/src/kit/Camera";
import { Globo } from "../../engine/src/kit/Globo";
import { useCena } from "../../engine/src/kit/tempo";
import { SeloCanal, TarjaCanal } from "../../engine/src/kit/canal";
import {
  TINTA, mix, Dino, Mamifero, CeuCretaceo, Selva, PrimeiroPlano, Palmeira, Chamas, Meteoros, Cinzas, TerraCretacea, CartaoTempo, eio, eout, ramp, clamp01, lerp, rnd,
} from "../dino_kit/kit";

const W = 1080, H = 1920;
type C = React.FC<{ inicio: number; fim: number }>;
const Tela: React.FC<{ children: React.ReactNode; op?: number }> = ({ children, op = 1 }) => <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: op }}>{children}</svg>;
const Tartaruga: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => (
  <g transform={`translate(${x} ${y + Math.sin(f * 0.05) * 6}) scale(${s})`}>
    {[-40, 40].map((px, i) => <ellipse key={i} cx={px} cy={20} rx={22} ry={10} fill="#5a9a5a" stroke={TINTA} strokeWidth={4} transform={`rotate(${Math.sin(f * 0.15 + i) * 20} ${px} 20)`} />)}
    <ellipse rx={60} ry={34} fill="#3a7a4a" stroke={TINTA} strokeWidth={5} />
    <path d="M -40,-10 L 0,-26 L 40,-10" stroke="#2a5a3a" strokeWidth={4} fill="none" />
    <circle cx={70} cy={0} r={16} fill="#5a9a5a" stroke={TINTA} strokeWidth={4} /><circle cx={76} cy={-4} r={3} fill={TINTA} />
  </g>
);

// ================================================================== 01 o perigo veio do céu
export const Cena01: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const fogo = eio(ramp(lf, 0, dur)) * 0.6;
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 540, 1450, 1.15], [P("céu"), 560, 1100, 1.0], [dur, 560, 900, 1.05]]} deriva={0}>
        <Selva f={lf} cx={200} fogo={fogo} id="d4s1" />
        <Meteoros f={lf} n={10} op={clamp01(ramp(lf, P("caiu") - 6, P("caiu") + 6))} seed="d4a" />
        <Dino tipo="rex" x={380} y={1690} s={0.95} f={lf} cabeca={-24} olhar={1} medo={fogo} seed={21} />
        <Dino tipo="hadro" x={800} y={1700} s={0.75} f={lf} cabeca={-16} medo={fogo} dir={-1} seed={22} />
        <PrimeiroPlano f={lf} cor={mix("#1a7a3a", "#5a2a1a", fogo)} />
      </Camera>
    </AbsoluteFill>
  );
};

// ================================================================== 02 material lançado para fora da atmosfera, e voltando
export const Cena02: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const sobe = eout(ramp(lf, 0, P("atmosfera") + 6));
  const volta = clamp01(ramp(lf, P("voltou") - 10, dur));
  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0826" }}>
      <Camera inicio={inicio} chaves={[[0, 540, 1050, 1.1], [P("atmosfera"), 540, 900, 0.85], [dur, 540, 960, 0.95]]} deriva={0}>
        <CeuCretaceo topo="#0b0826" base="#1a1446" id="d4c2" estrelas={1} f={lf} />
        <TerraCretacea x={540} y={1250} r={430} f={lf} />
        <circle cx={540} cy={1250} r={470} fill="none" stroke="#7fd0ff" strokeWidth={10} opacity={0.5} />
        <text x={540} y={760} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={26} fill="#7fd0ff" opacity={0.8}>limite da atmosfera</text>
        {Array.from({ length: 40 }, (_, i) => {
          const a = -Math.PI / 2 + (rnd(`d4e${i}`) - 0.5) * 2.4, v = 0.5 + rnd(`d4v${i}`) * 0.7;
          const t = sobe * v - volta * v * 0.9;
          const d = 470 + Math.sin(clamp01(t) * Math.PI * 0.95) * 520 * v;
          const aa = a + (volta * (rnd(`d4w${i}`) - 0.5) * 1.6);
          return <circle key={i} cx={540 + Math.cos(aa) * d - 120} cy={1250 + Math.sin(aa) * d} r={6 + rnd(`d4r${i}`) * 8} fill={volta > 0.2 ? "#ffb347" : "#c9a0ff"} opacity={0.9} />;
        })}
        <circle cx={420} cy={790} r={30} fill="#ff6a2a" />
      </Camera>
      <Tela><TarjaCanal t="ILUSTRAÇÃO • FORA DE ESCALA" f={lf} /></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 03 bilhões de estrelas cadentes
export const Cena03: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const n = Math.round(lerp(8, 70, eio(ramp(lf, P("Agora") - 10, P("céu") + 6))));
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 540, 1000, 1.25], [P("Agora"), 540, 900, 1.0], [dur, 540, 880, 0.95]]} deriva={0}>
        <Selva f={lf} cx={100} noite={0.8} fogo={0.3} id="d4s3" vulcao={false} />
        <Meteoros f={lf} n={n} op={1} seed="d4b" area={[-400, -500, 1900, 1800]} />
      </Camera>
      <Tela><SeloCanal f={lf} em={P("estrela") - 4} ate={P("Agora")} t="ESTRELAS CADENTES" y={300} tam={64} fundo="#ffd23f" /></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 04 a porta do forno
export const Cena04: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const calor = eio(ramp(lf, 0, P("superfície")));
  const forno = clamp01(ramp(lf, P("forno") - 6, P("forno") + 6));
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 540, 1100, 1.0], [P("onda"), 560, 1300, 1.15], [dur, 560, 1300, 1.2]]} deriva={0}>
        <Selva f={lf} cx={250} fogo={0.4 + calor * 0.6} id="d4s4" />
        {/* ondas de calor descendo */}
        {Array.from({ length: 7 }, (_, i) => { const u = ((lf * 0.012 + i / 7) % 1); return <path key={i} d={`M -200,${200 + u * 1300} ${Array.from({ length: 16 }, (_, k) => `q 50,${-14} 100,0`).join(" ")}`} stroke="#ffd36b" strokeWidth={6} fill="none" opacity={calor * 0.5 * (1 - u)} />; })}
        <Dino tipo="tri" x={420} y={1700} s={0.85} f={lf} medo={calor} boca={0.4 * calor * Math.abs(Math.sin(lf * 0.3))} seed={23} />
        <PrimeiroPlano f={lf} cor="#6a3a1a" />
      </Camera>
      {forno > 0 && (
        <Tela op={forno}>
          <g transform="translate(820 600)">
            <rect x={-150} y={-130} width={300} height={260} rx={22} fill="#3a3a44" stroke={TINTA} strokeWidth={8} />
            <rect x={-120} y={-100} width={240} height={180} rx={10} fill="#ff7a2a" />
            <rect x={-120} y={-100} width={240} height={180} rx={10} fill="#ffd36b" opacity={0.4 + 0.3 * Math.sin(lf * 0.3)} />
            <rect x={-150} y={-170} width={300} height={36} rx={10} fill="#5a5a66" stroke={TINTA} strokeWidth={6} />
          </g>
        </Tela>
      )}
      <Tela><SeloCanal f={lf} em={P("forno") - 2} t="COMO UM FORNO ABERTO" y={300} tam={62} fundo="#ff9a3a" /></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 05 os cientistas discordam
export const Cena05: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const a = eout(ramp(lf, P("Alguns") - 6, P("Alguns") + 8)), b = eout(ramp(lf, P("Outros") - 6, P("Outros") + 8));
  const painel = (x: number, y: number, e: number, fogo: boolean, rot: string, cor: string) => (
    <g transform={`translate(${x} ${y + (1 - e) * 1200})`}>
      <clipPath id={`d4p${fogo ? 1 : 0}`}><rect x={-440} y={-280} width={880} height={560} rx={28} /></clipPath>
      <g clipPath={`url(#d4p${fogo ? 1 : 0})`}>
        <rect x={-440} y={-280} width={880} height={560} fill={fogo ? "#5a1a1a" : "#ffb070"} />
        <rect x={-440} y={140} width={880} height={140} fill={fogo ? "#2a1a12" : "#6a8a3a"} />
        {[-300, -120, 60, 240].map((px, i) => (
          <g key={i}>
            <Palmeira x={px} y={150} s={0.55} f={lf} seed={i} cor={fogo ? "#3a2a1a" : "#3f8a3a"} />
            {fogo && <Chamas x={px + 10} y={150} s={0.8} f={lf} seed={i} />}
          </g>
        ))}
      </g>
      <rect x={-440} y={-280} width={880} height={560} rx={28} fill="none" stroke={cor} strokeWidth={8} />
      <rect x={-300} y={-330} width={600} height={70} rx={20} fill={TINTA} stroke={cor} strokeWidth={5} />
      <text y={-282} textAnchor="middle" fontFamily="Anton" fontSize={40} fill={cor}>{rot}</text>
    </g>
  );
  return (
    <AbsoluteFill style={{ backgroundColor: "#1a1446" }}>
      <Tela>
        <rect width={W} height={H} fill="#1a1446" />
        <text x={540} y={250} textAnchor="middle" fontFamily="Anton" fontSize={130} fill="#ffd23f" opacity={clamp01(ramp(lf, 4, 14)) * (1 - a * 0.6)}>?</text>
        {painel(540, 640, a, true, "HIPÓTESE 1: INCÊNDIOS ENORMES", "#ff7a2a")}
        {painel(540, 1270 - 40, b, false, "HIPÓTESE 2: PULSO CURTO", "#7fd6ff")}
      </Tela>
      <Tela><SeloCanal f={lf} em={P("discordam") - 4} ate={P("Alguns") - 4} t="OS CIENTISTAS DISCORDAM" y={420} tam={60} fundo="#c9b8ff" /></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 06 a fuligem na rocha; sinais na América do Norte
export const Cena06: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const mapa = P("e") - 4;
  if (lf < mapa) {
    const lupa = eout(ramp(lf, P("fuligem") - 6, P("fuligem") + 8));
    return (
      <AbsoluteFill>
        <Camera inicio={inicio} chaves={[[0, 540, 960, 1.0], [P("fuligem"), 560, 1000, 1.25], [mapa, 560, 1000, 1.3]]} deriva={0}>
          <CeuCretaceo topo="#7fd0ff" base="#e8f6ff" id="d4c6" f={lf} />
          {[["#d9b98a", 600], ["#c49a6a", 760], ["#2a2224", 940], ["#b07a52", 975], ["#8a5a3a", 1150], ["#6a4a3a", 1350]].map(([c, y], i) => <rect key={i} x={-1000} y={y as number} width={3000} height={1400} fill={c as string} />)}
          <text x={980} y={1060} textAnchor="end" fontFamily="Montserrat" fontWeight={900} fontSize={32} fill="#ffffff" stroke={TINTA} strokeWidth={5} paintOrder="stroke">camada do impacto</text>
          <g transform="translate(540 958)" opacity={lupa}><circle r={150} fill="none" stroke={TINTA} strokeWidth={14} /><line x1={110} y1={110} x2={220} y2={220} stroke={TINTA} strokeWidth={24} strokeLinecap="round" />{Array.from({ length: 12 }, (_, k) => <circle key={k} cx={-90 + (k % 6) * 36} cy={-6 + Math.floor(k / 6) * 18} r={7} fill="#111" />)}<text y={-170} textAnchor="middle" fontFamily="Anton" fontSize={48} fill={TINTA}>FULIGEM</text></g>
        </Camera>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0826" }}>
      <Camera inicio={inicio} chaves={[[mapa, 540, 960, 0.95], [dur, 540, 960, 1.05]]} deriva={0}>
        <CeuCretaceo topo="#0b0826" base="#1a1446" id="d4c6b" estrelas={1} f={lf} />
        <Globo cx={540} cy={960} r={430} lon0={-100} lat0={35} id="d4g" destaques={{ americaNorte: "#ff7a2a" }} />
      </Camera>
      <Tela><SeloCanal f={lf} em={mapa + 6} t="SINAIS MAIS FORTES: AMÉRICA DO NORTE" y={300} tam={46} fundo="#ff9a3a" /><text x={540} y={1560} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={28} fill="#d6f0ff">continentes de hoje, para referência</text></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 07 debaixo da terra, dentro da água, numa toca
export const Cena07: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const terra = clamp01(ramp(lf, P("debaixo") - 6, P("debaixo") + 6));
  const agua = clamp01(ramp(lf, P("água") - 6, P("água") + 6));
  const toca = clamp01(ramp(lf, P("toca") - 6, P("toca") + 6));
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 540, 900, 1.0], [P("debaixo"), 300, 1300, 1.3], [P("água"), 760, 1300, 1.3], [P("toca"), 540, 1150, 1.0], [dur, 540, 1100, 0.98]]} deriva={0}>
        <CeuCretaceo topo="#5a0f2a" base="#ff7a2a" id="d4c7" f={lf} />
        <Meteoros f={lf} n={20} op={0.8} seed="d4c" />
        {[150, 450, 850].map((x, i) => <Chamas key={i} x={x} y={1000} s={0.9} f={lf} seed={i} />)}
        <rect x={-1000} y={1000} width={3000} height={1500} fill="#7a4a2a" />
        <rect x={600} y={1000} width={2000} height={420} fill="#2a6ab8" />
        <path d="M 600,1000 L 2600,1000" stroke="#7fd0ff" strokeWidth={6} />
        {/* toca subterrânea com mamífero */}
        <ellipse cx={300} cy={1350} rx={200} ry={110} fill="#4a2a1a" stroke={TINTA} strokeWidth={6} opacity={0.5 + terra * 0.5} />
        <path d="M 160,1010 C 180,1100 200,1200 240,1270" stroke="#4a2a1a" strokeWidth={60} fill="none" />
        <Mamifero x={300} y={1400} s={1.0} f={lf} />
        <Tartaruga x={860} y={1250} s={1.0} f={lf} />
        {toca > 0 && <g opacity={toca}><circle cx={540} cy={1700} r={90} fill="#3a1a12" stroke={TINTA} strokeWidth={6} /><Mamifero x={540} y={1740} s={0.7} f={lf} /></g>}
      </Camera>
      <Tela>
        <SeloCanal f={lf} em={P("debaixo") - 2} ate={P("água") - 4} t="DEBAIXO DA TERRA" y={300} tam={60} />
        <SeloCanal f={lf} em={P("água") - 2} ate={P("toca") - 4} t="DENTRO DA ÁGUA" y={300} tam={60} fundo="#7fd6ff" />
        <SeloCanal f={lf} em={P("toca") - 2} t="NUMA TOCA" y={300} tam={60} />
      </Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 08 os grandes não tinham onde se esconder
export const Cena08: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const espia = eout(ramp(lf, 10, 40));
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 300, 1650, 2.0], [P("grandes") - 6, 300, 1600, 1.9], [P("grandes") + 8, 560, 1250, 1.0], [dur, 560, 1200, 0.95]]} deriva={0}>
        <Selva f={lf} cx={300} fogo={1} id="d4s8" />
        <Meteoros f={lf} n={25} op={0.9} seed="d4d" />
        <Dino tipo="rex" x={640} y={1690} s={1.1} f={lf} cabeca={-18} medo={1} boca={0.3} seed={24} />
        {/* mamífero espiando da toca */}
        <ellipse cx={300} cy={1660} rx={70} ry={26} fill="#2a1a12" />
        <g transform={`translate(0 ${(1 - espia) * 40})`}><Mamifero x={300} y={1660} s={0.6} f={lf} /></g>
        <ellipse cx={300} cy={1690} rx={90} ry={30} fill={mix("#5fc84a", "#7a2a1a", 1)} />
        {[120, 900].map((x, i) => <Chamas key={i} x={x} y={1640} s={0.8} f={lf} seed={i + 4} />)}
      </Camera>
      <Tela><SeloCanal f={lf} em={P("esconder") - 4} t="SEM ONDE SE ESCONDER" y={300} tam={60} fundo="#ff9a3a" /></Tela>
    </AbsoluteFill>
  );
};
