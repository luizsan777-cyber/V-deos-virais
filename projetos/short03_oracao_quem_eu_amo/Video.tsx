// short03_oracao_quem_eu_amo — short de 5 s: uma cena + legendas em blocos sincronizadas pelas palavras reais.
import React from "react";
import { AbsoluteFill } from "remotion";
import { useTempos } from "../../engine/src/kit/tempo";
import { LegendaBlocos, Bloco } from "../shorts_cristaos_kit/kit";
import { Cena01 } from "./cenas";

const BLOCOS: Bloco[] = [{ de: 0, texto: "JESUS, CUIDA..." }, { de: 2, texto: "DE QUEM EU AMO", amarelo: ["AMO"] }, { de: 6, texto: "MESMO QUANDO ESTÁ LONGE", icone: "coracaoBranco" }];

export default function Video() {
  const T = useTempos();
  return (
    <AbsoluteFill style={{ backgroundColor: "#f2c08a" }}>
      <Cena01 inicio={0} fim={T.total} />
      <LegendaBlocos blocos={BLOCOS} y={1500} />
    </AbsoluteFill>
  );
}
