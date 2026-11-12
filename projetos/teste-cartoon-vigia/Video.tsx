// Compositor Remotion do teste do motor cartoon: quadros do kit cartoon-audio-short + legendas pt-BR.
import React from "react";
import { AbsoluteFill } from "remotion";
import { useTempos } from "../../engine/src/kit/tempo";
import { QuadrosCartoon } from "../../engine/src/kit/QuadrosCartoon";
import { Legendas } from "../../engine/src/kit/Legendas";
import { TextoPop } from "../../engine/src/kit/efeitos";

export default function Video() {
  const T = useTempos();
  return (
    <AbsoluteFill>
      <QuadrosCartoon total={T.total} />
      <TextoPop texto="ZZZ…" em={T.palavra("piscou") + 4} ate={T.fala("final").ini} y={0.16} tamanho={130} cor="#ffffff" rot={-6} />
      <Legendas estilo="impacto" />
    </AbsoluteFill>
  );
}
