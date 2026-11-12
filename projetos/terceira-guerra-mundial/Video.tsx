// EPISÓDIO — "E se a 3ª Guerra Mundial começasse hoje?" (SIMULAÇÃO FICTÍCIA, didática).
// 11 cenas sincronizadas com a narração real (useTempos). Personagens: rig engine/src/kit/Personagem.tsx.
// Cenas em cenasA.tsx (1–4), cenasB.tsx (5–8), cenasC.tsx (9–11); peças desenhadas em pecas.tsx; elenco em elenco.tsx.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useTempos } from "../../engine/src/kit/tempo";
import { Legendas } from "../../engine/src/kit/Legendas";
import { Vinheta, Granulacao, Flash } from "../../engine/src/kit/efeitos";
import { eout, ramp } from "../../engine/src/kit/anim";
import { TarjaSimulacao } from "./pecas";
import { Cena1, Cena2, Cena3, Cena4 } from "./cenasA";
import { Cena5, Cena6, Cena7, Cena8 } from "./cenasB";
import { Cena9, Cena10, Cena11 } from "./cenasC";

const IDS = ["gancho", "taiwan", "ataques", "internet", "mundo", "cadeias", "brasil", "comercio", "diplomacia", "escalada", "final"];
const CENAS = [Cena1, Cena2, Cena3, Cena4, Cena5, Cena6, Cena7, Cena8, Cena9, Cena10, Cena11];
const ANTES = 6; // a imagem da cena entra 6 frames antes da fala (o corte "puxa" a voz)

/** Altura da legenda por cena (fração da tela) — escolhida para não cobrir rostos nem selos. */
const Y_LEGENDA = [0.79, 0.74, 0.72, 0.76, 0.73, 0.73, 0.79, 0.73, 0.79, 0.73, 0.79];

export default function Video() {
  const f = useCurrentFrame();
  const T = useTempos();
  const inicios = IDS.map((id, i) => (i === 0 ? 0 : T.fala(id).ini - ANTES));
  let n = 0;
  for (let i = 0; i < inicios.length; i++) if (f >= inicios[i]) n = i;
  const Cena = CENAS[n];
  // transição: "soco" de zoom nos primeiros frames de cada cena
  const t = eout(ramp(f, inicios[n], inicios[n] + 7));
  const soco = n === 0 ? 1 : 1.06 - 0.06 * t;
  return (
    <AbsoluteFill style={{ backgroundColor: "#05070f", overflow: "hidden" }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <defs>
          <radialGradient id="brilhoTela"><stop offset="0" stopColor="#bcd4ff" stopOpacity="0.9" /><stop offset="1" stopColor="#bcd4ff" stopOpacity="0" /></radialGradient>
        </defs>
      </svg>
      <AbsoluteFill style={{ transform: `scale(${soco})` }}>
        <Cena inicio={inicios[n]} />
      </AbsoluteFill>
      {n > 0 && <Flash em={inicios[n]} dur={5} cor="#ffffff" forca={[0, 0.5, 0.6, 0.4, 0.3, 0.3, 0.4, 0.3, 0.2, 0.3, 0.2][n]} />}
      <Vinheta forca={0.42} />
      <Granulacao forca={0.035} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}><TarjaSimulacao f={f} /></svg>
      <Legendas estilo="impacto" y={Y_LEGENDA[n]} />
    </AbsoluteFill>
  );
}
