// VÍDEO 04 — Por que você não consegue fazer cócegas em si mesmo? 12 cenas (uma por fala). Ciência simplificada em 2D.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Camera } from "../../engine/src/kit/Camera";
import { parado, andando, apontando, surpreso, pensando, Pose } from "../../engine/src/kit/poses";
import { EXPRESSOES, exprEm, misturaExpr } from "../../engine/src/kit/expressoes";
import { chaves, clamp01, eback, eio, eout, lerp, ramp, rnd } from "../../engine/src/kit/anim";
import { useCena } from "../../engine/src/kit/tempo";
import {
  TINTA, LARANJA, CIANO, ROXO, MAGENTA, LILAS, AZUL_PREV, PROTAG, AMIGO, PARTICIPANTE, maoDe, cabecaDe, Pessoa, MarcasToque,
  SalaFundo, SofaFrente, PeleCorte, Cerebro, CEREBRO, Fluxo, CabecaPerfil, Folha, ArvoreParque,
} from "./neuro";

const W = 1080, H = 1920;
type C = React.FC<{ inicio: number; fim: number }>;
const Tela: React.FC<{ children: React.ReactNode; op?: number }> = ({ children, op = 1 }) => <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: op }}>{children}</svg>;
const Tag: React.FC<{ f: number; em: number; ate: number; t: string; x?: number; y: number; tam?: number; cor?: string; fundo?: string; rot?: number }> = ({ f, em, ate, t, x = 540, y, tam = 60, cor = TINTA, fundo = "#ffd23f", rot = -3 }) => {
  if (f < em || f > ate) return null;
  const s = eback(ramp(f, em, em + 8)) * (1 - eio(ramp(f, ate - 6, ate)));
  const w = t.length * tam * 0.55 + 60;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x={-w / 2 + 6} y={-tam * 0.85 + 8} width={w} height={tam * 1.35} rx={18} fill={TINTA} opacity={0.4} />
      <rect x={-w / 2} y={-tam * 0.85} width={w} height={tam * 1.35} rx={18} fill={fundo} stroke={TINTA} strokeWidth={6} />
      <text y={tam * 0.28} textAnchor="middle" fontFamily="Anton" fontSize={tam} fill={cor}>{t}</text>
    </g>
  );
};

// protagonista sentado no sofá (posição fixa nas cenas da sala)
const PX = 600, PY = 1720, PS = 1.0;
const sentado = (lf: number, extra: Partial<Pose> = {}): Pose => ({ ...parado(lf, 2), agachar: 30, bracoE: [12, 22], bracoD: [12, 22], ...extra });
const autoCocega = (lf: number, t: number): Partial<Pose> => ({ bracoD: [lerp(12, 35, t), lerp(22, 75 + Math.sin(lf * 1.3) * 7 * t, t)] }); // mão direita na lateral do corpo
const olhaMao = (t: number): Partial<Pose> => ({ bracoD: [lerp(12, 62, t), lerp(22, 118, t)], olhar: [0.5 * t, 0.5 * t] });
// amigo em pé à esquerda; braço direito alcança a lateral esquerda do protagonista
const AX = 300;
const amigoToca = (lf: number, t: number, base: Pose): Pose => ({ ...base, bracoD: [lerp(base.bracoD[0], 44, t), lerp(base.bracoD[1], Math.sin(lf * 1.4) * 8 * t, t)], tronco: 4 * t });

const Sala: React.FC<{ lf: number; prot: Pose; exprP: ReturnType<typeof misturaExpr>; amigo?: { pose: Pose; expr: ReturnType<typeof misturaExpr>; x?: number; boca?: number } | null; toqueProprio?: number; toqueAmigo?: number; risada?: number; poltrona?: boolean }> = ({
  lf, prot, exprP, amigo, toqueProprio = 0, toqueAmigo = 0, risada = 0, poltrona,
}) => {
  const mp = maoDe(PX, PY, PS, prot, 1);
  const ma = amigo ? maoDe(amigo.x ?? AX, PY, 1.0, amigo.pose, 1) : null;
  return (
    <g>
      <SalaFundo f={lf} />
      {poltrona && amigo && <Pessoa v={AMIGO} id="co04-amigo-sentado" x={amigo.x ?? 280} y={PY} escala={0.95} pose={amigo.pose} expr={amigo.expr} f={lf} seed={9} />}
      <Pessoa v={PROTAG} id="co04-prot" x={PX} y={PY} escala={PS} pose={prot} expr={exprP} f={lf} seed={2} boca={risada * (0.5 + 0.5 * Math.abs(Math.sin(lf * 0.9)))} />
      <SofaFrente />
      {!poltrona && amigo && <Pessoa v={AMIGO} id="co04-amigo" x={amigo.x ?? AX} y={PY} escala={1.0} pose={amigo.pose} expr={amigo.expr} f={lf} seed={9} boca={amigo.boca ?? 0} />}
      <MarcasToque x={mp[0] + 20} y={mp[1]} f={lf} forca={toqueProprio * 0.45} cor="#ffd23f" />
      {ma && <MarcasToque x={ma[0] + 10} y={ma[1]} f={lf} forca={toqueAmigo} cor="#ffffff" />}
    </g>
  );
};

// ================================================================== 01 O DESAFIO
export const Cena01: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const olha = eio(ramp(lf, 2, 14)) * (1 - eio(ramp(lf, 34, 44)));
  const auto = eio(ramp(lf, 38, 50)) * (1 - eio(ramp(lf, 92, 102)));
  const entra = eio(ramp(lf, 84, 112));
  const pede = clamp01(ramp(lf, 112, 120)) * (1 - ramp(lf, 128, 134));
  const toca = eio(ramp(lf, 134, 142)) * (1 - eio(ramp(lf, 160, 170)));
  const ri = clamp01(ramp(lf, 140, 146)) * (1 - ramp(lf, 180, 196));
  const prot: Pose = sentado(lf, {
    ...(olha > 0 ? olhaMao(olha) : autoCocega(lf, auto)),
    tronco: ri * (4 * Math.sin(lf * 0.7) + 6), cabecaIncl: ri * 8 * Math.sin(lf * 0.5) + (lf < 100 ? -4 * auto : 0), virar: lf > 100 ? -0.35 : 0,
    olhar: lf > 100 && lf < 140 ? [-0.8, 0] : olha > 0 ? [0.5, 0.5] : [0.2, 0],
  });
  const amigoBase: Pose = { ...(entra < 1 ? andando(lf, 1.4, 9) : parado(lf, 9)), bracoD: pede > 0 ? [lerp(12, 70, pede), lerp(10, 60, pede)] : [12, 10], virar: 0.4 };
  const exprP = ri > 0.1 ? EXPRESSOES.empolgado : exprEm(lf, [[0, "pensativo"], [44, "desconfiado"], [100, "surpreso"], [120, "pensativo"]], 6);
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 560, 1300, 1.45], [44, 600, 1260, 1.9], [92, 600, 1250, 2.2], [104, 480, 1330, 1.35], [138, 520, 1300, 1.45], [150, 600, 1230, 2.3], [dur, 600, 1230, 2.4]]} deriva={0}>
        <Sala lf={lf} prot={prot} exprP={exprP} toqueProprio={auto} toqueAmigo={toca} risada={ri}
          amigo={entra > 0 ? { x: lerp(-200, AX, entra), pose: amigoToca(lf, toca, amigoBase), expr: EXPRESSOES.feliz } : null} />
      </Camera>
      <Tela><Tag f={lf} em={P("consegue", 2) - 2} ate={dur + 10} t="POR QUÊ?" x={820} y={560} tam={70} /></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 02 A PELE CONTINUA SENTINDO
const Dedo: React.FC<{ x: number; y: number; cor: string; pele: string }> = ({ x, y, cor, pele }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-70} y={-900} width={140} height={560} fill={cor} stroke={TINTA} strokeWidth={8} />
    <path d="M -60,-360 L -60,-60 C -60,10 60,10 60,-60 L 60,-360 Z" fill={pele} stroke={TINTA} strokeWidth={8} />
    <path d="M -36,-100 C -36,-60 36,-60 36,-100" fill="none" stroke="#c08a6a" strokeWidth={5} />
  </g>
);
export const Cena02: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const segunda = P("Então") - 10;
  const toque1 = Math.sin(clamp01(ramp(lf, 10, 70)) * Math.PI);
  const toque2 = Math.sin(clamp01(ramp(lf, segunda + 8, segunda + 68)) * Math.PI);
  const pressao = lf < segunda ? toque1 : toque2;
  const pulsos = clamp01(lf < segunda ? ramp(lf, 22, 30) * (1 - ramp(lf, segunda - 18, segunda)) : ramp(lf, segunda + 20, segunda + 28));
  const dedoY = 470 + pressao * 40 - (lf < segunda ? (1 - toque1) * 260 * (lf > 40 ? 1 : 1) : (1 - toque2) * 260);
  const sobe = eio(ramp(lf, dur - 30, dur));
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 540, 700, 1.6], [16, 540, 760, 1.0], [segunda - 6, 600, 860, 1.05], [segunda + 10, 540, 760, 1.0], [dur - 30, 700, 900, 1.05], [dur, 1200, 1050, 1.6]]} deriva={0}>
        <PeleCorte f={lf} pressao={pressao} pulsos={pulsos} corTecido="#ffd23f" />
        {lf < segunda ? <Dedo x={540} y={dedoY} cor="#ffd23f" pele="#e2b38f" /> : <Dedo x={540} y={dedoY} cor="#3fbf6a" pele="#9a6a48" />}
        <text x={980} y={300} textAnchor="end" fontFamily="Montserrat" fontWeight={900} fontSize={40} fill="#ffffff">{lf < segunda ? "sua mão" : "mão do amigo"}</text>
        <text x={1260} y={1060} textAnchor="end" fontFamily="Montserrat" fontWeight={900} fontSize={30} fill="#fff6e0" opacity={0.8}>→ sinais seguem pelo braço</text>
        <rect x={-200} y={-400} width={1500} height={2600} fill="#2a1f45" opacity={sobe * 0.6} />
      </Camera>
      <Tela><Tag f={lf} em={P("pele") - 2} ate={P("pele") + 60} t="A PELE SENTE" y={1380} tam={64} fundo={CIANO} /></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 03 O CÉREBRO PREPARA O MOVIMENTO
export const Cena03: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const decide = P("decide") - 4;
  const motor = clamp01(ramp(lf, decide, decide + 10));
  const mov = eio(ramp(lf, P("mover"), P("movimento") + 10));
  const pose: Pose = { ...parado(lf, 2), ...autoCocega(lf, mov), olhar: [0.3, 0.4] };
  const BX = 540, BY = 1880, BS = 0.95;
  const ombro: [number, number] = [BX + 64 * BS, BY - 400 * BS];
  const mao = maoDe(BX, BY, BS, pose, 1);
  // cérebro desenhado na cabeça grande acima (origem 540,560, escala 0.62)
  const bx = (p: [number, number]): [number, number] => [540 + p[0] * 0.62, 560 + p[1] * 0.62];
  const caminho: [number, number][] = [bx(CEREBRO.motor), bx([80, 0]), bx([140, 300]), [620, 1000], [ombro[0] + 40, ombro[1] - 40], ombro, [mao[0] + 10, mao[1] - 40], mao];
  return (
    <AbsoluteFill style={{ backgroundColor: "#2a1f45" }}>
      <Camera inicio={inicio} chaves={[[0, 540, 1200, 1.5], [P("toque") + 6, 540, 700, 1.25], [decide, 540, 640, 1.35], [P("mão") + 4, 560, 1000, 0.95], [dur, 600, 1180, 1.05]]} deriva={0}>
        <rect x={-600} y={-400} width={2300} height={2800} fill="#2a1f45" />
        {Array.from({ length: 26 }, (_, i) => <circle key={i} cx={rnd(`co04s3${i}`) * 1200 - 60} cy={rnd(`co04s3y${i}`) * 2000} r={4} fill={LILAS} opacity={0.3} />)}
        <g transform="translate(540 560) scale(0.62)">
          <CabecaPerfil f={lf} transparencia={clamp01(ramp(lf, 4, 30))}><Cerebro f={lf} motor={motor} /></CabecaPerfil>
        </g>
        <Pessoa v={PROTAG} id="co04-prot-c3" x={BX} y={BY} escala={BS} pose={pose} expr={exprEm(lf, [[0, "pensativo"], [decide, "desconfiado"]])} f={lf} seed={2} />
        <Fluxo pts={caminho} f={lf} cor={LARANJA} prog={eio(ramp(lf, decide, P("prepara") + 10))} n={7} vel={0.025} />
      </Camera>
    </AbsoluteFill>
  );
};

// ================================================================== 04 O CÉREBRO FAZ UMA PREVISÃO
export const Cena04: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const cmd = eio(ramp(lf, 4, P("comando") + 14));
  const prev = eio(ramp(lf, P("produz") - 4, P("prever") + 10));
  const cereb = clamp01(ramp(lf, dur - 50, dur - 20));
  const b = (p: [number, number]): [number, number] => [540 + p[0] * 1.3, 820 + p[1] * 1.3];
  const motorPath: [number, number][] = [b(CEREBRO.motor), b([60, -40]), b([130, 120]), b([150, 330]), [760, 1500]];
  const prevPath: [number, number][] = [b([30, -130]), b([-60, -60]), b([-20, 40]), b([150, 60]), b(CEREBRO.cerebelo), b([180, -20]), b(CEREBRO.somato)];
  const mov = eio(ramp(lf, 10, dur - 10));
  const pose: Pose = { ...parado(lf, 2), ...autoCocega(lf, mov) };
  return (
    <AbsoluteFill style={{ backgroundColor: "#2a1f45" }}>
      <Camera inicio={inicio} chaves={[[0, 540, 900, 1.0], [P("prever"), 560, 900, 1.05], [dur - 30, 680, 960, 1.2], [dur, 760, 1000, 1.6]]} deriva={0}>
        <rect x={-600} y={-400} width={2300} height={2800} fill="#2a1f45" />
        <g transform="translate(540 820) scale(1.3)"><Cerebro f={lf} motor={cmd} somato={prev * 0.6} cerebelo={cereb} /></g>
        <Fluxo pts={motorPath} f={lf} cor={LARANJA} prog={cmd} n={6} vel={0.03} larg={11} />
        <Fluxo pts={prevPath} f={lf + 40} cor={AZUL_PREV} prog={prev} n={6} vel={0.02} larg={9} />
        {/* mão em movimento num quadro conectado */}
        <g transform="translate(820 1500)">
          <clipPath id="co04-c4-q"><circle r={190} /></clipPath>
          <g clipPath="url(#co04-c4-q)">
            <rect x={-200} y={-200} width={400} height={400} fill="#fff1c9" />
            <Pessoa v={PROTAG} id="co04-prot-c4" x={-40} y={520} escala={0.9} pose={pose} expr={EXPRESSOES.pensativo} f={lf} seed={2} />
          </g>
          <circle r={190} fill="none" stroke={LARANJA} strokeWidth={8} />
        </g>
      </Camera>
      <Tela>
        <Tag f={lf} em={P("comando") - 4} ate={P("comando") + 60} t="MOVIMENTO" x={330} y={300} tam={52} fundo={LARANJA} />
        <Tag f={lf} em={P("prever") - 4} ate={P("prever") + 60} t="PREVISÃO" x={740} y={300} tam={52} fundo={AZUL_PREV} cor="#ffffff" />
      </Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 05 O CEREBELO PARTICIPA
export const Cena05: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const corte = P("Ele") - 4;
  if (lf < corte) {
    const rede = clamp01(ramp(lf, P("participa") - 4, P("participa") + 14));
    return (
      <AbsoluteFill style={{ backgroundColor: "#2a1f45" }}>
        <Camera inicio={inicio} chaves={[[0, 600, 860, 1.0], [P("participa"), 700, 920, 1.35], [corte, 680, 900, 1.2]]} deriva={0.4}>
          <rect x={-600} y={-400} width={2300} height={2800} fill="#2a1f45" />
          <g transform="translate(540 860) scale(1.0)"><CabecaPerfil f={lf}><Cerebro f={lf} cerebelo={1} rede={rede} motor={rede * 0.5} somato={rede * 0.5} /></CabecaPerfil></g>
          <text x={760} y={1150} fontFamily="Montserrat" fontWeight={900} fontSize={40} fill={LILAS} opacity={clamp01(ramp(lf, 6, 16))}>cerebelo</text>
          <text x={540} y={1460} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={30} fill="#ffffff" opacity={rede * 0.85}>trabalha em rede com outras áreas</text>
        </Camera>
      </AbsoluteFill>
    );
  }
  // braço e mão em semi-perfil: a "mão prevista" (ilustração da expectativa) chega um pouco antes da mão real
  const k = lf - corte;
  const real = eio(ramp(lf, corte + 6, P("acontecer") + 4));
  const fant = eio(ramp(lf, corte, P("acontecer") - 12));
  const pr = (t: number): Pose => ({ ...parado(lf, 2), ...autoCocega(lf, t) });
  const mR = maoDe(540, 1900, 1.1, pr(real), 1);
  const someF = clamp01(ramp(lf, P("acontecer"), P("acontecer") + 10));
  const icone = (em: number) => eback(ramp(lf, em - 2, em + 6));
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[corte, 560, 1250, 1.4], [dur, 600, 1300, 1.7]]} deriva={0}>
        <rect x={-600} y={-400} width={2300} height={2800} fill="#fff1c9" />
        <g opacity={0.45 * (1 - someF)}>
          <Pessoa v={{ ...PROTAG, cor: "#9fd0ff", cor2: "#9fd0ff", pele: "#bfe0ff", corCabelo: "#9fd0ff", calca: "#9fd0ff", sapato: "#bfe0ff" }} id="co04-fantasma" x={540} y={1900} escala={1.1} pose={pr(fant)} expr={EXPRESSOES.neutro} f={lf} seed={2} />
        </g>
        <Pessoa v={PROTAG} id="co04-prot-c5" x={540} y={1900} escala={1.1} pose={pr(real)} expr={exprEm(lf, [[corte, "pensativo"], [P("acontecer"), "desconfiado"]])} f={lf} seed={2} />
        {real > 0.95 && <circle cx={mR[0] + 10} cy={mR[1]} r={40 + 20 * clamp01(ramp(lf, P("acontecer"), P("acontecer") + 10))} fill="none" stroke={AZUL_PREV} strokeWidth={6} opacity={1 - someF * 0.6} />}
        {/* onde, quando e como: mira, relógio, contorno de contato */}
        {[[P("onde"), 300, 900, 0], [P("quando"), 540, 820, 1], [P("como"), 780, 900, 2]].map(([em, x, y, t], i) => {
          const s = icone(em as number);
          return s > 0 && (
            <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
              <circle r={70} fill="#ffffff" stroke={TINTA} strokeWidth={6} />
              {t === 0 && <g stroke="#e4572e" strokeWidth={7} fill="none"><circle r={40} /><circle r={18} /><line x1={-56} x2={56} y1={0} y2={0} /><line y1={-56} y2={56} x1={0} x2={0} /></g>}
              {t === 1 && <g stroke={TINTA} strokeWidth={7} fill="none"><circle r={42} /><line x1={0} y1={0} x2={0} y2={-30} /><line x1={0} y1={0} x2={24 * Math.cos(k * 0.2)} y2={24 * Math.sin(k * 0.2)} /></g>}
              {t === 2 && <g stroke={AZUL_PREV} strokeWidth={6} fill="none"><path d="M -30,20 C -30,-30 30,-30 30,20" /><path d="M -45,30 C -45,-48 45,-48 45,30" opacity={0.6} /></g>}
            </g>
          );
        })}
      </Camera>
      <Tela><text x={540} y={1840} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={26} fill={TINTA} opacity={0.7}>mão azul = ilustração da previsão</text></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 06 A SENSAÇÃO FICA MAIS FRACA
const Onda: React.FC<{ x: number; y: number; amp: number; cor: string; f: number; w?: number }> = ({ x, y, amp, cor, f, w = 640 }) => {
  let d = "";
  for (let i = 0; i <= 80; i++) { const u = i / 80; d += `${i ? "L" : "M"} ${x + u * w},${y - Math.sin(u * Math.PI * 6 - f * 0.25) * amp * Math.sin(u * Math.PI)} `; }
  return <path d={d} fill="none" stroke={cor} strokeWidth={10} strokeLinecap="round" />;
};
export const Cena06: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const corte = P("Por") - 6;
  if (lf < corte) {
    const reduz = eio(ramp(lf, P("reduzir") - 4, P("percebida")));
    const grafico = clamp01(ramp(lf, P("intensidade") - 6, P("intensidade") + 2)) * (1 - ramp(lf, P("intensidade") + 52, P("intensidade") + 58));
    return (
      <AbsoluteFill style={{ backgroundColor: "#2a1f45" }}>
        <Camera inicio={inicio} chaves={[[0, 540, 800, 1.0], [P("reduzir"), 600, 760, 1.2], [corte, 620, 760, 1.25]]} deriva={0.3}>
          <rect x={-600} y={-400} width={2300} height={2800} fill="#2a1f45" />
          <g transform="translate(540 760) scale(1.25)"><Cerebro f={lf} somato={0.5 + 0.5 * (1 - reduz)} /></g>
          {/* sinal do toque próprio chega e é atenuado (nunca desaparece) */}
          <Onda x={-120} y={1350} amp={lerp(110, 38, reduz)} cor={LARANJA} f={lf} w={1320} />
          <text x={540} y={1530} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={34} fill="#ffffff">toque da própria mão</text>
        </Camera>
        {grafico > 0 && (
          <Tela op={grafico}>
            <g transform="translate(540 330)">
              <rect x={-460} y={-140} width={920} height={280} rx={24} fill="#fff8e6" stroke={TINTA} strokeWidth={6} />
              <Onda x={-420} y={-40} amp={60} cor={LARANJA} f={lf} w={380} />
              <Onda x={40} y={-40} amp={22} cor={AZUL_PREV} f={lf} w={380} />
              <text x={-230} y={95} textAnchor="middle" fontFamily="Anton" fontSize={40} fill={TINTA}>ESTÍMULO</text>
              <text x={230} y={95} textAnchor="middle" fontFamily="Anton" fontSize={40} fill={TINTA}>SENSAÇÃO PERCEBIDA</text>
            </g>
          </Tela>
        )}
      </AbsoluteFill>
    );
  }
  const auto = eio(ramp(lf, corte + 6, corte + 18)) * (1 - eio(ramp(lf, dur - 14, dur - 4)));
  const prot = sentado(lf, { ...autoCocega(lf, auto), cabecaIncl: -5 * auto, olhar: [0.3, 0.4] });
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[corte, 560, 1300, 1.45], [dur, 600, 1250, 1.9]]} deriva={0}>
        <Sala lf={lf} prot={prot} exprP={exprEm(lf, [[corte, "desconfiado"], [corte + 30, "feliz"], [corte + 50, "desconfiado"]], 8)} toqueProprio={auto * 0.6} />
      </Camera>
    </AbsoluteFill>
  );
};

// ================================================================== 07 QUANDO É OUTRA PESSOA
export const Cena07: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const finta = Math.sin(clamp01(ramp(lf, 20, 60)) * Math.PI); // gesto e pausa curta
  const contato = P("motor") - 6;
  const toca = eio(ramp(lf, contato - 6, contato)) * (1 - eio(ramp(lf, contato + 30, contato + 40)));
  const raio = clamp01(ramp(lf, contato + 2, contato + 10));
  const espera = lf < contato;
  const prot = sentado(lf, { virar: -0.35, olhar: espera ? [Math.sin(lf * 0.15) * 0.8, 0.2] : [-0.6, 0.3], tronco: toca * 5, bob: -toca * 6 });
  const amigo: Pose = amigoToca(lf, toca, { ...parado(lf, 9), bracoD: [lerp(12, 70, finta), lerp(10, 40, finta)], virar: 0.4 });
  const ma = maoDe(AX, PY, 1.0, amigo, 1);
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 520, 1300, 1.35], [contato - 8, 500, 1360, 1.6], [contato + 2, ma[0], ma[1], 2.6], [dur, ma[0], ma[1], 3.0]]} deriva={0}>
        <Sala lf={lf} prot={prot} exprP={espera ? misturaExpr(EXPRESSOES.desconfiado, EXPRESSOES.surpreso, 0.4) : EXPRESSOES.surpreso} amigo={{ pose: amigo, expr: EXPRESSOES.feliz }} toqueAmigo={toca} />
        {/* transparência da pele no ponto de contato: pulsos mais chamativos */}
        {raio > 0 && (
          <g transform={`translate(${ma[0] + 30} ${ma[1]})`} opacity={raio}>
            <circle r={150} fill="#2a1f45" opacity={0.85} stroke={CIANO} strokeWidth={6} />
            {Array.from({ length: 7 }, (_, i) => { const a = (i / 7) * Math.PI * 2; const u = ((lf * 0.05 + i / 7) % 1); return <g key={i}><circle cx={Math.cos(a) * 60} cy={Math.sin(a) * 60} r={16} fill={CIANO} /><circle cx={Math.cos(a) * (60 + u * 80)} cy={Math.sin(a) * (60 + u * 80)} r={10} fill={LARANJA} opacity={1 - u} /></g>; })}
          </g>
        )}
      </Camera>
    </AbsoluteFill>
  );
};

// ================================================================== 08 A SURPRESA AUMENTA A REAÇÃO
export const Cena08: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const corte = P("E") - 2;
  if (lf < corte) {
    const ri = clamp01(ramp(lf, 0, 6)) * (1 - ramp(lf, corte - 20, corte - 4));
    const recua = eio(ramp(lf, 0, 20));
    const prot = sentado(lf, { tronco: ri * (8 + 5 * Math.sin(lf * 0.6)), cabecaIncl: ri * 10 * Math.sin(lf * 0.5), bracoE: [lerp(12, 50, ri), 90], bracoD: [lerp(12, 40, ri), 80], bob: -ri * 8 });
    const amigo: Pose = { ...parado(lf, 9), bracoD: [lerp(44, 12, recua), 10], virar: 0.4 };
    return (
      <AbsoluteFill>
        <Camera inicio={inicio} chaves={[[0, 560, 1300, 1.5], [30, 600, 1220, 2.5], [corte, 600, 1220, 2.6]]} deriva={0}>
          <Sala lf={lf} prot={prot} exprP={EXPRESSOES.empolgado} risada={ri} amigo={{ pose: amigo, expr: EXPRESSOES.feliz, boca: 0.3 * ri }} />
        </Camera>
      </AbsoluteFill>
    );
  }
  const a = eio(ramp(lf, corte + 4, P("explicar")));
  const b2 = (p: [number, number]): [number, number] => [540 + p[0] * 1.1, 760 + p[1] * 1.1];
  const caminho = (dy: number): [number, number][] => [[0, 1500 + dy], [200, 1300 + dy], b2([-100, 40]), b2(CEREBRO.somato)];
  return (
    <AbsoluteFill style={{ backgroundColor: "#2a1f45" }}>
      <Camera inicio={inicio} chaves={[[corte, 540, 960, 1.0], [dur, 560, 960, 1.05]]} deriva={0.3}>
        <rect x={-600} y={-400} width={2300} height={2800} fill="#2a1f45" />
        <g transform="translate(540 760) scale(1.1)"><Cerebro f={lf} somato={0.6 + 0.4 * Math.sin(lf * 0.2)} /></g>
        <Fluxo pts={caminho(0)} f={lf} cor={LARANJA} prog={a} n={4} vel={0.03} larg={7} />
        <Fluxo pts={caminho(260).map(([x, y]) => [1080 - x, y] as [number, number])} f={lf + 20} cor={CIANO} prog={a} n={7} vel={0.04} larg={12} />
        {/* respostas: menor para o toque próprio, mais marcante para o externo (tendência ilustrativa) */}
        <g transform="translate(250 1660)" opacity={a}><circle r={40 + 6 * Math.sin(lf * 0.3)} fill={LARANJA} opacity={0.6} /><text y={110} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={30} fill="#fff">própria mão</text></g>
        <g transform="translate(830 1660)" opacity={a}><circle r={90 + 14 * Math.sin(lf * 0.3)} fill={CIANO} opacity={0.6} /><text y={150} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={30} fill="#fff">outra pessoa</text></g>
      </Camera>
      <Tela><Tag f={lf} em={P("surpresa") - 2} ate={P("surpresa") + 34} t="SURPRESA" y={300} tam={70} fundo={MAGENTA} cor="#ffffff" /></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 09 O EXPERIMENTO COM ATRASO
export const Cena09: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const ciclo1 = [20, 20], ciclo2 = [P("atraso") - 4, P("atraso") + 34]; // [alavanca, toque]
  const alav = (em: number) => Math.sin(clamp01(ramp(lf, em, em + 16)) * Math.PI);
  const ang = lf < ciclo2[0] - 10 ? alav(ciclo1[0]) : alav(ciclo2[0]);
  const toqueEm = lf < ciclo2[0] - 10 ? ciclo1[1] + 8 : ciclo2[1];
  const toque = Math.sin(clamp01(ramp(lf, toqueEm, toqueEm + 16)) * Math.PI);
  const luz = toque > 0.1;
  const relogio = lf >= ciclo2[0] && lf < ciclo2[1] + 6;
  const reacao = clamp01(ramp(lf, ciclo2[1] + 2, ciclo2[1] + 10));
  const desalinha = eio(ramp(lf, ciclo2[0], ciclo2[1]));
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 540, 1200, 1.0], [ciclo2[0] - 10, 600, 1250, 1.2], [ciclo2[0], 640, 1330, 1.6], [ciclo2[1] + 6, 520, 1150, 1.5], [dur, 540, 1150, 1.25]]} deriva={0}>
        <rect x={-600} y={-400} width={2300} height={2800} fill="#e9f3ff" />
        {Array.from({ length: 10 }, (_, i) => <rect key={i} x={-200 + i * 160} y={300} width={120} height={300} rx={10} fill="#d6e6fa" stroke="#b8cce8" strokeWidth={4} />)}
        <rect x={-600} y={1720} width={2300} height={700} fill="#c8d6e8" />
        <Pessoa v={PARTICIPANTE} id="co04-participante" x={420} y={1900} escala={1.0} pose={{ ...parado(lf, 30), bracoD: [40, 70 - ang * 20], bracoE: [55, 60], virar: lerp(0, 0.4, reacao) }}
          expr={reacao > 0.5 ? EXPRESSOES.surpreso : EXPRESSOES.pensativo} f={lf} seed={30} />
        {/* mesa */}
        <rect x={120} y={1460} width={840} height={40} fill="#8a96a8" stroke={TINTA} strokeWidth={7} />
        <rect x={160} y={1500} width={24} height={220} fill="#8a96a8" /><rect x={900} y={1500} width={24} height={220} fill="#8a96a8" />
        {/* alavanca */}
        <g transform="translate(560 1460)"><rect x={-40} y={-30} width={80} height={30} rx={8} fill="#3a4250" stroke={TINTA} strokeWidth={5} /><g transform={`rotate(${-25 + ang * 50})`}><rect x={-6} y={-110} width={12} height={90} fill={TINTA} /><circle cy={-112} r={18} fill="#e4572e" stroke={TINTA} strokeWidth={4} /></g></g>
        {/* cabo até o dispositivo tátil */}
        <path d="M 600,1450 C 700,1400 760,1420 800,1360" fill="none" stroke={TINTA} strokeWidth={6} />
        <g transform="translate(830 1330)">
          <rect x={-70} y={-60} width={140} height={110} rx={14} fill="#c9d2dc" stroke={TINTA} strokeWidth={6} />
          <circle cx={40} cy={-30} r={12} fill={luz ? "#43e08a" : "#3a4a3a"} />
          <g transform={`rotate(${-20 - toque * 35} -60 0)`}><rect x={-160} y={-8} width={100} height={16} rx={8} fill="#8a96a8" stroke={TINTA} strokeWidth={4} /><circle cx={-162} cy={0} r={16} fill="#ffd6f0" stroke={TINTA} strokeWidth={4} /></g>
        </g>
        {relogio && <g transform={`translate(830 1130) scale(${eback(ramp(lf, ciclo2[0], ciclo2[0] + 6))})`}><circle r={56} fill="#fff" stroke={TINTA} strokeWidth={6} /><line x1={0} y1={0} x2={0} y2={-40} stroke={TINTA} strokeWidth={6} transform={`rotate(${(lf - ciclo2[0]) * 9})`} /><text y={100} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={28} fill={TINTA}>atraso</text></g>}
      </Camera>
      {/* trajetórias do sinal: alinhadas (sem atraso) e desalinhadas (com atraso) */}
      <Tela>
        <g transform="translate(540 300)" opacity={clamp01(ramp(lf, 30, 40))}>
          <rect x={-420} y={-110} width={840} height={220} rx={20} fill="#ffffff" stroke={TINTA} strokeWidth={5} />
          <text x={-390} y={-60} fontFamily="Montserrat" fontWeight={900} fontSize={26} fill={TINTA}>previsão</text>
          <text x={-390} y={40} fontFamily="Montserrat" fontWeight={900} fontSize={26} fill={TINTA}>toque</text>
          <path d="M -230,-70 L -60,-70 L -40,-110 L -20,-30 L 0,-70 L 380,-70" fill="none" stroke={AZUL_PREV} strokeWidth={7} />
          <path d={`M -230,30 L ${-60 + desalinha * 200},30 L ${-40 + desalinha * 200},-10 L ${-20 + desalinha * 200},70 L ${desalinha * 200},30 L 380,30`} fill="none" stroke={LARANJA} strokeWidth={7} />
          <text x={0} y={95} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={24} fill={TINTA}>{desalinha > 0.5 ? "com atraso: previsão menos precisa" : "sem atraso: combinam"}</text>
        </g>
      </Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 10 PARA QUE SERVE
export const Cena10: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const folhaEm = P("ambiente") - 40;
  const para = clamp01(ramp(lf, folhaEm + 36, folhaEm + 44));
  const anda = lf < folhaEm + 40 ? lf : folhaEm + 40 + (lf - folhaEm - 40) * 0.05;
  const x = 100 + anda * 3.2;
  const pose: Pose = para < 1 ? andando(lf, 1.6, 2) : { ...parado(lf, 2), virar: 0.4, olhar: [0.6, 0.6 + 0.2 * clamp01((lf - folhaEm - 44) / 20)], bracoE: [30, 40] };
  const ombro: [number, number] = [x - 60, 1880 - 400];
  const u = clamp01(ramp(lf, folhaEm, folhaEm + 40));
  const fx = lerp(x + 300, ombro[0] - 10, u) + Math.sin(u * 8) * 40, fy = lerp(700, ombro[1] + 40, u);
  const cai = clamp01(ramp(lf, folhaEm + 44, dur));
  const meu = (lf % 30) < 8 && para < 1;
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, x + 120, 1350, 1.2], [dur, x + 100, 1350, 1.3]]} deriva={0}>
        <rect x={-1000} y={-600} width={5000} height={2600} fill="#bfe9ff" />
        {[[-200, 1500, 1.2], [500, 1520, 1.0], [1200, 1480, 1.3], [1800, 1520, 1.1]].map(([ax, ay, s], i) => <ArvoreParque key={i} x={ax} y={ay} s={s} f={lf} />)}
        <rect x={-1000} y={1500} width={5000} height={1000} fill="#7fd36a" />
        <rect x={-1000} y={1780} width={5000} height={180} fill="#e8c78f" />
        {Array.from({ length: 6 }, (_, i) => <Folha key={i} x={((i * 400 + lf * 2) % 2400) - 300} y={600 + i * 90 + Math.sin(lf * 0.05 + i) * 30} r={lf * 3 + i * 50} cor={i % 2 ? "#7fd36a" : "#f2b33a"} />)}
        <Pessoa v={PROTAG} id="co04-prot-c10" x={x} y={1880} escala={1.0} pose={pose} expr={para > 0.5 ? EXPRESSOES.surpreso : EXPRESSOES.sereno} f={lf} seed={2} />
        {/* a folha solta viaja até o braço e depois cai */}
        <Folha x={cai > 0 ? ombro[0] - 10 + cai * 30 : fx} y={cai > 0 ? ombro[1] + 40 + cai * 340 : fy} r={lf * 6} cor="#f2b33a" />
        {meu && <MarcasToque x={x + 90} y={1880 - 300} f={lf} forca={0.4} cor="#ffffff" />}
      </Camera>
      <Tela>
        <Tag f={lf} em={P("movimentos") - 4} ate={P("movimentos") + 40} t="MEU MOVIMENTO" x={540} y={330} tam={52} />
        <Tag f={lf} em={P("ambiente") - 2} ate={dur + 10} t="AMBIENTE" x={540} y={330} tam={60} fundo="#7fd36a" />
      </Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 11 PREVISÕES NO COTIDIANO
export const Cena11: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const q = dur / 4;
  const fase = Math.min(3, Math.floor(lf / q));
  const t = clamp01((lf - fase * q) / q);
  const alcance = Math.sin(clamp01(t * 1.4) * Math.PI);
  let pose: Pose = parado(lf, 2);
  let olhar: [number, number] = [0.3, 0.6];
  if (fase === 0) pose = { ...pose, bracoD: [lerp(12, 70, eio(clamp01(t * 2))), lerp(10, 50, eio(clamp01(t * 2)))] };
  if (fase === 1) pose = { ...pose, bracoD: [lerp(12, 55, alcance), 10], tronco: 6 * alcance };
  if (fase === 2) pose = { ...pose, bracoD: [lerp(12, 80, alcance), 20], tronco: 4 * alcance };
  if (fase === 3) { pose = { ...pose, bracoD: [lerp(12, 150, alcance), lerp(10, 140, alcance)] }; olhar = [0.2, 0.7]; }
  const PXc = 460, PYc = 1800;
  const mao = maoDe(PXc, PYc, 1.0, pose, 1);
  const copoNaMao = fase === 0 && t > 0.45;
  const copo: [number, number] = copoNaMao ? [mao[0] + 10, mao[1] - 20] : [700, 1440];
  const porta = fase === 2 ? eio(clamp01((t - 0.3) * 2)) : fase === 3 ? 1 : 0;
  const prev = fase < 4 ? 0.5 + 0.5 * Math.sin(lf * 0.3) : 0;
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 1300, 1250, 2.4], [14, 640, 1300, 1.25], [q * 2 - 6, 640, 1300, 1.25], [q * 2 + 6, 760, 1260, 1.35], [q * 3, 760, 1260, 1.35], [q * 3 + 10, 480, 1260, 1.8], [dur, 480, 1250, 1.9]]} deriva={0}>
        <rect x={-600} y={-400} width={2600} height={2800} fill="#fde8d0" />
        <rect x={-600} y={1720} width={2600} height={700} fill="#c89a6a" />
        {/* porta com dobradiça (gira) */}
        <g transform="translate(900 1720)">
          <rect x={-10} y={-640} width={330} height={640} fill="#6b4a3a" />
          <g transform={`scale(${1 - porta * 0.82} 1)`}><rect x={0} y={-630} width={300} height={630} fill="#e8a35a" stroke={TINTA} strokeWidth={8} /><circle cx={260} cy={-320} r={16} fill="#ffd23f" stroke={TINTA} strokeWidth={4} /></g>
          {porta > 0.3 && <rect x={60} y={-600} width={240} height={560} fill="#bfe9ff" opacity={porta} />}
        </g>
        {/* mesa */}
        <rect x={500} y={1460} width={360} height={30} rx={6} fill="#8a5a3c" stroke={TINTA} strokeWidth={6} />
        <rect x={530} y={1490} width={20} height={230} fill="#8a5a3c" /><rect x={810} y={1490} width={20} height={230} fill="#8a5a3c" />
        <Pessoa v={PROTAG} id="co04-prot-c11" x={PXc} y={PYc} escala={1.0} pose={{ ...pose, olhar }} expr={EXPRESSOES.sereno} f={lf} seed={2} />
        {/* copo de água (não teleporta: segue a mão) */}
        <g transform={`translate(${copo[0]} ${copo[1]})`}>
          <path d="M -28,-70 L 28,-70 L 22,0 L -22,0 Z" fill="#dff6ff" stroke={TINTA} strokeWidth={5} opacity={0.9} />
          <path d={`M -25,${-40 + Math.sin(lf * 0.4) * 3} L 25,${-40 - Math.sin(lf * 0.4) * 3} L 22,0 L -22,0 Z`} fill="#5aa8ff" opacity={0.7} />
        </g>
        {/* contorno azul discreto = previsão acompanhando cada gesto */}
        <circle cx={mao[0]} cy={mao[1]} r={36 + prev * 10} fill="none" stroke={AZUL_PREV} strokeWidth={5} opacity={0.6} />
      </Camera>
    </AbsoluteFill>
  );
};

// ================================================================== 12 VOCÊ ACABOU DE TENTAR?
export const Cena12: C = ({ inicio, fim }) => {
  const { lf, P, T } = useCena(inicio);
  const dur = fim - inicio;
  const fimNarr = T.fala("c12_tentou").fim - inicio;
  const olha = eio(ramp(lf, 4, 16)) * (1 - eio(ramp(lf, 40, 50)));
  const auto = eio(ramp(lf, 46, 58)) * (1 - eio(ramp(lf, 100, 112)));
  const pergunta = eio(ramp(lf, P("Agora") - 4, P("Agora") + 10));
  const prot = sentado(lf, {
    ...(olha > 0 ? olhaMao(olha) : auto > 0 ? autoCocega(lf, auto) : { bracoD: [lerp(12, 60, pergunta), lerp(22, 100, pergunta)] as [number, number] }),
    olhar: pergunta > 0.5 ? [0, 0] : olha > 0 ? [0.5, 0.5] : [0.3, 0.3],
  });
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 560, 1300, 1.45], [P("cérebro"), 600, 1260, 1.8], [P("Agora"), 600, 1240, 2.0], [dur, 600, 1220, 2.35]]} deriva={0}>
        <Sala lf={lf} prot={prot} exprP={exprEm(lf, [[0, "feliz"], [50, "desconfiado"], [P("esperando") - 2, "surpreso"], [P("Agora") - 2, "feliz"]], 8)} poltrona
          amigo={{ x: 280, pose: { ...parado(lf, 9), agachar: 30, bracoE: [20, 40], bracoD: [20, 40], virar: 0.5, olhar: [0.8, 0] }, expr: EXPRESSOES.sereno }} />
      </Camera>
      <Tela><Tag f={lf} em={fimNarr + 4} ate={dur + 30} t="VOCÊ TENTOU? 😂" y={420} tam={76} /></Tela>
    </AbsoluteFill>
  );
};
