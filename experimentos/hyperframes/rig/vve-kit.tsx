// Bundle de navegador do kit de personagens da Viral Video Engine para uso no HyperFrames (nível "hosted").
// NÃO converte o rig: reaproveita engine/src/kit/Personagem.tsx, poses.ts, expressoes.ts e anim.ts como estão,
// e devolve o SVG do personagem para um instante t (o HyperFrames controla o relógio via evento hf-seek).
import React from "react";
import { renderToStaticMarkup } from "react-dom/server.browser";
import { Personagem, ESTILOS_PERSONAGEM } from "../../../engine/src/kit/Personagem";
import * as poses from "../../../engine/src/kit/poses";
import * as expressoes from "../../../engine/src/kit/expressoes";
import * as anim from "../../../engine/src/kit/anim";

type Props = React.ComponentProps<typeof Personagem>;

/** SVG (markup) de um ou mais personagens num <svg> do tamanho do quadro. */
const svgPersonagens = (lista: Props[], largura = 1080, altura = 1920) =>
  renderToStaticMarkup(
    <svg xmlns="http://www.w3.org/2000/svg" width={largura} height={altura} viewBox={`0 0 ${largura} ${altura}`}>
      {lista.map((p) => <Personagem key={p.id} {...p} />)}
    </svg>,
  );

/** Celular pequeno para a mão do personagem (prop itemD), tela acesa com um alerta vermelho opcional. */
const celularMao = (alerta = false, rot = -8) => (
  <g transform={`translate(4 -30) rotate(${rot}) scale(0.24)`}>
    <rect x={-172} y={-330} width={344} height={660} rx={48} fill="#1b1d29" stroke="#10121f" strokeWidth={8} />
    <rect x={-150} y={-300} width={300} height={600} rx={30} fill={alerta ? "#2a3a6e" : "#4a6fd1"} />
    {alerta && <rect x={-130} y={-200} width={260} height={110} rx={18} fill="#f4f6fb" />}
    {alerta && <rect x={-115} y={-185} width={40} height={40} rx={10} fill="#ff3b3b" />}
  </g>
);

(window as unknown as { VVE: unknown }).VVE = { svgPersonagens, celularMao, ESTILOS_PERSONAGEM, poses, expressoes, anim, FPS: 30 };
