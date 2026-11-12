// Funções puras de animação: tudo depende só do número do frame (render determinístico).
// Parte das ideias (camera em log-zoom, piscar com semente, wobble) vem do story-animator (MIT).
import { random } from "remotion";

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** 0 antes de a, 1 depois de b, linear entre eles. */
export const ramp = (f: number, a: number, b: number) => (b === a ? (f >= a ? 1 : 0) : clamp01((f - a) / (b - a)));

export const eio = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const eout = (t: number) => 1 - Math.pow(1 - t, 3);
export const ein = (t: number) => t * t * t;
export const smooth = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
/** pequeno overshoot ("pop") */
export const eback = (t: number) => {
  const c1 = 1.9, c3 = c1 + 1;
  return t >= 1 ? 1 : 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
/** mola amortecida: 0 → 1 com oscilação */
export const mola = (t: number, freq = 3.2, amort = 5) => (t <= 0 ? 0 : 1 - Math.exp(-amort * t) * Math.cos(freq * Math.PI * t));

export const rnd = (seed: string | number) => random(String(seed));

/** movimento "vivo" contínuo, -1..1 */
export const wobble = (f: number, seed: number, vel = 1) =>
  0.6 * Math.sin(f * 0.11 * vel + seed) + 0.4 * Math.sin(f * 0.23 * vel + seed * 1.7);

/** ruído 1D suave (value noise), -1..1 */
export const ruido = (x: number, seed = 0) => {
  const i = Math.floor(x), fr = x - i;
  const h = (n: number) => rnd(`n${seed}_${n}`) * 2 - 1;
  return lerp(h(i), h(i + 1), smooth(fr));
};

/** abertura dos olhos 0..1 com piscadas em intervalos variados */
export const piscar = (f: number, seed: number) => {
  const periodo = 70 + Math.floor(rnd(`pisc-${seed}`) * 70);
  const p = (f + Math.floor(rnd(`pisco-${seed}`) * periodo)) % periodo;
  return p < 2 ? 1 - p / 2 : p < 5 ? (p - 2) / 3 : 1;
};

/** Interpola uma lista de chaves [frame, valor] com easing. */
export const chaves = (f: number, ks: [number, number][], ease = eio) => {
  if (f <= ks[0][0]) return ks[0][1];
  for (let k = 0; k < ks.length - 1; k++) {
    const [f0, v0] = ks[k], [f1, v1] = ks[k + 1];
    if (f <= f1) return lerp(v0, v1, ease(ramp(f, f0, f1)));
  }
  return ks[ks.length - 1][1];
};

/** Tremida de impacto: alterna sinal a cada frame e decai. */
export const tremor = (f: number, em: number, forca = 18, dur = 9) => {
  if (f < em || f > em + dur) return [0, 0];
  const k = 1 - (f - em) / dur;
  const s = (f - em) % 2 === 0 ? 1 : -1;
  return [s * forca * k * (0.6 + 0.4 * rnd(`tx${em}${f}`)), -s * forca * 0.6 * k * rnd(`ty${em}${f}`)];
};
