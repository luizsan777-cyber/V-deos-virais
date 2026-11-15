// DINO 01 — O ponto de luz que os dinossauros viram no céu (reconstrução; não é registro real)
import React from "react";
import { AbsoluteFill } from "remotion";
import { Camera } from "../../engine/src/kit/Camera";
import { useCena } from "../../engine/src/kit/tempo";
import { SeloCanal, TarjaCanal } from "../../engine/src/kit/canal";
import { Globo } from "../../engine/src/kit/Globo";
import {
  TINTA, mix, Dino, Ave, CeuCretaceo, Nuvens, Montanhas, Vulcao, Palmeira, Samambaia, Chao, Asteroide, TerraCretacea, Clarao, Everest, Regua,
  CartaoTempo, Selva, PrimeiroPlano, eio, eout, ramp, clamp01, lerp, rnd,
} from "../dino_kit/kit";

const W = 1080, H = 1920;
type C = React.FC<{ inicio: number; fim: number }>;
const Tela: React.FC<{ children: React.ReactNode; op?: number }> = ({ children, op = 1 }) => <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: op }}>{children}</svg>;

const Floresta: React.FC<{ f: number; cx: number; noite?: number; luz?: number; ponto?: number; px?: number; py?: number }> = ({ f, cx, noite = 0, luz = 0, ponto = 0, px = 760, py = 260 }) => (
  <g>
    <Selva f={f} cx={cx} noite={noite} luz={luz} id={`d1s${Math.round(noite * 10)}${Math.round(luz * 10)}`} />
    {ponto > 0 && <g><circle cx={px} cy={py} r={4 + ponto * 8} fill="#ffffff" /><circle cx={px} cy={py} r={14 + ponto * 26 + Math.sin(f * 0.2) * 3} fill="#fff6c8" opacity={0.35} /><path d={`M ${px - 30 - ponto * 30},${py} L ${px + 30 + ponto * 30},${py} M ${px},${py - 30 - ponto * 30} L ${px},${py + 30 + ponto * 30}`} stroke="#ffffff" strokeWidth={3} opacity={0.7} /></g>}
  </g>
);

// ================================================================== 01
export const Cena01: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const para = P("levanta") - 4;
  const x = lf < para ? 140 + lf * 3.2 : 140 + para * 3.2;
  const olhaCeu = eio(ramp(lf, para, para + 18));
  const ponto = clamp01(ramp(lf, P("ponto") - 6, P("ponto") + 6));
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, x + 120, 1250, 1.25], [para, x + 160, 1220, 1.35], [P("céu") + 2, x + 200, 800, 1.1], [P("ponto"), 720, 520, 1.6], [dur, 740, 420, 2.2]]} deriva={0}>
        <Floresta f={lf} cx={x} ponto={ponto} />
        <Samambaia x={x - 260} y={1640} s={1.2} f={lf} />
        <Dino tipo="rex" x={x} y={1650} s={1.0} f={lf} anda={lf < para ? 1 : 0} cabeca={-28 * olhaCeu} olhar={olhaCeu} seed={2} />
        <Samambaia x={x + 420} y={1720} s={1.4} f={lf} seed={3} />
        <Ave x={1000 - lf * 2} y={600 + Math.sin(lf * 0.05) * 30} s={0.5} f={lf} voa dir={-1} cor="#ff9a3a" seed={4} />
        <g transform={`translate(${x - 400} 0)`}><PrimeiroPlano f={lf} /></g>
      </Camera>
      <Tela>
        <CartaoTempo f={lf} em={4} ate={P("um") - 2} t="66 MILHÕES DE ANOS ATRÁS" y={260} />
      </Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 02 a rocha espacial (reconstrução)
export const Cena02: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const ax = lerp(880, 690, eio(ramp(lf, 0, dur)));
  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0826" }}>
      <Camera inicio={inicio} chaves={[[0, 600, 900, 1.0], [P("largura"), 720, 600, 1.8], [P("Terra"), 560, 1000, 1.0], [dur, 560, 1000, 1.05]]} deriva={0}>
        <CeuCretaceo topo="#0b0826" base="#1a1446" id="d1esp" estrelas={1} f={lf} />
        <TerraCretacea x={380} y={1300} r={330} f={lf} giro={lf * 0.002} />
        <path d={`M ${ax},${560} Q 600,900 470,1090`} fill="none" stroke="#ffd23f" strokeWidth={5} strokeDasharray="14 12" opacity={clamp01(ramp(lf, P("vindo") - 4, P("vindo") + 8))} />
        <Asteroide x={ax} y={560 + (880 - ax) * 0.2} r={42} f={lf} />
        {lf > P("dez") - 4 && <g opacity={clamp01(ramp(lf, P("dez") - 4, P("dez") + 6))}><line x1={ax - 46} y1={480} x2={ax + 46} y2={480} stroke="#ffd23f" strokeWidth={5} /><text x={ax} y={455} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={34} fill="#ffd23f">~10 km</text></g>}
      </Camera>
      <Tela>
        <TarjaCanal t="RECONSTRUÇÃO ARTÍSTICA" f={lf} />
        <SeloCanal f={lf} em={P("ninguém") - 2} ate={P("O", 2) - 4} t="DATA EXATA: DESCONHECIDA" y={330} tam={52} fundo="#c9b8ff" />
      </Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 03 noite após noite
export const Cena03: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const ciclo = (lf / dur) * 3;
  const noite = clamp01(0.5 + 0.6 * Math.cos(ciclo * Math.PI * 2));
  const ponto = lerp(0.1, 1, eio(ramp(lf, 0, dur)));
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 560, 1000, 1.05], [dur, 600, 900, 1.15]]} deriva={0}>
        <Floresta f={lf} cx={200} noite={Math.max(noite, 0.55)} ponto={ponto} px={760} py={360} />
        {/* hadrossauros descansando e um raptor sobre a pedra olhando para cima */}
        <Dino tipo="hadro" x={300} y={1680} s={0.8} f={lf} cabeca={-8} seed={5} />
        <Dino tipo="hadro" x={620} y={1720} s={0.7} f={lf} cabeca={6} seed={6} dir={-1} />
        <path d="M 760,1600 C 780,1450 1000,1420 1060,1600 Z" fill="#3a3460" stroke={TINTA} strokeWidth={7} />
        <Dino tipo="raptor" x={900} y={1500} s={0.75} f={lf} cabeca={-30} olhar={1} seed={7} dir={-1} />
      </Camera>
      <Tela><SeloCanal f={lf} em={P("noite") - 4} t="NOITE APÓS NOITE" y={300} tam={60} fundo="#c9b8ff" /></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 04 escala: maior que o Everest
export const Cena04: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const pxkm = 80, base = 1500;
  const ev = eout(ramp(lf, P("Everest") - 6, P("Everest") + 10));
  const ast = eout(ramp(lf, P("Essa") - 6, P("Essa") + 12));
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 540, 1050, 1.0], [P("maior"), 560, 1000, 1.05], [dur, 560, 1000, 1.08]]} deriva={0}>
        <CeuCretaceo topo="#7fd0ff" base="#e8f6ff" id="d1esc" f={lf} />
        <Nuvens f={lf} y={200} n={4} op={0.7} seed="esc" />
        <rect x={-1000} y={base} width={3000} height={800} fill="#6fbf5a" />
        <Regua x={110} base={base} px_km={pxkm} ate={10} />
        <g opacity={ev}><Everest x={360} base={base} h={8.85 * pxkm * ev} /></g>
        <g opacity={ast}><Asteroide x={790} y={base - 5 * pxkm} r={5 * pxkm * ast} f={0} /><text x={790} y={base - 10 * pxkm - 30} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={36} fill={TINTA}>asteroide (~10 km)</text></g>
        <text x={360} y={base + 70} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={30} fill={TINTA} opacity={ev}>8,8 km</text>
      </Camera>
      <Tela><SeloCanal f={lf} em={P("maior") - 2} t="MAIOR QUE O EVEREST" y={300} tam={66} /></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 05 velocidade: a largura do Brasil em minutos
export const Cena05: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const cruza = eio(ramp(lf, P("cruzaria") - 4, P("minutos") + 14));
  const x0 = 120, x1 = 960, ax = lerp(x0, x1, cruza);
  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0826" }}>
      <Camera inicio={inicio} chaves={[[0, 540, 900, 1.0], [dur, 540, 920, 1.06]]} deriva={0}>
        <CeuCretaceo topo="#0b0826" base="#2a1a6a" id="d1vel" estrelas={1} f={lf} />
        {/* faixa de velocidade: riscos passando = sensação de rapidez */}
        {Array.from({ length: 14 }, (_, i) => { const y = 300 + i * 90, x = 1300 - ((lf * (30 + (i % 4) * 12) + i * 170) % 1800); return <line key={i} x1={x} y1={y} x2={x + 220} y2={y} stroke="#9fd8ff" strokeWidth={4} opacity={0.35} strokeLinecap="round" />; })}
        <Asteroide x={540} y={620} r={110} f={lf} brasa={0.15} rastro={0.6} ang={180} />
        {/* régua: largura do Brasil */}
        <g opacity={clamp01(ramp(lf, P("Mesmo") - 6, P("Mesmo") + 4))}>
          <rect x={x0} y={1080} width={x1 - x0} height={70} rx={35} fill="#2fbf71" stroke={TINTA} strokeWidth={6} />
          <text x={(x0 + x1) / 2} y={1128} textAnchor="middle" fontFamily="Anton" fontSize={44} fill="#ffffff">BRASIL DE PONTA A PONTA ≈ 4.400 km</text>
          {cruza > 0 && <g transform={`translate(${ax} 1040)`}><path d="M 0,0 L -22,-36 L 22,-36 Z" fill="#ffd23f" stroke={TINTA} strokeWidth={4} /></g>}
          {cruza > 0 && <rect x={x0} y={1170} width={ax - x0} height={14} rx={7} fill="#ffd23f" />}
        </g>
      </Camera>
      <Tela>
        <SeloCanal f={lf} em={P("doze") - 4} t="12 a 20 km por SEGUNDO" y={300} tam={60} />
        {cruza > 0 && <g transform="translate(540 900)"><rect x={-260} y={-55} width={520} height={100} rx={22} fill={TINTA} opacity={0.92} /><text y={20} textAnchor="middle" fontFamily="Anton" fontSize={58} fill="#ffd23f">{`≈ ${Math.min(6, Math.floor(cruza * 6 + 0.001))} min a 12 km/s`}</text></g>}
      </Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 06 atravessando a atmosfera
export const Cena06: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const desce = eio(ramp(lf, P("atravessada") - 10, P("segundos") + 6));
  const brasa = clamp01(ramp(lf, P("ar") - 4, P("fogo")));
  const ay = lerp(250, 1350, desce), ax = lerp(820, 380, desce);
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 560, 900, 1.0], [P("ar"), ax, ay, 1.8], [dur, ax, ay, 2.1]]} deriva={0}>
        <CeuCretaceo topo="#0b0826" base="#7fd0ff" id="d1atm" estrelas={0.6} f={lf} />
        {[[1500, "#5fb0e8"], [1650, "#79c27a"]].map(([y, c], i) => <rect key={i} x={-1000} y={y as number} width={3000} height={600} fill={c as string} />)}
        {[200, 600, 1000, 1400].map((y, i) => <g key={i}><line x1={-200} y1={y} x2={1300} y2={y} stroke="#ffffff" strokeWidth={3} strokeDasharray="12 14" opacity={0.4} /><text x={60} y={y - 10} fontFamily="Montserrat" fontWeight={900} fontSize={28} fill="#ffffff" opacity={0.75}>{["100 km", "60 km", "30 km", "solo"][i]}</text></g>)}
        <ellipse cx={ax + 30} cy={ay + 30} rx={120 * brasa} ry={70 * brasa} fill="#fff1b8" opacity={0.6 * brasa} transform={`rotate(-40 ${ax + 30} ${ay + 30})`} />
        <Asteroide x={ax} y={ay} r={60} f={lf} brasa={brasa} rastro={0.3 + brasa * 0.7} ang={-50} />
      </Camera>
      <Tela><SeloCanal f={lf} em={P("segundos") - 2} ate={P("ar") + 10} t="POUCOS SEGUNDOS" y={300} tam={64} fundo="#ff9a3a" /><SeloCanal f={lf} em={P("fogo") - 6} t="BOLA DE FOGO" y={300} tam={64} fundo="#ff9a3a" /></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 07 alvo: mar raso de Iucatã; o céu acende
export const Cena07: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const corte = P("Para") - 4;
  if (lf < corte) {
    const pin = eback1(ramp(lf, P("península") - 6, P("península") + 6));
    return (
      <AbsoluteFill style={{ backgroundColor: "#0b0826" }}>
        <Camera inicio={inicio} chaves={[[0, 540, 960, 0.95], [corte, 540, 920, 1.25]]} deriva={0}>
          <CeuCretaceo topo="#0b0826" base="#1a1446" id="d1map" estrelas={1} f={lf} />
          <Globo cx={540} cy={960} r={420} lon0={-90 + (1 - eio(ramp(lf, 0, 60))) * 60} lat0={18} id="d1g" alertas={pin > 0 ? [{ ll: [-89.5, 21.4], cor: "#ff4d4d", inicio: inicio + P("península") - 6, tamanho: 1.4 }] : []} />
          <text x={540} y={1460} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={34} fill="#ffffff" opacity={pin}>Iucatã, México (continentes de hoje)</text>
        </Camera>
        <Tela><text x={540} y={1560} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={28} fill="#d6f0ff" opacity={0.85}>há 66 milhões de anos era um mar raso</text></Tela>
      </AbsoluteFill>
    );
  }
  const luz = eio(ramp(lf, corte, P("acendeu") + 10));
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[corte, 540, 1250, 1.15], [dur, 560, 1200, 1.25]]} deriva={0}>
        <Floresta f={lf} cx={300} luz={luz} />
        <Dino tipo="tri" x={330} y={1700} s={0.85} f={lf} cabeca={-14 * luz} medo={luz} seed={8} />
        <Dino tipo="hadro" x={760} y={1690} s={0.8} f={lf} cabeca={-20 * luz} medo={luz} dir={-1} seed={9} />
      </Camera>
      <AbsoluteFill style={{ backgroundColor: "#fff6d0", opacity: 0.55 * luz }} />
    </AbsoluteFill>
  );
};
const eback1 = (t: number) => { const c1 = 1.70158, c3 = c1 + 1; return t <= 0 ? 0 : 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };

// ================================================================== 08 conclusão
export const Cena08: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const luz = 1 - eio(ramp(lf, 0, 40)) * 0.5;
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 560, 1200, 1.2], [P("Mas"), 640, 1300, 2.4], [P("aquele"), 640, 1290, 2.9], [dur, 700, 760, 1.4]]} deriva={0}>
        <Floresta f={lf} cx={300} luz={luz * 0.6} ponto={1} px={760} py={300} />
        <Dino tipo="rex" x={460} y={1680} s={1.05} f={lf} cabeca={-26} olhar={1} medo={0.6} seed={2} />
        {/* reflexo do ponto de luz no olho */}
        <circle cx={460 + 1.05 * 230} cy={1680 - 1.05 * 310} r={5} fill="#fff6c8" opacity={0.9} />
      </Camera>
      <Tela><SeloCanal f={lf} em={P("história") - 4} t="66 MILHÕES DE ANOS ATRÁS" y={300} tam={58} fundo="#ffd23f" /></Tela>
    </AbsoluteFill>
  );
};
