// VÍDEO 03 — E se ninguém mais pudesse morrer? 12 cenas (hipótese FICTÍCIA). Um único protagonista envelhece ao longo do vídeo.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Camera } from "../../engine/src/kit/Camera";
import { Personagem } from "../../engine/src/kit/Personagem";
import { parado, falando, andando, apontando, surpreso, bracosAoAlto, pensando, encolhendoOmbros, poseEm, misturaPose, Pose } from "../../engine/src/kit/poses";
import { EXPRESSOES, exprEm, misturaExpr } from "../../engine/src/kit/expressoes";
import { chaves, clamp01, eback, eio, eout, lerp, piscar, ramp, rnd, wobble } from "../../engine/src/kit/anim";
import { useCena } from "../../engine/src/kit/tempo";
import {
  TINTA, EST, mix, Protagonista, MEDICA, ENFERMEIRO, Fig, Monitor, Leito, PacienteDeitado, Relogio, Arvore, Predio, Guindaste, Carro, Ceu, Mapa,
} from "./mundo";

const W = 1080, H = 1920;
type C = React.FC<{ inicio: number; fim: number }>;
const Tela: React.FC<{ children: React.ReactNode; op?: number }> = ({ children, op = 1 }) => <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: op }}>{children}</svg>;
const Letreiro: React.FC<{ f: number; em: number; ate: number; t: string; y: number; tam?: number; cor?: string; fundo?: string }> = ({ f, em, ate, t, y, tam = 72, cor = "#ffffff", fundo = TINTA }) => {
  if (f < em || f > ate) return null;
  const s = eback(ramp(f, em, em + 9)) * (1 - eio(ramp(f, ate - 7, ate)));
  const w = t.length * tam * 0.5 + 70;
  return (
    <g transform={`translate(540 ${y}) scale(${s})`}>
      <rect x={-w / 2} y={-tam * 0.9} width={w} height={tam * 1.35} rx={18} fill={fundo} opacity={0.9} />
      <text y={tam * 0.25} textAnchor="middle" fontFamily="Anton" fontSize={tam} fill={cor} letterSpacing={1}>{t}</text>
    </g>
  );
};
const piso = (y: number, cor: string) => <rect x={-1500} y={y} width={5000} height={1500} fill={cor} />;
const parede = (cor: string) => <rect x={-1500} y={-1500} width={5000} height={5000} fill={cor} />;

// ================================================================== 01 O IMPOSSÍVEL ACONTECE
export const Cena01: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const vira = eio(ramp(lf, P("ninguém") - 6, P("ninguém") + 6));
  const espanto = P("morrer") - 2;
  const entra = eio(ramp(lf, P("Parece") - 10, P("Parece") + 20));
  const janelas = clamp01(ramp(lf, P("presente") - 4, P("presente") + 12));
  const ouro = clamp01(ramp(lf, espanto, espanto + 30));
  const morph = eio(ramp(lf, dur - 14, dur));
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 760, 640, 3.2], [36, 760, 640, 3.5], [60, 600, 1180, 1.05], [P("Parece"), 620, 1160, 1.0], [dur - 14, 640, 1150, 1.05], [dur, 760, 640, 3.6]]} deriva={0}>
        {parede("#dfeaf2")}
        <rect x={-1500} y={1000} width={5000} height={14} fill="#b9c9d6" />
        {piso(1720, "#c7d3dd")}
        <g transform="translate(220 560)"><rect x={-140} y={-180} width={280} height={360} rx={10} fill="#a8d8f0" stroke={TINTA} strokeWidth={10} /><line x1={0} y1={-180} x2={0} y2={180} stroke={TINTA} strokeWidth={8} /></g>
        <rect x={-1500} y={-1500} width={5000} height={5000} fill="#ffd36b" opacity={ouro * 0.12} />
        <g transform="translate(760 640)"><Monitor f={lf} ouro={ouro} /></g>
        <line x1={760} y1={790} x2={760} y2={1300} stroke="#9aa6b5" strokeWidth={10} />
        <Leito x={620} y={1420} />
        <PacienteDeitado x={600} y={1360} f={lf} />
        <Personagem id="im03-medica" x={230} y={1760} escala={1.05} visual={MEDICA} estilo={EST}
          pose={poseEm(lf, [[0, (x) => ({ ...parado(x, 3), virar: 0.6, olhar: [0.8, -0.6] })], [P("ninguém") - 4, (x) => ({ ...parado(x, 3), virar: 0.3, olhar: [0.6, 0.5], cabecaIncl: 6 * vira })], [espanto, (x) => ({ ...apontando(x, 120, 3), virar: 0.5, olhar: [0.8, -0.6] })]], 7)}
          expr={exprEm(lf, [[0, "pensativo"], [espanto, "surpreso"], [P("presente"), "maravilhado"]], 6)} olhosAbertos={piscar(lf, 3)} />
        <g opacity={entra}>
          <Personagem id="im03-enfermeiro" x={lerp(1250, 980, entra)} y={1760} escala={1.0} dir={-1} visual={ENFERMEIRO} estilo={EST}
            pose={entra < 1 ? andando(lf, 1.4, 5) : surpreso(lf, 5)} expr={EXPRESSOES.surpreso} olhosAbertos={piscar(lf, 5)} />
        </g>
      </Camera>
      {/* o mesmo fenômeno em vários lugares do planeta, ao mesmo tempo */}
      {janelas > 0 && (
        <Tela op={1 - morph}>
          {[[200, 330, "#ffe7b0"], [880, 330, "#d6f5d0"], [180, 1150, "#d0e8ff"], [900, 1120, "#ffd6e0"]].map(([x, y, c], i) => (
            <g key={i} transform={`translate(${x} ${y}) scale(${eback(clamp01(janelas * 1.6 - i * 0.2))})`}>
              <circle r={120} fill={c as string} stroke={TINTA} strokeWidth={8} />
              <g transform="scale(0.42)"><Monitor f={lf + i * 13} ouro={ouro} /></g>
              <circle r={130} fill="none" stroke="#ffd36b" strokeWidth={6} opacity={0.6 + 0.4 * Math.sin(lf * 0.2 + i)} />
            </g>
          ))}
        </Tela>
      )}
      <Tela><Letreiro f={lf} em={8} ate={100} t="E SE NINGUÉM MAIS MORRESSE?" y={250} tam={64} /></Tela>
      {morph > 0 && <AbsoluteFill style={{ backgroundColor: "#0d1a24", opacity: morph }} />}
    </AbsoluteFill>
  );
};

// ================================================================== 02 A NOTÍCIA SE ESPALHA
const Sala: React.FC<{ f: number; x0: number; tv: React.ReactNode }> = ({ f, x0, tv }) => (
  <g transform={`translate(${x0} 0)`}>
    <rect x={0} y={0} width={1080} height={1720} fill="#f6e3c0" />
    <rect x={0} y={1720} width={1080} height={400} fill="#b88c62" />
    <g transform="translate(540 780)">{tv}</g>
    <rect x={380} y={930} width={320} height={40} fill="#6b4a3a" />
    <rect x={120} y={1380} width={840} height={240} rx={50} fill="#e07a5f" stroke={TINTA} strokeWidth={9} />
    <rect x={100} y={1560} width={880} height={140} rx={30} fill="#c4614a" stroke={TINTA} strokeWidth={9} />
  </g>
);
const TV: React.FC<{ f: number; manchete: number; w?: number }> = ({ f, manchete, w = 520 }) => (
  <g>
    <rect x={-w / 2} y={-w * 0.32} width={w} height={w * 0.6} rx={14} fill="#1b2230" stroke={TINTA} strokeWidth={10} />
    <rect x={-w / 2 + 16} y={-w * 0.32 + 16} width={w - 32} height={w * 0.6 - 32} fill="#2b4a7a" />
    <circle cx={-w * 0.2} cy={-w * 0.05} r={w * 0.09} fill="#f0c8a0" />
    <rect x={-w * 0.29} y={w * 0.03} width={w * 0.18} height={w * 0.1} fill="#e4572e" />
    <rect x={-w / 2 + 16} y={w * 0.14} width={w - 32} height={w * 0.1} fill="#e4572e" opacity={manchete} />
    <text x={0} y={w * 0.215} textAnchor="middle" fontFamily="Anton" fontSize={w * 0.075} fill="#fff" opacity={manchete}>NINGUÉM MAIS MORRE</text>
    <rect x={w * 0.05} y={-w * 0.2} width={w * 0.17} height={w * 0.12} fill="#ffd36b" opacity={0.6 + 0.4 * Math.sin(f * 0.2)} />
  </g>
);
export const Cena02: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const fam = P("Famílias") - 8, gov = P("governos") - 8, hosp = P("hospitais") - 10;
  const red = Math.round((fam + gov) / 2) + 6; // redação entre a sala e o gabinete (mesmo dia)
  const mapaOp = 1 - eio(ramp(lf, fam - 8, fam + 4));
  const camX = chaves(lf, [[fam, 540], [red - 8, 540], [red + 6, 1660], [gov + 2, 1660], [gov + 14, 2780], [hosp - 2, 2780], [hosp + 12, 3900], [dur, 3940]]);
  const manchete = clamp01(ramp(lf, fam + 6, fam + 12));
  const pulo = (k: number) => Math.abs(Math.sin(lf * 0.25 + k)) * 18;
  return (
    <AbsoluteFill style={{ backgroundColor: "#bfe6f5" }}>
      {mapaOp > 0 && (
        <AbsoluteFill style={{ opacity: mapaOp }}>
          <Camera inicio={inicio} chaves={[[0, 540, 520, 2.2], [P("planeta"), 560, 560, 1.4], [fam, 560, 560, 1.3]]} deriva={0}>
            <Mapa f={lf} linhas={ramp(lf, P("notícia"), P("planeta") + 10)} />
          </Camera>
          <Tela><text x={540} y={1180} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={30} fill={TINTA} opacity={0.7}>mapa ilustrativo</text></Tela>
        </AbsoluteFill>
      )}
      {mapaOp < 1 && (
        <AbsoluteFill style={{ opacity: 1 - mapaOp }}>
          <Camera inicio={inicio} chaves={[[0, camX, 1150, 1.0], [dur, camX, 1150, 1.0]]} deriva={0.4}>
            <rect x={-200} y={0} width={5000} height={2200} fill="#e9dcc8" />
            {/* SALA DA FAMÍLIA */}
            <Sala f={lf} x0={0} tv={<TV f={lf} manchete={manchete} />} />
            <Fig id="im03-fam1" i={0} x={330} y={1720 - pulo(0)} escala={0.95} f={lf} pose={{ ...bracosAoAlto(lf, 1), virar: 0.3 }} expr={EXPRESSOES.empolgado} />
            <Fig id="im03-fam2" i={1} x={580} y={1720 - pulo(1)} escala={1.0} f={lf} pose={{ ...parado(lf, 2), bracoE: [70, 40], bracoD: [70, 40], virar: -0.3 }} expr={EXPRESSOES.feliz} />
            <Fig id="im03-fam3" i={9} x={780} y={1720 - pulo(2)} escala={1.0} f={lf} pose={bracosAoAlto(lf, 3)} expr={EXPRESSOES.empolgado} />
            {/* porta */}
            <rect x={1040} y={500} width={80} height={1220} fill="#7a5638" stroke={TINTA} strokeWidth={8} />
            {/* REDAÇÃO */}
            <rect x={1120} y={0} width={1080} height={1720} fill="#2c3550" />
            <rect x={1120} y={1720} width={1080} height={400} fill="#1b2236" />
            {[0, 1, 2].map((i) => <g key={i} transform={`translate(${1320 + i * 330} 640)`}><TV f={lf + i * 7} manchete={manchete} w={300} /></g>)}
            <rect x={1300} y={1360} width={720} height={60} fill="#5a6a8a" stroke={TINTA} strokeWidth={8} />
            <Fig id="im03-jornalista" i={6} x={1520} y={1720} escala={1.0} f={lf} pose={falando(lf, 7, 0.9)} expr={EXPRESSOES.empolgado} boca={0.5 + 0.5 * Math.sin(lf * 0.8)}
              itemD={<g><rect x={-6} y={-40} width={12} height={50} fill="#333" /><circle cy={-46} r={14} fill="#555" /></g>} />
            <Fig id="im03-tecnico" i={2} x={1860} y={1720} escala={0.95} f={lf} pose={{ ...parado(lf, 8), bracoE: [40, 70], bracoD: [40, 70], olhar: [0, -0.7] }} expr={EXPRESSOES.pensativo} />
            <rect x={2160} y={500} width={80} height={1220} fill="#3a3a4a" stroke={TINTA} strokeWidth={8} />
            {/* GABINETE DO GOVERNO */}
            <rect x={2240} y={0} width={1080} height={1720} fill="#e8e0d0" />
            <rect x={2240} y={1720} width={1080} height={400} fill="#6b5240" />
            <rect x={2600} y={300} width={360} height={200} fill="#2e5a8a" stroke={TINTA} strokeWidth={8} />
            <rect x={2400} y={1380} width={760} height={50} fill="#5a3a2a" stroke={TINTA} strokeWidth={8} />
            {[0, 1, 2].map((k) => <rect key={k} x={2480 + k * 220} y={1356} width={120} height={20} fill="#fff" stroke={TINTA} strokeWidth={3} transform={`rotate(${Math.sin(lf * 0.1 + k) * 4} ${2540 + k * 220} 1366)`} />)}
            <Fig id="im03-gov1" i={3} x={2480} y={1720} escala={1.0} f={lf} pose={apontando(lf, 140, 4)} expr={EXPRESSOES.desconfiado} />
            <Fig id="im03-gov2" i={8} x={2780} y={1720} escala={0.95} f={lf} pose={pensando(lf, 5)} expr={EXPRESSOES.pensativo} />
            <Fig id="im03-gov3" i={0} x={3080} y={1720} escala={1.0} dir={-1} f={lf} pose={falando(lf, 6, 0.8)} expr={EXPRESSOES.surpreso} boca={0.4 + 0.4 * Math.sin(lf * 0.7)} />
            <rect x={3280} y={500} width={80} height={1220} fill="#7a7a8a" stroke={TINTA} strokeWidth={8} />
            {/* CORREDOR DO HOSPITAL */}
            <rect x={3360} y={0} width={1300} height={1720} fill="#dfeaf2" />
            <rect x={3360} y={1720} width={1300} height={400} fill="#c7d3dd" />
            <rect x={3360} y={980} width={1300} height={14} fill="#7fd6c7" />
            {(() => {
              const mx = 3560 + ((lf - hosp) > 0 ? (lf - hosp) * 4 : 0);
              return (
                <g>
                  <g transform={`translate(${mx + 170} 1520)`}><rect x={-200} y={-30} width={400} height={50} rx={14} fill="#f2f6fa" stroke={TINTA} strokeWidth={7} /><circle cx={-160} cy={60} r={18} fill={TINTA} /><circle cx={160} cy={60} r={18} fill={TINTA} /><rect x={-170} y={20} width={14} height={40} fill="#9aa6b5" /><rect x={156} y={20} width={14} height={40} fill="#9aa6b5" /></g>
                  <Personagem id="im03-enf2" x={mx - 60} y={1720} escala={0.95} visual={ENFERMEIRO} estilo={EST} pose={{ ...andando(lf, 1.4, 9), bracoD: [80, 10], bracoE: [80, 10] }} expr={EXPRESSOES.pensativo} olhosAbertos={piscar(lf, 9)} />
                  <Personagem id="im03-med2" x={mx + 420} y={1720} escala={1.0} visual={MEDICA} estilo={EST} pose={falando(lf, 10, 0.7)} expr={EXPRESSOES.pensativo} olhosAbertos={piscar(lf, 10)} boca={0.3 + 0.3 * Math.sin(lf * 0.7)} />
                </g>
              );
            })()}
            <rect x={4200} y={300} width={300} height={90} rx={12} fill="#e4572e" opacity={0.6 + 0.4 * Math.sin(lf * 0.3)} />
            <text x={4350} y={362} textAnchor="middle" fontFamily="Anton" fontSize={50} fill="#fff">ALERTA</text>
          </Camera>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// ================================================================== 03 O PRIMEIRO PROBLEMA
export const Cena03: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const corte = P("Doenças") - 6;
  if (lf < corte) {
    const vel = lf < P("sofrer") - 10 ? 1 : lerp(1, 0.3, ramp(lf, P("sofrer") - 10, P("sofrer") + 6));
    const x = 120 + lf * 3.4 * (0.4 + 0.6 * vel);
    const porta = eio(ramp(lf, corte - 14, corte));
    return (
      <AbsoluteFill>
        <Camera inicio={inicio} chaves={[[0, x + 140, 1200, 1.15], [corte - 16, x + 200, 1180, 1.25], [corte, 1180, 1150, 2.6]]} deriva={0}>
          <Ceu t={0.05} id="im03-c3-ceu" f={lf} />
          {/* fundo da cidade (parallax mais lento) */}
          <g transform={`translate(${x * 0.3} 0)`}>{Array.from({ length: 8 }, (_, i) => <Predio key={i} x={-300 + i * 260} base={1500} w={200} h={400 + (i % 3) * 180} cor={["#9ccfe8", "#f2c6a0", "#c9b8e8"][i % 3]} prog={1} seed={`c3b${i}`} />)}</g>
          {/* hospital */}
          <g>
            <rect x={900} y={700} width={600} height={1020} fill="#f4f7fa" stroke={TINTA} strokeWidth={9} />
            <rect x={1130} y={760} width={140} height={140} fill="#e4572e" /><rect x={1180} y={780} width={40} height={100} fill="#fff" /><rect x={1150} y={810} width={100} height={40} fill="#fff" />
            <rect x={1120} y={1420} width={160} height={300} fill="#a8d8f0" stroke={TINTA} strokeWidth={8} />
            <rect x={1120} y={1420} width={80 - porta * 76} height={300} fill="#cfe9ff" stroke={TINTA} strokeWidth={5} />
            <rect x={1200 + porta * 76} y={1420} width={80 - porta * 76} height={300} fill="#cfe9ff" stroke={TINTA} strokeWidth={5} />
          </g>
          {piso(1720, "#9aa3ad")}
          <rect x={-1500} y={1700} width={5000} height={20} fill="#c9ced6" />
          {/* pessoas esperando atendimento no banco */}
          <rect x={1300} y={1590} width={260} height={24} fill="#7a5638" stroke={TINTA} strokeWidth={5} />
          <Fig id="im03-esp1" i={4} x={1360} y={1760} escala={0.8} f={lf} pose={{ ...parado(lf, 11), agachar: 60, bracoE: [20, 50], bracoD: [20, 50] }} expr={EXPRESSOES.triste} />
          <Fig id="im03-esp2" i={5} x={1500} y={1760} escala={0.8} f={lf} pose={{ ...parado(lf, 12), agachar: 60, bracoD: [40, 90] }} expr={EXPRESSOES.desconfiado} />
          <Protagonista id="im03-prot-c3" x={x} y={1760} escala={0.95} idade={0} f={lf}
            pose={{ ...andando(lf, 1.6 * vel, 1), virar: lf > P("sofrer") - 10 ? 0.6 : 0, olhar: lf > P("sofrer") - 10 ? [1, 0] : [0.3, 0] }}
            expr={exprEm(lf, [[0, "neutro"], [P("sofrer") - 8, "pensativo"]])} />
        </Camera>
      </AbsoluteFill>
    );
  }
  const k = lf - corte;
  const raio = clamp01(ramp(lf, P("ferimentos") - 4, P("ferimentos") + 6)) * (1 - ramp(lf, P("acontecendo") + 4, P("acontecendo") + 14));
  const espelho = eio(ramp(lf, dur - 26, dur));
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[corte, 540, 1150, 1.6], [corte + 14, 700, 1150, 1.0], [dur - 26, 1000, 1150, 1.0], [dur, 1500, 900, 3.0]]} deriva={0}>
        {parede("#e4eef5")}
        <rect x={-1500} y={980} width={5000} height={16} fill="#7fd6c7" />
        {piso(1720, "#c7d3dd")}
        {[200, 900].map((x, i) => <g key={i}><rect x={x} y={600} width={300} height={380} fill="#bfe0f0" stroke={TINTA} strokeWidth={7} /><text x={x + 150} y={570} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={30} fill={TINTA}>{i ? "REABILITAÇÃO" : "EXAMES"}</text></g>)}
        {/* espelho do corredor */}
        <g transform="translate(1500 900)"><rect x={-150} y={-220} width={300} height={440} rx={150} fill="#cfe9ff" stroke="#9a7a3a" strokeWidth={14} /><path d="M -80,-120 L -20,-170" stroke="#fff" strokeWidth={10} opacity={0.6} /></g>
        {/* cadeira de rodas com acompanhante */}
        {(() => {
          const cx = 100 + k * 3;
          return (
            <g>
              <Fig id="im03-cadeira" i={8} x={cx} y={1700} escala={0.85} f={lf} pose={{ ...parado(lf, 14), agachar: 70, bracoE: [30, 60], bracoD: [30, 60] }} expr={EXPRESSOES.sereno} />
              <g transform={`translate(${cx} 1640)`}><circle r={70} fill="none" stroke={TINTA} strokeWidth={10} /><line x1={-60} y1={0} x2={60} y2={0} stroke={TINTA} strokeWidth={4} transform={`rotate(${k * 6})`} /><rect x={-70} y={-120} width={130} height={20} fill="#3a4250" /></g>
              <Fig id="im03-acomp" i={6} x={cx - 180} y={1760} escala={0.95} f={lf} pose={{ ...andando(lf, 1.2, 15), bracoD: [80, 10], bracoE: [80, 10] }} expr={EXPRESSOES.sereno} />
            </g>
          );
        })()}
        <Personagem id="im03-med3" x={760} y={1760} escala={1.0} visual={MEDICA} estilo={EST} pose={{ ...falando(lf, 16, 0.5), bracoE: [50, 100] }} expr={EXPRESSOES.pensativo} olhosAbertos={piscar(lf, 16)}
          itemE={<rect x={-30} y={-40} width={60} height={80} fill="#fff" stroke={TINTA} strokeWidth={4} />} />
        {/* paciente sentado com transparência anatômica simples (ilustrativa) */}
        <rect x={1020} y={1590} width={200} height={24} fill="#7a5638" stroke={TINTA} strokeWidth={5} />
        <Fig id="im03-pac3" i={1} x={1110} y={1760} escala={0.85} f={lf} pose={{ ...parado(lf, 17), agachar: 60, bracoD: [20, 80] }} expr={EXPRESSOES.triste} />
        {raio > 0 && (
          <g transform="translate(1110 1390)" opacity={raio}>
            <ellipse rx={90} ry={110} fill="#0d1b3a" opacity={0.8} stroke="#7fd0ff" strokeWidth={5} />
            <path d="M -10,-70 C -60,-70 -70,-10 -60,30 C -40,40 -20,30 -10,10 Z" fill="#ff9fb0" /><path d="M 10,-70 C 60,-70 70,-10 60,30 C 40,40 20,30 10,10 Z" fill="#ff9fb0" />
            <circle cx={0} cy={-10} r={18 + Math.sin(lf * 0.4) * 2} fill="#e4572e" />
            <circle cx={40} cy={50} r={14} fill="#ffd23f" opacity={0.6 + 0.4 * Math.sin(lf * 0.3)} />
          </g>
        )}
        <Protagonista id="im03-prot-c3b" x={lerp(540, 1380, espelho)} y={1760} escala={0.95} idade={0} f={lf}
          pose={{ ...(espelho > 0 ? andando(lf, 1.2, 1) : parado(lf, 1)), virar: espelho > 0 ? 0.5 : 0.3, olhar: [0.6, 0] }} expr={EXPRESSOES.pensativo} />
      </Camera>
      {espelho > 0.85 && <AbsoluteFill style={{ backgroundColor: "#cfe9ff", opacity: (espelho - 0.85) / 0.15 }} />}
    </AbsoluteFill>
  );
};

// ================================================================== 04 ENVELHECIMENTO
export const Cena04: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  // 4 marcos claros, interpolados de forma contínua (mesmo rosto)
  const idade = chaves(lf, [[14, 0], [P("milhões"), 0.3], [P("séculos"), 0.55], [P("antes"), 0.8], [dur - 24, 0.95]]);
  const toque = eio(ramp(lf, 10, 30));
  const olhaCam = eio(ramp(lf, dur - 34, dur - 22));
  const vel = 1 + idade * 14;
  const tRel = lf * 0.02 * vel * (1 + lf / 60);
  const roda = eio(ramp(lf, dur - 18, dur));
  const epoca = idade < 0.3 ? 0 : idade < 0.6 ? 1 : 2;
  const pose: Pose = { ...parado(lf, 1), bracoD: [lerp(10, 120, toque), lerp(10, 40, toque)], olhar: [0, lerp(-0.1, 0, olhaCam)] };
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 540, 900, 1.9], [20, 560, 960, 1.15], [dur - 20, 560, 960, 1.2], [dur, 930, 430, 4.5]]} deriva={0}>
        {parede(["#f3e2c8", "#dfe7d8", "#d8dcef"][epoca])}
        {Array.from({ length: 14 }, (_, i) => <rect key={i} x={-300 + i * 120} y={-200} width={6} height={2200} fill="#000" opacity={0.04} />)}
        {piso(1720, ["#b88c62", "#8f9c86", "#8a8fb0"][epoca])}
        {/* janela que muda de estilo com as épocas */}
        <g transform="translate(170 560)">
          <rect x={-130} y={-220} width={260} height={440} rx={epoca === 2 ? 40 : 6} fill={epoca === 2 ? "#3a3f7a" : "#a8d8f0"} stroke={TINTA} strokeWidth={10} />
          {epoca < 2 && <line x1={0} y1={-220} x2={0} y2={220} stroke={TINTA} strokeWidth={8} />}
          {Array.from({ length: 3 + epoca * 2 }, (_, i) => <rect key={i} x={-120 + i * 50} y={220 - (80 + ((i * 53) % 120) + epoca * 40)} width={40} height={80 + ((i * 53) % 120) + epoca * 40} fill={epoca === 2 ? "#6a70c0" : "#7a8aa8"} opacity={0.8} />)}
        </g>
        {/* relógio girando e calendário trocando */}
        <Relogio x={930} y={430} r={110} t={tRel} />
        <g transform="translate(930 760)">
          <rect x={-90} y={-80} width={180} height={170} rx={10} fill="#fff" stroke={TINTA} strokeWidth={7} />
          <rect x={-90} y={-80} width={180} height={44} fill="#e4572e" />
          {Array.from({ length: 3 }, (_, i) => {
            const fl = (tRel * 0.5 + i / 3) % 1;
            return <rect key={i} x={-80} y={-30} width={160} height={110} fill="#fdf6e6" stroke="#ccc" strokeWidth={2} transform={`rotate(${-fl * 70} -80 -30)`} opacity={1 - fl} />;
          })}
          <text y={50} textAnchor="middle" fontFamily="Anton" fontSize={70} fill={TINTA}>{1 + Math.floor(tRel * 3) % 28}</text>
        </g>
        {/* espelho com o reflexo (mesmo personagem envelhecendo) */}
        <g>
          <rect x={300} y={560} width={480} height={1160} rx={240} fill="#cfe9ff" stroke="#9a7a3a" strokeWidth={18} />
          <clipPath id="im03-espelho"><rect x={309} y={569} width={462} height={1142} rx={231} /></clipPath>
          <g clipPath="url(#im03-espelho)">
            <rect x={300} y={560} width={480} height={1160} fill={mix("#dff0ff", "#e6e0ff", idade)} />
            <Protagonista id="im03-prot-c4" x={540} y={1880} escala={1.35} idade={idade} f={lf} pose={pose}
              expr={exprEm(lf, [[0, "neutro"], [P("milhões"), "pensativo"], [P("séculos"), "triste"], [dur - 30, "pensativo"]], 10)} />
            <path d="M 360,700 L 470,600" stroke="#fff" strokeWidth={14} opacity={0.5} />
          </g>
        </g>
        {/* abajur que muda de estilo */}
        <g transform="translate(110 1720)">
          <rect x={-8} y={-520} width={16} height={520} fill={TINTA} />
          {epoca === 0 && <path d="M -80,-520 L 80,-520 L 55,-640 L -55,-640 Z" fill="#ffe0a3" stroke={TINTA} strokeWidth={7} />}
          {epoca === 1 && <circle cx={0} cy={-580} r={70} fill="#fff0c8" stroke={TINTA} strokeWidth={7} />}
          {epoca === 2 && <rect x={-20} y={-700} width={40} height={180} rx={20} fill="#c8e8ff" stroke={TINTA} strokeWidth={7} />}
        </g>
      </Camera>
      {roda > 0.7 && <AbsoluteFill style={{ backgroundColor: "#fff8e6", opacity: (roda - 0.7) / 0.3 }} />}
    </AbsoluteFill>
  );
};

// ================================================================== 05 NASCIMENTOS CONTINUAM
const CarrinhoBebe: React.FC<{ x: number; y: number; f: number; gira: number }> = ({ x, y, f, gira }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M -90,-150 C -90,-230 40,-240 60,-150 Z" fill="#7fd6c7" stroke={TINTA} strokeWidth={7} />
    <rect x={-100} y={-150} width={200} height={90} rx={30} fill="#9be3d5" stroke={TINTA} strokeWidth={7} />
    <line x1={100} y1={-140} x2={160} y2={-220} stroke={TINTA} strokeWidth={8} />
    {[-60, 60].map((wx, i) => <g key={i} transform={`translate(${wx} -20) rotate(${gira})`}><circle r={34} fill="#fff8e6" stroke={TINTA} strokeWidth={7} />{[0, 60, 120].map((a) => <line key={a} x1={-30} y1={0} x2={30} y2={0} stroke={TINTA} strokeWidth={3} transform={`rotate(${a})`} />)}</g>)}
  </g>
);
export const Cena05: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const anda = lf * 2.2;
  const tl = eio(ramp(lf, P("Com") - 10, dur)); // time-lapse das gerações
  const B = 1720;
  const predios = [[-260, 220, 520, "#f2c6a0"], [40, 200, 700, "#9ccfe8"], [1100, 240, 820, "#c9b8e8"], [1380, 220, 600, "#f7d58a"], [1650, 260, 980, "#a8e0b8"], [-560, 240, 900, "#e8a8a0"]];
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 300, 1520, 1.6], [P("crianças"), 540 + anda * 0.5, 1450, 1.2], [P("Com"), 600, 1250, 0.85], [dur, 640, 1150, 0.62]]} deriva={0}>
        <Ceu t={0.08} id="im03-c5-ceu" f={lf} />
        {predios.map(([x, w, h, c], i) => <Predio key={i} x={x as number} base={B} w={w as number} h={h as number} cor={c as string} prog={clamp01(tl * 2.2 - i * 0.22)} seed={`c5${i}`} estilo={i % 2} />)}
        {/* casa baixa da família */}
        <g transform="translate(160 1720)"><rect x={-200} y={-300} width={400} height={300} fill="#f6e3c0" stroke={TINTA} strokeWidth={9} /><path d="M -240,-300 L 0,-460 L 240,-300 Z" fill="#c4614a" stroke={TINTA} strokeWidth={9} /><rect x={-50} y={-180} width={100} height={180} fill="#7a5638" stroke={TINTA} strokeWidth={7} /></g>
        {/* lojas pequenas */}
        <g transform="translate(820 1720)"><rect x={-130} y={-260} width={260} height={260} fill="#ffe7b0" stroke={TINTA} strokeWidth={8} />{Array.from({ length: 5 }, (_, i) => <rect key={i} x={-130 + i * 52} y={-280} width={52} height={50} fill={i % 2 ? "#e4572e" : "#fff"} stroke={TINTA} strokeWidth={4} />)}</g>
        {/* praça com a árvore (âncora de continuidade em todo o vídeo) */}
        <rect x={420} y={1700} width={280} height={30} rx={14} fill="#7fc46a" />
        <Arvore x={560} y={1710} s={0.9 + tl * 0.5} f={lf} />
        {piso(1720, "#a3a9b2")}
        <rect x={-1500} y={1790} width={5000} height={16} fill="#f6f6f6" />
        {/* linha de transporte que surge */}
        {tl > 0.4 && <rect x={-1500} y={1600} width={5000} height={14} fill="#5a6a8a" opacity={clamp01((tl - 0.4) * 4)} />}
        {tl > 0.5 && <g transform={`translate(${((lf * 9) % 3400) - 1200} 1590)`} opacity={clamp01((tl - 0.5) * 4)}><Carro x={0} y={0} cor="#2fb3c9" f={lf} tipo={1} /></g>}
        {/* família saindo: adulto com carrinho, outro de mãos dadas com a criança */}
        <Fig id="im03-pai5" i={1} x={260 + anda} y={1800} escala={0.85} f={lf} pose={{ ...andando(lf, 1.5, 21), bracoD: [80, 10], bracoE: [80, 10] }} expr={EXPRESSOES.feliz} />
        <CarrinhoBebe x={400 + anda} y={1800} f={lf} gira={anda * 1.6} />
        <Fig id="im03-mae5" i={0} x={110 + anda} y={1800} escala={0.85} f={lf} pose={{ ...andando(lf, 1.5, 22), bracoD: [40, 0] }} expr={EXPRESSOES.feliz} />
        <Fig id="im03-cri5" i={9} x={10 + anda} y={1800} escala={0.75} f={lf} pose={{ ...andando(lf, 1.8, 23), bracoE: [40, 0] }} expr={EXPRESSOES.empolgado} />
        {/* pedestres e carros de outras gerações */}
        {tl > 0.2 && [0, 1, 2, 3].map((k) => <Fig key={k} id={`im03-ped5-${k}`} i={2 + k} x={((k * 600 + lf * (2 + k * 0.4)) % 2600) - 800} y={1810} escala={0.7} f={lf} pose={andando(lf, 1.6, 30 + k)} expr={EXPRESSOES.neutro} />)}
        {[0, 1].map((k) => <Carro key={k} x={((k * 1300 - lf * 6) % 3000 + 3000) % 3000 - 900} y={1900} cor={["#e4572e", "#ffcf3f"][k]} f={lf} dir={-1} />)}
      </Camera>
      <Tela><Letreiro f={lf} em={P("gerações") - 4} ate={P("gerações") + 56} t="GERAÇÕES" y={300} tam={90} /></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 06 ESPAÇO E RECURSOS
export const Cena06: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const B = 1720;
  const painel = clamp01(ramp(lf, P("faltariam") - 4, P("faltariam") + 8)) * (1 - ramp(lf, P("cidades"), P("cidades") + 10));
  const fila = Math.floor(lf / 40);
  const sai = eio(ramp(lf, dur - 16, dur));
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 640, 600, 0.62], [P("recursos"), 600, 900, 0.8], [P("faltariam"), 560, 1500, 1.1], [P("cidades"), 700, 1520, 1.15], [dur - 16, 900, 1520, 1.2], [dur, 1180, 1500, 2.8]]} deriva={0}>
        <Ceu t={0.15} id="im03-c6-ceu" f={lf} />
        {[[-900, 260, 1700, "#d6a0b8"], [-560, 240, 1500, "#e8a8a0"], [-260, 220, 1300, "#f2c6a0"], [40, 200, 1500, "#9ccfe8"], [300, 180, 1150, "#b8d0e8"], [1100, 240, 1600, "#c9b8e8"], [1380, 220, 1400, "#f7d58a"], [1650, 260, 1900, "#a8e0b8"], [1950, 240, 1500, "#9ab8e0"]].map(([x, w, h, c], i) => (
          <Predio key={i} x={x as number} base={B} w={w as number} h={i === 6 ? (h as number) * (0.85 + 0.15 * ramp(lf, 0, dur)) : (h as number)} cor={c as string} prog={i === 6 ? 0.9 + 0.1 * ramp(lf, 0, dur) : 1} seed={`c6${i}`} estilo={i % 3} />
        ))}
        {/* horta vertical */}
        <g>{Array.from({ length: 8 }, (_, i) => <ellipse key={i} cx={300 + ((i % 2) * 60 - 30)} cy={700 + i * 120} rx={46} ry={26} fill={i % 2 ? "#3c9a52" : "#5fc46e"} stroke={TINTA} strokeWidth={4} />)}</g>
        <Guindaste x={1250} base={B - 1300} h={300} ang={-8 + Math.sin(lf * 0.03) * 10} carga={0.5 + 0.5 * Math.sin(lf * 0.04)} />
        {/* praça e árvore de antes, agora cercadas */}
        <rect x={420} y={1700} width={280} height={30} rx={14} fill="#7fc46a" />
        <Arvore x={560} y={1710} s={1.4} f={lf} />
        {piso(1720, "#a3a9b2")}
        <rect x={-1500} y={1790} width={5000} height={16} fill="#f6f6f6" />
        <rect x={-1500} y={1860} width={5000} height={40} fill="#3fae6a" opacity={0.6} />
        {/* transporte lotado em camadas */}
        <Carro x={((lf * 7) % 3600) - 1400} y={1600} cor="#2fb3c9" f={lf} tipo={1} />
        <Carro x={2000 - ((lf * 5) % 3600)} y={1680} cor="#e4572e" f={lf} tipo={1} dir={-1} />
        {/* fila no serviço público, avançando */}
        <g><rect x={820} y={1420} width={260} height={300} fill="#e9eef5" stroke={TINTA} strokeWidth={7} /><text x={950} y={1480} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={30} fill={TINTA}>SERVIÇOS</text></g>
        {Array.from({ length: 6 }, (_, k) => <Fig key={k} id={`im03-fila${k}`} i={(k + fila) % 9} x={760 - k * 90 + Math.min(1, (lf % 40) / 20) * 0} y={1800} escala={0.62} f={lf} pose={{ ...parado(lf, 40 + k), cabecaIncl: Math.sin(lf * 0.05 + k) * 4 }} expr={k % 2 ? EXPRESSOES.desconfiado : EXPRESSOES.neutro} />)}
        {/* entrega de alimentos na ciclovia */}
        {(() => { const bx = ((lf * 6) % 3000) - 900; return <g transform={`translate(${bx} 1850)`}><circle cx={-50} cy={0} r={30} fill="none" stroke={TINTA} strokeWidth={7} /><circle cx={50} cy={0} r={30} fill="none" stroke={TINTA} strokeWidth={7} /><path d="M -50,0 L 0,-50 L 50,0 M 0,-50 L 30,-60" stroke={TINTA} strokeWidth={6} fill="none" /><rect x={-80} y={-110} width={70} height={60} fill="#e8a33c" stroke={TINTA} strokeWidth={5} /></g>; })()}
        {/* mercado descarregando caixas */}
        <g transform="translate(1500 1720)"><rect x={-160} y={-220} width={320} height={220} fill="#ffe7b0" stroke={TINTA} strokeWidth={8} />{Array.from({ length: 3 }, (_, i) => { const u = ((lf * 0.02 + i / 3) % 1); return <rect key={i} x={-220 + u * 160} y={-60 - Math.sin(u * Math.PI) * 50} width={50} height={40} fill="#c4844a" stroke={TINTA} strokeWidth={4} />; })}</g>
      </Camera>
      {painel > 0 && (
        <Tela>
          <g transform={`translate(540 360) scale(${eback(painel)})`}>
            <rect x={-420} y={-120} width={840} height={240} rx={24} fill="#fff8e6" stroke={TINTA} strokeWidth={7} />
            <text y={-70} textAnchor="middle" fontFamily="Anton" fontSize={40} fill={TINTA}>DEMANDA POR RECURSOS (ilustrativa)</text>
            {["MORADIA", "ALIMENTO", "ESPAÇO"].map((t, i) => {
              const h = 40 + 60 * clamp01(ramp(lf, P("faltariam") + i * 8, P("faltariam") + 30 + i * 8));
              return <g key={i} transform={`translate(${-260 + i * 260} 90)`}><rect x={-60} y={-h} width={120} height={h} fill={["#e4572e", "#f2b33a", "#4f86e8"][i]} stroke={TINTA} strokeWidth={4} /><text y={-h - 10} textAnchor="middle" fontFamily="Anton" fontSize={34} fill={TINTA}>↑</text><text x={0} y={-h / 2 + 10} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={20} fill="#fff">{t}</text></g>;
            })}
          </g>
        </Tela>
      )}
      {sai > 0.6 && <AbsoluteFill style={{ backgroundColor: "#e9f6f4", opacity: (sai - 0.6) / 0.4 }} />}
    </AbsoluteFill>
  );
};

// ================================================================== 07 A MEDICINA MUDARIA
export const Cena07: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const terapia = Math.sin(lf * 0.09);
  const camX = chaves(lf, [[0, 300], [P("Sem"), 700], [P("aliviar"), 1300], [dur - 20, 1500]]);
  const agenda = eio(ramp(lf, dur - 20, dur));
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, camX, 1200, 1.1], [dur - 20, camX, 1200, 1.15], [dur, 2050, 700, 3.2]]} deriva={0}>
        {parede("#e9f6f4")}
        <rect x={-1500} y={600} width={5000} height={10} fill="#7fd6c7" />
        {piso(1720, "#cfe0e6")}
        {/* salas envidraçadas na lateral */}
        {[0, 1, 2].map((i) => <rect key={i} x={-200 + i * 900} y={700} width={700} height={1020} fill="#d6f0ff" opacity={0.5} stroke="#7fb0c8" strokeWidth={6} />)}
        {/* porta automática */}
        <g transform="translate(-300 1720)"><rect x={-90} y={-520} width={80 - 70 * clamp01(lf / 20)} height={520} fill="#bfe6f5" stroke={TINTA} strokeWidth={5} /><rect x={10 + 70 * clamp01(lf / 20)} y={-520} width={80 - 70 * clamp01(lf / 20)} height={520} fill="#bfe6f5" stroke={TINTA} strokeWidth={5} /></g>
        {/* protagonista idoso recebido pela fisioterapeuta */}
        <Protagonista id="im03-prot-c7" x={300 + Math.min(lf, 60) * 2} y={1760} escala={0.95} idade={0.72} f={lf}
          pose={lf < 60 ? andando(lf, 1.0, 1) : { ...parado(lf, 1), bracoD: [40 + 20 * Math.max(0, terapia), 30] }} expr={exprEm(lf, [[0, "pensativo"], [60, "sereno"]])} />
        <Fig id="im03-fisio" i={7} x={620} y={1760} escala={1.0} dir={-1} f={lf} pose={{ ...falando(lf, 51, 0.6), bracoE: [60, 30] }} expr={EXPRESSOES.feliz} boca={0.3 + 0.3 * Math.sin(lf * 0.6)} />
        {/* outro paciente em movimentos assistidos */}
        <Fig id="im03-pac7" i={4} x={1150} y={1760} escala={0.95} f={lf} pose={{ ...parado(lf, 52), bracoE: [90 + 60 * terapia, 10], bracoD: [90 + 60 * terapia, 10] }} expr={EXPRESSOES.sereno} />
        <Fig id="im03-fisio2" i={2} x={1350} y={1760} escala={0.95} dir={-1} f={lf} pose={{ ...parado(lf, 53), bracoE: [80 + 50 * terapia, 20] }} expr={EXPRESSOES.feliz} />
        {/* médica acompanhando monitor */}
        <g transform="translate(1800 1100)"><Monitor f={lf} w={300} h={200} cor="#7fd6ff" /></g>
        <Personagem id="im03-med7" x={1700} y={1760} escala={1.0} visual={MEDICA} estilo={EST} pose={{ ...apontando(lf, 150, 54), olhar: [0.6, -0.6] }} expr={EXPRESSOES.pensativo} olhosAbertos={piscar(lf, 54)} />
        {/* agenda de turnos no monitor de parede (vira a agenda/leis da cena 08) */}
        <g transform="translate(2050 700)">
          <rect x={-200} y={-140} width={400} height={280} rx={16} fill="#13233f" stroke={TINTA} strokeWidth={8} />
          {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-170 + (i % 4) * 88} y={-100 + Math.floor(i / 4) * 76} width={70} height={56} rx={6} fill={(i + Math.floor(lf / 12)) % 5 ? "#2c4a70" : "#7fd6c7"} />)}
        </g>
      </Camera>
      {agenda > 0.7 && <AbsoluteFill style={{ backgroundColor: "#13233f", opacity: (agenda - 0.7) / 0.3 }} />}
    </AbsoluteFill>
  );
};

// ================================================================== 08 AS REGRAS PRECISARIAM MUDAR
const Icone: React.FC<{ tipo: number }> = ({ tipo }) => (
  <g stroke={TINTA} strokeWidth={5}>
    {tipo === 0 && <g><rect x={-40} y={-24} width={80} height={56} rx={8} fill="#c4844a" /><rect x={-14} y={-38} width={28} height={16} fill="none" /></g>}
    {tipo === 1 && <g><rect x={-34} y={-10} width={68} height={14} fill="#7a5638" /><rect x={-34} y={-40} width={12} height={74} fill="#7a5638" /><rect x={22} y={4} width={12} height={30} fill="#7a5638" /></g>}
    {tipo === 2 && <g><rect x={-34} y={-10} width={68} height={46} fill="#f6e3c0" /><path d="M -44,-10 L 0,-44 L 44,-10 Z" fill="#c4614a" /></g>}
    {tipo === 3 && <path d="M 0,34 C -60,-10 -30,-50 0,-20 C 30,-50 60,-10 0,34 Z" fill="#e4572e" />}
  </g>
);
export const Cena08: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const corte = P("Tudo") - 4;
  const fecha = eio(ramp(lf, dur - 16, dur));
  if (lf < corte) {
    const icones = [P("aposentadorias"), P("trabalho"), P("leis"), P("distribuição")];
    return (
      <AbsoluteFill>
        <Camera inicio={inicio} chaves={[[0, 540, 1100, 1.0], [P("trabalho"), 540, 1000, 1.05], [P("distribuição"), 560, 1250, 1.2], [corte, 560, 1480, 2.2]]} deriva={0}>
          {parede("#e8e0d0")}
          <ellipse cx={540} cy={1700} rx={900} ry={260} fill="#c9b89a" />
          {/* painéis simples com ícones (sem estatísticas) */}
          {["APOSENTADORIA", "TRABALHO", "MORADIA", "SAÚDE"].map((t, i) => {
            const em = icones[i];
            const s = eback(ramp(lf, em - 4, em + 6));
            return (
              <g key={i} transform={`translate(${180 + i * 240} 520) scale(${s})`}>
                <rect x={-105} y={-110} width={210} height={220} rx={18} fill="#fff8e6" stroke={TINTA} strokeWidth={6} />
                <Icone tipo={[1, 0, 2, 3][i]} />
                <text y={88} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={22} fill={TINTA}>{t}</text>
              </g>
            );
          })}
          {/* gráfico abstrato */}
          <g transform="translate(540 820)"><rect x={-200} y={-80} width={400} height={160} rx={14} fill="#fff" stroke={TINTA} strokeWidth={5} /><path d={`M -170,50 C -80,${40 - 30 * Math.sin(lf * 0.05)} 40,-10 170,-50`} stroke="#4f86e8" strokeWidth={8} fill="none" /></g>
          {/* mesa redonda e representantes de várias idades */}
          <ellipse cx={540} cy={1500} rx={460} ry={110} fill="#6b4a3a" stroke={TINTA} strokeWidth={8} />
          {Array.from({ length: 5 }, (_, k) => <rect key={k} x={260 + k * 120} y={1460} width={90} height={60} fill="#fff" stroke={TINTA} strokeWidth={3} transform={`rotate(${(k - 2) * 8 + Math.sin(lf * 0.1 + k) * 3} ${305 + k * 120} 1490)`} />)}
          <Fig id="im03-rep1" i={3} x={170} y={1720} escala={0.95} f={lf} pose={{ ...parado(lf, 61), bracoD: [150 + Math.sin(lf * 0.2) * 6, 10] }} expr={EXPRESSOES.pensativo}
            itemD={<rect x={-36} y={-50} width={72} height={96} fill="#fff" stroke={TINTA} strokeWidth={4} />} />
          <Fig id="im03-rep2" i={4} x={400} y={1730} escala={0.9} f={lf} pose={apontando(lf, 150, 62)} expr={EXPRESSOES.desconfiado} />
          <Fig id="im03-rep3" i={6} x={680} y={1730} escala={0.9} dir={-1} f={lf} pose={{ ...encolhendoOmbros(lf, 63), cabecaIncl: Math.sin(lf * 0.3) * 8 }} expr={EXPRESSOES.bravo} />
          <Fig id="im03-rep4" i={8} x={910} y={1720} escala={0.95} dir={-1} f={lf} pose={falando(lf, 64, 0.7)} expr={EXPRESSOES.pensativo} boca={0.3 + 0.3 * Math.sin(lf * 0.7)} />
        </Camera>
      </AbsoluteFill>
    );
  }
  // a mesa do protagonista: as mesmas mãos em ocupações de épocas diferentes
  const k = lf - corte, dk = dur - corte;
  const ep = Math.min(2, Math.floor((k / dk) * 3));
  const luz = ["#ffe0a3", "#d6f0ff", "#c8b8ff"][ep];
  const idade = [0.45, 0.55, 0.65][ep];
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[corte, 540, 1250, 1.3], [dur - 16, 540, 1200, 1.25], [dur, 540, 1350, 2.6]]} deriva={0.4}>
        {parede(["#f3e2c8", "#dfe7f2", "#dad6f2"][ep])}
        <g transform="translate(860 600)"><rect x={-150} y={-200} width={300} height={400} fill={luz} stroke={TINTA} strokeWidth={10} /><line x1={0} y1={-200} x2={0} y2={200} stroke={TINTA} strokeWidth={6} /></g>
        <path d={`M 710,400 L 280,1500 L 720,1500 L 1010,800 Z`} fill={luz} opacity={0.25} />
        {piso(1720, "#b8a890")}
        <Protagonista id="im03-prot-c8" x={460} y={1700} escala={1.15} idade={idade} f={lf}
          pose={{ ...parado(lf, 1), bracoE: [70 + Math.sin(lf * 0.4) * 6, 60], bracoD: [70 + Math.cos(lf * 0.35) * 6, 60], olhar: [0.2, 0.7] }} expr={EXPRESSOES.pensativo} />
        <rect x={150} y={1450} width={760} height={50} fill="#7a5638" stroke={TINTA} strokeWidth={8} />
        {ep === 0 && <g>{[0, 1].map((i) => <rect key={i} x={360 + i * 120} y={1400} width={110} height={50} fill="#fff" stroke={TINTA} strokeWidth={4} transform={`rotate(${i ? -6 : 4 + Math.sin(lf * 0.2) * 6} ${410 + i * 120} 1425)`} />)}<line x1={480} y1={1390} x2={520} y2={1340} stroke={TINTA} strokeWidth={6} /></g>}
        {ep === 1 && <g><rect x={330} y={1250} width={300} height={190} rx={12} fill="#1b2230" stroke={TINTA} strokeWidth={8} /><rect x={350} y={1270} width={260} height={150} fill="#2b4a7a" /><path d={`M 370,1390 L 430,${1330 + Math.sin(lf * 0.2) * 20} L 500,1360 L 590,1300`} stroke="#7fd6c7" strokeWidth={6} fill="none" /></g>}
        {ep === 2 && <g><circle cx={520} cy={1330} r={90} fill="#c8e8ff" opacity={0.5} stroke="#7fd0ff" strokeWidth={6} /><circle cx={520 + Math.cos(lf * 0.1) * 60} cy={1330 + Math.sin(lf * 0.1) * 30} r={14} fill="#7fd0ff" /></g>}
      </Camera>
      {fecha > 0.5 && <AbsoluteFill style={{ backgroundColor: "#8a96a8", opacity: (fecha - 0.5) / 0.5 }} />}
    </AbsoluteFill>
  );
};

// ================================================================== 09 OS CONFLITOS NÃO DESAPARECERIAM
export const Cena09: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const entrega = eio(ramp(lf, P("injustiças") - 4, P("injustiças") + 20));
  const rosto = P("difíceis") - 10;
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 540, 1350, 0.95], [P("violência"), 600, 1400, 1.1], [P("Conflitos"), 640, 1450, 1.2], [rosto, 640, 1450, 1.2], [dur, 230, 1150, 2.6]]} deriva={0}>
        <Ceu t={0.3} id="im03-c9-ceu" f={lf} />
        {Array.from({ length: 7 }, (_, i) => <Predio key={i} x={-200 + i * 260} base={1600} w={220} h={600 + (i % 3) * 200} cor={["#a8b8d8", "#e8b890", "#b8c8e8"][i % 3]} prog={1} seed={`c9${i}`} />)}
        {piso(1600, "#c9b89a")}
        {/* barreira administrativa baixa no meio da praça */}
        <g>{Array.from({ length: 9 }, (_, i) => <rect key={i} x={620 + i * 0} y={1520 + i * 40} width={16} height={130} fill="#8a96a8" stroke={TINTA} strokeWidth={4} />)}<rect x={560} y={1560} width={140} height={20} fill="#f2b33a" stroke={TINTA} strokeWidth={4} /></g>
        <rect x={600} y={1500} width={60} height={420} fill="#8a96a8" opacity={0.6} stroke={TINTA} strokeWidth={5} />
        {/* dois grupos discutindo acesso a serviços (sem armas, sem agressão) */}
        {[0, 1, 2, 3].map((k) => <Fig key={`a${k}`} id={`im03-gA${k}`} i={k} x={360 - (k % 2) * 140} y={1720 + Math.floor(k / 2) * 120} escala={0.78} f={lf} pose={(lf + k * 20) % 80 < 40 ? falando(lf, 70 + k, 0.9) : apontando(lf, 80, 70 + k)} expr={k % 2 ? EXPRESSOES.bravo : EXPRESSOES.desconfiado} boca={(lf + k * 20) % 80 < 40 ? 0.5 + 0.4 * Math.sin(lf * 0.8) : 0} />)}
        {[0, 1, 2, 3].map((k) => <Fig key={`b${k}`} id={`im03-gB${k}`} i={k + 4} x={900 + (k % 2) * 140} y={1720 + Math.floor(k / 2) * 120} escala={0.78} dir={-1} f={lf} pose={(lf + k * 20 + 40) % 80 < 40 ? falando(lf, 80 + k, 0.9) : encolhendoOmbros(lf, 80 + k)} expr={k % 2 ? EXPRESSOES.desconfiado : EXPRESSOES.bravo} boca={(lf + k * 20 + 40) % 80 < 40 ? 0.5 + 0.4 * Math.sin(lf * 0.8) : 0} />)}
        {/* mediação: mesa de negociação e documento passando de mão em mão */}
        <rect x={500} y={1680} width={260} height={30} fill="#7a5638" stroke={TINTA} strokeWidth={5} />
        <Fig id="im03-mediadora" i={7} x={540} y={1900} escala={0.8} f={lf} pose={{ ...parado(lf, 90), bracoD: [lerp(20, 95, entrega), 10] }} expr={EXPRESSOES.sereno} />
        <Fig id="im03-mediador2" i={3} x={730} y={1900} escala={0.8} dir={-1} f={lf} pose={{ ...parado(lf, 91), bracoD: [lerp(20, 95, clamp01(entrega * 1.4 - 0.4)), 10] }} expr={EXPRESSOES.pensativo} />
        <rect x={lerp(560, 690, entrega) - 30} y={1640} width={60} height={40} fill="#fff" stroke={TINTA} strokeWidth={4} />
        {/* protagonista observa de fora, mãos fechadas de preocupação */}
        <Protagonista id="im03-prot-c9" x={150} y={1900} escala={1.0} idade={0.7} f={lf}
          pose={{ ...parado(lf, 1), maoE: "punho", maoD: "punho", bracoE: [20, 70], bracoD: [20, 70], virar: 0.5, olhar: [Math.sin(lf * 0.05) * 0.6 + 0.4, -0.1] }} expr={misturaExpr(EXPRESSOES.pensativo, EXPRESSOES.triste, 0.5)} />
      </Camera>
    </AbsoluteFill>
  );
};

// ================================================================== 10 O PESO DOS SÉCULOS
export const Cena10: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const ciclo = (lf / dur) * 4; // alguns dias/noites
  const hora = (Math.sin(ciclo * Math.PI * 2 - Math.PI / 2) + 1) / 2;
  const est = Math.floor((lf / dur) * 4) % 4; // estações
  const folha = ["#3c9a52", "#e8a33c", "#c8c8c8", "#6fcf7a"][est];
  const geracao = clamp01(ramp(lf, P("cidades") - 6, P("vezes"))); // prédios antigos descem, novos sobem
  const reflexo = eio(ramp(lf, P("transformar") - 10, P("transformar") + 10));
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 540, 1000, 1.0], [P("Você"), 600, 950, 1.1], [P("transformar"), 360, 920, 2.2], [dur, 360, 900, 2.35]]} deriva={0}>
        {parede("#2a2f4a")}
        {/* janela grande com o bairro em time-lapse */}
        <clipPath id="im03-jan10"><rect x={120} y={260} width={880} height={1200} /></clipPath>
        <g clipPath="url(#im03-jan10)">
          <Ceu t={hora * 0.95} id="im03-c10-ceu" f={lf} />
          {[[200, 200, 600], [420, 180, 500], [640, 220, 700], [860, 200, 560]].map(([x, w, h], i) => (
            <Predio key={`v${i}`} x={x} base={1460} w={w} h={h} cor="#c9a88a" prog={clamp01(1 - geracao * 1.6 + i * 0.15)} seed={`c10v${i}`} noite={hora} estilo={1} />
          ))}
          {[[300, 220, 900], [560, 200, 1100], [800, 240, 800]].map(([x, w, h], i) => (
            <Predio key={`n${i}`} x={x} base={1460} w={w} h={h} cor={["#8fd0e8", "#c9b8f2", "#9fe0c8"][i]} prog={clamp01(geracao * 1.6 - 0.5 - i * 0.12)} seed={`c10n${i}`} noite={hora} estilo={2} />
          ))}
          {/* transporte muda: bonde → trilho elevado */}
          {geracao < 0.5 ? <Carro x={((lf * 8) % 1400) - 200} y={1440} cor="#e4572e" f={lf} tipo={1} /> : <g><rect x={100} y={980} width={1000} height={20} fill="#9aa3b0" /><g transform={`translate(${((lf * 10) % 1400) - 200} 970)`}><rect x={-160} y={-70} width={320} height={70} rx={35} fill="#e8f4ff" stroke={TINTA} strokeWidth={5} /></g></g>}
          <Arvore x={560} y={1460} s={1.2 + (lf / dur) * 0.5} f={lf} folha={folha} />
        </g>
        <rect x={120} y={260} width={880} height={1200} fill="none" stroke="#c8b8a0" strokeWidth={20} />
        <line x1={560} y1={260} x2={560} y2={1460} stroke="#c8b8a0" strokeWidth={12} />
        {/* reflexo do rosto no vidro */}
        <g opacity={0.25 * reflexo}>
          <Protagonista id="im03-prot-c10r" x={380} y={1700} escala={1.1} idade={0.85} f={lf} dir={-1} pose={{ ...parado(lf, 1), virar: -0.4 }} expr={misturaExpr(EXPRESSOES.maravilhado, EXPRESSOES.triste, reflexo * 0.6)} />
        </g>
        {piso(1720, "#1d2238")}
        <Protagonista id="im03-prot-c10" x={260} y={1960} escala={1.25} idade={0.85} f={lf}
          pose={{ ...parado(lf, 1), virar: 0.55, olhar: [0.8, -0.3], bracoD: [lerp(10, 150, eio(ramp(lf, 30, 60))), lerp(10, 30, eio(ramp(lf, 30, 60)))], respirar: lf * 0.08 }}
          expr={misturaExpr(EXPRESSOES.maravilhado, EXPRESSOES.triste, reflexo * 0.6)} />
      </Camera>
    </AbsoluteFill>
  );
};

// ================================================================== 11 PRESENTE PARA UNS, FARDO PARA OUTROS
export const Cena11: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const outros = P("Para", 2) - 6;
  const camX = chaves(lf, [[0, 540], [P("oportunidade"), 900], [outros - 20, 2200], [outros, 2800], [dur - 20, 3400], [dur, 3560]]);
  const vento = Math.sin(lf * 0.08);
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, camX, 1250, 1.05], [dur, camX, 1250, 1.05]]} deriva={0.3}>
        {/* oficina (descoberta, dourado/verde) */}
        <rect x={-600} y={0} width={1800} height={1720} fill="#f8e7b8" />
        {piso(1720, "#b8925e")}
        <rect x={100} y={1380} width={700} height={50} fill="#7a5638" stroke={TINTA} strokeWidth={8} />
        {Array.from({ length: 3 }, (_, i) => <g key={i} transform={`translate(${260 + i * 170} 1340) rotate(${Math.sin(lf * 0.2 + i) * 15})`}><rect x={-30} y={-30} width={60} height={60} fill={["#e4572e", "#3c9a52", "#4f86e8"][i]} stroke={TINTA} strokeWidth={5} /></g>)}
        <Fig id="im03-aprendiz" i={6} x={420} y={1720} escala={1.0} f={lf} pose={{ ...parado(lf, 101), bracoE: [70 + Math.sin(lf * 0.3) * 15, 50], bracoD: [70 + Math.cos(lf * 0.3) * 15, 50], olhar: [0, 0.6] }} expr={EXPRESSOES.empolgado} />
        <Fig id="im03-jovem1" i={9} x={760} y={1720} escala={0.85} dir={-1} f={lf} pose={falando(lf, 102, 0.6)} expr={EXPRESSOES.feliz} boca={0.3 + 0.3 * Math.sin(lf * 0.7)} />
        {/* trem com paisagem em parallax */}
        <rect x={1200} y={0} width={1400} height={1720} fill="#d6f2c8" />
        <g transform={`translate(${-lf * 6 % 600} 0)`}>{Array.from({ length: 8 }, (_, i) => <path key={i} d={`M ${1200 + i * 300},1100 Q ${1350 + i * 300},${900 - (i % 3) * 60} ${1500 + i * 300},1100 Z`} fill="#8fd18a" stroke={TINTA} strokeWidth={6} />)}</g>
        <rect x={1200} y={1100} width={1400} height={620} fill="#c8e0b0" />
        <g transform="translate(1900 1500)"><rect x={-600} y={-330} width={1200} height={380} rx={40} fill="#e8f4ff" stroke={TINTA} strokeWidth={9} />{[0, 1, 2, 3].map((i) => <rect key={i} x={-540 + i * 280} y={-280} width={220} height={170} rx={16} fill="#bfe6f5" stroke={TINTA} strokeWidth={6} />)}</g>
        <g transform="translate(1900 1500)"><Fig id="im03-aprendiz2" i={6} x={-150} y={-60} escala={0.55} f={lf} pose={{ ...parado(lf, 103), virar: 0.6, olhar: [1, 0] }} expr={EXPRESSOES.maravilhado} /></g>
        {/* apartamento isolado (azul-lilás), cortina ao vento */}
        <rect x={2600} y={0} width={1400} height={1720} fill="#3a3560" />
        {piso(1720, "#2a2648")}
        <g transform="translate(3350 800)">
          <rect x={-320} y={-420} width={640} height={840} fill="#6a5fb0" stroke="#c8b8f2" strokeWidth={14} />
          {Array.from({ length: 6 }, (_, i) => <rect key={i} x={-300 + i * 100} y={420 - (200 + (i * 77) % 300)} width={80} height={200 + (i * 77) % 300} rx={30} fill="#9a8fe0" opacity={0.7} />)}
          <path d={`M -330,-430 C ${-300 + vento * 20},-100 ${-330 + vento * 40},200 ${-290 + vento * 30},430 L -240,430 C -270,200 -250,-100 -260,-430 Z`} fill="#c8b8f2" opacity={0.85} />
        </g>
        <Fig id="im03-isolado" i={8} x={3200} y={1760} escala={1.0} f={lf} pose={{ ...parado(lf, 104), virar: 0.6, olhar: [0.8, -0.4], bracoD: [95, 70], respirar: lf * 0.06 }} expr={EXPRESSOES.triste} />
      </Camera>
    </AbsoluteFill>
  );
};

// ================================================================== 12 A PERGUNTA FINAL
export const Cena12: C = ({ inicio, fim }) => {
  const { lf, P, T } = useCena(inicio);
  const dur = fim - inicio;
  const fimNarr = T.fala("c12_pergunta").fim - inicio;
  const hora = lerp(0.45, 1, eio(ramp(lf, 20, fimNarr)));
  const aperta = eio(ramp(lf, P("séculos") - 4, P("séculos") + 6));
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 360, 1050, 2.4], [P("Mas"), 380, 1080, 2.6], [P("séculos"), 500, 1100, 1.4], [dur, 540, 900, 0.75]]} deriva={0}>
        <Ceu t={hora} id="im03-c12-ceu" f={lf} />
        {/* pequena luz que atravessa o céu (fecha o loop com o monitor do começo) */}
        <circle cx={-200 + lf * 6} cy={300 - Math.sin(lf * 0.02) * 60} r={7} fill="#3cff9a" opacity={0.8} />
        {/* cidade imensa, com a árvore e a praça do bairro original diluídas no meio */}
        {Array.from({ length: 26 }, (_, i) => <Predio key={i} x={-1400 + i * 160 + (i % 2) * 30} base={1500 + (i % 3) * 30} w={140 + (i % 4) * 20} h={500 + ((i * 137) % 900)} cor={mix(["#8fa0c8", "#b0a0d8", "#9ac0d8"][i % 3], "#ffb070", (1 - hora) * 0.5)} prog={1} seed={`c12${i}`} noite={hora} estilo={i % 3} />)}
        <rect x={430} y={1520} width={260} height={40} rx={14} fill="#5f9a6a" />
        <Arvore x={560} y={1530} s={1.3} f={lf} />
        {/* terraço com parapeito */}
        <rect x={-1500} y={1720} width={5000} height={1500} fill="#2a2a40" />
        <rect x={-1500} y={1640} width={5000} height={30} fill="#5a5a78" stroke={TINTA} strokeWidth={6} />
        <Protagonista id="im03-prot-c12" x={330} y={1980} escala={1.3} idade={0.9} f={lf}
          pose={{ ...parado(lf, 1), virar: 0.45, olhar: [0.7, -0.2], bracoD: [60, 70], bracoE: [40, 50], maoD: aperta > 0.5 ? "punho" : "aberta", respirar: lf * 0.07 }}
          expr={lf < P("presente") - 6 ? exprEm(lf, [[0, "sereno"], [P("Mas") - 4, "pensativo"]], 10) : misturaExpr(EXPRESSOES.pensativo, EXPRESSOES.triste, clamp01(ramp(lf, P("presente") - 6, P("presente") + 6)) * 0.4)} />
      </Camera>
      <Tela><Letreiro f={lf} em={fimNarr + 6} ate={dur + 100} t="VIDA ETERNA: PRESENTE OU PRISÃO?" y={420} tam={64} /></Tela>
    </AbsoluteFill>
  );
};
