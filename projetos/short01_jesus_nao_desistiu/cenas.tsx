// SHORT 01 — "Antes de desistir, escuta: Jesus não desistiu de você." (5 s, quarto à noite, cores vivas)
import React from "react";
import { AbsoluteFill } from "remotion";
import { Camera } from "../../engine/src/kit/Camera";
import { Personagem, Visual } from "../../engine/src/kit/Personagem";
import { parado, misturaPose, Pose } from "../../engine/src/kit/poses";
import { EXPRESSOES, misturaExpr } from "../../engine/src/kit/expressoes";
import { clamp01, eio, lerp, piscar, ramp, rnd, wobble } from "../../engine/src/kit/anim";
import { useCena } from "../../engine/src/kit/tempo";
import { JESUS, ESTILO_JESUS, estiloLuz, sentado, alcanca, Halo, mix, TINTA } from "../shorts_cristaos_kit/kit";

const PESSOA: Visual = { pele: "#e2b48c", cabelo: "curto", corCabelo: "#3a2618", roupa: "moletom", cor: "#4a6fa5", cor2: "#5d82b8", calca: "#3b4252", sapato: "#5a5f6e", corpo: "medio", corOlho: "#3a2a1c" };

const Quarto: React.FC<{ f: number; ouro: number }> = ({ f, ouro }) => (
  <g>
    <defs>
      <linearGradient id="s1par" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2a1f6e" /><stop offset="1" stopColor="#4a2a7a" /></linearGradient>
      <linearGradient id="s1ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0b1a4a" /><stop offset="1" stopColor="#2a3f8a" /></linearGradient>
      <linearGradient id="s1feixe" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffd27a" stopOpacity={0.75} /><stop offset="1" stopColor="#ffd27a" stopOpacity={0} /></linearGradient>
      <radialGradient id="s1aba" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#ffc56a" stopOpacity={0.7} /><stop offset="1" stopColor="#ffc56a" stopOpacity={0} /></radialGradient>
    </defs>
    <rect x={-500} y={-400} width={2100} height={1900} fill="url(#s1par)" />
    {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-500 + i * 170} y={-400} width={6} height={1900} fill="#fff" opacity={0.04} />)}
    {/* janela com chuva e brilho dourado de um poste lá fora */}
    <g transform="translate(60 330)">
      <rect x={0} y={0} width={460} height={600} fill="url(#s1ceu)" />
      <circle cx={360} cy={420} r={120} fill="#ffcf6b" opacity={0.35 + 0.15 * ouro} />
      <circle cx={360} cy={420} r={40} fill="#ffe7a8" opacity={0.9} />
      {[[0, 260, 90], [80, 200, 70], [150, 300, 90], [230, 230, 80], [300, 330, 60]].map(([x, h, w], i) => (
        <g key={i}><rect x={x} y={600 - h} width={w} height={h} fill="#141a40" />
          {Array.from({ length: Math.floor(h / 44) }, (_, k) => <rect key={k} x={x + 14 + (k % 2) * 30} y={600 - h + 18 + k * 44} width={14} height={18} fill="#ffd27a" opacity={rnd(`s1j${i}${k}`) > 0.4 ? 0.85 : 0.2} />)}
        </g>
      ))}
      {Array.from({ length: 30 }, (_, i) => {
        const x = rnd(`s1g${i}`) * 450, v = 4 + rnd(`s1v${i}`) * 4, y = ((rnd(`s1y${i}`) * 640 + f * v) % 680) - 40;
        return <g key={i}><line x1={x} y1={y} x2={x - 2} y2={y + 36} stroke="#cfe3ff" strokeWidth={3} opacity={0.6} strokeLinecap="round" /><circle cx={x - 2} cy={y + 38} r={4} fill="#e6f1ff" opacity={0.7} /></g>;
      })}
      <rect x={0} y={0} width={460} height={600} fill="none" stroke="#5a3a2a" strokeWidth={22} />
      <line x1={230} y1={0} x2={230} y2={600} stroke="#5a3a2a" strokeWidth={12} />
      <rect x={-30} y={596} width={520} height={34} rx={8} fill="#7a5236" stroke={TINTA} strokeWidth={6} />
      {/* planta pequena no peitoril */}
      <g transform="translate(70 596)">
        <path d="M -34,0 L 34,0 L 26,-50 L -26,-50 Z" transform="scale(1 -1)" fill="#e0703a" stroke={TINTA} strokeWidth={5} />
        {[-50, -20, 10, 40].map((a, k) => <path key={k} transform={`rotate(${a + wobble(f, k, 0.3) * 3})`} d="M 0,-48 C 10,-90 30,-110 40,-130 C 20,-118 4,-96 0,-48 Z" fill="#3fbf6a" stroke={TINTA} strokeWidth={4} />)}
      </g>
    </g>
    {/* feixe de luz dourada entrando pela janela (cresce com a presença de Jesus) */}
    <path d="M 120,930 L 520,930 L 1150,1750 L 300,1800 Z" fill="url(#s1feixe)" opacity={0.35 + 0.55 * ouro} />
    {/* chão */}
    <rect x={-500} y={1500} width={2100} height={600} fill="#3a2440" />
    {Array.from({ length: 8 }, (_, i) => <line key={i} x1={-500} y1={1530 + i * 50} x2={1600} y2={1530 + i * 50} stroke="#ffd27a" strokeWidth={3} opacity={0.08} />)}
    {/* criado-mudo com luminária acesa e reflexos quentes */}
    <g transform="translate(-60 1240)">
      <circle cx={100} cy={-150} r={300} fill="url(#s1aba)" />
      <rect x={0} y={0} width={210} height={280} rx={12} fill="#6a3f2a" stroke={TINTA} strokeWidth={8} />
      <rect x={14} y={14} width={182} height={8} rx={4} fill="#ffcf8a" opacity={0.6} />
      <rect x={92} y={-120} width={16} height={120} fill={TINTA} />
      <path d="M 40,-120 L 160,-120 L 132,-200 L 68,-200 Z" fill="#ffe0a0" stroke={TINTA} strokeWidth={7} />
    </g>
    {/* cama (fundo) */}
    <rect x={240} y={1350} width={60} height={330} rx={10} fill="#6a3f2a" stroke={TINTA} strokeWidth={8} />
    <rect x={260} y={1530} width={840} height={70} rx={30} fill="#5d5fb8" stroke={TINTA} strokeWidth={8} />
    <rect x={300} y={1470} width={200} height={80} rx={34} fill="#d9d6ff" stroke={TINTA} strokeWidth={7} />
  </g>
);
const CamaFrente: React.FC = () => (
  <g>
    <rect x={250} y={1640} width={860} height={260} rx={24} fill="#4a4aa0" stroke={TINTA} strokeWidth={8} />
    <rect x={250} y={1630} width={860} height={60} rx={26} fill="#6f72cc" stroke={TINTA} strokeWidth={8} />
    <rect x={250} y={1630} width={860} height={14} rx={7} fill="#ffd27a" opacity={0.25} />
  </g>
);

export const Cena01: React.FC<{ inicio: number; fim: number }> = ({ inicio, fim }) => {
  const { lf } = useCena(inicio);
  const dur = fim - inicio;
  // pessoa sentada; Jesus se aproxima (35–70) e põe a mão no ombro (55–85)
  const px = 560, py = 1720, esc = 1.05;
  const jx = lerp(1060, 745, eio(ramp(lf, 28, 66))), jy = 1660, jesc = 1.0; // um pouco atrás, ao lado da cama
  const ombro: [number, number] = [px + 66 * esc, py - 296 * esc];
  const mao = eio(ramp(lf, 52, 82));
  const baseJ: Pose = { ...parado(lf, 4), olhar: [-0.6, 0.5], cabecaIncl: 6 };
  const jPose = misturaPose(baseJ, alcanca(jx, jy, jesc, baseJ, ombro, -1), mao);
  // mão de Jesus desenhada por cima do ombro (o braço passa por trás da pessoa)
  const mx = lerp(ombro[0] + 40, ombro[0], mao), my = ombro[1] - 4;
  const ouro = eio(ramp(lf, 50, 115));
  const levanta = eio(ramp(lf, 70, 100));
  const pPose: Pose = sentado(lf, 2, { cabecaIncl: lerp(16, 2, levanta), tronco: lerp(6, 0, levanta), olhar: [lerp(0, 0.5, levanta), lerp(0.9, -0.1, levanta)], virar: lerp(0, 0.25, levanta), bracoE: [30, 100], bracoD: [30, 100], frenteE: true, frenteD: true });
  const cansado = { ...misturaExpr(EXPRESSOES.triste, EXPRESSOES.pensativo, 0.3), palpebra: 0.5 };
  const calmo = { ...EXPRESSOES.sereno, palpebra: 0.25 };
  const expr = misturaExpr(cansado, calmo, eio(ramp(lf, 95, 125)));
  return (
    <AbsoluteFill style={{ backgroundColor: "#2a1f6e" }}>
      <Camera inicio={inicio} chaves={[[0, 590, 1300, 1.95], [40, 600, 1290, 2.05], [75, 670, 1270, 1.55], [dur, 680, 1260, 1.62]]} deriva={0}>
        <Quarto f={lf} ouro={ouro} />
        <Halo x={jx} y={1180} id="s1" op={clamp01(ramp(lf, 20, 60))} />
        <Personagem id="s1-j" x={jx} y={jy} escala={jesc} dir={-1} visual={JESUS} estilo={ESTILO_JESUS} pose={jPose} expr={EXPRESSOES.sereno} olhosAbertos={piscar(lf, 9)} />
        <Personagem id="s1-p" x={px} y={py} escala={esc} visual={PESSOA} estilo={estiloLuz(ouro)} pose={pPose} expr={expr} olhosAbertos={piscar(lf, 3)} />
        <CamaFrente />
        <g opacity={clamp01(mao * 1.6 - 0.3)} transform={`translate(${mx} ${my}) rotate(-8)`}>
          <ellipse cx={0} cy={0} rx={30} ry={22} fill={JESUS.pele} stroke={TINTA} strokeWidth={6} />
          <path d="M -22,8 q 10,14 22,10 M -8,14 q 10,10 20,4" fill="none" stroke={TINTA} strokeWidth={4} strokeLinecap="round" />
        </g>
      </Camera>
      {/* brilho dourado suave que cresce, sem explosão de luz */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 65% 45%, rgba(255,214,140,0.28), rgba(255,214,140,0) 60%)", opacity: ouro }} />
    </AbsoluteFill>
  );
};
