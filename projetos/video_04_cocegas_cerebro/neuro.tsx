// VÍDEO 04 — kit visual EXCLUSIVO deste episódio (IDs "co04-"): personagens, sala, pele, cérebro 2D, laboratório, parque e casa.
import React from "react";
import { Personagem, ESTILOS_PERSONAGEM, Visual, Estilo } from "../../engine/src/kit/Personagem";
import { Pose } from "../../engine/src/kit/poses";
import { Expr } from "../../engine/src/kit/expressoes";
import { clamp01, lerp, piscar, rnd, wobble } from "../../engine/src/kit/anim";

export const TINTA = "#1d1630";
export const EST: Estilo = ESTILOS_PERSONAGEM.flat;
export const LARANJA = "#ff8a2a";
export const CIANO = "#3fe0ff";
export const ROXO = "#8e4fd8";
export const MAGENTA = "#e24fae";
export const LILAS = "#c8a6ff";
export const AZUL_PREV = "#5aa8ff";

export const PROTAG: Visual = { pele: "#e2b38f", cabelo: "curto", corCabelo: "#121014", roupa: "camiseta", cor: "#ffd23f", cor2: "#f2b800", calca: "#2f5fbf", sapato: "#ffffff", corOlho: "#2a1a12", corpo: "medio" };
export const AMIGO: Visual = { pele: "#9a6a48", cabelo: "cacheado", corCabelo: "#6b4226", roupa: "camiseta", cor: "#3fbf6a", cor2: "#2f9a52", calca: "#8a8f99", sapato: "#3a3a3a", corOlho: "#2a1a12", corpo: "medio" };
export const PARTICIPANTE: Visual = { pele: "#f0c8a8", cabelo: "rabo", corCabelo: "#c06a2a", roupa: "moletom", cor: "#b48ce8", cor2: "#9a70d0", calca: "#4a4060", sapato: "#e0e0e0", corOlho: "#2a1a12", corpo: "magro" };

// ---- geometria do rig (mesma conta do Personagem) para saber onde está a mão / cabeça
const rad = (d: number) => (d * Math.PI) / 180;
const rot = ([x, y]: [number, number], d: number): [number, number] => [x * Math.cos(rad(d)) - y * Math.sin(rad(d)), x * Math.sin(rad(d)) + y * Math.cos(rad(d))];
export const maoDe = (x: number, y: number, escala: number, p: Pose, lado: 1 | -1, dir: 1 | -1 = 1): [number, number] => {
  const lean = p.tronco ?? 0;
  const resp = Math.sin(p.respirar ?? 0) * 2.2;
  const q: [number, number] = [p.dx ?? 0, -235 + (p.bob ?? 0) + (p.agachar ?? 0)];
  const pe = rot([0, -205 - resp], lean);
  const pesc: [number, number] = [q[0] + pe[0], q[1] + pe[1]];
  const om = rot([lado * 64, 26], lean);
  const S: [number, number] = [pesc[0] + om[0], pesc[1] + om[1]];
  const a = lado > 0 ? p.bracoD : p.bracoE;
  const d1 = rot([lado * Math.sin(rad(a[0])), Math.cos(rad(a[0]))], lean);
  const C: [number, number] = [S[0] + d1[0] * 108, S[1] + d1[1] * 108];
  const d2 = rot([lado * Math.sin(rad(a[0] - a[1])), Math.cos(rad(a[0] - a[1]))], lean);
  const M: [number, number] = [C[0] + d2[0] * 98, C[1] + d2[1] * 98];
  return [x + dir * escala * M[0], y + escala * M[1]];
};
export const cabecaDe = (x: number, y: number, escala: number, p: Pose): [number, number] => {
  const lean = p.tronco ?? 0;
  const q = -235 + (p.bob ?? 0) + (p.agachar ?? 0);
  const pe = rot([0, -205], lean);
  const a = rot([0, -90], lean + (p.cabecaIncl ?? 0) * 0.3);
  return [x + escala * ((p.dx ?? 0) + pe[0] + a[0]), y + escala * (q + pe[1] + a[1])];
};

export const Pessoa: React.FC<{ v: Visual; id: string; x: number; y: number; escala: number; pose: Pose; expr: Expr; f: number; dir?: 1 | -1; boca?: number; seed?: number; itemD?: React.ReactNode; itemE?: React.ReactNode }> = ({
  v, id, x, y, escala, pose, expr, f, dir = 1, boca = 0, seed = 1, itemD, itemE,
}) => <Personagem id={id} x={x} y={y} escala={escala} dir={dir} visual={v} estilo={EST} pose={pose} expr={expr} olhosAbertos={piscar(f, seed)} boca={boca} itemD={itemD} itemE={itemE} />;

/** Marcas de "cócegas" (linhas tremidas) em volta do ponto de contato. */
export const MarcasToque: React.FC<{ x: number; y: number; f: number; forca: number; cor?: string }> = ({ x, y, f, forca, cor = "#ffffff" }) => forca <= 0 ? null : (
  <g transform={`translate(${x} ${y})`} opacity={clamp01(forca)}>
    {[0, 1, 2, 3, 4].map((i) => {
      const a = -70 + i * 35 + Math.sin(f * 0.6 + i) * 8;
      const r0 = 40 + 6 * Math.sin(f * 0.9 + i), r1 = r0 + 18 + 22 * forca;
      return <line key={i} x1={Math.cos(rad(a)) * r0} y1={Math.sin(rad(a)) * r0} x2={Math.cos(rad(a)) * r1} y2={Math.sin(rad(a)) * r1} stroke={cor} strokeWidth={7} strokeLinecap="round" />;
    })}
  </g>
);

// ------------------------------------------------------------------ SALA (layout fixo nas cenas 01, 06, 07, 08, 12)
export const SALA_ASSENTO = 1470; // topo do assento do sofá
export const SalaFundo: React.FC<{ f: number; luz?: number }> = ({ f, luz = 0 }) => (
  <g>
    <rect x={-1500} y={-1500} width={5000} height={3300} fill="#fff1c9" />
    {Array.from({ length: 30 }, (_, i) => <circle key={i} cx={-600 + (i % 10) * 240} cy={200 + Math.floor(i / 10) * 300} r={10} fill="#ffd98a" />)}
    {/* janela à direita */}
    <g transform="translate(900 640)">
      <rect x={-170} y={-260} width={340} height={520} rx={14} fill="#9fe0ff" stroke={TINTA} strokeWidth={10} />
      <circle cx={60 + Math.sin(f * 0.01) * 10} cy={-150} r={50} fill="#fff6c8" opacity={0.8 + 0.2 * Math.sin(f * 0.03)} />
      <path d="M -170,160 C -80,110 0,150 80,120 C 140,100 170,130 170,120 L 170,260 L -170,260 Z" fill="#7fd36a" />
      <line x1={0} y1={-260} x2={0} y2={260} stroke={TINTA} strokeWidth={8} /><line x1={-170} y1={0} x2={170} y2={0} stroke={TINTA} strokeWidth={8} />
    </g>
    <path d={`M 730,380 L 300,1700 L 900,1700 L 1070,380 Z`} fill="#fff6c8" opacity={0.18 + 0.06 * Math.sin(f * 0.02) + luz * 0.1} />
    {/* quadro */}
    <g transform="translate(260 560) rotate(-3)"><rect x={-120} y={-90} width={240} height={180} fill="#ff8a2a" stroke={TINTA} strokeWidth={8} /><circle cx={-30} cy={0} r={40} fill="#3fe0ff" /><rect x={20} y={-30} width={60} height={70} fill="#8e4fd8" /></g>
    {/* chão */}
    <rect x={-1500} y={1720} width={5000} height={800} fill="#e8a35a" />
    <rect x={-1500} y={1712} width={5000} height={14} fill="#b87a3a" />
    {/* encosto do sofá azul + almofadas */}
    <rect x={120} y={1150} width={840} height={340} rx={60} fill="#3d7bd9" stroke={TINTA} strokeWidth={10} />
    <rect x={190} y={1210} width={190} height={170} rx={40} fill="#ffd23f" stroke={TINTA} strokeWidth={7} transform={`rotate(-6 285 1295)`} />
    <rect x={710} y={1210} width={190} height={170} rx={40} fill="#ff8a2a" stroke={TINTA} strokeWidth={7} transform={`rotate(5 805 1295)`} />
    {/* planta em vaso */}
    <g transform="translate(1040 1720)">
      <path d="M -60,0 L 60,0 L 48,-130 L -48,-130 Z" fill="#c8553d" stroke={TINTA} strokeWidth={8} />
      {[[-40, -320, -160, -380], [20, -330, 120, -470], [-50, -260, -30, -520]].map(([a, b, c, d], i) => (
        <path key={i} transform={`rotate(${wobble(f, i, 0.5) * 4} 0 -130)`} d={`M 0,-130 C ${a},${b} ${c},${d} ${c * 0.9},${d - 20} C ${c * 0.6},${d * 0.8} ${a / 2},${b / 1.5} 0,-130 Z`} fill={i % 2 ? "#3fbf6a" : "#2f9a52"} stroke={TINTA} strokeWidth={6} />
      ))}
    </g>
    {/* mesa lateral */}
    <g transform="translate(40 1720)"><rect x={-70} y={-260} width={140} height={22} rx={6} fill="#8a5a3c" stroke={TINTA} strokeWidth={6} /><rect x={-8} y={-240} width={16} height={240} fill="#8a5a3c" /><rect x={-30} y={-320} width={40} height={60} rx={8} fill="#3fe0ff" stroke={TINTA} strokeWidth={5} /></g>
  </g>
);
/** Frente do assento (desenhar DEPOIS da pessoa sentada: esconde quadril e coxas). */
export const SofaFrente: React.FC = () => (
  <g>
    <rect x={90} y={SALA_ASSENTO} width={900} height={150} rx={30} fill="#2f63b3" stroke={TINTA} strokeWidth={10} />
    <rect x={60} y={1290} width={110} height={330} rx={46} fill="#3d7bd9" stroke={TINTA} strokeWidth={10} />
    <rect x={910} y={1290} width={110} height={330} rx={46} fill="#3d7bd9" stroke={TINTA} strokeWidth={10} />
    <rect x={120} y={1620} width={26} height={100} fill="#3a2a22" /><rect x={934} y={1620} width={26} height={100} fill="#3a2a22" />
  </g>
);
export const Poltrona: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-170} y={-420} width={340} height={300} rx={50} fill="#e24fae" stroke={TINTA} strokeWidth={9} />
  </g>
);
export const PoltronaFrente: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-190} y={-200} width={380} height={130} rx={30} fill="#c23f92" stroke={TINTA} strokeWidth={9} />
    <rect x={-210} y={-300} width={70} height={240} rx={30} fill="#e24fae" stroke={TINTA} strokeWidth={9} />
    <rect x={140} y={-300} width={70} height={240} rx={30} fill="#e24fae" stroke={TINTA} strokeWidth={9} />
  </g>
);

// ------------------------------------------------------------------ PELE EM CORTE 2D
/** Corte esquemático: tecido da camiseta, pele (camadas), sensores ilustrativos e fibras nervosas indo para a direita. */
export const PeleCorte: React.FC<{ f: number; pressao: number; pulsos: number; forcaPulso?: number; corTecido?: string }> = ({ f, pressao, pulsos, forcaPulso = 1, corTecido = "#ffd23f" }) => {
  const dent = pressao * 40;
  const sup = (x: number) => 520 + dent * Math.exp(-((x - 540) ** 2) / 22000);
  let d = `M -200,${sup(-200)}`;
  for (let x = -200; x <= 1300; x += 30) d += ` L ${x},${sup(x)}`;
  const sensores = Array.from({ length: 9 }, (_, i) => [180 + i * 90 + (i % 2) * 20, 680 + (i % 3) * 70]);
  return (
    <g>
      <rect x={-200} y={-400} width={1500} height={3000} fill="#2a1f45" />
      {/* tecido (camiseta) acima da pele */}
      <path d={`M -200,${sup(-200) - 36} ${Array.from({ length: 51 }, (_, k) => `L ${-200 + k * 30},${sup(-200 + k * 30) - 36}`).join(" ")} L 1300,${sup(1300)} ${Array.from({ length: 51 }, (_, k) => `L ${1300 - k * 30},${sup(1300 - k * 30)}`).join(" ")} Z`} fill={corTecido} stroke={TINTA} strokeWidth={5} />
      {/* epiderme / derme / tecido abaixo */}
      <path d={`${d} L 1300,640 L -200,640 Z`} fill="#f6c6a6" stroke={TINTA} strokeWidth={6} />
      <rect x={-200} y={640} width={1500} height={320} fill="#f0a8a0" />
      <rect x={-200} y={960} width={1500} height={300} fill="#ffe2a0" opacity={0.85} />
      <text x={70} y={610} fontFamily="Montserrat" fontWeight={900} fontSize={28} fill={TINTA} opacity={0.7}>pele</text>
      {/* fibras nervosas */}
      {sensores.map(([sx, sy], i) => <path key={`n${i}`} d={`M ${sx},${sy} C ${sx + 40},${sy + 160} ${900},${1080 + i * 6} 1300,${1100 + i * 8}`} fill="none" stroke="#fff6e0" strokeWidth={6} opacity={0.8} />)}
      {/* sensores (ilustrativos) */}
      {sensores.map(([sx, sy], i) => {
        const perto = Math.exp(-((sx - 540) ** 2) / 60000);
        const aceso = pulsos * perto;
        return <g key={i}><circle cx={sx} cy={sy} r={18 + 8 * aceso * forcaPulso} fill={CIANO} opacity={0.35 + 0.65 * aceso} stroke={TINTA} strokeWidth={4} /><circle cx={sx} cy={sy} r={40 * aceso * forcaPulso} fill={CIANO} opacity={0.25 * aceso} /></g>;
      })}
      {/* pulsos viajando pelas fibras */}
      {pulsos > 0 && sensores.map(([sx, sy], i) => {
        const perto = Math.exp(-((sx - 540) ** 2) / 60000);
        if (perto < 0.25) return null;
        return Array.from({ length: 3 }, (_, k) => {
          const u = ((f * 0.025 + k / 3 + i * 0.1) % 1);
          const t = u, x = (1 - t) ** 3 * sx + 3 * (1 - t) ** 2 * t * (sx + 40) + 3 * (1 - t) * t * t * 900 + t ** 3 * 1300;
          const y = (1 - t) ** 3 * sy + 3 * (1 - t) ** 2 * t * (sy + 160) + 3 * (1 - t) * t * t * (1080 + i * 6) + t ** 3 * (1100 + i * 8);
          return <circle key={`${i}-${k}`} cx={x} cy={y} r={10 * forcaPulso} fill={LARANJA} opacity={pulsos * perto} />;
        });
      })}
    </g>
  );
};

// ------------------------------------------------------------------ CÉREBRO 2D (perfil, frente à esquerda)
export const CEREBRO = { motor: [40, -150] as [number, number], somato: [110, -140] as [number, number], cerebelo: [210, 110] as [number, number], tronco: [140, 190] as [number, number], frontal: [-180, -40] as [number, number] };
export const Cerebro: React.FC<{ f: number; motor?: number; somato?: number; cerebelo?: number; rede?: number }> = ({ f, motor = 0, somato = 0, cerebelo = 0, rede = 0 }) => (
  <g>
    <path d="M -300,-20 C -320,-180 -160,-290 20,-290 C 200,-290 320,-180 320,-40 C 320,60 260,110 170,110 L -170,110 C -260,110 -300,60 -300,-20 Z" fill={ROXO} stroke={TINTA} strokeWidth={9} />
    {/* sulcos */}
    {["M -220,-80 C -160,-140 -100,-60 -40,-120", "M -100,-220 C -60,-170 0,-200 40,-150", "M 60,-250 C 80,-180 120,-170 100,-90", "M 160,-200 C 200,-150 240,-160 260,-100", "M -240,40 C -160,20 -80,60 0,30 C 80,0 160,40 240,20", "M -60,-40 C -20,-10 40,-60 90,-20"].map((d, i) => <path key={i} d={d} fill="none" stroke="#5e2e9e" strokeWidth={8} strokeLinecap="round" />)}
    {/* faixa motora e faixa somatossensorial */}
    <path d="M 10,-285 C 0,-200 20,-120 40,-20" fill="none" stroke={MAGENTA} strokeWidth={30} strokeLinecap="round" opacity={0.25 + 0.75 * motor} />
    <path d="M 80,-280 C 80,-200 100,-120 120,-30" fill="none" stroke={CIANO} strokeWidth={26} strokeLinecap="round" opacity={0.15 + 0.85 * somato} />
    {/* cerebelo */}
    <g>
      <ellipse cx={210} cy={130} rx={110} ry={70} fill={LILAS} stroke={TINTA} strokeWidth={8} />
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M ${120 + i * 10},${100 + i * 16} C 180,${90 + i * 18} 260,${100 + i * 16} 310,${110 + i * 12}`} fill="none" stroke="#9a78e0" strokeWidth={5} />)}
      <ellipse cx={210} cy={130} rx={130} ry={88} fill={LILAS} opacity={0.5 * cerebelo * (0.7 + 0.3 * Math.sin(f * 0.15))} />
    </g>
    {/* tronco encefálico */}
    <path d="M 100,100 C 110,170 130,240 120,320 L 170,320 C 170,250 170,170 160,100 Z" fill="#b07ae8" stroke={TINTA} strokeWidth={7} />
    {/* rede: linhas finas ligando cerebelo a outras regiões */}
    {rede > 0 && [CEREBRO.motor, CEREBRO.somato, CEREBRO.frontal, [-60, -60] as [number, number]].map(([x, y], i) => (
      <g key={i} opacity={rede}>
        <path d={`M 200,110 Q ${(200 + x) / 2},${Math.min(110, y) - 80} ${x},${y}`} fill="none" stroke="#ffffff" strokeWidth={4} strokeDasharray="10 8" strokeDashoffset={-f * 2} />
        <circle cx={x} cy={y} r={12} fill="#ffffff" />
      </g>
    ))}
  </g>
);
/** pontinhos que percorrem um caminho (lista de pontos) — impulso ilustrativo */
export const Fluxo: React.FC<{ pts: [number, number][]; f: number; cor: string; prog: number; n?: number; vel?: number; larg?: number; tracejado?: boolean }> = ({ pts, f, cor, prog, n = 6, vel = 0.03, larg = 10, tracejado }) => {
  if (prog <= 0) return null;
  const segs = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const tot = segs.reduce((a, b) => a + b, 0);
  const em = (u: number): [number, number] => {
    let d = u * tot;
    for (let i = 0; i < segs.length; i++) {
      if (d <= segs[i]) { const t = d / segs[i]; return [lerp(pts[i][0], pts[i + 1][0], t), lerp(pts[i][1], pts[i + 1][1], t)]; }
      d -= segs[i];
    }
    return pts[pts.length - 1];
  };
  const dpath = "M " + pts.map((p) => p.join(",")).join(" L ");
  return (
    <g>
      <path d={dpath} fill="none" stroke={cor} strokeWidth={larg} strokeLinecap="round" strokeLinejoin="round" opacity={0.35} strokeDasharray={tracejado ? "16 12" : `${tot}`} strokeDashoffset={tracejado ? -f * 2 : tot * (1 - clamp01(prog))} />
      {Array.from({ length: n }, (_, k) => {
        const u = ((f * vel + k / n) % 1);
        if (u > prog) return null;
        const [x, y] = em(u);
        return <g key={k}><circle cx={x} cy={y} r={larg * 1.6} fill={cor} opacity={0.3} /><circle cx={x} cy={y} r={larg * 0.8} fill={cor} /></g>;
      })}
    </g>
  );
};

/** Cabeça em perfil (silhueta) com o cérebro dentro; origem = centro do cérebro. */
export const CabecaPerfil: React.FC<{ f: number; children: React.ReactNode; transparencia?: number }> = ({ f, children, transparencia = 1 }) => (
  <g>
    <path d="M -380,-60 C -390,-300 -180,-420 40,-410 C 280,-400 420,-260 420,-60 C 420,80 380,170 330,230 L 300,420 L 80,420 L 60,330 C -40,330 -120,320 -170,300 C -220,280 -230,240 -240,210 C -280,200 -300,190 -300,160 C -330,150 -340,120 -330,100 C -370,60 -380,20 -380,-60 Z" fill="#e2b38f" stroke={TINTA} strokeWidth={10} />
    <path d="M -380,-60 C -390,-300 -180,-420 40,-410 C 280,-400 420,-260 420,-60 C 380,-160 300,-250 160,-300 C 0,-340 -200,-300 -380,-60 Z" fill="#121014" opacity={1 - transparencia * 0.6} />
    <g opacity={transparencia}><ellipse cx={20} cy={-40} rx={350} ry={290} fill="#1d1630" opacity={0.75} />{children}</g>
    <circle cx={-250} cy={-60} r={14} fill={TINTA} opacity={1 - transparencia * 0.5} />
  </g>
);

export const Folha: React.FC<{ x: number; y: number; r: number; cor?: string }> = ({ x, y, r, cor = "#7fd36a" }) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`}><path d="M 0,-30 C 26,-20 26,20 0,34 C -26,20 -26,-20 0,-30 Z" fill={cor} stroke={TINTA} strokeWidth={4} /><line x1={0} y1={-26} x2={0} y2={30} stroke={TINTA} strokeWidth={3} /></g>
);
export const ArvoreParque: React.FC<{ x: number; y: number; s: number; f: number }> = ({ x, y, s, f }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -24,0 L -16,-220 L 16,-220 L 24,0 Z" fill="#8a5a3c" stroke={TINTA} strokeWidth={7} />
    <g transform={`rotate(${wobble(f, 7, 0.5) * 3} 0 -220)`}>{[[-80, -260, 100], [70, -280, 105], [0, -360, 120], [-20, -230, 80]].map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} fill={i % 2 ? "#3fbf6a" : "#2f9a52"} stroke={TINTA} strokeWidth={7} />)}</g>
  </g>
);
export const semente = rnd;
