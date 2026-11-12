// Globo terrestre didático em SVG (projeção ortográfica), para mapas animados:
// gira (lon0/lat0 animáveis), destaca regiões, mostra anéis de alerta, rotas em arco e rótulos.
// Uso: <Globo cx cy r lon0 lat0 destaques={{china: "#e5484d"}} alertas={[{ll, cor, inicio}]} rotas={[...]} rotulos={[...]} />
import React from "react";
import { useCurrentFrame } from "remotion";
import { CONTINENTES, REGIOES, LL } from "./geo";
import { clamp01, eout, ramp } from "./anim";

const R2 = Math.PI / 180;

export const projetar = (ll: LL, lon0: number, lat0: number, r: number) => {
  const l = (ll[0] - lon0) * R2, p = ll[1] * R2, p0 = lat0 * R2;
  const cosc = Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(l);
  let x = r * Math.cos(p) * Math.sin(l);
  let y = r * (Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l));
  if (cosc < 0) { // atrás do globo: cola na borda (o clipPath recorta)
    const k = r / Math.max(1e-6, Math.hypot(x, y));
    x *= k; y *= k;
  }
  return { x, y: -y, visivel: cosc >= 0, cosc };
};

const caminho = (pts: LL[], lon0: number, lat0: number, r: number) => {
  const pr = pts.map((q) => projetar(q, lon0, lat0, r));
  if (!pr.some((q) => q.visivel)) return null;
  return "M" + pr.map((q) => `${q.x.toFixed(1)},${q.y.toFixed(1)}`).join("L") + "Z";
};

/** ponto no grande círculo entre a e b (t 0..1), com "altura" h (fração do raio) para arcos elevados */
const slerp = (a: LL, b: LL, t: number): LL => {
  const v = (q: LL) => [Math.cos(q[1] * R2) * Math.cos(q[0] * R2), Math.cos(q[1] * R2) * Math.sin(q[0] * R2), Math.sin(q[1] * R2)];
  const A = v(a), B = v(b);
  const d = Math.acos(Math.min(1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2]));
  if (d < 1e-6) return a;
  const s1 = Math.sin((1 - t) * d) / Math.sin(d), s2 = Math.sin(t * d) / Math.sin(d);
  const P = [A[0] * s1 + B[0] * s2, A[1] * s1 + B[1] * s2, A[2] * s1 + B[2] * s2];
  return [Math.atan2(P[1], P[0]) / R2, Math.asin(P[2]) / R2];
};

export type Alerta = { ll: LL; cor?: string; inicio?: number; tamanho?: number };
export type Rota = { de: LL; para: LL; cor?: string; inicio: number; dur?: number; altura?: number; tracejada?: boolean; largura?: number };
export type Rotulo = { ll: LL; texto: string; cor?: string; inicio?: number; dy?: number; tamanho?: number };

export const Globo: React.FC<{
  cx: number; cy: number; r: number; lon0: number; lat0: number; id?: string;
  destaques?: Record<string, string>; pulsoDestaque?: boolean;
  alertas?: Alerta[]; rotas?: Rota[]; rotulos?: Rotulo[];
  oceano?: [string, string]; terra?: string; contorno?: string; noite?: number; grade?: boolean;
}> = ({ cx, cy, r, lon0, lat0, id = "g", destaques = {}, pulsoDestaque = true, alertas = [], rotas = [], rotulos = [],
  oceano = ["#2f86c9", "#123a6b"], terra = "#79c27a", contorno = "#163626", noite = 0, grade = true }) => {
  const f = useCurrentFrame();
  const clip = `glc-${id}`;
  const linhaGrade = (pts: LL[], k: number) => {
    const pr = pts.map((q) => projetar(q, lon0, lat0, r));
    let d = "";
    pr.forEach((q, i) => { if (q.visivel) d += (i && pr[i - 1].visivel ? "L" : "M") + `${q.x.toFixed(1)},${q.y.toFixed(1)}`; });
    return d ? <path key={k} d={d} stroke="#ffffff" strokeWidth={1.4} opacity={0.14} fill="none" /> : null;
  };
  const pulso = pulsoDestaque ? 0.75 + 0.25 * Math.sin(f * 0.18) : 1;
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <defs>
        <radialGradient id={`${clip}-oc`} cx="0.38" cy="0.32" r="0.8">
          <stop offset="0" stopColor={oceano[0]} /><stop offset="1" stopColor={oceano[1]} />
        </radialGradient>
        <radialGradient id={`${clip}-atm`}>
          <stop offset="0.86" stopColor="#7fd0ff" stopOpacity="0" /><stop offset="0.93" stopColor="#7fd0ff" stopOpacity="0.55" /><stop offset="1" stopColor="#7fd0ff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${clip}-sh`} cx="0.3" cy="0.28" r="0.95">
          <stop offset="0.45" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#020617" stopOpacity={0.55 + noite * 0.35} />
        </radialGradient>
        <clipPath id={clip}><circle r={r} /></clipPath>
      </defs>
      <circle r={r * 1.16} fill={`url(#${clip}-atm)`} />
      <circle r={r} fill={`url(#${clip}-oc)`} />
      <g clipPath={`url(#${clip})`}>
        {grade && Array.from({ length: 12 }, (_, i) => linhaGrade(Array.from({ length: 37 }, (_, k) => [i * 30 - 180, -90 + k * 5] as LL), i))}
        {grade && Array.from({ length: 5 }, (_, i) => linhaGrade(Array.from({ length: 73 }, (_, k) => [-180 + k * 5, -60 + i * 30] as LL), 100 + i))}
        {Object.entries(CONTINENTES).map(([k, pts]) => {
          const d = caminho(pts, lon0, lat0, r);
          return d ? <path key={k} d={d} fill={terra} stroke={contorno} strokeWidth={Math.max(2, r * 0.008)} strokeLinejoin="round" /> : null;
        })}
        {Object.entries(destaques).map(([k, cor]) =>
          (REGIOES[k] ?? []).map((pts, i) => {
            const d = caminho(pts, lon0, lat0, r);
            return d ? <path key={`${k}${i}`} d={d} fill={cor} opacity={0.6 + 0.4 * pulso} stroke="#fff6d8" strokeWidth={Math.max(2.5, r * 0.01)} strokeLinejoin="round" /> : null;
          }),
        )}
        <circle r={r} fill={`url(#${clip}-sh)`} />
        {rotas.map((ro, i) => {
          const t = eout(ramp(f, ro.inicio, ro.inicio + (ro.dur ?? 30)));
          if (t <= 0) return null;
          const n = 40, pts: string[] = [];
          for (let k = 0; k <= n * t; k++) {
            const q = slerp(ro.de, ro.para, k / n);
            const h = 1 + (ro.altura ?? 0.12) * Math.sin(Math.PI * k / n);
            const p = projetar(q, lon0, lat0, r);
            if (!p.visivel) continue;
            pts.push(`${(p.x * h).toFixed(1)},${(p.y * h).toFixed(1)}`);
          }
          if (pts.length < 2) return null;
          const fim = pts[pts.length - 1].split(",").map(Number);
          return (
            <g key={`r${i}`}>
              <polyline points={pts.join(" ")} fill="none" stroke="#0b1020" strokeWidth={(ro.largura ?? 7) + 6} opacity={0.4} strokeLinecap="round" />
              <polyline points={pts.join(" ")} fill="none" stroke={ro.cor ?? "#ffd60a"} strokeWidth={ro.largura ?? 7} strokeLinecap="round" strokeDasharray={ro.tracejada ? "18 14" : undefined} strokeDashoffset={-f * 2} />
              <circle cx={fim[0]} cy={fim[1]} r={(ro.largura ?? 7) * 1.4} fill={ro.cor ?? "#ffd60a"} />
            </g>
          );
        })}
      </g>
      {alertas.map((a, i) => {
        const p = projetar(a.ll, lon0, lat0, r);
        if (!p.visivel || f < (a.inicio ?? 0)) return null;
        const t = f - (a.inicio ?? 0), tam = a.tamanho ?? 1, cor = a.cor ?? "#ff3b3b";
        return (
          <g key={`a${i}`} transform={`translate(${p.x} ${p.y}) scale(${tam * eout(ramp(t, 0, 8))})`}>
            {[0, 1, 2].map((k) => {
              const u = ((t + k * 12) % 36) / 36;
              return <circle key={k} r={14 + u * 90} fill="none" stroke={cor} strokeWidth={6 * (1 - u)} opacity={1 - u} />;
            })}
            <circle r={13} fill={cor} stroke="#fff" strokeWidth={4} />
          </g>
        );
      })}
      {rotulos.map((ro, i) => {
        const p = projetar(ro.ll, lon0, lat0, r);
        if (!p.visivel || f < (ro.inicio ?? 0)) return null;
        const s = clamp01(eout(ramp(f, ro.inicio ?? 0, (ro.inicio ?? 0) + 8)));
        const tam = ro.tamanho ?? 44;
        return (
          <g key={`t${i}`} transform={`translate(${p.x} ${p.y + (ro.dy ?? -40)}) scale(${s})`}>
            <text textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={tam} fill={ro.cor ?? "#ffffff"} stroke="#0b1020" strokeWidth={tam * 0.22} paintOrder="stroke">{ro.texto}</text>
          </g>
        );
      })}
      <circle r={r} fill="none" stroke="#0b1020" strokeWidth={Math.max(3, r * 0.012)} />
    </g>
  );
};
