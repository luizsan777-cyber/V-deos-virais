// Blocos de época do episódio (1920 x 1080). Cada componente recebe o tempo local (quadros) e âncoras da voz real.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Pose } from "../../engine/src/kit/poses";
import { clamp01, eio, eout, lerp, ramp, rnd } from "../../engine/src/kit/anim";
import { Figura, LOGAN_CIVIL, LOGAN_1941, WOLV, JAMES, CAPITAO, NATASHA, MAGNETO, ENTREGADOR, TINTA, corrida, guarda, repouso, poseChaves, GarrasDesenho } from "./elenco";
import { Drone, SaltoFrente, CelularNoChao } from "./salto";

const W = 1920, H = 1080;
type Cam = { z: number; cx: number; cy: number; r?: number };
const camEm = (lf: number, ks: [number, number, number, number][]): Cam => {
  for (let i = 0; i < ks.length - 1; i++) {
    const [f0, x0, y0, z0] = ks[i], [f1, x1, y1, z1] = ks[i + 1];
    if (lf <= f1) { const t = eio(ramp(lf, f0, f1)); return { cx: lerp(x0, x1, t), cy: lerp(y0, y1, t), z: Math.exp(lerp(Math.log(z0), Math.log(z1), t)) }; }
  }
  const [, x, y, z] = ks[ks.length - 1];
  return { cx: x, cy: y, z };
};
export const Quadro: React.FC<{ cam: Cam; fundo?: string; children: React.ReactNode }> = ({ cam, fundo = "#000", children }) => (
  <AbsoluteFill style={{ backgroundColor: fundo }}>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <g transform={`translate(${W / 2} ${H / 2}) rotate(${cam.r ?? 0}) scale(${cam.z}) translate(${-cam.cx} ${-cam.cy})`}>{children}</g>
    </svg>
  </AbsoluteFill>
);
const Neve: React.FC<{ f: number; n?: number; op?: number; vento?: number }> = ({ f, n = 110, op = 0.8, vento = 1 }) => (
  <g fill="#f4f8ff" opacity={op}>
    {Array.from({ length: n }, (_, i) => {
      const r1 = rnd(`nx${i}`), r2 = rnd(`ny${i}`), v = 2 + r2 * 3;
      const x = ((r1 * 2400 + f * v * 1.6 * vento + Math.sin(f * 0.05 + i) * 20) % 2400) - 240, y = ((r2 * 1300 + f * v) % 1300) - 110;
      return <circle key={i} cx={x} cy={y} r={2 + r1 * 4} />;
    })}
  </g>
);
const Garoa: React.FC<{ f: number; n?: number; op?: number }> = ({ f, n = 90, op = 0.45 }) => (
  <g stroke="#bcd2ff" strokeWidth={3} opacity={op}>
    {Array.from({ length: n }, (_, i) => { const x = rnd(`gx${i}`) * 2300 - 200 + f * 3, y = (rnd(`gy${i}`) * 1300 + f * (34 + rnd(`gv${i}`) * 18)) % 1300 - 100; return <line key={i} x1={x % 2300} y1={y} x2={(x % 2300) - 8} y2={y - 40} />; })}
  </g>
);

// ================================================================ B1 fim: três riscos no vidro de uma janela com neve
export const JanelaRiscos: React.FC<{ lf: number; morph: number }> = ({ lf, morph }) => (
  <Quadro cam={{ z: lerp(1.15, 1.0, eio(clamp01(lf / 90))), cx: 960, cy: 540 }} fundo="#0e1830">
    <rect x={-200} y={-200} width={2400} height={1500} fill="#1a2a4a" />
    <rect x={260} y={90} width={1400} height={900} fill="#0c1428" stroke="#5a3a26" strokeWidth={40} />
    <path d="M 260,800 Q 700,700 1100,780 T 1660,760 L 1660,990 L 260,990 Z" fill="#dfe8f6" />
    {[[420, 700], [560, 640], [1300, 660], [1460, 720]].map(([x, y], i) => <path key={i} d={`M ${x},${y} l 50,-160 l 50,160 Z`} fill="#13203a" />)}
    <Neve f={lf} n={90} />
    <line x1={960} y1={90} x2={960} y2={990} stroke="#5a3a26" strokeWidth={22} />
    {/* geada nas bordas */}
    <rect x={260} y={90} width={1400} height={900} fill="none" stroke="#e8f2ff" strokeOpacity={0.35} strokeWidth={60} />
    {/* rastros de luz que viram riscos no vidro */}
    {[0, 1, 2].map((j) => <path key={j} d={`M ${720 + j * 120},${260 + j * 10} L ${980 + j * 120},${760 + j * 10}`} stroke={morph < 1 ? "#e8f4ff" : "#ffffff"} strokeWidth={lerp(22, 7, morph)} strokeLinecap="round" opacity={lerp(0.9, 0.75, morph)} />)}
    {[0, 1, 2].map((j) => <path key={`s${j}`} d={`M ${724 + j * 120},${266 + j * 10} L ${984 + j * 120},${766 + j * 10}`} stroke="#0c1428" strokeWidth={2} opacity={morph} />)}
  </Quadro>
);

// ================================================================ B2 — Brasil 1888 (jornal) e Alberta
export const Jornal1888: React.FC<{ lf: number; dur: number }> = ({ lf, dur }) => (
  <Quadro cam={camEm(lf, [[0, 960, 520, 1.25], [dur, 1000, 560, 1.05]])} fundo="#2a2018">
    <rect x={-300} y={-300} width={2600} height={1700} fill="#3a2c20" />
    <g transform={`translate(420 170) scale(0.9) rotate(${-2 + Math.sin(lf * 0.03) * 0.6})`}>
      <rect x={0} y={0} width={1260} height={900} fill="#efe3c6" stroke="#8a6a46" strokeWidth={6} />
      <rect x={0} y={0} width={1260} height={900} fill="#c9a46a" opacity={0.18} />
      <text x={630} y={110} textAnchor="middle" fontFamily="Cinzel" fontWeight={900} fontSize={84} fill="#2a1d12">GAZETA DA CÔRTE</text>
      <line x1={60} y1={140} x2={1200} y2={140} stroke="#2a1d12" strokeWidth={4} />
      <text x={630} y={178} textAnchor="middle" fontFamily="Cinzel" fontWeight={700} fontSize={30} fill="#2a1d12">RIO DE JANEIRO · 14 DE MAIO DE 1888</text>
      <line x1={60} y1={196} x2={1200} y2={196} stroke="#2a1d12" strokeWidth={2} />
      <text x={630} y={330} textAnchor="middle" fontFamily="Anton" fontSize={128} fill="#2a1d12" opacity={clamp01(lf / 12)}>LEI ÁUREA</text>
      <text x={630} y={420} textAnchor="middle" fontFamily="Cinzel" fontWeight={900} fontSize={48} fill="#2a1d12" opacity={clamp01((lf - 10) / 12)}>LEI Nº 3.353 · 13 DE MAIO DE 1888</text>
      <text x={630} y={480} textAnchor="middle" fontFamily="Cinzel" fontWeight={700} fontSize={36} fill="#5a3a20" opacity={clamp01((lf - 20) / 12)}>declarada extinta a escravidão no Brasil</text>
      {Array.from({ length: 6 }, (_, c) => Array.from({ length: 9 }, (_, l) => <rect key={`${c}${l}`} x={70 + c * 190} y={540 + l * 36} width={150 - (l % 3) * 18} height={10} fill="#5a4630" opacity={0.45} />))}
    </g>
    <rect x={-300} y={-300} width={2600} height={1700} fill="url(#vinhetaJ)" />
    <defs><radialGradient id="vinhetaJ" cx="0.5" cy="0.5" r="0.7"><stop offset="0.55" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.6} /></radialGradient></defs>
  </Quadro>
);

const CasaAlberta: React.FC<{ f: number; lamp: number }> = ({ f, lamp }) => (
  <g>
    <rect x={-300} y={-300} width={2600} height={1700} fill="#0e1a34" />
    {Array.from({ length: 50 }, (_, i) => <circle key={i} cx={rnd(`st${i}`) * 1920} cy={rnd(`sy${i}`) * 420} r={1.5 + rnd(`sr${i}`) * 2} fill="#fff" opacity={0.6} />)}
    <path d="M -300,700 Q 600,620 1200,690 T 2300,660 L 2300,1400 L -300,1400 Z" fill="#dbe6f4" />
    {[[180, 640], [300, 600], [1600, 610], [1750, 650]].map(([x, y], i) => <path key={i} d={`M ${x},${y} l 60,-220 l 60,220 Z`} fill="#13203a" />)}
    <g transform="translate(760 360)">
      <path d="M -40,180 L 220,20 L 480,180 Z" fill="#3a2a2a" stroke={TINTA} strokeWidth={8} />
      <rect x={0} y={180} width={440} height={300} fill="#6a4a36" stroke={TINTA} strokeWidth={8} />
      <path d="M -40,180 L 220,20 L 480,180 L 470,195 L 220,40 L -30,195 Z" fill="#f4f8ff" />
      <rect x={60} y={250} width={120} height={110} fill="#ffcf6a" opacity={0.55 + 0.4 * lamp} stroke={TINTA} strokeWidth={6} />
      <rect x={270} y={290} width={100} height={190} fill="#3a2418" stroke={TINTA} strokeWidth={6} />
      <ellipse cx={120} cy={305} rx={150} ry={110} fill="#ffcf6a" opacity={0.15 * lamp} />
    </g>
    <Neve f={f} n={80} />
  </g>
);
export const Alberta: React.FC<{ lf: number; dur: number; tragedia: number; garras: number; foge: number; mao: number; adulto: number }> = ({ lf, dur, tragedia, garras, foge, mao, adulto }) => {
  const lampFlicker = 0.8 + 0.2 * Math.sin(lf * 0.9) * Math.sin(lf * 0.37);
  if (lf < tragedia) {
    return <Quadro cam={camEm(lf, [[0, 960, 560, 1.0], [tragedia, 980, 600, 1.18]])} fundo="#0e1a34"><CasaAlberta f={lf} lamp={1} />
      <Figura fig={JAMES} pose={{ ...repouso(lf, 2), bracoE: [20, 60], bracoD: [20, 60], frenteE: true, frenteD: true, cabecaIncl: 8 }} x={880} y={760} escala={0.62} expr="neutro" sil="#1a1210" />
    </Quadro>;
  }
  if (lf < garras) {
    // dentro de casa: luz de lamparina, sombras na parede (a tragédia sugerida, sem violência)
    const l = lf - tragedia;
    return (
      <Quadro cam={camEm(l, [[0, 960, 540, 1.05], [garras - tragedia, 960, 520, 1.2]])} fundo="#2a1a10">
        <rect x={-300} y={-300} width={2600} height={1700} fill="#3a2414" />
        <ellipse cx={1300} cy={460} rx={520} ry={420} fill="#ffb24a" opacity={0.3 * lampFlicker} />
        <rect x={1260} y={460} width={30} height={90} fill="#2a1a10" /><ellipse cx={1275} cy={440} rx={26} ry={36} fill="#ffd27a" opacity={lampFlicker} />
        {/* sombras longas na parede */}
        <path d={`M 500,980 L 620,${300 + Math.sin(l * 0.2) * 20} L 700,${290 + Math.sin(l * 0.2) * 20} L 760,980 Z`} fill="#140c08" opacity={0.75} />
        <path d={`M 860,980 L ${930 + Math.sin(l * 0.15) * 30},330 L ${1000 + Math.sin(l * 0.15) * 30},330 L 1060,980 Z`} fill="#140c08" opacity={0.6} />
        <rect x={-300} y={900} width={2600} height={400} fill="#24160c" />
        <Figura fig={JAMES} pose={{ ...repouso(l, 2), bracoE: [40, 110], bracoD: [40, 110], frenteE: true, frenteD: true, cabecaIncl: 10, olhar: [0.6, 0] }} x={1500} y={960} escala={0.8} dir={-1} expr="susto" brilho="#ffb24a" luz={0.4} />
      </Quadro>
    );
  }
  if (lf < foge) {
    // revelação das garras de osso, em silhueta contra a lamparina
    const l = lf - garras, ext = eout(ramp(l, 6, 16));
    const pose: Pose = { ...repouso(l, 2), bracoE: [50, 70], bracoD: [50, 70], frenteE: true, frenteD: true, tronco: -6, cabecaIncl: -6 };
    return (
      <Quadro cam={camEm(l, [[0, 960, 560, 1.35], [foge - garras, 960, 560, 1.5]])} fundo="#ffb24a">
        <rect x={-300} y={-300} width={2600} height={1700} fill="#f0a040" />
        <circle cx={960} cy={520} r={380} fill="#ffe0a0" />
        <Figura fig={JAMES} pose={pose} x={960} y={980} escala={1.5} expr="susto" garras="osso" garrasExt={ext} sil="#1a0e08" />
      </Quadro>
    );
  }
  if (lf < mao) {
    const l = lf - foge;
    return (
      <Quadro cam={camEm(l, [[0, 700, 560, 1.0], [mao - foge, 1200, 560, 1.12]])} fundo="#0e1a34">
        <rect x={-300} y={-300} width={2600} height={1700} fill="#0e1a34" />
        <path d="M -300,760 L 2300,720 L 2300,1400 L -300,1400 Z" fill="#dbe6f4" />
        {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M ${-200 + i * 180 - l * 1.2},${760} l 70,-${380 + (i % 3) * 80} l 70,${380 + (i % 3) * 80} Z`} fill="#0a1426" />)}
        <Figura fig={JAMES} pose={{ ...corrida(l, 0.4), tronco: 18 }} x={lerp(300, 1400, l / Math.max(1, mao - foge))} y={900} escala={0.7} expr="susto" sil="#05080f" />
        <Neve f={l} n={140} vento={2.5} />
      </Quadro>
    );
  }
  // mão na janela: menino -> adulto; Logan adulto olha a neve (o tempo passa devagar para ele)
  const l = lf - mao, troca = eio(ramp(lf, adulto - 8, adulto + 10));
  const maoD = (m: number, cor: string, esc: number) => (
    <g transform={`translate(960 560) scale(${esc})`} opacity={m}>
      <path d="M -70,160 L -80,-20 C -84,-70 -50,-70 -46,-20 L -44,-90 C -44,-140 -6,-140 -6,-90 L -4,-110 C -2,-160 34,-160 36,-110 L 38,-80 C 42,-126 76,-120 74,-74 L 70,40 C 100,0 130,20 108,60 L 60,160 Z" fill={cor} stroke={TINTA} strokeWidth={8} />
    </g>
  );
  return (
    <Quadro cam={{ z: lerp(1.0, 1.05, l / 200), cx: 960, cy: 540 }} fundo="#0c1428">
      <rect x={-300} y={-300} width={2600} height={1700} fill="#0c1428" />
      <path d="M -300,800 Q 700,700 1300,780 T 2300,740 L 2300,1400 L -300,1400 Z" fill="#dfe8f6" />
      <Neve f={lf} n={90} />
      {troca < 1 && maoD(1 - troca, "#efc9a8", 0.75)}
      {troca > 0 && maoD(troca, "#d9a07a", 1.15)}
      <rect x={-300} y={-300} width={2600} height={1700} fill="#e8f2ff" opacity={0.08} />
      <rect x={60} y={40} width={1800} height={1000} fill="none" stroke="#5a3a26" strokeWidth={50} />
      {troca > 0.95 && <g opacity={eio(ramp(lf, adulto + 30, adulto + 50))}>
        <Figura fig={LOGAN_CIVIL} pose={{ ...repouso(lf, 1), olhar: [0.3, -0.3] }} x={1500} y={1180} escala={1.0} expr="calmo" />
      </g>}
    </Quadro>
  );
};

// ================================================================ B3 — 1941: manchetes, mapa, Madripoor
export const Guerra1941: React.FC<{ lf: number; dur: number }> = ({ lf, dur }) => (
  <Quadro cam={camEm(lf, [[0, 900, 520, 1.15], [dur, 1100, 560, 1.0]])} fundo="#1e1a16">
    <rect x={-300} y={-300} width={2600} height={1700} fill="#24201c" />
    {/* mapa estilizado */}
    <g transform="translate(980 120)" opacity={0.9}>
      <rect x={0} y={0} width={860} height={700} fill="#cdbf9a" stroke="#4a3a26" strokeWidth={8} />
      <path d="M 120,120 C 220,80 300,140 360,120 C 420,100 480,160 460,240 C 430,320 330,300 260,330 C 180,360 100,280 120,120 Z" fill="#7a2a2a" opacity={0.75} />
      <path d="M 520,380 C 600,360 660,420 720,400 C 780,380 800,470 740,520 C 680,560 600,520 560,500 Z" fill="#8a7a5a" />
      <circle cx={690} cy={560} r={14} fill="#c0282d" />
      <text x={690} y={610} textAnchor="middle" fontFamily="Cinzel" fontWeight={900} fontSize={28} fill="#2a1d12">MADRIPOOR</text>
      <text x={690} y={640} textAnchor="middle" fontFamily="Cinzel" fontWeight={700} fontSize={20} fill="#4a3a26">(ilha fictícia)</text>
      <path d={`M 360,260 Q 600,${300 + 40 * Math.sin(lf * 0.05)} 680,540`} stroke="#2a1d12" strokeWidth={5} strokeDasharray="14 12" fill="none" opacity={clamp01((lf - 40) / 30)} />
    </g>
    {[["GUERRA NA EUROPA", 150, 230, -3], ["1941", 190, 480, 2], ["O MUNDO EM CHAMAS", 130, 730, -1]].map(([t, x, y, r], i) => (
      <g key={i} transform={`translate(${x} ${y}) rotate(${r})`} opacity={clamp01((lf - i * 18) / 10)}>
        <rect x={0} y={0} width={760} height={200} fill="#ece2c8" stroke="#4a3a26" strokeWidth={5} />
        <text x={380} y={i === 1 ? 160 : 130} textAnchor="middle" fontFamily="Anton" fontSize={i === 1 ? 150 : 84} fill="#1e1610">{t}</text>
      </g>
    ))}
  </Quadro>
);

const Cais: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x={-300} y={-300} width={2600} height={1700} fill="#0f1a24" />
    {[[0, 220, 320], [340, 160, 260], [640, 240, 300], [1000, 180, 280], [1320, 230, 340], [1700, 170, 300]].map(([x, y, w], i) => (
      <g key={i}><rect x={x} y={y} width={w} height={560} fill={["#3a2e26", "#2e3a32", "#3e2a2a"][i % 3]} stroke={TINTA} strokeWidth={6} />
        {[0, 1, 2].map((k) => <rect key={k} x={x + 30 + k * (w / 3.4)} y={y + 60} width={50} height={80} fill="#ffcf7a" opacity={rnd(`cw${i}${k}`) > 0.4 ? 0.7 : 0.1} />)}
        <rect x={x} y={y + 200} width={w} height={30} fill="#7a2a2a" /></g>
    ))}
    <rect x={-300} y={780} width={2600} height={600} fill="#2a2420" />
    {Array.from({ length: 22 }, (_, i) => <line key={i} x1={-300 + i * 120} y1={780} x2={-300 + i * 120} y2={1400} stroke="#1a1410" strokeWidth={5} />)}
    {[300, 900, 1500].map((x, i) => <g key={i}><rect x={x} y={500} width={14} height={280} fill="#1a1410" /><ellipse cx={x + 7} cy={500} rx={120} ry={60} fill="#ffcf7a" opacity={0.18} /><circle cx={x + 7} cy={500} r={12} fill="#ffe7a8" /></g>)}
    {[[200, 880, 120], [1100, 950, 180]].map(([x, y, r], i) => <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.15} fill="#ffcf7a" opacity={0.15} />)}
  </g>
);
export const Madripoor: React.FC<{ lf: number; dur: number; escudo: number; resgate: number; viuva: number }> = ({ lf, dur, escudo, resgate, viuva }) => {
  if (lf < escudo + 30) {
    // a câmera acompanha as botas e abre para revelar o escudo
    const abre = eio(ramp(lf, escudo - 10, escudo + 26));
    const lx = 300 + lf * 3.2;
    return (
      <Quadro cam={{ z: lerp(2.6, 1.05, abre), cx: lerp(lx + 30, 1000, abre), cy: lerp(930, 600, abre) }} fundo="#0f1a24">
        <Cais f={lf} />
        <Figura fig={CAPITAO} pose={{ ...repouso(lf, 3), bracoE: [40, 90], frenteE: true }} x={1360} y={960} escala={0.95} dir={-1} expr="neutro" escudo={1} />
        <Figura fig={LOGAN_1941} pose={{ ...corrida(lf, 0.22), tronco: 4, bracoE: [20, 40], bracoD: [20, 40] }} x={lx} y={960} escala={0.95} expr="neutro" />
        <Garoa f={lf} />
      </Quadro>
    );
  }
  const l = lf - (escudo + 30);
  const fogo = (x: number, y: number, s: number) => <g transform={`translate(${x} ${y}) scale(${s})`}>{[0, 1, 2].map((k) => <path key={k} d={`M ${-40 + k * 40},0 C ${-60 + k * 40},${-80 - 20 * Math.sin(lf * 0.3 + k)} ${k * 40},${-120 - 30 * Math.sin(lf * 0.25 + k)} ${-20 + k * 40},${-170 - 20 * Math.sin(lf * 0.2 + k)} C ${30 + k * 40},-80 ${20 + k * 40},-40 ${k * 40},0 Z`} fill={["#ff8a2a", "#ffcf4a", "#ff5a2a"][k]} opacity={0.85} />)}</g>;
  const sai = eio(ramp(lf, resgate, resgate + 70));
  const sombra = eio(ramp(lf, viuva - 4, viuva + 20));
  return (
    <Quadro cam={camEm(l, [[0, 960, 600, 1.1], [Math.max(1, viuva - escudo - 30), 900, 620, 1.2], [dur, 820, 600, 1.35]])} fundo="#0f1a24">
      <Cais f={lf} />
      {fogo(1500, 800, 1.4)}{fogo(1700, 800, 1.1)}
      <rect x={1380} y={640} width={260} height={160} fill="#5a4030" stroke={TINTA} strokeWidth={6} />
      {/* sombra na parede: a futura Viúva Negra */}
      <g opacity={sombra * 0.8}>
        <path d="M 520,320 C 470,330 460,420 500,450 L 470,560 L 520,620 L 500,780 L 560,780 L 580,640 L 600,780 L 660,780 L 640,620 L 690,560 L 660,450 C 700,420 690,330 640,320 C 620,280 540,280 520,320 Z" fill="#0a0a10" />
        <path d="M 565,520 L 595,520 L 580,545 Z M 565,570 L 595,570 L 580,545 Z" fill="#c0282d" />
      </g>
      <Figura fig={NATASHA} pose={{ ...corrida(lf, 0.3), tronco: 10, bracoD: [70, 30], frenteD: true }} x={lerp(1150, 620, sai)} y={960} escala={0.95} dir={-1} expr={sombra > 0.3 ? "neutro" : "susto"} />
      <Figura fig={LOGAN_1941} pose={{ ...corrida(lf, 0.3), tronco: 10, bracoE: [80, 20], frenteE: true }} x={lerp(1330, 840, sai)} y={960} escala={0.95} dir={-1} expr="bravo" />
      <Figura fig={CAPITAO} pose={{ ...guarda(lf), bracoE: [80, 70], frenteE: true }} x={1470} y={960} escala={0.95} dir={1} expr="bravo" escudo={1} />
      <Garoa f={lf} />
    </Quadro>
  );
};

// ================================================================ B4 — Arma X (laboratório, radiografia) e Magneto
const Radiografia: React.FC<{ metal: number; f: number }> = ({ metal, f }) => (
  <g>
    <rect x={560} y={140} width={800} height={760} rx={20} fill="#0a1a22" stroke="#5ad0ff" strokeWidth={6} />
    {Array.from({ length: 12 }, (_, i) => <line key={i} x1={560} y1={140 + i * 64} x2={1360} y2={140 + i * 64} stroke="#5ad0ff" strokeOpacity={0.08} strokeWidth={2} />)}
    <g transform="translate(960 900)">
      {/* braço e mão em raio-x */}
      <path d="M -120,0 L -90,-420 C -80,-480 80,-480 90,-420 L 120,0 Z" fill="#5ad0ff" opacity={0.12} />
      {[[-40, -40, -30, -360], [40, -40, 30, -360]].map(([x1, y1, x2, y2], i) => (
        <g key={i}>
          <path d={`M ${x1},${y1} L ${x2},${y2}`} stroke="#e8f4ff" strokeWidth={30} strokeLinecap="round" opacity={0.85} />
          <path d={`M ${x1},${y1} L ${x2},${y2}`} stroke="#b8c4d4" strokeWidth={34 * metal} strokeLinecap="round" opacity={0.95 * metal} />
        </g>
      ))}
      {[-26, 0, 26].map((x, i) => <g key={i}>
        <path d={`M ${x},-380 L ${x * 1.2},-${600 + (i === 1 ? 20 : 0)}`} stroke="#e8f4ff" strokeWidth={14} strokeLinecap="round" opacity={0.9} />
        <path d={`M ${x},-380 L ${x * 1.2},-${600 + (i === 1 ? 20 : 0)}`} stroke="#c9d6e6" strokeWidth={18 * metal} strokeLinecap="round" opacity={metal} />
      </g>)}
    </g>
    <rect x={560} y={140 + ((f * 6) % 760)} width={800} height={6} fill="#5ad0ff" opacity={0.35} />
    <text x={600} y={190} fontFamily="Montserrat" fontWeight={800} fontSize={26} fill="#5ad0ff">{metal < 0.5 ? "ESQUELETO · OSSO" : "REVESTIMENTO · ADAMANTIUM"}</text>
  </g>
);
export const ArmaX: React.FC<{ lf: number; dur: number; metalEm: number; memoria: number }> = ({ lf, dur, metalEm, memoria }) => {
  const metal = eio(ramp(lf, metalEm, metalEm + 30));
  const glitch = lf >= memoria ? Math.max(0, Math.sin(lf * 1.7)) * (1 - clamp01((lf - memoria) / 120)) : 0;
  return (
    <Quadro cam={camEm(lf, [[0, 960, 520, 1.2], [dur, 960, 540, 1.02]])} fundo="#071018">
      <rect x={-300} y={-300} width={2600} height={1700} fill="#0b161e" />
      {[200, 760, 1320].map((x, i) => <g key={i}><rect x={x} y={-40} width={400} height={30} fill="#d8f4ff" opacity={0.6} /><path d={`M ${x},-10 L ${x - 120},1100 L ${x + 520},1100 L ${x + 400},-10 Z`} fill="#bfefff" opacity={0.05} /></g>)}
      <Radiografia metal={metal} f={lf} />
      {/* vidro embaçado na frente */}
      <rect x={-300} y={-300} width={2600} height={1700} fill="#cfe8f0" opacity={0.08} />
      {Array.from({ length: 30 }, (_, i) => <circle key={i} cx={rnd(`vx${i}`) * 1920} cy={rnd(`vy${i}`) * 1080} r={6 + rnd(`vr${i}`) * 14} fill="#e8f6ff" opacity={0.12} />)}
      {glitch > 0.6 && Array.from({ length: 5 }, (_, i) => <rect key={i} x={rnd(`gl${i}${Math.floor(lf / 3)}`) * 1500} y={rnd(`gm${i}${Math.floor(lf / 3)}`) * 1000} width={300} height={40} fill={i % 2 ? "#ff3b5c" : "#5ad0ff"} opacity={0.35} />)}
    </Quadro>
  );
};
export const Magneto: React.FC<{ lf: number; dur: number; quase: number; osso: number }> = ({ lf, dur, quase, osso }) => {
  if (lf >= osso) {
    // garras de osso em primeiro plano, mesmo sem adamantium
    const l = lf - osso, ext = eout(ramp(l, 4, 16));
    return (
      <Quadro cam={{ z: lerp(1.0, 1.16, eio(clamp01(l / 150))), cx: 960 + Math.sin(l * 0.05) * 14, cy: 540 + l * 0.25, r: Math.sin(l * 0.04) * 1.2 }} fundo="#1a0e14">
        <rect x={-300} y={-300} width={2600} height={1700} fill="#24121a" />
        <circle cx={960} cy={540} r={480 + 50 * Math.sin(l * 0.12)} fill="#5a2a3a" opacity={0.5} />
        {Array.from({ length: 18 }, (_, i) => <circle key={i} cx={(rnd(`po${i}`) * 1920 + l * (1 + i % 3)) % 1920} cy={(rnd(`pp${i}`) * 1080 - l * 1.5 + 1080) % 1080} r={3 + rnd(`pq${i}`) * 4} fill="#ffd9c0" opacity={0.25} />)}
        <g transform={`translate(${960 + Math.sin(l * 0.6) * 2} ${1160 + Math.sin(l * 0.8) * 2}) scale(3.2)`}>
          <circle cx={0} cy={0} r={34} fill="#d9a07a" stroke={TINTA} strokeWidth={4} />
          <GarrasDesenho E={[0, 120]} M={[0, -10]} tipo="osso" ext={ext} escala={1} />
        </g>
      </Quadro>
    );
  }
  const arranca = eio(ramp(lf, 20, quase - 10));
  const caido = eio(ramp(lf, quase - 6, quase + 20));
  const poseL: Pose = poseChaves(lf, [[0, { ...guarda(lf), bracoE: [60, 40], bracoD: [70, 40] }], [Math.max(1, quase - 6), { bracoE: [110, 20], bracoD: [110, 20], pernaE: [20, 10], pernaD: [10, 10], tronco: -20, cabecaIncl: -20, bob: -30 }], [quase + 20, { bracoE: [30, 30], bracoD: [30, 30], pernaE: [40, 90], pernaD: [30, 90], tronco: 40, agachar: 150, cabecaIncl: 20 }]]);
  return (
    <Quadro cam={camEm(lf, [[0, 960, 540, 1.0], [quase, 1000, 560, 1.15], [dur, 1000, 600, 1.25]])} fundo="#2a0e30">
      <defs><radialGradient id="mgf" cx="0.5" cy="0.5" r="0.6"><stop offset="0" stopColor="#ff5aa8" /><stop offset="1" stopColor="#2a0e30" /></radialGradient></defs>
      <rect x={-300} y={-300} width={2600} height={1700} fill="url(#mgf)" opacity={0.6} />
      {Array.from({ length: 12 }, (_, i) => <ellipse key={i} cx={1300} cy={420} rx={120 + i * 90} ry={60 + i * 45} fill="none" stroke="#ffb0e0" strokeOpacity={0.12} strokeWidth={4} transform={`rotate(${lf * 0.5 + i * 8} 1300 420)`} />)}
      <Figura fig={MAGNETO} pose={{ ...repouso(lf, 5), bracoD: [150, 10], frenteD: true, bob: -60 }} x={1450} y={760} escala={0.95} dir={-1} expr="bravo" capa={[Math.sin(lf * 0.1) * 30, 0]} />
      <Figura fig={WOLV} pose={poseL} x={620} y={960} escala={1.0} expr={caido > 0.3 ? "fechado" : "dor"} garras={arranca < 0.9 ? "metal" : null} />
      {/* tiras de metal saindo em direção ao Magneto (estilizado, sem ferimentos) */}
      {Array.from({ length: 10 }, (_, i) => {
        const t = clamp01(arranca * 1.3 - i * 0.04), x0 = 620 + rnd(`mx${i}`) * 80 - 40, y0 = 560 + rnd(`my${i}`) * 300;
        const x1 = lerp(x0, 1380 + rnd(`mz${i}`) * 120, t), y1 = lerp(y0, 300 + rnd(`mw${i}`) * 160, t);
        return t > 0 && t < 1 ? <path key={i} d={`M ${x0},${y0} Q ${(x0 + x1) / 2},${Math.min(y0, y1) - 140} ${x1},${y1}`} stroke="#d9e2ee" strokeWidth={10} fill="none" strokeLinecap="round" opacity={1 - t * 0.6} /> : null;
      })}
      <rect x={-300} y={-300} width={2600} height={1700} fill="#000" opacity={0.45 * caido} />
    </Quadro>
  );
};

// ================================================================ B5 — Hulk, X-Men, Balsa, Novos Vingadores
export const Hulk: React.FC<{ lf: number; dur: number }> = ({ lf, dur }) => (
  <Quadro cam={camEm(lf, [[0, 960, 560, 1.0], [dur, 980, 560, 1.12]])} fundo="#0e1a14">
    <rect x={-300} y={-300} width={2600} height={1700} fill="#1a3024" />
    {Array.from({ length: 16 }, (_, i) => <path key={i} d={`M ${-200 + i * 150},1000 l 70,-${520 + (i % 4) * 90} l 70,${520 + (i % 4) * 90} Z`} fill={i % 2 ? "#0f2218" : "#132a1e"} />)}
    <rect x={-300} y={960} width={2600} height={400} fill="#1a1a12" />
    {/* silhueta do Hulk entre as árvores */}
    <g transform={`translate(1400 980) scale(${1 + 0.02 * Math.sin(lf * 0.1)})`}>
      <path d="M -260,0 L -230,-300 C -330,-340 -360,-480 -280,-540 C -220,-600 -120,-560 -90,-620 C -60,-700 60,-700 90,-620 C 120,-560 220,-600 280,-540 C 360,-480 330,-340 230,-300 L 260,0 L 120,0 L 80,-200 L -80,-200 L -120,0 Z" fill="#0a140e" />
      <ellipse cx={-30} cy={-650} rx={10} ry={5} fill="#c8ff6a" opacity={0.8} /><ellipse cx={30} cy={-650} rx={10} ry={5} fill="#c8ff6a" opacity={0.8} />
    </g>
    <Figura fig={WOLV} pose={guarda(lf)} x={560} y={980} escala={1.0} expr="bravo" garras="metal" />
  </Quadro>
);
export const XMen: React.FC<{ lf: number; dur: number }> = ({ lf, dur }) => (
  <Quadro cam={camEm(lf, [[0, 960, 540, 1.15], [dur, 960, 540, 1.0]])} fundo="#1a1a2a">
    <rect x={-300} y={-300} width={2600} height={1700} fill="#20223a" />
    <g transform={`translate(1300 480) rotate(${lf * 0.4})`} opacity={0.9}>
      <circle r={300} fill="#f2c418" stroke={TINTA} strokeWidth={14} /><circle r={250} fill="#20223a" />
      <path d="M -170,-170 L 170,170 M 170,-170 L -170,170" stroke="#c0282d" strokeWidth={70} strokeLinecap="round" />
    </g>
    <Figura fig={WOLV} pose={{ ...repouso(lf, 2), bracoE: [30, 40], bracoD: [30, 40] }} x={560} y={1000} escala={1.0} expr="neutro" garras="metal" />
  </Quadro>
);
export const Balsa: React.FC<{ lf: number; dur: number }> = ({ lf, dur }) => (
  <Quadro cam={camEm(lf, [[0, 960, 540, 1.0], [dur, 1040, 520, 1.15]])} fundo="#0a0c18">
    <rect x={-300} y={-300} width={2600} height={1700} fill="#0a0c18" />
    <rect x={-300} y={760} width={2600} height={600} fill="#0c1a2a" />
    <g transform="translate(1100 420)">
      <rect x={-300} y={0} width={600} height={340} fill="#2a2f3a" stroke={TINTA} strokeWidth={8} />
      <rect x={-200} y={-160} width={400} height={160} fill="#333a48" stroke={TINTA} strokeWidth={8} />
      {Array.from({ length: 8 }, (_, i) => <rect key={i} x={-260 + i * 66} y={60} width={40} height={60} fill={Math.floor(lf / 8) % 2 ? "#ff3b3b" : "#5a1010"} />)}
      <text x={0} y={-60} textAnchor="middle" fontFamily="Anton" fontSize={70} fill="#c9d0dc">A BALSA</text>
    </g>
    {Array.from({ length: 3 }, (_, i) => <path key={i} d={`M 1100,300 L ${600 + i * 500},${1100}`} stroke="#ff3b3b" strokeWidth={60} opacity={0.08 + 0.06 * Math.sin(lf * 0.3 + i)} />)}
    {Array.from({ length: 9 }, (_, i) => <g key={i} transform={`translate(${900 + ((i * 140 + lf * (4 + i % 3)) % 1100) - 600} ${780 + (i % 3) * 30})`}><path d="M -20,0 L -12,-80 C -30,-90 -30,-130 0,-134 C 30,-130 30,-90 12,-80 L 20,0 Z" fill="#05060c" /></g>)}
  </Quadro>
);
export const NovosVingadores: React.FC<{ lf: number; dur: number; equipe: number }> = ({ lf, dur, equipe }) => {
  const faixa = (i: number, cor: string, simbolo: React.ReactNode) => {
    const e = eout(ramp(lf, i * 8, i * 8 + 16));
    return <g key={i} transform={`translate(${lerp(-700, 0, e)} 0)`}><rect x={-100 + i * 640} y={-50} width={700} height={1200} fill={cor} transform={`skewX(-8)`} stroke={TINTA} strokeWidth={10} />{simbolo}</g>;
  };
  const ve = eio(ramp(lf, equipe, equipe + 24));
  return (
    <Quadro cam={camEm(lf, [[0, 960, 540, 1.0], [dur, 960, 540, 1.08]])} fundo="#101010">
      {faixa(0, "#2c4e9e", <g transform="translate(200 420)">{[110, 86, 62, 38].map((r, k) => <circle key={r} r={r} fill={["#c0282d", "#f4f1ea", "#c0282d", "#2c4e9e"][k]} stroke={TINTA} strokeWidth={k === 0 ? 8 : 0} />)}</g>)}
      {faixa(1, "#a8202a", <g transform="translate(860 420)"><path d="M -90,-120 L 90,-120 L 110,40 L 0,140 L -110,40 Z" fill="#f2c418" stroke={TINTA} strokeWidth={8} /><rect x={-60} y={-50} width={44} height={14} fill="#bff4ff" /><rect x={16} y={-50} width={44} height={14} fill="#bff4ff" /></g>)}
      {faixa(2, "#d0202c", <g transform="translate(1500 420)" stroke="#111" strokeWidth={5} fill="none">{Array.from({ length: 8 }, (_, k) => <line key={k} x1={0} y1={0} x2={Math.cos(k * Math.PI / 4) * 150} y2={Math.sin(k * Math.PI / 4) * 150} />)}{[50, 100, 150].map((r) => <circle key={r} r={r} />)}</g>)}
      <g opacity={ve} transform={`translate(0 ${lerp(60, 0, ve)})`}>
        <rect x={-300} y={700} width={2600} height={500} fill="#101010" opacity={0.7} />
        <Figura fig={WOLV} pose={{ ...guarda(lf), agachar: 40 }} x={960} y={1080} escala={1.05} expr="bravo" garras="metal" />
      </g>
    </Quadro>
  );
};

// ================================================================ B6 — morte e retorno
export const Morte: React.FC<{ lf: number; dur: number; endurece: number; morreu: number; olho: number }> = ({ lf, dur, endurece, morreu, olho }) => {
  if (lf >= olho) {
    const l = lf - olho, abre = eio(ramp(l, 10, 70));
    return (
      <Quadro cam={{ z: lerp(1.25, 1.05, l / 160), cx: 960, cy: 540 }} fundo="#0a0806">
        <rect x={-300} y={-300} width={2600} height={1700} fill="#120c08" />
        <g transform="translate(960 560)">
          <path d="M -560,0 C -300,-260 300,-260 560,0 C 300,260 -300,260 -560,0 Z" fill="#d9a07a" stroke={TINTA} strokeWidth={10} />
          <clipPath id="olhoclip"><path d={`M -420,0 C -200,${-170 * abre} 200,${-170 * abre} 420,0 C 200,${170 * abre} -200,${170 * abre} -420,0 Z`} /></clipPath>
          <g clipPath="url(#olhoclip)"><rect x={-430} y={-200} width={860} height={400} fill="#f4efe6" /><circle r={120} fill="#4a3220" /><circle r={56} fill="#0a0806" /><circle cx={-36} cy={-40} r={22} fill="#fff" /></g>
          <path d={`M -420,0 C -200,${-170 * abre} 200,${-170 * abre} 420,0`} fill="none" stroke={TINTA} strokeWidth={14} />
          <path d="M -460,-150 C -200,-330 200,-330 460,-170" fill="none" stroke="#17110e" strokeWidth={40} strokeLinecap="round" />
        </g>
      </Quadro>
    );
  }
  const cobre = eio(ramp(lf, 30, endurece));
  const imovel = lf >= endurece;
  const pose: Pose = imovel ? { bracoE: [100, 20], bracoD: [100, 20], pernaE: [20, 20], pernaD: [14, 18], agachar: 30, tronco: 6, frenteE: false, frenteD: false } : { bracoE: [100, 20], bracoD: [100, 20], pernaE: [20, 20], pernaD: [14, 18], agachar: 30, tronco: 6 + Math.sin(lf * 0.2) * 2, respirar: lf * 0.3 };
  const pessoas = Array.from({ length: 4 }, (_, i) => {
    const t = clamp01((lf - i * 18) / 90);
    return { x: lerp(980, 1900 + i * 80, t), o: t < 1 ? 1 : 0 };
  });
  const silencio = lf >= morreu;
  return (
    <Quadro cam={camEm(lf, [[0, 960, 560, 1.0], [endurece, 900, 540, 1.15], [dur, 880, 540, 1.35]])} fundo="#101418">
      <rect x={-300} y={-300} width={2600} height={1700} fill="#1a2028" />
      {/* passagem de laboratório: Logan segura a porta aberta para as pessoas saírem */}
      <rect x={760} y={240} width={320} height={740} fill="#ffe7b0" opacity={silencio ? 0.25 : 0.7} />
      <rect x={-300} y={980} width={2600} height={400} fill="#0e1218" />
      {pessoas.map((p, i) => <g key={i} transform={`translate(${p.x} 980)`} opacity={p.o}><path d="M -26,0 L -16,-110 C -40,-124 -40,-170 0,-176 C 40,-170 40,-124 16,-110 L 26,0 Z" fill="#05070a" /></g>)}
      {/* jatos de metal líquido (estilizado) */}
      {!imovel && Array.from({ length: 6 }, (_, i) => <path key={i} d={`M ${300 + i * 60},-40 Q ${600 + i * 30},${300 + 30 * Math.sin(lf * 0.3 + i)} ${830 + i * 18},${420 + i * 50}`} stroke="#c9d6e6" strokeWidth={18} fill="none" opacity={0.6 * clamp01(lf / 30)} strokeLinecap="round" />)}
      <Figura fig={WOLV} pose={pose} x={920} y={980} escala={1.05} expr={imovel ? "fechado" : "dor"} garras={null} />
      {/* camada metálica cobrindo a figura */}
      <g opacity={cobre}><Figura fig={WOLV} pose={pose} x={920} y={980} escala={1.05} expr="fechado" sil="#b8c6d8" /></g>
      {imovel && <g opacity={0.6}>{[0, 1, 2].map((k) => <path key={k} d={`M ${800 + k * 70},${380 + k * 120} l 40,-30`} stroke="#ffffff" strokeWidth={8} strokeLinecap="round" />)}</g>}
      <rect x={-300} y={-300} width={2600} height={1700} fill="#000" opacity={silencio ? 0.35 : 0} />
    </Quadro>
  );
};

// ================================================================ B7 — São Paulo, 2026
export const SaoPaulo: React.FC<{ lf: number; dur: number }> = ({ lf, dur }) => (
  <Quadro cam={camEm(lf, [[0, 960, 520, 1.15], [dur, 960, 560, 1.0]])} fundo="#0b0f24">
    <rect x={-300} y={-300} width={2600} height={1700} fill="#0d1230" />
    {Array.from({ length: 16 }, (_, i) => { const h = 380 + ((i * 137) % 420); return <g key={i}><rect x={-200 + i * 150} y={900 - h} width={130} height={h + 400} fill={i % 2 ? "#161c40" : "#1b2250"} />{Array.from({ length: Math.floor(h / 50) * 2 }, (_, k) => <rect key={k} x={-185 + i * 150 + (k % 2) * 60} y={900 - h + 20 + Math.floor(k / 2) * 50} width={36} height={22} fill="#ffd27a" opacity={rnd(`sp${i}${k}`) > 0.5 ? 0.75 : 0.08} />)}</g>; })}
    {/* torre de antenas */}
    <path d="M 1240,900 L 1270,240 L 1300,900 Z" fill="#1b2250" /><circle cx={1270} cy={240} r={8} fill="#ff3b3b" opacity={0.5 + 0.5 * Math.sin(lf * 0.3)} />
    <rect x={-300} y={900} width={2600} height={400} fill="#0a0c18" />
    {/* celulares filmando de todo lado */}
    {Array.from({ length: 9 }, (_, i) => {
      const x = 120 + i * 210, y = 960 + (i % 2) * 40, e = eout(ramp(lf, 20 + i * 4, 32 + i * 4));
      return <g key={i} transform={`translate(${x} ${y + (1 - e) * 200})`}><path d="M -60,140 L -40,0 L 40,0 L 60,140 Z" fill="#05060c" /><rect x={-26} y={-90} width={52} height={90} rx={8} fill="#11131a" stroke="#2a2f3a" strokeWidth={4} /><rect x={-20} y={-84} width={40} height={78} rx={4} fill="#9ec8ff" opacity={0.6} /><circle cx={-12} cy={-76} r={4} fill="#ff3b3b" /></g>;
    })}
    <Garoa f={lf} op={0.35} />
  </Quadro>
);
export const BecoBloqueio: React.FC<{ lf: number; dur: number }> = ({ lf, dur }) => (
  <Quadro cam={camEm(lf, [[0, 1100, 540, 1.1], [dur, 1180, 520, 1.25]])} fundo="#1a1630">
    <rect x={-300} y={-300} width={2600} height={1700} fill="#33243a" />
    <g transform="translate(1520 820)"><rect x={0} y={-560} width={300} height={560} fill="#5d6474" stroke={TINTA} strokeWidth={8} />{Array.from({ length: 13 }, (_, i) => <line key={i} x1={0} y1={-540 + i * 42} x2={300} y2={-540 + i * 42} stroke="#3a404d" strokeWidth={8} />)}</g>
    <rect x={-300} y={820} width={2600} height={600} fill="#121320" />
    {/* só a sombra e a mochila do entregador aparecem: ele ainda está fora do plano */}
    <path d="M 1500,820 L 1700,820 L 1760,700 L 1560,700 Z" fill="#000" opacity={0.35} />
    <rect x={1660} y={360} width={120} height={130} rx={12} fill="#e8742a" stroke={TINTA} strokeWidth={7} transform={`rotate(${Math.sin(lf * 0.2) * 2} 1720 420)`} />
    <Drone x={1380} y={470 + Math.sin(lf * 0.15) * 10} s={0.8} f={lf} />
    <ellipse cx={1380} cy={520} rx={220} ry={300} fill="#ff3b3b" opacity={0.06 + 0.04 * Math.sin(lf * 0.4)} />
    <Garoa f={lf} />
  </Quadro>
);
export const CelularCai: React.FC<{ lf: number; dur: number; corta: number }> = ({ lf, dur, corta }) => {
  if (lf >= corta) {
    // a gravação corta: estática curta na tela do celular
    const l = lf - corta;
    return (
      <AbsoluteFill style={{ backgroundColor: "#0c0d14" }}>
        <svg width={W} height={H}>
          {Array.from({ length: 60 }, (_, i) => <rect key={i} x={0} y={i * 18} width={W} height={18} fill={`rgb(${Math.floor(rnd(`e${i}${l}`) * 200)},${Math.floor(rnd(`f${i}${l}`) * 200)},${Math.floor(rnd(`g${i}${l}`) * 220)})`} opacity={0.35 + 0.25 * clamp01(1 - l / 10)} />)}
          <text x={W / 2} y={H / 2} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={44} fill="#ffffff" stroke="#000" strokeWidth={6} paintOrder="stroke">■ GRAVAÇÃO INTERROMPIDA</text>
        </svg>
      </AbsoluteFill>
    );
  }
  // ponto de vista do celular caindo, ainda gravando
  const t = clamp01(lf / Math.max(1, corta)), rotz = lerp(0, 160, eio(t)), y = lerp(0, 380, t * t);
  return (
    <AbsoluteFill style={{ backgroundColor: "#0c0d14" }}>
      <AbsoluteFill style={{ transform: `translateY(${y}px) rotate(${rotz}deg) scale(${1 + t * 0.4})` }}><SaltoFrente tau={60 + lf * 0.5} rastros={0} /></AbsoluteFill>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <circle cx={70} cy={70} r={14} fill="#ff3b3b" /><text x={96} y={84} fontFamily="Montserrat" fontWeight={800} fontSize={36} fill="#fff">REC 00:00:{String(14 + Math.floor(lf / 30)).padStart(2, "0")}</text>
        <rect x={20} y={20} width={W - 40} height={H - 40} fill="none" stroke="#ffffff" strokeOpacity={0.5} strokeWidth={4} />
      </svg>
    </AbsoluteFill>
  );
};
export const BecoVazio: React.FC<{ lf: number; dur: number }> = ({ lf, dur }) => <CelularNoChao tau={lf} tela="apagada" />;
