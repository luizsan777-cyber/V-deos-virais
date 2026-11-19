// Cenas do short "Estoy bien" (es-419): CDMX (metrô), Bogotá (chuva), Lima (entardecer), casa (oração), Lima (envio).
// Todos os tempos vêm das palavras reais da narração (useTempos), então as cenas acompanham a voz.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Camera } from "../../engine/src/kit/Camera";
import { Personagem } from "../../engine/src/kit/Personagem";
import { parado, andando, orando, pensando, misturaPose, Pose } from "../../engine/src/kit/poses";
import { EXPRESSOES, misturaExpr } from "../../engine/src/kit/expressoes";
import { clamp01, eio, eout, lerp, piscar, ramp, rnd, wobble } from "../../engine/src/kit/anim";
import { useCena } from "../../engine/src/kit/tempo";
import { sentado } from "../shorts_cristaos_kit/kit";
import { JOVEN, BOGOTA, LIMA, TINTA, Celular, CelularMao, Chuva, digitado, apagado, luzNoite, luzQuente, mixCor, Msg } from "./elenco";

type C = { inicio: number; fim: number };
const cansado = { ...misturaExpr(EXPRESSOES.triste, EXPRESSOES.pensativo, 0.4), palpebra: 0.42 };
const calmo = { ...EXPRESSOES.sereno, palpebra: 0.25 };

// ============================================================ A1 — celular na mão, "Estoy bien" digitado e apagado
export const A1Celular: React.FC<C & { apagaEm: number }> = ({ inicio, fim, apagaEm }) => {
  const { lf } = useCena(inicio);
  const dur = fim - inicio;
  const txt = "Estoy bien";
  const t1 = 36; // termina de digitar
  const rasc = lf < apagaEm ? digitado(txt, lf, -4, 9) : apagado(txt, lf, apagaEm, 12);
  const digitando = lf < t1 || (lf >= apagaEm && rasc.length > 0);
  const polegar = digitando ? Math.sin(lf * 1.3) * 10 : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0d14" }}>
      <Camera chaves={[[0, 540, 900, 1.0], [dur, 540, 880, 1.06]]} deriva={0} mao={0.35}>
        {/* janela do metrô desfocada: túnel escuro com luzes passando */}
        <rect x={-300} y={-300} width={1700} height={2500} fill="#0b1018" />
        {Array.from({ length: 9 }, (_, i) => {
          const x = ((i * 337 + lf * 46) % 1900) - 400;
          return <rect key={i} x={1500 - x} y={180 + (i % 3) * 420} width={260} height={18} rx={9} fill={i % 2 ? "#ffd27a" : "#9ec8ff"} opacity={0.22} />;
        })}
        <rect x={-300} y={1500} width={1700} height={700} fill="#d9692a" opacity={0.25} />
        {/* mão segurando o celular */}
        <g transform="translate(540 760) scale(1.75)">
          <path d="M -168,40 C -200,120 -190,320 -120,420 L 40,420 C 10,330 -60,280 -150,210 Z" fill="#b97f58" stroke={TINTA} strokeWidth={4} />
          <Celular contato="Mamá" hora="21:47" msgs={[{ texto: "¿Cómo estás, mijo?", mio: false }]} rascunho={rasc} cursor={Math.floor(lf / 15) % 2 === 0 || digitando} />
          {[-120, -60, 0].map((y, i) => <rect key={i} x={140} y={y} width={46} height={52} rx={22} fill="#c68e66" stroke={TINTA} strokeWidth={4} />)}
          <path transform={`translate(${70 + polegar} ${250 - Math.abs(polegar) * 0.6}) rotate(-35)`} d="M -24,0 C -26,-60 26,-60 24,0 L 30,120 L -30,120 Z" fill="#c68e66" stroke={TINTA} strokeWidth={4} />
        </g>
      </Camera>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(160,200,255,0.10), rgba(0,0,0,0.55) 85%)" }} />
    </AbsoluteFill>
  );
};

// ============================================================ A2 — vagão: olha o reflexo no vidro; "Dios también te ve ahí"
const Vagao: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x={-300} y={-300} width={1700} height={2500} fill="#d8d3c8" />
    <rect x={-300} y={300} width={1700} height={40} fill="#e07a2a" />
    {/* janela grande */}
    <rect x={60} y={380} width={760} height={640} rx={40} fill="#0b1018" stroke="#9aa0a8" strokeWidth={18} />
    <clipPath id="a2jan"><rect x={60} y={380} width={760} height={640} rx={40} /></clipPath>
    <g clipPath="url(#a2jan)">
      {Array.from({ length: 10 }, (_, i) => {
        const x = ((i * 271 + f * 52) % 1300) - 200;
        return <rect key={i} x={1000 - x} y={430 + ((i * 97) % 520)} width={200 + (i % 3) * 80} height={10} rx={5} fill={i % 3 ? "#ffd27a" : "#9ec8ff"} opacity={0.5} />;
      })}
    </g>
    {/* barras e bancos laranja */}
    <rect x={900} y={-300} width={26} height={2200} fill="#b9bcc2" stroke={TINTA} strokeWidth={5} />
    <rect x={-300} y={1300} width={1700} height={140} rx={30} fill="#e2742a" stroke={TINTA} strokeWidth={7} />
    <rect x={-300} y={1440} width={1700} height={700} fill="#5a5f6a" />
    <rect x={-300} y={1440} width={1700} height={10} fill="#ffd27a" opacity={0.25} />
  </g>
);

export const A2Reflexo: React.FC<C & { deusEm: number }> = ({ inicio, fim, deusEm }) => {
  const { lf } = useCena(inicio);
  const dur = fim - inicio;
  const olha = eio(ramp(lf, 4, 26));
  const luz = eio(ramp(lf, deusEm - 4, deusEm + 30));
  const pose: Pose = sentado(lf, 3, { bracoD: [26, 100], frenteD: true, bracoE: [24, 70], cabecaIncl: lerp(12, 4, olha), virar: lerp(0.1, 0.55, olha), olhar: [lerp(-0.1, 0.85, olha), lerp(0.7, 0.05, olha)] });
  const expr = misturaExpr(cansado, { ...cansado, bocaCurva: 0.05, palpebra: 0.3 }, luz);
  const px = 700, py = 1720, esc = 1.15;
  return (
    <AbsoluteFill style={{ backgroundColor: "#d8d3c8" }}>
      <Camera chaves={[[0, 560, 1080, 1.0], [Math.max(1, deusEm - 6), 520, 1000, 1.12], [dur, 470, 960, 1.28]]} deriva={0}>
        <Vagao f={lf + inicio} />
        {/* reflexo no vidro: o mesmo rosto, espelhado e translúcido */}
        <g clipPath="url(#a2jan)" opacity={0.28 + 0.12 * olha}>
          <g transform={`translate(${2 * 470} 0) scale(-1 1)`}>
            <Personagem id="a2-ref" x={px} y={py - 470} escala={esc * 0.95} dir={-1} visual={JOVEN} estilo={luzNoite(0.2)} pose={pose} expr={expr} olhosAbertos={piscar(lf, 4)} />
          </g>
        </g>
        <g clipPath="url(#a2jan)"><ellipse cx={330} cy={660} rx={260} ry={300} fill="#ffd9a0" opacity={0.22 * luz} /></g>
        <Personagem id="a2-p" x={px} y={py} escala={esc} dir={-1} visual={JOVEN} estilo={luzNoite(0.35 + 0.25 * luz, mixCor("#9ec8ff", "#ffd9a0", luz))} pose={pose} expr={expr} olhosAbertos={piscar(lf, 4)} itemD={<CelularMao luz={0.6} />} />
        {/* frente do banco por cima das pernas */}
        <rect x={380} y={1600} width={760} height={500} rx={30} fill="#d9692a" stroke={TINTA} strokeWidth={7} />
      </Camera>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 40% 35%, rgba(255,214,150,${0.18 * luz}), rgba(0,0,0,0) 60%)` }} />
    </AbsoluteFill>
  );
};

// ============================================================ B — Bogotá: desce do ônibus na chuva e fica sob o abrigo
const RuaBogota: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <defs><linearGradient id="bgceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a1f3d" /><stop offset="1" stopColor="#3b3f66" /></linearGradient></defs>
    <rect x={-400} y={-400} width={1900} height={1700} fill="url(#bgceu)" />
    {/* cerros orientais */}
    <path d="M -400,900 C -100,600 200,560 420,700 C 620,540 900,520 1500,760 L 1500,1100 L -400,1100 Z" fill="#23304a" />
    <circle cx={430} cy={688} r={7} fill="#ffe3a8" opacity={0.8} />
    {/* prédios de tijolo */}
    {[[-300, 420, 520], [160, 300, 600], [520, 360, 480], [900, 420, 640]].map(([x, w, h], i) => (
      <g key={i}>
        <rect x={x} y={1240 - h} width={w} height={h} fill="#7d3b2c" stroke={TINTA} strokeWidth={5} />
        {Array.from({ length: Math.floor(h / 90) * 3 }, (_, k) => <rect key={k} x={x + 30 + (k % 3) * (w / 3.2)} y={1240 - h + 30 + Math.floor(k / 3) * 90} width={44} height={56} fill="#ffcf7a" opacity={rnd(`bw${i}${k}`) > 0.45 ? 0.75 : 0.12} />)}
      </g>
    ))}
    {/* rua molhada com reflexos */}
    <rect x={-400} y={1240} width={1900} height={900} fill="#2a2d3a" />
    {[200, 520, 860].map((x, i) => <rect key={i} x={x} y={1260} width={36} height={420} fill="#ffcf7a" opacity={0.12 + 0.04 * Math.sin(f * 0.2 + i)} />)}
    <rect x={-400} y={1236} width={1900} height={14} fill="#55596a" />
  </g>
);
const Abrigo: React.FC<{ frente?: boolean }> = ({ frente }) => frente ? (
  <g><rect x={80} y={1040} width={16} height={480} fill="#9aa3b0" stroke={TINTA} strokeWidth={4} /></g>
) : (
  <g>
    <rect x={60} y={1010} width={560} height={34} rx={6} fill="#7d8796" stroke={TINTA} strokeWidth={6} />
    <rect x={70} y={1044} width={540} height={20} fill="#cfe0ff" opacity={0.3} />
    <rect x={560} y={1040} width={16} height={480} fill="#9aa3b0" stroke={TINTA} strokeWidth={4} />
    <rect x={430} y={1100} width={110} height={300} rx={8} fill="#ffe9b8" stroke={TINTA} strokeWidth={5} opacity={0.9} />
  </g>
);
const Onibus: React.FC<{ x: number; porta: number }> = ({ x, porta }) => (
  <g transform={`translate(${x} 0)`}>
    <rect x={0} y={760} width={980} height={560} rx={40} fill="#1f5fa8" stroke={TINTA} strokeWidth={8} />
    <rect x={0} y={760} width={980} height={70} rx={30} fill="#174a86" />
    {[0, 1, 2, 3].map((k) => <rect key={k} x={250 + k * 180} y={860} width={150} height={190} rx={14} fill="#ffe1a0" opacity={0.75} stroke={TINTA} strokeWidth={5} />)}
    <rect x={40} y={860} width={170} height={420} rx={10} fill="#ffe1a0" opacity={0.8} />
    <rect x={40 - porta * 80} y={860} width={85} height={420} fill="#2c74c4" stroke={TINTA} strokeWidth={5} />
    <rect x={125 + porta * 80} y={860} width={85} height={420} fill="#2c74c4" stroke={TINTA} strokeWidth={5} />
    {[180, 800].map((cx) => <circle key={cx} cx={cx} cy={1330} r={70} fill="#16181e" stroke={TINTA} strokeWidth={8} />)}
    <rect x={-6} y={1180} width={40} height={30} rx={8} fill="#fff4c8" />
  </g>
);
export const BBogota: React.FC<C> = ({ inicio, fim }) => {
  const { lf } = useCena(inicio);
  const dur = fim - inicio;
  const chega = eout(ramp(lf, 0, 28));
  const porta = eio(ramp(lf, 26, 36));
  const anda = ramp(lf, 34, 74);
  const px = lerp(800, 360, eio(anda)), py = 1520;
  const visivel = lf >= 32;
  const parou = eio(ramp(lf, 70, 84));
  const pose = misturaPose({ ...andando(lf, 1.4, 2), olhar: [-0.6, 0.3] }, { ...pensando(lf, 2), olhar: [0.2, 0.85], cabecaIncl: 12 }, parou);
  const expr = misturaExpr(EXPRESSOES.pensativo, cansado, parou);
  return (
    <AbsoluteFill style={{ backgroundColor: "#1a1f3d" }}>
      <Camera chaves={[[0, 600, 1100, 1.1], [60, 560, 1140, 1.18], [dur, 420, 1180, 1.45]]} deriva={0}>
        <RuaBogota f={lf} />
        <Abrigo />
        <Onibus x={lerp(1500, 720, chega)} porta={porta} />
        {visivel && <Personagem id="b-p" x={px} y={py} escala={1.0} dir={-1} visual={BOGOTA} estilo={luzNoite(0.45, "#ffcf7a")} pose={pose} expr={expr} olhosAbertos={piscar(lf, 6)} />}
        <Abrigo frente />
        <Chuva f={lf} n={110} op={0.6} area={[-300, -300, 1700, 2100]} />
      </Camera>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,12,30,0.35), rgba(10,12,30,0) 40%, rgba(10,12,30,0.4))" }} />
    </AbsoluteFill>
  );
};

// ============================================================ C/F/G — Lima: sala com janela para o mar
const SalaLima: React.FC<{ f: number; noite: number }> = ({ f, noite }) => {
  const c = (a: string, b: string) => mixCor(a, b, noite);
  return (
    <g>
      <defs>
        <linearGradient id="lmceu" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c("#5a4a9a", "#0d1330")} /><stop offset="0.55" stopColor={c("#ff8a5c", "#1c2550")} /><stop offset="1" stopColor={c("#ffd08a", "#2c3462")} />
        </linearGradient>
      </defs>
      <rect x={-400} y={-400} width={1900} height={2600} fill={c("#e9c9a8", "#2a2f4a")} />
      {/* janela grande */}
      <g transform="translate(140 300)">
        <rect x={0} y={0} width={800} height={820} fill="url(#lmceu)" />
        <circle cx={520} cy={560} r={70} fill="#ffe3a0" opacity={1 - noite} />
        <rect x={0} y={590} width={800} height={230} fill={c("#3f5f8a", "#0b1430")} />
        <rect x={430} y={600} width={180} height={8} fill="#ffe3a0" opacity={0.7 * (1 - noite)} />
        {/* falésias da Costa Verde com prédios e luzes */}
        <path d="M 0,520 L 160,500 L 260,540 L 330,600 L 330,820 L 0,820 Z" fill={c("#7a5a50", "#141a30")} />
        {Array.from({ length: 9 }, (_, i) => <rect key={i} x={10 + i * 34} y={420 - (i * 37) % 90} width={26} height={110 + (i * 37) % 90} fill={c("#8a6a7a", "#1c2442")} />)}
        {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={10 + rnd(`lx${i}`) * 320} cy={360 + rnd(`ly${i}`) * 200} r={3 + rnd(`lr${i}`) * 3} fill="#ffd27a" opacity={noite * (0.5 + 0.5 * Math.sin(f * 0.05 + i))} />)}
        {Array.from({ length: 14 }, (_, i) => <circle key={`c${i}`} cx={360 + i * 32} cy={596 + (i % 2) * 6} r={3} fill="#ffe7b0" opacity={noite * 0.8} />)}
        <rect x={0} y={0} width={800} height={820} fill="none" stroke={c("#f4ece2", "#c9c3d8")} strokeWidth={22} />
        <line x1={400} y1={0} x2={400} y2={820} stroke={c("#f4ece2", "#c9c3d8")} strokeWidth={12} />
      </g>
      {/* luz quente da sala à noite */}
      <circle cx={900} cy={1150} r={420} fill="#ffc77a" opacity={0.14 * noite} />
    </g>
  );
};
const Mesa: React.FC<{ noite: number; brilhoTela: number }> = ({ noite, brilhoTela }) => (
  <g>
    <rect x={-400} y={1440} width={1900} height={700} fill={mixCor("#a86a3c", "#4a3242", noite)} stroke={TINTA} strokeWidth={8} />
    <rect x={-400} y={1440} width={1900} height={16} fill="#ffd9a0" opacity={0.3} />
    {/* xícara + celular apoiado */}
    <g transform="translate(650 1440)">
      <path d="M -50,0 L 50,0 L 42,-110 L -42,-110 Z" fill="#f2efe8" stroke={TINTA} strokeWidth={6} />
      <path d="M 44,-90 C 90,-90 90,-30 46,-30" fill="none" stroke={TINTA} strokeWidth={8} />
      <g transform="translate(-90 -6) rotate(-14)">
        <rect x={-36} y={-150} width={72} height={150} rx={10} fill="#1a1c22" stroke={TINTA} strokeWidth={5} />
        <rect x={-30} y={-144} width={60} height={138} rx={6} fill="#d6e6ff" opacity={0.3 + 0.6 * brilhoTela} />
      </g>
    </g>
  </g>
);

export const CLima: React.FC<C & { closeEm: number }> = ({ inicio, fim, closeEm }) => {
  const { lf } = useCena(inicio);
  const dur = fim - inicio;
  if (lf >= closeEm) return <CloseMesa inicio={inicio + closeEm} fim={fim} modo="rascunho" noite={0} />;
  const pose: Pose = { ...pensando(lf, 5), olhar: [0.35, 0.8], cabecaIncl: 10, virar: 0.2 };
  return (
    <AbsoluteFill style={{ backgroundColor: "#e9c9a8" }}>
      <Camera chaves={[[0, 560, 1080, 1.05], [Math.max(1, closeEm), 620, 1220, 1.45]]} deriva={0}>
        <SalaLima f={lf} noite={0} />
        <Personagem id="c-p" x={560} y={1700} escala={1.05} visual={LIMA} estilo={luzQuente(0.55, "#ffb27a")} pose={pose} expr={cansado} olhosAbertos={piscar(lf, 7)} />
        <Mesa noite={0} brilhoTela={1} />
      </Camera>
    </AbsoluteFill>
  );
};

// close do celular apoiado na xícara (Lima): rascunho longo; depois apaga e escreve a pergunta e envia
const RASCUNHO = "Hola, sé que hace tiempo no hablamos y no sé bien cómo decirte esto, pero últimamente";
const PERGUNTA = "¿Tienes un minuto para hablar?";
export const CloseMesa: React.FC<C & { modo: "rascunho" | "envio"; noite: number; apagaEm?: number; escreveEm?: number; enviaEm?: number }> = ({ inicio, fim, modo, noite, apagaEm = 0, escreveEm = 0, enviaEm = 0 }) => {
  const { lf } = useCena(inicio);
  const dur = fim - inicio;
  let rasc = RASCUNHO, sel = 0, msgs: Msg[] = [{ texto: "Hola :) ¿cómo va todo por allá?", mio: false }], chegando = 1;
  if (modo === "rascunho") {
    rasc = RASCUNHO.slice(0, RASCUNHO.length - 8) + digitado(RASCUNHO.slice(-8), lf, 6, 5);
  } else {
    sel = lf >= apagaEm - 10 && lf < apagaEm ? eio(ramp(lf, apagaEm - 10, apagaEm - 4)) : 0;
    if (lf >= apagaEm) rasc = digitado(PERGUNTA, lf, escreveEm, 20);
    if (lf >= apagaEm && lf < escreveEm) rasc = "";
    if (lf >= enviaEm) {
      rasc = "";
      msgs = [...msgs, { texto: PERGUNTA, mio: true, check: clamp01((lf - enviaEm - 10) / 8) }];
      chegando = eout(ramp(lf, enviaEm, enviaEm + 8));
    }
  }
  const tela = (
    <Celular contato="Caro" hora={noite > 0.5 ? "22:31" : "18:04"} msgs={msgs} rascunho={rasc} chegando={chegando} selecao={sel}
      cursor={Math.floor(lf / 15) % 2 === 0} noite={noite > 0.5} />
  );
  const toque = modo === "envio" && lf >= escreveEm && lf < enviaEm ? Math.sin(lf * 1.2) * 8 : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: mixCor("#c98a5a", "#241c30", noite) }}>
      <Camera chaves={[[0, 540, 900, 1.0], [dur, 540, 860, 1.07]]} deriva={0}>
        <rect x={-300} y={-300} width={1700} height={2500} fill={mixCor("#f0b87a", "#1d2038", noite)} />
        <ellipse cx={200} cy={300} rx={500} ry={400} fill={mixCor("#ffd9a0", "#ffcf7a", noite)} opacity={0.35} />
        <rect x={-300} y={1380} width={1700} height={900} fill={mixCor("#a86a3c", "#4a3242", noite)} />
        {/* xícara grande atrás do celular */}
        <g transform="translate(860 1390)">
          <path d="M -150,0 L 150,0 L 126,-330 L -126,-330 Z" fill="#f2efe8" stroke={TINTA} strokeWidth={8} />
          <path d="M 130,-270 C 260,-270 260,-90 140,-90" fill="none" stroke={TINTA} strokeWidth={14} />
          <ellipse cx={0} cy={-330} rx={126} ry={22} fill="#6a4030" stroke={TINTA} strokeWidth={6} />
        </g>
        <g transform="translate(500 800) rotate(-6) scale(1.68)">{tela}</g>
        {modo === "envio" && lf >= escreveEm - 4 && lf < enviaEm + 6 && (
          <path transform={`translate(${700 + toque} ${1250 - Math.abs(toque)}) rotate(-25)`} d="M -30,0 C -32,-70 32,-70 30,0 L 38,200 L -38,200 Z" fill="#a9724c" stroke={TINTA} strokeWidth={5} />
        )}
      </Camera>
    </AbsoluteFill>
  );
};

// ============================================================ D — "Y quizá tú, en otra ciudad": três faixas e a cidade
export const DTres: React.FC<C & { tuEm: number }> = ({ inicio, fim, tuEm }) => {
  const { lf } = useCena(inicio);
  const dur = fim - inicio;
  const abre = eio(ramp(lf, tuEm - 6, tuEm + 14));
  const faixa = (i: number, fundo: string, vis: typeof JOVEN, conteudo: React.ReactNode, cor: string) => {
    const y0 = 120 + i * 560, sinal = i === 0 ? -1 : i === 2 ? 1 : 0;
    return (
      <g key={i} transform={`translate(${i === 1 ? -abre * 1200 : 0} ${sinal * abre * 900})`} opacity={1 - abre * 0.9}>
        <clipPath id={`df${i}`}><rect x={40} y={y0} width={1000} height={520} rx={26} /></clipPath>
        <g clipPath={`url(#df${i})`}>
          <rect x={40} y={y0} width={1000} height={520} fill={fundo} />
          {conteudo}
          <g transform={`translate(${-lf * 0.6} 0)`}>
            <Personagem id={`d-${i}`} x={560} y={y0 + 740} escala={0.95} visual={vis} estilo={luzNoite(0.4, cor)} pose={{ ...parado(lf, i + 2), bracoD: [34, 112], frenteD: true, olhar: [0.2, 0.85], cabecaIncl: 9 }} expr={cansado} olhosAbertos={piscar(lf, i + 3)} itemD={<CelularMao />} />
          </g>
        </g>
        <rect x={40} y={y0} width={1000} height={520} rx={26} fill="none" stroke="#ffffff" strokeOpacity={0.25} strokeWidth={4} />
      </g>
    );
  };
  return (
    <AbsoluteFill style={{ backgroundColor: "#0c1022" }}>
      {/* cidade à noite com muitas janelas: "otra ciudad" */}
      <Camera chaves={[[0, 540, 1000, 1.25], [dur, 560, 940, 1.4]]} deriva={0}>
        <rect x={-300} y={-300} width={1700} height={2500} fill="#0e1430" />
        {Array.from({ length: 9 }, (_, i) => {
          const x = -200 + i * 170, h = 700 + ((i * 211) % 600);
          return <g key={i}><rect x={x} y={1500 - h} width={150} height={h + 600} fill={i % 2 ? "#18204a" : "#1d2756"} />
            {Array.from({ length: Math.floor(h / 70) * 3 }, (_, k) => <rect key={k} x={x + 16 + (k % 3) * 44} y={1500 - h + 24 + Math.floor(k / 3) * 70} width={26} height={36} fill="#ffd27a" opacity={rnd(`dw${i}${k}`) > 0.55 ? 0.8 : 0.08} />)}</g>;
        })}
        <rect x={556} y={1032} width={26} height={36} fill="#fff1c8" opacity={0.4 + 0.6 * abre} />
        <circle cx={569} cy={1050} r={60} fill="#ffd27a" opacity={0.25 * abre} />
      </Camera>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {faixa(0, "#151a2e", JOVEN, <rect x={40} y={180} width={1000} height={260} fill="#0b1018" opacity={0.7} />, "#9ec8ff")}
        {faixa(1, "#232a48", BOGOTA, <Chuva f={lf} n={40} op={0.5} area={[40, 680, 1000, 520]} />, "#ffcf7a")}
        {faixa(2, "#3a2a44", LIMA, <rect x={40} y={1240} width={1000} height={200} fill="#ff8a5c" opacity={0.35} />, "#ffb27a")}
      </svg>
    </AbsoluteFill>
  );
};

// ============================================================ E — em casa: abre a janela, senta, ora
const QuartoCDMX: React.FC<{ f: number; abre: number; ruido: number }> = ({ f, abre }) => (
  <g>
    <rect x={-400} y={-400} width={1900} height={2600} fill="#26305a" />
    <rect x={-400} y={1480} width={1900} height={800} fill="#3a2f4a" />
    {/* janela: vidraça sobe */}
    <g transform="translate(520 300)">
      <rect x={0} y={0} width={480} height={760} fill="#121a3a" />
      {Array.from({ length: 8 }, (_, i) => { const h = 200 + ((i * 113) % 300); return <rect key={i} x={i * 62} y={760 - h} width={56} height={h} fill="#1d2756" />; })}
      <path d="M 300,760 L 300,520 L 312,470 L 324,520 L 324,760 Z" fill="#26305f" />
      {Array.from({ length: 50 }, (_, i) => <circle key={i} cx={rnd(`ex${i}`) * 480} cy={420 + rnd(`ey${i}`) * 340} r={2.5 + rnd(`er${i}`) * 2.5} fill="#ffd27a" opacity={0.4 + 0.5 * Math.abs(Math.sin(f * 0.04 + i))} />)}
      <rect x={0} y={lerp(380, 20, abre)} width={480} height={380} fill="#9ec8ff" opacity={0.16} stroke="#d9dde8" strokeWidth={14} />
      <rect x={0} y={0} width={480} height={760} fill="none" stroke="#d9dde8" strokeWidth={22} />
      <path d={`M -40,-30 C ${10 + abre * 30 * Math.sin(f * 0.06)},250 -20,520 ${-10 + abre * 20 * Math.sin(f * 0.05 + 1)},800 L -90,800 L -90,-30 Z`} fill="#c9a0d8" stroke={TINTA} strokeWidth={5} />
    </g>
    {/* cama e criado-mudo com abajur */}
    <rect x={-300} y={1380} width={900} height={60} rx={26} fill="#8a96c9" stroke={TINTA} strokeWidth={7} />
    <g transform="translate(40 1270)">
      <circle cx={70} cy={-140} r={260} fill="#ffc77a" opacity={0.22} />
      <rect x={0} y={0} width={160} height={210} rx={10} fill="#6a4a3a" stroke={TINTA} strokeWidth={7} />
      <rect x={72} y={-110} width={14} height={110} fill={TINTA} />
      <path d="M 30,-110 L 130,-110 L 108,-180 L 52,-180 Z" fill="#ffe0a0" stroke={TINTA} strokeWidth={6} />
    </g>
  </g>
);
export const ECasa: React.FC<C & { senta: number; ora: number; olhosFecha: number; olhosAbre: number }> = ({ inicio, fim, senta, ora, olhosFecha, olhosAbre }) => {
  const { lf } = useCena(inicio);
  const dur = fim - inicio;
  const abre = eio(ramp(lf, 2, 30));
  const s = eio(ramp(lf, senta, senta + 26));
  const o = eio(ramp(lf, ora, ora + 18));
  const px = lerp(700, 430, s), py = lerp(1560, 1640, s);
  const empe: Pose = { ...parado(lf, 4), bracoD: [lerp(150, 20, abre), lerp(20, 10, abre)], frenteD: false, olhar: [0.6, -0.1], virar: lerp(0.5, 0.2, abre) };
  const senP: Pose = sentado(lf, 4, { bracoE: [26, 70], bracoD: [26, 70], frenteE: true, frenteD: true, olhar: [0.5, 0.2], virar: 0.25, cabecaIncl: 5 });
  const oraP: Pose = sentado(lf, 4, { ...orando(lf, 4), cabecaIncl: 14, olhar: [0, 0.8], virar: 0 });
  const pose = misturaPose(misturaPose(empe, senP, s), oraP, o);
  const fechado = clamp01(ramp(lf, olhosFecha, olhosFecha + 8)) * (1 - clamp01(ramp(lf, olhosAbre, olhosAbre + 10)));
  const expr = misturaExpr(cansado, calmo, eio(ramp(lf, olhosAbre - 10, olhosAbre + 30)));
  return (
    <AbsoluteFill style={{ backgroundColor: "#26305a" }}>
      <Camera chaves={[[0, 700, 1080, 1.2], [Math.max(1, senta), 640, 1100, 1.22], [Math.max(2, ora), 500, 1150, 1.45], [dur, 470, 1160, 1.62]]} deriva={0}>
        <QuartoCDMX f={lf} abre={abre} ruido={1} />
        <Personagem id="e-p" x={px} y={py} escala={1.12} visual={JOVEN} estilo={luzQuente(0.35 + 0.2 * o, "#ffc77a")} pose={pose} expr={expr} olhosAbertos={(1 - fechado) * piscar(lf, 4)} />
        <rect x={-300} y={1600} width={900} height={500} rx={30} fill="#6f7fc0" stroke={TINTA} strokeWidth={8} opacity={s} />
      </Camera>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 40% 55%, rgba(255,200,130,${0.12 + 0.12 * o}), rgba(0,0,0,0) 65%)` }} />
    </AbsoluteFill>
  );
};

// ============================================================ F — Lima à noite: respira, descansa
export const FLimaNoite: React.FC<C & { descansa: number }> = ({ inicio, fim, descansa }) => {
  const { lf } = useCena(inicio);
  const dur = fim - inicio;
  const d = eio(ramp(lf, descansa, descansa + 20));
  const pose = misturaPose({ ...pensando(lf, 5), olhar: [0.35, 0.8], cabecaIncl: 10 }, { ...parado(lf, 5), cabecaIncl: -10, olhar: [0, -0.4], bracoE: [16, 20], bracoD: [16, 20] }, d);
  const fecha = clamp01(ramp(lf, descansa + 6, descansa + 12)) * (1 - clamp01(ramp(lf, descansa + 40, descansa + 48)));
  return (
    <AbsoluteFill style={{ backgroundColor: "#2a2f4a" }}>
      <Camera chaves={[[0, 560, 1100, 1.15], [dur, 560, 1040, 1.3]]} deriva={0}>
        <SalaLima f={lf} noite={1} />
        <Personagem id="f-p" x={560} y={1700} escala={1.05} visual={LIMA} estilo={luzQuente(0.5, "#ffc77a")} pose={pose} expr={misturaExpr(cansado, calmo, d)} olhosAbertos={(1 - fecha) * piscar(lf, 7)} />
        <Mesa noite={1} brilhoTela={0.8} />
      </Camera>
    </AbsoluteFill>
  );
};

// ============================================================ G — final: luzes da cidade, oração
export const GFinal: React.FC<C & { oraEm: number }> = ({ inicio, fim, oraEm }) => {
  const { lf } = useCena(inicio);
  const dur = fim - inicio;
  const o = eio(ramp(lf, oraEm, oraEm + 20));
  const pose = misturaPose({ ...parado(lf, 6), olhar: [0.7, -0.2], virar: 0.4, bracoE: [16, 20], bracoD: [16, 20] }, { ...orando(lf, 6), cabecaIncl: 10, olhar: [0, 0.6], virar: 0.2 }, o);
  const fecha = clamp01(ramp(lf, oraEm + 6, oraEm + 14));
  return (
    <AbsoluteFill style={{ backgroundColor: "#2a2f4a" }}>
      <Camera chaves={[[0, 560, 1160, 1.3], [dur, 560, 900, 1.05]]} deriva={0}>
        <SalaLima f={lf} noite={1} />
        <Personagem id="g-p" x={560} y={1700} escala={1.05} visual={LIMA} estilo={luzQuente(0.5 + 0.2 * o, "#ffc77a")} pose={pose} expr={misturaExpr(cansado, calmo, 0.6 + 0.4 * o)} olhosAbertos={(1 - fecha) * piscar(lf, 7)} />
        <Mesa noite={1} brilhoTela={1} />
      </Camera>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 30%, rgba(255,215,140,${0.08 + 0.1 * o}), rgba(0,0,0,0) 60%)` }} />
    </AbsoluteFill>
  );
};
