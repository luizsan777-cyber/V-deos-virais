// Cenários ilustrados em SVG (mundo 1080 x 1920, chão perto de y = 1500).
// Cada cenário aceita "luz" (0..1) para escurecer/clarear e anima detalhes sozinho (nunca fica estático).
import React from "react";
import { useCurrentFrame } from "remotion";
import { rnd, wobble } from "./anim";

const T = "#120c14";

/** Quarto à noite: parede com textura, janela com lua, cama, abajur, estante. */
export const QuartoNoturno: React.FC<{ luz?: number; abajur?: number }> = ({ luz = 1, abajur = 1 }) => {
  const f = useCurrentFrame();
  const flick = 0.92 + 0.08 * Math.sin(f * 0.7) * Math.sin(f * 0.23);
  return (
    <g>
      <defs>
        <linearGradient id="qParede" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#23284d" /><stop offset="1" stopColor="#15183a" /></linearGradient>
        <linearGradient id="qChao" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a2a3f" /><stop offset="1" stopColor="#1e1424" /></linearGradient>
        <radialGradient id="qLua"><stop offset="0" stopColor="#fffbe6" /><stop offset="0.25" stopColor="#fff2b8" stopOpacity="0.9" /><stop offset="1" stopColor="#9fb4ff" stopOpacity="0" /></radialGradient>
        <radialGradient id="qAbajur" cx="0.5" cy="0.4"><stop offset="0" stopColor="#ffcf7a" stopOpacity="0.85" /><stop offset="0.4" stopColor="#ff9d3c" stopOpacity="0.25" /><stop offset="1" stopColor="#ff8a00" stopOpacity="0" /></radialGradient>
        <linearGradient id="qFeixe" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#cfe0ff" stopOpacity="0.28" /><stop offset="1" stopColor="#cfe0ff" stopOpacity="0" /></linearGradient>
      </defs>
      <rect x={-600} y={-400} width={2300} height={1920} fill="url(#qParede)" />
      {/* papel de parede: listras suaves */}
      {Array.from({ length: 26 }, (_, i) => <rect key={i} x={-600 + i * 90} y={-400} width={8} height={1900} fill="#2f3566" opacity={0.35} />)}
      {/* janela */}
      <g transform="translate(700 420)">
        <rect x={-190} y={-230} width={380} height={460} rx={14} fill="#0b1236" stroke={T} strokeWidth={12} />
        <circle cx={60} cy={-90} r={160} fill="url(#qLua)" />
        <circle cx={60} cy={-90} r={52} fill="#fff6d6" />
        <circle cx={78} cy={-104} r={10} fill="#e9dfb8" opacity={0.7} />
        <circle cx={44} cy={-70} r={7} fill="#e9dfb8" opacity={0.6} />
        {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={-170 + rnd(`je${i}`) * 340} cy={-210 + rnd(`jy${i}`) * 400} r={1.5 + rnd(`jr${i}`) * 2} fill="#fff" opacity={0.4 + 0.5 * Math.abs(Math.sin(f * 0.05 + i))} />)}
        <path d="M -190,90 C -120,40 -60,70 0,40 C 70,0 120,60 190,30 L 190,230 L -190,230 Z" fill="#070b22" />
        <rect x={-6} y={-230} width={12} height={460} fill={T} />
        <rect x={-190} y={-6} width={380} height={12} fill={T} />
        {/* cortinas balançando */}
        <path d={`M -230,-260 C -200,-50 ${-250 + wobble(f, 1, 0.4) * 8},120 -210,260 L -140,260 C -170,100 -150,-80 -150,-260 Z`} fill="#5b2d5e" stroke={T} strokeWidth={8} />
        <path d={`M 230,-260 C 200,-50 ${250 + wobble(f, 2, 0.4) * 8},120 210,260 L 140,260 C 170,100 150,-80 150,-260 Z`} fill="#5b2d5e" stroke={T} strokeWidth={8} />
        <rect x={-260} y={-280} width={520} height={22} rx={10} fill="#3a2230" />
      </g>
      {/* feixe de luar no chão */}
      <path d="M 520,650 L 880,650 L 1150,1560 L 420,1560 Z" fill="url(#qFeixe)" opacity={luz} />
      {/* rodapé e chão */}
      <rect x={-600} y={1380} width={2300} height={700} fill="url(#qChao)" />
      <rect x={-600} y={1372} width={2300} height={24} fill="#141030" />
      {Array.from({ length: 16 }, (_, i) => <line key={i} x1={-600 + i * 150} y1={1400} x2={-800 + i * 190} y2={2000} stroke="#2a1c30" strokeWidth={4} />)}
      {/* estante */}
      <g transform="translate(-130 760)">
        <rect x={-120} y={-260} width={240} height={520} fill="#4a2f2a" stroke={T} strokeWidth={10} />
        {[-140, 0, 140].map((yy, k) => (
          <g key={k}>
            <rect x={-110} y={yy + 60} width={220} height={14} fill="#2c1b18" />
            {Array.from({ length: 6 }, (_, i) => <rect key={i} x={-100 + i * 34} y={yy - 20 + (i % 3) * 6} width={26} height={80 - (i % 3) * 6} fill={["#d9534f", "#5bc0de", "#f0ad4e", "#5cb85c", "#9b59b6", "#e67e22"][(i + k) % 6]} stroke={T} strokeWidth={4} />)}
          </g>
        ))}
      </g>
      {/* cama */}
      <g transform="translate(330 1350)">
        <rect x={-420} y={-160} width={60} height={240} rx={12} fill="#5a3a2c" stroke={T} strokeWidth={10} />
        <rect x={-380} y={-90} width={700} height={130} rx={30} fill="#3f6fb5" stroke={T} strokeWidth={10} />
        <path d="M -380,-60 C -200,-110 100,-120 320,-70 L 320,40 L -380,40 Z" fill="#5c8fd6" stroke={T} strokeWidth={8} />
        <ellipse cx={-280} cy={-110} rx={90} ry={40} fill="#f1f0ff" stroke={T} strokeWidth={8} />
      </g>
      {/* abajur */}
      <g transform="translate(-150 1240)">
        <circle cx={0} cy={-150} r={360} fill="url(#qAbajur)" opacity={abajur * flick} />
        <rect x={-70} y={-20} width={140} height={150} rx={10} fill="#5a3a2c" stroke={T} strokeWidth={8} />
        <rect x={-8} y={-130} width={16} height={110} fill="#2a1d18" />
        <path d="M -70,-130 L 70,-130 L 45,-220 L -45,-220 Z" fill={abajur > 0.5 ? "#ffd48a" : "#7a6650"} stroke={T} strokeWidth={8} />
      </g>
      {/* escurecimento geral */}
      <rect x={-600} y={-400} width={2300} height={2400} fill="#05040f" opacity={1 - luz} />
    </g>
  );
};

/** Floresta sombria com névoa e lua (terror/suspense). */
export const FlorestaSombria: React.FC<{ luz?: number }> = ({ luz = 1 }) => {
  const f = useCurrentFrame();
  const arvore = (x: number, h: number, w: number, cor: string, k: number) => (
    <g key={k} transform={`translate(${x} 1500) rotate(${wobble(f, k, 0.15) * 0.6})`}>
      <path d={`M ${-w / 2},0 C ${-w / 3},${-h * 0.4} ${-w / 5},${-h * 0.7} -4,${-h} L 4,${-h} C ${w / 5},${-h * 0.7} ${w / 3},${-h * 0.4} ${w / 2},0 Z`} fill={cor} />
      {[0.45, 0.62, 0.78].map((p, i) => (
        <path key={i} d={`M 0,${-h * p} q ${(i % 2 ? 1 : -1) * w * 1.6},${-40} ${(i % 2 ? 1 : -1) * w * 2.4},${-120 - i * 20}`} stroke={cor} strokeWidth={w * 0.22} fill="none" strokeLinecap="round" />
      ))}
    </g>
  );
  return (
    <g>
      <defs>
        <linearGradient id="fCeu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#070b1c" /><stop offset="0.6" stopColor="#1b2446" /><stop offset="1" stopColor="#33405f" /></linearGradient>
        <radialGradient id="fLua"><stop offset="0" stopColor="#f6f3e0" /><stop offset="0.2" stopColor="#dfe6ff" stopOpacity="0.6" /><stop offset="1" stopColor="#7f93c9" stopOpacity="0" /></radialGradient>
        <linearGradient id="fNevoa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9fb0d0" stopOpacity="0" /><stop offset="1" stopColor="#9fb0d0" stopOpacity="0.55" /></linearGradient>
      </defs>
      <rect x={-600} y={-400} width={2300} height={2400} fill="url(#fCeu)" />
      <circle cx={760} cy={380} r={330} fill="url(#fLua)" />
      <circle cx={760} cy={380} r={88} fill="#f3efd9" />
      {[0, 1, 2].map((i) => <ellipse key={i} cx={((f * (0.4 + i * 0.2) + i * 500) % 2200) - 600} cy={300 + i * 140} rx={300} ry={36} fill="#3a4466" opacity={0.5} />)}
      {[...Array(9)].map((_, i) => arvore(-500 + i * 240 + rnd(`fa${i}`) * 80, 1100 + rnd(`fh${i}`) * 300, 60, "#1a2238", i))}
      <rect x={-600} y={1100} width={2300} height={500} fill="url(#fNevoa)" />
      {[...Array(7)].map((_, i) => arvore(-420 + i * 330 + rnd(`fb${i}`) * 100, 1400 + rnd(`fg${i}`) * 300, 90, "#0b0f1d", i + 20))}
      <path d="M -600,1480 C -200,1440 300,1500 700,1460 C 1100,1430 1400,1490 1700,1470 L 1700,2000 L -600,2000 Z" fill="#070912" />
      {[0, 1].map((i) => <ellipse key={i} cx={((f * (1.2 + i) + i * 900) % 2600) - 700} cy={1450 + i * 60} rx={700} ry={70} fill="#c3cde6" opacity={0.18} />)}
      <rect x={-600} y={-400} width={2300} height={2400} fill="#020309" opacity={1 - luz} />
    </g>
  );
};

/** Deserto ao entardecer (histórias bíblicas / antigas). */
export const DesertoEntardecer: React.FC<{ luz?: number }> = ({ luz = 1 }) => {
  const f = useCurrentFrame();
  return (
    <g>
      <defs>
        <linearGradient id="dCeu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3b2a6b" /><stop offset="0.45" stopColor="#d9725a" /><stop offset="0.75" stopColor="#ffc27a" /><stop offset="1" stopColor="#ffe2a8" /></linearGradient>
        <radialGradient id="dSol"><stop offset="0" stopColor="#fff6d0" /><stop offset="0.3" stopColor="#ffd27a" stopOpacity="0.7" /><stop offset="1" stopColor="#ff9c4a" stopOpacity="0" /></radialGradient>
      </defs>
      <rect x={-600} y={-400} width={2300} height={2400} fill="url(#dCeu)" />
      <circle cx={540} cy={1020} r={420} fill="url(#dSol)" />
      <circle cx={540} cy={1020} r={120} fill="#fff1c2" />
      {[0, 1, 2].map((i) => <path key={i} d={`M ${-300 + ((f * 0.3 * (i + 1)) % 300)},${300 + i * 120} q 200,-40 400,0 q -200,30 -400,0`} fill="#ffd9b0" opacity={0.35} />)}
      <path d="M -600,1180 C -300,1080 0,1160 300,1110 C 600,1060 900,1140 1700,1090 L 1700,2000 L -600,2000 Z" fill="#c9744e" />
      <path d="M -600,1300 C -200,1220 200,1320 600,1260 C 1000,1200 1300,1290 1700,1250 L 1700,2000 L -600,2000 Z" fill="#e0955f" />
      <path d="M -600,1480 C -100,1420 400,1520 900,1470 C 1200,1440 1500,1480 1700,1470 L 1700,2000 L -600,2000 Z" fill="#f2b277" />
      {/* tendas e palmeiras */}
      <g transform="translate(-60 1290)">
        <path d="M -130,0 L 0,-150 L 130,0 Z" fill="#8a4a3a" stroke="#3a2414" strokeWidth={7} />
        <path d="M -20,0 L 0,-60 L 20,0 Z" fill="#3a2414" />
      </g>
      <g transform="translate(940 1300)">
        <path d={`M 0,0 C -10,-120 ${10 + wobble(f, 3, 0.3) * 4},-240 20,-330`} stroke="#5a3a24" strokeWidth={22} fill="none" strokeLinecap="round" />
        {[-140, -80, -20, 40, 100, 160].map((a, i) => (
          <path key={i} transform={`translate(20 -330) rotate(${a + wobble(f, i, 0.5) * 4})`} d="M 0,0 C 60,-30 120,-10 170,40 C 110,10 60,10 0,0 Z" fill="#2f5a3a" stroke="#1d3324" strokeWidth={5} />
        ))}
      </g>
      <rect x={-600} y={-400} width={2300} height={2400} fill="#1a0d20" opacity={1 - luz} />
    </g>
  );
};
