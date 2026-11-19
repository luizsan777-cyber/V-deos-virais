// teste-herois-batman — amostra técnica da skill herois-2d (4 s, sem narração).
// Poses e câmera vêm direto de plano.json (scripts/plano.py --id dc/batman --segundos 4 --fps 30).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Camera, ChaveCam } from "../../engine/src/kit/Camera";
import { Pose } from "../../engine/src/kit/poses";
import { clamp01, ramp, rnd } from "../../engine/src/kit/anim";
import { Heroi, poseDoPlano } from "../herois_2d_kit/Heroi";
import plano from "./plano.json";

export const CAMERA_FIXA = false; // true só para conferir movimento do corpo sem câmera
const X = 520, Y = 1680, ESC = 1.4;

const Gotham: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <defs>
      <linearGradient id="hb-ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#070b1c" /><stop offset="0.6" stopColor="#1a2547" /><stop offset="1" stopColor="#7a4a2a" /></linearGradient>
      <radialGradient id="hb-lua" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#dfe8ff" stopOpacity={0.5} /><stop offset="1" stopColor="#dfe8ff" stopOpacity={0} /></radialGradient>
    </defs>
    <rect x={-800} y={-600} width={2700} height={3200} fill="url(#hb-ceu)" />
    <circle cx={800} cy={420} r={330} fill="url(#hb-lua)" />
    <circle cx={800} cy={420} r={120} fill="#e9eefc" />
    {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={-400 + rnd(`hbx${i}`) * 1900} cy={-300 + rnd(`hby${i}`) * 900} r={2 + rnd(`hbr${i}`) * 2} fill="#fff" opacity={0.3 + 0.4 * Math.abs(Math.sin(f * 0.05 + i))} />)}
    {/* plano 3: horizonte de Gotham, baixo contraste, névoa âmbar baixa */}
    {Array.from({ length: 14 }, (_, i) => { const x = -560 + i * 170, h = 560 + ((i * 113) % 340); return <g key={i}><rect x={x} y={1400 - h} width={140} height={h} fill="#26304f" /><path d={`M ${x},${1400 - h} l 70,-${60 + (i % 3) * 30} l 70,${60 + (i % 3) * 30} Z`} fill="#26304f" /></g>; })}
    <rect x={-800} y={1180} width={2700} height={260} fill="#c9853f" opacity={0.25} />
    {/* plano 2: prédios médios com janelas âmbar */}
    {Array.from({ length: 6 }, (_, i) => {
      const x = -420 + i * 360, h = 640 + ((i * 151) % 280), w = 250;
      return <g key={i}>
        <rect x={x} y={1500 - h} width={w} height={h} fill="#151c33" stroke="#05060c" strokeWidth={6} />
        <rect x={x} y={1500 - h} width={10} height={h} fill="#5d7cc4" opacity={0.6} />
        {Array.from({ length: Math.floor(h / 100) }, (_, k) => [0, 1, 2].map((c) => <rect key={`${k}-${c}`} x={x + 30 + c * 70} y={1500 - h + 40 + k * 100} width={36} height={50} fill="#ffb54a" opacity={rnd(`hbw${i}${k}${c}`) > 0.55 ? 0.85 : 0.1} />))}
      </g>;
    })}
    {/* plano 1: beiral do telhado com gárgula simples */}
    <rect x={-800} y={Y - 10} width={2700} height={900} fill="#232838" stroke="#05060c" strokeWidth={8} />
    <rect x={-800} y={Y - 10} width={2700} height={30} fill="#3a4258" stroke="#05060c" strokeWidth={8} />
    <rect x={-800} y={Y - 6} width={2700} height={6} fill="#ffb54a" opacity={0.35} />
    <g transform={`translate(70 ${Y - 10})`}>
      <path d="M -70,0 L -60,-120 C -40,-200 40,-200 60,-120 L 70,0 Z" fill="#3a4258" stroke="#05060c" strokeWidth={8} />
      <path d="M -40,-150 L -70,-210 L -20,-170 M 40,-150 L 70,-210 L 20,-170" fill="#3a4258" stroke="#05060c" strokeWidth={8} />
    </g>
  </g>
);

export default function Video() {
  const f = useCurrentFrame();
  const poses = plano.poses as unknown as [number, Pose][];
  const pose = poseDoPlano(f, poses, { respirar: f * 0.14 });
  // capa reage depois do giro: usa a pose de 6 quadros atrás para o atraso
  const antes = poseDoPlano(Math.max(0, f - 6), poses);
  const vx = (antes.dx ?? 0) - (pose.dx ?? 0), vy = (antes.agachar ?? 0) - (pose.agachar ?? 0);
  const capa: [number, number] = [vx * 1.8 + Math.sin(f * 0.12) * 10, vy * 1.2 + Math.sin(f * 0.17) * 6];
  const lente = clamp01(ramp(f, 26, 40)) * (1 - clamp01(ramp(f, 70, 90))) * 0.6; // estreita os olhos ao vigiar
  const chaves = (CAMERA_FIXA ? [[0, 560, 1000, 1.05, 0]] : plano.camera) as ChaveCam[];
  return (
    <AbsoluteFill style={{ backgroundColor: "#070b1c" }}>
      <Camera chaves={chaves} deriva={0}>
        <Gotham f={f} />
        {/* luz de recorte azul no contorno */}
        <g transform="translate(-7 -5)"><Heroi traje="morcego" pose={pose} x={X} y={Y} escala={ESC} sil="#7fa6ff" capa={capa} /></g>
        <Heroi traje="morcego" pose={pose} x={X} y={Y} escala={ESC} lente={lente} capa={capa} />
      </Camera>
    </AbsoluteFill>
  );
}
