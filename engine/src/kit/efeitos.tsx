// Efeitos visuais reutilizáveis (camadas HTML/SVG por cima ou dentro da cena).
import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp01, eout, ramp, rnd } from "./anim";

/** Partículas: poeira, brasas, vagalumes, neve, chuva, estrelas cadentes. Use dentro de um <svg>/<g>. */
export const Particulas: React.FC<{
  tipo: "poeira" | "brasas" | "vagalumes" | "neve" | "chuva" | "brilhos";
  n?: number;
  area?: [number, number, number, number]; // x, y, w, h
  seed?: number;
  cor?: string;
  opacidade?: number;
}> = ({ tipo, n = 60, area = [0, 0, 1080, 1920], seed = 1, cor, opacidade = 1 }) => {
  const f = useCurrentFrame();
  const [ax, ay, aw, ah] = area;
  const cfg = {
    poeira: { vy: -0.25, vx: 0.15, r: [1.5, 4], c: "#fff6dd", o: 0.35 },
    brasas: { vy: -2.2, vx: 0.4, r: [2, 5], c: "#ffb347", o: 0.9 },
    vagalumes: { vy: -0.3, vx: 0.3, r: [3, 6], c: "#d7ff7a", o: 0.9 },
    neve: { vy: 2.2, vx: 0.5, r: [3, 7], c: "#ffffff", o: 0.85 },
    chuva: { vy: 38, vx: -6, r: [1.5, 2.5], c: "#a9c7ff", o: 0.45 },
    brilhos: { vy: -0.6, vx: 0, r: [2, 5], c: "#bff7ff", o: 1 },
  }[tipo];
  return (
    <g opacity={opacidade}>
      {Array.from({ length: n }, (_, i) => {
        const r0 = rnd(`${seed}p${i}`), r1 = rnd(`${seed}q${i}`), r2 = rnd(`${seed}r${i}`);
        const r = cfg.r[0] + (cfg.r[1] - cfg.r[0]) * r2;
        let x = ax + ((r0 * aw + f * cfg.vx * (0.5 + r2) + Math.sin(f * 0.03 + i) * 12) % aw + aw) % aw;
        let y = ay + ((r1 * ah + f * cfg.vy * (0.6 + r2)) % ah + ah) % ah;
        const pisca = tipo === "vagalumes" || tipo === "brilhos" ? 0.4 + 0.6 * Math.abs(Math.sin(f * 0.08 + i * 1.7)) : 1;
        const op = cfg.o * pisca;
        const c = cor ?? cfg.c;
        if (tipo === "chuva") return <line key={i} x1={x} y1={y} x2={x - 6} y2={y + 40} stroke={c} strokeWidth={r} opacity={op} />;
        return (
          <g key={i}>
            {(tipo === "brasas" || tipo === "vagalumes" || tipo === "brilhos") && <circle cx={x} cy={y} r={r * 4} fill={c} opacity={op * 0.18} />}
            <circle cx={x} cy={y} r={r} fill={c} opacity={op} />
          </g>
        );
      })}
    </g>
  );
};

/** Vinheta escura nas bordas (camada HTML). */
export const Vinheta: React.FC<{ forca?: number; cor?: string }> = ({ forca = 0.55, cor = "0,0,0" }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, rgba(${cor},0) 45%, rgba(${cor},${forca}) 100%)`, pointerEvents: "none" }} />
);

/** Granulação de filme animada (SVG turbulence com semente por frame). */
export const Granulacao: React.FC<{ forca?: number }> = ({ forca = 0.08 }) => {
  // textura de ruído pré-gerada (public/ruido.png) deslocada a cada frame: barato de renderizar
  const f = useCurrentFrame();
  const ox = Math.floor(rnd(`gx${f}`) * 512), oy = Math.floor(rnd(`gy${f}`) * 512);
  return (
    <AbsoluteFill
      style={{
        mixBlendMode: "overlay", opacity: forca * 2.2, pointerEvents: "none",
        backgroundImage: `url(${staticFile("ruido.png")})`, backgroundSize: "512px 512px", backgroundPosition: `${ox}px ${oy}px`,
      }}
    />
  );
};

/** Flash branco (ou de cor) em um frame, decaindo. */
export const Flash: React.FC<{ em: number; dur?: number; cor?: string; forca?: number }> = ({ em, dur = 8, cor = "#ffffff", forca = 0.85 }) => {
  const f = useCurrentFrame();
  if (f < em || f > em + dur) return null;
  return <AbsoluteFill style={{ backgroundColor: cor, opacity: forca * (1 - eout(ramp(f, em, em + dur))), pointerEvents: "none" }} />;
};

/** Relâmpago: duas piscadas rápidas. */
export const Relampago: React.FC<{ em: number }> = ({ em }) => {
  const f = useCurrentFrame();
  const d = f - em;
  const o = d >= 0 && d < 3 ? 0.9 : d >= 5 && d < 7 ? 0.6 : d >= 7 && d < 16 ? 0.4 * (1 - (d - 7) / 9) : 0;
  return o > 0 ? <AbsoluteFill style={{ backgroundColor: "#dfe8ff", opacity: o, mixBlendMode: "screen" }} /> : null;
};

/** Fade de/para preto. */
export const Fade: React.FC<{ entrada?: number; saida?: number; total: number }> = ({ entrada = 8, saida = 10, total }) => {
  const f = useCurrentFrame();
  const o = Math.max(1 - ramp(f, 0, entrada), ramp(f, total - saida, total - 1));
  return o > 0 ? <AbsoluteFill style={{ backgroundColor: "#000", opacity: o }} /> : null;
};

/** Raios de luz (god rays) — dentro de <svg>. */
export const RaiosDeLuz: React.FC<{ x: number; y: number; cor?: string; n?: number; comp?: number; opacidade?: number }> = ({ x, y, cor = "#fff2c4", n = 9, comp = 1600, opacidade = 0.25 }) => {
  const f = useCurrentFrame();
  return (
    <g style={{ mixBlendMode: "screen" }} opacity={opacidade}>
      {Array.from({ length: n }, (_, i) => {
        const a = -70 + (i / (n - 1)) * 140 + Math.sin(f * 0.02 + i) * 3;
        const w = 30 + rnd(`raio${i}`) * 70;
        return (
          <path key={i} transform={`translate(${x} ${y}) rotate(${a})`} d={`M ${-w * 0.1},0 L ${w},${comp} L ${-w},${comp} Z`} fill={cor} opacity={0.3 + 0.5 * Math.abs(Math.sin(f * 0.03 + i * 2))} />
        );
      })}
    </g>
  );
};

/** Texto de impacto que salta na tela (números, datas, palavras-chave). Camada HTML. */
export const TextoPop: React.FC<{ texto: string; em: number; ate?: number; y?: number; cor?: string; tamanho?: number; fonte?: string; rot?: number }> = ({
  texto, em, ate = 1e9, y = 0.28, cor = "#ffd60a", tamanho = 150, fonte = "Anton", rot = -4,
}) => {
  const f = useCurrentFrame();
  const { height, width } = useVideoConfig();
  if (f < em || f > ate) return null;
  const t = ramp(f, em, em + 7);
  const s = t < 1 ? 0.3 + 0.9 * eout(t) - 0.2 * Math.sin(t * Math.PI) : 1 + 0.015 * Math.sin((f - em) * 0.2);
  const o = clamp01(1 - ramp(f, ate - 5, ate));
  return (
    <div style={{ position: "absolute", top: y * height, left: 0, width, textAlign: "center", transform: `translateY(-50%) scale(${s}) rotate(${rot}deg)`, opacity: o }}>
      <span style={{ fontFamily: fonte, fontSize: tamanho * (width / 1080), color: cor, WebkitTextStroke: `${12 * (width / 1080)}px #000`, paintOrder: "stroke fill", textShadow: "0 10px 24px rgba(0,0,0,0.6)" }}>{texto}</span>
    </div>
  );
};
