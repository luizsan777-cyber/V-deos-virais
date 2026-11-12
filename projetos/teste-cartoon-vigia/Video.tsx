// Compositor Remotion do teste do motor cartoon: quadros do kit cartoon-audio-short + legendas pt-BR.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useTempos } from "../../engine/src/kit/tempo";
import { QuadrosCartoon } from "../../engine/src/kit/QuadrosCartoon";
import { Legendas } from "../../engine/src/kit/Legendas";
import { TextoPop } from "../../engine/src/kit/efeitos";

export default function Video() {
  const T = useTempos();
  const f = useCurrentFrame();
  // legenda fora do rosto: no close da piscada vai para baixo; na tomada da multidão, sobre a ponte
  const yLegenda = f >= T.fala("final").ini ? 0.42 : f >= T.fala("pisca").ini ? 0.79 : 0.64;
  return (
    <AbsoluteFill>
      <QuadrosCartoon total={T.total} />
      <TextoPop texto="ZZZ…" em={T.palavra("piscou") + 4} ate={T.fala("final").ini} y={0.16} tamanho={130} cor="#ffffff" rot={-6} />
      <Legendas estilo="impacto" y={yLegenda} />
    </AbsoluteFill>
  );
}
