// DINO 05 — O inverno que mudou a vida na Terra (inverno de impacto, extinção e sobreviventes). Ilustração, não registro.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Camera } from "../../engine/src/kit/Camera";
import { parado, Pose } from "../../engine/src/kit/poses";
import { EXPRESSOES, exprEm } from "../../engine/src/kit/expressoes";
import { useCena } from "../../engine/src/kit/tempo";
import { SeloCanal, TarjaCanal, Avatar } from "../../engine/src/kit/canal";
import {
  TINTA, mix, Dino, Ave, Mamifero, CeuCretaceo, Selva, PrimeiroPlano, Samambaia, Cinzas, TerraCretacea, CartaoTempo, Asteroide, eio, eout, ramp, clamp01, lerp, rnd,
} from "../dino_kit/kit";

const W = 1080, H = 1920;
type C = React.FC<{ inicio: number; fim: number }>;
const Tela: React.FC<{ children: React.ReactNode; op?: number }> = ({ children, op = 1 }) => <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: op }}>{children}</svg>;
const Amonite: React.FC<{ x: number; y: number; s?: number; f: number; op?: number }> = ({ x, y, s = 1, f, op = 1 }) => (
  <g transform={`translate(${x} ${y + Math.sin(f * 0.05) * 8}) scale(${s})`} opacity={op}>
    {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M -24,8 Q -40,${-10 + i * 3} -20,${-16 - i * 2}`} stroke="#e8c4a8" strokeWidth={5} fill="none" transform={`rotate(${Math.sin(f * 0.1 + i) * 10} -24 8)`} />)}
    <circle r={50} fill="#f2b880" stroke={TINTA} strokeWidth={5} />
    <path d="M 0,0 m -36,0 a 36,36 0 1 0 72,0 a 26,26 0 1 0 -52,0 a 16,16 0 1 0 32,0 a 8,8 0 1 0 -16,0" fill="none" stroke="#b07a52" strokeWidth={5} />
  </g>
);
const ReptilMarinho: React.FC<{ x: number; y: number; s?: number; f: number; op?: number }> = ({ x, y, s = 1, f, op = 1 }) => (
  <g transform={`translate(${x} ${y + Math.sin(f * 0.04) * 10}) scale(${s})`} opacity={op}>
    <path d={`M -260,0 C -200,${-20 + Math.sin(f * 0.1) * 10} -120,-40 0,-40 C 120,-40 220,-20 260,0 C 220,20 120,40 0,40 C -120,40 -200,${20 + Math.sin(f * 0.1) * 10} -260,0 Z`} fill="#4f7ad8" stroke={TINTA} strokeWidth={6} />
    <path d="M 240,-6 L 360,-14 L 360,10 L 240,8 Z" fill="#4f7ad8" stroke={TINTA} strokeWidth={6} />
    {[-80, 80].map((px, i) => <path key={i} d={`M ${px},20 l -50,${50 + Math.sin(f * 0.15 + i) * 10} l 30,0 Z`} fill="#3a5ab0" stroke={TINTA} strokeWidth={5} />)}
    <path d={`M -260,0 l -60,${-40 + Math.sin(f * 0.1) * 10} l 10,40 l -10,40 Z`} fill="#3a5ab0" stroke={TINTA} strokeWidth={5} />
    <circle cx={330} cy={-6} r={6} fill="#fff" />
  </g>
);
const Calendario: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-120} y={-120} width={240} height={240} rx={16} fill="#fff" stroke={TINTA} strokeWidth={7} />
    <rect x={-120} y={-120} width={240} height={56} fill="#4f7ad8" />
    {[0, 1, 2].map((i) => { const u = (t + i / 3) % 1; return <rect key={i} x={-110} y={-60} width={220} height={170} fill="#fdf6e6" stroke="#ccc" strokeWidth={2} transform={`rotate(${-u * 80} -110 -60)`} opacity={1 - u} />; })}
  </g>
);

// ================================================================== 01 segundos × anos
export const Cena01: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const anos = clamp01(ramp(lf, P("Mas") - 6, P("Mas") + 6));
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 540, 1100, 1.1], [dur, 540, 1050, 1.0]]} deriva={0}>
        <Selva f={lf} cx={100} fogo={0.6} cinza={anos * 0.7} id="d5s1" />
        <Cinzas f={lf} n={60} op={anos * 0.8} seed="d5a" />
        <Calendario x={820} y={560} s={eout(anos)} t={lf * 0.08 * anos} />
        <Dino tipo="hadro" x={380} y={1700} s={0.85} f={lf} cabeca={-10} medo={0.5} seed={31} />
      </Camera>
      <Tela><CartaoTempo f={lf} em={4} ate={P("Mas") - 4} t="SEGUNDOS" y={260} cor="#ff9a3a" /><CartaoTempo f={lf} em={P("anos") - 4} ate={dur + 10} t="ANOS" y={260} cor="#c9d6ff" /></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 02 poeira, fuligem e enxofre sobem
export const Cena02: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const nuvem = eio(ramp(lf, P("espalharam") - 10, dur));
  const tipos: [string, string, string][] = [["Poeira", "#b8b0a8", "poeira fina"], ["fuligem", "#2a2228", "fuligem"], ["enxofre", "#e8d24a", "enxofre"]];
  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0826" }}>
      <Camera inicio={inicio} chaves={[[0, 540, 1300, 1.0], [P("atmosfera"), 540, 1100, 0.9], [dur, 540, 1100, 0.95]]} deriva={0}>
        <CeuCretaceo topo="#0b0826" base="#1a1446" id="d5c2" estrelas={1} f={lf} />
        <TerraCretacea x={540} y={1250} r={420} f={lf} escuro={nuvem * 0.8} />
        <circle cx={540} cy={1250} r={455} fill="none" stroke="#6a6070" strokeWidth={40 * nuvem} opacity={0.85 * nuvem} />
        {tipos.map(([w, cor], k) => {
          const em = P(w);
          return lf >= em - 6 && Array.from({ length: 14 }, (_, i) => {
            const u = clamp01((lf - em + 6 - i * 2) / 60);
            const a = -Math.PI / 2 + (rnd(`d5p${k}${i}`) - 0.5) * 1.8;
            const d = 430 + u * 120;
            return <circle key={`${k}-${i}`} cx={540 + Math.cos(a + nuvem * (rnd(`d5q${k}${i}`) - 0.5) * 3) * d} cy={1250 + Math.sin(a + nuvem * (rnd(`d5q${k}${i}`) - 0.5) * 3) * d} r={10 + rnd(`d5r${k}${i}`) * 10} fill={cor} opacity={0.9} />;
          });
        })}
      </Camera>
      <Tela>
        {tipos.map(([w, cor, rot], k) => lf >= P(w) - 4 && <g key={k} transform={`translate(${200 + k * 340} 330)`}><circle r={26} fill={cor} stroke="#fff" strokeWidth={4} /><text y={70} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={30} fill="#fff">{rot}</text></g>)}
      </Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 03 sem luz: fotossíntese parada (~2 anos, estudo de 2023)
export const Cena03: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const escuro = eio(ramp(lf, 0, P("chão") + 10));
  const murcha = eio(ramp(lf, P("fotossíntese") - 6, P("parada") + 10));
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 540, 900, 1.0], [P("estudo"), 540, 1300, 1.2], [dur, 540, 1300, 1.25]]} deriva={0}>
        <Selva f={lf} cx={150} noite={escuro * 0.5} cinza={0.6 + escuro * 0.4} id="d5s3" raios={false} />
        <circle cx={760} cy={420} r={90} fill="#fff6c8" opacity={0.6 * (1 - escuro * 0.8)} />
        <Cinzas f={lf} n={90} cor="#8a8494" op={0.8} seed="d5b" vy={0.8} />
        {[200, 420, 650, 880].map((x, i) => <Samambaia key={i} x={x} y={1640} s={1.1 - murcha * 0.4} f={lf} seed={i} cor={mix("#3fbf6a", "#6a5a3a", murcha)} />)}
      </Camera>
      <Tela><CartaoTempo f={lf} em={P("estudo") - 4} ate={dur + 10} t="ESTUDO DE 2023" y={260} cor="#7fd6ff" /><SeloCanal f={lf} em={P("dois") - 4} t="FOTOSSÍNTESE PARADA: ~2 ANOS" y={420} tam={52} fundo="#c9d6ff" /></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 04 a cadeia alimentar desaba de baixo para cima
export const Cena04: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const cai = (em: number) => eio(ramp(lf, em, em + 18));
  const c1 = cai(P("comida") - 14), c2 = cai(P("predadores") - 8), c3 = cai(P("desabou") + 4);
  const nivel = (y: number, w: number, cor: string, rot: string, c: number, icone: React.ReactNode) => (
    <g transform={`translate(540 ${y + c * 500}) rotate(${c * (rot === "plantas" ? 8 : -10)})`} opacity={1 - c * 0.7}>
      <rect x={-w / 2} y={-110} width={w} height={220} rx={24} fill={cor} stroke={TINTA} strokeWidth={7} />
      <g transform="translate(-160 30)">{icone}</g>
      <text x={120} y={18} textAnchor="middle" fontFamily="Anton" fontSize={52} fill="#fff" stroke={TINTA} strokeWidth={6} paintOrder="stroke">{rot.toUpperCase()}</text>
    </g>
  );
  return (
    <AbsoluteFill style={{ backgroundColor: "#2a2638" }}>
      <Camera inicio={inicio} chaves={[[0, 540, 960, 1.0], [dur, 540, 1100, 0.95]]} deriva={0} tremores={[P("desabou")]} forcaTremor={14}>
        <rect x={-1000} y={-1000} width={3000} height={4000} fill="#2a2638" />
        <Cinzas f={lf} n={40} cor="#6a6478" op={0.6} seed="d5c" />
        {nivel(560, 520, "#d9455f", "predadores", c3, <g transform="scale(0.35)"><Dino tipo="rex" x={0} y={160} f={lf} seed={1} /></g>)}
        {nivel(860, 720, "#e8743b", "herbívoros", c2, <g transform="scale(0.32)"><Dino tipo="hadro" x={0} y={160} f={lf} seed={2} /></g>)}
        {nivel(1160, 920, "#3fae7a", "plantas", c1, <Samambaia x={0} y={70} s={0.7} f={lf} />)}
      </Camera>
      <Tela><SeloCanal f={lf} em={P("desabou") - 4} t="DE BAIXO PARA CIMA" y={300} tam={64} fundo="#ff9a3a" /></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 05 no mar
export const Cena05: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const plancton = 1 - eio(ramp(lf, P("plâncton") - 4, P("despencou") + 14));
  const some = eio(ramp(lf, P("desapareceram") - 8, P("desapareceram") + 14));
  return (
    <AbsoluteFill style={{ backgroundColor: "#0a2a4a" }}>
      <Camera inicio={inicio} chaves={[[0, 540, 900, 1.0], [P("amonites"), 420, 1000, 1.2], [P("répteis"), 640, 1200, 1.1], [dur, 540, 1050, 1.0]]} deriva={0}>
        <CeuCretaceo topo={mix("#2f86c9", "#0a1a2a", 0.6)} base="#04101e" id="d5c5" f={lf} />
        {Array.from({ length: 120 }, (_, i) => <circle key={i} cx={rnd(`d5k${i}`) * 1200 - 60 + Math.sin(lf * 0.03 + i) * 10} cy={rnd(`d5ky${i}`) * 900 + 150} r={3 + rnd(`d5kr${i}`) * 3} fill="#7dffcf" opacity={plancton * 0.8} />)}
        <Amonite x={330} y={1000} s={1.2} f={lf} op={1 - some} />
        <Amonite x={180} y={1150} s={0.7} f={lf + 20} op={1 - some} />
        <ReptilMarinho x={600} y={1350} s={0.9} f={lf} op={1 - some} />
        <rect x={-1000} y={1700} width={3000} height={500} fill="#2a2238" />
        <text x={330} y={880} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={32} fill="#fff" opacity={clamp01(ramp(lf, P("amonites") - 4, P("amonites") + 6)) * (1 - some)}>amonites</text>
        <text x={640} y={1500} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={32} fill="#fff" opacity={clamp01(ramp(lf, P("répteis") - 4, P("répteis") + 6)) * (1 - some)}>grandes répteis marinhos</text>
      </Camera>
      <Tela><SeloCanal f={lf} em={P("plâncton") - 4} ate={P("grupos") - 2} t="PLÂNCTON DESPENCOU" y={300} tam={60} fundo="#7dffcf" /></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 06 três quartos das espécies
export const Cena06: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const apaga = clamp01(ramp(lf, P("três") - 6, P("extintas") + 6));
  const icones = ["rex", "tri", "hadro", "titano", "raptor"] as const;
  return (
    <AbsoluteFill style={{ backgroundColor: "#1a1630" }}>
      <Tela>
        <rect width={W} height={H} fill="#1a1630" />
        {Array.from({ length: 20 }, (_, i) => {
          const col = i % 4, lin = Math.floor(i / 4);
          const extinta = i % 4 !== 3; // 15 de 20 = 3/4
          const g = extinta ? clamp01(apaga * 20 / 15 - (i / 20) * 0.3) : 0;
          return (
            <g key={i} transform={`translate(${190 + col * 235} ${470 + lin * 210})`}>
              <rect x={-100} y={-90} width={200} height={180} rx={20} fill={mix("#2f3a6a", "#3a3440", g)} stroke={mix("#7fd6ff", "#5a5060", g)} strokeWidth={5} />
              <g transform="translate(0 70) scale(0.18)" opacity={1 - g * 0.75}>{i % 7 === 3 ? <Ave x={0} y={-300} s={3} f={lf} /> : i % 7 === 5 ? <Mamifero x={0} y={-60} s={3.5} f={lf} /> : <Dino tipo={icones[i % 5]} x={0} y={0} f={lf} seed={i} cor={g > 0.5 ? ["#6a6478", "#4a4458", "#8a8494"] : undefined} />}</g>
              {g > 0.6 && <path d="M -70,-60 L 70,60 M 70,-60 L -70,60" stroke="#ff5a5a" strokeWidth={8} opacity={(g - 0.6) * 2.5} />}
            </g>
          );
        })}
        <text x={540} y={1640} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={28} fill="#c9c0e0">quadro ilustrativo: 15 de 20 = três quartos</text>
      </Tela>
      <Tela><SeloCanal f={lf} em={P("três") - 4} t="≈ 3/4 DAS ESPÉCIES" y={300} tam={68} fundo="#ff5a5a" cor="#ffffff" /></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 07 as aves sobreviveram
export const Cena07: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const aurora = eio(ramp(lf, 0, dur));
  const vira = eio(ramp(lf, P("aves") - 14, P("aves") + 4));
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 540, 1250, 1.1], [P("linhagem"), 540, 1300, 1.5], [dur, 540, 1250, 1.3]]} deriva={0}>
        <Selva f={lf} cx={100} cinza={0.8 - aurora * 0.5} noite={0.3 - aurora * 0.3} id="d5s7" raios={aurora > 0.6} />
        <path d="M 300,1640 C 340,1500 560,1480 640,1640 Z" fill="#5a5060" stroke={TINTA} strokeWidth={6} />
        <g opacity={1 - vira}><Dino tipo="raptor" x={470} y={1560} s={0.55} f={lf} cabeca={-10} seed={33} /></g>
        <g opacity={vira}><Ave x={470} y={1470} s={1.3} f={lf} cor="#ff7b54" seed={3} /></g>
        {vira > 0.5 && <Ave x={760 + Math.sin(lf * 0.05) * 60} y={900 - lf * 0.3} s={0.8} f={lf} voa cor="#ffd23f" seed={5} />}
      </Camera>
      <Tela><SeloCanal f={lf} em={P("aves") - 2} t="AVES SÃO DINOSSAUROS" y={300} tam={64} fundo="#ffd23f" /></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 08 os mamíferos e... nós
export const Cena08: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const linha = eio(ramp(lf, P("Milhões") - 6, P("nós") + 4));
  const pose: Pose = { ...parado(lf, 1), bracoD: [lerp(10, 70, linha), lerp(10, 40, linha)] };
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 540, 1450, 1.4], [P("Milhões"), 540, 1150, 0.9], [dur, 560, 1100, 0.92]]} deriva={0}>
        <Selva f={lf} cx={200} id="d5s8" />
        {[0, 1, 2].map((k) => <Mamifero key={k} x={((k * 400 + lf * (2 + k * 0.6)) % 1600) - 300} y={1660 + k * 20} s={0.8 - k * 0.1} f={lf} anda={1} />)}
        <Samambaia x={180} y={1660} s={1.2} f={lf} seed={2} />
        {/* linha do tempo: mamífero → humano (avatar do canal) */}
        <g opacity={linha}>
          <rect x={120} y={600} width={840 * linha} height={18} rx={9} fill="#ffd23f" />
          <text x={140} y={570} fontFamily="Montserrat" fontWeight={900} fontSize={30} fill={TINTA}>66 milhões de anos</text>
          <Mamifero x={150} y={700} s={0.6} f={lf} />
        </g>
        {linha > 0.9 && <Avatar id="d5-avatar-c8" x={900} y={1000} escala={0.55} pose={pose} f={lf} expr={EXPRESSOES.feliz} />}
      </Camera>
    </AbsoluteFill>
  );
};

// ================================================================== 09 o passarinho na janela
export const Cena09: C = ({ inicio, fim }) => {
  const { lf, P, T } = useCena(inicio);
  const dur = fim - inicio;
  const pousa = eout(ramp(lf, 10, 50));
  const fimNarr = T.fala("c09").fim - inicio;
  const pose: Pose = { ...parado(lf, 1), virar: 0.4, olhar: [0.8, 0.2], bracoD: [lerp(10, 60, clamp01(ramp(lf, P("lembra"), P("lembra") + 10))), 40] };
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 540, 1100, 1.0], [P("janela"), 700, 900, 1.4], [P("dinossauro"), 640, 1000, 1.25], [dur, 600, 1050, 1.15]]} deriva={0}>
        <rect x={-1000} y={-1000} width={3000} height={4000} fill="#f6e3c0" />
        <g transform="translate(760 820)">
          <rect x={-260} y={-320} width={520} height={560} rx={14} fill="#9fd8ff" stroke={TINTA} strokeWidth={12} />
          <path d="M -260,140 C -120,90 0,130 120,100 C 200,80 240,110 260,100 L 260,240 L -260,240 Z" fill="#79c27a" />
          <line x1={0} y1={-320} x2={0} y2={240} stroke={TINTA} strokeWidth={10} />
          <rect x={-300} y={240} width={600} height={40} rx={8} fill="#c4844a" stroke={TINTA} strokeWidth={8} />
        </g>
        <Ave x={lerp(1200, 860, pousa)} y={lerp(700, 1040, pousa) - (1 - pousa) * Math.sin(pousa * Math.PI) * 120} s={0.9} f={lf} voa={pousa < 1} dir={-1} cor="#ff7b54" seed={8} />
        <Avatar id="d5-avatar-c9" x={330} y={1860} escala={1.1} pose={pose} f={lf} expr={exprEm(lf, [[0, "sereno"], [P("dinossauro") - 4, "maravilhado"], [P("mundo"), "feliz"]])} />
      </Camera>
      <Tela><SeloCanal f={lf} em={fimNarr + 2} t="UM DINOSSAURO NA SUA JANELA" y={330} tam={58} fundo="#ffd23f" /></Tela>
    </AbsoluteFill>
  );
};
