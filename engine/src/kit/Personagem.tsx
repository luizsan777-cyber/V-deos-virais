// Personagem 2D articulado em SVG (rig próprio): cabeça com olhos, pálpebras, sobrancelhas e boca
// expressivas, lip-sync, braços e pernas com dois segmentos, mãos, roupas, cabelos e sombreamento cel.
// Sistema de coordenadas: origem nos pés, y para baixo, altura de um adulto ≈ 640 unidades.
import React from "react";
import { Expr, EXPRESSOES } from "./expressoes";
import { Pose, POSE_BASE } from "./poses";

export type Roupa = "camiseta" | "moletom" | "jaleco" | "tunica" | "manto" | "vestido" | "terno" | "regata";
export type Cabelo = "curto" | "topete" | "cacheado" | "longo" | "careca" | "coque" | "veu" | "rabo" | "espetado";

export type Visual = {
  pele: string;
  cabelo: Cabelo;
  corCabelo: string;
  roupa: Roupa;
  cor: string; // cor principal da roupa
  cor2?: string; // detalhe / calça / manto
  calca?: string;
  sapato?: string;
  barba?: "nenhuma" | "curta" | "longa" | "bigode";
  corOlho?: string;
  corpo?: "magro" | "medio" | "forte" | "crianca" | "idoso";
  oculos?: boolean;
};

export type Estilo = {
  tinta: string; // cor do contorno
  linha: number; // espessura do contorno
  sombra: number; // intensidade da sombra cel 0..1
  corSombra: string; // cor multiplicada nas sombras
  brilho: number; // luz de recorte (rim) 0..1
  corBrilho: string;
};

export const ESTILOS_PERSONAGEM: Record<string, Estilo> = {
  conto: { tinta: "#2a1b1f", linha: 7, sombra: 0.28, corSombra: "#5b3a6e", brilho: 0.0, corBrilho: "#fff3c4" },
  terror: { tinta: "#07060a", linha: 8, sombra: 0.55, corSombra: "#0c1830", brilho: 0.55, corBrilho: "#9fd0ff" },
  biblico: { tinta: "#3a2414", linha: 6, sombra: 0.32, corSombra: "#7a3d1c", brilho: 0.35, corBrilho: "#ffd59a" },
  flat: { tinta: "#1d1d2b", linha: 6, sombra: 0.18, corSombra: "#3b3f7a", brilho: 0, corBrilho: "#ffffff" },
  noite: { tinta: "#0d0b16", linha: 7, sombra: 0.5, corSombra: "#1a1f4a", brilho: 0.6, corBrilho: "#7fe7ff" },
};

type P = [number, number];
const rad = (d: number) => (d * Math.PI) / 180;
const rot = ([x, y]: P, d: number): P => {
  const c = Math.cos(rad(d)), s = Math.sin(rad(d));
  return [x * c - y * s, x * s + y * c];
};
const add = (a: P, b: P): P => [a[0] + b[0], a[1] + b[1]];
const mulc = (c: string, k: number) => {
  const n = parseInt(c.slice(1), 16);
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(v * k))).toString(16).padStart(2, "0");
  return `#${ch((n >> 16) & 255)}${ch((n >> 8) & 255)}${ch(n & 255)}`;
};
/** direção de um membro: ângulo 0 = para baixo, + = para fora do corpo (lado s = -1 esquerda da tela, +1 direita) */
const dirMembro = (s: number, ang: number, inclinacao: number): P => rot([s * Math.sin(rad(ang)), Math.cos(rad(ang))], inclinacao);

const PROPORCOES = {
  medio: { perna: 235, coxa: 0.52, tronco: 205, ombro: 64, quadril: 52, cab: 98, braco: 108, antebraco: 98, larg: 1 },
  magro: { perna: 245, coxa: 0.52, tronco: 210, ombro: 56, quadril: 44, cab: 96, braco: 112, antebraco: 100, larg: 0.85 },
  forte: { perna: 230, coxa: 0.5, tronco: 215, ombro: 80, quadril: 60, cab: 96, braco: 110, antebraco: 100, larg: 1.25 },
  crianca: { perna: 150, coxa: 0.5, tronco: 140, ombro: 46, quadril: 40, cab: 100, braco: 78, antebraco: 70, larg: 0.85 },
  idoso: { perna: 225, coxa: 0.52, tronco: 200, ombro: 60, quadril: 54, cab: 96, braco: 104, antebraco: 96, larg: 1 },
};

export type PersonagemProps = {
  id: string; // único na cena (usado nos clipPaths)
  x: number;
  y: number;
  escala?: number;
  dir?: 1 | -1; // espelha o personagem
  visual: Visual;
  estilo?: Estilo;
  pose?: Pose;
  expr?: Expr;
  olhosAbertos?: number; // 0..1 (piscar)
  boca?: number; // lip-sync 0..1
  brilhoCorpo?: number; // aura/brilho (ex.: corpo que brilha)
  itemD?: React.ReactNode; // objeto segurado na mão direita (celular, papel…), desenhado na posição da mão
  itemE?: React.ReactNode; // idem, mão esquerda. Coordenadas do item: origem no centro da mão, unidades do personagem
  opacidade?: number;
};

export const Personagem: React.FC<PersonagemProps> = ({
  id, x, y, escala = 1, dir = 1, visual: v, estilo: E = ESTILOS_PERSONAGEM.conto, pose = POSE_BASE,
  expr = EXPRESSOES.neutro, olhosAbertos = 1, boca = 0, brilhoCorpo = 0, opacidade = 1, itemD, itemE,
}) => {
  const pr = PROPORCOES[v.corpo ?? "medio"];
  const L = E.linha;
  const tinta = E.tinta;
  const pele = v.pele;
  const calca = v.calca ?? "#2f3b5c";
  const sapato = v.sapato ?? "#2a2220";
  const cor2 = v.cor2 ?? mulc(v.cor, 0.75);
  const robe = v.roupa === "tunica" || v.roupa === "manto" || v.roupa === "vestido";
  const mangaLonga = ["moletom", "jaleco", "tunica", "manto", "terno"].includes(v.roupa);
  const corManga = v.roupa === "jaleco" ? "#f4f6fb" : v.cor;

  // ---- esqueleto
  const bob = pose.bob ?? 0;
  const resp = Math.sin(pose.respirar ?? 0) * 2.2;
  const quadril: P = [pose.dx ?? 0, -pr.perna + bob + (pose.agachar ?? 0)];
  const lean = pose.tronco ?? 0;
  const pescoco = add(quadril, rot([0, -pr.tronco - resp], lean));
  const ombro = (s: number) => add(pescoco, rot([s * pr.ombro, 26], lean));
  const cabeca = add(pescoco, rot([0, -pr.cab * 0.92], lean + (pose.cabecaIncl ?? 0) * 0.3));

  const braco = (s: number, a: [number, number]) => {
    const S = ombro(s);
    const ang = s < 0 ? a : a;
    const d1 = dirMembro(s, ang[0], lean);
    const C = add(S, [d1[0] * pr.braco, d1[1] * pr.braco]);
    const d2 = dirMembro(s, ang[0] - ang[1], lean);
    const M = add(C, [d2[0] * pr.antebraco, d2[1] * pr.antebraco]);
    return { S, C, M, angM: Math.atan2(d2[1], d2[0]) };
  };
  const perna = (s: number, a: [number, number]) => {
    const H = add(quadril, [s * pr.quadril * 0.55, 0]);
    const c = pr.perna * pr.coxa, cn = pr.perna * (1 - pr.coxa) - 14;
    const d1 = dirMembro(s, a[0], 0);
    const J = add(H, [d1[0] * c, d1[1] * c * (1 - 0.18 * Math.sin(rad(a[1])))]);
    const d2 = dirMembro(s, a[0] - a[1] * 0.35, 0);
    const encurta = 1 - 0.3 * Math.sin(rad(Math.max(0, a[1])));
    const Pe = add(J, [d2[0] * cn * encurta, d2[1] * cn * encurta]);
    return { H, J, Pe };
  };

  const bE = braco(-1, pose.bracoE), bD = braco(1, pose.bracoD);
  const pE = perna(-1, pose.pernaE), pD = perna(1, pose.pernaD);

  const membro = (pts: P[], w: number, cor: string, key: string) => {
    const d = `M ${pts.map((p) => p.join(",")).join(" L ")}`;
    return (
      <g key={key}>
        <path d={d} stroke={tinta} strokeWidth={w + L * 2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={d} stroke={cor} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    );
  };

  const mao = (b: { M: P; angM: number }, s: number, tipo: Pose["maoE"], key: string) => {
    const a = (b.angM * 180) / Math.PI - 90;
    const r = 19 * (v.corpo === "crianca" ? 0.85 : 1);
    return (
      <g key={key} transform={`translate(${b.M[0]} ${b.M[1]}) rotate(${a})`}>
        {tipo === "punho" ? (
          <circle r={r} fill={pele} stroke={tinta} strokeWidth={L} />
        ) : tipo === "aponta" ? (
          <g>
            <path d={`M -2,0 L -2,${r * 2.2}`} stroke={tinta} strokeWidth={10 + L * 2} strokeLinecap="round" />
            <path d={`M -2,0 L -2,${r * 2.2}`} stroke={pele} strokeWidth={10} strokeLinecap="round" />
            <circle r={r} fill={pele} stroke={tinta} strokeWidth={L} />
          </g>
        ) : (
          <g>
            <ellipse cx={0} cy={r * 0.5} rx={r * 0.95} ry={r * 1.25} fill={pele} stroke={tinta} strokeWidth={L} />
            <path d={`M ${-s * r * 0.85},${r * 0.1} q ${-s * r * 0.55},${r * 0.2} ${-s * r * 0.5},${r * 0.9}`} stroke={tinta} strokeWidth={L * 0.8} fill="none" strokeLinecap="round" />
          </g>
        )}
      </g>
    );
  };

  const pe = (p: { Pe: P }, s: number, key: string) => (
    <path key={key} d={`M ${p.Pe[0] - s * 14},${p.Pe[1] - 6} q ${s * 22},-26 ${s * 46},-6 q ${s * 14},10 ${s * 6},20 l ${-s * 52},0 q ${-s * 10},-4 0,-14 z`}
      fill={sapato} stroke={tinta} strokeWidth={L} strokeLinejoin="round" />
  );

  // ---- tronco
  const w = pr.ombro + 14, wq = pr.quadril + 6;
  const troncoD = () => {
    const [nx, ny] = pescoco, [qx, qy] = quadril;
    const ombL = add(pescoco, rot([-w, 18], lean)), ombR = add(pescoco, rot([w, 18], lean));
    if (robe) {
      const hem = 24 + (pose.bob ?? 0) * 0;
      const sway = pose.saia ?? 0;
      const largH = wq + 38 + (v.roupa === "manto" ? 10 : 0);
      return `M ${nx - 22},${ny} C ${ombL[0]},${ombL[1] - 14} ${ombL[0] - 4},${ombL[1] + 10} ${ombL[0] - 2},${ombL[1] + 30}
        L ${qx - largH + sway},${-hem} Q ${qx + sway},${-hem + 12} ${qx + largH + sway},${-hem}
        L ${ombR[0] + 2},${ombR[1] + 30} C ${ombR[0] + 4},${ombR[1] + 10} ${ombR[0]},${ombR[1] - 14} ${nx + 22},${ny} Z`;
    }
    const qL = add(quadril, [-wq, 4]), qR = add(quadril, [wq, 4]);
    return `M ${nx - 24},${ny} C ${ombL[0]},${ombL[1] - 16} ${ombL[0] - 6},${ombL[1] + 8} ${ombL[0] - 2},${ombL[1] + 34}
      C ${ombL[0] + 2},${ombL[1] + 100} ${qL[0] - 6},${qL[1] - 40} ${qL[0]},${qL[1]}
      Q ${qx},${qy + 14} ${qR[0]},${qR[1]}
      C ${qR[0] + 6},${qR[1] - 40} ${ombR[0] - 2},${ombR[1] + 100} ${ombR[0] + 2},${ombR[1] + 34}
      C ${ombR[0] + 6},${ombR[1] + 8} ${ombR[0]},${ombR[1] - 16} ${nx + 24},${ny} Z`;
  };

  const virar = pose.virar ?? 0; // -1..1: rosto vira para os lados (3/4)
  const incl = pose.cabecaIncl ?? 0;
  const R = pr.cab;
  const cabecaD = `M 0,${-R} C ${R * 0.62},${-R} ${R},${-R * 0.62} ${R},${-R * 0.05} C ${R},${R * 0.55} ${R * 0.62},${R * 0.98} 0,${R}
    C ${-R * 0.62},${R * 0.98} ${-R},${R * 0.55} ${-R},${-R * 0.05} C ${-R},${-R * 0.62} ${-R * 0.62},${-R} 0,${-R} Z`;

  const sid = `pg-${id}`;
  const olhar = pose.olhar ?? [0, 0];

  // ---- olhos
  const olho = (s: number) => {
    const ex = s * R * 0.36 + virar * R * 0.22 * (s * virar > 0 ? 0.75 : 1);
    const ey = -R * 0.04;
    const rx = R * 0.17 * (1 - Math.abs(virar) * 0.15 * (s * virar < 0 ? 1 : 0));
    const ry = R * 0.21 * expr.olhoAbre;
    const ab = Math.max(0, Math.min(1, olhosAbertos)) * (1 - expr.palpebra);
    const pR = rx * 0.55 * expr.pupila;
    const px = olhar[0] * rx * 0.42 + virar * rx * 0.3, py = olhar[1] * ry * 0.38;
    const lidY = ey - ry + 2 * ry * (1 - ab);
    const inf = ey + ry - 2 * ry * expr.palpInf * 0.5;
    const cid = `${sid}-olho${s}`;
    // sobrancelha
    const sx = ex, sy = ey - ry - R * 0.12;
    const yi = sy - expr.sobInt * 0.9, yo = sy - expr.sobExt * 0.9;
    const xi = sx - s * rx * 1.05, xo = sx + s * rx * 1.15;
    return (
      <g key={s}>
        <clipPath id={cid}>
          <ellipse cx={ex} cy={ey} rx={rx} ry={ry} />
        </clipPath>
        <ellipse cx={ex} cy={ey} rx={rx} ry={ry} fill="#fffdf8" />
        <g clipPath={`url(#${cid})`}>
          <circle cx={ex + px} cy={ey + py} r={pR} fill={v.corOlho ?? "#3b2416"} />
          <circle cx={ex + px} cy={ey + py} r={pR * 0.58} fill="#0b0708" />
          <circle cx={ex + px + pR * 0.35} cy={ey + py - pR * 0.38} r={pR * 0.3} fill="#fff" />
          {/* pálpebra superior e inferior (pele) */}
          <rect x={ex - rx - 2} y={ey - ry - 4} width={rx * 2 + 4} height={Math.max(0, lidY - (ey - ry - 4))} fill={pele} />
          <rect x={ex - rx - 2} y={inf} width={rx * 2 + 4} height={ry * 2} fill={pele} />
        </g>
        <ellipse cx={ex} cy={ey} rx={rx} ry={ry} fill="none" stroke={tinta} strokeWidth={L * 0.8} />
        {ab < 0.98 && <line x1={ex - rx} x2={ex + rx} y1={lidY} y2={lidY} stroke={tinta} strokeWidth={L * 0.9} strokeLinecap="round" />}
        <path d={`M ${xi},${yi} Q ${(xi + xo) / 2},${Math.min(yi, yo) - 7} ${xo},${yo}`} stroke={v.cabelo === "careca" ? mulc(pele, 0.55) : v.corCabelo} strokeWidth={R * 0.085} strokeLinecap="round" fill="none" />
      </g>
    );
  };

  // ---- boca
  const bocaEl = () => {
    const bx = virar * R * 0.28, by = R * 0.5;
    const ab = Math.min(1, expr.bocaAbre + boca * 0.9);
    const lw = R * 0.26 * expr.bocaLarg * (1 - ab * 0.2);
    const c = expr.bocaCurva * R * 0.14;
    if (ab < 0.08) {
      return <path d={`M ${bx - lw},${by - c * 0.4} Q ${bx},${by + c} ${bx + lw},${by - c * 0.4}`} stroke={tinta} strokeWidth={L} fill="none" strokeLinecap="round" />;
    }
    const h = R * 0.32 * ab;
    const d = `M ${bx - lw},${by - c * 0.4} Q ${bx},${by - c * 0.2 - h * 0.15} ${bx + lw},${by - c * 0.4} Q ${bx + lw * 0.55},${by + h + c * 0.5} ${bx},${by + h + c * 0.6} Q ${bx - lw * 0.55},${by + h + c * 0.5} ${bx - lw},${by - c * 0.4} Z`;
    const cid = `${sid}-boca`;
    return (
      <g>
        <clipPath id={cid}><path d={d} /></clipPath>
        <path d={d} fill="#4a1520" />
        <g clipPath={`url(#${cid})`}>
          <ellipse cx={bx} cy={by + h + c * 0.6} rx={lw * 0.55} ry={h * 0.45} fill="#e0606e" />
          {expr.dentes > 0.2 && <rect x={bx - lw} y={by - c * 0.4 - 30} width={lw * 2} height={30 + h * 0.22 * expr.dentes} fill="#fffaf2" />}
        </g>
        <path d={d} fill="none" stroke={tinta} strokeWidth={L * 0.9} strokeLinejoin="round" />
      </g>
    );
  };

  // ---- cabelo (atrás e na frente)
  const cabeloTras = () => {
    const c = v.corCabelo;
    if (v.cabelo === "longo") return <path d={`M ${-R * 1.05},${-R * 0.2} C ${-R * 1.2},${R * 1.2} ${-R * 0.9},${R * 1.6} ${-R * 0.5},${R * 1.75} L ${R * 0.5},${R * 1.75} C ${R * 0.9},${R * 1.6} ${R * 1.2},${R * 1.2} ${R * 1.05},${-R * 0.2} Z`} fill={c} stroke={tinta} strokeWidth={L} />;
    if (v.cabelo === "veu") return <path d={`M ${-R * 1.15},${-R * 0.5} C ${-R * 1.3},${R * 0.9} ${-R * 1.25},${R * 1.6} ${-R * 1.1},${R * 2.1} L ${R * 1.1},${R * 2.1} C ${R * 1.25},${R * 1.6} ${R * 1.3},${R * 0.9} ${R * 1.15},${-R * 0.5} Z`} fill={c} stroke={tinta} strokeWidth={L} />;
    if (v.cabelo === "rabo") return <path d={`M ${R * 0.7},${-R * 0.5} q ${R * 0.9},${R * 0.1} ${R * 0.7},${R * 1.3} q ${-R * 0.1},${-R * 0.7} ${-R * 0.6},${-R * 0.9} z`} fill={c} stroke={tinta} strokeWidth={L} />;
    if (v.cabelo === "coque") return <circle cx={0} cy={-R * 1.05} r={R * 0.38} fill={c} stroke={tinta} strokeWidth={L} />;
    return null;
  };
  const cabeloFrente = () => {
    const c = v.corCabelo;
    const sh = mulc(c, 0.75);
    switch (v.cabelo) {
      case "curto":
        return <path d={`M ${-R * 1.02},${-R * 0.05} C ${-R * 1.1},${-R * 0.9} ${-R * 0.5},${-R * 1.18} ${R * 0.1},${-R * 1.1} C ${R * 0.8},${-R * 1.05} ${R * 1.1},${-R * 0.6} ${R * 1.02},${-R * 0.05} C ${R * 0.85},${-R * 0.45} ${R * 0.5},${-R * 0.55} ${R * 0.15},${-R * 0.62} C ${-R * 0.2},${-R * 0.42} ${-R * 0.7},${-R * 0.5} ${-R * 1.02},${-R * 0.05} Z`} fill={c} stroke={tinta} strokeWidth={L} strokeLinejoin="round" />;
      case "topete":
        return <path d={`M ${-R * 1.02},${-R * 0.1} C ${-R * 1.05},${-R * 0.9} ${-R * 0.4},${-R * 1.45} ${R * 0.35},${-R * 1.35} C ${R * 0.75},${-R * 1.3} ${R * 0.6},${-R * 1.1} ${R * 0.85},${-R * 0.95} C ${R * 1.1},${-R * 0.7} ${R * 1.08},${-R * 0.3} ${R * 1.02},${-R * 0.1} C ${R * 0.7},${-R * 0.55} ${R * 0.1},${-R * 0.75} ${-R * 0.3},${-R * 0.55} C ${-R * 0.6},${-R * 0.4} ${-R * 0.85},${-R * 0.3} ${-R * 1.02},${-R * 0.1} Z`} fill={c} stroke={tinta} strokeWidth={L} strokeLinejoin="round" />;
      case "espetado": {
        const pts: string[] = [];
        for (let i = 0; i <= 8; i++) {
          const a = Math.PI * (1.05 + (i / 8) * 0.9);
          const r1 = i % 2 === 0 ? R * 1.0 : R * 1.32;
          pts.push(`${Math.cos(a) * r1},${Math.sin(a) * r1 - R * 0.05}`);
        }
        return <path d={`M ${-R * 1.02},${-R * 0.05} L ${pts.join(" L ")} L ${R * 1.02},${-R * 0.05} Q 0,${-R * 0.55} ${-R * 1.02},${-R * 0.05} Z`} fill={c} stroke={tinta} strokeWidth={L} strokeLinejoin="round" />;
      }
      case "cacheado": {
        const cachos = Array.from({ length: 11 }, (_, i) => {
          const a = Math.PI * (1.0 + (i / 10) * 1.0);
          return [Math.cos(a) * R * 0.98, Math.sin(a) * R * 0.92 - R * 0.12] as P;
        });
        return (
          <g>
            {cachos.map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r={R * 0.3} fill={c} stroke={tinta} strokeWidth={L} />)}
            {cachos.map(([cx, cy], i) => <circle key={`i${i}`} cx={cx} cy={cy} r={R * 0.3 - L / 2} fill={c} />)}
            {cachos.slice(1, -1).map(([cx, cy], i) => <path key={`s${i}`} d={`M ${cx - 8},${cy + 4} q 8,-10 16,0`} stroke={sh} strokeWidth={4} fill="none" />)}
          </g>
        );
      }
      case "longo":
        return <path d={`M ${-R * 1.05},${R * 0.2} C ${-R * 1.15},${-R * 0.9} ${-R * 0.5},${-R * 1.15} 0,${-R * 1.1} C ${R * 0.5},${-R * 1.15} ${R * 1.15},${-R * 0.9} ${R * 1.05},${R * 0.2} C ${R * 0.95},${-R * 0.3} ${R * 0.6},${-R * 0.55} ${R * 0.05},${-R * 0.6} C ${-R * 0.3},${-R * 0.35} ${-R * 0.75},${-R * 0.4} ${-R * 1.05},${R * 0.2} Z`} fill={c} stroke={tinta} strokeWidth={L} strokeLinejoin="round" />;
      case "rabo":
        return <path d={`M ${-R * 1.02},${-R * 0.1} C ${-R * 1.05},${-R * 0.95} ${-R * 0.4},${-R * 1.15} ${R * 0.2},${-R * 1.08} C ${R * 0.85},${-R * 1.0} ${R * 1.1},${-R * 0.55} ${R * 1.02},${-R * 0.1} C ${R * 0.6},${-R * 0.5} ${-R * 0.2},${-R * 0.7} ${-R * 1.02},${-R * 0.1} Z`} fill={c} stroke={tinta} strokeWidth={L} strokeLinejoin="round" />;
      case "coque":
        return <path d={`M ${-R * 1.02},${-R * 0.05} C ${-R * 1.05},${-R * 0.95} ${R * 1.05},${-R * 0.95} ${R * 1.02},${-R * 0.05} C ${R * 0.6},${-R * 0.55} ${-R * 0.6},${-R * 0.55} ${-R * 1.02},${-R * 0.05} Z`} fill={c} stroke={tinta} strokeWidth={L} />;
      case "veu":
        return <path d={`M ${-R * 1.18},${-R * 0.1} C ${-R * 1.25},${-R * 1.2} ${R * 1.25},${-R * 1.2} ${R * 1.18},${-R * 0.1} C ${R * 0.95},${-R * 0.7} ${-R * 0.95},${-R * 0.7} ${-R * 1.18},${-R * 0.1} Z`} fill={c} stroke={tinta} strokeWidth={L} />;
      default:
        return null;
    }
  };

  const barba = () => {
    const c = v.corCabelo;
    if (!v.barba || v.barba === "nenhuma") return null;
    if (v.barba === "bigode") return <path d={`M ${-R * 0.32 + virar * R * 0.28},${R * 0.42} q ${R * 0.32},${-R * 0.16} ${R * 0.32},0 q 0,${-R * 0.16} ${R * 0.32},0 q ${-R * 0.1},${R * 0.14} ${-R * 0.32},${R * 0.04} q ${-R * 0.22},${R * 0.1} ${-R * 0.32},${-R * 0.04} z`} fill={c} stroke={tinta} strokeWidth={L * 0.7} />;
    const longa = v.barba === "longa";
    const bx = virar * R * 0.2;
    return (
      <path d={`M ${-R * 0.92},${R * 0.05} C ${-R * 0.9},${R * (longa ? 1.5 : 1.05)} ${bx - R * 0.2},${R * (longa ? 1.9 : 1.3)} ${bx},${R * (longa ? 1.95 : 1.3)} C ${bx + R * 0.2},${R * (longa ? 1.9 : 1.3)} ${R * 0.9},${R * (longa ? 1.5 : 1.05)} ${R * 0.92},${R * 0.05} C ${R * 0.7},${R * 0.55} ${bx + R * 0.4},${R * 0.38} ${bx},${R * 0.4} C ${bx - R * 0.4},${R * 0.38} ${-R * 0.7},${R * 0.55} ${-R * 0.92},${R * 0.05} Z M ${bx - R * 0.26},${R * 0.55} Q ${bx},${R * 0.82} ${bx + R * 0.26},${R * 0.55} Q ${bx},${R * 0.62} ${bx - R * 0.26},${R * 0.55} Z`}
        fill={c} fillRule="evenodd" stroke={tinta} strokeWidth={L} strokeLinejoin="round" />
    );
  };

  const tronco = troncoD();
  const corTronco = v.roupa === "jaleco" ? "#f4f6fb" : v.cor;

  // ---- detalhes de roupa
  const detalheRoupa = () => {
    const [nx, ny] = pescoco;
    switch (v.roupa) {
      case "jaleco":
        return (
          <g>
            <path d={`M ${nx - 26},${ny + 2} L ${nx},${ny + 80} L ${nx + 26},${ny + 2} Z`} fill={v.cor} stroke={tinta} strokeWidth={L * 0.7} />
            <path d={`M ${nx},${ny + 80} L ${quadril[0]},${quadril[1] + 10}`} stroke={tinta} strokeWidth={L * 0.6} />
            <path d={`M ${nx - 26},${ny + 2} l -22,46 l 26,10 Z M ${nx + 26},${ny + 2} l 22,46 l -26,10 Z`} fill="#e3e7f0" stroke={tinta} strokeWidth={L * 0.6} strokeLinejoin="round" />
            <rect x={nx + 30} y={ny + 90} width={34} height={8} rx={3} fill={cor2} />
          </g>
        );
      case "moletom":
        return (
          <g>
            <path d={`M ${nx - 30},${ny + 4} Q ${nx},${ny + 30} ${nx + 30},${ny + 4}`} stroke={tinta} strokeWidth={L * 0.7} fill={mulc(v.cor, 0.85)} />
            <path d={`M ${nx - 10},${ny + 22} l -4,48 M ${nx + 10},${ny + 22} l 4,48`} stroke={cor2} strokeWidth={5} strokeLinecap="round" />
            <path d={`M ${quadril[0] - 50},${quadril[1] - 70} q 50,-12 100,0 l 6,46 q -56,10 -112,0 z`} fill={mulc(v.cor, 0.88)} stroke={tinta} strokeWidth={L * 0.6} />
          </g>
        );
      case "terno":
        return (
          <g>
            <path d={`M ${nx - 22},${ny + 2} L ${nx},${ny + 110} L ${nx + 22},${ny + 2} Z`} fill="#f4f4f4" stroke={tinta} strokeWidth={L * 0.6} />
            <path d={`M ${nx - 6},${ny + 14} l 6,8 l 6,-8 l -2,70 l -4,8 l -4,-8 z`} fill={cor2} stroke={tinta} strokeWidth={L * 0.5} />
          </g>
        );
      case "tunica":
        return <path d={`M ${nx - 4},${ny + 6} L ${nx - 4},${-40}`} stroke={cor2} strokeWidth={10} opacity={0.8} />;
      case "manto":
        return (
          <g>
            <path d={`M ${nx - pr.ombro - 18},${ny + 20} Q ${nx},${ny + 70} ${nx + pr.ombro + 18},${ny + 20} L ${nx + pr.ombro + 30},${quadril[1] + 40} Q ${nx + 10},${quadril[1] - 20} ${nx - pr.ombro - 30},${quadril[1] + 40} Z`} fill={cor2} stroke={tinta} strokeWidth={L * 0.8} strokeLinejoin="round" />
            <path d={`M ${quadril[0] - wq - 10},${quadril[1] - 10} Q ${quadril[0]},${quadril[1] + 4} ${quadril[0] + wq + 10},${quadril[1] - 10}`} stroke={mulc(cor2, 0.7)} strokeWidth={14} fill="none" />
          </g>
        );
      case "vestido":
        return <path d={`M ${quadril[0] - wq - 4},${quadril[1] - 30} Q ${quadril[0]},${quadril[1] - 18} ${quadril[0] + wq + 4},${quadril[1] - 30}`} stroke={cor2} strokeWidth={12} fill="none" />;
      default:
        return <path d={`M ${nx - 24},${ny + 2} Q ${nx},${ny + 26} ${nx + 24},${ny + 2}`} stroke={tinta} strokeWidth={L * 0.7} fill={mulc(v.cor, 0.85)} />;
    }
  };

  const larguraBraco = 36 * pr.larg * (v.corpo === "crianca" ? 0.8 : 1);
  const larguraPerna = 42 * pr.larg * (v.corpo === "crianca" ? 0.85 : 1);

  const desenhaBraco = (b: ReturnType<typeof braco>, s: number, tipo: Pose["maoE"], k: string) => (
    <g key={k}>
      {mangaLonga ? membro([b.S, b.C, b.M], larguraBraco, corManga, `${k}m`) : (
        <g>
          {membro([b.C, b.M], larguraBraco * 0.85, pele, `${k}a`)}
          {membro([b.S, add(b.S, [(b.C[0] - b.S[0]) * 0.55, (b.C[1] - b.S[1]) * 0.55])], larguraBraco * 1.12, v.roupa === "regata" ? pele : v.cor, `${k}b`)}
        </g>
      )}
      {mao(b, s, tipo, `${k}h`)}
      {(s > 0 ? itemD : itemE) && (
        // desfaz o espelhamento (dir = -1) para textos/telas não aparecerem invertidos
        <g transform={`translate(${b.M[0]} ${b.M[1]}) scale(${dir} 1)`}>{s > 0 ? itemD : itemE}</g>
      )}
    </g>
  );

  const frenteE = pose.frenteE ?? false, frenteD = pose.frenteD ?? false;
  const tid = `${sid}-tr`, hid = `${sid}-hd`;

  return (
    <g transform={`translate(${x} ${y}) scale(${escala * dir} ${escala})`} opacity={opacidade}>
      {brilhoCorpo > 0 && (
        <ellipse cx={quadril[0]} cy={-pr.perna - pr.tronco * 0.4} rx={190} ry={360} fill={`url(#${sid}-aura)`} opacity={brilhoCorpo} />
      )}
      <defs>
        <radialGradient id={`${sid}-aura`}><stop offset="0" stopColor="#bff7ff" stopOpacity="0.9" /><stop offset="0.5" stopColor="#5fd8ff" stopOpacity="0.35" /><stop offset="1" stopColor="#3aa0ff" stopOpacity="0" /></radialGradient>
        <clipPath id={tid}><path d={tronco} /></clipPath>
        <clipPath id={hid}><path d={cabecaD} /></clipPath>
      </defs>
      {/* sombra no chão */}
      <ellipse cx={quadril[0]} cy={4} rx={95 * pr.larg} ry={16} fill="#000" opacity={0.22} />
      {/* braços atrás */}
      {!frenteE && desenhaBraco(bE, -1, pose.maoE, "bE")}
      {!frenteD && desenhaBraco(bD, 1, pose.maoD, "bD")}
      {/* pernas */}
      {[[pE, -1], [pD, 1]].map(([p, s]) => {
        const pp = p as ReturnType<typeof perna>;
        return (
          <g key={`p${s}`}>
            {!robe && membro([pp.H, pp.J, pp.Pe], larguraPerna, calca, `pl${s}`)}
            {robe && membro([add(pp.J, [0, 20]), pp.Pe], larguraPerna * 0.7, pele, `pl${s}`)}
            {pe(pp, s as number, `pe${s}`)}
          </g>
        );
      })}
      {/* tronco */}
      <path d={tronco} fill={corTronco} />
      <g clipPath={`url(#${tid})`}>
        <path d={tronco} fill={E.corSombra} opacity={E.sombra} />
        <path d={tronco} fill={corTronco} transform="translate(40 -6)" />
        {detalheRoupa()}
        {E.brilho > 0 && <path d={tronco} fill="none" stroke={E.corBrilho} strokeWidth={12} opacity={E.brilho} transform="translate(-9 3)" />}
      </g>
      <path d={tronco} fill="none" stroke={tinta} strokeWidth={L} strokeLinejoin="round" />
      {/* pescoço */}
      {membro([add(pescoco, [0, 10]), add(pescoco, [0, -30])], 40 * pr.larg * 0.9, pele, "pesc")}
      {v.roupa === "moletom" && <path d={`M ${pescoco[0] - pr.ombro},${pescoco[1] + 12} Q ${pescoco[0]},${pescoco[1] - 40} ${pescoco[0] + pr.ombro},${pescoco[1] + 12}`} stroke={tinta} strokeWidth={L} fill={mulc(v.cor, 0.8)} />}
      {/* cabeça */}
      <g transform={`translate(${cabeca[0]} ${cabeca[1]}) rotate(${incl + lean * 0.5})`}>
        {cabeloTras()}
        {/* orelhas */}
        {v.cabelo !== "veu" && v.cabelo !== "longo" && [-1, 1].map((s) => (
          <g key={s}>
            <ellipse cx={s * (R * 0.98) + virar * -R * 0.1} cy={R * 0.08} rx={R * 0.16} ry={R * 0.22} fill={pele} stroke={tinta} strokeWidth={L} />
            <path d={`M ${s * R * 0.98},${R * 0.0} q ${s * 6},6 0,14`} stroke={mulc(pele, 0.7)} strokeWidth={4} fill="none" />
          </g>
        ))}
        <path d={cabecaD} fill={pele} />
        <g clipPath={`url(#${hid})`}>
          {/* sombra cel do rosto (luz vindo da direita-alto) */}
          <path d={cabecaD} fill={E.corSombra} opacity={E.sombra * 0.75} />
          <path d={cabecaD} transform={`translate(${R * 0.2 + virar * 8} ${-R * 0.1})`} fill={pele} />
          {E.brilho > 0 && <path d={cabecaD} fill="none" stroke={E.corBrilho} strokeWidth={12} opacity={E.brilho} transform="translate(-10 4)" />}
          {/* rubor */}
          {[-1, 1].map((s) => <ellipse key={s} cx={s * R * 0.55 + virar * R * 0.2} cy={R * 0.3} rx={R * 0.17} ry={R * 0.09} fill="#ff6f7d" opacity={0.18 + expr.bochecha * 0.4} />)}
        </g>
        <path d={cabecaD} fill="none" stroke={tinta} strokeWidth={L} />
        {barba()}
        {cabeloFrente()}
        {[-1, 1].map((s) => olho(s))}
        {/* nariz */}
        <path d={`M ${virar * R * 0.34 + 2},${R * 0.12} q ${8 + virar * 6},${R * 0.14} ${-2},${R * 0.2}`} stroke={mulc(pele, 0.55)} strokeWidth={L * 0.8} fill="none" strokeLinecap="round" />
        {v.barba !== "longa" && v.barba !== "curta" && bocaEl()}
        {(v.barba === "longa" || v.barba === "curta") && <g>{bocaEl()}</g>}
        {v.oculos && (
          <g fill="none" stroke={tinta} strokeWidth={L * 0.8}>
            {[-1, 1].map((s) => <circle key={s} cx={s * R * 0.36 + virar * R * 0.22} cy={-R * 0.04} r={R * 0.26} fill="#bfe6ff" fillOpacity={0.15} />)}
            <path d={`M ${-R * 0.1 + virar * R * 0.22},${-R * 0.06} q ${R * 0.1},-10 ${R * 0.2},0`} />
          </g>
        )}
        {expr.suor > 0.1 && <path d={`M ${R * 0.85},${-R * 0.35} q 14,26 0,34 q -14,-8 0,-34 z`} fill="#8fd8ff" stroke={tinta} strokeWidth={3} opacity={expr.suor} />}
      </g>
      {/* braços na frente */}
      {frenteE && desenhaBraco(bE, -1, pose.maoE, "bEf")}
      {frenteD && desenhaBraco(bD, 1, pose.maoD, "bDf")}
    </g>
  );
};
