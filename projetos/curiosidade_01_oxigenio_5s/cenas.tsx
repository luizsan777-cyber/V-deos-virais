// CURIOSIDADE 01 — E se o oxigênio do ar sumisse por 5 segundos? (hipótese impossível, 2D família "3ª Guerra")
import React from "react";
import { AbsoluteFill } from "remotion";
import { Camera } from "../../engine/src/kit/Camera";
import { Personagem } from "../../engine/src/kit/Personagem";
import { parado, andando, surpreso, pensando, Pose } from "../../engine/src/kit/poses";
import { EXPRESSOES, exprEm, misturaExpr } from "../../engine/src/kit/expressoes";
import { chaves, clamp01, eback, eio, eout, lerp, piscar, ramp, rnd, wobble } from "../../engine/src/kit/anim";
import { useCena } from "../../engine/src/kit/tempo";
import { Avatar, AVATAR, EST_CANAL, SeloCanal, TarjaCanal, maoDoRig, cabecaDoRig, TINTA_CANAL as TINTA } from "../../engine/src/kit/canal";

const W = 1080, H = 1920;
type C = React.FC<{ inicio: number; fim: number }>;
const Tela: React.FC<{ children: React.ReactNode; op?: number }> = ({ children, op = 1 }) => <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: op }}>{children}</svg>;
const AZUL = "#4fb4ff", LARANJA = "#ff9a2e", ROXO = "#8e6bff";

// ------------------------------------------------------------------ cenários próprios do episódio
const Praca: React.FC<{ f: number; roxo?: number }> = ({ f, roxo = 0 }) => (
  <g>
    <defs><linearGradient id="ox1ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#62c3ff" /><stop offset="1" stopColor="#d9f3ff" /></linearGradient></defs>
    <rect x={-1500} y={-1500} width={4200} height={3300} fill="url(#ox1ceu)" />
    <circle cx={880} cy={260} r={80} fill="#fff4b8" />
    {[0, 1, 2].map((i) => <ellipse key={i} cx={((f * (0.3 + i * 0.15) + i * 600) % 2200) - 600} cy={300 + i * 110} rx={120} ry={34} fill="#fff" opacity={0.9} />)}
    {/* prédios coloridos ao fundo */}
    {[[-380, 300, 760, "#f6b26b"], [-80, 260, 880, "#93c47d"], [200, 240, 700, "#6fa8dc"], [470, 280, 980, "#e06666"], [780, 260, 760, "#ffd966"], [1060, 300, 880, "#8e7cc3"], [1380, 260, 700, "#76a5af"]].map(([x, w, h, c], i) => (
      <g key={i}>
        <rect x={x as number} y={1300 - (h as number)} width={w as number} height={h as number} fill={c as string} stroke={TINTA} strokeWidth={7} />
        {Array.from({ length: Math.floor((h as number) / 110) }, (_, a) => [0, 1, 2].map((j) => <rect key={`${a}${j}`} x={(x as number) + 26 + j * ((w as number) - 60) / 3} y={1300 - (h as number) + 30 + a * 110} width={44} height={60} rx={4} fill="#dff2ff" stroke={TINTA} strokeWidth={4} />))}
      </g>
    ))}
    {/* árvores da praça */}
    {[[-60, 1360, 1.1], [980, 1340, 1.2]].map(([x, y, s], i) => (
      <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
        <rect x={-16} y={-160} width={32} height={160} fill="#7a5235" stroke={TINTA} strokeWidth={6} />
        <g transform={`rotate(${wobble(f, i + 4, 0.5) * 3} 0 -160)`}>{[[-60, -200, 80], [55, -210, 85], [0, -270, 95]].map(([cx, cy, r], k) => <circle key={k} cx={cx} cy={cy} r={r} fill={k % 2 ? "#3c9a52" : "#2f8a46"} stroke={TINTA} strokeWidth={6} />)}</g>
      </g>
    ))}
    {/* calçada com ondas (pedra portuguesa estilizada) */}
    <rect x={-1500} y={1300} width={4200} height={900} fill="#f2ece0" />
    {Array.from({ length: 8 }, (_, k) => <path key={k} d={`M -1500,${1360 + k * 70} ${Array.from({ length: 50 }, (_, i) => `Q ${-1460 + i * 90},${1330 + k * 70} ${-1420 + i * 90},${1360 + k * 70}`).join(" ")}`} fill="none" stroke="#2b2b2b" strokeWidth={10} opacity={0.75} />)}
    <rect x={-1500} y={-1500} width={4200} height={3800} fill={ROXO} opacity={0.12 * roxo} />
  </g>
);
const MesaVela: React.FC<{ x: number; y: number; f: number; acesa: number }> = ({ x, y, f, acesa }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-120} y={-12} width={240} height={20} rx={6} fill="#8a5a3c" stroke={TINTA} strokeWidth={6} />
    <rect x={-8} y={8} width={16} height={180} fill="#5a3a2a" />
    <rect x={-16} y={-80} width={32} height={70} rx={6} fill="#fff6e0" stroke={TINTA} strokeWidth={5} />
    <line x1={0} y1={-80} x2={0} y2={-92} stroke={TINTA} strokeWidth={4} />
    {acesa > 0 && <path d={`M 0,${-92 - 46 * acesa} C ${16 + Math.sin(f * 0.5) * 4},${-96 - 20 * acesa} 12,-90 0,-88 C -12,-90 ${-16 + Math.sin(f * 0.5) * 4},${-96 - 20 * acesa} 0,${-92 - 46 * acesa} Z`} fill={LARANJA} opacity={acesa} />}
    {acesa < 1 && acesa > -1 && <path d={`M 0,-96 C 10,-130 -10,-150 6,-${180 + (1 - acesa) * 40}`} stroke="#9aa0aa" strokeWidth={5} fill="none" opacity={(1 - acesa) * 0.6} />}
  </g>
);
const Cozinha: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x={-1500} y={-1500} width={4200} height={3300} fill="#fde9c9" />
    {Array.from({ length: 12 }, (_, i) => Array.from({ length: 6 }, (_, j) => <rect key={`${i}${j}`} x={-60 + i * 110} y={760 + j * 110} width={104} height={104} fill={(i + j) % 2 ? "#e8f4f8" : "#d4ecf2"} />))}
    <rect x={200} y={300} width={360} height={300} rx={14} fill="#9fe0ff" stroke={TINTA} strokeWidth={10} />
    <line x1={380} y1={300} x2={380} y2={600} stroke={TINTA} strokeWidth={8} />
    <rect x={-1500} y={1400} width={4200} height={60} fill="#c79a6a" stroke={TINTA} strokeWidth={8} />
    <rect x={-1500} y={1460} width={4200} height={700} fill="#e8b98a" />
    {Array.from({ length: 6 }, (_, i) => <rect key={i} x={-100 + i * 260} y={1500} width={230} height={380} rx={12} fill="#f6d2a8" stroke={TINTA} strokeWidth={6} />)}
  </g>
);
const Fogao: React.FC<{ x: number; y: number; f: number; chama: number }> = ({ x, y, f, chama }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-200} y={-20} width={400} height={40} rx={8} fill="#c9ced6" stroke={TINTA} strokeWidth={7} />
    {[-90, 90].map((bx, i) => (
      <g key={i} transform={`translate(${bx} -20)`}>
        <ellipse rx={60} ry={14} fill="#3a3f4a" stroke={TINTA} strokeWidth={5} />
        {i === 0 && chama > 0 && Array.from({ length: 7 }, (_, k) => {
          const a = -54 + k * 18, h = (34 + Math.sin(f * 0.6 + k) * 6) * chama;
          return <path key={k} d={`M ${a - 7},-4 Q ${a},${-h} ${a + 7},-4 Z`} fill={k % 2 ? "#4f9bff" : "#ffb347"} opacity={0.9} />;
        })}
      </g>
    ))}
  </g>
);
/** pontinhos azuis = oxigênio no ar (somem/voltam) */
const ArAzul: React.FC<{ f: number; op: number; area?: [number, number, number, number]; n?: number; seed?: string }> = ({ f, op, area = [-300, -200, 1700, 2300], n = 60, seed = "ar" }) => op <= 0 ? null : (
  <g opacity={op}>
    {Array.from({ length: n }, (_, i) => {
      const x = area[0] + ((rnd(`ox1${seed}${i}`) * area[2] + f * (0.6 + rnd(`ox1${seed}v${i}`))) % area[2]);
      const y = area[1] + rnd(`ox1${seed}y${i}`) * area[3] + Math.sin(f * 0.04 + i) * 14;
      return <g key={i}><circle cx={x} cy={y} r={9} fill={AZUL} opacity={0.75} /><circle cx={x + 12} cy={y} r={9} fill={AZUL} opacity={0.75} /></g>;
    })}
  </g>
);
const Relogio5: React.FC<{ x: number; y: number; n: number; s?: number; prog: number }> = ({ x, y, n, s = 1, prog }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={120} fill="#fff8e6" stroke={TINTA} strokeWidth={12} />
    <path d={`M 0,0 L 0,-100 A 100,100 0 ${prog > 0.5 ? 1 : 0},1 ${100 * Math.sin(prog * Math.PI * 2)},${-100 * Math.cos(prog * Math.PI * 2)} Z`} fill={ROXO} opacity={0.35} />
    <text y={44} textAnchor="middle" fontFamily="Anton" fontSize={130} fill={TINTA}>{n}</text>
  </g>
);

// ================================================================== 01 O MUNDO PISCA
export const Cena01: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const some = eio(ramp(lf, P("oxigênio") - 4, P("desaparecesse") + 6));
  const anda = lf < P("desaparecesse") ? 1 : 0;
  const x = 420 + Math.min(lf, P("desaparecesse")) * 1.4;
  const pose: Pose = anda ? { ...andando(lf, 1.4, 1), bracoE: [12, 40] } : { ...parado(lf, 1), virar: 0.6, olhar: [0.9, -0.1], bracoE: [12, 40] };
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, x, 1180, 2.6], [P("cinco"), x, 1220, 2.2], [P("desaparecesse"), x + 60, 1300, 1.3], [dur, x + 80, 1300, 1.22]]} deriva={0}>
        <Praca f={lf} roxo={some} />
        <MesaVela x={x + 330} y={1480} f={lf} acesa={1 - eio(ramp(lf, P("desaparecesse"), P("desaparecesse") + 14))} />
        <ArAzul f={lf} op={1 - some} seed="c1" />
        <Avatar id="ox1-avatar-c1" x={x} y={1760} escala={1.05} pose={pose} f={lf}
          expr={exprEm(lf, [[0, "neutro"], [P("desaparecesse") - 2, "surpreso"], [P("problema"), "pensativo"]])}
          itemE={<g><path d="M -34,0 L 34,0 L 28,70 L -28,70 Z" fill="#f2f2f2" stroke={TINTA} strokeWidth={5} /><path d="M -16,0 C -16,-24 16,-24 16,0" fill="none" stroke={TINTA} strokeWidth={5} /></g>} />
      </Camera>
      <Tela>
        {lf >= P("cinco") - 4 && <g opacity={1 - ramp(lf, dur - 10, dur)}><Relogio5 x={860} y={520} n={5} s={eback(ramp(lf, P("cinco") - 4, P("cinco") + 6)) * 0.85} prog={0} /><text x={860} y={680} textAnchor="middle" fontFamily="Anton" fontSize={44} fill={TINTA} stroke="#fff" strokeWidth={8} paintOrder="stroke">5 SEGUNDOS</text></g>}
        <SeloCanal f={lf} em={P("desaparecesse") + 4} t="SEM OXIGÊNIO NO AR?" y={300} tam={70} />
      </Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 02 SÓ O OXIGÊNIO DO AR
export const Cena02: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const apaga = eio(ramp(lf, P("some") - 6, P("some") + 14));
  const moldura = clamp01(ramp(lf, P("água") - 6, P("água") + 6));
  const pose: Pose = { ...parado(lf, 1), bracoD: [lerp(12, 60, moldura), lerp(10, 60, moldura)], olhar: [0.5, 0.3] };
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 540, 1150, 1.15], [P("some"), 520, 1000, 1.1], [P("água"), 600, 1150, 1.2], [dur, 620, 1180, 1.25]]} deriva={0}>
        <Cozinha f={lf} />
        {/* copo de água e gota: continuam ali */}
        <g transform="translate(760 1390)">
          <path d="M -50,-160 L 50,-160 L 40,0 L -40,0 Z" fill="#dff6ff" stroke={TINTA} strokeWidth={6} opacity={0.95} />
          <path d={`M -46,${-110 + Math.sin(lf * 0.2) * 3} L 46,${-110 - Math.sin(lf * 0.2) * 3} L 40,0 L -40,0 Z`} fill="#3d9bff" opacity={0.75} />
        </g>
        <path d={`M 880,${1180 + ((lf * 2) % 160)} C 900,${1210 + ((lf * 2) % 160)} 900,${1240 + ((lf * 2) % 160)} 880,${1240 + ((lf * 2) % 160)} C 860,${1240 + ((lf * 2) % 160)} 860,${1210 + ((lf * 2) % 160)} 880,${1180 + ((lf * 2) % 160)} Z`} fill="#3d9bff" stroke={TINTA} strokeWidth={4} />
        <ArAzul f={lf} op={1 - apaga} area={[-200, 100, 1500, 1200]} seed="c2" />
        <Avatar id="ox1-avatar-c2" x={420} y={1800} escala={1.05} pose={pose} f={lf} expr={exprEm(lf, [[0, "pensativo"], [P("água"), "sereno"]])} />
        {/* moldura: AR × ÁGUA E CORPO */}
        <g opacity={moldura}>
          <rect x={90} y={160} width={900} height={560} rx={24} fill="none" stroke={AZUL} strokeWidth={8} strokeDasharray="22 14" />
          <rect x={90} y={760} width={900} height={1060} rx={24} fill="none" stroke="#2fbf71" strokeWidth={8} />
        </g>
      </Camera>
      <Tela op={moldura}>
        <g transform="translate(230 250)"><rect x={-90} y={-46} width={180} height={70} rx={14} fill={AZUL} stroke={TINTA} strokeWidth={5} /><text y={10} textAnchor="middle" fontFamily="Anton" fontSize={48} fill="#fff">AR</text></g>
        <g transform="translate(760 1030)"><rect x={-210} y={-46} width={420} height={70} rx={14} fill="#2fbf71" stroke={TINTA} strokeWidth={5} /><text y={10} textAnchor="middle" fontFamily="Anton" fontSize={44} fill="#fff">ÁGUA E CORPO</text></g>
      </Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 03 UM QUINTO DO AR (gráfico em HyperFrames por cima)
export const Cena03: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const volta = eio(ramp(lf, P("cairia") + 6, dur));
  const pose: Pose = { ...parado(lf, 1), virar: 0.2, olhar: [0.2, -0.5] };
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 540, 1100, 1.0], [P("cairia"), 540, 1100, 1.05], [dur, 520, 1150, 2.3]]} deriva={0}>
        <Praca f={lf} roxo={0.6} />
        <g opacity={0.4 + 0.6 * volta}><Avatar id="ox1-avatar-c3" x={520} y={1760} escala={1.05} pose={pose} f={lf} expr={EXPRESSOES.pensativo} /></g>
      </Camera>
      <AbsoluteFill style={{ backgroundColor: "#0e1530", opacity: 0.55 * (1 - volta) }} />
    </AbsoluteFill>
  );
};

// ================================================================== 04 OUVIDOS
export const Cena04: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const mao = eio(ramp(lf, 4, 16));
  const diagrama = clamp01(ramp(lf, P("parecida") - 6, P("parecida") + 6)) * (1 - ramp(lf, P("dependeria"), P("dependeria") + 8));
  const respira = lf > P("dependeria") ? 0.5 + 0.5 * Math.sin(lf * 0.1) : 0;
  const pose: Pose = { ...parado(lf, 1), bracoD: [lerp(12, 150, mao), lerp(10, 145, mao)], cabecaIncl: 6 * mao, virar: 0.55, respirar: lf * 0.08, bob: -respira * 3 };
  const seta = (k: number) => ((lf * 0.03 + k / 4) % 1);
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 560, 1250, 2.5], [P("parecida") - 8, 560, 1100, 1.3], [P("dependeria"), 560, 1110, 1.35], [dur, 560, 1250, 1.9]]} deriva={0}>
        <Praca f={lf} roxo={0.6} />
        <Avatar id="ox1-avatar-c4" x={540} y={1760} escala={1.05} pose={pose} f={lf}
          expr={lf < P("dependeria") ? misturaExpr(EXPRESSOES.surpreso, EXPRESSOES.desconfiado, 0.4) : EXPRESSOES.sereno} />
      </Camera>
      {diagrama > 0 && (
        <Tela op={diagrama}>
          <g transform="translate(540 560) scale(0.85)">
            <rect x={-440} y={-300} width={880} height={600} rx={30} fill="#fff8e6" stroke={TINTA} strokeWidth={7} />
            <path d="M -400,-60 C -250,-80 -120,-70 -20,-90 L -20,90 C -120,70 -250,80 -400,60 Z" fill="#ffd2b8" stroke={TINTA} strokeWidth={6} />
            <path d={`M -20,-110 Q ${-8 + Math.sin(lf * 0.3) * 6},0 -20,110`} fill="none" stroke="#e56b8f" strokeWidth={16} strokeLinecap="round" />
            <path d="M -10,-130 C 120,-160 230,-130 240,-30 C 250,60 220,130 120,140 L -10,130 Z" fill="#ffe7a0" stroke={TINTA} strokeWidth={6} />
            <text x={120} y={14} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={30} fill={TINTA}>ar do ouvido</text>
            <text x={-60} y={-150} textAnchor="end" fontFamily="Montserrat" fontWeight={900} fontSize={30} fill={TINTA}>tímpano</text>
            {[0, 1, 2, 3].map((k) => <g key={k} opacity={Math.sin(seta(k) * Math.PI)} transform={`translate(${-380 + seta(k) * 300} ${-30 + k * 20})`}><line x1={0} y1={0} x2={50} y2={0} stroke="#4f86e8" strokeWidth={9} strokeLinecap="round" /><path d="M 66,0 L 44,-13 L 44,13 Z" fill="#4f86e8" /></g>)}
            <text x={-210} y={230} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={30} fill={TINTA}>pressão de fora muda</text>
          </g>
        </Tela>
      )}
    </AbsoluteFill>
  );
};

// ================================================================== 05 A CHAMA
export const Cena05: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const afasta = eio(ramp(lf, 4, 22));
  const chama = 1 - eio(ramp(lf, P("sem") - 2, P("queimando") + 4));
  const pose: Pose = { ...parado(lf, 1), bracoD: [lerp(70, 20, afasta), lerp(60, 10, afasta)], virar: 0.4, olhar: [0.7, 0.5] };
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 700, 1300, 1.8], [P("chama"), 760, 1360, 2.1], [P("normalmente"), 700, 1260, 1.4], [dur, 680, 1250, 1.35]]} deriva={0}>
        <Cozinha f={lf} />
        <Fogao x={800} y={1400} f={lf} chama={chama} />
        <Avatar id="ox1-avatar-c5" x={430} y={1820} escala={1.05} pose={pose} f={lf} expr={exprEm(lf, [[0, "pensativo"], [P("sem"), "surpreso"], [P("normalmente"), "pensativo"]])} />
        {chama < 1 && <path d={`M 710,1380 C 730,1330 690,1300 720,${1240 - (1 - chama) * 40}`} stroke="#9aa0aa" strokeWidth={6} fill="none" opacity={(1 - chama) * 0.5 * (1 - ramp(lf, dur - 30, dur))} />}
      </Camera>
      <Tela>
        <g transform="translate(860 560)"><circle r={130} fill="#2a2440" stroke={TINTA} strokeWidth={8} /><g transform="translate(0 70) scale(1.2)"><MesaVela x={0} y={0} f={lf} acesa={1 - eio(ramp(lf, P("sem") + 6, P("queimando") + 10))} /></g></g>
        <SeloCanal f={lf} em={P("queimando") - 4} t="COMBUSTÃO PRECISA DE OXIGÊNIO" y={280} tam={52} fundo={LARANJA} />
      </Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 06 CADA CORPO REAGE DIFERENTE
const LUGARES: { fundo: string; v: typeof AVATAR; rot: string }[] = [
  { fundo: "#ffe7b0", rot: "ponto de ônibus", v: { pele: "#e8c4a8", cabelo: "coque", corCabelo: "#d9d9d9", roupa: "moletom", cor: "#3fae6a", calca: "#4a4a4a", sapato: "#555", corpo: "idoso" } },
  { fundo: "#d6ecff", rot: "escritório", v: { pele: "#8d5a3b", cabelo: "curto", corCabelo: "#1d1210", roupa: "terno", cor: "#2e4a7d", calca: "#2b2d42", sapato: "#222", corpo: "medio" } },
  { fundo: "#d8f5d0", rot: "parque", v: { pele: "#f0c8a0", cabelo: "rabo", corCabelo: "#8a4b22", roupa: "regata", cor: "#e84d8a", calca: "#2f3b5c", sapato: "#fff", corpo: "magro" } },
];
export const Cena06: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const n = Math.max(2, 5 - Math.floor((lf / dur) * 3.2));
  return (
    <AbsoluteFill style={{ backgroundColor: "#2a2440" }}>
      <Tela>
        <rect width={W} height={H} fill="#2a2440" />
        {LUGARES.map((l, i) => {
          const e = eout(ramp(lf, i * 10, i * 10 + 16));
          const y = 320 + i * 400;
          const reage = [clamp01(ramp(lf, 40, 70)), clamp01(ramp(lf, 70, 100)), clamp01(ramp(lf, 100, 130))][i];
          const poses: Pose[] = [
            { ...parado(lf, 11), tronco: 4 * reage, bracoD: [lerp(10, 30, reage), lerp(10, 80, reage)] },
            { ...parado(lf, 12), bracoD: [lerp(10, 140, reage), lerp(10, 140, reage)], cabecaIncl: 5 * reage },
            { ...parado(lf, 13), agachar: 30 * reage, bracoE: [lerp(10, 40, reage), 60], bracoD: [lerp(10, 40, reage), 60] },
          ];
          return (
            <g key={i} transform={`translate(${(1 - e) * (i % 2 ? 900 : -900)} 0)`}>
              <clipPath id={`ox1q${i}`}><rect x={70} y={y - 160} width={720} height={360} rx={26} /></clipPath>
              <g clipPath={`url(#ox1q${i})`}>
                <rect x={70} y={y - 160} width={720} height={360} fill={l.fundo} />
                <Personagem id={`ox1-reage${i}`} x={330 + i * 40} y={y + 470} escala={0.75} visual={l.v} estilo={EST_CANAL} pose={poses[i]}
                  expr={reage > 0.5 ? [EXPRESSOES.desconfiado, EXPRESSOES.surpreso, EXPRESSOES.pensativo][i] : EXPRESSOES.neutro} olhosAbertos={piscar(lf, 20 + i)} />
              </g>
              <rect x={70} y={y - 160} width={720} height={360} rx={26} fill="none" stroke="#fff" strokeWidth={7} />
              <text x={430} y={y + 238} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={30} fill="#d6ccff">{l.rot}</text>
            </g>
          );
        })}
        <Relogio5 x={930} y={720} n={n} s={0.7} prog={(5 - n) / 5} />
        <text x={930} y={860} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={26} fill="#d6ccff">contador ilustrativo</text>
      </Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 07 O RETORNO
export const Cena07: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const zero = P("terminassem");
  const n = lf < zero ? (lf < zero / 2 ? 2 : 1) : 0;
  const volta = eio(ramp(lf, P("voltaria") - 4, P("voltaria") + 16));
  const pose: Pose = { ...parado(lf, 1), virar: Math.sin(lf * 0.05) * 0.6, olhar: [Math.sin(lf * 0.05) * 0.8, -0.2], respirar: lf * 0.08 };
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 520, 1250, 2.0], [P("voltaria"), 540, 1200, 1.5], [dur, 560, 1150, 1.0]]} deriva={0}>
        <Praca f={lf} roxo={1 - volta} />
        <MesaVela x={880} y={1480} f={lf} acesa={0} />
        <ArAzul f={lf} op={volta} seed="c7" />
        <Avatar id="ox1-avatar-c7" x={540} y={1760} escala={1.05} pose={pose} f={lf} expr={exprEm(lf, [[0, "pensativo"], [P("voltaria"), "sereno"], [P("riscos") - 6, "pensativo"]])} />
      </Camera>
      <Tela>
        <g opacity={1 - ramp(lf, P("voltaria") + 20, P("voltaria") + 30)}><Relogio5 x={860} y={520} n={n} s={0.85} prog={(5 - n) / 5} /></g>
        <g transform="translate(830 1150)" opacity={clamp01(ramp(lf, P("Só") - 4, P("Só") + 6))}><rect x={-120} y={-36} width={240} height={64} rx={10} fill="#fff8e6" stroke={TINTA} strokeWidth={5} /><text y={10} textAnchor="middle" fontFamily="Anton" fontSize={38} fill={TINTA}>SIMULAÇÃO</text></g>
      </Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 08 FECHO
export const Cena08: C = ({ inicio, fim }) => {
  const { lf, P, T } = useCena(inicio);
  const dur = fim - inicio;
  const fimNarr = T.fala("c08").fim - inicio;
  const info = clamp01(ramp(lf, 6, 18)) * (1 - ramp(lf, P("Qual") - 10, P("Qual")));
  const pose: Pose = { ...parado(lf, 1), bracoD: [lerp(12, 60, info), lerp(10, 50, info)], olhar: info > 0.5 ? [0.6, -0.3] : [0, 0] };
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 560, 1150, 1.1], [P("Qual") - 8, 560, 1150, 1.15], [P("Qual") + 10, 540, 1230, 2.3], [dur, 540, 1230, 2.4]]} deriva={0}>
        <Praca f={lf} />
        <ArAzul f={lf} op={1} seed="c8" n={40} />
        {/* ar visível simbólico: espirais suaves */}
        {[0, 1, 2].map((i) => <path key={i} d={`M ${-100 + ((lf * 2 + i * 400) % 1400)},${700 + i * 160} c 60,-60 120,60 180,0 s 120,60 180,0`} fill="none" stroke="#bfe6ff" strokeWidth={8} strokeLinecap="round" opacity={0.6} />)}
        <Avatar id="ox1-avatar-c8" x={540} y={1760} escala={1.05} pose={pose} f={lf} expr={exprEm(lf, [[0, "pensativo"], [P("invisível"), "maravilhado"], [P("Qual"), "feliz"]])} />
      </Camera>
      <Tela>
        {info > 0 && (
          <g transform="translate(540 560)" opacity={info}>
            <rect x={-380} y={-150} width={760} height={300} rx={26} fill="#fff8e6" stroke={TINTA} strokeWidth={6} />
            <g transform="translate(-180 -10)"><path d="M -10,-70 C -80,-70 -90,10 -80,60 C -50,70 -20,60 -10,30 Z" fill="#ff9fb0" stroke={TINTA} strokeWidth={5} /><path d="M 10,-70 C 80,-70 90,10 80,60 C 50,70 20,60 10,30 Z" fill="#ff9fb0" stroke={TINTA} strokeWidth={5} /><text y={120} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={28} fill={TINTA}>respiração</text></g>
            <g transform="translate(180 -10)"><path d={`M 0,${-80 + Math.sin(lf * 0.4) * 6} C 50,-30 40,60 0,60 C -40,60 -50,-30 0,${-80 + Math.sin(lf * 0.4) * 6} Z`} fill={LARANJA} stroke={TINTA} strokeWidth={5} /><text y={120} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={28} fill={TINTA}>chama</text></g>
            <text x={0} y={10} textAnchor="middle" fontFamily="Anton" fontSize={60} fill={AZUL}>+ O₂</text>
          </g>
        )}
        <SeloCanal f={lf} em={P("Qual") - 2} t="5 SEGUNDOS SEM OXIGÊNIO?" y={330} tam={64} />
      </Tela>
    </AbsoluteFill>
  );
};
