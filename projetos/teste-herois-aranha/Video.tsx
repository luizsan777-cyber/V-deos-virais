// teste-herois-aranha — amostra técnica da skill herois-2d (4 s, sem narração).
// Poses e câmera vêm direto de plano.json (scripts/plano.py --id marvel/peter-parker --segundos 4 --fps 30).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Camera, ChaveCam } from "../../engine/src/kit/Camera";
import { Pose } from "../../engine/src/kit/poses";
import { clamp01, eio, ramp } from "../../engine/src/kit/anim";
import { Heroi, poseDoPlano } from "../herois_2d_kit/Heroi";
import plano from "./plano.json";

export const CAMERA_FIXA = false; // true só para conferir movimento do corpo sem câmera
const X = 540, Y = 1680, ESC = 1.4;

const Cidade: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <defs>
      <linearGradient id="ha-ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#38c6f4" /><stop offset="0.7" stopColor="#9be7ff" /><stop offset="1" stopColor="#e8fbff" /></linearGradient>
    </defs>
    <rect x={-800} y={-600} width={2700} height={3200} fill="url(#ha-ceu)" />
    {[[120, 260, 0.9], [760, 180, 0.7]].map(([x, y, s], i) => <ellipse key={i} cx={x + f * 0.4 * (i + 1)} cy={y} rx={170 * s} ry={44 * s} fill="#ffffff" opacity={0.8} />)}
    {/* plano 3: prédios distantes, baixo contraste */}
    {Array.from({ length: 12 }, (_, i) => { const x = -500 + i * 190, h = 520 + ((i * 97) % 260); return <rect key={i} x={x} y={1420 - h} width={150} height={h} fill="#8fb8dc" />; })}
    {/* plano 2: prédios médios em perspectiva, janelas */}
    {Array.from({ length: 7 }, (_, i) => {
      const x = -460 + i * 330, h = 760 + ((i * 131) % 300), w = 230;
      return <g key={i}>
        <rect x={x} y={1500 - h} width={w} height={h} fill="#4f6fa8" stroke="#1d2340" strokeWidth={6} />
        <path d={`M ${x + w},${1500 - h} l 50,-34 l 0,${h} l -50,34 Z`} fill="#3a5288" stroke="#1d2340" strokeWidth={6} />
        {Array.from({ length: Math.floor(h / 90) }, (_, k) => [0, 1, 2].map((c) => <rect key={`${k}-${c}`} x={x + 24 + c * 70} y={1500 - h + 30 + k * 90} width={40} height={50} fill={(k + c + i) % 3 ? "#bfe6ff" : "#ffe9a8"} opacity={0.85} />))}
      </g>;
    })}
    {/* plano 1: telhado onde ele está */}
    <rect x={-800} y={Y - 10} width={2700} height={900} fill="#5b4b6b" stroke="#14101c" strokeWidth={8} />
    <rect x={-800} y={Y - 10} width={2700} height={36} fill="#7a6890" stroke="#14101c" strokeWidth={8} />
    <g transform={`translate(1000 ${Y - 10})`}>
      <rect x={-20} y={-260} width={20} height={260} fill="#2b2238" />
      <rect x={70} y={-260} width={20} height={260} fill="#2b2238" />
      <rect x={-60} y={-460} width={190} height={220} rx={16} fill="#8a5a3a" stroke="#14101c" strokeWidth={8} />
      <path d="M -70,-460 L 35,-540 L 140,-460 Z" fill="#6a3f2a" stroke="#14101c" strokeWidth={8} />
    </g>
  </g>
);

export default function Video() {
  const f = useCurrentFrame();
  const poses = plano.poses as unknown as [number, Pose][];
  const pose = poseDoPlano(f, poses, { respirar: f * 0.18 });
  const lente = Math.sin(Math.PI * clamp01(ramp(f, 18, 42))) * 0.8; // lentes se estreitam na antecipação
  const teiaOn = f >= 40 && f <= 78;
  const teia: [number, number] | null = teiaOn ? [300, -1400 - 200 * eio(ramp(f, 40, 50))] : null;
  const chaves = (CAMERA_FIXA ? [[0, 560, 1000, 1.05, 0]] : plano.camera) as ChaveCam[];
  return (
    <AbsoluteFill style={{ backgroundColor: "#38c6f4" }}>
      <Camera chaves={chaves} deriva={0}>
        <Cidade f={f} />
        <g transform="translate(-6 -4)"><Heroi traje="aranha" pose={pose} x={X} y={Y} escala={ESC} sil="#bff4ff" teia={teia} /></g>
        <Heroi traje="aranha" pose={pose} x={X} y={Y} escala={ESC} lente={lente} teia={teia} />
      </Camera>
    </AbsoluteFill>
  );
}
