// short02_chamaria_pelo_nome — short de 5 s: uma cena + legendas em blocos sincronizadas pelas palavras reais.
import React from "react";
import { AbsoluteFill } from "remotion";
import { useTempos } from "../../engine/src/kit/tempo";
import { LegendaBlocos, Bloco } from "../shorts_cristaos_kit/kit";
import { Cena01 } from "./cenas";

const BLOCOS: Bloco[] = [{ de: 0, texto: "MESMO DEPOIS DE TUDO..." }, { de: 4, texto: "JESUS AINDA TE CHAMARIA" }, { de: 8, texto: "PELO NOME", amarelo: ["NOME"], icone: "brilho" }];

export default function Video() {
  const T = useTempos();
  return (
    <AbsoluteFill style={{ backgroundColor: "#ff9a6a" }}>
      <Cena01 inicio={0} fim={T.total} />
      <LegendaBlocos blocos={BLOCOS} y={1500} />
    </AbsoluteFill>
  );
}
