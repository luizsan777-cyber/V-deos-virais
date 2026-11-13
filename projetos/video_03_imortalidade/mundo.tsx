// VÍDEO 03 — kit visual EXCLUSIVO deste episódio (IDs "im03-"). Personagens, cidade, hospital e passagem do tempo.
import React from "react";
import { Personagem, ESTILOS_PERSONAGEM, Visual, Estilo } from "../../engine/src/kit/Personagem";
import { Pose } from "../../engine/src/kit/poses";
import { Expr } from "../../engine/src/kit/expressoes";
import { clamp01, eio, eout, lerp, ramp, rnd, wobble, piscar } from "../../engine/src/kit/anim";

export const TINTA = "#1e1a2b";
export const EST: Estilo = ESTILOS_PERSONAGEM.conto;
export const mix = (a: string, b: string, t: number) => {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const c = (s: number) => Math.round(lerp((pa >> s) & 255, (pb >> s) & 255, clamp01(t)));
  return `#${((c(16) << 16) | (c(8) << 8) | c(0)).toString(16).padStart(6, "0")}`;
};

// ------------------------------------------------------------------ PROTAGONISTA (mesmo homem em todas as idades)
/** idade 0 = ~30 anos; 0.35 primeiros grisalhos; 0.65 grisalho; 1 = cabelo quase todo branco. */
export const corCabeloIdade = (i: number) => (i < 0.35 ? mix("#5a3a22", "#7d6a5a", i / 0.35) : i < 0.65 ? mix("#7d6a5a", "#a9a5a0", (i - 0.35) / 0.3) : mix("#a9a5a0", "#eeeeee", (i - 0.65) / 0.35));
export const protag = (idade: number): Visual => ({
  pele: "#a8714f", cabelo: "curto", corCabelo: corCabeloIdade(idade), roupa: "camiseta", cor: "#2a52be", cor2: "#1d3d93",
  calca: "#3a3d45", sapato: "#ececec", corOlho: "#3a2416", corpo: "medio",
});
/** postura que muda com a idade (somada à pose da cena) */
export const posturaIdade = (p: Pose, idade: number): Pose => ({
  ...p, tronco: (p.tronco ?? 0) + idade * 5, cabecaIncl: (p.cabecaIncl ?? 0) + idade * 3, bob: (p.bob ?? 0) + idade * 10,
  bracoE: [p.bracoE[0], p.bracoE[1] + idade * 12], bracoD: [p.bracoD[0], p.bracoD[1] + idade * 12],
});
/** centro da cabeça do Personagem "medio" (mesma conta do rig) */
export const cabecaDe = (x: number, y: number, escala: number, p: Pose, dir = 1): [number, number] => {
  const rad = (d: number) => (d * Math.PI) / 180;
  const lean = p.tronco ?? 0, bob = p.bob ?? 0;
  const qy = -235 + bob + (p.agachar ?? 0), qx = p.dx ?? 0;
  const px = qx + Math.sin(rad(lean)) * 205, py = qy - Math.cos(rad(lean)) * 205;
  const a = lean + (p.cabecaIncl ?? 0) * 0.3;
  return [x + dir * escala * (px + Math.sin(rad(a)) * 90), y + escala * (py - Math.cos(rad(a)) * 90)];
};
/** rugas e linhas de expressão desenhadas sobre o rosto (aparecem com a idade) */
export const Rugas: React.FC<{ c: [number, number]; escala: number; idade: number }> = ({ c, escala, idade }) => {
  const o = clamp01((idade - 0.25) / 0.6);
  if (o <= 0) return null;
  return (
    <g transform={`translate(${c[0]} ${c[1]}) scale(${escala})`} opacity={o} stroke="#6b3f28" strokeWidth={3.2} fill="none" strokeLinecap="round">
      <path d="M -30,-58 Q 0,-64 30,-58" /><path d="M -24,-48 Q 0,-53 24,-48" opacity={clamp01(o * 2 - 0.6)} />
      <path d="M -62,-6 L -72,-12 M -62,2 L -73,2" /><path d="M 62,-6 L 72,-12 M 62,2 L 73,2" />
      <path d="M -26,30 Q -34,44 -28,56" opacity={clamp01(o * 1.5 - 0.3)} /><path d="M 26,30 Q 34,44 28,56" opacity={clamp01(o * 1.5 - 0.3)} />
    </g>
  );
};
export const Protagonista: React.FC<{ id: string; x: number; y: number; escala: number; idade: number; pose: Pose; expr: Expr; f: number; dir?: 1 | -1; olhos?: number; itemD?: React.ReactNode; itemE?: React.ReactNode }> = ({
  id, x, y, escala, idade, pose, expr, f, dir = 1, olhos, itemD, itemE,
}) => {
  const p = posturaIdade(pose, idade);
  return (
    <g>
      <Personagem id={id} x={x} y={y} escala={escala} dir={dir} visual={protag(idade)} estilo={EST} pose={p} expr={expr} olhosAbertos={olhos ?? piscar(f, 11)} itemD={itemD} itemE={itemE} />
      <Rugas c={cabecaDe(x, y, escala, p, dir)} escala={escala} idade={idade} />
    </g>
  );
};

// ------------------------------------------------------------------ ELENCO SECUNDÁRIO (design próprio do episódio)
export const MEDICA: Visual = { pele: "#7b4a32", cabelo: "coque", corCabelo: "#1b1210", roupa: "jaleco", cor: "#7fd6c7", cor2: "#4fb3a3", calca: "#2f4f5a", sapato: "#f2f2f2", corOlho: "#2a1a12", corpo: "medio" };
export const ENFERMEIRO: Visual = { pele: "#e2b38c", cabelo: "espetado", corCabelo: "#2b2b2b", roupa: "camiseta", cor: "#5fb7a8", cor2: "#3f8f82", calca: "#5fb7a8", sapato: "#f2f2f2", corOlho: "#2a1a12", corpo: "magro" };
export const PACIENTE: Visual = { pele: "#d9a07a", cabelo: "careca", corCabelo: "#8a8a8a", roupa: "camiseta", cor: "#cfe3f2", cor2: "#a9c4dc", calca: "#cfe3f2", sapato: "#e0e0e0", corOlho: "#2a1a12", corpo: "idoso" };
export const FIG: Visual[] = [
  { pele: "#f0c8a0", cabelo: "longo", corCabelo: "#8a4b22", roupa: "vestido", cor: "#e4572e", calca: "#333", sapato: "#3a2a20", corpo: "medio" },
  { pele: "#8d5a3b", cabelo: "cacheado", corCabelo: "#1d1210", roupa: "camiseta", cor: "#ffcf3f", calca: "#2b2d42", sapato: "#fff", corpo: "forte" },
  { pele: "#c98f69", cabelo: "rabo", corCabelo: "#2a1a10", roupa: "moletom", cor: "#7a4fd8", calca: "#34344a", sapato: "#eee", corpo: "magro" },
  { pele: "#5a3826", cabelo: "careca", corCabelo: "#111", roupa: "terno", cor: "#3a4a6a", calca: "#2a3450", sapato: "#111", barba: "curta", corpo: "medio" },
  { pele: "#e8c4a8", cabelo: "coque", corCabelo: "#d9d9d9", roupa: "moletom", cor: "#3fae6a", calca: "#4a4a4a", sapato: "#555", corpo: "idoso" },
  { pele: "#b07a52", cabelo: "topete", corCabelo: "#2a1a10", roupa: "regata", cor: "#ff8c42", calca: "#2f3b5c", sapato: "#fff", corpo: "magro" },
  { pele: "#f2d0b4", cabelo: "curto", corCabelo: "#c9a24a", roupa: "camiseta", cor: "#e84d8a", calca: "#3b3b5a", sapato: "#eee", corpo: "medio" },
  { pele: "#7a4a30", cabelo: "longo", corCabelo: "#120c0a", roupa: "jaleco", cor: "#ffffff", calca: "#2b2d42", sapato: "#ddd", oculos: true, corpo: "medio" },
  { pele: "#d8a47f", cabelo: "curto", corCabelo: "#cfcfcf", roupa: "terno", cor: "#6a3a2a", calca: "#3a2a20", sapato: "#222", barba: "bigode", corpo: "idoso" },
  { pele: "#c98f69", cabelo: "cacheado", corCabelo: "#3a2214", roupa: "camiseta", cor: "#2fb3c9", calca: "#2b2d42", sapato: "#fff", corpo: "crianca" },
];
export const Fig: React.FC<{ i: number; x: number; y: number; escala: number; pose: Pose; expr: Expr; f: number; dir?: 1 | -1; id: string; itemD?: React.ReactNode; boca?: number }> = ({ i, x, y, escala, pose, expr, f, dir = 1, id, itemD, boca }) => (
  <Personagem id={id} x={x} y={y} escala={escala} dir={dir} visual={FIG[i % FIG.length]} estilo={EST} pose={pose} expr={expr} olhosAbertos={piscar(f, 20 + i)} itemD={itemD} boca={boca} />
);

// ------------------------------------------------------------------ OBJETOS
export const Monitor: React.FC<{ f: number; w?: number; h?: number; cor?: string; ouro?: number }> = ({ f, w = 360, h = 240, cor = "#3cff9a", ouro = 0 }) => {
  const pts: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const x = -w / 2 + 20 + (i / 60) * (w - 40);
    const fase = ((i / 60) * 3 - f * 0.05) % 1;
    const u = (fase + 1) % 1;
    const y = u > 0.45 && u < 0.5 ? -h * 0.32 : u > 0.5 && u < 0.55 ? h * 0.18 : Math.sin(u * 30) * 3;
    pts.push(`${x},${y}`);
  }
  return (
    <g>
      <rect x={-w / 2 - 18} y={-h / 2 - 18} width={w + 36} height={h + 36} rx={20} fill="#c7ced8" stroke={TINTA} strokeWidth={8} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={10} fill="#0d1a24" />
      <polyline points={pts.join(" ")} fill="none" stroke={mix(cor, "#ffd36b", ouro)} strokeWidth={6} strokeLinejoin="round" />
      <path d={`M ${-w / 2 + 10},${-h / 2 + 10} L ${-w / 2 + 70},${-h / 2 + 10}`} stroke="#ffffff" strokeWidth={6} opacity={0.15} />
      <circle cx={w / 2 - 26} cy={-h / 2 + 24} r={10} fill={Math.sin(f * 0.21) > 0.3 ? "#ff5a5a" : "#5a2a2a"} />
    </g>
  );
};
export const Leito: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-340} y={-40} width={680} height={70} rx={20} fill="#e9eef5" stroke={TINTA} strokeWidth={8} />
    <rect x={-360} y={-150} width={30} height={260} rx={10} fill="#9aa6b5" stroke={TINTA} strokeWidth={6} />
    <rect x={330} y={-90} width={30} height={200} rx={10} fill="#9aa6b5" stroke={TINTA} strokeWidth={6} />
    <rect x={-320} y={30} width={20} height={90} fill="#9aa6b5" /><rect x={300} y={30} width={20} height={90} fill="#9aa6b5" />
    <circle cx={-310} cy={130} r={14} fill={TINTA} /><circle cx={310} cy={130} r={14} fill={TINTA} />
  </g>
);
/** Paciente deitado (Personagem girado), respirando. Origem = centro do corpo. */
export const PacienteDeitado: React.FC<{ x: number; y: number; f: number; escala?: number }> = ({ x, y, f, escala = 0.85 }) => (
  <g transform={`translate(${x} ${y}) rotate(-90)`}>
    <Personagem id="im03-paciente" x={0} y={270 * escala} escala={escala} visual={PACIENTE} estilo={EST}
      pose={{ bracoE: [8, 6], bracoD: [8, 6], pernaE: [3, 0], pernaD: [3, 0], respirar: f * 0.08, bob: Math.sin(f * 0.08) * 2 }} expr={{ ...({} as Expr), sobInt: 0, sobExt: 0, palpebra: 0.85, palpInf: 0, pupila: 1, olhoAbre: 1, bocaCurva: 0, bocaLarg: 0.7, bocaAbre: 0, dentes: 0, bochecha: 0, suor: 0 } as Expr} olhosAbertos={0.15} />
  </g>
);
export const Relogio: React.FC<{ x: number; y: number; r: number; t: number }> = ({ x, y, r, t }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r} fill="#fff8e6" stroke={TINTA} strokeWidth={r * 0.1} />
    {Array.from({ length: 12 }, (_, i) => <line key={i} x1={0} y1={-r * 0.8} x2={0} y2={-r * 0.68} stroke={TINTA} strokeWidth={r * 0.05} transform={`rotate(${i * 30})`} />)}
    <line x1={0} y1={0} x2={0} y2={-r * 0.5} stroke={TINTA} strokeWidth={r * 0.08} strokeLinecap="round" transform={`rotate(${t * 30})`} />
    <line x1={0} y1={0} x2={0} y2={-r * 0.72} stroke="#e4572e" strokeWidth={r * 0.05} strokeLinecap="round" transform={`rotate(${t * 360})`} />
    <circle r={r * 0.07} fill={TINTA} />
  </g>
);
export const Arvore: React.FC<{ x: number; y: number; s: number; f: number; folha?: string }> = ({ x, y, s, f, folha = "#3c9a52" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -18,0 L -12,-150 L 12,-150 L 18,0 Z" fill="#7a5235" stroke={TINTA} strokeWidth={6} />
    <g transform={`rotate(${wobble(f, 3, 0.4) * 2} 0 -150)`}>
      {[[-50, -190, 70], [45, -200, 75], [0, -250, 85], [-10, -170, 60]].map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} fill={i % 2 ? folha : mix(folha, "#000000", 0.15)} stroke={TINTA} strokeWidth={6} />)}
    </g>
  </g>
);
/** Prédio que se constrói de baixo para cima (prog 0..1); acima do construído aparece andaime. */
export const Predio: React.FC<{ x: number; base: number; w: number; h: number; cor: string; prog: number; seed: string; noite?: number; estilo?: number }> = ({ x, base, w, h, cor, prog, seed, noite = 0, estilo = 0 }) => {
  if (prog <= 0) return null;
  const hc = h * clamp01(prog);
  const andar = 60;
  const nA = Math.floor(hc / andar);
  return (
    <g>
      <rect x={x - w / 2} y={base - hc} width={w} height={hc} fill={mix(cor, "#1a2040", noite * 0.55)} stroke={TINTA} strokeWidth={6} rx={estilo === 2 ? 26 : 2} />
      {estilo === 1 && <rect x={x - w / 2 - 10} y={base - hc - 14} width={w + 20} height={16} fill={mix(cor, "#000", 0.3)} stroke={TINTA} strokeWidth={5} />}
      {Array.from({ length: nA }, (_, a) => Array.from({ length: Math.max(1, Math.floor((w - 20) / 46)) }, (_, j) => {
        const acesa = rnd(`im03${seed}${a}${j}`) < 0.3 + noite * 0.5;
        return <rect key={`${a}-${j}`} x={x - w / 2 + 16 + j * 46} y={base - (a + 1) * andar + 16} width={26} height={30} rx={3} fill={acesa && noite > 0.3 ? "#ffd98a" : mix("#cfe9ff", "#33406a", noite)} opacity={0.9} />;
      }))}
      {prog < 1 && (
        <g stroke="#e8a33c" strokeWidth={4} opacity={0.9}>
          <line x1={x - w / 2} y1={base - hc} x2={x - w / 2} y2={base - hc - 60} /><line x1={x + w / 2} y1={base - hc} x2={x + w / 2} y2={base - hc - 60} />
          <line x1={x - w / 2} y1={base - hc - 60} x2={x + w / 2} y2={base - hc - 60} /><line x1={x - w / 2} y1={base - hc} x2={x + w / 2} y2={base - hc - 60} />
        </g>
      )}
    </g>
  );
};
export const Guindaste: React.FC<{ x: number; base: number; h: number; ang: number; carga: number }> = ({ x, base, h, ang, carga }) => (
  <g>
    <rect x={x - 12} y={base - h} width={24} height={h} fill="#f2b33a" stroke={TINTA} strokeWidth={5} />
    <g transform={`translate(${x} ${base - h}) rotate(${ang})`}>
      <rect x={-80} y={-14} width={360} height={24} fill="#f2b33a" stroke={TINTA} strokeWidth={5} />
      <line x1={180 + carga * 60} y1={10} x2={180 + carga * 60} y2={120 + carga * 80} stroke={TINTA} strokeWidth={4} />
      <rect x={150 + carga * 60} y={120 + carga * 80} width={60} height={40} fill="#8a5a3c" stroke={TINTA} strokeWidth={5} />
    </g>
  </g>
);
export const Carro: React.FC<{ x: number; y: number; cor: string; f: number; dir?: number; tipo?: number }> = ({ x, y, cor, f, dir = 1, tipo = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${dir} 1)`}>
    {tipo === 1 ? (
      <g>
        <rect x={-170} y={-120} width={340} height={110} rx={20} fill={cor} stroke={TINTA} strokeWidth={6} />
        {Array.from({ length: 5 }, (_, i) => <rect key={i} x={-150 + i * 62} y={-104} width={46} height={40} rx={6} fill="#cfe9ff" stroke={TINTA} strokeWidth={4} />)}
        {Array.from({ length: 5 }, (_, i) => <circle key={`c${i}`} cx={-128 + i * 62} cy={-84} r={10} fill={["#8d5a3b", "#f0c8a0", "#5a3826", "#e8c4a8", "#c98f69"][i]} />)}
      </g>
    ) : (
      <g>
        <path d="M -90,-20 L -70,-60 L 50,-60 L 80,-20 L 100,-20 L 100,10 L -100,10 L -100,-20 Z" fill={cor} stroke={TINTA} strokeWidth={6} strokeLinejoin="round" />
        <path d="M -56,-54 L -40,-26 L 40,-26 L 44,-54 Z" fill="#cfe9ff" stroke={TINTA} strokeWidth={4} />
      </g>
    )}
    {[-60, 60].map((wx, i) => (
      <g key={i} transform={`translate(${tipo === 1 ? wx * 2 : wx} 10) rotate(${f * 12 * dir})`}>
        <circle r={20} fill={TINTA} /><line x1={-14} y1={0} x2={14} y2={0} stroke="#9aa3b0" strokeWidth={4} />
      </g>
    ))}
  </g>
);
/** Céu conforme a hora (0 = dia, 0.5 = pôr do sol, 1 = noite estrelada). */
export const Ceu: React.FC<{ t: number; id: string; f: number }> = ({ t, id, f }) => {
  const topo = t < 0.5 ? mix("#7fc8ff", "#ff9a62", t * 2) : mix("#ff9a62", "#141a3d", (t - 0.5) * 2);
  const baixo = t < 0.5 ? mix("#dff2ff", "#ffd59e", t * 2) : mix("#ffd59e", "#3a2f6b", (t - 0.5) * 2);
  return (
    <g>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={topo} /><stop offset="1" stopColor={baixo} /></linearGradient></defs>
      <rect x={-2000} y={-2000} width={6000} height={5000} fill={`url(#${id})`} />
      {t > 0.6 && Array.from({ length: 60 }, (_, i) => <circle key={i} cx={-800 + rnd(`im03st${i}`) * 2800} cy={-600 + rnd(`im03sty${i}`) * 1500} r={2 + rnd(`im03str${i}`) * 2.5} fill="#fff" opacity={(t - 0.6) * 2.5 * (0.5 + 0.5 * Math.sin(f * 0.1 + i))} />)}
    </g>
  );
};
/** Mapa-múndi 2D estilizado (continentes simplificados, não cartográficos) com linhas de notícia. */
export const Mapa: React.FC<{ f: number; linhas: number }> = ({ f, linhas }) => {
  const cont = [
    "M 120,300 C 160,220 300,200 380,240 C 420,300 360,360 330,420 C 300,470 260,520 240,600 C 200,560 160,470 140,420 C 110,380 100,340 120,300 Z",
    "M 300,640 C 340,620 380,660 380,720 C 370,800 340,880 300,960 C 280,900 270,820 270,760 C 270,700 280,660 300,640 Z",
    "M 500,250 C 560,210 640,220 680,250 C 660,300 600,320 560,330 C 530,320 500,290 500,250 Z",
    "M 520,380 C 580,360 660,380 680,450 C 690,540 640,640 600,720 C 560,660 520,560 510,480 C 505,430 505,400 520,380 Z",
    "M 680,240 C 780,200 920,220 980,280 C 1000,340 940,400 860,420 C 800,430 740,400 700,360 C 680,320 670,280 680,240 Z",
    "M 860,620 C 920,600 990,620 1000,670 C 990,720 930,740 880,720 C 850,700 845,650 860,620 Z",
  ];
  const nos: [number, number][] = [[250, 330], [320, 760], [590, 270], [600, 500], [850, 300], [930, 670], [760, 380]];
  const pares = [[0, 2], [2, 4], [0, 1], [3, 5], [4, 5], [1, 3], [2, 6], [6, 5]];
  return (
    <g>
      <rect x={-200} y={-200} width={1480} height={1500} fill="#bfe6f5" />
      {Array.from({ length: 12 }, (_, i) => <line key={i} x1={-200} x2={1280} y1={i * 100} y2={i * 100} stroke="#a6d6ea" strokeWidth={3} />)}
      {cont.map((d, i) => <path key={i} d={d} fill="#8fd18a" stroke={TINTA} strokeWidth={7} strokeLinejoin="round" />)}
      {pares.map(([a, b], i) => {
        const [x1, y1] = nos[a], [x2, y2] = nos[b];
        const u = clamp01(linhas * pares.length - i);
        const mx = (x1 + x2) / 2, my = Math.min(y1, y2) - 120;
        return u > 0 && <path key={i} d={`M ${x1},${y1} Q ${mx},${my} ${x2},${y2}`} fill="none" stroke="#f2b33a" strokeWidth={7} strokeDasharray="1200" strokeDashoffset={1200 * (1 - u)} strokeLinecap="round" />;
      })}
      {nos.map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r={14 + 6 * Math.sin(f * 0.15 + i)} fill="#ffd36b" opacity={0.5} /><circle cx={x} cy={y} r={10} fill="#ffb52e" stroke={TINTA} strokeWidth={4} /></g>)}
    </g>
  );
};

export { eio, eout, ramp, clamp01, lerp, rnd, piscar, wobble };
