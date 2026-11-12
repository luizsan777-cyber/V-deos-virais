// Poses e ciclos de movimento do personagem. Ângulos em graus.
// braço/perna: [ângulo do segmento superior (0 = para baixo, + = para fora), dobra da articulação]
import { eio, lerp, ramp, ruido, wobble } from "./anim";

export type Mao = "aberta" | "punho" | "aponta";
export type Pose = {
  dx?: number; // deslocamento do quadril
  bob?: number; // sobe/desce do corpo
  agachar?: number; // + desce o quadril
  tronco?: number; // inclinação do tronco
  cabecaIncl?: number; // inclinação da cabeça
  virar?: number; // rosto 3/4 (-1..1)
  olhar?: [number, number]; // direção das pupilas (-1..1)
  respirar?: number; // fase da respiração
  saia?: number; // balanço da barra da túnica
  bracoE: [number, number];
  bracoD: [number, number];
  pernaE: [number, number];
  pernaD: [number, number];
  maoE?: Mao;
  maoD?: Mao;
  frenteE?: boolean; // braço desenhado na frente do tronco
  frenteD?: boolean;
};

export const POSE_BASE: Pose = {
  bracoE: [10, 8], bracoD: [10, 8], pernaE: [4, 0], pernaD: [4, 0], maoE: "aberta", maoD: "aberta",
};

const num = (a: number | undefined, b: number | undefined, t: number) => lerp(a ?? 0, b ?? 0, t);
const par = (a: [number, number], b: [number, number], t: number): [number, number] => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

/** Mistura duas poses (t = 0 → a, 1 → b). */
export const misturaPose = (a: Pose, b: Pose, t: number): Pose => ({
  dx: num(a.dx, b.dx, t), bob: num(a.bob, b.bob, t), agachar: num(a.agachar, b.agachar, t), tronco: num(a.tronco, b.tronco, t),
  cabecaIncl: num(a.cabecaIncl, b.cabecaIncl, t), virar: num(a.virar, b.virar, t),
  olhar: [num(a.olhar?.[0], b.olhar?.[0], t), num(a.olhar?.[1], b.olhar?.[1], t)],
  respirar: t < 0.5 ? a.respirar : b.respirar, saia: num(a.saia, b.saia, t),
  bracoE: par(a.bracoE, b.bracoE, t), bracoD: par(a.bracoD, b.bracoD, t),
  pernaE: par(a.pernaE, b.pernaE, t), pernaD: par(a.pernaD, b.pernaD, t),
  maoE: t < 0.5 ? a.maoE : b.maoE, maoD: t < 0.5 ? a.maoD : b.maoD,
  frenteE: t < 0.5 ? a.frenteE : b.frenteE, frenteD: t < 0.5 ? a.frenteD : b.frenteD,
});

/** Parado, respirando, com micro-movimentos (nunca fica estático). */
export const parado = (f: number, seed = 1): Pose => ({
  ...POSE_BASE,
  respirar: f * 0.09 + seed,
  tronco: wobble(f, seed, 0.35) * 1.5,
  cabecaIncl: wobble(f, seed + 3, 0.3) * 3,
  bracoE: [9 + wobble(f, seed + 1, 0.4) * 2, 10 + wobble(f, seed + 5, 0.3) * 4],
  bracoD: [9 + wobble(f, seed + 2, 0.4) * 2, 10 + wobble(f, seed + 6, 0.3) * 4],
  olhar: [ruido(f / 45, seed) * 0.4, ruido(f / 60, seed + 9) * 0.2],
});

/** Gestos de quem está falando (energia 0..1). */
export const falando = (f: number, seed = 1, energia = 0.7): Pose => {
  const p = parado(f, seed);
  const g1 = ruido(f / 14, seed + 11), g2 = ruido(f / 17, seed + 23);
  return {
    ...p,
    tronco: (p.tronco ?? 0) + g1 * 3 * energia,
    cabecaIncl: (p.cabecaIncl ?? 0) + g2 * 6 * energia,
    bracoE: [22 + g1 * 22 * energia, 70 + g2 * 40 * energia],
    bracoD: [26 + g2 * 26 * energia, 85 + g1 * 35 * energia],
    frenteE: true, frenteD: true,
  };
};

/** Ciclo de caminhada (vel = passos por segundo aproximado). */
export const andando = (f: number, vel = 1.6, seed = 1): Pose => {
  const ph = (f / 30) * vel * Math.PI * 2;
  const s = Math.sin(ph);
  return {
    ...POSE_BASE,
    bob: -Math.abs(Math.cos(ph)) * 10 + 5,
    tronco: 2 + Math.sin(ph * 2) * 1,
    cabecaIncl: Math.sin(ph) * 2,
    respirar: f * 0.1 + seed,
    saia: s * 10,
    bracoE: [8 - s * 16, 14 + Math.max(0, s) * 18],
    bracoD: [8 + s * 16, 14 + Math.max(0, -s) * 18],
    pernaE: [4 + s * 14, Math.max(0, -s) * 40],
    pernaD: [4 - s * 14, Math.max(0, s) * 40],
  };
};

export const correndo = (f: number, seed = 1): Pose => {
  const p = andando(f, 3.2, seed);
  return { ...p, tronco: 9, bob: (p.bob ?? 0) * 2, bracoE: [p.bracoE[0] * 1.8, 80], bracoD: [p.bracoD[0] * 1.8, 80], pernaE: [p.pernaE[0] * 1.6, p.pernaE[1] * 1.4], pernaD: [p.pernaD[0] * 1.6, p.pernaD[1] * 1.4] };
};

/** Aponta com o braço direito (alvoAng: 90 = horizontal para fora, 150 = para o alto). */
export const apontando = (f: number, alvoAng = 100, seed = 1): Pose => {
  const p = parado(f, seed);
  return { ...p, bracoD: [alvoAng + wobble(f, seed, 0.5) * 2, 6], maoD: "aponta", tronco: -3, cabecaIncl: 4 };
};

export const surpreso = (f: number, seed = 1): Pose => {
  const p = parado(f, seed);
  return { ...p, bracoE: [60, 110], bracoD: [60, 110], frenteE: true, frenteD: true, tronco: -4, agachar: -6 };
};

export const comMedo = (f: number, seed = 1): Pose => {
  const tr = Math.sin(f * 2.1) * 1.6;
  return {
    ...POSE_BASE, respirar: f * 0.3, agachar: 26, tronco: -6 + tr, cabecaIncl: -6 + tr,
    bracoE: [35 + tr, 135], bracoD: [35 - tr, 135], frenteE: true, frenteD: true, maoE: "punho", maoD: "punho",
    pernaE: [12, 30], pernaD: [12, 30],
  };
};

export const bracosAoAlto = (f: number, seed = 1): Pose => {
  const p = parado(f, seed);
  return { ...p, bracoE: [155 + wobble(f, seed, 1) * 6, 20], bracoD: [155 + wobble(f, seed + 1, 1) * 6, 20], bob: -6, tronco: 0 };
};

export const orando = (f: number, seed = 1): Pose => {
  const p = parado(f, seed);
  return { ...p, bracoE: [24, 128], bracoD: [24, 128], frenteE: true, frenteD: true, cabecaIncl: 8, olhar: [0, 0.6] };
};

export const pensando = (f: number, seed = 1): Pose => {
  const p = parado(f, seed);
  return { ...p, bracoD: [30, 150], frenteD: true, maoD: "punho", bracoE: [20, 95], frenteE: true, cabecaIncl: -7, olhar: [0.5, -0.6] };
};

export const encolhendoOmbros = (f: number, seed = 1): Pose => {
  const p = parado(f, seed);
  return { ...p, bracoE: [40, 100], bracoD: [40, 100], cabecaIncl: 8, bob: -4 };
};

/** Olhando a própria mão (braço direito à frente do rosto). */
export const olhandoMao = (f: number, seed = 1): Pose => {
  const p = parado(f, seed);
  return { ...p, bracoD: [100, 145], frenteD: true, maoD: "aberta", olhar: [0.6, 0.2], cabecaIncl: 6, virar: 0.25 };
};

/** Sequência de poses no tempo: [[frame, poseFn], ...] com transição suave de `trans` frames. */
export const poseEm = (f: number, seq: [number, (f: number) => Pose][], trans = 8): Pose => {
  let atual = seq[0][1](f);
  for (let i = 1; i < seq.length; i++) {
    const [fi, fn] = seq[i];
    if (f >= fi) atual = misturaPose(atual, fn(f), eio(ramp(f, fi, fi + trans)));
  }
  return atual;
};

/** Segurando o celular na frente do peito/rosto (use com <Personagem itemD={<celular/>}>). */
export const olhandoCelular = (f: number, seed = 1, altura = 0.35): Pose => {
  // altura 0 = celular na altura do peito (rosto livre); 1 = celular na frente do rosto
  const p = parado(f, seed);
  return {
    ...p, bracoD: [40 - 14 * altura, 112 + 38 * altura], frenteD: true, maoD: "aberta",
    bracoE: [14 + wobble(f, seed, 0.4) * 2, 18], olhar: [0.25, 0.75], cabecaIncl: 7 + wobble(f, seed + 4, 0.3) * 2,
  };
};
