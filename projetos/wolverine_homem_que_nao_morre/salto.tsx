// Sequência do salto (abertura e 2026). Tudo é função do tempo interno da ação τ (quadros):
//  - abertura: τ avança, congela, e volta (reverso com os MESMOS quadros: câmera, chuva, fragmentos, rastros);
//  - 2026: τ repete o começo do salto até o quadro do congelamento e continua pelo ângulo lateral.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Pose } from "../../engine/src/kit/poses";
import { clamp01, eio, eout, lerp, ramp, rnd } from "../../engine/src/kit/anim";
import { Figura, LOGAN_CIVIL, ENTREGADOR, TINTA, esq, poseChaves, corrida, guarda } from "./elenco";

export const T_CONGELA = 210; // τ do ponto mais próximo da lente
export const T_GOLPE = 92; // τ em que atravessa o primeiro drone
const W = 1920, H = 1080;

// ---------------------------------------------------------------- drone
export const Drone: React.FC<{ x: number; y: number; s: number; f: number; partido?: number; luz?: string }> = ({ x, y, s, f, partido = 0, luz = "#ff3b3b" }) => {
  const helice = (dx: number) => <ellipse cx={dx} cy={-34} rx={46} ry={6 + 4 * Math.abs(Math.sin(f * 1.7 + dx))} fill="#cfd6e0" opacity={0.55} />;
  const metade = (lado: number) => (
    <g transform={`translate(${lado * partido * 90} ${partido * partido * 120}) rotate(${lado * partido * 35})`}>
      <clipPath id={`dr${lado}${Math.round(x)}`}><rect x={lado < 0 ? -200 : 0} y={-200} width={200} height={400} /></clipPath>
      <g clipPath={`url(#dr${lado}${Math.round(x)})`}>
        <rect x={-110} y={-36} width={220} height={14} rx={7} fill="#2a2f3a" stroke={TINTA} strokeWidth={5} />
        {[-100, 100].map((d) => <rect key={d} x={d - 5} y={-40} width={10} height={16} fill="#2a2f3a" />)}
        {[-100, 100].map(helice)}
        <path d="M -62,-24 L 62,-24 L 46,22 L -46,22 Z" fill="#3a404d" stroke={TINTA} strokeWidth={6} />
        <circle cx={0} cy={2} r={15} fill={luz} stroke={TINTA} strokeWidth={4} />
        <circle cx={0} cy={2} r={34} fill={luz} opacity={0.25 + 0.15 * Math.sin(f * 0.5)} />
      </g>
    </g>
  );
  return <g transform={`translate(${x} ${y}) scale(${s})`}>{metade(-1)}{metade(1)}</g>;
};

// ---------------------------------------------------------------- beco (vista frontal, profundidade até o fundo)
const BecoFrente: React.FC<{ tau: number }> = ({ tau }) => (
  <g>
    <defs>
      <linearGradient id="bfceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0b0f24" /><stop offset="1" stopColor="#2a2350" /></linearGradient>
      <linearGradient id="bfchao" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1b1d2c" /><stop offset="1" stopColor="#0c0d14" /></linearGradient>
    </defs>
    <rect x={-400} y={-300} width={2700} height={1700} fill="url(#bfceu)" />
    {/* prédios do fundo e fios */}
    {[[700, 180, 260], [860, 120, 200], [1040, 220, 180]].map(([x, y, w], i) => <rect key={i} x={x} y={y} width={w} height={600} fill="#161a33" />)}
    <path d="M 600,260 Q 960,340 1320,240" stroke="#05060c" strokeWidth={4} fill="none" />
    {/* paredes laterais em perspectiva */}
    <path d="M -400,-300 L 760,330 L 760,760 L -400,1400 Z" fill="#3a2430" />
    <path d="M 2320,-300 L 1160,330 L 1160,760 L 2320,1400 Z" fill="#2c2238" />
    {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M ${-400 + i * 130},${-300 + i * 70} L ${-400 + i * 130},${1400 - i * 72}`} stroke="#000" strokeOpacity={0.25} strokeWidth={4} />)}
    {/* letreiro neon */}
    <g transform="translate(330 300) skewY(28)">
      <rect x={0} y={0} width={200} height={70} rx={10} fill="#140c18" stroke="#ff4fa8" strokeWidth={6} opacity={0.9} />
      <text x={100} y={50} textAnchor="middle" fontFamily="Anton" fontSize={44} fill="#ff8fd0">LANCHES</text>
    </g>
    <ellipse cx={430} cy={340} rx={260} ry={140} fill="#ff4fa8" opacity={0.12} />
    <rect x={1500} y={380} width={20} height={500} fill="#11121a" />
    <ellipse cx={1510} cy={380} rx={160} ry={90} fill="#9ec8ff" opacity={0.16} />
    {/* chão molhado */}
    <path d="M -400,1400 L 760,760 L 1160,760 L 2320,1400 Z" fill="url(#bfchao)" />
    {[[860, 840, 90], [1100, 920, 150], [700, 980, 220]].map(([x, y, r], i) => <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.18} fill="#ff4fa8" opacity={0.10 + 0.04 * Math.sin(tau * 0.2 + i)} />)}
  </g>
);

export const Chuva: React.FC<{ tau: number; n?: number; area?: [number, number, number, number]; op?: number }> = ({ tau, n = 120, area = [-200, -200, 2400, 1500], op = 0.5 }) => {
  const [x0, y0, w, h] = area;
  return (
    <g stroke="#bcd2ff" strokeWidth={3} strokeLinecap="round" opacity={op}>
      {Array.from({ length: n }, (_, i) => {
        const r1 = rnd(`cx${i}`), r2 = rnd(`cy${i}`), v = 34 + r2 * 20;
        const x = x0 + r1 * w + tau * 4, y = y0 + ((r2 * h + tau * v) % h);
        return <line key={i} x1={x % (x0 + w)} y1={y} x2={(x % (x0 + w)) - 10} y2={y - 46} opacity={0.4 + 0.6 * r1} />;
      })}
    </g>
  );
};

// ---------------------------------------------------------------- Logan na vista frontal, em função de τ
type Estado = { x: number; y: number; s: number; pose: Pose };
const loganFrente = (tau: number): Estado => {
  // corre do fundo (pequeno) para a frente; golpe no drone em T_GOLPE; agacha; salta contra a câmera
  const corre = clamp01(tau / 150);
  const z = lerp(0.42, 0.95, eio(corre));
  const salto = eio(ramp(tau, 160, T_CONGELA));
  const s = lerp(z, 3.4, Math.pow(salto, 1.6));
  const x = lerp(960, 1000, corre) + Math.pow(salto, 1.6) * 520; // no fim do salto a mão com as garras fica no centro da lente
  const y = lerp(760, 1000, eio(corre)) + salto * 620;
  const golpe = ramp(tau, T_GOLPE - 10, T_GOLPE + 10);
  const pose = poseChaves(tau, [
    [0, { ...corrida(tau), tronco: 18 }],
    [T_GOLPE - 12, { ...corrida(tau), bracoD: [150, 30], frenteD: true, tronco: 10 }],
    [T_GOLPE + 4, { ...corrida(tau), bracoD: [60, 10], bracoE: [120, 30], frenteD: true, frenteE: true, tronco: 24 }],
    [140, { ...corrida(tau), tronco: 16 }],
    [158, { ...guarda(tau), agachar: 70, tronco: 26, bracoD: [30, 120], bracoE: [30, 120] }],
    [185, { bracoD: [120, 20], bracoE: [70, 60], frenteD: true, pernaE: [40, 90], pernaD: [-10, 70], tronco: -10, bob: 0 }],
    [T_CONGELA, { bracoD: [168, 6], bracoE: [60, 80], frenteD: true, pernaE: [50, 100], pernaD: [10, 90], tronco: -18, cabecaIncl: -6 }],
  ], { cabecaIncl: golpe > 0 && golpe < 1 ? -8 : 0 });
  return { x, y, s, pose };
};

/** pontas das 3 garras da mão direita em coordenadas do mundo (para os rastros de luz) */
const pontasGarras = (e: Estado): [number, number][] => {
  const k = esq(LOGAN_CIVIL.prop, e.pose);
  const { E, M } = k.bD;
  const d = [M[0] - E[0], M[1] - E[1]], n = Math.hypot(d[0], d[1]) || 1, u = [d[0] / n, d[1] / n], nn = [-u[1], u[0]];
  return [-1, 0, 1].map((j) => [e.x + e.s * (M[0] + u[0] * 112 + nn[0] * j * 13), e.y + e.s * (M[1] + u[1] * 112 + nn[1] * j * 13)]);
};

export const camFrente = (tau: number) => {
  const recua = eio(ramp(tau, 165, T_CONGELA));
  return { z: lerp(1.14, 1.0, recua), cx: lerp(960, 980, recua), cy: lerp(560, 600, recua), r: Math.sin(tau * 0.05) * 0.6 };
};

/** Quadro da ação vista de frente, para o τ pedido (o mesmo τ sempre dá a mesma imagem). */
export const SaltoFrente: React.FC<{ tau: number; reflexo?: boolean; rastros?: number }> = ({ tau, rastros = 1 }) => {
  const e = loganFrente(tau);
  const c = camFrente(tau);
  const partido = clamp01((tau - T_GOLPE) / 26);
  const trilhas = Array.from({ length: 9 }, (_, k) => pontasGarras(loganFrente(Math.max(0, tau - k * 1.5))));
  const fragmentos = tau > T_GOLPE ? Array.from({ length: 14 }, (_, i) => {
    const t = (tau - T_GOLPE) / 30, a = rnd(`fa${i}`) * Math.PI * 2, v = 120 + rnd(`fv${i}`) * 260;
    return { x: 900 + Math.cos(a) * v * t, y: 560 + Math.sin(a) * v * t + 200 * t * t, r: rnd(`fr${i}`) * 360 * t };
  }) : [];
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
      <g transform={`translate(${W / 2} ${H / 2}) rotate(${c.r}) scale(${c.z}) translate(${-c.cx} ${-c.cy})`}>
        <BecoFrente tau={tau} />
        {/* primeiro drone: atravessado no golpe */}
        <Drone x={900} y={lerp(560, 540, ramp(tau, 0, 80))} s={0.62} f={tau} partido={partido} />
        {fragmentos.map((p, i) => <rect key={i} x={p.x} y={p.y} width={14} height={6} fill="#cfd6e0" transform={`rotate(${p.r} ${p.x} ${p.y})`} opacity={1 - clamp01((tau - T_GOLPE) / 90)} />)}
        <Figura fig={LOGAN_CIVIL} pose={e.pose} x={e.x} y={e.y} escala={e.s} expr="bravo" garras="metal" />
        {/* três rastros de luz das garras */}
        {rastros > 0 && tau > 150 && [0, 1, 2].map((j) => <polyline key={j} points={trilhas.map((p) => `${p[j][0]},${p[j][1]}`).join(" ")} fill="none" stroke="#e8f4ff" strokeWidth={10 * e.s * 0.5} strokeLinecap="round" opacity={0.55 * rastros} />)}
        <Chuva tau={tau} />
      </g>
    </svg>
  );
};

// ---------------------------------------------------------------- vista lateral (2026): o salto continua e revela o entregador
export const BecoLado: React.FC<{ tau: number; grade: number }> = ({ tau, grade }) => (
  <g>
    <rect x={-400} y={-300} width={2800} height={1700} fill="#1a1630" />
    <rect x={-400} y={120} width={2800} height={700} fill="#33243a" />
    {Array.from({ length: 14 }, (_, i) => Array.from({ length: 8 }, (_, j) => <rect key={`${i}-${j}`} x={-380 + i * 200 + (j % 2) * 100} y={130 + j * 86} width={190} height={80} fill="#3d2a42" stroke="#22172a" strokeWidth={4} />))}
    <rect x={1150} y={240} width={260} height={130} rx={10} fill="#140c18" stroke="#ff4fa8" strokeWidth={6} />
    <text x={1280} y={325} textAnchor="middle" fontFamily="Anton" fontSize={64} fill="#ff8fd0">LANCHES</text>
    {/* grade de enrolar na saída do beco */}
    <g transform={`translate(1520 820) rotate(${grade * 78}) translate(0 -560)`}>
      <rect x={0} y={0} width={300} height={560} fill="#5d6474" stroke={TINTA} strokeWidth={8} />
      {Array.from({ length: 13 }, (_, i) => <line key={i} x1={0} y1={20 + i * 42} x2={300} y2={20 + i * 42} stroke="#3a404d" strokeWidth={8} />)}
    </g>
    <rect x={-400} y={820} width={2800} height={600} fill="#121320" />
    <rect x={-400} y={816} width={2800} height={10} fill="#ff4fa8" opacity={0.25} />
  </g>
);

export const SaltoLado: React.FC<{ tau: number }> = ({ tau }) => {
  // tau começa em T_CONGELA (mesmo instante do congelamento), agora de lado
  const l = tau - T_CONGELA;
  const voo = eio(ramp(l, 0, 26));
  const lx = lerp(-260, 1080, voo), ly = lerp(560, 820, eio(ramp(l, 10, 30)));
  const corte = ramp(l, 8, 14);
  const puxa = eio(ramp(l, 30, 58));
  const grade = eout(ramp(l, 50, 66)) * 1;
  const pose = poseChaves(l, [
    [0, { bracoD: [168, 6], bracoE: [60, 80], frenteD: true, pernaE: [50, 100], pernaD: [10, 90], tronco: -18 }],
    [12, { bracoD: [70, 10], bracoE: [80, 40], frenteD: true, pernaE: [40, 80], pernaD: [20, 60], tronco: 10 }],
    [30, { ...guarda(l), agachar: 50, bracoD: [40, 90], bracoE: [100, 10], tronco: 14 }],
    [58, { ...guarda(l), agachar: 30, bracoD: [30, 100], bracoE: [70, 60], tronco: -12, dx: -60 }],
  ]);
  const ex = lerp(1460, 1140, puxa), eposeT = puxa;
  const ePose: Pose = { bracoE: [lerp(70, 120, eposeT), 40], bracoD: [lerp(110, 30, eposeT), 60], pernaE: [10, 10], pernaD: [lerp(-10, 30, eposeT), 30], tronco: lerp(-8, 16, eposeT), frenteE: true, agachar: 20 };
  const cam = { z: lerp(1.0, 1.08, ramp(l, 0, 60)), cx: lerp(900, 1100, eio(ramp(l, 0, 50))), cy: 560 };
  const faiscas = l >= 10 ? Array.from({ length: 26 }, (_, i) => {
    const t = (l - 10) / 18, a = -Math.PI / 2 + (rnd(`sa${i}`) - 0.5) * 2.4, v = 200 + rnd(`sv${i}`) * 300;
    return { x: 1330 + Math.cos(a) * v * t, y: 470 + Math.sin(a) * v * t + 380 * t * t, o: 1 - clamp01(t) };
  }) : [];
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
      <g transform={`translate(${W / 2} ${H / 2}) scale(${cam.z}) translate(${-cam.cx} ${-cam.cy})`}>
        <BecoLado tau={tau} grade={grade} />
        <Figura fig={ENTREGADOR} pose={ePose} x={ex} y={820} escala={0.95} dir={-1} expr={puxa > 0.2 ? "susto" : "susto"} />
        <Drone x={1330} y={470 + corte * 10} s={0.8} f={tau} partido={corte} luz={corte > 0.5 ? "#555" : "#ff3b3b"} />
        {faiscas.map((p, i) => <line key={i} x1={p.x} y1={p.y} x2={p.x - 18} y2={p.y - 10} stroke="#ffd36a" strokeWidth={5} opacity={p.o} />)}
        <Figura fig={LOGAN_CIVIL} pose={pose} x={lx} y={ly} escala={1.05} expr="bravo" garras="metal" garrasE={false} />
        <Chuva tau={tau} />
      </g>
    </svg>
  );
};

/** reflexo na tela de um celular caído no chão molhado (abre o vídeo e volta em 2026) */
export const CelularNoChao: React.FC<{ tau: number; tela?: "reflexo" | "gravando" | "apagada"; rec?: string }> = ({ tau, tela = "reflexo", rec = "00:00:14" }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
    <rect width={W} height={H} fill="#0c0d14" />
    {Array.from({ length: 6 }, (_, i) => <ellipse key={i} cx={200 + i * 330} cy={900 + (i % 2) * 60} rx={240} ry={30} fill="#ff4fa8" opacity={0.06} />)}
    <g transform={`translate(960 545) rotate(-8) scale(${tela === "reflexo" ? 1.55 : 1})`}>
      <rect x={-330} y={-170} width={660} height={340} rx={40} fill="#15161c" stroke={TINTA} strokeWidth={10} />
      <clipPath id="celch"><rect x={-310} y={-150} width={620} height={300} rx={26} /></clipPath>
      <g clipPath="url(#celch)">
        <rect x={-310} y={-150} width={620} height={300} fill="#1b1f30" />
        {tela !== "apagada" && (
          <g transform="translate(-310 -150) scale(0.323)" opacity={tela === "reflexo" ? 0.95 : 1}>
            <SaltoFrente tau={tau} />
          </g>
        )}
        {tela === "gravando" && <g><circle cx={-270} cy={-118} r={10} fill="#ff3b3b" /><text x={-250} y={-108} fontFamily="Montserrat" fontWeight={800} fontSize={26} fill="#fff">REC {rec}</text></g>}
        <path d="M -310,-150 L 80,-150 L -120,150 L -310,150 Z" fill="#ffffff" opacity={0.06} />
        {[[-120, -60], [60, 40], [200, -90]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={10 + i * 3} fill="#bcd2ff" opacity={0.35} />)}
      </g>
    </g>
    <Chuva tau={tau} n={60} op={0.35} />
  </svg>
);
