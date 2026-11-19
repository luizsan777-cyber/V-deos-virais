// fe_estoy_bien_es — Short es-419 (60–70 s). Cenas no Remotion; nomes das cidades, referência e legendas vêm do
// HyperFrames (overlay transparente composto por cima no ffmpeg). Cortes ancorados nas palavras reais da voz.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { clamp01 } from "../../engine/src/kit/anim";
import { carregarFontes } from "../../engine/src/kit/fontes";
import { useTempos } from "../../engine/src/kit/tempo";
import { A1Celular, A2Reflexo, BBogota, CLima, CloseMesa, DTres, ECasa, FLimaNoite, GFinal } from "./cenas";

const DISS = 7; // dissolvência entre cenas (sem preto)

export default function Video() {
  carregarFontes();
  const f = useCurrentFrame();
  const T = useTempos();
  const fa = (id: string) => T.fala(id);
  const pal = T.palavra;
  const cortes = {
    a2: pal("pregunte") - 6,
    b: fa("f03").ini - 10,
    c: fa("f04").ini - 10,
    d: fa("f05").ini - 8,
    e: fa("f06").ini - 14,
    fS: fa("f10").ini - 10,
    fC: fa("f13").ini - 8,
    g: fa("f14").ini - 6,
    fim: T.total,
  };
  const cenas: [number, number, (ini: number, fim: number) => React.ReactNode][] = [
    [0, cortes.a2, (i, e) => <A1Celular inicio={i} fim={e} apagaEm={pal("para") - i} />],
    [cortes.a2, cortes.b, (i, e) => <A2Reflexo inicio={i} fim={e} deusEm={fa("f02").ini - i} />],
    [cortes.b, cortes.c, (i, e) => <BBogota inicio={i} fim={e} />],
    [cortes.c, cortes.d, (i, e) => <CLima inicio={i} fim={e} closeEm={pal("escribiendo") - 4 - i} />],
    [cortes.d, cortes.e, (i, e) => <DTres inicio={i} fim={e} tuEm={pal("ciudad") - i} />],
    [cortes.e, cortes.fS, (i, e) => <ECasa inicio={i} fim={e} senta={fa("f06").ini + 30 - i} ora={fa("f07").fim - 6 - i} olhosFecha={fa("f08").ini - 4 - i} olhosAbre={fa("f09").ini + 30 - i} />],
    [cortes.fS, cortes.fC, (i, e) => <FLimaNoite inicio={i} fim={e} descansa={fa("f12").ini - i} />],
    [cortes.fC, cortes.g, (i, e) => <CloseMesa inicio={i} fim={e} modo="envio" noite={1} apagaEm={pal("escribe") + 4 - i} escreveEm={pal("tienes", 2) - 8 - i} enviaEm={fa("f13").fim + 2 - i} />],
    [cortes.g, cortes.fim, (i, e) => <GFinal inicio={i} fim={e} oraEm={fa("f15").ini - 8 - i} />],
  ];
  return (
    <AbsoluteFill style={{ backgroundColor: "#0c1022" }}>
      {cenas.map(([ini, fim, R], k) => {
        if (f < ini || f >= fim + DISS) return null;
        const op = k === 0 ? 1 : clamp01((f - ini + 1) / DISS);
        return <AbsoluteFill key={k} style={{ opacity: op }}>{R(ini, fim + DISS)}</AbsoluteFill>;
      })}
    </AbsoluteFill>
  );
}
