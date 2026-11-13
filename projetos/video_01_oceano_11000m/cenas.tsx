// VÍDEO 01 — 12 cenas (uma por fala do projeto.json). Mundo vertical: superfície em cima, fundo embaixo — nunca invertido.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Camera } from "../../engine/src/kit/Camera";
import { Personagem, ESTILOS_PERSONAGEM, Visual } from "../../engine/src/kit/Personagem";
import { parado } from "../../engine/src/kit/poses";
import { EXPRESSOES } from "../../engine/src/kit/expressoes";
import { chaves, clamp01, eback, eio, eout, lerp, piscar, ramp, rnd } from "../../engine/src/kit/anim";
import { useCena } from "../../engine/src/kit/tempo";
import {
  Agua, FeixesSol, NeveMarinha, Bolhas, Superficie, Regua, SetasPressao, Mergulhador, RostoMergulhador, OuvidoCorte,
  ToraxLateral, SilhuetaCorpo, FundoHadal, Anfipode, Submersivel, corAgua, mix, TINTA, AMARELO, AZUL_SETA, BIO, VERMELHO,
} from "./oceano";

const W = 1080, H = 1920;
type C = React.FC<{ inicio: number; fim: number }>;
const Tela: React.FC<{ children: React.ReactNode; op?: number }> = ({ children, op = 1 }) => <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: op }}>{children}</svg>;
const Letreiro: React.FC<{ f: number; em: number; ate: number; t: string; y: number; tam?: number; cor?: string; sub?: string }> = ({ f, em, ate, t, y, tam = 120, cor = "#ffffff", sub }) => {
  if (f < em || f > ate) return null;
  const s = eback(ramp(f, em, em + 10)) * (1 - eio(ramp(f, ate - 8, ate)));
  return (
    <g transform={`translate(540 ${y}) scale(${s})`}>
      <text textAnchor="middle" fontFamily="Anton" fontSize={tam} fill={cor} stroke={TINTA} strokeWidth={tam * 0.14} paintOrder="stroke" letterSpacing={2}>{t}</text>
      {sub && <text y={tam * 0.62} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={tam * 0.3} fill="#dff6ff" stroke={TINTA} strokeWidth={6} paintOrder="stroke">{sub}</text>}
    </g>
  );
};
const Rotulo: React.FC<{ x: number; y: number; t: string; op: number; cor?: string; fundo?: string; tam?: number }> = ({ x, y, t, op, cor = TINTA, fundo = AMARELO, tam = 40 }) => {
  if (op <= 0) return null;
  const w = t.length * tam * 0.6 + 40;
  return (
    <g transform={`translate(${x} ${y}) scale(${0.85 + 0.15 * op})`} opacity={op}>
      <rect x={-w / 2} y={-tam * 0.85} width={w} height={tam * 1.4} rx={14} fill={fundo} stroke={TINTA} strokeWidth={5} />
      <text y={tam * 0.3} textAnchor="middle" fontFamily="Anton" fontSize={tam} fill={cor}>{t}</text>
    </g>
  );
};
const M = 40; // 1 metro = 40 px nas cenas rasas (superfície em y = 700)
const SUP = 700;

// ================================================================== 01 ABERTURA
export const Cena01: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const tr = eio(ramp(lf, 44, 64)); // rosto → plano aberto
  const desce = eio(ramp(lf, 108, dur));
  const dy = lerp(SUP + 70, SUP + 40 * M, desce);
  const kick = lf * 0.16;
  return (
    <AbsoluteFill style={{ backgroundColor: "#1f9fc0" }}>
      {tr < 1 && (
        <Tela op={1 - tr}>
          <g transform={`translate(540 1000) scale(${1 - 0.7 * tr}) translate(-540 -1000) translate(0 ${-lf * 0.6})`}>
            <RostoMergulhador f={lf} agua={1} tensao={0.5} olhar={[0, 0.75]} />
          </g>
        </Tela>
      )}
      {tr > 0 && (
        <AbsoluteFill style={{ opacity: tr }}>
          <Camera inicio={inicio} chaves={[[44, 560, SUP + 60, 3.2], [72, 540, SUP + 40, 1.0], [108, 540, SUP + 260, 1.0], [dur, 540, dy + 120, 1.1]]} deriva={0}>
            <Agua p={0.12 + desce * 0.12} id="oc01-c1-agua" />
            <Superficie f={lf} y={SUP} />
            <FeixesSol f={lf} x={700} y={SUP} forca={1} />
            <Regua x={110} y0={SUP} y1={SUP + 60 * M} marcas={[0, 10, 20, 30, 40, 50].map((m) => [SUP + m * M, `${m} m`] as [number, string])} op={clamp01(ramp(lf, 90, 110))} />
            <NeveMarinha f={lf} seed="c1" area={[-200, SUP + 40, 1480, 3000]} n={40} />
            <Mergulhador id="oc01-merg-c1" x={540} y={dy} escala={lerp(1.0, 0.62, desce)} ang={lerp(8, 62, desce)} f={lf}
              pose={{ kick, forcaKick: 0.5 + 0.5 * desce, bracoD: [160, 15], bracoE: [168, 8], tensao: 0.4, olhar: [0.5, 0.8] }} />
            <Bolhas f={lf} x={540 + 130} y={dy - 30} n={9} seed="c1m" altura={360} />
            {/* nuvem de microbolhas cruzando a câmera na transição de mergulho */}
            {lf > 96 && lf < 150 && <Bolhas f={lf} x={540} y={SUP + 600} n={26} seed="c1n" altura={700} tam={2.2} op={1 - ramp(lf, 130, 150)} />}
          </Camera>
        </AbsoluteFill>
      )}
      <Tela><Letreiro f={lf} em={P("Onze")} ate={P("Onze") + 108} t="11.000 METROS" y={420} tam={130} /></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 02 A PRESSÃO AUMENTA
export const Cena02: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const u = eio(ramp(lf, 0, dur - 30));
  const dy = SUP + lerp(6, 30, u) * M;
  const dx = 540 + lf * 0.8;
  const prof = (dy - SUP) / M;
  const ajusta = eio(ramp(lf, P("diferença") - 10, P("diferença") + 6)) * (1 - eio(ramp(lf, P("antes"), P("fundo"))));
  const regua = lf > 40 && lf < 110;
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, dx, dy - 40, 1.25], [40, dx - 240, dy - 40, 1.05], [110, dx - 240, dy - 20, 1.05], [P("diferença") - 6, dx + 40, dy - 30, 1.35], [dur, dx + 140, dy - 40, 3.0]]} deriva={0}>
        <Agua p={0.12 + u * 0.1} id="oc01-c2-agua" />
        <FeixesSol f={lf} x={dx + 200} y={SUP - 300} forca={0.85 - u * 0.3} />
        <NeveMarinha f={lf} seed="c2" area={[dx - 1200, SUP, 2600, 2000]} n={60} vy={-0.2} />
        <Regua x={dx - 520} y0={SUP} y1={SUP + 40 * M} marcas={[0, 10, 20, 30].map((m) => [SUP + m * M, `${m} m`] as [number, string])} tam={40} />
        {/* marcador animado na régua */}
        <g transform={`translate(${dx - 520} ${dy})`}><path d="M -30,0 L -60,-22 L -60,22 Z" fill={AMARELO} stroke={TINTA} strokeWidth={4} /><circle r={12} fill={AMARELO} stroke={TINTA} strokeWidth={4} /></g>
        <SetasPressao f={lf} cx={dx} cy={dy - 10} rx={330} ry={200} n={Math.round(6 + prof * 0.45)} forca={0.4 + prof / 40} op={0.75} seed="c2" />
        <Mergulhador id="oc01-merg-c2" x={dx} y={dy} escala={1.3} ang={4 + Math.sin(lf * 0.05) * 2} f={lf}
          pose={{ kick: lf * 0.17, bracoD: [lerp(160, -25, ajusta), lerp(15, -120, ajusta)], bracoE: [165, 10], tensao: 0.2 + ajusta * 0.7, olhar: [0.6, 0] }} />
        <Bolhas f={lf} x={dx + 190} y={dy - 30} n={9} seed="c2m" altura={400} />
      </Camera>
      <Tela>{regua && <text x={540} y={300} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={44} fill="#fff" stroke={TINTA} strokeWidth={7} paintOrder="stroke" opacity={clamp01(ramp(lf, 40, 50)) * (1 - ramp(lf, 100, 110))}>+1 atm a cada 10 m</text>}</Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 03 OUVIDOS E ESPAÇOS DE AR
export const Cena03: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const entra = eio(ramp(lf, 0, 22));
  const dif = chaves(lf, [[10, 0.1], [P("lesões"), 1], [P("espaços"), 0.85], [dur, 0.75]]);
  const alerta = clamp01(ramp(lf, P("lesões") - 6, P("lesões") + 4)) * (1 - ramp(lf, P("cheios"), P("cheios") + 8));
  const ar = 0.6 + 0.4 * Math.sin(Math.max(0, lf - P("espaços")) * 0.25) * clamp01(ramp(lf, P("espaços"), P("espaços") + 6));
  const sai = eio(ramp(lf, dur - 22, dur));
  const engole = Math.max(0, Math.sin((lf - 30) * 0.12)) * (lf > 30 && lf < 120 ? 1 : 0);
  return (
    <AbsoluteFill style={{ backgroundColor: "#155f9a" }}>
      <Camera inicio={inicio} chaves={[[0, 540, 880, 0.9], [P("ouvidos"), 560, 880, 1.15], [P("lesões") + 10, 600, 860, 1.5], [P("espaços"), 560, 870, 1.15], [dur, 540, 880, 1.0]]} deriva={0}>
        <Agua p={0.3} id="oc01-c3-agua" />
        <NeveMarinha f={lf} seed="c3" n={40} />
        <g transform={`translate(${lerp(1400, 560, entra)} 880)`} opacity={1 - sai}>
          <OuvidoCorte f={lf} dif={dif} setas={1} ar={ar} />
          {alerta > 0 && (
            <g transform={`translate(70 -230) scale(${eback(alerta)})`}>
              <path d="M 0,-50 L 48,34 L -48,34 Z" fill={AMARELO} stroke={TINTA} strokeWidth={7} strokeLinejoin="round" />
              <text y={26} textAnchor="middle" fontFamily="Anton" fontSize={58} fill={TINTA}>!</text>
            </g>
          )}
        </g>
        {/* raios de luz nascendo dos traços azuis (transição para a cena 04) */}
        <FeixesSol f={lf} x={540} y={-400} forca={sai} comp={2600} />
      </Camera>
      {/* o mergulhador sai pela esquerda e fica num quadro lateral, equalizando (gesto ilustrativo) */}
      <Tela op={1 - sai}>
        <g transform={`translate(${lerp(540, 205, entra)} ${lerp(960, 1500, entra)}) scale(${lerp(2.2, 1, entra)})`}>
          <clipPath id="oc01-c3-clip"><circle r={165} /></clipPath>
          <circle r={165} fill="#2a8fc0" />
          <g clipPath="url(#oc01-c3-clip)">
            <Mergulhador id="oc01-merg-c3" x={-150} y={70 + engole * 4} escala={1.35} ang={0} f={lf}
              pose={{ kick: lf * 0.1, forcaKick: 0.3, bracoD: [-25, -125], bracoE: [165, 10], tensao: 0.3 + 0.5 * dif, olhar: [0.4, 0.2], cabeca: -engole * 5 }} />
          </g>
          <circle r={165} fill="none" stroke="#e9fbff" strokeWidth={9} />
        </g>
      </Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 04 A LUZ DESAPARECE
export const Cena04: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const u = eio(ramp(lf, 0, dur));
  const p = lerp(0.32, 0.9, u);
  const y = 3000 + u * 2400;
  const clique = P("gelada");
  const acende = clamp01(ramp(lf, clique + 4, clique + 7));
  const mao = eio(ramp(lf, clique - 14, clique)) * (1 - eio(ramp(lf, clique + 8, clique + 22)));
  const abre = eio(ramp(lf, dur - 18, dur));
  const frio = clamp01(ramp(lf, P("gelada") - 4, P("gelada") + 10));
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 540, y - 200, 1.1], [P("Sol"), 520, y - 340, 1.0], [P("oceano"), 520, y - 460, 0.95], [dur, 600, y - 420, 1.0 + abre * 1.2]]} deriva={0}>
        <Agua p={p} id="oc01-c4-agua" />
        <FeixesSol f={lf} x={560} y={y - 1600} forca={clamp01(1 - u * 1.25)} comp={lerp(2400, 900, u)} />
        <NeveMarinha f={lf} seed="c4a" area={[-400, y - 1600, 1900, 2600]} n={50} vy={-1.2} op={0.45} />
        {/* bioluminescência distante (pontos sem espécie definida) */}
        {Array.from({ length: 14 }, (_, i) => {
          const op = clamp01(ramp(u, 0.45, 0.75)) * (0.4 + 0.6 * Math.abs(Math.sin(lf * 0.07 + i * 1.9)));
          return <circle key={i} cx={-200 + rnd(`oc01bio${i}`) * 1500} cy={y - 1200 + rnd(`oc01bioy${i}`) * 1700} r={4 + rnd(`oc01bior${i}`) * 4} fill={i % 3 ? BIO : "#7fb8ff"} opacity={op} />;
        })}
        <Mergulhador id="oc01-merg-c4" x={540} y={y} escala={lerp(1.15, 0.55, u)} ang={lerp(40, 70, u)} f={lf}
          pose={{ kick: lf * 0.15, bracoD: [lerp(150, 10, Math.max(mao, acende)), lerp(20, -40 * mao, Math.max(mao, acende))], bracoE: [lerp(160, 140, mao), 10], lanterna: acende, tensao: 0.3 + frio * 0.4, olhar: [0.8, 0.4] }} />
        <Bolhas f={lf} x={540 + lerp(110, 50, u)} y={y - 60} n={7} seed="c4m" altura={300} tam={lerp(1, 0.6, u)} />
        {/* partículas dançando no cone da lanterna */}
        {acende > 0 && Array.from({ length: 22 }, (_, i) => {
          const r0 = rnd(`oc01cone${i}`), d = 200 + ((r0 * 700 + lf * 2) % 700);
          const a = ((lerp(70, 70, u) + 10 + (rnd(`oc01cona${i}`) - 0.5) * 22) * Math.PI) / 180;
          return <circle key={i} cx={540 + Math.cos(a) * d * lerp(1.15, 0.55, u) + Math.sin(lf * 0.05 + i) * 10} cy={y + Math.sin(a) * d * lerp(1.15, 0.55, u)} r={3 + r0 * 3} fill="#fff8d8" opacity={acende * 0.8} />;
        })}
      </Camera>
      <Tela>
        <text x={540} y={250} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={30} fill="#cfe9ff" opacity={0.8 * clamp01(ramp(lf, 4, 14))} letterSpacing={3}>SIMULAÇÃO EXPLICATIVA</text>
        {abre > 0 && <rect width={W} height={H} fill="#fff6c8" opacity={abre * 0.55} />}
      </Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 05 OS PULMÕES
export const Cena05: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const xray = eio(ramp(lf, P("pulmões") - 6, P("pulmões") + 10));
  const resp = 0.5 + 0.5 * Math.sin(lf * 0.09);
  const pressao = eio(ramp(lf, P("pressão") - 4, P("rapidamente") + 10));
  const painel = clamp01(ramp(lf, P("Sem") - 4, P("Sem") + 8));
  const rBolha = lerp(130, 70, pressao) + Math.sin(lf * 0.2) * 2;
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 540, 900, 1.6], [P("pulmões") + 6, 470, 820, 2.5], [P("Sem") - 2, 470, 830, 2.3], [P("pressão"), 540, 1060, 1.05], [P("risco"), 540, 1300, 1.45], [dur, 540, 1380, 1.9]]} deriva={0}>
        <Agua p={0.9} id="oc01-c5-agua" />
        <path d="M 160,100 L 1100,-400 L 1100,1700 Z" fill="#fff6c8" opacity={0.1} />
        <NeveMarinha f={lf} seed="c5" n={60} />
        <SetasPressao f={lf} cx={470} cy={810} rx={280} ry={150} n={12} forca={0.6} op={xray * (1 - painel * 0.6) * 0.8} seed="c5a" />
        <Mergulhador id="oc01-merg-c5" x={470} y={820} escala={1.55} ang={-4 + Math.sin(lf * 0.04) * 2} f={lf}
          pose={{ kick: lf * 0.08, forcaKick: 0.4, bracoD: [150, 25], bracoE: [160, 15], lanterna: 1, translucido: xray, tensao: 0.4, olhar: [0.5, 0.3] }}
          dentro={<g transform="translate(-10 0) rotate(90) scale(0.3)"><ToraxLateral resp={resp} destaque={xray} /></g>} />
        {/* gráfico separado: bolha de gás perde volume quando a pressão aumenta (qualitativo) */}
        <g transform="translate(540 1330)" opacity={painel}>
          <rect x={-330} y={-250} width={660} height={500} rx={30} fill="#0b2246" stroke="#cfe9ff" strokeWidth={6} opacity={0.92} />
          <circle r={rBolha} fill="#dffbff" fillOpacity={0.35} stroke="#ffffff" strokeWidth={8} />
          <circle cx={-rBolha * 0.35} cy={-rBolha * 0.35} r={rBolha * 0.18} fill="#fff" opacity={0.8} />
          <text y={14} textAnchor="middle" fontFamily="Anton" fontSize={48} fill="#ffffff">GÁS</text>
          <SetasPressao f={lf} cx={0} cy={0} rx={rBolha + 10} ry={rBolha + 10} n={10} forca={0.3 + pressao} op={0.9} seed="c5b" />
          <text y={220} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={28} fill="#9fd4ff">modelo simplificado do gás</text>
        </g>
      </Camera>
    </AbsoluteFill>
  );
};

// ================================================================== 06 O CORPO NÃO É UMA LATA VAZIA
const Recipiente: React.FC<{ x: number; y: number; nivel: number; cor: string; rotulo: string; f: number; setas: number }> = ({ x, y, nivel, cor, rotulo, f, setas }) => {
  const topo = -200 + 330 * nivel; // pistão desce quando nivel aumenta
  return (
    <g transform={`translate(${x} ${y})`}>
      <SetasPressao f={f} cx={0} cy={(topo + 200) / 2} rx={170} ry={230} n={10} forca={0.5 + setas} op={0.8 * Math.min(1, setas * 2)} seed={rotulo} />
      <rect x={-130} y={topo} width={260} height={200 - topo} fill={cor} fillOpacity={0.75} />
      <rect x={-140} y={topo - 30} width={280} height={30} rx={8} fill="#c9d2dc" stroke={TINTA} strokeWidth={6} />
      <rect x={-12} y={topo - 140} width={24} height={110} fill="#c9d2dc" stroke={TINTA} strokeWidth={5} />
      <path d="M -140,-240 L -140,210 C -140,230 140,230 140,210 L 140,-240" fill="none" stroke="#e9fbff" strokeWidth={9} />
      <text y={150} textAnchor="middle" fontFamily="Anton" fontSize={58} fill={TINTA}>{rotulo}</text>
    </g>
  );
};
export const Cena06: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const comp = eio(ramp(lf, P("detalhe"), P("vazia") + 10));
  const sobe = eio(ramp(lf, P("Grande") - 10, P("tecidos")));
  const corpo = clamp01(ramp(lf, P("Grande") - 6, P("tecidos") + 4));
  const rotGas = clamp01(ramp(lf, P("tecidos") + 2, P("tecidos") + 10));
  const rotAgua = clamp01(ramp(lf, P("água") - 2, P("água") + 8));
  const s = lerp(1, 0.62, sobe);
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 540, 820, 1.15], [P("lata"), 540, 820, 1.05], [P("Grande"), 540, 960, 1.0], [dur, 540, 980, 1.04]]} deriva={0}>
        <Agua p={0.88} id="oc01-c6-agua" />
        <NeveMarinha f={lf} seed="c6" n={40} />
        <g transform={`translate(540 ${lerp(820, 470, sobe)}) scale(${s}) translate(-540 -820)`}>
          <Recipiente x={300} y={820} nivel={comp * 0.55} cor={AMARELO} rotulo="AR" f={lf} setas={comp} />
          <Recipiente x={780} y={820} nivel={comp * 0.025} cor="#3aa0ff" rotulo="ÁGUA" f={lf} setas={comp} />
        </g>
        <g transform="translate(540 1360) scale(0.72)" opacity={corpo}>
          <SilhuetaCorpo f={lf} gasCab={rotGas} gasPulmao={rotGas} tecidos={rotAgua} />
        </g>
        <Rotulo x={230} y={1080} t="GÁS" op={rotGas} />
        <path d="M 290,1100 L 470,1170" stroke={AMARELO} strokeWidth={6} opacity={rotGas} />
        <Rotulo x={790} y={1640} t="TECIDOS RICOS EM ÁGUA" op={rotAgua} fundo="#3aa0ff" cor="#fff" tam={36} />
      </Camera>
    </AbsoluteFill>
  );
};

// ================================================================== 07 ONZE MIL METROS
const K = 0.5; // 1 m = 0,5 px na coluna completa
export const Cena07: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const fundoY = 11000 * K;
  const cy = chaves(lf, [[0, 700], [P("região"), 1400], [P("profunda") + 10, 3000], [P("chega"), fundoY - 300], [dur, fundoY - 260]], (t) => t * t * (3 - 2 * t));
  const p = clamp01(cy / fundoY);
  const atm = P("mil") - 4, sai = P("ambiente") + 6;
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 540, cy, 1.0], [dur, 540, cy, 1.0]]} deriva={0.4}>
        <Agua p={0.55 + p * 0.45} id="oc01-c7-agua" />
        <NeveMarinha f={lf} seed="c7" area={[-300, cy - 1200, 1700, 2400]} n={70} vy={-6 * (1 - p)} op={0.5} />
        {/* paredes da fossa aparecendo perto do fundo */}
        <path d={`M -400,${fundoY - 2200} C -100,${fundoY - 1600} 120,${fundoY - 900} 160,${fundoY - 120} L -400,${fundoY + 300} Z`} fill="#0b1a36" stroke="#1c3360" strokeWidth={8} />
        <path d={`M 1500,${fundoY - 2400} C 1150,${fundoY - 1700} 960,${fundoY - 800} 900,${fundoY - 100} L 1500,${fundoY + 300} Z`} fill="#0b1a36" stroke="#1c3360" strokeWidth={8} />
        <FundoHadal f={lf} y0={fundoY} luz={0.25} />
        {/* sedimento levantando suavemente */}
        {Array.from({ length: 16 }, (_, i) => { const u = ((lf * 0.01 + i / 16) % 1); return <circle key={i} cx={300 + rnd(`oc01s7${i}`) * 500} cy={fundoY - 20 - u * 160} r={4} fill="#a9b8d6" opacity={0.4 * (1 - u)} />; })}
        {/* feixe de um veículo distante */}
        <g transform={`translate(860 ${fundoY - 160})`}><path d="M 0,0 L -420,120 L -380,220 Z" fill="#fff6c8" opacity={0.12} /><circle r={10} fill="#fff6c8" /><circle r={28} fill="#fff6c8" opacity={0.25} /></g>
        <Regua x={120} y0={0} y1={fundoY} marcas={Array.from({ length: 12 }, (_, i) => [i * 1000 * K, i ? `${i}.000 m` : "0 m"] as [number, string])} tam={40} />
        <text x={540} y={fundoY + 430} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={34} fill="#9fb6dd" opacity={clamp01(ramp(lf, P("chega"), P("chega") + 10))}>Fossa das Marianas (ilustração)</text>
      </Camera>
      <Tela><Letreiro f={lf} em={atm} ate={sai} t="≈ 1.100 ATM" sub="aproximadamente" y={600} tam={150} cor={AMARELO} /></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 08 ÁGUA, AR E CONSEQUÊNCIAS
export const Cena08: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const g1 = clamp01(ramp(lf, P("gasosos") - 8, P("gasosos") + 4));
  const g2 = clamp01(ramp(lf, P("gasosos") + 12, P("gasosos") + 24));
  const t3 = clamp01(ramp(lf, P("proteção") - 4, P("proteção") + 8));
  const alerta = (em: number) => clamp01(ramp(lf, em, em + 6));
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 540, 960, 1.0], [P("água"), 540, 760, 1.25], [P("gasosos") + 2, 540, 560, 2.0], [P("gasosos") + 24, 540, 880, 1.7], [P("proteção") + 4, 540, 1180, 1.25], [dur, 540, 980, 1.0]]} deriva={0}>
        <Agua p={0.95} id="oc01-c8-agua" />
        <NeveMarinha f={lf} seed="c8" n={50} />
        <SetasPressao f={lf} cx={540} cy={980} rx={330} ry={700} n={22} forca={0.9} op={0.75} seed="c8" />
        <g transform="translate(540 1060) scale(1.15)">
          <SilhuetaCorpo f={lf} gasCab={g1} gasPulmao={g2} tecidos={t3} />
          {[[150, -420, g1], [180, -120, g2]].map(([x, y, a], i) => a > 0 && (
            <g key={i} transform={`translate(${x} ${y}) scale(${eback(a as number) * 0.7})`}>
              <path d="M 0,-40 L 38,28 L -38,28 Z" fill={AMARELO} stroke={TINTA} strokeWidth={6} strokeLinejoin="round" />
              <text y={22} textAnchor="middle" fontFamily="Anton" fontSize={46} fill={TINTA}>!</text>
            </g>
          ))}
        </g>
        <Rotulo x={830} y={560} t="ouvidos e seios da face" op={g1 * (1 - g2)} tam={30} />
        <Rotulo x={830} y={860} t="pulmões" op={g2 * (1 - t3)} tam={34} />
        <Rotulo x={540} y={1740} t="tecidos com água" op={t3 * alerta(P("proteção"))} fundo="#3aa0ff" cor="#fff" tam={34} />
      </Camera>
    </AbsoluteFill>
  );
};

// ================================================================== 09 O SUBMERSÍVEL
const PESQUISADOR: Visual = { pele: "#e0b48f", cabelo: "curto", corCabelo: "#6b4a2b", roupa: "moletom", cor: "#2f6fd6", cor2: "#1f4fa0", calca: "#1f3b70", sapato: "#2a2a2a", corOlho: "#3b2a1a", corpo: "medio" };
export const Cena09: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const sx = lerp(1500, 620, eio(ramp(lf, 0, P("construídos"))));
  const corte = eio(ramp(lf, P("construídos") - 8, P("construídos") + 12));
  const setas = clamp01(ramp(lf, P("resistir") - 4, P("resistir") + 8));
  const bip = Math.sin(lf * 0.4) > 0.6;
  const dentro = (
    <g>
      <g transform="translate(60 150) scale(-1 1)">
        <Personagem id="oc01-pesq" x={-10} y={235} escala={0.36} visual={PESQUISADOR} estilo={ESTILOS_PERSONAGEM.flat}
          pose={{ ...parado(lf, 4), bracoE: [60 + Math.sin(lf * 0.2) * 10, 70], bracoD: [70 + Math.cos(lf * 0.17) * 10, 80], olhar: lf % 90 < 45 ? [1, 0] : [0.3, 0.6], cabecaIncl: Math.sin(lf * 0.05) * 6 }}
          expr={EXPRESSOES.pensativo} olhosAbertos={piscar(lf, 9)} />
        <rect x={40} y={50} width={90} height={60} rx={8} fill="#13233f" stroke="#7d8896" strokeWidth={4} />
        {[0, 1, 2].map((i) => <circle key={i} cx={60 + i * 25} cy={70} r={7} fill={(Math.floor(lf / 10) + i) % 3 ? "#43e08a" : "#ffd23f"} />)}
        <rect x={52} y={88} width={66} height={10} rx={4} fill={bip ? "#7fd6ff" : "#2c4a70"} />
      </g>
    </g>
  );
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 900, 1250, 1.0], [P("construídos") - 10, sx - 40, 1250, 1.0], [P("construídos") + 14, sx - 60, 1300, 1.9], [dur, sx - 60, 1300, 2.0]]} deriva={0}>
        <Agua p={0.97} id="oc01-c9-agua" />
        <NeveMarinha f={lf} seed="c9" area={[-300, 300, 2400, 1800]} n={60} />
        <FundoHadal f={lf} y0={1560} luz={0.35} />
        <Submersivel x={sx} y={1180} f={lf} escala={0.95} dir={-1} corte={corte} braco={0.5 + 0.5 * Math.sin(lf * 0.04)} dentro={dentro} setas={setas} />
      </Camera>
    </AbsoluteFill>
  );
};

// ================================================================== 10 VIDA NAS PROFUNDEZAS
export const Cena10: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const close = clamp01(ramp(lf, P("adaptados") - 4, P("adaptados") + 8)) * (1 - ramp(lf, P("humano"), P("humano") + 8));
  const camX = lerp(380, 760, eio(ramp(lf, 0, dur)));
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, camX, 1380, 1.6], [P("organismos"), camX + 60, 1430, 1.9], [P("humano"), camX + 120, 1350, 1.35], [dur, camX + 160, 1300, 1.2]]} deriva={0}>
        <Agua p={0.97} id="oc01-c10-agua" />
        <path d="M -600,600 L 1800,1100 L 1800,1900 L -600,1700 Z" fill="#fff6c8" opacity={0.08} />
        <FundoHadal f={lf} y0={1560} luz={0.6} />
        <NeveMarinha f={lf} seed="c10" area={[-300, 900, 2200, 1000]} n={70} vy={0.15} op={0.7} />
        {[[200, 1555, 0.9, 1, 0], [520, 1600, 0.7, 1, 1.4], [880, 1530, 0.8, -1, 2.2], [1180, 1590, 0.6, 1, 3]].map(([x, y, s, d, sd], i) => {
          const ax = x + (d as number) * lf * (0.9 + i * 0.2);
          const some = i === 1 ? 1 - clamp01(ramp(ax, 760, 820)) : 1; // um some atrás da dobra do terreno
          return (
            <g key={i} opacity={some}>
              <Anfipode x={ax} y={y} f={lf} escala={s as number} dir={d as number} seed={sd as number} />
              {Array.from({ length: 4 }, (_, k) => { const u = ((lf * 0.03 + k / 4 + i * 0.2) % 1); return <circle key={k} cx={ax - (d as number) * 60 - u * 30 * (d as number)} cy={(y as number) + 30 - u * 70} r={5 + u * 6} fill="#c9d4ec" opacity={0.35 * (1 - u)} />; })}
            </g>
          );
        })}
        {/* dobra do terreno onde um deles some */}
        <path d="M 700,1640 C 760,1560 860,1560 920,1640 Z" fill="#3a4c70" stroke={TINTA} strokeWidth={6} />
      </Camera>
      {close > 0 && (
        <Tela>
          <g transform={`translate(780 560) scale(${eback(close)})`}>
            <clipPath id="oc01-c10-zoom"><circle r={220} /></clipPath>
            <g clipPath="url(#oc01-c10-zoom)">
              <rect x={-240} y={-240} width={480} height={480} fill="#0b1d3d" />
              <rect x={-240} y={60} width={480} height={200} fill="#4d5f82" />
              <Anfipode x={-10} y={40} f={lf} escala={2.3} seed={5} />
            </g>
            <circle r={220} fill="none" stroke="#e9fbff" strokeWidth={8} />
          </g>
          <g opacity={close}><Rotulo x={760} y={850} t="vida adaptada à pressão" op={close} fundo={BIO} tam={36} /></g>
        </Tela>
      )}
    </AbsoluteFill>
  );
};

// ================================================================== 11 O LIMITE HUMANO
export const Cena11: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const y0 = 260, y1 = 1720; // superfície e fundo na régua da cena
  const linhaMerg = eio(ramp(lf, P("pessoa"), P("descida") + 6)); // termina muito antes do fundo
  const fimMerg = y0 + 70;
  const iconOp = 1 - clamp01(ramp(lf, P("descida"), P("descida") + 14));
  const subY = lerp(y0, y1 - 40, eio(ramp(lf, 0, P("pessoa"))));
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 540, 1600, 1.7], [P("apropriadas"), 540, 900, 1.2], [P("pessoa"), 520, 360, 2.4], [P("descida") + 10, 520, 380, 2.2], [P("antes"), 540, 980, 1.0], [dur, 540, 980, 1.0]]} deriva={0}>
        <rect x={-1000} y={-1000} width={3100} height={4000} fill={corAgua(0.85)[1]} />
        <defs><linearGradient id="oc01-c11-col" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3fd0d4" /><stop offset="0.3" stopColor="#155f9a" /><stop offset="1" stopColor="#030a1c" /></linearGradient></defs>
        <rect x={160} y={y0} width={760} height={y1 - y0} fill="url(#oc01-c11-col)" stroke="#cfe9ff" strokeWidth={5} />
        <rect x={160} y={y0 - 120} width={760} height={120} fill="#8fd8ff" />
        <path d={`M 160,${y1} C 300,${y1 - 50} 700,${y1 - 30} 920,${y1} L 920,${y1 + 60} L 160,${y1 + 60} Z`} fill="#25365a" />
        <Regua x={110} y0={y0} y1={y1} marcas={[[y0, "0 m"], [y0 + (y1 - y0) * (5 / 11), "5.000 m"], [y1, "11.000 m"]]} tam={34} />
        {/* trajetória hipotética do mergulhador: interrompe limpa, sem corpo caindo */}
        <line x1={400} y1={y0} x2={400} y2={lerp(y0, fimMerg, linhaMerg)} stroke={VERMELHO} strokeWidth={12} strokeLinecap="round" strokeDasharray="20 12" />
        {linhaMerg >= 1 && <line x1={375} y1={fimMerg} x2={425} y2={fimMerg} stroke={VERMELHO} strokeWidth={10} strokeLinecap="round" />}
        <g opacity={iconOp}><Mergulhador id="oc01-merg-c11" x={400} y={lerp(y0, fimMerg, linhaMerg) - 4} escala={0.22} ang={80} f={lf} pose={{ kick: lf * 0.2, tensao: 0.6 }} /></g>
        <text x={440} y={y0 + 40} fontFamily="Montserrat" fontWeight={900} fontSize={26} fill="#ffffff" opacity={clamp01(ramp(lf, P("descida"), P("descida") + 8))}>sem proteção</text>
        {/* o submersível chega lá (foco secundário) */}
        <line x1={700} y1={y0} x2={700} y2={subY} stroke={AMARELO} strokeWidth={8} opacity={0.75} />
        <g transform={`translate(700 ${subY})`}><circle r={10} fill="#fff6c8" /><circle r={30} fill="#fff6c8" opacity={0.2 + 0.1 * Math.sin(lf * 0.1)} /></g>
        <text x={730} y={y1 - 70} fontFamily="Montserrat" fontWeight={900} fontSize={26} fill={AMARELO}>submersível</text>
      </Camera>
    </AbsoluteFill>
  );
};

// ================================================================== 12 ENCERRAMENTO
export const Cena12: C = ({ inicio, fim }) => {
  const { lf, P, T } = useCena(inicio);
  const dur = fim - inicio;
  const fimNarr = T.fala("c12_final").fim - inicio;
  const perg = fimNarr + 8;
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 720, 1420, 2.3], [P("ainda"), 640, 1280, 1.3], [dur, 560, 1150, 0.95]]} deriva={0}>
        <Agua p={1} id="oc01-c12-agua" />
        <NeveMarinha f={lf} seed="c12" area={[-1200, -200, 3400, 2600]} n={90} vy={0.2} op={0.5} />
        <FundoHadal f={lf} y0={1560} luz={0.22} />
        <path d={`M 700,1420 L ${300 + Math.sin(lf * 0.02) * 60},1700 L ${520 + Math.sin(lf * 0.02) * 60},1720 Z`} fill="#fff6c8" opacity={0.12} />
        <circle cx={700} cy={1420} r={9} fill="#fff6c8" />
        <circle cx={700} cy={1420} r={30 + 4 * Math.sin(lf * 0.1)} fill="#fff6c8" opacity={0.22} />
        <circle cx={686} cy={1408} r={3} fill={Math.sin(lf * 0.2) > 0 ? "#ff5a5a" : "#5a2a2a"} />
      </Camera>
      {/* sedimentos passando perto da lente (camada da frente) */}
      <Tela>
        {Array.from({ length: 10 }, (_, i) => {
          const x = ((rnd(`oc01lente${i}`) * 1300 + lf * (0.6 + rnd(`oc01lv${i}`))) % 1300) - 100;
          return <circle key={i} cx={x} cy={200 + rnd(`oc01ly${i}`) * 1500 + Math.sin(lf * 0.03 + i) * 20} r={8 + rnd(`oc01lr${i}`) * 10} fill="#cfe2ff" opacity={0.18} />;
        })}
        <Letreiro f={lf} em={perg} ate={dur + 100} t="VOCÊ DESCERIA ATÉ LÁ?" y={760} tam={96} cor="#ffffff" />
      </Tela>
    </AbsoluteFill>
  );
};
