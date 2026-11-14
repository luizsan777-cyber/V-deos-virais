// CURIOSIDADE 04 — E se todos no avião pulassem ao mesmo tempo? Hipótese didática (referencial, ação e reação). Sem acidente, sem pânico.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Camera } from "../../engine/src/kit/Camera";
import { Personagem, Visual } from "../../engine/src/kit/Personagem";
import { parado, apontando, pensando, Pose } from "../../engine/src/kit/poses";
import { EXPRESSOES, exprEm } from "../../engine/src/kit/expressoes";
import { chaves, clamp01, eback, eio, eout, lerp, piscar, ramp, rnd } from "../../engine/src/kit/anim";
import { useCena } from "../../engine/src/kit/tempo";
import { Avatar, AVATAR, EST_CANAL, SeloCanal, TarjaCanal, TINTA_CANAL as TINTA } from "../../engine/src/kit/canal";

const W = 1080, H = 1920;
type C = React.FC<{ inicio: number; fim: number }>;
const Tela: React.FC<{ children: React.ReactNode; op?: number }> = ({ children, op = 1 }) => <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: op }}>{children}</svg>;
const AZUL = "#4fb4ff";
const PASS: Visual[] = [
  { pele: "#f0c8a0", cabelo: "longo", corCabelo: "#8a4b22", roupa: "camiseta", cor: "#e4572e", calca: "#333", sapato: "#3a2a20", corpo: "medio" },
  { pele: "#8d5a3b", cabelo: "cacheado", corCabelo: "#1d1210", roupa: "camiseta", cor: "#ffcf3f", calca: "#2b2d42", sapato: "#fff", corpo: "medio" },
  { pele: "#e8c4a8", cabelo: "coque", corCabelo: "#d9d9d9", roupa: "moletom", cor: "#3fae6a", calca: "#4a4a4a", sapato: "#555", corpo: "idoso" },
  { pele: "#5a3826", cabelo: "careca", corCabelo: "#111", roupa: "terno", cor: "#3a4a6a", calca: "#2a3450", sapato: "#111", barba: "curta", corpo: "medio" },
];
const COMISSARIA: Visual = { pele: "#c98f69", cabelo: "coque", corCabelo: "#2a1a10", roupa: "terno", cor: "#1f4fa0", cor2: "#e84d4d", calca: "#1f3b70", sapato: "#111", corpo: "medio" };

const Ceu: React.FC<{ f: number; vel?: number }> = ({ f, vel = 1 }) => (
  <g>
    <defs><linearGradient id="av-ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4fb0ff" /><stop offset="1" stopColor="#d6f0ff" /></linearGradient></defs>
    <rect x={-2000} y={-2000} width={5000} height={5000} fill="url(#av-ceu)" />
    {Array.from({ length: 9 }, (_, i) => { const x = (((rnd(`avn${i}`) * 3000 - f * vel * (2 + rnd(`avv${i}`) * 3)) % 3000) + 3000) % 3000 - 1000; const y = 200 + rnd(`avy${i}`) * 1500; const s = 0.7 + rnd(`avs${i}`); return <g key={i} transform={`translate(${x} ${y}) scale(${s})`} opacity={0.9}><ellipse rx={150} ry={40} fill="#fff" /><ellipse cx={-60} cy={-24} rx={80} ry={40} fill="#fff" /><ellipse cx={50} cy={-30} rx={90} ry={46} fill="#fff" /></g>; })}
  </g>
);
/** avião (vista lateral, voltado para a direita), genérico. Origem no centro da fuselagem. */
const Aviao: React.FC<{ x: number; y: number; s: number; f: number; dy?: number }> = ({ x, y, s, f, dy = 0 }) => (
  <g transform={`translate(${x} ${y + dy}) scale(${s})`}>
    <path d="M -420,-30 L -500,-170 L -440,-170 L -340,-40 Z" fill="#2f6fd6" stroke={TINTA} strokeWidth={8} strokeLinejoin="round" />
    <path d="M -60,20 L -200,170 L -120,170 L 60,30 Z" fill="#c9d2dc" stroke={TINTA} strokeWidth={8} strokeLinejoin="round" />
    <path d="M -480,-60 C -480,-80 -440,-90 -400,-90 L 380,-90 C 470,-90 520,-40 520,0 C 520,40 470,70 380,70 L -400,70 C -440,70 -480,50 -480,30 Z" fill="#f4f6fa" stroke={TINTA} strokeWidth={8} />
    <path d="M 420,-60 C 470,-55 500,-30 505,-10 L 430,-10 Z" fill="#2b3346" />
    {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-330 + i * 60} y={-50} width={30} height={34} rx={12} fill="#7fd6ff" stroke={TINTA} strokeWidth={4} />)}
    <rect x={-480} y={10} width={1000} height={16} fill="#2f6fd6" />
    <path d="M -40,-20 L -160,-120 L -100,-120 L 40,-30 Z" fill="#aeb8c4" stroke={TINTA} strokeWidth={6} opacity={0.8} />
    <ellipse cx={-30} cy={110} rx={70} ry={26} fill="#8a96a8" stroke={TINTA} strokeWidth={6} />
    <circle cx={-470} cy={-150} r={8} fill={Math.sin(f * 0.25) > 0 ? "#ff5a5a" : "#7a2a2a"} />
  </g>
);
/** faixas de vento passando (asas funcionando) */
const Vento: React.FC<{ f: number; y0: number; n?: number }> = ({ f, y0, n = 8 }) => (
  <g>{Array.from({ length: n }, (_, i) => { const x = 1300 - ((f * 14 + i * 230) % 1800); return <line key={i} x1={x} y1={y0 + (i % 4) * 90} x2={x + 160} y2={y0 + (i % 4) * 90} stroke="#ffffff" strokeWidth={6} strokeLinecap="round" opacity={0.7} />; })}</g>
);
/** cabine vista de frente (fileiras de poltronas); passageiros sentados atrás da frente da poltrona */
const Cabine: React.FC<{ f: number; luzCinto?: number; children?: React.ReactNode }> = ({ f, luzCinto = 0, children }) => (
  <g>
    <rect x={-800} y={-800} width={2700} height={3600} fill="#e9eef5" />
    <path d="M -800,300 C 0,120 1080,120 1900,300 L 1900,420 L -800,420 Z" fill="#cfd8e3" stroke={TINTA} strokeWidth={6} />
    {/* janela à direita */}
    <g transform="translate(940 820)"><rect x={-70} y={-110} width={140} height={220} rx={60} fill="#bfe6ff" stroke={TINTA} strokeWidth={8} />{[0, 1].map((i) => <ellipse key={i} cx={((f * 3 + i * 90) % 180) - 90} cy={-20 + i * 50} rx={40} ry={14} fill="#fff" />)}</g>
    {/* aviso de cinto */}
    <g transform="translate(540 500)"><rect x={-80} y={-40} width={160} height={80} rx={14} fill={luzCinto > 0.5 ? "#ffd60a" : "#5a6070"} stroke={TINTA} strokeWidth={6} /><path d="M -40,-14 L 40,-14 M -40,14 L 40,14 M -20,-14 L -20,14 M 20,-14 L 20,14" stroke={TINTA} strokeWidth={6} /></g>
    {/* encostos das poltronas */}
    {[180, 540, 900].map((x, i) => <rect key={i} x={x - 150} y={900} width={300} height={560} rx={50} fill="#2f6fd6" stroke={TINTA} strokeWidth={8} />)}
    {children}
    {/* frente dos assentos (esconde quadril) */}
    {[180, 540, 900].map((x, i) => <g key={i}><rect x={x - 160} y={1440} width={320} height={130} rx={30} fill="#2559b8" stroke={TINTA} strokeWidth={8} /><rect x={x - 175} y={1380} width={30} height={200} rx={12} fill="#9aa6b5" stroke={TINTA} strokeWidth={5} /></g>)}
    <rect x={-800} y={1680} width={2700} height={900} fill="#8a96a8" />
  </g>
);
const Sentado: React.FC<{ v?: Visual; id: string; x: number; f: number; pose?: Partial<Pose>; expr?: typeof EXPRESSOES.neutro; avatar?: boolean; cinto?: number }> = ({ v, id, x, f, pose = {}, expr = EXPRESSOES.neutro, avatar, cinto = 0 }) => {
  const p: Pose = { ...parado(f, x), agachar: 60, bracoE: [14, 30], bracoD: [14, 30], ...pose };
  return (
    <g>
      {avatar ? <Avatar id={id} x={x} y={1700} escala={0.95} pose={p} f={f} expr={expr} /> : <Personagem id={id} x={x} y={1700} escala={0.95} visual={v!} estilo={EST_CANAL} pose={p} expr={expr} olhosAbertos={piscar(f, x)} />}
      {cinto > 0 && <rect x={x - 80} y={1420} width={160} height={22} rx={8} fill="#5a6070" stroke={TINTA} strokeWidth={4} opacity={cinto} />}
    </g>
  );
};
/** corte lateral da cabine (seção) com o piso em yP; dy desloca o "casco" levemente */
const Secao: React.FC<{ f: number; dy?: number; children?: React.ReactNode }> = ({ f, dy = 0, children }) => (
  <g transform={`translate(0 ${dy})`}>
    <path d="M -60,620 C -60,500 60,460 200,460 L 1000,460 C 1100,460 1180,520 1180,620 L 1180,1560 C 1180,1640 1100,1680 1000,1680 L 200,1680 C 60,1680 -60,1640 -60,1560 Z" fill="#f4f6fa" stroke={TINTA} strokeWidth={10} />
    <rect x={0} y={1500} width={1140} height={24} fill="#8a96a8" stroke={TINTA} strokeWidth={5} />
    {[150, 450, 750, 1050].map((x) => <rect key={x} x={x - 40} y={700} width={80} height={120} rx={36} fill="#bfe6ff" stroke={TINTA} strokeWidth={6} />)}
    {children}
  </g>
);

// ================================================================== 01 PERGUNTA DENTRO DO AVIÃO
export const Cena01: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const prepara = clamp01(ramp(lf, P("pulasse") - 6, P("pulasse") + 10));
  const congela = lf >= P("cairia") - 6;
  const sai = eio(ramp(lf, dur - 34, dur));
  if (sai > 0.6) {
    return (
      <AbsoluteFill>
        <Camera inicio={inicio} chaves={[[dur - 34, 540, 960, 2.4], [dur, 540, 960, 1.0]]} deriva={0}>
          <Ceu f={lf} />
          <Aviao x={540} y={960} s={1.0} f={lf} />
        </Camera>
        <Tela><TarjaCanal t="HIPÓTESE" f={lf} /></Tela>
      </AbsoluteFill>
    );
  }
  const b = congela ? 0 : Math.sin(lf * 0.3) * 4 * prepara;
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 760, 1250, 1.6], [P("avião"), 700, 1200, 1.3], [P("pulasse"), 540, 1150, 1.0], [dur - 34, 600, 1150, 1.05]]} deriva={0}>
        <Cabine f={lf}>
          <Sentado v={PASS[0]} id="av-p0" x={180} f={congela ? 0 : lf} pose={{ bob: b, bracoE: [lerp(14, 40, prepara), 40], bracoD: [lerp(14, 40, prepara), 40] }} expr={EXPRESSOES.empolgado} />
          <Sentado v={PASS[1]} id="av-p1" x={540} f={congela ? 0 : lf} pose={{ bob: -b }} expr={EXPRESSOES.feliz} />
          <Sentado avatar id="av-avatar-c1" x={900} f={lf} pose={{ virar: 0.5, olhar: [0.8, -0.2] }} expr={exprEm(lf, [[0, "pensativo"], [P("cairia") - 6, "desconfiado"]])} />
        </Cabine>
      </Camera>
      <Tela>
        <TarjaCanal t="HIPÓTESE" f={lf} />
        {congela && <rect width={W} height={H} fill="#10121f" opacity={0.25} />}
        <SeloCanal f={lf} em={P("cairia") - 4} t="AVIÃO CAI?" x={300} y={360} tam={62} fundo="#ff8c42" />
        <SeloCanal f={lf} em={P("continuaria") - 4} t="TODO MUNDO ACOMPANHA?" x={560} y={520} tam={54} fundo={AZUL} cor="#fff" />
      </Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 02 VELOCIDADE EM CONJUNTO
const Setas: React.FC<{ x: number; y: number; f: number; n?: number; cor?: string; esc?: number }> = ({ x, y, f, n = 3, cor = AZUL, esc = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${esc})`}>{Array.from({ length: n }, (_, i) => <g key={i} transform={`translate(${i * 70 + ((f * 2) % 70)} 0)`} opacity={0.4 + 0.6 * (i / n)}><line x1={0} y1={0} x2={46} y2={0} stroke={cor} strokeWidth={12} strokeLinecap="round" /><path d="M 64,0 L 40,-16 L 40,16 Z" fill={cor} /></g>)}</g>
);
export const Cena02: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const corte = P("avião") - 4;
  if (lf < corte) {
    return (
      <AbsoluteFill>
        <Camera inicio={inicio} chaves={[[0, 540, 960, 1.0], [corte, 540, 960, 1.1]]} deriva={0}>
          <Ceu f={lf} vel={1.4} />
          <Aviao x={540} y={960} s={1.0} f={lf} />
        </Camera>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[corte, 560, 1080, 1.0], [dur, 560, 1100, 1.05]]} deriva={0}>
        <Ceu f={lf} vel={1.4} />
        <Secao f={lf}>
          <Setas x={420} y={560} f={lf} n={4} />
          {[0, 1, 2].map((i) => <g key={i}><Personagem id={`av-s2-${i}`} x={230 + i * 300} y={1500} escala={0.8} visual={PASS[i]} estilo={EST_CANAL} pose={parado(lf, 30 + i)} expr={EXPRESSOES.sereno} olhosAbertos={piscar(lf, 30 + i)} /><Setas x={180 + i * 300} y={1080} f={lf} n={2} esc={0.7} /></g>)}
          <Avatar id="av-avatar-c2" x={1000} y={1500} escala={0.8} pose={parado(lf, 1)} f={lf} expr={EXPRESSOES.pensativo} />
          {/* "ar" da cabine também com setas */}
          {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={100 + ((i * 190 + lf * 1.5) % 1000)} cy={600 + (i % 3) * 60} r={10} fill="#bfe6ff" />)}
        </Secao>
      </Camera>
      <Tela>
        <text x={540} y={1610} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={30} fill={TINTA}>representação simplificada</text>
        <SeloCanal f={lf} em={P("juntos") - 2} t="TUDO VIAJA JUNTO" y={330} tam={66} fundo={AZUL} cor="#fff" />
      </Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 03 SALTO E INÉRCIA (quadro mental)
export const Cena03: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const pulo = Math.sin(clamp01(ramp(lf, P("saltar") - 4, P("saltar") + 26)) * Math.PI);
  const pulo2 = Math.sin(clamp01(ramp(lf, P("avião") - 4, P("avião") + 26)) * Math.PI);
  const h = Math.max(pulo, pulo2) * 40;
  const agacha = Math.max(Math.sin(clamp01(ramp(lf, P("saltar") - 12, P("saltar") - 2)) * Math.PI), Math.sin(clamp01(ramp(lf, P("avião") - 12, P("avião") - 2)) * Math.PI)) * 30;
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 560, 1150, 1.15], [dur, 560, 1150, 1.2]]} deriva={0}>
        <Ceu f={lf} vel={1.4} />
        <Secao f={lf}>
          <rect x={560} y={1490} width={120} height={16} rx={6} fill="#ff8c42" />
          <text x={620} y={1480} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={26} fill={TINTA}>marca</text>
          <Avatar id="av-avatar-c3" x={620} y={1500 - h} escala={0.95} pose={{ ...parado(lf, 1), agachar: agacha, bracoE: [lerp(14, 40, h / 40), 30], bracoD: [lerp(14, 40, h / 40), 30] }} f={lf} expr={exprEm(lf, [[0, "pensativo"], [P("saltar"), "empolgado"], [P("avião"), "feliz"]])} />
        </Secao>
        {/* lá fora: a velocidade horizontal continua */}
        <Setas x={140} y={300} f={lf} n={5} esc={1.2} cor="#ffffff" />
        <text x={540} y={250} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={32} fill={TINTA}>velocidade horizontal (todos juntos)</text>
      </Camera>
      <Tela><text x={540} y={1610} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={28} fill={TINTA}>quadro ilustrativo • não é instrução</text></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 04 AR DA CABINE
export const Cena04: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const traj = eio(ramp(lf, P("Nesse"), P("saiu") + 6));
  const tx = 300 + traj * 70, ty = 1300 - Math.sin(traj * Math.PI) * 180;
  return (
    <AbsoluteFill style={{ backgroundColor: "#e9f3ff" }}>
      <Camera inicio={inicio} chaves={[[0, 560, 1000, 1.0], [P("Nesse"), 520, 1150, 1.15], [dur, 520, 1160, 1.2]]} deriva={0}>
        <rect x={-800} y={-800} width={2700} height={3600} fill="#e9f3ff" />
        <rect x={80} y={500} width={920} height={900} rx={60} fill="#ffffff" stroke={TINTA} strokeWidth={8} />
        {/* redemoinhos discretos do ar interno, acompanhando o avião */}
        {Array.from({ length: 7 }, (_, i) => { const cx = 200 + (i % 4) * 220, cy = 640 + Math.floor(i / 4) * 260; return <path key={i} transform={`rotate(${lf * 2 + i * 40} ${cx} ${cy})`} d={`M ${cx + 40},${cy} A 40,40 0 1 1 ${cx},${cy - 40}`} fill="none" stroke="#9fd0ff" strokeWidth={6} strokeLinecap="round" />; })}
        <Setas x={360} y={560} f={lf} n={4} />
        <rect x={80} y={1320} width={920} height={20} fill="#8a96a8" />
        <rect x={250} y={1310} width={100} height={12} fill="#ff8c42" /><text x={300} y={1380} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={24} fill={TINTA}>saída</text>
        <rect x={320} y={1310} width={100} height={12} fill="#2fbf71" opacity={traj > 0.95 ? 1 : 0.3} /><text x={420} y={1410} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={24} fill={TINTA}>perto</text>
        <path d={`M 300,1300 Q 335,1120 370,1300`} fill="none" stroke="#ff8c42" strokeWidth={5} strokeDasharray="12 10" />
        <circle cx={tx} cy={ty - 60} r={36} fill="#c68e66" stroke={TINTA} strokeWidth={5} />
        <rect x={tx - 30} y={ty - 24} width={60} height={110} rx={24} fill="#262b38" stroke={TINTA} strokeWidth={5} />
        <path d={`M ${tx - 38},${ty - 70} C ${tx - 40},${ty - 110} ${tx + 40},${ty - 110} ${tx + 38},${ty - 70}`} fill="none" stroke="#e53935" strokeWidth={6} />
      </Camera>
      <Tela><SeloCanal f={lf} em={P("Nesse") - 2} t="VOO ESTÁVEL • SIMULAÇÃO" y={330} tam={58} fundo={AZUL} cor="#fff" /></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 05 O AVIÃO SENTE O EMPURRÃO
export const Cena05: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const emp = Math.sin(clamp01(ramp(lf, P("empurram") - 4, P("baixo") + 10)) * Math.PI);
  const reage = Math.sin(clamp01(ramp(lf, P("reage") - 6, P("pouquinho") + 12)) * Math.PI);
  const dy = reage * 4; // deslocamento sutil (exagerado só o bastante para ver)
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 560, 1150, 1.1], [P("empurram"), 600, 1350, 1.5], [P("reage"), 560, 1100, 1.0], [dur, 560, 1100, 1.02]]} deriva={0}>
        <Ceu f={lf} vel={1.4} />
        <Secao f={lf} dy={dy}>
          {[0, 1, 2].map((i) => <Personagem key={i} id={`av-s5-${i}`} x={230 + i * 300} y={1500} escala={0.8} visual={PASS[i]} estilo={EST_CANAL} pose={{ ...parado(lf, 40 + i), agachar: 30 * emp }} expr={EXPRESSOES.pensativo} olhosAbertos={piscar(lf, 40 + i)} />)}
          <Avatar id="av-avatar-c5" x={1000} y={1500} escala={0.8} pose={{ ...parado(lf, 1), agachar: 30 * emp }} f={lf} expr={EXPRESSOES.pensativo} />
          {emp > 0.05 && [230, 530, 830, 1000].map((x) => <g key={x} opacity={emp}><line x1={x} y1={1520} x2={x} y2={1580 + emp * 30} stroke="#ff8c42" strokeWidth={10} strokeLinecap="round" /><path d={`M ${x - 16},${1570 + emp * 30} L ${x},${1600 + emp * 30} L ${x + 16},${1570 + emp * 30} Z`} fill="#ff8c42" /></g>)}
        </Secao>
        {reage > 0.05 && <g opacity={reage}><line x1={1240} y1={900} x2={1240} y2={980} stroke="#2fbf71" strokeWidth={10} strokeLinecap="round" /><path d="M 1224,970 L 1240,1000 L 1256,970 Z" fill="#2fbf71" /></g>}
      </Camera>
      <Tela><SeloCanal f={lf} em={P("reage") - 4} t="REAÇÃO" y={330} tam={80} fundo="#2fbf71" cor="#fff" /></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 06 O QUE MUDA O MOVIMENTO (balança em HyperFrames por cima)
export const Cena06: C = ({ inicio, fim }) => {
  const { lf } = useCena(inicio);
  const dur = fim - inicio;
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 540, 1300, 1.0], [dur * 0.5, 540, 1350, 1.12], [dur, 540, 1300, 1.0]]} deriva={0}>
        <Ceu f={lf} vel={1.4} />
        <Aviao x={540} y={1450} s={0.8} f={lf} />
        <Vento f={lf} y0={1550} />
      </Camera>
    </AbsoluteFill>
  );
};

// ================================================================== 07 PASSAGEIRO É PARTE DO SISTEMA
export const Cena07: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  // dois momentos em câmera lenta: empurrão para sair e chegada ao piso
  const fase = (a: number, b: number) => clamp01(ramp(lf, a, b));
  const sobe = fase(P("pousar") - 30, P("pousar") - 10), desce = fase(P("pousar") - 10, P("pousar") + 10);
  const h = Math.sin(sobe * Math.PI / 2) * 30 * (1 - desce);
  const pose: Pose = { ...parado(lf, 1), bracoD: [165, 10], maoD: "punho", agachar: desce > 0 && desce < 1 ? 20 * Math.sin(desce * Math.PI) : 0 };
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 600, 1200, 1.3], [dur, 600, 1220, 1.35]]} deriva={0}>
        <Ceu f={lf} vel={1.4} />
        <Secao f={lf} dy={Math.sin(desce * Math.PI) * 3}>
          <rect x={300} y={560} width={700} height={18} rx={8} fill="#8a96a8" stroke={TINTA} strokeWidth={4} />
          <Avatar id="av-avatar-c7" x={640} y={1500 - h} escala={0.95} pose={pose} f={lf} expr={EXPRESSOES.pensativo} />
          {sobe > 0 && sobe < 1 && <g><line x1={640} y1={1520} x2={640} y2={1590} stroke="#ff8c42" strokeWidth={10} /><path d="M 624,1580 L 640,1610 L 656,1580 Z" fill="#ff8c42" /></g>}
          {desce > 0 && desce < 1 && <g><line x1={600} y1={1520} x2={600} y2={1600} stroke="#ff8c42" strokeWidth={10} /><path d="M 584,1590 L 600,1620 L 616,1590 Z" fill="#ff8c42" /><line x1={700} y1={1470} x2={700} y2={1390} stroke="#2fbf71" strokeWidth={10} /><path d="M 684,1400 L 700,1370 L 716,1400 Z" fill="#2fbf71" /></g>}
        </Secao>
        <text x={640} y={1650} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={26} fill={TINTA}>câmera lenta • ilustrativo</text>
      </Camera>
      <Tela><SeloCanal f={lf} em={P("forças") - 4} t="AÇÃO E REAÇÃO" y={330} tam={72} /></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 08 SEGURANÇA REAL
export const Cena08: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const luz = clamp01(ramp(lf, P("sinal") - 4, P("sinal")));
  const cinto = eio(ramp(lf, P("Fique") - 4, P("sentado") + 6));
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 600, 1150, 1.15], [P("sinal"), 560, 700, 1.6], [P("siga"), 600, 1150, 1.1], [dur, 620, 1150, 1.12]]} deriva={0}>
        <Cabine f={lf} luzCinto={luz}>
          <Sentado v={PASS[2]} id="av-p8a" x={180} f={lf} expr={EXPRESSOES.sereno} cinto={1} />
          <Sentado v={PASS[3]} id="av-p8b" x={540} f={lf} expr={EXPRESSOES.sereno} cinto={cinto} />
          <Sentado avatar id="av-avatar-c8" x={900} f={lf} pose={{ olhar: [-0.3, -0.5] }} expr={EXPRESSOES.sereno} cinto={cinto} />
        </Cabine>
        <Personagem id="av-comissaria" x={lerp(-200, 360, eout(ramp(lf, P("siga") - 30, P("siga")))) } y={1760} escala={1.0} visual={COMISSARIA} estilo={EST_CANAL}
          pose={lf > P("siga") ? { ...apontando(lf, 150, 9), olhar: [0.4, -0.6] } : parado(lf, 9)} expr={EXPRESSOES.feliz} olhosAbertos={piscar(lf, 9)} />
      </Camera>
      <Tela><SeloCanal f={lf} em={P("tripulação") - 4} t="SIGA A TRIPULAÇÃO" y={330} tam={70} fundo="#ffd60a" /></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 09 FECHO
export const Cena09: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const fora = P("Você") - 10;
  if (lf < fora) {
    return (
      <AbsoluteFill>
        <Camera inicio={inicio} chaves={[[0, 880, 1100, 1.6], [fora - 14, 940, 820, 2.0], [fora, 940, 820, 6.0]]} deriva={0}>
          <Cabine f={lf}>
            <Sentado avatar id="av-avatar-c9" x={900} f={lf} pose={{ virar: 0.6, olhar: [1, -0.3] }} expr={EXPRESSOES.sereno} cinto={1} />
          </Cabine>
        </Camera>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[fora, 540, 960, 2.2], [fora + 30, 540, 960, 1.0], [dur, 540, 960, 0.95]]} deriva={0}>
        <Ceu f={lf} vel={1.2} />
        <Aviao x={540} y={960} s={0.95} f={lf} />
        <Setas x={140} y={760} f={lf} n={4} cor="#2f6fd6" />
        <Setas x={640} y={1180} f={lf} n={3} cor="#2f6fd6" />
      </Camera>
    </AbsoluteFill>
  );
};
