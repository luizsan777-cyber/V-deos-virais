// REFLEXÃO — "Você sente que Deus está em silêncio?" 2D família do canal.
// Pessoa (moletom azul) e Jesus (túnica clara, manto bege) com a MESMA aparência em todas as cenas.
// Jesus é representação visual respeitosa: sem boca falando, sem efeitos assustadores.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Camera } from "../../engine/src/kit/Camera";
import { Personagem, Visual, Estilo, ESTILOS_PERSONAGEM } from "../../engine/src/kit/Personagem";
import { parado, andando, orando, olhandoCelular, misturaPose, Pose } from "../../engine/src/kit/poses";
import { EXPRESSOES, exprEm, misturaExpr } from "../../engine/src/kit/expressoes";
import { clamp01, eback, eio, eout, lerp, piscar, ramp, rnd, wobble } from "../../engine/src/kit/anim";
import { useCena } from "../../engine/src/kit/tempo";
import { SeloCanal, maoDoRig, TINTA_CANAL as TINTA } from "../../engine/src/kit/canal";

const W = 1080, H = 1920;
type C = React.FC<{ inicio: number; fim: number }>;
const Tela: React.FC<{ children: React.ReactNode; op?: number }> = ({ children, op = 1 }) => <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: op }}>{children}</svg>;
const OURO = "#ffd27a";

// ------------------------------------------------------------------ personagens (fixos no vídeo inteiro)
const PESSOA: Visual = { pele: "#e2b48c", cabelo: "curto", corCabelo: "#3a2618", roupa: "moletom", cor: "#4a6fa5", cor2: "#5d82b8", calca: "#3b4252", sapato: "#5a5f6e", corpo: "medio", corOlho: "#3a2a1c" };
const JESUS: Visual = { pele: "#c99a74", cabelo: "longo", corCabelo: "#5a3a22", roupa: "tunica", cor: "#f4efe4", cor2: "#c9a46a", calca: "#f4efe4", sapato: "#8a6a4a", barba: "longa", corpo: "medio", corOlho: "#3a2416" };
const estiloDe = (luz: number): Estilo => ({ ...ESTILOS_PERSONAGEM.conto, brilho: lerp(0.25, 0.45, luz), corBrilho: luz > 0.5 ? "#ffe2a8" : "#9fc0ff" });
const ESTILO_JESUS: Estilo = { ...ESTILOS_PERSONAGEM.conto, brilho: 0.6, corBrilho: "#fff1c4" };

const cansado = misturaExpr(EXPRESSOES.triste, EXPRESSOES.pensativo, 0.4);
const cansadoOlhos = { ...cansado, palpebra: 0.45 };
const sereno = EXPRESSOES.sereno;

// pose sentado na beira da cama
const sentado = (f: number, seed = 1, extra: Partial<Pose> = {}): Pose => ({ ...parado(f, seed), agachar: 120, bracoE: [20, 60], bracoD: [20, 60], ...extra, pernaE: [6, 4], pernaD: [6, 4] });

// Jesus alcançando um ponto com a mão direita (busca simples do ângulo do braço)
const alcanca = (x: number, y: number, esc: number, base: Pose, alvo: [number, number], dir: 1 | -1 = 1): Pose => {
  let melhor: Pose = base, dmin = 1e9;
  for (let a = 30; a <= 170; a += 4) for (let b = 0; b <= 100; b += 8) {
    const p = { ...base, bracoD: [a, b] as [number, number], frenteD: true };
    const [mx, my] = maoDoRig(x, y, esc, p, 1, dir);
    const d = Math.hypot(mx - alvo[0], my - alvo[1]);
    if (d < dmin) { dmin = d; melhor = p; }
  }
  return melhor;
};

// ------------------------------------------------------------------ o quarto (noite com chuva → amanhecer)
const mix = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return "#" + pa.map((v, i) => Math.round(lerp(v, pb[i], clamp01(t))).toString(16).padStart(2, "0")).join("");
};
const Quarto: React.FC<{ f: number; luz: number; chuva?: number; porta?: number; relogio?: number; abajur?: number; janelaAberta?: number; id: string }> = ({ f, luz, chuva = 1, porta = 0, relogio = 0, abajur = 1, janelaAberta = 0, id }) => {
  const parede = mix("#27325a", "#f1d7b4", luz);
  const ceuA = mix("#0a1330", "#ff9f5e", luz), ceuB = mix("#1f2c5c", "#ffe2a6", luz);
  return (
    <g>
      <defs>
        <linearGradient id={`${id}ceu`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={ceuA} /><stop offset="1" stopColor={ceuB} /></linearGradient>
        <linearGradient id={`${id}porta`} x1="1" y1="0" x2="0" y2="0"><stop offset="0" stopColor="#fff2c8" stopOpacity={0.9} /><stop offset="1" stopColor="#fff2c8" stopOpacity={0} /></linearGradient>
        <linearGradient id={`${id}sol`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffd98a" stopOpacity={0.7} /><stop offset="1" stopColor="#ffd98a" stopOpacity={0} /></linearGradient>
        <radialGradient id={`${id}aba`} cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#ffcf7a" stopOpacity={0.55} /><stop offset="1" stopColor="#ffcf7a" stopOpacity={0} /></radialGradient>
      </defs>
      {/* parede e rodapé */}
      <rect x={-500} y={-400} width={2100} height={1900} fill={parede} />
      {Array.from({ length: 14 }, (_, i) => <rect key={i} x={-500 + i * 150} y={-400} width={4} height={1900} fill={TINTA} opacity={0.06} />)}
      {/* janela: céu, cidade, chuva no vidro */}
      <g transform="translate(90 330)">
        <rect x={0} y={0} width={440} height={560} fill={`url(#${id}ceu)`} />
        {luz > 0.3 && <circle cx={300} cy={480 - luz * 160} r={70} fill="#fff1c0" opacity={luz} />}
        {[[0, 300, 70], [60, 220, 60], [120, 330, 80], [200, 260, 70], [270, 360, 60], [330, 240, 110]].map(([x, h, w], i) => (
          <g key={i}>
            <rect x={x} y={560 - h} width={w} height={h} fill={mix("#141a33", "#d9a77a", luz)} />
            {Array.from({ length: Math.floor(h / 40) }, (_, k) => <rect key={k} x={x + 12 + (k % 2) * 26} y={560 - h + 16 + k * 40} width={12} height={16} fill="#ffd27a" opacity={(1 - luz) * (rnd(`${id}j${i}${k}`) > 0.35 ? 0.85 : 0.15)} />)}
          </g>
        ))}
        {/* gotas escorrendo */}
        <g opacity={chuva * (1 - janelaAberta)}>
          {Array.from({ length: 26 }, (_, i) => {
            const x = rnd(`${id}g${i}`) * 430, v = 2 + rnd(`${id}v${i}`) * 3, y = ((rnd(`${id}y${i}`) * 600 + f * v) % 640) - 40;
            return <g key={i}><line x1={x} y1={y} x2={x - 2} y2={y + 34} stroke="#cfe3ff" strokeWidth={3} opacity={0.55} strokeLinecap="round" /><circle cx={x - 2} cy={y + 36} r={4} fill="#e6f1ff" opacity={0.6} /></g>;
          })}
        </g>
        {/* folhas da janela (abrem para fora no amanhecer) */}
        <g>
          <rect x={0} y={0} width={440} height={560} fill="none" stroke={mix("#3a3020", "#7a5a3a", luz)} strokeWidth={22} />
          <g transform={`translate(0 0) scale(${1 - 0.85 * janelaAberta} 1)`}><rect x={0} y={0} width={220} height={560} fill="#cfe3ff" opacity={0.08} /><rect x={0} y={0} width={220} height={560} fill="none" stroke={mix("#3a3020", "#7a5a3a", luz)} strokeWidth={12} /></g>
          <g transform={`translate(440 0) scale(${1 - 0.85 * janelaAberta} 1) translate(-220 0)`}><rect x={0} y={0} width={220} height={560} fill="#cfe3ff" opacity={0.08} /><rect x={0} y={0} width={220} height={560} fill="none" stroke={mix("#3a3020", "#7a5a3a", luz)} strokeWidth={12} /></g>
        </g>
        <rect x={-30} y={556} width={500} height={34} rx={8} fill={mix("#3a3020", "#a07850", luz)} stroke={TINTA} strokeWidth={6} />
      </g>
      {/* feixe de sol do amanhecer */}
      <path d="M 120,900 L 520,900 L 980,1700 L 260,1760 Z" fill={`url(#${id}sol)`} opacity={luz * 0.9} />
      {/* relógio */}
      <g transform="translate(780 330)">
        <circle r={62} fill="#f6f1e6" stroke={TINTA} strokeWidth={8} />
        <line x1={0} y1={0} x2={Math.sin(relogio * Math.PI * 2 / 12) * 32} y2={-Math.cos(relogio * Math.PI * 2 / 12) * 32} stroke={TINTA} strokeWidth={8} strokeLinecap="round" />
        <line x1={0} y1={0} x2={Math.sin(relogio * Math.PI * 2) * 48} y2={-Math.cos(relogio * Math.PI * 2) * 48} stroke={TINTA} strokeWidth={5} strokeLinecap="round" />
      </g>
      {/* porta com luz suave */}
      <g transform="translate(880 520)">
        <rect x={0} y={0} width={260} height={980} fill={mix("#141a33", "#d9b48a", luz)} />
        <rect x={0} y={0} width={260 * porta} height={980} fill="#fff4d0" opacity={0.9 * porta} />
        <rect x={0} y={0} width={260} height={980} fill="none" stroke={TINTA} strokeWidth={10} />
        <g transform={`translate(260 0) scale(${1 - 0.7 * porta} 1) translate(-260 0)`}><rect x={0} y={0} width={260} height={980} fill={mix("#3a2e2a", "#9a6a46", luz)} stroke={TINTA} strokeWidth={10} /><circle cx={40} cy={500} r={14} fill={OURO} /></g>
      </g>
      <path d="M 880,1500 L 1140,1500 L 1300,1920 L 380,1920 Z" fill={`url(#${id}porta)`} opacity={porta * 0.7} />
      {/* chão */}
      <rect x={-500} y={1500} width={2100} height={600} fill={mix("#2c2438", "#b88c62", luz)} />
      {Array.from({ length: 8 }, (_, i) => <line key={i} x1={-500} y1={1530 + i * 50} x2={1600} y2={1530 + i * 50} stroke={TINTA} strokeWidth={3} opacity={0.12} />)}
      {/* criado-mudo e abajur */}
      <g transform="translate(-40 1260)">
        <rect x={0} y={0} width={200} height={260} rx={10} fill={mix("#3a2e2a", "#9a6a46", luz)} stroke={TINTA} strokeWidth={8} />
        <rect x={80} y={-120} width={16} height={120} fill={TINTA} />
        <path d="M 30,-120 L 146,-120 L 120,-200 L 56,-200 Z" fill="#f2d8a0" stroke={TINTA} strokeWidth={7} />
        <circle cx={88} cy={-150} r={260} fill={`url(#${id}aba)`} opacity={abajur * (1 - luz)} />
      </g>
      {/* escuridão geral da noite */}
      <rect x={-500} y={-400} width={2100} height={2400} fill="#0a1030" opacity={0.32 * (1 - luz)} />
    </g>
  );
};
const Cama: React.FC<{ luz: number }> = ({ luz }) => (
  <g>
    <rect x={240} y={1350} width={60} height={330} rx={10} fill={mix("#3a2e2a", "#9a6a46", luz)} stroke={TINTA} strokeWidth={8} />
    <rect x={270} y={1560} width={820} height={120} rx={20} fill={mix("#3a4a6a", "#8fa8c8", luz)} stroke={TINTA} strokeWidth={8} />
    <rect x={260} y={1530} width={840} height={70} rx={30} fill={mix("#506088", "#c7d6ea", luz)} stroke={TINTA} strokeWidth={8} />
    <rect x={300} y={1470} width={200} height={80} rx={34} fill={mix("#7f8ab0", "#f7f1e6", luz)} stroke={TINTA} strokeWidth={7} />
  </g>
);
const CamaFrente: React.FC<{ luz: number }> = ({ luz }) => (
  <g>
    <rect x={250} y={1640} width={860} height={260} rx={24} fill={mix("#3a4a6a", "#8fa8c8", luz)} stroke={TINTA} strokeWidth={8} />
    <rect x={250} y={1630} width={860} height={60} rx={26} fill={mix("#506088", "#c7d6ea", luz)} stroke={TINTA} strokeWidth={8} />
    {[0, 1, 2, 3].map((k) => <path key={k} d={`M ${330 + k * 200},1700 q 40,30 80,0`} fill="none" stroke={TINTA} strokeWidth={4} opacity={0.25} />)}
  </g>
);
const Halo: React.FC<{ x: number; id: string; op?: number }> = ({ x, id, op = 1 }) => (
  <g opacity={op}>
    <defs><radialGradient id={`${id}h`} cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#fff3cc" stopOpacity={0.55} /><stop offset="0.6" stopColor="#ffe6a8" stopOpacity={0.18} /><stop offset="1" stopColor="#ffe6a8" stopOpacity={0} /></radialGradient></defs>
    <ellipse cx={x} cy={1250} rx={330} ry={560} fill={`url(#${id}h)`} />
  </g>
);
const Celular: React.FC<{ tela?: string; s?: number }> = ({ tela = "#9fd0ff", s = 1 }) => (
  <g transform={`scale(${s})`}><rect x={-22} y={-40} width={44} height={80} rx={8} fill="#1b1e2a" stroke={TINTA} strokeWidth={4} /><rect x={-17} y={-33} width={34} height={64} rx={4} fill={tela} /></g>
);
const Painel: React.FC<{ x: number; y: number; w: number; h: number; e: number; fundo: string; children: React.ReactNode; rot?: number; id: string }> = ({ x, y, w, h, e, fundo, children, rot = 0, id }) => (
  e <= 0.01 ? null :
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${eout(e)})`} opacity={e}>
    <rect x={-w / 2 + 10} y={-h / 2 + 14} width={w} height={h} rx={34} fill={TINTA} opacity={0.35} />
    <clipPath id={id}><rect x={-w / 2} y={-h / 2} width={w} height={h} rx={34} /></clipPath>
    <g clipPath={`url(#${id})`}><rect x={-w / 2} y={-h / 2} width={w} height={h} fill={fundo} />{children}</g>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={34} fill="none" stroke="#fff" strokeWidth={10} />
  </g>
);
const TextoTela: React.FC<{ t: string; lf: number; em: number; ate?: number; y: number; tam?: number; cor?: string }> = ({ t, lf, em, ate = 1e9, y, tam = 74, cor = "#fff" }) => {
  if (lf < em || lf > ate) return null;
  const o = clamp01((lf - em) / 10) * (1 - clamp01((lf - ate + 10) / 10));
  return <text x={540} y={y + (1 - o) * 20} textAnchor="middle" fontFamily="Anton" fontSize={tam} fill={cor} stroke={TINTA} strokeWidth={10} paintOrder="stroke" opacity={o} letterSpacing={1}>{t}</text>;
};

// ================================================================== 01 A PERGUNTA
export const Cena01: C = ({ inicio, fim }) => {
  const { lf } = useCena(inicio);
  const dur = fim - inicio;
  const pose: Pose = { ...sentado(lf, 1), virar: -0.55, olhar: [-0.9, -0.3], cabecaIncl: -3, bracoE: [24, 80], bracoD: [24, 80] };
  return (
    <AbsoluteFill style={{ backgroundColor: "#0a1030" }}>
      <Camera inicio={inicio} chaves={[[0, 560, 1250, 2.0], [dur, 580, 1230, 2.5]]} deriva={0}>
        <Quarto f={lf} luz={0} id="r1" />
        <Cama luz={0} />
        <Personagem id="r1-p" x={600} y={1720} escala={1.05} visual={PESSOA} estilo={estiloDe(0)} pose={pose} expr={cansadoOlhos} olhosAbertos={piscar(lf, 3)} />
        <CamaFrente luz={0} />
      </Camera>
      <Tela><TextoTela t="DEUS ESTÁ ME OUVINDO?" lf={lf} em={14} y={300} tam={80} cor="#dfe9ff" /></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 02 A ROTINA: os dias passam
export const Cena02: C = ({ inicio, fim }) => {
  const { lf } = useCena(inicio);
  const dur = fim - inicio;
  const fase = (lf / dur) * 3; // 0..3: manhã, dia, noite
  const luz = fase < 1 ? lerp(0.35, 0.75, fase) : fase < 2 ? 0.75 : lerp(0.75, 0, fase - 2);
  const a = clamp01(1 - (fase - 0.92) * 14), b = clamp01((fase - 0.92) * 14) * clamp01(1 - (fase - 1.92) * 14), c = clamp01((fase - 1.92) * 14);
  return (
    <AbsoluteFill style={{ backgroundColor: "#0a1030" }}>
      <Camera inicio={inicio} chaves={[[0, 560, 1150, 1.15], [dur, 560, 1180, 1.22]]} deriva={0}>
        <Quarto f={lf} luz={luz} chuva={0.35} relogio={lf / dur * 15} abajur={c} id="r2" />
        <Cama luz={luz} />
        {/* manhã: acorda e olha o celular */}
        <g opacity={a}><Personagem id="r2-p1" x={600} y={1720} escala={1.05} visual={PESSOA} estilo={estiloDe(luz)} pose={sentado(lf, 2, { ...olhandoCelular(lf, 2, 0.3), agachar: 120 })} expr={cansado} olhosAbertos={piscar(lf, 4)} itemD={<Celular />} /></g>
        {/* dia: tarefas na mesinha, preocupado */}
        <g opacity={b}>
          <rect x={340} y={1380} width={420} height={30} rx={8} fill="#9a6a46" stroke={TINTA} strokeWidth={7} />
          <rect x={380} y={1410} width={20} height={300} fill={TINTA} /><rect x={700} y={1410} width={20} height={300} fill={TINTA} />
          {[0, 1, 2].map((k) => <rect key={k} x={560 + k * 18} y={1340 - k * 6} width={150} height={40} fill="#fff" stroke={TINTA} strokeWidth={4} transform={`rotate(${-6 + k * 5} 600 1360)`} />)}
          <Personagem id="r2-p2" x={480} y={1760} escala={1.05} visual={PESSOA} estilo={estiloDe(luz)} pose={{ ...parado(lf, 3), bracoD: [60 + Math.sin(lf * 0.3) * 8, 80], frenteD: true, olhar: [0.6, 0.6], cabecaIncl: 8 }} expr={EXPRESSOES.pensativo} olhosAbertos={piscar(lf, 5)} />
        </g>
        {/* noite: senta na cama e abaixa a cabeça */}
        <g opacity={c}><Personagem id="r2-p3" x={600} y={1720} escala={1.05} visual={PESSOA} estilo={estiloDe(luz)} pose={sentado(lf, 4, { cabecaIncl: 18, tronco: 8, olhar: [0, 1], bracoE: [30, 100], bracoD: [30, 100], frenteE: true, frenteD: true })} expr={{ ...EXPRESSOES.triste, palpebra: 0.6 }} olhosAbertos={1} /></g>
        <g opacity={Math.max(a, c)}><CamaFrente luz={luz} /></g>
      </Camera>
    </AbsoluteFill>
  );
};

// ================================================================== 03 A DÚVIDA
export const Cena03: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const sera = P("Será");
  const pose: Pose = sentado(lf, 5, { ...orando(lf, 5), agachar: 120, pernaE: [80, 90], pernaD: [70, 90], cabecaIncl: 16, olhar: [0, 1] });
  return (
    <AbsoluteFill style={{ backgroundColor: "#0a1030" }}>
      <Camera inicio={inicio} chaves={[[0, 600, 1300, 1.4], [sera, 610, 1360, 2.1], [dur, 610, 1380, 2.3]]} deriva={0}>
        <Quarto f={lf} luz={0} chuva={0.8} id="r3" />
        <Cama luz={0} />
        <Personagem id="r3-p" x={600} y={1720} escala={1.05} visual={PESSOA} estilo={estiloDe(0)} pose={pose} expr={{ ...EXPRESSOES.triste, palpebra: 0.55 }} olhosAbertos={piscar(lf, 6)} />
        <CamaFrente luz={0} />
      </Camera>
      <Tela>
        <rect width={W} height={H} fill="#000" opacity={0.18 * clamp01(ramp(lf, sera - 10, sera))} />
        <TextoTela t="ELE SE ESQUECEU DE MIM?" lf={lf} em={sera} y={360} tam={84} cor="#ffffff" />
      </Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 04 MAS ESPERA: a luz e Jesus chegando
export const Cena04: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const porta = eio(ramp(lf, 0, 40));
  const entra = clamp01(ramp(lf, 34, dur - 4));
  const jx = lerp(1010, 830, eio(entra)); // caminha devagar da porta até perto da cama
  const jPose: Pose = entra < 0.98 ? { ...andando(lf, 0.7, 7), bracoD: [12, 20], bracoE: [12, 20] } : parado(lf, 7);
  const olha = clamp01(ramp(lf, 20, 40));
  const pPose: Pose = sentado(lf, 6, { cabecaIncl: lerp(14, -6, olha), olhar: [lerp(0, 0.9, olha), lerp(0.9, -0.3, olha)], virar: lerp(0, 0.45, olha), bracoE: [30, 100], bracoD: [30, 100], frenteE: true, frenteD: true });
  return (
    <AbsoluteFill style={{ backgroundColor: "#0a1030" }}>
      <Camera inicio={inicio} chaves={[[0, 900, 1100, 1.35], [36, 880, 1150, 1.2], [dur, 720, 1200, 1.1]]} deriva={0}>
        <Quarto f={lf} luz={0.05} chuva={0.7} porta={porta} id="r4" />
        <Cama luz={0.05} />
        <Personagem id="r4-p" x={600} y={1720} escala={1.05} visual={PESSOA} estilo={estiloDe(0.2)} pose={pPose} expr={exprEm(lf, [[0, "triste"], [30, "surpreso"], [52, "sereno"]])} olhosAbertos={piscar(lf, 7)} />
        <CamaFrente luz={0.05} />
        <g opacity={clamp01(ramp(lf, 30, 50))}>
          <Halo x={jx} id="r4" />
          <Personagem id="r4-j" x={jx} y={1730} escala={1.08} dir={-1} visual={JESUS} estilo={ESTILO_JESUS} pose={jPose} expr={sereno} olhosAbertos={piscar(lf, 11)} />
        </g>
      </Camera>
    </AbsoluteFill>
  );
};

// ================================================================== 05 ACOLHIMENTO: Jesus senta ao lado + pequenas coisas
export const Cena05: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const senta = eio(ramp(lf, 0, 26));
  const jPose: Pose = misturaPose(parado(lf, 8), sentado(lf, 8, { olhar: [-0.6, 0.2], cabecaIncl: 4 }), senta);
  const cuidado = P("cuidado") - 6;
  const pan = (k: number) => clamp01(ramp(lf, cuidado + k * 26, cuidado + k * 26 + 10)) * (1 - clamp01(ramp(lf, cuidado + (k + 1) * 26 + 6, cuidado + (k + 1) * 26 + 14)) * (k < 2 ? 1 : 0));
  return (
    <AbsoluteFill style={{ backgroundColor: "#0a1030" }}>
      <Camera inicio={inicio} chaves={[[0, 720, 1200, 1.1], [dur, 700, 1220, 1.12]]} deriva={0}>
        <Quarto f={lf} luz={0.1} chuva={0.6} porta={1} id="r5" />
        <Cama luz={0.1} />
        <Personagem id="r5-p" x={600} y={1720} escala={1.05} visual={PESSOA} estilo={estiloDe(0.25)} pose={sentado(lf, 9, { virar: 0.4, olhar: [0.7, -0.1], bracoE: [30, 100], bracoD: [30, 100], frenteE: true, frenteD: true })} expr={sereno} olhosAbertos={piscar(lf, 8)} />
        <Halo x={lerp(830, 860, senta)} id="r5" />
        <Personagem id="r5-j" x={lerp(830, 860, senta)} y={1730} escala={1.08} dir={-1} visual={JESUS} estilo={ESTILO_JESUS} pose={jPose} expr={sereno} olhosAbertos={piscar(lf, 12)} />
        <CamaFrente luz={0.1} />
      </Camera>
      <Tela>
        {/* pequenas coisas: mensagem de um amigo, ajuda, respirar fundo */}
        <Painel x={540} y={520} w={760} h={460} e={pan(0)} fundo="#ffe9c7" rot={-2} id="r5a">
          <rect x={-120} y={-170} width={240} height={360} rx={30} fill="#1b1e2a" />
          <rect x={-104} y={-150} width={208} height={316} rx={16} fill="#f4f7ff" />
          <rect x={-90} y={-40} width={170} height={70} rx={20} fill="#6fcf97" />
          <text x={-5} y={-12} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={20} fill="#fff">TÔ AQUI COM</text>
          <text x={-5} y={16} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={20} fill="#fff">VOCÊ, VIU?</text>
        </Painel>
        <Painel x={540} y={520} w={760} h={460} e={pan(1)} fundo="#d9ecff" rot={1.5} id="r5b">
          <Personagem id="r5-amigo" x={-150} y={330} escala={0.75} visual={{ pele: "#8d5a3b", cabelo: "cacheado", corCabelo: "#1d1210", roupa: "camiseta", cor: "#ff8c42", calca: "#2b2d42", sapato: "#fff", corpo: "medio" }} estilo={ESTILOS_PERSONAGEM.conto} pose={{ ...parado(lf, 21), bracoD: [70, 40], frenteD: true }} expr={EXPRESSOES.feliz} olhosAbertos={piscar(lf, 21)} itemD={<rect x={-36} y={-10} width={72} height={60} rx={8} fill="#d9a77a" stroke={TINTA} strokeWidth={5} />} />
          <Personagem id="r5-p2" x={150} y={330} escala={0.75} visual={PESSOA} estilo={ESTILOS_PERSONAGEM.conto} pose={{ ...parado(lf, 22), bracoE: [60, 40], frenteE: true }} expr={EXPRESSOES.sereno} olhosAbertos={piscar(lf, 22)} />
        </Painel>
        <Painel x={540} y={520} w={760} h={460} e={pan(2)} fundo="#e8e0ff" rot={-1} id="r5c">
          <Personagem id="r5-p3" x={0} y={560} escala={1.0} visual={PESSOA} estilo={ESTILOS_PERSONAGEM.conto} pose={{ ...parado(lf, 23), respirar: lf * 0.05, bob: Math.sin(lf * 0.06) * 6 }} expr={{ ...EXPRESSOES.sereno, palpebra: 1 }} olhosAbertos={0} />
        </Painel>
      </Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 06 ALÍVIO, ABRAÇO, CORAGEM → abre a janela no amanhecer
export const Cena06: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const abraco = P("abraço") - 6, coragem = P("coragem") - 6;
  const vAbraco = clamp01(ramp(lf, abraco, abraco + 12)) * (1 - clamp01(ramp(lf, coragem - 4, coragem + 6)));
  const manha = clamp01(ramp(lf, coragem, dur));
  const abre = eio(ramp(lf, coragem + 20, coragem + 60));
  const pPose: Pose = { ...parado(lf, 10), virar: -0.5, olhar: [-0.8, -0.2], bracoD: [lerp(10, 120, abre), lerp(10, 30, abre)], frenteD: true };
  return (
    <AbsoluteFill style={{ backgroundColor: "#0a1030" }}>
      <Camera inicio={inicio} chaves={[[0, 600, 1200, 1.1], [coragem, 560, 1150, 1.15], [dur, 380, 1000, 1.45]]} deriva={0}>
        <Quarto f={lf} luz={manha} chuva={1 - manha} janelaAberta={abre} id="r6" />
        <Cama luz={manha} />
        <g opacity={lf < coragem ? 0.0 : 1}>
          <Personagem id="r6-p" x={560} y={1730} escala={1.05} visual={PESSOA} estilo={estiloDe(manha)} pose={pPose} expr={misturaExpr(EXPRESSOES.pensativo, EXPRESSOES.sereno, manha)} olhosAbertos={piscar(lf, 9)} />
        </g>
        {lf < coragem && <Personagem id="r6-p0" x={600} y={1720} escala={1.05} visual={PESSOA} estilo={estiloDe(0.2)} pose={sentado(lf, 11, { virar: 0.3, olhar: [0.3, -0.2] })} expr={sereno} olhosAbertos={piscar(lf, 10)} />}
        {lf < coragem && <CamaFrente luz={0.2} />}
      </Camera>
      <Tela>
        {/* conversa que trouxe alívio */}
        <Painel x={540} y={520} w={760} h={440} e={clamp01(ramp(lf, 2, 12)) * (1 - clamp01(ramp(lf, abraco - 6, abraco + 2)))} fundo="#fff0d9" rot={-1.5} id="r6a">
          <Personagem id="r6-c1" x={-140} y={330} escala={0.72} visual={PESSOA} estilo={ESTILOS_PERSONAGEM.conto} pose={{ ...parado(lf, 31), virar: 0.4 }} expr={EXPRESSOES.sereno} olhosAbertos={piscar(lf, 31)} />
          <Personagem id="r6-c2" x={150} y={330} escala={0.72} dir={-1} visual={{ pele: "#f0c8a0", cabelo: "longo", corCabelo: "#8a4b22", roupa: "camiseta", cor: "#e4572e", calca: "#333", sapato: "#3a2a20", corpo: "medio" }} estilo={ESTILOS_PERSONAGEM.conto} pose={{ ...parado(lf, 32), bracoD: [60 + Math.sin(lf * 0.2) * 10, 60], frenteD: true }} expr={EXPRESSOES.feliz} olhosAbertos={piscar(lf, 32)} />
        </Painel>
        {/* abraço caloroso */}
        <Painel x={540} y={520} w={760} h={440} e={vAbraco} fundo="#ffe1cf" rot={1} id="r6b">
          <circle cx={0} cy={-20} r={200} fill="#ffd27a" opacity={0.35} />
          <Personagem id="r6-h2" x={60} y={330} escala={0.74} dir={-1} visual={{ pele: "#8d5a3b", cabelo: "cacheado", corCabelo: "#1d1210", roupa: "camiseta", cor: "#ff8c42", calca: "#2b2d42", sapato: "#fff", corpo: "medio" }} estilo={ESTILOS_PERSONAGEM.conto} pose={{ ...parado(lf, 33), bracoE: [70, 110], bracoD: [70, 110], frenteE: true, frenteD: true, tronco: -6 }} expr={{ ...EXPRESSOES.sereno, palpebra: 1 }} olhosAbertos={0} />
          <Personagem id="r6-h1" x={-50} y={330} escala={0.74} visual={PESSOA} estilo={ESTILOS_PERSONAGEM.conto} pose={{ ...parado(lf, 34), bracoE: [70, 110], bracoD: [70, 110], frenteE: true, frenteD: true, tronco: 6 }} expr={{ ...EXPRESSOES.sereno, palpebra: 1 }} olhosAbertos={0} />
        </Painel>
      </Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 07 MATEUS 11:28 — Bíblia aberta perto da janela
export const Cena07: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const venham = P("Venham") - 4;
  const texto = clamp01(ramp(lf, venham, venham + 14));
  return (
    <AbsoluteFill style={{ backgroundColor: "#f1d7b4" }}>
      <Camera inicio={inicio} chaves={[[0, 540, 1000, 1.0], [dur, 540, 1060, 1.25]]} deriva={0}>
        <defs><radialGradient id="r7luz" cx="0.3" cy="0.2" r="0.9"><stop offset="0" stopColor="#ffe7b0" /><stop offset="1" stopColor="#e7b98a" /></radialGradient></defs>
        <rect x={-500} y={-400} width={2100} height={2800} fill="url(#r7luz)" />
        <g transform="translate(150 120)"><rect x={0} y={0} width={500} height={560} fill="#ffcf8a" /><rect x={0} y={0} width={500} height={560} fill="none" stroke="#7a5a3a" strokeWidth={22} /><circle cx={330} cy={380} r={80} fill="#fff1c0" /></g>
        <path d="M 150,680 L 650,680 L 1100,1500 L 300,1600 Z" fill="#fff0c8" opacity={0.45} />
        {/* mesa */}
        <rect x={-100} y={1250} width={1300} height={60} fill="#9a6a46" stroke={TINTA} strokeWidth={9} />
        <rect x={-100} y={1310} width={1300} height={700} fill="#7a5236" />
        {/* Bíblia aberta */}
        <g transform="translate(540 1180)">
          <path d="M -380,40 L -20,70 L -20,-200 L -360,-230 Z" fill="#fbf6ea" stroke={TINTA} strokeWidth={8} />
          <path d="M 380,40 L 20,70 L 20,-200 L 360,-230 Z" fill="#fbf6ea" stroke={TINTA} strokeWidth={8} />
          <path d="M -20,70 Q 0,90 20,70 L 20,-200 Q 0,-180 -20,-200 Z" fill="#e8dcc0" stroke={TINTA} strokeWidth={6} />
          {Array.from({ length: 7 }, (_, i) => <g key={i}><line x1={-330} y1={-180 + i * 30} x2={-60} y2={-160 + i * 30} stroke="#b8a888" strokeWidth={6} strokeLinecap="round" /><line x1={60} y1={-160 + i * 30} x2={330} y2={-180 + i * 30} stroke="#b8a888" strokeWidth={6} strokeLinecap="round" opacity={i === 3 ? 0 : 1} /></g>)}
          <rect x={60} y={-100} width={270} height={30} fill="#ffe08a" opacity={0.8 * texto} />
          <path d="M -380,40 L -390,70 L -20,95 L 20,95 L 390,70 L 380,40" fill="#5a3a22" stroke={TINTA} strokeWidth={6} />
        </g>
      </Camera>
      <Tela>
        <g opacity={texto} transform={`translate(0 ${(1 - texto) * 20})`}>
          <rect x={90} y={250} width={900} height={330} rx={30} fill="#fffaf0" opacity={0.92} stroke={TINTA} strokeWidth={6} />
          <text x={540} y={345} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={46} fill={TINTA}>“Venham a mim, todos os</text>
          <text x={540} y={410} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={46} fill={TINTA}>que estão cansados...”</text>
          <text x={540} y={510} textAnchor="middle" fontFamily="Anton" fontSize={54} fill="#a86b1f" letterSpacing={2}>MATEUS 11:28 (NVI)</text>
        </g>
      </Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 08 RESPIRAR — Jesus ao lado, em silêncio
export const Cena08: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const resp = P("respirar") - 4;
  const fecha = clamp01(ramp(lf, resp, resp + 10));
  const respira = Math.sin(Math.max(0, lf - resp) * 0.05);
  return (
    <AbsoluteFill style={{ backgroundColor: "#f1d7b4" }}>
      <Camera inicio={inicio} chaves={[[0, 720, 1150, 1.15], [dur, 730, 1220, 1.3]]} deriva={0}>
        <Quarto f={lf} luz={0.85} chuva={0} janelaAberta={1} id="r8" />
        <Cama luz={0.85} />
        <Personagem id="r8-p" x={600} y={1720} escala={1.05} visual={PESSOA} estilo={estiloDe(0.85)} pose={sentado(lf, 12, { respirar: lf * 0.05, bob: respira * 5, cabecaIncl: lerp(0, -4, fecha), olhar: [0, -0.2] })} expr={misturaExpr(EXPRESSOES.pensativo, { ...EXPRESSOES.sereno, palpebra: 1 }, fecha)} olhosAbertos={1 - fecha} />
        <Halo x={860} id="r8" />
        <Personagem id="r8-j" x={860} y={1730} escala={1.08} dir={-1} visual={JESUS} estilo={ESTILO_JESUS} pose={sentado(lf, 13, { olhar: [-0.6, 0.2], cabecaIncl: 5 })} expr={sereno} olhosAbertos={piscar(lf, 13)} />
        <CamaFrente luz={0.85} />
      </Camera>
    </AbsoluteFill>
  );
};

// ================================================================== 09 "JESUS, FICA COMIGO." — mão no ombro, câmera se afasta
export const Cena09: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const fica = P("fica") - 6, que = P("Que") - 4;
  const mao = eio(ramp(lf, fica - 20, fica + 6));
  // pessoa de pé diante da janela; Jesus logo atrás, à direita
  const px = 420, py = 1730, jx = 640, jy = 1735, esc = 1.05;
  const ombro: [number, number] = [px + 70 * esc, py - 340 * esc];
  const baseJ: Pose = { ...parado(lf, 14), olhar: [-0.7, -0.2], cabecaIncl: 4 };
  const jPose = misturaPose(baseJ, alcanca(jx, jy, 1.08, baseJ, ombro, -1), mao);
  return (
    <AbsoluteFill style={{ backgroundColor: "#f1d7b4" }}>
      <Camera inicio={inicio} chaves={[[0, 420, 1050, 1.5], [fica, 480, 1150, 1.25], [dur, 540, 1200, 1.0]]} deriva={0}>
        <Quarto f={lf} luz={1} chuva={0} janelaAberta={1} id="r9" />
        <Cama luz={1} />
        <Halo x={jx} id="r9" />
        <Personagem id="r9-j" x={jx} y={jy} escala={1.08} dir={-1} visual={JESUS} estilo={ESTILO_JESUS} pose={jPose} expr={sereno} olhosAbertos={piscar(lf, 15)} />
        <Personagem id="r9-p" x={px} y={py} escala={esc} visual={PESSOA} estilo={estiloDe(1)} pose={{ ...parado(lf, 16), virar: -0.45, olhar: [-0.7, -0.4], cabecaIncl: -3 }} expr={exprEm(lf, [[0, "pensativo"], [fica, "sereno"]])} olhosAbertos={piscar(lf, 16)} />
      </Camera>
      <Tela>
        <TextoTela t="JESUS, FICA COMIGO." lf={lf} em={fica + 4} ate={que + 2} y={330} tam={86} />
        <TextoTela t="UM PASSO DE CADA VEZ." lf={lf} em={que + 6} y={330} tam={80} cor={OURO} />
      </Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 10 CONVITE FINAL — celular e ícone discreto
export const Cena10: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const comp = P("compartilhe") - 4;
  const icone = eback(ramp(lf, comp, comp + 12));
  return (
    <AbsoluteFill style={{ backgroundColor: "#f1d7b4" }}>
      <Camera inicio={inicio} chaves={[[0, 560, 1150, 1.2], [dur, 560, 1120, 1.28]]} deriva={0}>
        <Quarto f={lf} luz={1} chuva={0} janelaAberta={1} id="r10" />
        <Cama luz={1} />
        <Personagem id="r10-p" x={600} y={1720} escala={1.05} visual={PESSOA} estilo={estiloDe(1)} pose={sentado(lf, 17, { ...olhandoCelular(lf, 17, 0.25), agachar: 120 })} expr={EXPRESSOES.sereno} olhosAbertos={piscar(lf, 17)} itemD={<Celular tela="#ffe9b8" />} />
        <CamaFrente luz={1} />
      </Camera>
      <Tela>
        {icone > 0 && (
          <g transform={`translate(860 1080) scale(${icone * 0.9})`} opacity={0.9}>
            <circle r={58} fill="#ffffff" stroke={TINTA} strokeWidth={6} />
            <circle cx={-18} cy={0} r={10} fill={TINTA} /><circle cx={18} cy={-20} r={10} fill={TINTA} /><circle cx={18} cy={20} r={10} fill={TINTA} />
            <line x1={-18} y1={0} x2={18} y2={-20} stroke={TINTA} strokeWidth={5} /><line x1={-18} y1={0} x2={18} y2={20} stroke={TINTA} strokeWidth={5} />
          </g>
        )}
      </Tela>
    </AbsoluteFill>
  );
};
