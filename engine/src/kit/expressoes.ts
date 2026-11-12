// Biblioteca de expressões faciais. Cada expressão é um conjunto numérico,
// então dá para misturar duas (transição suave) com misturaExpr / exprEm.
import { eio, lerp, ramp } from "./anim";

export type Expr = {
  sobInt: number; // sobrancelha: altura do lado interno (+ = sobe)
  sobExt: number; // sobrancelha: altura do lado externo
  palpebra: number; // pálpebra superior fechando o olho 0..1
  palpInf: number; // pálpebra inferior subindo (sorriso nos olhos) 0..1
  pupila: number; // escala da pupila
  olhoAbre: number; // escala vertical do olho
  bocaCurva: number; // -1 triste ... +1 sorriso
  bocaLarg: number; // largura relativa
  bocaAbre: number; // abertura base 0..1 (somada ao lip-sync)
  dentes: number; // 0..1 mostra dentes na boca aberta
  bochecha: number; // rubor 0..1
  suor: number; // gota de suor 0..1
};

const base: Expr = {
  sobInt: 0, sobExt: 0, palpebra: 0.12, palpInf: 0, pupila: 1, olhoAbre: 1,
  bocaCurva: 0.25, bocaLarg: 1, bocaAbre: 0, dentes: 0, bochecha: 0, suor: 0,
};

export const EXPRESSOES = {
  neutro: base,
  feliz: { ...base, sobInt: 4, sobExt: 2, palpInf: 0.35, bocaCurva: 0.9, bocaLarg: 1.2, bocaAbre: 0.25, dentes: 0.8, bochecha: 0.6 },
  empolgado: { ...base, sobInt: 10, sobExt: 8, palpebra: 0, pupila: 1.1, olhoAbre: 1.1, bocaCurva: 1, bocaLarg: 1.35, bocaAbre: 0.55, dentes: 1, bochecha: 0.7 },
  surpreso: { ...base, sobInt: 16, sobExt: 14, palpebra: 0, pupila: 0.7, olhoAbre: 1.22, bocaCurva: 0, bocaLarg: 0.7, bocaAbre: 0.75 },
  medo: { ...base, sobInt: 14, sobExt: -4, palpebra: 0, pupila: 0.55, olhoAbre: 1.25, bocaCurva: -0.6, bocaLarg: 1.1, bocaAbre: 0.4, dentes: 1, suor: 1 },
  triste: { ...base, sobInt: 10, sobExt: -6, palpebra: 0.35, bocaCurva: -0.8, bocaLarg: 0.9 },
  bravo: { ...base, sobInt: -12, sobExt: 6, palpebra: 0.3, pupila: 0.9, bocaCurva: -0.5, bocaLarg: 1.1, bocaAbre: 0.2, dentes: 1 },
  pensativo: { ...base, sobInt: 2, sobExt: 9, palpebra: 0.3, bocaCurva: -0.1, bocaLarg: 0.7 },
  desconfiado: { ...base, sobInt: -6, sobExt: 2, palpebra: 0.5, palpInf: 0.2, bocaCurva: -0.2, bocaLarg: 0.8 },
  sereno: { ...base, sobInt: 3, sobExt: 0, palpebra: 0.45, palpInf: 0.2, bocaCurva: 0.45, bocaLarg: 0.9, bochecha: 0.3 },
  maravilhado: { ...base, sobInt: 12, sobExt: 9, palpebra: 0, pupila: 1.25, olhoAbre: 1.15, bocaCurva: 0.5, bocaLarg: 0.8, bocaAbre: 0.45, bochecha: 0.5 },
  horrorizado: { ...base, sobInt: 18, sobExt: 2, palpebra: 0, pupila: 0.4, olhoAbre: 1.3, bocaCurva: -0.9, bocaLarg: 1.2, bocaAbre: 0.85, dentes: 0.6, suor: 1 },
} satisfies Record<string, Expr>;

export type NomeExpr = keyof typeof EXPRESSOES;

export const misturaExpr = (a: Expr, b: Expr, t: number): Expr => {
  const o = {} as Expr;
  (Object.keys(a) as (keyof Expr)[]).forEach((k) => (o[k] = lerp(a[k], b[k], t)));
  return o;
};

/** Sequência de expressões: [[frame, "feliz"], [frame, "surpreso"], ...] com transição de `trans` frames. */
export const exprEm = (f: number, seq: [number, NomeExpr][], trans = 6): Expr => {
  let atual: Expr = EXPRESSOES[seq[0][1]];
  for (let i = 1; i < seq.length; i++) {
    const [fi, nome] = seq[i];
    if (f >= fi) atual = misturaExpr(atual, EXPRESSOES[nome], eio(ramp(f, fi, fi + trans)));
  }
  return atual;
};
