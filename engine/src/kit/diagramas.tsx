// Kit do MODO EXPLICATIVO: diagramas animados em SVG (mundo 1080 x 1920).
// Setas que se desenham, rótulos, contadores, gráficos de barras, ondas, vetores de força, órbitas,
// fundo de quadro-negro / papel quadriculado. Tudo entra "desenhando" em sincronia com a narração.
import React from "react";
import { useCurrentFrame } from "remotion";
import { clamp01, eback, eio, eout, ramp } from "./anim";

const TINTA = "#14121c";

/** Fundos com personalidade (escolha um por vídeo para variar o estilo). */
export const FundoExplicativo: React.FC<{ tipo: "quadro" | "papel" | "blueprint" | "gradiente"; cor?: string }> = ({ tipo, cor }) => {
  const f = useCurrentFrame();
  if (tipo === "quadro")
    return (
      <g>
        <rect x={-600} y={-400} width={2300} height={2800} fill={cor ?? "#20372f"} />
        {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M ${-600 + i * 80},-400 l 300,2800`} stroke="#fff" opacity={0.025} strokeWidth={40} />)}
      </g>
    );
  if (tipo === "papel")
    return (
      <g>
        <rect x={-600} y={-400} width={2300} height={2800} fill={cor ?? "#fbf6ea"} />
        {Array.from({ length: 70 }, (_, i) => <line key={i} x1={-600} x2={1700} y1={-400 + i * 50} y2={-400 + i * 50} stroke="#9cc3e6" strokeWidth={2} opacity={0.5} />)}
        {Array.from({ length: 50 }, (_, i) => <line key={`v${i}`} y1={-400} y2={2400} x1={-600 + i * 50} x2={-600 + i * 50} stroke="#9cc3e6" strokeWidth={2} opacity={0.3} />)}
      </g>
    );
  if (tipo === "blueprint")
    return (
      <g>
        <rect x={-600} y={-400} width={2300} height={2800} fill={cor ?? "#103a6b"} />
        {Array.from({ length: 50 }, (_, i) => <line key={i} x1={-600} x2={1700} y1={-400 + i * 60} y2={-400 + i * 60} stroke="#8fc7ff" strokeWidth={i % 5 ? 1 : 3} opacity={0.35} />)}
        {Array.from({ length: 40 }, (_, i) => <line key={`v${i}`} y1={-400} y2={2400} x1={-600 + i * 60} x2={-600 + i * 60} stroke="#8fc7ff" strokeWidth={i % 5 ? 1 : 3} opacity={0.35} />)}
      </g>
    );
  return (
    <g>
      <defs>
        <linearGradient id="gradExp" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={cor ?? "#2b1a6b"} />
          <stop offset="1" stopColor="#0f6c8f" />
        </linearGradient>
      </defs>
      <rect x={-600} y={-400} width={2300} height={2800} fill="url(#gradExp)" />
      {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={(i * 337 + f * 0.6) % 1900 - 400} cy={(i * 521) % 2200} r={120 + i * 20} fill="#fff" opacity={0.04} />)}
    </g>
  );
};

/** Seta que se desenha de a até b (com curva opcional). */
export const Seta: React.FC<{ de: [number, number]; ate: [number, number]; em: number; dur?: number; curva?: number; cor?: string; largura?: number; tracejada?: boolean }> = ({
  de, ate, em, dur = 14, curva = 0, cor = "#ffd60a", largura = 12, tracejada = false,
}) => {
  const f = useCurrentFrame();
  const t = eout(ramp(f, em, em + dur));
  if (t <= 0) return null;
  const [x0, y0] = de, [x1, y1] = ate;
  const mx = (x0 + x1) / 2 - (y1 - y0) * curva, my = (y0 + y1) / 2 + (x1 - x0) * curva;
  const d = `M ${x0},${y0} Q ${mx},${my} ${x1},${y1}`;
  const comp = Math.hypot(x1 - x0, y1 - y0) * (1 + Math.abs(curva));
  const ang = (Math.atan2(y1 - my, x1 - mx) * 180) / Math.PI;
  return (
    <g>
      <path d={d} stroke={TINTA} strokeWidth={largura + 10} fill="none" strokeLinecap="round" strokeDasharray={`${comp * t} ${comp * 2}`} opacity={0.6} />
      <path d={d} stroke={cor} strokeWidth={largura} fill="none" strokeLinecap="round" strokeDasharray={tracejada ? "28 18" : `${comp * t} ${comp * 2}`} opacity={tracejada ? t : 1} />
      {t > 0.9 && (
        <g transform={`translate(${x1} ${y1}) rotate(${ang}) scale(${eback(ramp(f, em + dur * 0.9, em + dur + 5))})`}>
          <path d={`M 10,0 L ${-largura * 3},${-largura * 2.2} L ${-largura * 2},0 L ${-largura * 3},${largura * 2.2} Z`} fill={cor} stroke={TINTA} strokeWidth={5} strokeLinejoin="round" />
        </g>
      )}
    </g>
  );
};

/** Rótulo em "etiqueta" que salta. */
export const Rotulo: React.FC<{ x: number; y: number; texto: string; em: number; ate?: number; cor?: string; fundo?: string; tamanho?: number; fonte?: string }> = ({
  x, y, texto, em, ate = 1e9, cor = "#14121c", fundo = "#ffffff", tamanho = 54, fonte = "Montserrat",
}) => {
  const f = useCurrentFrame();
  if (f < em || f > ate) return null;
  const s = eback(ramp(f, em, em + 9)) * (1 - ramp(f, ate - 5, ate));
  const w = texto.length * tamanho * 0.62 + 60;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${-2 + Math.sin(f * 0.05) * 0.8})`}>
      <rect x={-w / 2 + 8} y={-tamanho * 0.85 + 10} width={w} height={tamanho * 1.7} rx={22} fill={TINTA} opacity={0.5} />
      <rect x={-w / 2} y={-tamanho * 0.85} width={w} height={tamanho * 1.7} rx={22} fill={fundo} stroke={TINTA} strokeWidth={6} />
      <text x={0} y={tamanho * 0.32} textAnchor="middle" fontFamily={fonte} fontWeight={900} fontSize={tamanho} fill={cor}>{texto}</text>
    </g>
  );
};

/** Número que conta de `de` até `ate` (formatação pt-BR). */
export const Contador: React.FC<{ x: number; y: number; de?: number; ate: number; em: number; dur?: number; sufixo?: string; casas?: number; tamanho?: number; cor?: string }> = ({
  x, y, de = 0, ate, em, dur = 30, sufixo = "", casas = 0, tamanho = 160, cor = "#ffd60a",
}) => {
  const f = useCurrentFrame();
  if (f < em) return null;
  const v = de + (ate - de) * eio(ramp(f, em, em + dur));
  const txt = v.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas }) + sufixo;
  const pulso = 1 + 0.08 * (1 - eout(ramp(f, em + dur, em + dur + 8))) * (f >= em + dur ? 1 : 0);
  return (
    <text x={x} y={y} textAnchor="middle" fontFamily="Anton" fontSize={tamanho} fill={cor} stroke={TINTA} strokeWidth={14} paintOrder="stroke" transform={`translate(${x} ${y}) scale(${pulso}) translate(${-x} ${-y})`}>
      {txt}
    </text>
  );
};

/** Gráfico de barras que cresce. */
export const Barras: React.FC<{ x: number; y: number; dados: { rotulo: string; valor: number; cor?: string }[]; em: number; largura?: number; altura?: number; corTexto?: string }> = ({
  x, y, dados, em, largura = 800, altura = 600, corTexto = "#ffffff",
}) => {
  const f = useCurrentFrame();
  const max = Math.max(...dados.map((d) => d.valor));
  const w = largura / dados.length;
  return (
    <g transform={`translate(${x} ${y})`}>
      <line x1={-20} x2={largura + 20} y1={0} y2={0} stroke={corTexto} strokeWidth={6} opacity={clamp01(ramp(f, em - 6, em))} />
      {dados.map((d, i) => {
        const t = eback(ramp(f, em + i * 6, em + i * 6 + 18));
        const h = (d.valor / max) * altura * t;
        return (
          <g key={i}>
            <rect x={i * w + w * 0.15} y={-h} width={w * 0.7} height={h} rx={12} fill={d.cor ?? ["#ffd60a", "#06d6a0", "#ef476f", "#118ab2", "#ff8c42"][i % 5]} stroke={TINTA} strokeWidth={6} />
            <text x={i * w + w / 2} y={60} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={40} fill={corTexto} opacity={clamp01(t)}>{d.rotulo}</text>
            <text x={i * w + w / 2} y={-h - 20} textAnchor="middle" fontFamily="Anton" fontSize={52} fill={corTexto} opacity={clamp01(ramp(f, em + i * 6 + 12, em + i * 6 + 20))}>{d.valor.toLocaleString("pt-BR")}</text>
          </g>
        );
      })}
    </g>
  );
};

/** Onda senoidal animada (som, luz, ondas do mar…). */
export const Onda: React.FC<{ x: number; y: number; largura?: number; amp?: number; comprimento?: number; vel?: number; cor?: string; em?: number }> = ({
  x, y, largura = 800, amp = 60, comprimento = 200, vel = 0.15, cor = "#5fd8ff", em = 0,
}) => {
  const f = useCurrentFrame();
  const t = eout(ramp(f, em, em + 15));
  const pts = Array.from({ length: 120 }, (_, i) => {
    const xx = (i / 119) * largura * t;
    return `${x + xx},${y + Math.sin((xx / comprimento) * Math.PI * 2 - f * vel) * amp}`;
  });
  return (
    <g>
      <polyline points={pts.join(" ")} stroke={TINTA} strokeWidth={18} fill="none" strokeLinecap="round" opacity={0.5} />
      <polyline points={pts.join(" ")} stroke={cor} strokeWidth={10} fill="none" strokeLinecap="round" />
    </g>
  );
};

/** Órbita: corpo girando em volta de um centro (elipse tracejada). */
export const Orbita: React.FC<{ cx: number; cy: number; rx: number; ry: number; periodo?: number; cor?: string; raioCorpo?: number; corCorpo?: string; fase?: number }> = ({
  cx, cy, rx, ry, periodo = 120, cor = "#ffffff", raioCorpo = 30, corCorpo = "#5fd8ff", fase = 0,
}) => {
  const f = useCurrentFrame();
  const a = (f / periodo) * Math.PI * 2 + fase;
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={cor} strokeWidth={4} strokeDasharray="14 14" opacity={0.6} />
      <circle cx={cx + Math.cos(a) * rx} cy={cy + Math.sin(a) * ry} r={raioCorpo} fill={corCorpo} stroke={TINTA} strokeWidth={6} />
    </g>
  );
};

/** Bloco "Por quê?" / dica com ícone, entra deslizando. */
export const Cartao: React.FC<{ x: number; y: number; w?: number; titulo: string; texto?: string; em: number; cor?: string }> = ({ x, y, w = 820, titulo, texto, em, cor = "#ffd60a" }) => {
  const f = useCurrentFrame();
  if (f < em) return null;
  const t = eout(ramp(f, em, em + 12));
  return (
    <g transform={`translate(${x + (1 - t) * 900} ${y})`} opacity={t}>
      <rect x={10} y={10} width={w} height={texto ? 260 : 150} rx={30} fill={TINTA} opacity={0.5} />
      <rect width={w} height={texto ? 260 : 150} rx={30} fill="#ffffff" stroke={TINTA} strokeWidth={7} />
      <rect width={26} height={texto ? 260 : 150} rx={13} fill={cor} />
      <text x={60} y={95} fontFamily="Anton" fontSize={70} fill={TINTA}>{titulo}</text>
      {texto && <text x={60} y={190} fontFamily="Montserrat" fontWeight={800} fontSize={44} fill="#333">{texto}</text>}
    </g>
  );
};
