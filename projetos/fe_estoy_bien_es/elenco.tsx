// Elenco, celular e utilitários do short "Estoy bien" (es-419). Personagens fixos para manter a aparência entre cenas.
import React from "react";
import { Visual, ESTILOS_PERSONAGEM, Estilo } from "../../engine/src/kit/Personagem";
import { clamp01, lerp } from "../../engine/src/kit/anim";

export const TINTA = "#14121c";
export const FONTE = "Montserrat";

// Ciudad de México: joven del metro (mismo personaje en la casa)
export const JOVEN: Visual = { pele: "#c68e66", cabelo: "cacheado", corCabelo: "#1b120d", roupa: "moletom", cor: "#7b2f3c", cor2: "#943e4c", calca: "#2d3a55", sapato: "#e9e6e0", corOlho: "#2a1a12", corpo: "magro" };
// Bogotá
export const BOGOTA: Visual = { pele: "#e2b28c", cabelo: "rabo", corCabelo: "#3a2316", roupa: "moletom", cor: "#c7922f", cor2: "#d9a645", calca: "#2b2d3c", sapato: "#3b3030", corOlho: "#3a2416", corpo: "medio" };
// Lima
export const LIMA: Visual = { pele: "#a9724c", cabelo: "longo", corCabelo: "#120c0a", roupa: "moletom", cor: "#2f7f86", cor2: "#3e98a0", calca: "#3b3550", sapato: "#5a4a40", corOlho: "#24160f", corpo: "medio" };

export const luzNoite = (rim: number, cor = "#9ec8ff"): Estilo => ({ ...ESTILOS_PERSONAGEM.noite, brilho: rim, corBrilho: cor });
export const luzQuente = (rim: number, cor = "#ffc98a"): Estilo => ({ ...ESTILOS_PERSONAGEM.conto, brilho: rim, corBrilho: cor });

/** texto digitado: n caracteres visíveis em função do frame (cps = caracteres por segundo a 30 fps) */
export const digitado = (texto: string, f: number, f0: number, cps = 9) => texto.slice(0, Math.max(0, Math.min(texto.length, Math.floor(((f - f0) * cps) / 30))));
/** texto sendo apagado (backspace) a partir de f0 */
export const apagado = (texto: string, f: number, f0: number, cps = 14) => texto.slice(0, Math.max(0, texto.length - Math.floor(Math.max(0, f - f0) * cps / 30)));

export const quebrar = (t: string, n: number): string[] => {
  const out: string[] = [];
  let l = "";
  for (const w of t.split(" ")) {
    if ((l + " " + w).trim().length > n && l) { out.push(l); l = w; } else l = (l + " " + w).trim();
  }
  if (l || !out.length) out.push(l);
  return out;
};

export type Msg = { texto: string; mio: boolean; check?: number };

/** Tela de conversa genérica (sem marca). Coordenadas locais: centro do aparelho em (0,0), 300 x 620. */
export const Celular: React.FC<{ contato: string; msgs: Msg[]; rascunho: string; cursor?: boolean; brilho?: number; hora?: string;
  selecao?: number; chegando?: number; noite?: boolean }> = ({ contato, msgs, rascunho, cursor = true, brilho = 1, hora = "21:47", selecao = 0, chegando = 1, noite = true }) => {
  const W = 300, H = 620, sw = 276, sh = 590;
  const fundo = noite ? "#10151f" : "#eef2f6", txt = noite ? "#f1f4f8" : "#18202c";
  const linhas = quebrar(rascunho, 19).slice(-4);
  const hIn = 30 + linhas.length * 24;
  let y = 120;
  return (
    <g>
      <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={40} fill="#1a1c22" stroke={TINTA} strokeWidth={6} />
      <rect x={-sw / 2} y={-sh / 2} width={sw} height={sh} rx={30} fill={fundo} opacity={brilho} />
      <rect x={-40} y={-sh / 2 + 10} width={80} height={18} rx={9} fill="#08090c" />
      <text x={-sw / 2 + 24} y={-sh / 2 + 26} fontFamily={FONTE} fontWeight={800} fontSize={13} fill={txt} opacity={0.8}>{hora}</text>
      {/* cabeçalho */}
      <rect x={-sw / 2} y={-sh / 2 + 40} width={sw} height={58} fill={noite ? "#1b2433" : "#dfe6ee"} />
      <circle cx={-sw / 2 + 36} cy={-sh / 2 + 69} r={18} fill="#6c8fb8" />
      <text x={-sw / 2 + 64} y={-sh / 2 + 75} fontFamily={FONTE} fontWeight={800} fontSize={17} fill={txt}>{contato}</text>
      {/* mensagens */}
      {msgs.map((m, i) => {
        const ls = quebrar(m.texto, 18);
        const h = 18 + ls.length * 22, w = Math.min(220, 26 + Math.max(...ls.map((l) => l.length)) * 10.4);
        const yy = -sh / 2 + y;
        y += h + 12;
        const x = m.mio ? sw / 2 - 14 - w : -sw / 2 + 14;
        const op = i === msgs.length - 1 && m.mio ? chegando : 1;
        return (
          <g key={i} opacity={op} transform={`translate(0 ${(1 - op) * 30})`}>
            <rect x={x} y={yy} width={w} height={h} rx={16} fill={m.mio ? "#2f8f6a" : noite ? "#26324a" : "#ffffff"} />
            {ls.map((l, k) => <text key={k} x={x + 13} y={yy + 26 + k * 22} fontFamily={FONTE} fontWeight={800} fontSize={16} fill={m.mio || noite ? "#f4f7fb" : "#18202c"}>{l}</text>)}
            {m.mio && m.check !== undefined && <text x={x + w - 34} y={yy + h - 6} fontFamily={FONTE} fontWeight={800} fontSize={11} fill="#bff5df" opacity={m.check}>✓✓</text>}
          </g>
        );
      })}
      {/* caixa de texto */}
      <rect x={-sw / 2 + 10} y={sh / 2 - 18 - hIn} width={sw - 72} height={hIn} rx={18} fill={noite ? "#222b3b" : "#ffffff"} stroke={noite ? "#33405a" : "#c9d3de"} strokeWidth={2} />
      {selecao > 0 && <rect x={-sw / 2 + 20} y={sh / 2 - 12 - hIn} width={(sw - 92) * selecao} height={hIn - 12} rx={6} fill="#4d7cff" opacity={0.45} />}
      {linhas.map((l, k) => <text key={k} x={-sw / 2 + 24} y={sh / 2 - hIn + 8 + k * 24} fontFamily={FONTE} fontWeight={800} fontSize={16} fill={txt}>{l}{cursor && k === linhas.length - 1 ? "|" : ""}</text>)}
      {!rascunho && <text x={-sw / 2 + 24} y={sh / 2 - hIn + 8} fontFamily={FONTE} fontWeight={800} fontSize={16} fill={txt} opacity={0.35}>Mensaje{cursor ? "|" : ""}</text>}
      <circle cx={sw / 2 - 34} cy={sh / 2 - 18 - hIn / 2} r={22} fill={rascunho ? "#2f8f6a" : "#3a4458"} />
      <path d={`M ${sw / 2 - 44},${sh / 2 - 18 - hIn / 2 - 9} L ${sw / 2 - 22},${sh / 2 - 18 - hIn / 2} L ${sw / 2 - 44},${sh / 2 - 18 - hIn / 2 + 9} Z`} fill="#ffffff" />
    </g>
  );
};

/** celular pequeno na mão do personagem (item do rig) com a tela acesa */
export const CelularMao: React.FC<{ luz?: number }> = ({ luz = 1 }) => (
  <g transform="rotate(-8)">
    <rect x={-20} y={-36} width={40} height={72} rx={7} fill="#1a1c22" stroke={TINTA} strokeWidth={3} />
    <rect x={-16} y={-31} width={32} height={60} rx={4} fill="#cfe3ff" opacity={0.35 + 0.6 * luz} />
  </g>
);

/** gotas de chuva em tela cheia (determinísticas) */
export const Chuva: React.FC<{ f: number; n?: number; op?: number; ang?: number; area?: [number, number, number, number] }> = ({ f, n = 90, op = 0.55, ang = 8, area = [-200, -200, 1480, 2300] }) => {
  const [x0, y0, w, h] = area;
  return (
    <g opacity={op} stroke="#cfe0ff" strokeWidth={3} strokeLinecap="round">
      {Array.from({ length: n }, (_, i) => {
        const r1 = ((i * 7919) % 1000) / 1000, r2 = ((i * 104729) % 1000) / 1000;
        const v = 38 + r2 * 22;
        const x = x0 + r1 * w + (f * v * Math.tan((ang * Math.PI) / 180)) % 60;
        const y = y0 + ((r2 * h + f * v) % h);
        return <line key={i} x1={x} y1={y} x2={x - Math.tan((ang * Math.PI) / 180) * 40} y2={y - 40} opacity={0.5 + 0.5 * r1} />;
      })}
    </g>
  );
};

export const fadeIn = (lf: number, d = 8) => clamp01(lf / d);
export const mixCor = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return "#" + pa.map((v, i) => Math.round(lerp(v, pb[i], clamp01(t))).toString(16).padStart(2, "0")).join("");
};
