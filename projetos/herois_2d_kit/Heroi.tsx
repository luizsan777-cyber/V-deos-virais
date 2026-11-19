// Kit Heróis 2D: boneco articulado com proporções heroicas e camadas de traje por personagem.
// Usa o MESMO tipo Pose do kit (engine/src/kit/poses.ts) e as mesmas convenções de ângulo do Personagem:
// membro com ângulo 0 = para baixo, + = para fora do corpo; [ombro/quadril, cotovelo/joelho].
// Assim as poses de .claude/skills/herois-2d/scripts/plano.py entram direto, sem conversão.
import React from "react";
import { Pose, misturaPose } from "../../engine/src/kit/poses";
import { eio, clamp01 } from "../../engine/src/kit/anim";

type P = [number, number];
const rad = (g: number) => (g * Math.PI) / 180;
const rot = (v: P, g: number): P => [v[0] * Math.cos(rad(g)) - v[1] * Math.sin(rad(g)), v[0] * Math.sin(rad(g)) + v[1] * Math.cos(rad(g))];
const add = (a: P, b: P): P => [a[0] + b[0], a[1] + b[1]];
const mul = (a: P, k: number): P => [a[0] * k, a[1] * k];
const dirMembro = (s: number, ang: number, incl: number): P => rot([s * Math.sin(rad(ang)), Math.cos(rad(ang))], incl);

// proporções adultas (~7 cabeças), não as do boneco de cartum do canal
const PR = { perna: 330, coxa: 0.5, tronco: 250, ombro: 74, quadril: 30, cab: 58, braco: 132, antebraco: 122 };

export type Traje = "aranha" | "morcego";
export type Esqueleto = ReturnType<typeof esqueleto>;

export const esqueleto = (pose: Pose) => {
  const lean = pose.tronco ?? 0;
  const resp = Math.sin(pose.respirar ?? 0) * 3;
  const Q: P = [pose.dx ?? 0, -PR.perna + (pose.bob ?? 0) + (pose.agachar ?? 0)];
  const N = add(Q, rot([0, -PR.tronco - resp], lean));
  const ombro = (s: number) => add(N, rot([s * PR.ombro, 24], lean));
  const incl = lean + (pose.cabecaIncl ?? 0);
  const C = add(N, rot([0, -PR.cab * 1.02], incl * 0.6));
  const braco = (s: number, a: [number, number]) => {
    const S = ombro(s), d1 = dirMembro(s, a[0], lean);
    const E = add(S, mul(d1, PR.braco));
    const M = add(E, mul(dirMembro(s, a[0] - a[1], lean), PR.antebraco));
    return { S, E, M };
  };
  const perna = (s: number, a: [number, number]) => {
    const H = add(Q, [s * PR.quadril, 6]);
    const c = PR.perna * PR.coxa, cn = PR.perna * (1 - PR.coxa) - 10;
    const J = add(H, mul(dirMembro(s, a[0], 0), c));
    const encurta = 1 - 0.25 * Math.sin(rad(Math.max(0, a[1])));
    const Pe = add(J, mul(dirMembro(s, a[0] - a[1] * 0.4, 0), cn * encurta));
    return { H, J, Pe };
  };
  return { Q, N, C, lean, incl, virar: pose.virar ?? 0, olhar: pose.olhar ?? [0, 0],
    bE: braco(-1, pose.bracoE), bD: braco(1, pose.bracoD), pE: perna(-1, pose.pernaE), pD: perna(1, pose.pernaD) };
};

/** Interpola as poses-chave do planejador ([frame, pose][]) com easing; `extra` soma movimento contínuo. */
export const poseDoPlano = (f: number, chaves: [number, Pose][], extra: Partial<Pose> = {}): Pose => {
  let p = chaves[0][1];
  for (let i = 1; i < chaves.length; i++) {
    const [f0] = chaves[i - 1], [f1, b] = chaves[i];
    if (f >= f1) p = b;
    else if (f > f0) { p = misturaPose(chaves[i - 1][1], b, eio(clamp01((f - f0) / (f1 - f0)))); break; }
  }
  // misturaPose descarta campos opcionais sem par; mantém maoD/frente da chave mais próxima
  return { ...p, ...extra };
};

// ------------------------------------------------------------------ desenho
const linha = (pts: P[]) => pts.map((p, i) => `${i ? "L" : "M"} ${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
const Seg: React.FC<{ a: P; b: P; w: number; cor: string; L: number; tinta: string; sil?: string }> = ({ a, b, w, cor, L, tinta, sil }) => (
  <g>
    {!sil && <path d={linha([a, b])} stroke={tinta} strokeWidth={w + L * 2} strokeLinecap="round" fill="none" />}
    <path d={linha([a, b])} stroke={sil ?? cor} strokeWidth={w} strokeLinecap="round" fill="none" />
  </g>
);

export type Cores = { base: string; detalhe: string; luva: string; bota: string; cinto: string; tinta: string; sombra: string; capa?: string; pele?: string };
export const CORES: Record<Traje, Cores> = {
  // Peter Parker, traje clássico dos quadrinhos: vermelho e azul, teias escuras, lentes brancas, aranha preta no peito
  aranha: { base: "#d7262e", detalhe: "#1f4fb8", luva: "#d7262e", bota: "#d7262e", cinto: "#d7262e", tinta: "#14101c", sombra: "#7a1020" },
  // Batman noir: cinza e preto, emblema de morcego preto fixo, cinto amarelo, capa ampla
  morcego: { base: "#6f7686", detalhe: "#1b1e2b", luva: "#1b1e2b", bota: "#1b1e2b", cinto: "#e8b53a", tinta: "#07080d", sombra: "#3a3f50", capa: "#151826", pele: "#d9a47e" },
};

const Aranha: React.FC<{ s: number; tinta: string }> = ({ s, tinta }) => (
  <g transform={`scale(${s})`} stroke={tinta} strokeLinecap="round" fill="none">
    {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, y], i) => <path key={i} strokeWidth={4} d={`M ${x * 6},${y * 4} l ${x * 14},${y * -10} l ${x * 8},${y * 14} M ${x * 6},${y * 8} l ${x * 16},${y * 2} l ${x * 4},${y * 16}`} />)}
    <ellipse cx={0} cy={-6} rx={7} ry={9} fill={tinta} stroke="none" />
    <ellipse cx={0} cy={10} rx={9} ry={13} fill={tinta} stroke="none" />
  </g>
);
const Morcego: React.FC<{ s: number; cor: string }> = ({ s, cor }) => (
  <path transform={`scale(${s})`} fill={cor} d="M 0,-6 L -6,-16 L -8,-6 C -22,-14 -44,-14 -58,0 C -46,-2 -38,4 -36,12 C -28,4 -18,6 -12,14 C -8,8 -4,6 0,12 C 4,6 8,8 12,14 C 18,6 28,4 36,12 C 38,4 46,-2 58,0 C 44,-14 22,-14 8,-6 L 6,-16 Z" />
);

/** Cabeça com máscara: rosto 3/4 desloca lentes/olhos com `virar`. */
const Cabeca: React.FC<{ tr: Traje; k: Esqueleto; c: Cores; L: number; sil?: string; lente: number }> = ({ tr, k, c, L, sil, lente }) => {
  const R = PR.cab, v = k.virar * 22;
  const st = sil ? undefined : c.tinta;
  if (tr === "aranha") {
    const olho = (lado: number) => {
      const cx = v + lado * 24 - k.virar * Math.abs(lado) * 4, abre = 1 - lente * 0.45;
      return <g key={lado} transform={`translate(${cx} -6) rotate(${lado * 28}) scale(${1 - 0.25 * k.virar * lado} ${abre})`}>
        <path d="M -20,4 C -20,-16 6,-22 20,-8 C 18,10 -6,16 -20,4 Z" fill={c.tinta} transform={`scale(${lado} 1)`} />
        <path d="M -14,3 C -14,-10 4,-15 14,-6 C 12,6 -4,10 -14,3 Z" fill="#ffffff" transform={`scale(${lado} 1)`} />
      </g>;
    };
    return (
      <g>
        <ellipse cx={0} cy={0} rx={R * 0.86} ry={R} fill={sil ?? c.base} stroke={st} strokeWidth={L} />
        {!sil && <g opacity={0.85} stroke={c.tinta} strokeWidth={2.5} fill="none">
          <clipPath id="hz-cab"><ellipse cx={0} cy={0} rx={R * 0.86} ry={R} /></clipPath>
          <g clipPath="url(#hz-cab)">
            {Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2; return <path key={i} d={`M ${v},${2} L ${v + Math.cos(a) * 90},${2 + Math.sin(a) * 90}`} />; })}
            {[22, 40, 58].map((r) => <ellipse key={r} cx={v} cy={2} rx={r * 0.9} ry={r} />)}
          </g>
          <ellipse cx={R * 0.2} cy={-R * 0.4} rx={R * 0.3} ry={R * 0.16} fill="#ffffff" opacity={0.25} stroke="none" />
        </g>}
        {!sil && [-1, 1].map(olho)}
      </g>
    );
  }
  // morcego: capuz com orelhas pontudas, mandíbula à mostra, olhos brancos em fenda
  const capuz = `M ${-R * 0.9},${R * 0.25} C ${-R * 0.98},${-R * 0.6} ${-R * 0.75},${-R * 0.95} ${-R * 0.55},${-R * 1.0} L ${-R * 0.62},${-R * 1.55} L ${-R * 0.28},${-R * 1.04} C ${-R * 0.1},${-R * 1.08} ${R * 0.1},${-R * 1.08} ${R * 0.28},${-R * 1.04} L ${R * 0.62},${-R * 1.55} L ${R * 0.55},${-R * 1.0} C ${R * 0.75},${-R * 0.95} ${R * 0.98},${-R * 0.6} ${R * 0.9},${R * 0.25} L ${R * 0.55},${R * 0.3} C ${R * 0.3},${R * 0.05} ${-R * 0.3},${R * 0.05} ${-R * 0.55},${R * 0.3} Z`;
  return (
    <g>
      <path d={`M ${-R * 0.72},${0} C ${-R * 0.75},${R * 0.9} ${R * 0.75},${R * 0.9} ${R * 0.72},${0} Z`} transform={`translate(${v * 0.6} 0)`} fill={sil ?? c.pele} stroke={st} strokeWidth={L} />
      {!sil && <path d={`M ${v * 0.6 - 14},${R * 0.55} q 14,${4 - lente * 6} 28,0`} stroke={c.tinta} strokeWidth={4} fill="none" strokeLinecap="round" />}
      <path d={capuz} transform={`translate(${v * 0.35} 0)`} fill={sil ?? c.detalhe} stroke={st} strokeWidth={L} strokeLinejoin="round" />
      {!sil && <path d={`M ${-R * 0.5 + v * 0.35},${-R * 0.75} L ${-R * 0.42 + v * 0.35},${-R * 1.25}`} stroke="#5d6a8a" strokeWidth={4} strokeLinecap="round" />}
      {!sil && [-1, 1].map((lado) => (
        <path key={lado} transform={`translate(${v + lado * 22} ${-R * 0.18}) scale(${lado * (1 - 0.3 * k.virar * lado)} ${1 - lente * 0.5})`}
          d="M -14,-2 L 14,-6 L 10,4 L -12,4 Z" fill="#f4f7ff" />
      ))}
    </g>
  );
};

export const Heroi: React.FC<{ traje: Traje; pose: Pose; x: number; y: number; escala?: number; dir?: 1 | -1; sil?: string; lente?: number;
  capa?: P; teia?: P | null; L?: number }> = ({ traje, pose, x, y, escala = 1, dir = 1, sil, lente = 0, capa = [0, 0], teia = null, L = 7 }) => {
  const k = esqueleto(pose), c = CORES[traje];
  const t = sil ? undefined : c.tinta;
  const { bE, bD, pE, pD, Q, N } = k;
  const om = (s: number) => add(N, rot([s * PR.ombro * 1.08, 14], k.lean));
  const cin = (s: number) => add(Q, rot([s * 50, -54], k.lean));
  const qd = (s: number) => add(Q, rot([s * 52, 14], k.lean));
  const torso = `M ${om(-1)} C ${add(om(-1), rot([-6, 70], k.lean))} ${add(cin(-1), rot([-4, -60], k.lean))} ${cin(-1)} L ${qd(-1)} L ${qd(1)} L ${cin(1)} C ${add(cin(1), rot([4, -60], k.lean))} ${add(om(1), rot([6, 70], k.lean))} ${om(1)} Q ${add(N, rot([0, -14], k.lean))} ${om(-1)} Z`;
  const peito = add(N, rot([0, 72], k.lean));
  const braco = (b: typeof bE, frente: boolean) => (
    <g>
      <Seg a={b.S} b={b.E} w={44} cor={traje === "aranha" ? c.detalhe : c.base} L={L} tinta={c.tinta} sil={sil} />
      <Seg a={b.E} b={b.M} w={38} cor={traje === "aranha" ? c.base : c.base} L={L} tinta={c.tinta} sil={sil} />
      <Seg a={add(b.E, mul([b.M[0] - b.E[0], b.M[1] - b.E[1]], 0.45))} b={b.M} w={40} cor={c.luva} L={L} tinta={c.tinta} sil={sil} />
      {traje === "morcego" && !sil && <path d={`M ${add(b.E, mul([b.M[0] - b.E[0], b.M[1] - b.E[1]], 0.5))} l ${(b.M[0] - b.E[0]) * 0.1 - 18},-10 l 6,14 Z`} fill={c.luva} />}
      <circle cx={b.M[0]} cy={b.M[1]} r={25} fill={sil ?? c.luva} stroke={t} strokeWidth={L} />
      {!frente && null}
    </g>
  );
  const perna = (p: typeof pE) => (
    <g>
      <Seg a={p.H} b={p.J} w={56} cor={traje === "aranha" ? c.detalhe : c.base} L={L} tinta={c.tinta} sil={sil} />
      <Seg a={p.J} b={p.Pe} w={48} cor={traje === "aranha" ? c.detalhe : c.base} L={L} tinta={c.tinta} sil={sil} />
      <Seg a={add(p.J, mul([p.Pe[0] - p.J[0], p.Pe[1] - p.J[1]], 0.5))} b={p.Pe} w={50} cor={c.bota} L={L} tinta={c.tinta} sil={sil} />
      <ellipse cx={p.Pe[0] + 14} cy={p.Pe[1] + 6} rx={36} ry={17} fill={sil ?? c.bota} stroke={t} strokeWidth={L} />
    </g>
  );
  // capa: presa nos ombros, a barra segue com atraso (vetor `capa`)
  const capaD = traje === "morcego" ? (() => {
    const a = om(-1), b = om(1), base = Q[1] + 250;
    const bl: P = [a[0] - 150 + capa[0], base + capa[1]], br: P = [b[0] + 150 + capa[0] * 1.3, base + capa[1] * 0.8 - 10];
    const ondas = Array.from({ length: 5 }, (_, i) => { const tt = (i + 1) / 6; return [bl[0] + (br[0] - bl[0]) * tt, base + capa[1] + (i % 2 ? -26 : 8)] as P; });
    return `M ${a[0]},${a[1]} C ${a[0] - 70},${a[1] + 120} ${bl[0] + 10},${bl[1] - 200} ${bl[0]},${bl[1]} ${ondas.map((o) => `L ${o[0]},${o[1]}`).join(" ")} L ${br[0]},${br[1]} C ${br[0] - 10},${br[1] - 200} ${b[0] + 70},${b[1] + 120} ${b[0]},${b[1]} Z`;
  })() : null;
  return (
    <g transform={`translate(${x} ${y}) scale(${escala * dir} ${escala})`}>
      {!sil && <ellipse cx={(pE.Pe[0] + pD.Pe[0]) / 2} cy={Math.max(0, 0)} rx={120} ry={20} fill="#000" opacity={0.28 * clamp01(1 + Q[1] / 400 + 0.85)} />}
      {teia && <path d={`M ${bD.M[0]},${bD.M[1]} Q ${(bD.M[0] + teia[0]) / 2 + 30},${(bD.M[1] + teia[1]) / 2 + 40} ${teia[0]},${teia[1]}`} stroke={sil ?? "#f4f7ff"} strokeWidth={6} fill="none" />}
      {capaD && <path d={capaD} fill={sil ?? c.capa} stroke={t} strokeWidth={L} strokeLinejoin="round" />}
      {braco(bE, false)}
      {perna(pE)}
      {perna(pD)}
      <path d={torso} fill={sil ?? (traje === "aranha" ? c.detalhe : c.base)} stroke={t} strokeWidth={L} strokeLinejoin="round" />
      {!sil && traje === "aranha" && (
        <g>
          <clipPath id="hz-tor"><path d={torso} /></clipPath>
          <g clipPath="url(#hz-tor)">
            {/* frente vermelha do peito até o cinto, laterais azuis */}
            <path d={`M ${om(-1)} L ${add(cin(-1), rot([18, 0], k.lean))} L ${add(qd(-1), rot([10, 0], k.lean))} L ${add(qd(1), rot([-10, 0], k.lean))} L ${add(cin(1), rot([-18, 0], k.lean))} L ${om(1)} Z`} fill={c.base} />
            <g stroke={c.tinta} strokeWidth={2.5} opacity={0.8} fill="none">
              {Array.from({ length: 8 }, (_, i) => { const a = Math.PI * (0.1 + i * 0.25); return <path key={i} d={`M ${peito[0]},${peito[1]} L ${peito[0] + Math.cos(a) * 260},${peito[1] + Math.sin(a) * 260}`} />; })}
              {[40, 80, 120, 160].map((r) => <circle key={r} cx={peito[0]} cy={peito[1]} r={r} />)}
            </g>
            <path d={torso} fill={c.sombra} opacity={0.22} transform="translate(26 0)" />
          </g>
          <g transform={`translate(${peito[0]} ${peito[1] - 6}) rotate(${k.lean})`}><Aranha s={1.25} tinta={c.tinta} /></g>
        </g>
      )}
      {!sil && traje === "morcego" && (
        <g>
          <clipPath id="hz-torb"><path d={torso} /></clipPath>
          <g clipPath="url(#hz-torb)">
            <path d={torso} fill={c.sombra} opacity={0.35} transform="translate(30 0)" />
            {/* sunga preta e cinto amarelo */}
            <path d={`M ${add(cin(-1), rot([-30, 30], k.lean))} L ${add(cin(1), rot([30, 30], k.lean))} L ${add(qd(1), rot([20, 40], k.lean))} L ${add(qd(-1), rot([-20, 40], k.lean))} Z`} fill={c.detalhe} />
          </g>
          <path d={linha([add(cin(-1), rot([-4, 14], k.lean)), add(cin(1), rot([4, 14], k.lean))])} stroke={c.tinta} strokeWidth={30} strokeLinecap="butt" />
          <path d={linha([add(cin(-1), rot([-2, 14], k.lean)), add(cin(1), rot([2, 14], k.lean))])} stroke={c.cinto} strokeWidth={20} strokeLinecap="butt" />
          <g transform={`translate(${peito[0]} ${peito[1]}) rotate(${k.lean})`}><Morcego s={1.4} cor={c.detalhe} /></g>
          {/* gola da capa por cima dos ombros */}
          <path d={`M ${om(-1)} Q ${add(N, rot([-30, 30], k.lean))} ${add(N, rot([0, 18], k.lean))} Q ${add(N, rot([30, 30], k.lean))} ${om(1)}`} stroke={c.capa} strokeWidth={22} fill="none" strokeLinecap="round" />
        </g>
      )}
      <g transform={`translate(${k.C[0]} ${k.C[1]}) rotate(${k.incl * 0.5})`}>
        <Cabeca tr={traje} k={k} c={c} L={L} sil={sil} lente={lente} />
      </g>
      {braco(bD, true)}
    </g>
  );
};
