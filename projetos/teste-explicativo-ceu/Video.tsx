// Teste do MODO EXPLICATIVO: "Por que o céu é azul?" — quadro-negro, luz branca do Sol se abre em cores,
// moléculas do ar espalham o azul para todo lado, gráfico azul x vermelho, apresentadora apontando.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useTempos } from "../../engine/src/kit/tempo";
import { Camera } from "../../engine/src/kit/Camera";
import { FundoExplicativo, Seta, Rotulo, Barras } from "../../engine/src/kit/diagramas";
import { Personagem, ESTILOS_PERSONAGEM, Visual } from "../../engine/src/kit/Personagem";
import { apontando, falando, poseEm, surpreso } from "../../engine/src/kit/poses";
import { exprEm } from "../../engine/src/kit/expressoes";
import { Legendas } from "../../engine/src/kit/Legendas";
import { TextoPop } from "../../engine/src/kit/efeitos";
import { eback, eout, piscar, ramp, rnd } from "../../engine/src/kit/anim";

const PROF: Visual = { pele: "#8d5a3b", cabelo: "coque", corCabelo: "#1d1210", roupa: "jaleco", cor: "#7b5cff", cor2: "#ffcf3f", calca: "#2b2d42", sapato: "#3a2a20", corpo: "medio", oculos: true };
const CORES = ["#ff4d4d", "#ff9f1c", "#ffe14d", "#4ddf6a", "#3fa9ff", "#8a5cff"];

export default function Video() {
  const f = useCurrentFrame();
  const T = useTempos();
  const sol = T.fala("sol").ini;
  const cores = T.palavra("cores");
  const espalha = T.palavra("espalha");
  const seis = T.palavra("seis");

  // feixe de luz do Sol até a atmosfera (desenha-se) e se abre em cores
  const feixe = eout(ramp(f, sol, sol + 20));
  const abre = eout(ramp(f, cores - 4, cores + 10));
  const [sx, sy] = [230, 360], [ax, ay] = [620, 1020];

  return (
    <AbsoluteFill>
      <Camera
        chaves={[[0, 540, 820, 1.35], [sol - 2, 360, 620, 1.45], [cores + 8, 450, 760, 1.2], [espalha - 4, 620, 1000, 1.5], [seis - 6, 540, 1000, 1.0], [T.total, 540, 990, 1.02]]}
        deriva={0.7}
      >
        <FundoExplicativo tipo="quadro" />
        {/* pergunta escrita a giz */}
        <g opacity={1 - ramp(f, sol, sol + 10)} transform={`translate(540 760) scale(${0.6 + 0.4 * eback(ramp(f, 0, 10))})`}>
          <text textAnchor="middle" fontFamily="Anton" fontSize={300} fill="#f4f1e8" opacity={0.92}>?</text>
          <circle cx={0} cy={-100} r={190} fill="none" stroke="#3fa9ff" strokeWidth={14} strokeDasharray="30 20" transform={`rotate(${f * 2})`} />
        </g>
        {/* Sol */}
        <g transform={`translate(${sx} ${sy}) scale(${eback(ramp(f, sol - 6, sol + 8))})`}>
          {Array.from({ length: 12 }, (_, i) => (
            <line key={i} x1={0} y1={-120} x2={0} y2={-165} stroke="#ffd60a" strokeWidth={14} strokeLinecap="round" transform={`rotate(${i * 30 + f * 0.8})`} />
          ))}
          <circle r={100} fill="#ffd60a" stroke="#14121c" strokeWidth={8} />
          <path d="M -40,10 q 40,40 80,0" stroke="#14121c" strokeWidth={8} fill="none" strokeLinecap="round" />
          <circle cx={-32} cy={-22} r={10} fill="#14121c" /><circle cx={32} cy={-22} r={10} fill="#14121c" />
        </g>
        {/* feixe branco que vira arco-íris */}
        {feixe > 0 && CORES.map((c, i) => {
          const off = (i - 2.5) * 14 * abre;
          const x2 = sx + (ax - sx) * feixe, y2 = sy + (ay - sy) * feixe;
          return <line key={i} x1={sx + 60} y1={sy + 60 + off} x2={x2 + off} y2={y2} stroke={abre > 0.05 ? c : "#ffffff"} strokeWidth={abre > 0.05 ? 13 : 40} strokeLinecap="round" opacity={0.95} />;
        })}
        <Rotulo x={250} y={600} texto="LUZ BRANCA" em={sol + 8} ate={cores - 2} />
        <Rotulo x={260} y={620} texto="TODAS AS CORES" em={cores} ate={espalha - 4} fundo="#ffe14d" />
        {/* atmosfera: moléculas do ar */}
        <path d="M -200,940 C 200,900 800,900 1300,940" stroke="#3fa9ff" strokeWidth={6} strokeDasharray="20 16" fill="none" opacity={ramp(f, sol + 10, sol + 25)} />
        {Array.from({ length: 16 }, (_, i) => {
          const mx = 120 + rnd(`mx${i}`) * 860, my = 980 + rnd(`my${i}`) * 220;
          const s = eback(ramp(f, sol + 14 + i, sol + 24 + i));
          return (
            <g key={i} transform={`translate(${mx + Math.sin(f * 0.07 + i) * 6} ${my + Math.cos(f * 0.06 + i) * 6}) scale(${s})`}>
              <circle r={20} fill="#cfe9ff" stroke="#14121c" strokeWidth={5} />
              <circle cx={24} r={16} fill="#cfe9ff" stroke="#14121c" strokeWidth={5} />
            </g>
          );
        })}
        {/* espalhamento: azul vai para todo lado, vermelho segue reto */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const a = (i / 8) * Math.PI * 2 + 0.3;
          return <Seta key={i} de={[ax, ay + 40]} ate={[ax + Math.cos(a) * 300, ay + 40 + Math.sin(a) * 260]} em={espalha + i * 2} dur={12} cor="#3fa9ff" largura={10} />;
        })}
        <Seta de={[ax, ay + 40]} ate={[ax + 330, ay + 520]} em={espalha + 18} dur={16} cor="#ff4d4d" largura={10} curva={0.05} />
        <Rotulo x={680} y={860} texto="vermelho: segue reto" em={espalha + 26} ate={seis + 60} fundo="#ffd6d6" tamanho={40} />
        {/* gráfico */}
        <Barras x={90} y={1610} dados={[{ rotulo: "AZUL", valor: 5.9, cor: "#3fa9ff" }, { rotulo: "VERMELHO", valor: 1, cor: "#ff4d4d" }]} em={seis - 2} largura={460} altura={330} />
        {/* apresentadora */}
        <Personagem
          id="prof" x={900} y={1880} escala={0.82} dir={-1} visual={PROF} estilo={ESTILOS_PERSONAGEM.flat}
          pose={poseEm(f, [[0, (x) => falando(x, 3, 0.8)], [sol + 4, (x) => apontando(x, 128, 3)], [espalha, (x) => apontando(x, 105, 3)], [seis, (x) => surpreso(x, 3)]], 7)}
          expr={exprEm(f, [[0, "empolgado"], [sol + 4, "feliz"], [seis - 2, "maravilhado"]])}
          olhosAbertos={piscar(f, 9)} boca={T.falando(f) ? T.boca(f) : 0}
        />
      </Camera>
      <TextoPop texto="≈ 6×" em={seis} y={0.13} tamanho={200} cor="#3fa9ff" />
      <Legendas estilo="moderno" />
    </AbsoluteFill>
  );
}
