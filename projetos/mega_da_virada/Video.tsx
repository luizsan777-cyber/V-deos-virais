// mega_da_virada — orquestrador: uma cena por fala (ids c01..c08); cada cena começa 6 quadros antes da sua fala.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useTempos } from "../../engine/src/kit/tempo";
import { Legendas } from "../../engine/src/kit/Legendas";
import { Vinheta } from "../../engine/src/kit/efeitos";
import { clamp01, ramp } from "../../engine/src/kit/anim";
import { OverlayHyperFrames } from "../../engine/src/kit/canal";
import { Cena01, Cena02, Cena03, Cena04, Cena05, Cena06, Cena07, Cena08 } from "./cenas";

const ORDEM = ['c01', 'c02', 'c03', 'c04', 'c05', 'c06', 'c07', 'c08'];
const CENAS = [Cena01, Cena02, Cena03, Cena04, Cena05, Cena06, Cena07, Cena08];
const YLEG = [0.78, 0.78, 0.80, 0.78, 0.66, 0.80, 0.80, 0.78];
const HF_CENA = -1, HF_NOME = ""; // sobreposição renderizada pelo HyperFrames (ver hf/)

export default function Video() {
  const f = useCurrentFrame();
  const T = useTempos();
  const ini = (i: number) => (i === 0 ? 0 : T.fala(ORDEM[i]).ini - 6);
  const cenas = ORDEM.map((_, i) => ({ i, inicio: ini(i), fim: i < ORDEM.length - 1 ? ini(i + 1) : T.total }));
  const c = cenas.find((x) => f >= x.inicio && f < x.fim) ?? cenas[cenas.length - 1];
  const Cena = CENAS[c.i];
  const prev = c.i > 0 ? cenas[c.i - 1] : null;
  const dis = prev ? 1 - clamp01(ramp(f, c.inicio, c.inicio + 6)) : 0;
  const Prev = prev ? CENAS[prev.i] : null;
  const hf = HF_CENA >= 0 ? cenas[HF_CENA] : null;
  return (
    <AbsoluteFill style={{ backgroundColor: "#10121f" }}>
      <Cena inicio={c.inicio} fim={c.fim} />
      {hf && c.i === HF_CENA && <OverlayHyperFrames nome={HF_NOME} inicio={hf.inicio} quadros={hf.fim - hf.inicio} />}
      {Prev && dis > 0 && <AbsoluteFill style={{ opacity: dis }}><Prev inicio={prev!.inicio} fim={prev!.fim} /></AbsoluteFill>}
      <Vinheta forca={0.3} />
      <Legendas estilo="impacto" y={YLEG[c.i]} />
    </AbsoluteFill>
  );
}
