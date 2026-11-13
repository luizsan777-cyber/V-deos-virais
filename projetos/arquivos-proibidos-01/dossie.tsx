// Sistema visual "dossiê noir" do episódio Arquivos Proibidos 01 (2D, preto/cinza/vermelho, papel envelhecido).
// Cada caso = uma pasta que entra, abre, datilografa o título, mostra uma ILUSTRAÇÃO animada e leva um carimbo.
import React from "react";
import { continueRender, delayRender, useCurrentFrame } from "remotion";
import "@fontsource/special-elite/400.css";
import { useTempos } from "../../engine/src/kit/tempo";
import { clamp01, eback, eout, ramp, rnd, wobble } from "../../engine/src/kit/anim";

export const TINTA = "#0b0a0d";
export const PAPEL = "#d9caa4";
export const PAPEL2 = "#c4b287";
export const VERMELHO = "#c1121f";
export const SEPIA = "#8a6a45";
export const FONTE_MAQ = "Special Elite";

let fonteOk = false;
export const useFonteMaquina = () => {
  if (fonteOk || typeof document === "undefined") return;
  fonteOk = true;
  const h = delayRender("special-elite");
  document.fonts.load(`400 60px "${FONTE_MAQ}"`, "ÁÇÃ").then(() => continueRender(h)).catch(() => continueRender(h));
};

/** tempo local da cena: lf e P(palavra) a partir do início da cena */
export const useCena = (inicio: number) => {
  const f = useCurrentFrame();
  const T = useTempos();
  const limpa = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
  const P = (w: string, n = 1) => {
    let c = 0;
    for (const p of T.raw.palavras) if (T.fr(p.ini) >= inicio && limpa(p.w) === limpa(w) && ++c === n) return T.fr(p.ini) - inicio;
    throw new Error(`palavra '${w}' não existe depois do frame ${inicio}`);
  };
  return { lf: f - inicio, f, T, P };
};

export const T_: React.FC<{ x: number; y: number; t: string; s?: number; c?: string; a?: "start" | "middle" | "end"; fonte?: string; peso?: number; op?: number; borda?: number }> = ({
  x, y, t, s = 40, c = TINTA, a = "middle", fonte = FONTE_MAQ, peso = 400, op = 1, borda = 0,
}) => (
  <text x={x} y={y} textAnchor={a} fontFamily={fonte} fontWeight={peso} fontSize={s} fill={c} opacity={op}
    stroke={borda ? "#000" : "none"} strokeWidth={borda} paintOrder="stroke">{t}</text>
);

/** Mesa escura com poça de luz da luminária e poeira no ar. */
export const Mesa: React.FC<{ f: number; luz?: number; cx?: number; cy?: number }> = ({ f, luz = 1, cx = 540, cy = 760 }) => (
  <g>
    <defs>
      <radialGradient id="mesaLuz" cx="0.5" cy="0.4" r="0.65">
        <stop offset="0" stopColor="#5a3f2a" /><stop offset="0.55" stopColor="#2a1c14" /><stop offset="1" stopColor="#0a0706" />
      </radialGradient>
      <radialGradient id="poeiraLuz"><stop offset="0" stopColor="#ffe2b0" stopOpacity="0.16" /><stop offset="1" stopColor="#ffe2b0" stopOpacity="0" /></radialGradient>
    </defs>
    <rect x={-600} y={-600} width={2300} height={3100} fill="url(#mesaLuz)" />
    {Array.from({ length: 22 }, (_, i) => <line key={i} x1={-600} x2={1700} y1={-400 + i * 120 + Math.sin(i) * 20} y2={-380 + i * 120} stroke="#000" strokeWidth={3} opacity={0.18} />)}
    <ellipse cx={cx} cy={cy} rx={760} ry={900} fill="url(#poeiraLuz)" opacity={luz} />
    {Array.from({ length: 40 }, (_, i) => {
      const x = (rnd(`px${i}`) * 1080 + Math.sin(f * 0.02 + i) * 30), y = ((rnd(`py${i}`) * 1900 - f * (0.3 + rnd(`pv${i}`) * 0.5)) % 1900 + 1900) % 1900;
      return <circle key={i} cx={x} cy={y} r={1.5 + rnd(`pr${i}`) * 2.5} fill="#ffe8c4" opacity={0.25 * luz * (0.4 + 0.6 * Math.abs(Math.sin(f * 0.05 + i)))} />;
    })}
  </g>
);

/** Carimbo vermelho que "bate" no papel (escala 2.2 → 1, tremida). */
export const Carimbo: React.FC<{ f: number; em: number; texto: string; x: number; y: number; rot?: number; tam?: number; cor?: string }> = ({
  f, em, texto, x, y, rot = -12, tam = 70, cor = VERMELHO,
}) => {
  if (f < em) return null;
  const t = ramp(f, em, em + 6);
  const s = 2.2 - 1.2 * eout(t);
  const tr = f - em < 8 ? Math.sin((f - em) * 3) * 4 * (1 - (f - em) / 8) : 0;
  const w = texto.length * tam * 0.62 + 70;
  return (
    <g transform={`translate(${x + tr} ${y}) rotate(${rot}) scale(${s})`} opacity={clamp01(t * 2) * 0.9}>
      <rect x={-w / 2} y={-tam * 0.85} width={w} height={tam * 1.5} rx={10} fill="none" stroke={cor} strokeWidth={9} />
      <rect x={-w / 2 + 12} y={-tam * 0.85 + 12} width={w - 24} height={tam * 1.5 - 24} rx={6} fill="none" stroke={cor} strokeWidth={3} />
      <text y={tam * 0.32} textAnchor="middle" fontFamily="Anton" fontSize={tam} fill={cor} letterSpacing={3}>{texto}</text>
      {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={(rnd(`cb${texto}${i}`) - 0.5) * w} cy={(rnd(`cc${texto}${i}`) - 0.5) * tam * 1.3} r={3 + rnd(`cd${i}`) * 7} fill={PAPEL} opacity={0.7} />)}
    </g>
  );
};

/** Texto datilografado (aparece letra a letra) — com cursor piscando. */
export const Datilografado: React.FC<{ f: number; em: number; texto: string; x: number; y: number; s?: number; c?: string; vel?: number; a?: "start" | "middle" }> = ({
  f, em, texto, x, y, s = 60, c = TINTA, vel = 1.2, a = "start",
}) => {
  const n = Math.max(0, Math.min(texto.length, Math.floor((f - em) * vel)));
  const cursor = n < texto.length || (f % 20) < 10;
  return <T_ x={x} y={y} t={texto.slice(0, n) + (cursor && f >= em ? "▌" : "")} s={s} c={c} a={a} />;
};

export type Caso = {
  n: number; titulo: string; periodo: string; fonte: string;
  carimbo: string; carimboEm: string; // palavra que dispara o carimbo
  Ilustracao: React.FC<{ lf: number; P: (w: string, n?: number) => number; dur: number }>;
};

/** Pasta de caso completa: entra deslizando, abre, datilografa, ilustração, carimbo, fonte; sai no fim. */
export const Pasta: React.FC<{ caso: Caso; lf: number; dur: number; P: (w: string, n?: number) => number }> = ({ caso, lf, dur, P }) => {
  const entra = eout(ramp(lf, 0, 11));
  const sai = ramp(lf, dur - 7, dur);
  const x = (1 - entra) * 1150 - sai * 1300;
  const rot = (1 - entra) * 8 - sai * 6;
  const abre = eout(ramp(lf, 6, 16));
  const Il = caso.Ilustracao;
  return (
    <g transform={`translate(${x} 0) rotate(${rot} 540 760)`}>
      {/* pasta (fundo) e aba */}
      <path d="M 40,250 L 330,250 L 370,200 L 640,200 L 680,250 L 1040,250 L 1040,1250 L 40,1250 Z" fill="#a8844f" stroke={TINTA} strokeWidth={8} strokeLinejoin="round" />
      <T_ x={505} y={240} t={`CASO ${String(caso.n).padStart(2, "0")}/10`} s={34} c={TINTA} />
      {/* folha */}
      <g transform={`translate(0 ${(1 - abre) * 40})`} opacity={0.4 + 0.6 * abre}>
        <rect x={70} y={280} width={940} height={950} fill={PAPEL} stroke={TINTA} strokeWidth={5} />
        <rect x={70} y={280} width={940} height={950} fill="url(#manchas)" opacity={0.5} />
        <Datilografado f={lf} em={10} texto={caso.titulo} x={110} y={362} s={caso.titulo.length > 22 ? 48 : 60} />
        <Datilografado f={lf} em={10 + caso.titulo.length / 1.2} texto={caso.periodo} x={110} y={418} s={34} c="#5a4630" vel={1.6} />
        <line x1={110} x2={970} y1={440} y2={440} stroke={TINTA} strokeWidth={3} opacity={0.6} />
        {/* ilustração */}
        <g transform="translate(90 460)">
          <clipPath id={`il${caso.n}`}><rect width={900} height={600} /></clipPath>
          <g clipPath={`url(#il${caso.n})`}>
            <rect width={900} height={600} fill="#1a1512" />
            <Il lf={lf} P={P} dur={dur} />
            <rect width={900} height={600} fill="#5a3a1a" opacity={0.18} style={{ mixBlendMode: "multiply" }} />
          </g>
          <rect width={900} height={600} fill="none" stroke={TINTA} strokeWidth={8} />
          <g transform="translate(18 572)"><rect x={0} y={-30} width={170} height={40} fill={TINTA} opacity={0.75} /><T_ x={85} y={-2} t="ILUSTRAÇÃO" s={24} c="#e9dcb8" fonte="Montserrat" peso={800} /></g>
        </g>
        <T_ x={110} y={1110} t={`FONTE: ${caso.fonte}`} s={28} c="#3b2f22" a="start" />
        <T_ x={110} y={1158} t="fato documentado • desclassificado" s={26} c="#6b5640" a="start" />
        <Carimbo f={lf} em={P(caso.carimboEm) - 2} texto={caso.carimbo} x={640} y={520} tam={64} />
      </g>
    </g>
  );
};

/** defs de textura de papel — coloque uma vez por SVG */
export const DefsPapel: React.FC = () => (
  <defs>
    <radialGradient id="manchas" cx="0.3" cy="0.7" r="0.8">
      <stop offset="0" stopColor="#8a6a45" stopOpacity="0.35" /><stop offset="0.5" stopColor="#8a6a45" stopOpacity="0.05" /><stop offset="1" stopColor="#5a3a1a" stopOpacity="0.4" />
    </radialGradient>
  </defs>
);

/** Silhueta de pessoa (ilustrativa, sem rosto) — usada para multidões e "pessoas reais" sem caricatura. */
export const Silhueta: React.FC<{ x: number; y: number; s?: number; f?: number; seed?: number; braco?: number; cor?: string }> = ({ x, y, s = 1, f = 0, seed = 0, braco = 0, cor = "#0f0d0c" }) => {
  const b = wobble(f, seed, 0.6) * 6;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={cor}>
      <circle cx={0} cy={-170} r={34} />
      <path d="M -48,-130 Q 0,-150 48,-130 L 56,-20 L -56,-20 Z" />
      <rect x={-40} y={-24} width={30} height={100} rx={12} /><rect x={10} y={-24} width={30} height={100} rx={12} />
      <rect x={-70} y={-128} width={22} height={100} rx={11} transform={`rotate(${10 + b - braco} -59 -128)`} />
      <rect x={48} y={-128} width={22} height={100} rx={11} transform={`rotate(${-10 - b + braco} 59 -128)`} />
    </g>
  );
};

/** Jornal genérico (nome fictício, sem marca real) girando até parar. */
export const Jornal: React.FC<{ f: number; em: number; manchete: string; sub?: string; x?: number; y?: number; ano?: string }> = ({ f, em, manchete, sub = "", x = 450, y = 300, ano = "" }) => {
  if (f < em) return null;
  const t = eout(ramp(f, em, em + 14));
  return (
    <g transform={`translate(${x} ${y}) rotate(${(1 - t) * 720 - 4}) scale(${0.2 + 0.8 * t})`}>
      <rect x={-330} y={-230} width={660} height={460} fill="#eee6d2" stroke={TINTA} strokeWidth={6} />
      <T_ x={0} y={-170} t="O DIÁRIO" s={58} fonte="Cinzel" peso={900} />
      <T_ x={0} y={-135} t={`edição ilustrativa ${ano}`} s={24} c="#555" fonte="Montserrat" peso={700} />
      <line x1={-300} x2={300} y1={-118} y2={-118} stroke={TINTA} strokeWidth={4} />
      <T_ x={0} y={-50} t={manchete} s={manchete.length > 14 ? 52 : 70} fonte="Anton" />
      <T_ x={0} y={0} t={sub} s={30} fonte="Montserrat" peso={800} c="#333" />
      {Array.from({ length: 6 }, (_, i) => <rect key={i} x={-300} y={40 + i * 28} width={i % 2 ? 560 : 600} height={12} fill="#9a917e" />)}
    </g>
  );
};
