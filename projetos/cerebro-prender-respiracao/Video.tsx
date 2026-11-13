// EP. 02 — O que acontece no seu cérebro quando você prende a respiração? (2D, Remotion + overlays HyperFrames)
// Cada bloco narrado (id no projeto.json) é uma cena de cenas.tsx. Medidor (cena 6) e gráficos (cena 9) vêm do
// HyperFrames como sequência PNG transparente em engine/public/hf/<nome>/ (ver hf/ e DIRECAO.md).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useTempos } from "../../engine/src/kit/tempo";
import { Legendas } from "../../engine/src/kit/Legendas";
import { Vinheta, Flash } from "../../engine/src/kit/efeitos";
import { Cena01, Cena02, Cena03, Cena04, Cena05, Cena06, Cena07, Cena08, Cena09, Cena10 } from "./cenas";
import { OverlayHF } from "./elenco";

const W = 1080, H = 1920;
const ORDEM = ["gancho", "gas", "co2", "alerta", "tronco", "vontade", "diafragma", "perigo", "revelacao", "final"];
const CENAS: Record<string, React.FC<{ inicio: number; fim: number }>> = {
  gancho: Cena01, gas: Cena02, co2: Cena03, alerta: Cena04, tronco: Cena05, vontade: Cena06, diafragma: Cena07, perigo: Cena08, revelacao: Cena09, final: Cena10,
};
// altura da legenda por cena (fração da tela) — fora dos rótulos e dos painéis
const YLEG: Record<string, number> = { gancho: 0.66, gas: 0.64, co2: 0.7, alerta: 0.74, tronco: 0.48, vontade: 0.64, diafragma: 0.75, perigo: 0.7, revelacao: 0.72, final: 0.66 };

export default function Video() {
  const f = useCurrentFrame();
  const T = useTempos();
  const ini = (id: string) => (id === "gancho" ? 0 : T.fala(id).ini - 6);
  const cenas = ORDEM.map((id, i) => ({ id, inicio: ini(id), fim: i < ORDEM.length - 1 ? ini(ORDEM[i + 1]) : T.total }));
  const c = cenas.find((x) => f >= x.inicio && f < x.fim) ?? cenas[cenas.length - 1];
  const Cena = CENAS[c.id];
  const vontade = cenas[5], revel = cenas[8];
  return (
    <AbsoluteFill style={{ backgroundColor: "#16112a" }}>
      <Cena inicio={c.inicio} fim={c.fim} />
      {c.id === "vontade" && <OverlayHF nome="cerebro-medidor" inicio={vontade.inicio} quadros={vontade.fim - vontade.inicio} />}
      {c.id === "revelacao" && <OverlayHF nome="cerebro-graficos" inicio={revel.inicio} quadros={revel.fim - revel.inicio} />}
      {c.id !== "gancho" && <Flash em={c.inicio} dur={4} cor="#ffffff" forca={0.18} />}
      <Vinheta forca={0.35} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <g transform="translate(40 150)" opacity={0.9}>
          <rect width={430} height={54} rx={27} fill="#1a1424" stroke="#5fc8ff" strokeWidth={3} />
          <text x={215} y={37} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={27} fill="#e9f6ff">CIÊNCIA • ANIMAÇÃO 2D</text>
        </g>
      </svg>
      <Legendas estilo="impacto" y={YLEG[c.id]} />
    </AbsoluteFill>
  );
}
