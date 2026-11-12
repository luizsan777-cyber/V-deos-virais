// Câmera 2D: enquadra um "mundo" desenhado em coordenadas próprias (padrão 1080 x 1920).
// Chaves: [frame, centroX, centroY, zoom, rotação°]. Zoom interpolado em escala log (sensação uniforme).
// "deriva" adiciona um empurrão lento constante para nunca haver quadro parado; "tremores" são impactos.
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { eio, lerp, ramp, ruido, tremor } from "./anim";

export type ChaveCam = [number, number, number, number, number?];

export const camEm = (f: number, ks: ChaveCam[]) => {
  for (let k = 0; k < ks.length - 1; k++) {
    const [f0, x0, y0, z0, r0 = 0] = ks[k], [f1, x1, y1, z1, r1 = 0] = ks[k + 1];
    if (f <= f1) {
      const t = eio(ramp(f, f0, f1));
      return { cx: lerp(x0, x1, t), cy: lerp(y0, y1, t), z: Math.exp(lerp(Math.log(z0), Math.log(z1), t)), r: lerp(r0, r1, t) };
    }
  }
  const [, x, y, z, r = 0] = ks[ks.length - 1];
  return { cx: x, cy: y, z, r };
};

export const Camera: React.FC<{
  chaves: ChaveCam[];
  deriva?: number; // % de zoom por segundo (0.6 = sutil)
  tremores?: number[]; // frames de impacto
  forcaTremor?: number;
  mao?: number; // câmera na mão (0..1)
  mundo?: [number, number];
  inicio?: number; // frame global em que a tomada começa: chaves e tremores ficam em tempo LOCAL da tomada
  children: React.ReactNode;
}> = ({ chaves, deriva = 0.6, tremores = [], forcaTremor = 22, mao = 0, mundo = [1080, 1920], inicio = 0, children }) => {
  const f = useCurrentFrame() - inicio;
  const { width, height, fps } = useVideoConfig();
  const c = camEm(f, chaves);
  // deriva conta a partir da 1ª chave da tomada (não do início do vídeo), para tomadas longas no meio do vídeo
  const z = c.z * (1 + (deriva / 100) * (Math.max(0, f - chaves[0][0]) / fps));
  let [tx, ty] = [0, 0];
  for (const em of tremores) {
    const [a, b] = tremor(f, em, forcaTremor);
    tx += a; ty += b;
  }
  tx += ruido(f / 40, 7) * 10 * mao;
  ty += ruido(f / 47, 13) * 8 * mao;
  const cover = Math.max(width / mundo[0], height / mundo[1]);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0 }}>
      <g transform={`translate(${width / 2 + tx} ${height / 2 + ty}) rotate(${c.r + ruido(f / 60, 3) * 0.6 * mao}) scale(${z * cover}) translate(${-c.cx} ${-c.cy})`}>
        {children}
      </g>
    </svg>
  );
};
