// short01_jesus_nao_desistiu — short de 5 s: uma cena + legendas em blocos sincronizadas pelas palavras reais.
import React from "react";
import { AbsoluteFill } from "remotion";
import { useTempos } from "../../engine/src/kit/tempo";
import { LegendaBlocos, Bloco } from "../shorts_cristaos_kit/kit";
import { Cena01 } from "./cenas";

const BLOCOS: Bloco[] = [{ de: 0, texto: "ANTES DE DESISTIR," }, { de: 3, texto: "ESCUTA:" }, { de: 4, texto: "JESUS NÃO DESISTIU", amarelo: ["JESUS"] }, { de: 7, texto: "DE VOCÊ", amarelo: ["VOCÊ"], icone: "coracao" }];

export default function Video() {
  const T = useTempos();
  return (
    <AbsoluteFill style={{ backgroundColor: "#2a1f6e" }}>
      <Cena01 inicio={0} fim={T.total} />
      <LegendaBlocos blocos={BLOCOS} y={1500} />
    </AbsoluteFill>
  );
}
