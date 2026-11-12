// Teste 3D: "E se a Terra parasse de girar?"
// Cena 1: Terra no espaço girando rápido, para de repente (tremor). Cena 2: vilarejo 3D estilizado,
// personagem 2D (projetado no mundo 3D) é arrastado para o leste junto com objetos soltos.
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { useTempos } from "../../engine/src/kit/tempo";
import { Palco3D, LuzesEstilizadas, ChaveCam3D, projetar } from "../../engine/src/kit/tres/Palco3D";
import { Planeta, Estrelas, Sol, Terreno, Ceu, Arvore, Casa, ComContorno } from "../../engine/src/kit/tres/objetos";
import { Personagem, ESTILOS_PERSONAGEM, Visual } from "../../engine/src/kit/Personagem";
import { comMedo, correndo, poseEm, parado, surpreso } from "../../engine/src/kit/poses";
import { exprEm } from "../../engine/src/kit/expressoes";
import { Legendas } from "../../engine/src/kit/Legendas";
import { Flash, TextoPop, Vinheta } from "../../engine/src/kit/efeitos";
import { eout, ein, piscar, ramp } from "../../engine/src/kit/anim";

const BIA: Visual = { pele: "#f1c7a3", cabelo: "rabo", corCabelo: "#6b3a1e", roupa: "camiseta", cor: "#2fb39b", calca: "#3b4a8c", sapato: "#ff6b5b", corpo: "medio" };

const Espaco: React.FC<{ para: number }> = ({ para }) => {
  const f = useCurrentFrame();
  // ângulo acumulado: gira rápido e trava em "parasse" (com pequeno tranco)
  const vel = 0.035;
  const ang = f < para ? f * vel : para * vel + 0.08 * eout(ramp(f, para, para + 6));
  const chaves: ChaveCam3D[] = [[0, [0, 2, 18], [0, 0, 0], 38], [para, [3, 1.2, 13.5], [0, 0, 0], 38], [para + 40, [3.4, 1.0, 12.6], [0, 0, 0], 36]];
  return (
    <Palco3D chaves={chaves} fundo="#03040c" tremores={[para]} mao={0.3}>
      <ambientLight intensity={0.15} />
      <directionalLight position={[20, 6, 12]} intensity={3.2} color="#fff4e0" />
      <Estrelas />
      <Sol position={[60, 14, -90]} raio={5} />
      <Planeta raio={3.2} giro={ang} />
      <Planeta raio={0.8} tipo="lua" position={[-7, 2.5, -6]} nuvens={false} atmosfera="" giro={f * 0.002} />
    </Palco3D>
  );
};

const Vilarejo: React.FC<{ voando: number; ini: number }> = ({ voando, ini }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const v = voando - ini; // frame local
  const chaves: ChaveCam3D[] = [[0, [-6, 2.2, 9], [0, 1.2, 0], 42], [v, [-1.5, 1.6, 7.5], [0.5, 1.3, 0], 40], [v + 60, [4, 2.4, 8], [4, 1.5, 0], 44]];
  const voo = ein(ramp(f, v, v + 40)); // empurrão para o leste (+x)
  const vento = ramp(f, v - 4, v + 10);
  // personagem: fica no chão, se assusta, e é arrastada
  const pos3 = projetar(f, chaves, [0.6 + voo * 9, 0 + voo * 1.8, 1.2], width, height);
  const pose = poseEm(f, [[0, (x) => parado(x, 4)], [v - 30, (x) => surpreso(x, 4)], [v, (x) => comMedo(x, 4)], [v + 8, (x) => ({ ...correndo(x, 4), tronco: -18, bracoE: [150, 30], bracoD: [140, 20] })]], 6);
  const expr = exprEm(f, [[0, "neutro"], [v - 30, "surpreso"], [v, "horrorizado"]]);
  const T = useTempos();
  return (
    <AbsoluteFill>
      <Palco3D chaves={chaves} fundo="#8fd3ff" neblina={["#d6f0ff", 20, 70]} tremores={[v]} mao={0.8}>
        <LuzesEstilizadas sol={[8, 12, 6]} />
        <Ceu />
        <Terreno tamanho={90} />
        {[[-4, -3], [3, -5], [-8, -8], [7, -2], [10, -9], [-12, -2]].map(([x, z], i) => (
          <group key={i} rotation={[0, 0, -vento * 0.25 * (i % 2 ? 1 : 0.7)]} position={[x, 0, z]}>
            <Arvore position={[0, 0, 0]} seed={i} escala={1.1 + (i % 3) * 0.2} cor={["#3f9a52", "#4caf50", "#2e7d4f"][i % 3]} />
          </group>
        ))}
        <Casa position={[-2.5, 0, -2]} rot={0.3} />
        <Casa position={[2.8, 0, -3]} rot={-0.4} cor="#cfe3ff" telhado="#3d6fc8" />
        <Casa position={[6.5, 0, -6]} rot={-0.2} cor="#ffe0b0" telhado="#8e4ec6" />
        {/* objetos soltos voando para o leste */}
        {[0, 1, 2, 3, 4].map((i) => {
          const t = ein(ramp(f, v + i * 3, v + 30 + i * 3));
          return (
            <ComContorno key={i} geo={i % 2 ? <boxGeometry args={[0.4, 0.4, 0.4]} /> : <dodecahedronGeometry args={[0.28, 0]} />}
              cor={["#ff6b5b", "#ffd166", "#06d6a0", "#118ab2", "#ef476f"][i]} position={[-3 + i * 1.2 + t * 14, 0.25 + t * (2 + i * 0.6), 1.5 - i * 0.8]} rotation={[t * 8, t * 6 + i, 0]} />
          );
        })}
      </Palco3D>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <Personagem id="bia" x={pos3.x} y={pos3.y} escala={pos3.escala * 0.8} visual={BIA} estilo={ESTILOS_PERSONAGEM.flat}
          pose={pose} expr={expr} olhosAbertos={piscar(f, 7)} boca={0} />
      </svg>
      <TextoPop texto="1.670 KM/H" em={T.palavra("1.670") - ini} y={0.2} tamanho={150} />
    </AbsoluteFill>
  );
};

export default function Video() {
  const T = useTempos();
  const corte = T.fala("efeito").ini - 4;
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={corte}>
        <Espaco para={T.palavra("parasse")} />
      </Sequence>
      <Sequence from={corte}>
        <Vilarejo voando={T.palavra("voando")} ini={corte} />
      </Sequence>
      <Flash em={corte} dur={7} forca={0.7} />
      <Vinheta forca={0.35} />
      <Legendas estilo="moderno" />
    </AbsoluteFill>
  );
}
