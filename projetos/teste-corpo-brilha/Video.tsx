// Vídeo-teste (8 s): "Seu corpo brilha no escuro".
// Modo 2D, estilo "noite-conto". Toda a animação é sincronizada com a narração via useTempos().
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useTempos } from "../../engine/src/kit/tempo";
import { Camera } from "../../engine/src/kit/Camera";
import { Personagem, ESTILOS_PERSONAGEM, Visual } from "../../engine/src/kit/Personagem";
import { poseEm, parado, olhandoMao, bracosAoAlto, encolhendoOmbros, falando, Pose } from "../../engine/src/kit/poses";
import { exprEm } from "../../engine/src/kit/expressoes";
import { QuartoNoturno } from "../../engine/src/kit/cenarios2d";
import { Particulas, Vinheta, Granulacao, TextoPop, Flash } from "../../engine/src/kit/efeitos";
import { Legendas } from "../../engine/src/kit/Legendas";
import { chaves, eio, eout, piscar, ramp, wobble } from "../../engine/src/kit/anim";

const LEO: Visual = {
  pele: "#c98e62", cabelo: "cacheado", corCabelo: "#2b1a12", roupa: "moletom", cor: "#e9573f", cor2: "#ffd2c4",
  calca: "#2d3b66", sapato: "#f2f2f2", corOlho: "#4a2c1a", corpo: "medio",
};

/** Vaga-lume tímido: asas batendo, luz piscando, bochechas coradas. */
const VagaLume: React.FC<{ x: number; y: number; f: number; luz: number; escala?: number; timido: number }> = ({ x, y, f, luz, escala = 1, timido }) => {
  const asa = Math.sin(f * 1.9) * 28;
  return (
    <g transform={`translate(${x} ${y}) scale(${escala}) rotate(${wobble(f, 4, 1) * 8})`}>
      <circle cx={-34} cy={22} r={70} fill="#d7ff7a" opacity={0.25 * luz} />
      <circle cx={-34} cy={22} r={30} fill="#eaff9e" opacity={0.6 * luz} />
      <g transform={`rotate(${-20 + asa})`}><ellipse cx={-6} cy={-34} rx={16} ry={30} fill="#e8f4ff" opacity={0.75} stroke="#1a1a2a" strokeWidth={3} /></g>
      <g transform={`rotate(${20 - asa})`}><ellipse cx={14} cy={-34} rx={16} ry={30} fill="#e8f4ff" opacity={0.75} stroke="#1a1a2a" strokeWidth={3} /></g>
      <ellipse cx={-30} cy={20} rx={22} ry={18} fill={luz > 0.3 ? "#f4ff9a" : "#b7b98a"} stroke="#1a1a2a" strokeWidth={4} />
      <ellipse cx={0} cy={6} rx={28} ry={22} fill="#3b3550" stroke="#1a1a2a" strokeWidth={4} />
      <circle cx={26} cy={-8} r={22} fill="#4a4363" stroke="#1a1a2a" strokeWidth={4} />
      <path d="M 22,-28 q -6,-22 -18,-26 M 34,-26 q 4,-22 14,-26" stroke="#1a1a2a" strokeWidth={3} fill="none" />
      <circle cx={32} cy={-10} r={6} fill="#fff" />
      <circle cx={33 + timido * 2} cy={-8 + timido * 3} r={3.4} fill="#111" />
      <ellipse cx={38} cy={2} rx={7} ry={4} fill="#ff7d8c" opacity={0.3 + timido * 0.6} />
      <path d={`M 30,6 q 6,${3 - timido * 2} 12,0`} stroke="#111" strokeWidth={2.5} fill="none" />
    </g>
  );
};

export default function Video() {
  const f = useCurrentFrame();
  const T = useTempos();
  const brilha = T.palavra("brilha");
  const serio = T.palavra("sério");
  const mil = T.palavra("mil");
  const fraca = T.palavra("fraca");
  const olho = T.palavra("olho");
  const tipo = T.fala("fecho").ini;
  const timido = T.palavra("tímido");
  const clique = T.sfx("clique");

  // luz do quarto: abajur apaga no clique
  const abajur = 1 - ramp(f, clique, clique + 3);
  const luz = 1 - 0.55 * eio(ramp(f, clique, clique + 8));
  // brilho do corpo: acende em "brilha", fica forte em "Sério!", some em "fraca"
  const aura = chaves(f, [[brilha - 4, 0], [brilha + 10, 0.75], [serio + 4, 1], [mil, 0.85], [fraca + 6, 0.12], [timido, 0.18]]);

  const pose: Pose = poseEm(f, [
    [0, (x) => falando(x, 2, 0.5)],
    [brilha - 6, (x) => olhandoMao(x, 2)],
    [serio - 4, (x) => bracosAoAlto(x, 2)],
    [mil - 10, (x) => falando(x, 3, 0.9)],
    [fraca, (x) => encolhendoOmbros(x, 2)],
    [tipo, (x) => ({ ...parado(x, 5), olhar: [0.9, -0.8], cabecaIncl: 8, virar: 0.35 })],
  ], 7);
  const expr = exprEm(f, [[0, "neutro"], [brilha - 2, "maravilhado"], [serio - 2, "empolgado"], [mil - 4, "desconfiado"], [fraca + 4, "triste"], [tipo + 6, "feliz"]], 5);

  // vaga-lume entra voando em "Tipo"
  const vf = eout(ramp(f, tipo - 6, tipo + 22));
  const vx = 1180 - 420 * vf + Math.sin(f * 0.13) * 14;
  const vy = 560 + 90 * Math.sin(vf * Math.PI) + Math.cos(f * 0.1) * 10;
  const vagaLuz = timido <= f ? 0.35 + 0.25 * Math.sin(f * 0.5) : 0.9;

  return (
    <AbsoluteFill>
      <Camera
        chaves={[
          [0, 540, 1150, 1.25],
          [brilha + 6, 580, 1060, 1.55],
          [serio - 1, 580, 1050, 1.58],
          [serio + 5, 540, 960, 1.95],
          [mil - 6, 540, 990, 1.8],
          [fraca + 8, 540, 1060, 1.55],
          [tipo + 10, 650, 900, 1.7],
          [T.total, 660, 890, 1.8],
        ]}
        tremores={[serio]}
        forcaTremor={14}
        deriva={0.8}
      >
        <QuartoNoturno luz={luz} abajur={abajur} />
        <Personagem
          id="leo" x={540} y={1500} escala={1.2} visual={LEO} estilo={ESTILOS_PERSONAGEM.noite}
          pose={pose} expr={expr} olhosAbertos={piscar(f, 3)} boca={T.falando(f) ? T.boca(f) : 0} brilhoCorpo={aura}
        />
        <g opacity={aura}>
          <Particulas tipo="brilhos" n={34} area={[300, 700, 480, 800]} seed={4} />
        </g>
        {f >= tipo - 8 && <VagaLume x={vx} y={vy} f={f} luz={vagaLuz} escala={1.25} timido={eio(ramp(f, timido, timido + 8))} />}
      </Camera>
      <TextoPop texto="1000×" em={mil} ate={fraca + 22} y={0.1} tamanho={190} />
      <TextoPop texto="MAIS FRACA" em={fraca} ate={olho + 18} y={0.18} tamanho={100} cor="#ffffff" rot={3} />
      <Flash em={serio} dur={6} cor="#bff7ff" forca={0.35} />
      <Vinheta forca={0.6} cor="5,5,25" />
      <Granulacao forca={0.05} />
      <Legendas estilo="impacto" />
    </AbsoluteFill>
  );
}
