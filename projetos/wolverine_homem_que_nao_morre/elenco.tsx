// Elenco 2D do episódio "Wolverine — O homem que não morre" (arte própria, estilo HQ: contorno forte, sombra recortada).
// Boneco articulado com o MESMO tipo Pose do kit (engine/src/kit/poses.ts): ângulo 0 = membro para baixo,
// + = para fora do corpo; [ombro/quadril, cotovelo/joelho]. Proporções iguais em todas as épocas.
import React from "react";
import { Pose, misturaPose } from "../../engine/src/kit/poses";
import { clamp01, eio, lerp } from "../../engine/src/kit/anim";

export const TINTA = "#0d0b10";
type P = [number, number];
const rad = (g: number) => (g * Math.PI) / 180;
const rot = (v: P, g: number): P => [v[0] * Math.cos(rad(g)) - v[1] * Math.sin(rad(g)), v[0] * Math.sin(rad(g)) + v[1] * Math.cos(rad(g))];
const add = (a: P, b: P): P => [a[0] + b[0], a[1] + b[1]];
const mul = (a: P, k: number): P => [a[0] * k, a[1] * k];
const dirM = (s: number, ang: number, incl: number): P => rot([s * Math.sin(rad(ang)), Math.cos(rad(ang))], incl);
const pt = (p: P) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;

export type Prop = { perna: number; coxa: number; tronco: number; ombro: number; quadril: number; cab: number; braco: number; antebraco: number; larg: number };
export const LOGAN_P: Prop = { perna: 300, coxa: 0.5, tronco: 236, ombro: 86, quadril: 34, cab: 60, braco: 124, antebraco: 116, larg: 1.18 };
export const ADULTO_P: Prop = { perna: 334, coxa: 0.5, tronco: 250, ombro: 78, quadril: 30, cab: 58, braco: 132, antebraco: 122, larg: 1 };
export const CRIANCA_P: Prop = { perna: 196, coxa: 0.5, tronco: 160, ombro: 46, quadril: 20, cab: 54, braco: 84, antebraco: 78, larg: 0.72 };

export type Cabeca = "logan" | "wolv" | "capitao" | "magneto" | "menino" | "natasha" | "entregador";
export type Fig = {
  prop: Prop; cabeca: Cabeca; pele: string; cabelo?: string;
  torso: string; lado?: string; listras?: boolean; bracoSup: string; bracoInf: string; luva: string;
  perna: string; bota: string; cinto?: string; sunga?: string; gola?: string;
  capa?: string; mochila?: string; estrela?: boolean; regata?: string;
};

// figurinos
export const LOGAN_CIVIL: Fig = { prop: LOGAN_P, cabeca: "logan", pele: "#d9a07a", cabelo: "#17110e", torso: "#7a4a2c", regata: "#efe8dc", bracoSup: "#7a4a2c", bracoInf: "#7a4a2c", luva: "#d9a07a", perna: "#33405c", bota: "#3a2a20", cinto: "#2a1f18" };
export const LOGAN_1941: Fig = { ...LOGAN_CIVIL, torso: "#5e5a3e", bracoSup: "#5e5a3e", bracoInf: "#5e5a3e", regata: "#d8cfb8", perna: "#4a4334" };
export const WOLV: Fig = { prop: LOGAN_P, cabeca: "wolv", pele: "#d9a07a", cabelo: "#17110e", torso: "#f2c418", lado: "#1f4fa8", listras: true, bracoSup: "#1f4fa8", bracoInf: "#f2c418", luva: "#1f4fa8", perna: "#f2c418", bota: "#1f4fa8", cinto: "#c0282d", sunga: "#1f4fa8" };
export const JAMES: Fig = { prop: CRIANCA_P, cabeca: "menino", pele: "#efc9a8", cabelo: "#3a2616", torso: "#e9e2d0", bracoSup: "#e9e2d0", bracoInf: "#e9e2d0", luva: "#efc9a8", perna: "#e9e2d0", bota: "#efc9a8" };
export const CAPITAO: Fig = { prop: ADULTO_P, cabeca: "capitao", pele: "#e8b896", torso: "#2c4e9e", estrela: true, bracoSup: "#2c4e9e", bracoInf: "#2c4e9e", luva: "#7a4a2c", perna: "#3a3f52", bota: "#5a3a26", cinto: "#7a4a2c" };
export const NATASHA: Fig = { prop: CRIANCA_P, cabeca: "natasha", pele: "#f2d2bc", cabelo: "#c0392b", torso: "#6a7a8a", bracoSup: "#6a7a8a", bracoInf: "#6a7a8a", luva: "#f2d2bc", perna: "#4a5560", bota: "#3a2a20" };
export const MAGNETO: Fig = { prop: ADULTO_P, cabeca: "magneto", pele: "#e3b896", torso: "#b0252f", bracoSup: "#b0252f", bracoInf: "#b0252f", luva: "#5a2a7a", perna: "#b0252f", bota: "#5a2a7a", capa: "#5a2a7a", cinto: "#5a2a7a" };
export const ENTREGADOR: Fig = { prop: ADULTO_P, cabeca: "entregador", pele: "#9a6a48", cabelo: "#140e0b", torso: "#2b2f3a", bracoSup: "#2b2f3a", bracoInf: "#2b2f3a", luva: "#9a6a48", perna: "#25344f", bota: "#e9e6e0", mochila: "#e8742a" };

export const esq = (pr: Prop, pose: Pose) => {
  const lean = pose.tronco ?? 0;
  const resp = Math.sin(pose.respirar ?? 0) * 3;
  const Q: P = [pose.dx ?? 0, -pr.perna + (pose.bob ?? 0) + (pose.agachar ?? 0)];
  const N = add(Q, rot([0, -pr.tronco - resp], lean));
  const ombro = (s: number) => add(N, rot([s * pr.ombro, 24], lean));
  const incl = lean + (pose.cabecaIncl ?? 0);
  const C = add(N, rot([0, -pr.cab * 1.02], incl * 0.6));
  const braco = (s: number, a: [number, number]) => {
    const S = ombro(s), E = add(S, mul(dirM(s, a[0], lean), pr.braco));
    const M = add(E, mul(dirM(s, a[0] - a[1], lean), pr.antebraco));
    return { S, E, M };
  };
  const perna = (s: number, a: [number, number]) => {
    const H = add(Q, [s * pr.quadril, 6]);
    const c = pr.perna * pr.coxa, cn = pr.perna * (1 - pr.coxa) - 10;
    const J = add(H, mul(dirM(s, a[0], 0), c));
    const Pe = add(J, mul(dirM(s, a[0] - a[1] * 0.4, 0), cn * (1 - 0.25 * Math.sin(rad(Math.max(0, a[1]))))));
    return { H, J, Pe };
  };
  return { Q, N, C, lean, incl, virar: pose.virar ?? 0, olhar: pose.olhar ?? [0, 0], bE: braco(-1, pose.bracoE), bD: braco(1, pose.bracoD), pE: perna(-1, pose.pernaE), pD: perna(1, pose.pernaD) };
};

/** poses-chave [frame, pose] interpoladas com easing */
export const poseChaves = (f: number, ch: [number, Pose][], extra: Partial<Pose> = {}): Pose => {
  let p = ch[0][1];
  for (let i = 1; i < ch.length; i++) {
    const [f0] = ch[i - 1], [f1, b] = ch[i];
    if (f >= f1) p = b;
    else if (f > f0) { p = { ...misturaPose(ch[i - 1][1], b, eio(clamp01((f - f0) / (f1 - f0)))), frenteD: b.frenteD, frenteE: b.frenteE }; break; }
  }
  return { ...p, ...extra };
};

const Seg: React.FC<{ a: P; b: P; w: number; cor: string; L: number; sil?: string }> = ({ a, b, w, cor, L, sil }) => (
  <g>
    {!sil && <path d={`M ${pt(a)} L ${pt(b)}`} stroke={TINTA} strokeWidth={w + L * 2} strokeLinecap="round" />}
    <path d={`M ${pt(a)} L ${pt(b)}`} stroke={sil ?? cor} strokeWidth={w} strokeLinecap="round" />
  </g>
);

export type Garras = "osso" | "metal" | null;
/** três garras saindo do punho, na direção do antebraço; ext 0..1 (saindo) */
export const GarrasDesenho: React.FC<{ E: P; M: P; tipo: Garras; ext?: number; sil?: string; escala?: number }> = ({ E, M, tipo, ext = 1, sil, escala = 1 }) => {
  if (!tipo || ext <= 0) return null;
  const d = [M[0] - E[0], M[1] - E[1]], n = Math.hypot(d[0], d[1]) || 1, u: P = [d[0] / n, d[1] / n], nn: P = [-u[1], u[0]];
  const comp = (tipo === "osso" ? 78 : 96) * ext * escala;
  const cor = sil ?? (tipo === "osso" ? "#efe4c8" : "#d9e2ee");
  return (
    <g>
      {[-1, 0, 1].map((k) => {
        const base = add(add(M, mul(u, 16 * escala)), mul(nn, k * 13 * escala));
        const ponta = add(base, mul(u, comp));
        const tort = tipo === "osso" ? mul(nn, 6 * Math.sin(k + 1)) : [0, 0] as P;
        return (
          <g key={k}>
            {!sil && <path d={`M ${pt(add(base, mul(nn, -5)))} Q ${pt(add(add(base, mul(u, comp * 0.6)), tort))} ${pt(ponta)} L ${pt(add(base, mul(nn, 5)))} Z`} fill={TINTA} stroke={TINTA} strokeWidth={6} strokeLinejoin="round" />}
            <path d={`M ${pt(add(base, mul(nn, -4)))} Q ${pt(add(add(base, mul(u, comp * 0.6)), tort))} ${pt(ponta)} L ${pt(add(base, mul(nn, 4)))} Z`} fill={cor} />
            {!sil && tipo === "metal" && <path d={`M ${pt(add(base, mul(nn, -1)))} L ${pt(add(base, mul(u, comp * 0.85)))}`} stroke="#ffffff" strokeWidth={2} opacity={0.8} />}
          </g>
        );
      })}
    </g>
  );
};

export type Expr = "bravo" | "neutro" | "susto" | "dor" | "fechado" | "calmo";
const Rosto: React.FC<{ fig: Fig; k: ReturnType<typeof esq>; expr: Expr; sil?: string; L: number }> = ({ fig, k, expr, sil, L }) => {
  const R = fig.prop.cab, v = k.virar * 20, st = sil ? undefined : TINTA;
  const olhos = (cor = "#ffffff", fenda = false) => sil ? null : [-1, 1].map((s) => {
    const x = v + s * R * 0.36, fechado = expr === "fechado";
    return (
      <g key={s}>
        {fechado ? <path d={`M ${x - 11},${-R * 0.12} q 11,7 22,0`} stroke={TINTA} strokeWidth={4} fill="none" strokeLinecap="round" />
          : fenda ? <path d={`M ${x - 13},${-R * 0.18} L ${x + 13},${-R * 0.18 + s * 4} L ${x + 9},${-R * 0.04} L ${x - 11},${-R * 0.06} Z`} fill={cor} />
          : <g><ellipse cx={x} cy={-R * 0.12} rx={8} ry={expr === "susto" ? 10 : 7} fill="#fff" stroke={TINTA} strokeWidth={3} /><circle cx={x + k.olhar[0] * 3} cy={-R * 0.12 + k.olhar[1] * 3} r={3.6} fill={TINTA} /></g>}
        {!fechado && <path d={`M ${x - 14},${-R * 0.34 + (expr === "bravo" ? s * -4 : expr === "susto" ? -6 : expr === "dor" ? s * 4 : 0)} L ${x + 14},${-R * 0.34 + (expr === "bravo" ? s * 6 : expr === "susto" ? -8 : expr === "dor" ? s * -3 : 0)}`} stroke={TINTA} strokeWidth={6} strokeLinecap="round" />}
      </g>
    );
  });
  const boca = sil ? null : <path d={expr === "susto" ? `M ${v - 8},${R * 0.42} q 8,14 16,0 q -8,-6 -16,0` : expr === "bravo" ? `M ${v - 14},${R * 0.44} L ${v + 14},${R * 0.4}` : expr === "calmo" ? `M ${v - 12},${R * 0.4} q 12,7 24,0` : `M ${v - 12},${R * 0.42} L ${v + 12},${R * 0.42}`} stroke={TINTA} strokeWidth={4} fill={expr === "susto" ? "#3a1a1a" : "none"} strokeLinecap="round" />;
  const cara = <ellipse cx={v * 0.4} cy={0} rx={R * 0.82} ry={R} fill={sil ?? fig.pele} stroke={st} strokeWidth={L} />;
  const sombra = sil ? null : <path d={`M ${R * 0.2},${-R} C ${R * 0.9},${-R * 0.7} ${R * 0.95},${R * 0.6} ${R * 0.15},${R}`} fill="none" stroke="#000" strokeOpacity={0.18} strokeWidth={R * 0.5} />;
  switch (fig.cabeca) {
    case "logan":
      return (
        <g>
          {cara}{sombra}
          {/* costeletas e cabelo com as duas pontas características */}
          {[-1, 1].map((s) => <path key={s} d={`M ${s * R * 0.8 + v * 0.4},${-R * 0.3} C ${s * R * 0.9},${R * 0.3} ${s * R * 0.55},${R * 0.75} ${s * R * 0.32 + v * 0.3},${R * 0.82} L ${s * R * 0.48},${R * 0.2} Z`} fill={sil ?? fig.cabelo} stroke={st} strokeWidth={L * 0.6} />)}
          <path d={`M ${-R * 0.9},${-R * 0.25} C ${-R},${-R * 0.9} ${-R * 1.25},${-R * 1.55} ${-R * 0.95},${-R * 1.6} C ${-R * 0.6},${-R * 1.25} ${-R * 0.3},${-R * 1.05} 0,${-R * 1.05} C ${R * 0.3},${-R * 1.05} ${R * 0.6},${-R * 1.25} ${R * 0.95},${-R * 1.6} C ${R * 1.25},${-R * 1.55} ${R},${-R * 0.9} ${R * 0.9},${-R * 0.25} C ${R * 0.6},${-R * 0.7} ${-R * 0.6},${-R * 0.7} ${-R * 0.9},${-R * 0.25} Z`} transform={`translate(${v * 0.3} 0)`} fill={sil ?? fig.cabelo} stroke={st} strokeWidth={L} strokeLinejoin="round" />
          {olhos()}{boca}
        </g>
      );
    case "wolv":
      return (
        <g>
          {cara}{sombra}
          {[-1, 1].map((s) => <path key={s} d={`M ${s * R * 0.8 + v * 0.4},${-R * 0.1} C ${s * R * 0.9},${R * 0.4} ${s * R * 0.55},${R * 0.75} ${s * R * 0.32 + v * 0.3},${R * 0.82} L ${s * R * 0.48},${R * 0.2} Z`} fill={sil ?? fig.cabelo} stroke={st} strokeWidth={L * 0.6} />)}
          {/* máscara amarela com as "asas" pretas */}
          <path d={`M ${-R * 0.86},${R * 0.05} C ${-R * 0.95},${-R * 0.8} ${-R * 0.5},${-R * 1.05} 0,${-R * 1.05} C ${R * 0.5},${-R * 1.05} ${R * 0.95},${-R * 0.8} ${R * 0.86},${R * 0.05} L ${R * 0.6},${R * 0.1} C ${R * 0.4},${-R * 0.05} ${-R * 0.4},${-R * 0.05} ${-R * 0.6},${R * 0.1} Z`} transform={`translate(${v * 0.35} 0)`} fill={sil ?? fig.torso} stroke={st} strokeWidth={L} />
          {!sil && [-1, 1].map((s) => <path key={s} transform={`translate(${v * 0.35} 0)`} d={`M ${s * R * 0.12},${-R * 0.2} C ${s * R * 0.5},${-R * 0.5} ${s * R * 0.8},${-R * 0.95} ${s * R * 1.25},${-R * 1.45} C ${s * R * 0.9},${-R * 0.75} ${s * R * 0.9},${-R * 0.1} ${s * R * 0.62},${R * 0.06} C ${s * R * 0.45},${-R * 0.05} ${s * R * 0.25},${-R * 0.05} ${s * R * 0.12},${-R * 0.2} Z`} fill="#16181f" stroke={TINTA} strokeWidth={L * 0.7} />)}
          {olhos("#ffffff", true)}{boca}
        </g>
      );
    case "capitao":
      return (
        <g>
          {cara}{sombra}
          <path d={`M ${-R * 0.86},${R * 0.05} C ${-R * 0.95},${-R * 0.85} ${-R * 0.5},${-R * 1.08} 0,${-R * 1.08} C ${R * 0.5},${-R * 1.08} ${R * 0.95},${-R * 0.85} ${R * 0.86},${R * 0.05} L ${R * 0.6},${R * 0.08} C ${R * 0.4},${-R * 0.06} ${-R * 0.4},${-R * 0.06} ${-R * 0.6},${R * 0.08} Z`} transform={`translate(${v * 0.35} 0)`} fill={sil ?? fig.torso} stroke={st} strokeWidth={L} />
          {!sil && <text x={v * 0.35} y={-R * 0.48} textAnchor="middle" fontFamily="Anton" fontSize={R * 0.6} fill="#ffffff">A</text>}
          {!sil && [-1, 1].map((s) => <path key={s} transform={`translate(${v * 0.35} 0)`} d={`M ${s * R * 0.8},${-R * 0.55} l ${s * 26},-14 l ${-s * 6},14 l ${s * 10},-2 l ${-s * 14},16 Z`} fill="#ffffff" stroke={TINTA} strokeWidth={3} />)}
          {olhos()}{boca}
        </g>
      );
    case "magneto":
      return (
        <g>
          {cara}{sombra}
          <path d={`M ${-R * 0.95},${R * 0.5} C ${-R * 1.05},${-R * 0.9} ${-R * 0.5},${-R * 1.12} 0,${-R * 1.12} C ${R * 0.5},${-R * 1.12} ${R * 1.05},${-R * 0.9} ${R * 0.95},${R * 0.5} L ${R * 0.66},${R * 0.5} L ${R * 0.6},${-R * 0.05} C ${R * 0.4},${-R * 0.35} ${-R * 0.4},${-R * 0.35} ${-R * 0.6},${-R * 0.05} L ${-R * 0.66},${R * 0.5} Z`} transform={`translate(${v * 0.35} 0)`} fill={sil ?? "#b0252f"} stroke={st} strokeWidth={L} />
          {!sil && <path transform={`translate(${v * 0.35} 0)`} d={`M ${-R * 0.25},${-R * 1.1} L 0,${-R * 0.55} L ${R * 0.25},${-R * 1.1}`} fill="#7a1620" />}
          {olhos()}{boca}
        </g>
      );
    case "menino":
    case "natasha":
      return (
        <g>
          {cara}{sombra}
          <path d={fig.cabeca === "natasha"
            ? `M ${-R * 0.95},${R * 0.9} C ${-R * 1.1},${-R * 0.6} ${-R * 0.6},${-R * 1.12} 0,${-R * 1.1} C ${R * 0.6},${-R * 1.12} ${R * 1.1},${-R * 0.6} ${R * 0.95},${R * 0.9} L ${R * 0.7},${R * 0.9} C ${R * 0.75},${-R * 0.2} ${R * 0.4},${-R * 0.5} 0,${-R * 0.6} C ${-R * 0.4},${-R * 0.5} ${-R * 0.75},${-R * 0.2} ${-R * 0.7},${R * 0.9} Z`
            : `M ${-R * 0.88},${-R * 0.05} C ${-R * 1.0},${-R * 0.85} ${-R * 0.5},${-R * 1.12} 0,${-R * 1.08} C ${R * 0.5},${-R * 1.12} ${R * 1.0},${-R * 0.85} ${R * 0.88},${-R * 0.05} C ${R * 0.6},${-R * 0.5} ${-R * 0.3},${-R * 0.62} ${-R * 0.88},${-R * 0.05} Z`}
            transform={`translate(${v * 0.3} 0)`} fill={sil ?? fig.cabelo} stroke={st} strokeWidth={L} />
          {olhos()}{boca}
        </g>
      );
    case "entregador":
      return (
        <g>
          {cara}{sombra}
          <path d={`M ${-R * 0.92},${-R * 0.05} C ${-R * 1.0},${-R * 0.9} ${-R * 0.5},${-R * 1.1} 0,${-R * 1.1} C ${R * 0.5},${-R * 1.1} ${R * 1.0},${-R * 0.9} ${R * 0.92},${-R * 0.05} L ${R * 1.25},${-R * 0.05} L ${R * 1.2},${-R * 0.22} L ${R * 0.85},${-R * 0.3} C ${R * 0.5},${-R * 0.55} ${-R * 0.5},${-R * 0.55} ${-R * 0.92},${-R * 0.05} Z`} transform={`translate(${v * 0.3} 0)`} fill={sil ?? "#c9372c"} stroke={st} strokeWidth={L} />
          {olhos()}{boca}
        </g>
      );
  }
};

export type FigProps = { fig: Fig; pose: Pose; x: number; y: number; escala?: number; dir?: 1 | -1; expr?: Expr; garras?: Garras; garrasExt?: number;
  garrasE?: boolean; sil?: string; L?: number; capa?: P; escudo?: number; brilho?: string; luz?: number };

/** Figura completa. escudo: 1 = escudo redondo no braço esquerdo (Capitão de 1941). */
export const Figura: React.FC<FigProps> = ({ fig, pose, x, y, escala = 1, dir = 1, expr = "neutro", garras = null, garrasExt = 1, garrasE = true, sil, L = 7, capa = [0, 0], escudo = 0, brilho, luz = 0 }) => {
  const k = esq(fig.prop, pose), pr = fig.prop, st = sil ? undefined : TINTA;
  const { bE, bD, pE, pD, Q, N } = k;
  const lg = pr.larg;
  const om = (s: number) => add(N, rot([s * pr.ombro * 1.08, 14], k.lean));
  const cin = (s: number) => add(Q, rot([s * 46 * lg, -54], k.lean));
  const qd = (s: number) => add(Q, rot([s * 48 * lg, 14], k.lean));
  const torso = `M ${pt(om(-1))} C ${pt(add(om(-1), rot([-6, 70], k.lean)))} ${pt(add(cin(-1), rot([-4, -60], k.lean)))} ${pt(cin(-1))} L ${pt(qd(-1))} L ${pt(qd(1))} L ${pt(cin(1))} C ${pt(add(cin(1), rot([4, -60], k.lean)))} ${pt(add(om(1), rot([6, 70], k.lean)))} ${pt(om(1))} Q ${pt(add(N, rot([0, -14], k.lean)))} ${pt(om(-1))} Z`;
  const wB = 40 * Math.sqrt(lg) * (pr === CRIANCA_P ? 0.72 : 1), wP = 52 * Math.sqrt(lg) * (pr === CRIANCA_P ? 0.75 : 1);
  const braco = (b: typeof bE, lado: number) => (
    <g>
      <Seg a={b.S} b={b.E} w={wB + 4} cor={fig.bracoSup} L={L} sil={sil} />
      <Seg a={b.E} b={b.M} w={wB} cor={fig.bracoInf} L={L} sil={sil} />
      <circle cx={b.M[0]} cy={b.M[1]} r={wB * 0.6} fill={sil ?? fig.luva} stroke={st} strokeWidth={L} />
      {(lado > 0 || garrasE) && <GarrasDesenho E={b.E} M={b.M} tipo={garras} ext={garrasExt} sil={sil} />}
    </g>
  );
  const perna = (p: typeof pE) => (
    <g>
      <Seg a={p.H} b={p.J} w={wP + 4} cor={fig.perna} L={L} sil={sil} />
      <Seg a={p.J} b={p.Pe} w={wP - 2} cor={fig.perna} L={L} sil={sil} />
      <Seg a={add(p.J, mul([p.Pe[0] - p.J[0], p.Pe[1] - p.J[1]], 0.55))} b={p.Pe} w={wP} cor={fig.bota} L={L} sil={sil} />
      <ellipse cx={p.Pe[0] + 14} cy={p.Pe[1] + 6} rx={wP * 0.72} ry={16} fill={sil ?? fig.bota} stroke={st} strokeWidth={L} />
    </g>
  );
  const capaD = fig.capa ? (() => {
    const a = om(-1), b = om(1), base = Q[1] + 260;
    const bl: P = [a[0] - 130 + capa[0], base + capa[1]], br: P = [b[0] + 130 + capa[0] * 1.2, base + capa[1] * 0.8];
    return `M ${pt(a)} C ${a[0] - 60},${a[1] + 120} ${bl[0] + 10},${bl[1] - 200} ${pt(bl)} Q ${(bl[0] + br[0]) / 2},${base + 30} ${pt(br)} C ${br[0] - 10},${br[1] - 200} ${b[0] + 60},${b[1] + 120} ${pt(b)} Z`;
  })() : null;
  const peito = add(N, rot([0, 76], k.lean));
  const frente = (lado: "E" | "D") => (lado === "E" ? pose.frenteE : pose.frenteD);
  return (
    <g transform={`translate(${x} ${y}) scale(${escala * dir} ${escala})`}>
      {!sil && <ellipse cx={(pE.Pe[0] + pD.Pe[0]) / 2} cy={4} rx={110 * lg} ry={18} fill="#000" opacity={0.25 * clamp01(1 + (Q[1] + pr.perna) / 300)} />}
      {capaD && <path d={capaD} fill={sil ?? fig.capa} stroke={st} strokeWidth={L} strokeLinejoin="round" />}
      {fig.mochila && <rect x={k.N[0] - 70 * (k.virar < 0 ? -1 : 1) - 60} y={k.N[1] + 10} width={120} height={130} rx={12} fill={sil ?? fig.mochila} stroke={st} strokeWidth={L} transform={`rotate(${k.lean} ${k.N[0]} ${k.N[1]})`} />}
      {!frente("E") && braco(bE, -1)}
      {perna(pE)}
      {perna(pD)}
      <path d={torso} fill={sil ?? fig.torso} stroke={st} strokeWidth={L} strokeLinejoin="round" />
      {!sil && (
        <g>
          <clipPath id={`tz-${x}-${y}`}><path d={torso} /></clipPath>
          <g clipPath={`url(#tz-${x}-${y})`}>
            {fig.regata && <path d={`M ${pt(add(N, rot([-34, 10], k.lean)))} L ${pt(add(N, rot([34, 10], k.lean)))} L ${pt(add(Q, rot([30, -40], k.lean)))} L ${pt(add(Q, rot([-30, -40], k.lean)))} Z`} fill={fig.regata} />}
            {fig.lado && [-1, 1].map((s) => <path key={s} d={`M ${pt(om(s))} L ${pt(add(N, rot([s * 40, 60], k.lean)))} L ${pt(add(Q, rot([s * 28, -60], k.lean)))} L ${pt(add(Q, rot([s * 60, 10], k.lean)))} L ${pt(add(om(s), rot([s * 30, 0], k.lean)))} Z`} fill={fig.lado} />)}
            {fig.listras && [-1, 1].map((s) => [0, 1, 2].map((j) => <path key={`${s}${j}`} d={`M ${pt(add(N, rot([s * 74, 70 + j * 38], k.lean)))} l ${-s * 34},12 l ${s * 30},6 Z`} fill="#121218" />))}
            {fig.estrela && <path transform={`translate(${peito[0]} ${peito[1]}) rotate(${k.lean})`} d="M 0,-26 L 7,-8 L 26,-8 L 11,4 L 16,22 L 0,11 L -16,22 L -11,4 L -26,-8 L -7,-8 Z" fill="#ffffff" stroke={TINTA} strokeWidth={3} />}
            {fig.estrela && <rect x={qd(-1)[0]} y={add(Q, rot([0, -110], k.lean))[1]} width={qd(1)[0] - qd(-1)[0]} height={50} fill="#c0282d" />}
            {fig.cinto && <path d={`M ${pt(add(cin(-1), rot([-10, 18], k.lean)))} L ${pt(add(cin(1), rot([10, 18], k.lean)))}`} stroke={fig.cinto} strokeWidth={20} />}
            {fig.sunga && <path d={`M ${pt(add(cin(-1), rot([-20, 30], k.lean)))} L ${pt(add(cin(1), rot([20, 30], k.lean)))} L ${pt(add(qd(1), rot([10, 30], k.lean)))} L ${pt(add(qd(-1), rot([-10, 30], k.lean)))} Z`} fill={fig.sunga} />}
            <path d={torso} fill="#000" opacity={0.2} transform="translate(30 0)" />
          </g>
        </g>
      )}
      {escudo > 0 && (
        <g transform={`translate(${bE.M[0] - 20} ${bE.M[1] - 30})`} opacity={escudo}>
          {[64, 50, 36, 22].map((r, i) => <circle key={r} r={r} fill={sil ?? ["#c0282d", "#f4f1ea", "#c0282d", "#2c4e9e"][i]} stroke={st} strokeWidth={i === 0 ? L : 0} />)}
          {!sil && <path d="M 0,-18 L 5,-6 L 18,-6 L 8,2 L 11,15 L 0,7 L -11,15 L -8,2 L -18,-6 L -5,-6 Z" fill="#fff" />}
        </g>
      )}
      <g transform={`translate(${k.C[0]} ${k.C[1]}) rotate(${k.incl * 0.5})`}>
        <Rosto fig={fig} k={k} expr={expr} sil={sil} L={L} />
      </g>
      {frente("E") && braco(bE, -1)}
      {braco(bD, 1)}
      {brilho && luz > 0 && <path d={torso} fill="none" stroke={brilho} strokeWidth={10} opacity={luz} transform="translate(-8 2)" />}
    </g>
  );
};

// poses úteis
export const guarda = (f: number): Pose => ({ bracoE: [40, 100], bracoD: [56, 96], pernaE: [16, 22], pernaD: [10, 18], agachar: 24, tronco: 8, respirar: f * 0.2, frenteE: true, frenteD: true });
export const corrida = (f: number, vel = 0.32): Pose => {
  const s = Math.sin(f * vel), c = Math.cos(f * vel);
  return { bracoE: [30 - 40 * s, 80], bracoD: [60 + 40 * s, 80], pernaE: [10 + 35 * s, 20 + 40 * Math.max(0, -s)], pernaD: [10 - 35 * s, 20 + 40 * Math.max(0, s)], tronco: 14, bob: -Math.abs(c) * 14, frenteD: true };
};
export const repouso = (f: number, seed = 1): Pose => ({ bracoE: [8, 10], bracoD: [8, 10], pernaE: [4, 0], pernaD: [4, 0], respirar: f * 0.14 + seed, cabecaIncl: Math.sin(f * 0.03 + seed) * 2 });
export const lerpP = lerp;
