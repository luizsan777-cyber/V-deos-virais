// VÍDEO 04 — Por que você não consegue fazer cócegas em si mesmo? (2D, Remotion)
// 12 cenas = 12 falas do projeto.json (ids c01..c12). Cada cena começa 6 quadros antes da sua fala.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useTempos } from "../../engine/src/kit/tempo";
import { Legendas } from "../../engine/src/kit/Legendas";
import { Vinheta } from "../../engine/src/kit/efeitos";
import { clamp01, ramp } from "../../engine/src/kit/anim";
import { Cena01, Cena02, Cena03, Cena04, Cena05, Cena06, Cena07, Cena08, Cena09, Cena10, Cena11, Cena12 } from "./cenas";

const ORDEM = ["c01_desafio", "c02_pele", "c03_comando", "c04_previsao", "c05_cerebelo", "c06_atenuacao", "c07_outra", "c08_surpresa", "c09_atraso", "c10_serve", "c11_cotidiano", "c12_tentou"];
const CENAS = [Cena01, Cena02, Cena03, Cena04, Cena05, Cena06, Cena07, Cena08, Cena09, Cena10, Cena11, Cena12];
// altura da legenda por cena (fração da tela), fora dos letreiros e do quadro lateral
const YLEG = [0.74, 0.72, 0.74, 0.7, 0.74, 0.7, 0.74, 0.74, 0.74, 0.72, 0.74, 0.74];

export default function Video() {
  const f = useCurrentFrame();
  const T = useTempos();
  const ini = (i: number) => (i === 0 ? 0 : T.fala(ORDEM[i]).ini - 6);
  const cenas = ORDEM.map((_, i) => ({ i, inicio: ini(i), fim: i < ORDEM.length - 1 ? ini(i + 1) : T.total }));
  const c = cenas.find((x) => f >= x.inicio && f < x.fim) ?? cenas[cenas.length - 1];
  const Cena = CENAS[c.i];
  // dissolve curto (6 quadros) vindo da cena anterior: sem cortes secos
  const prev = c.i > 0 ? cenas[c.i - 1] : null;
  const dis = prev ? 1 - clamp01(ramp(f, c.inicio, c.inicio + 6)) : 0;
  const Prev = prev ? CENAS[prev.i] : null;
  return (
    <AbsoluteFill style={{ backgroundColor: "#2a1f45" }}>
      <Cena inicio={c.inicio} fim={c.fim} />
      {Prev && dis > 0 && <AbsoluteFill style={{ opacity: dis }}><Prev inicio={prev!.inicio} fim={prev!.fim} /></AbsoluteFill>}
      <Vinheta forca={0.25} />
      <Legendas estilo="impacto" y={YLEG[c.i]} />
    </AbsoluteFill>
  );
}
