// As 10 cenas do episódio, uma por bloco narrado (IDs do projeto.json). Remotion = motor principal.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Camera } from "../../engine/src/kit/Camera";
import { Personagem } from "../../engine/src/kit/Personagem";
import { parado, falando, apontando, pensando, olhandoCelular, poseEm, misturaPose, Pose } from "../../engine/src/kit/poses";
import { exprEm, misturaExpr, EXPRESSOES } from "../../engine/src/kit/expressoes";
import { chaves, clamp01, eback, eio, eout, piscar, ramp } from "../../engine/src/kit/anim";
import { Particulas } from "../../engine/src/kit/efeitos";
import { CerebroLateral, Torax, Circulacao, PescocoSensores, Agua, TINTA, O2, CO2, AMARELO } from "./anatomia";
import { RAFAEL, CIENTISTA, EST, EST_QUENTE, Sala, SalaFrente, useCena } from "./elenco";

const W = 1080, H = 1920;
type C = React.FC<{ inicio: number; fim: number }>;

// Rafael sentado no sofá: em pé atrás da mesa baixa (a mesa esconde as pernas) — quadril na altura do assento.
const RX = 540, RY = 1745, RS = 1.2; // pés (escondidos), escala
const CABECA: [number, number] = [RX, RY - RS * 530]; // centro da cabeça no mundo
const PEITO: [number, number] = [RX, RY - RS * 380];

const Rotulo: React.FC<{ f: number; em: number; ate?: number; texto: string; y?: number; cor?: string; fundo?: string; tam?: number }> = ({
  f, em, ate = 1e9, texto, y = 300, cor = TINTA, fundo = AMARELO, tam = 66,
}) => {
  if (f < em || f > ate) return null;
  const s = eback(ramp(f, em, em + 9)) * (1 - ramp(f, ate - 6, ate));
  const w = texto.length * tam * 0.56 + 80;
  return (
    <g transform={`translate(540 ${y}) rotate(-2) scale(${s})`}>
      <rect x={-w / 2 + 8} y={-tam * 0.8 + 10} width={w} height={tam * 1.5} rx={20} fill={TINTA} opacity={0.45} />
      <rect x={-w / 2} y={-tam * 0.8} width={w} height={tam * 1.5} rx={20} fill={fundo} stroke={TINTA} strokeWidth={7} />
      <text y={tam * 0.32} textAnchor="middle" fontFamily="Anton" fontSize={tam} fill={cor} letterSpacing={1}>{texto}</text>
    </g>
  );
};
const Sobre: React.FC<{ children: React.ReactNode }> = ({ children }) => <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>{children}</svg>;

/** Raio-X: brilho azulado translúcido sobre uma área (transição para dentro do corpo). */
const RaioX: React.FC<{ cx: number; cy: number; rx: number; ry: number; o: number; children: React.ReactNode; id: string }> = ({ cx, cy, rx, ry, o, children, id }) => (
  <g opacity={o}>
    <clipPath id={id}><ellipse cx={cx} cy={cy} rx={rx} ry={ry} /></clipPath>
    <g clipPath={`url(#${id})`}>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#0d1b3a" opacity={0.82} />
      {children}
    </g>
    <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke="#7fd0ff" strokeWidth={6} opacity={0.7} />
  </g>
);

const rafaelSentado = (lf: number, extra: Partial<Pose> = {}): Pose => ({ ...parado(lf, 5), bracoE: [14, 30], bracoD: [14, 30], ...extra });

// ================================================================== 01 GANCHO
export const Cena01: C = ({ inicio }) => {
  const { lf, P } = useCena(inicio);
  const perc = P("percebe"), resp = P("respirar");
  const xr = eio(ramp(lf, perc + 2, perc + 16));
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, CABECA[0], CABECA[1] + 60, 2.3], [perc, CABECA[0] + 10, CABECA[1] + 30, 2.8, -1], [resp + 20, CABECA[0] + 20, CABECA[1] + 10, 3.2, -2]]} deriva={0.5}>
        <Sala f={lf} />
        <Personagem id="rafa-1" x={RX} y={RY} escala={RS} visual={RAFAEL} estilo={EST} pose={rafaelSentado(lf, { olhar: [0, 0], cabecaIncl: -2 })}
          expr={exprEm(lf, [[0, "neutro"], [perc - 4, "pensativo"]])} olhosAbertos={piscar(lf, 5)} />
        <SalaFrente f={lf} />
        <RaioX id="xr1" cx={CABECA[0]} cy={CABECA[1] - 10} rx={112} ry={120} o={xr}>
          <g transform={`translate(${CABECA[0] + 4} ${CABECA[1] - 30}) scale(0.32)`}><CerebroLateral f={lf} tronco={xr} sinais={xr} /></g>
        </RaioX>
      </Camera>
      <Sobre><Rotulo f={lf} em={perc} texto="SEU CÉREBRO PERCEBE!" y={330} /></Sobre>
    </AbsoluteFill>
  );
};

// ================================================================== 02 O OUTRO GÁS
export const Cena02: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const existe = P("Existe"), outro = P("outro"), dur = fim - inicio;
  if (lf < existe - 4) {
    // pequeno movimento natural (respira fundo), câmera desce da cabeça ao tórax e o raio-X revela os pulmões
    const respira = Math.sin(clamp01(lf / 40) * Math.PI);
    const xr = eio(ramp(lf, existe - 40, existe - 12));
    return (
      <AbsoluteFill>
        <Camera inicio={inicio} chaves={[[0, CABECA[0] + 40, CABECA[1], 3.0], [20, CABECA[0], CABECA[1] + 20, 2.2], [existe - 14, PEITO[0], PEITO[1] + 20, 2.3], [existe - 4, PEITO[0], PEITO[1] + 30, 3.2]]} deriva={0.3}>
          <Sala f={lf} />
          <Personagem id="rafa-2" x={RX} y={RY} escala={RS} visual={RAFAEL} estilo={EST}
            pose={rafaelSentado(lf, { bob: -8 * respira, bracoE: [14 + 10 * respira, 30], bracoD: [14 + 10 * respira, 30], cabecaIncl: -4 * respira, respirar: lf * 0.09 })}
            expr={EXPRESSOES.pensativo} olhosAbertos={piscar(lf, 5)} />
          <SalaFrente f={lf} />
          <path d={`M ${CABECA[0] + 8},${CABECA[1] + 40} L ${PEITO[0] + 8},${PEITO[1]}`} stroke={AMARELO} strokeWidth={6} strokeDasharray="14 10" strokeDashoffset={-lf * 3} opacity={clamp01(ramp(lf, 18, 30))} />
          <RaioX id="xr2" cx={PEITO[0]} cy={PEITO[1] + 20} rx={150} ry={170} o={xr}>
            <g transform={`translate(${PEITO[0]} ${PEITO[1] + 10}) scale(0.4)`}><Torax f={lf} expansao={0.5 + 0.5 * respira} co2={0.25} o2={0.8} costelas={false} /></g>
          </RaioX>
        </Camera>
      </AbsoluteFill>
    );
  }
  // pulmões em corte frontal: azul (O2) e laranja (CO2); o laranja vai aumentando
  const co2 = chaves(lf, [[existe, 0.25], [dur, 0.75]]);
  const mergulho = eio(ramp(lf, dur - 26, dur));
  return (
    <AbsoluteFill style={{ backgroundColor: "#16112a" }}>
      <Camera inicio={inicio} chaves={[[existe - 4, 540, 960, 1.0], [outro, 540, 920, 1.12], [dur - 26, 600, 900, 1.2], [dur, 735, 800, 3.4]]} deriva={0.4}>
        <rect x={-600} y={-500} width={2300} height={3000} fill="#16112a" />
        <Particulas tipo="poeira" n={30} seed={21} cor="#8fb5ff" opacidade={0.5} />
        <g transform="translate(540 1000) scale(1.05)"><Torax f={lf} expansao={0.55} co2={co2} o2={0.75} /></g>
        {/* partícula laranja que vamos seguir até o sangue */}
        <circle cx={735 + mergulho * 10} cy={800} r={14 + mergulho * 6} fill={CO2} stroke={TINTA} strokeWidth={3} opacity={clamp01(ramp(lf, dur - 40, dur - 30))} />
        {/* legenda das cores */}
        <g transform="translate(150 1580)"><circle r={18} fill={O2} stroke={TINTA} strokeWidth={4} /><text x={34} y={14} fontFamily="Montserrat" fontWeight={900} fontSize={40} fill="#fff">oxigênio</text></g>
        <g transform="translate(600 1580)"><circle r={18} fill={CO2} stroke={TINTA} strokeWidth={4} /><text x={34} y={14} fontFamily="Montserrat" fontWeight={900} fontSize={40} fill="#fff">gás carbônico</text></g>
      </Camera>
      <Sobre><Rotulo f={lf} em={outro - 4} ate={dur - 20} texto="QUAL GÁS ESTÁ MUDANDO?" y={300} tam={60} /></Sobre>
    </AbsoluteFill>
  );
};

// ================================================================== 03 GÁS CARBÔNICO NO SANGUE
export const Cena03: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio, acum = P("acumulando");
  const co2 = chaves(lf, [[0, 0.25], [P("produzindo"), 0.4], [acum, 0.7], [dur, 0.95]]);
  return (
    <AbsoluteFill style={{ backgroundColor: "#2a0f22" }}>
      <Camera inicio={inicio} chaves={[[0, 540, 930, 1.6], [12, 540, 930, 1.05], [P("gastando"), 520, 760, 1.25], [P("produzindo") + 20, 560, 1100, 1.2], [dur, 600, 930, 1.12]]} deriva={0.4}>
        <Circulacao f={lf + inicio} o2={0.75} co2={co2} />
      </Camera>
      <Sobre>
        <g transform="translate(60 1560)"><circle cx={20} cy={-14} r={16} fill={O2} stroke={TINTA} strokeWidth={4} /><text x={50} y={0} fontFamily="Montserrat" fontWeight={900} fontSize={38} fill="#fff">O₂ entra nas células</text></g>
        <g transform="translate(60 1630)"><circle cx={20} cy={-14} r={16} fill={CO2} stroke={TINTA} strokeWidth={4} /><text x={50} y={0} fontFamily="Montserrat" fontWeight={900} fontSize={38} fill="#fff">CO₂ sai para o sangue</text></g>
        <Rotulo f={lf} em={acum - 6} texto="CO₂ AUMENTANDO" y={300} fundo={CO2} />
      </Sobre>
    </AbsoluteFill>
  );
};

// ================================================================== 04 SISTEMA DE ALERTA (sensores e pH)
export const Cena04: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const passos: [number, string, string][] = [[P("mais") - 2, "CO₂ SOBE", CO2], [P("acidez") - 2, "pH MUDA", "#c779ff"], [P("vontade") - 4, "SINAL RESPIRATÓRIO AUMENTA", AMARELO]];
  const per = clamp01(ramp(lf, P("Sensores") - 4, P("Sensores") + 8)), cen = clamp01(ramp(lf, P("detectam") - 2, P("detectam") + 10));
  return (
    <AbsoluteFill style={{ backgroundColor: "#0c1430" }}>
      <Camera inicio={inicio} chaves={[[0, 540, 1150, 1.0], [P("Sensores"), 600, 1150, 1.15], [P("detectam") + 6, 700, 900, 1.45], [dur, 720, 880, 1.55]]} deriva={0.3}>
        <rect x={-600} y={-500} width={2300} height={3000} fill="#0c1430" />
        {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={(i * 173 + lf * 2) % 1400 - 160} cy={300 + ((i * 271) % 1500)} r={8} fill={CO2} opacity={0.35} />)}
        <g transform="translate(430 1160)"><PescocoSensores f={lf} periferico={per} central={cen} sinal={cen} /></g>
      </Camera>
      <Sobre>
        {passos.map(([em, t, cor], i) => lf >= em && (
          <g key={i} transform={`translate(540 ${250 + i * 120}) scale(${eback(ramp(lf, em, em + 8))})`}>
            <rect x={-(t.length * 17 + 40)} y={-46} width={t.length * 34 + 80} height={80} rx={16} fill={TINTA} stroke={cor} strokeWidth={6} opacity={0.94} />
            <text y={16} textAnchor="middle" fontFamily="Anton" fontSize={50} fill={cor}>{t}</text>
            {i < 2 && lf >= passos[i + 1][0] && <text y={86} textAnchor="middle" fontFamily="Anton" fontSize={44} fill="#fff">↓</text>}
          </g>
        ))}
        {per > 0.5 && <g transform="translate(140 1560)"><rect x={-30} y={-30} width={560} height={58} rx={14} fill={TINTA} opacity={0.85} /><circle r={14} fill={AMARELO} /><text x={30} y={12} fontFamily="Montserrat" fontWeight={900} fontSize={34} fill="#fff">sensor periférico (carótida)</text></g>}
        {cen > 0.5 && <g transform="translate(140 1628)"><rect x={-30} y={-30} width={680} height={58} rx={14} fill={TINTA} opacity={0.85} /><circle r={14} fill="none" stroke={AMARELO} strokeWidth={5} /><text x={30} y={12} fontFamily="Montserrat" fontWeight={900} fontSize={34} fill="#fff">sensores centrais (tronco encefálico)</text></g>}
      </Sobre>
    </AbsoluteFill>
  );
};

// ================================================================== 05 TRONCO ENCEFÁLICO + controle automático
export const Cena05: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio, auto = P("respiração") - 4, pens = P("pensando") - 6;
  const destaque = eio(ramp(lf, P("tronco") - 6, P("tronco") + 10));
  const paineis = eout(ramp(lf, auto, auto + 12));
  return (
    <AbsoluteFill style={{ backgroundColor: "#141b3d" }}>
      <Camera inicio={inicio} chaves={[[0, 540, 760, 1.0], [P("tronco"), 560, 820, 1.2], [auto, 600, 880, 1.45], [dur, 600, 880, 1.5]]} deriva={0.3}>
        <rect x={-600} y={-500} width={2300} height={3000} fill="#141b3d" />
        <g transform="translate(520 700) scale(1.15)"><CerebroLateral f={lf} tronco={destaque} circuitos={destaque} sinais={destaque} /></g>
      </Camera>
      <Sobre>
        {paineis > 0 && [0, 1].map((i) => {
          const x = i ? 790 : 290, y = 1310;
          const respira = 0.5 + 0.5 * Math.sin(lf * 0.12 + i);
          return (
            <g key={i} transform={`translate(${x} ${y + (1 - paineis) * 600})`}>
              <clipPath id={`pn${i}`}><rect x={-235} y={-230} width={470} height={430} rx={26} /></clipPath>
              <g clipPath={`url(#pn${i})`}>
                <rect x={-235} y={-230} width={470} height={430} fill={i ? "#1d2a5a" : "#f6e7c8"} />
                {i === 0 ? (
                  <g>
                    <rect x={-235} y={60} width={470} height={160} rx={30} fill="#3d7bd9" stroke={TINTA} strokeWidth={6} />
                    <Personagem id="rafa-ler" x={0} y={330} escala={0.62} visual={RAFAEL} estilo={EST}
                      pose={{ ...olhandoCelular(lf, 7, 0.1), bob: -respira * 5, olhar: [0.3, 0.8] }} expr={EXPRESSOES.sereno} olhosAbertos={piscar(lf, 7)}
                      itemD={<g transform="translate(0 -20)"><rect x={-60} y={-44} width={120} height={88} rx={6} fill="#e4572e" stroke={TINTA} strokeWidth={5} /><line x1={0} x2={0} y1={-44} y2={44} stroke={TINTA} strokeWidth={4} /></g>} />
                  </g>
                ) : (
                  <g>
                    {Array.from({ length: 10 }, (_, k) => <circle key={k} cx={-200 + k * 45} cy={-190 + (k % 3) * 20} r={3} fill="#fff" opacity={0.7} />)}
                    <rect x={-235} y={90} width={470} height={140} fill="#6b4a3a" />
                    <ellipse cx={-120} cy={60} rx={80} ry={36} fill="#f1f0ff" stroke={TINTA} strokeWidth={6} />
                    <g transform="rotate(-90 120 70)">
                      <Personagem id="rafa-dorme" x={120} y={70} escala={0.5} visual={RAFAEL} estilo={EST} pose={{ ...parado(lf, 9), bracoE: [10, 20], bracoD: [10, 20] }} expr={EXPRESSOES.sereno} olhosAbertos={0} />
                    </g>
                    <path d={`M -170,${70 - respira * 8} C -40,${30 - respira * 10} 120,${30 - respira * 10} 235,60 L 235,140 L -170,140 Z`} fill="#3f6fb5" stroke={TINTA} strokeWidth={6} />
                    <text x={150} y={-110} fontFamily="Anton" fontSize={60} fill="#fff" opacity={0.8}>z z</text>
                  </g>
                )}
              </g>
              <rect x={-235} y={-230} width={470} height={430} rx={26} fill="none" stroke={TINTA} strokeWidth={8} />
              <text y={250} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={36} fill="#fff">{i ? "dormindo" : "lendo"}</text>
            </g>
          );
        })}
        <Rotulo f={lf} em={pens} texto="CONTROLE AUTOMÁTICO" y={300} fundo={CO2} />
      </Sobre>
    </AbsoluteFill>
  );
};

// ================================================================== 06 A VONTADE DE RESPIRAR (sala, desconforto, diafragma)
export const Cena06: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio, peito = P("peito"), atento = P("atento");
  const desc = clamp01(ramp(lf, 0, dur * 0.8));
  const expr = misturaExpr(EXPRESSOES.pensativo, misturaExpr(EXPRESSOES.desconfiado, EXPRESSOES.medo, 0.45), desc);
  const xr = eio(ramp(lf, atento - 8, atento + 6));
  const tensao = desc * 10;
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 540, 1250, 1.15], [peito - 4, CABECA[0], CABECA[1] + 30, 2.4], [atento - 8, CABECA[0], CABECA[1] + 40, 2.5], [atento + 8, PEITO[0], PEITO[1] + 40, 2.0], [dur, PEITO[0], PEITO[1] + 30, 2.15]]} deriva={0.4}>
        <Sala f={lf} />
        <Personagem id="rafa-6" x={RX} y={RY} escala={RS} visual={RAFAEL} estilo={EST}
          pose={rafaelSentado(lf, { bob: -tensao, bracoE: [6, 40 + tensao * 3], bracoD: [6, 40 + tensao * 3], cabecaIncl: -desc * 4, tronco: Math.sin(lf * 0.3) * desc * 0.8 })}
          expr={{ ...expr, sobInt: expr.sobInt + Math.sin(lf * 0.2) * 3 * desc, suor: desc > 0.6 ? (desc - 0.6) * 2 : 0 }} olhosAbertos={piscar(lf, 5)} />
        <SalaFrente f={lf} />
        <RaioX id="xr6" cx={PEITO[0]} cy={PEITO[1] + 40} rx={160} ry={190} o={xr}>
          <g transform={`translate(${PEITO[0]} ${PEITO[1] + 20}) scale(0.42)`}><Torax f={lf} expansao={0.6} co2={0.8} o2={0.55} destaqueDiafragma={1} /></g>
        </RaioX>
      </Camera>
    </AbsoluteFill>
  );
};

// ================================================================== 07 O DIAFRAGMA TENTA AGIR
export const Cena07: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio, inv = P("involuntários");
  const k = (lf - inv) % 26;
  const tremor = lf >= inv ? (k < 4 ? -k * 4 : k < 10 ? -16 + (k - 4) * 2.7 : 0) : 0; // contração breve, nada violento
  const inset = eout(ramp(lf, P("corpo") - 6, P("corpo") + 6));
  return (
    <AbsoluteFill style={{ backgroundColor: "#16112a" }}>
      <Camera inicio={inicio} chaves={[[0, 540, 1000, 1.0], [inv, 540, 1150, 1.25], [dur, 540, 1170, 1.32]]} deriva={0.3}>
        <rect x={-600} y={-500} width={2300} height={3000} fill="#16112a" />
        <g transform="translate(540 1000) scale(1.05)"><Torax f={lf} expansao={0.55} co2={0.85} o2={0.5} diafragmaTremor={tremor} nervos={clamp01(ramp(lf, 6, 20))} destaqueDiafragma={1} /></g>
        {lf >= inv && (
          <g transform={`translate(780 ${1270 + tremor})`} opacity={clamp01(ramp(lf, inv, inv + 8))}>
            <path d="M 0,-110 L 0,-20 M -26,-48 L 0,-18 L 26,-48" stroke={AMARELO} strokeWidth={12} fill="none" strokeLinecap="round" />
            <text x={-30} y={-130} textAnchor="end" fontFamily="Montserrat" fontWeight={900} fontSize={34} fill="#fff">contração involuntária</text>
          </g>
        )}
      </Camera>
      <Sobre>
        <Rotulo f={lf} em={4} texto="DIAFRAGMA" y={300} fundo="#4f86e8" cor="#fff" />
        {inset > 0 && (
          <g transform={`translate(840 640) scale(${inset})`}>
            <clipPath id="inset7"><circle r={170} /></clipPath>
            <g clipPath="url(#inset7)">
              <rect x={-200} y={-200} width={400} height={400} fill="#f6e7c8" />
              <Personagem id="rafa-7" x={0} y={560} escala={1.0} visual={RAFAEL} estilo={EST} pose={rafaelSentado(lf, { bob: -8 })}
                expr={{ ...misturaExpr(EXPRESSOES.desconfiado, EXPRESSOES.medo, 0.5), suor: 0.6 }} olhosAbertos={piscar(lf, 5)} />
            </g>
            <circle r={170} fill="none" stroke={TINTA} strokeWidth={10} />
          </g>
        )}
      </Sobre>
    </AbsoluteFill>
  );
};

// ================================================================== 08 O VERDADEIRO PERIGO
export const Cena08: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio, perig = P("perigoso"), extr = P("extremas") - 2;
  const o2 = chaves(lf, [[0, 0.7], [perig, 0.35], [extr, 0.25]]);
  if (lf >= extr) {
    return (
      <AbsoluteFill style={{ backgroundColor: "#0a2e57" }}>
        <Camera inicio={inicio} chaves={[[extr, 540, 960, 1.15], [dur, 540, 960, 1.05]]} deriva={0.2}>
          <Agua f={lf} />
        </Camera>
        <Sobre>
          <g transform={`translate(540 760) scale(${eback(ramp(lf, extr, extr + 10))})`}>
            <path d="M 0,-170 L 160,110 L -160,110 Z" fill={AMARELO} stroke={TINTA} strokeWidth={12} strokeLinejoin="round" />
            <text y={80} textAnchor="middle" fontFamily="Anton" fontSize={190} fill={TINTA}>!</text>
          </g>
          <Rotulo f={lf} em={extr + 4} texto="RISCO ESPECIAL NA ÁGUA" y={1080} fundo="#ffffff" />
          <text x={540} y={1200} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={34} fill="#d6efff" opacity={clamp01(ramp(lf, extr + 10, extr + 20))}>não faça desafios de fôlego</text>
        </Sobre>
      </AbsoluteFill>
    );
  }
  const aviso = clamp01(ramp(lf, perig - 4, perig + 6));
  return (
    <AbsoluteFill style={{ backgroundColor: "#2a0f22" }}>
      <Camera inicio={inicio} chaves={[[0, 540, 930, 1.2], [perig, 560, 930, 1.3], [extr, 560, 930, 1.35]]} deriva={0.3}>
        <Circulacao f={lf + inicio} o2={o2} co2={0.9} brilhoAzul={0.4 + o2} />
      </Camera>
      <Sobre>
        <g transform="translate(830 360)">
          <circle r={190} fill="#141b3d" stroke={aviso > 0 ? "#ff4d4d" : TINTA} strokeWidth={10} />
          <g transform="translate(-10 -20) scale(0.5)"><CerebroLateral f={lf} sinais={1} alerta={aviso} /></g>
          <text y={160} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={28} fill="#fff">{aviso > 0 ? "risco" : "atividade normal"}</text>
        </g>
        <g transform="translate(90 1560)"><circle cx={20} cy={-14} r={16} fill={O2} opacity={0.4 + o2} stroke={TINTA} strokeWidth={4} /><text x={50} y={0} fontFamily="Montserrat" fontWeight={900} fontSize={40} fill="#fff">oxigênio diminuindo</text></g>
      </Sobre>
    </AbsoluteFill>
  );
};

// ================================================================== 09 A SEGUNDA REVELAÇÃO (gráficos via HyperFrames)
export const Cena09: C = ({ inicio }) => {
  const { lf, P } = useCena(inicio);
  return (
    <AbsoluteFill style={{ backgroundColor: "#f6e7c8" }}>
      <Camera inicio={inicio} chaves={[[0, 540, 960, 1.0], [P("perigosamente"), 540, 960, 1.04]]} deriva={0.2}>
        <rect x={-600} y={-500} width={2300} height={3000} fill="#f6e7c8" />
        {Array.from({ length: 40 }, (_, i) => <line key={i} x1={-600} x2={1700} y1={-400 + i * 70} y2={-400 + i * 70} stroke="#e2cfa6" strokeWidth={3} />)}
        <Personagem id="cientista" x={880} y={1900} escala={0.98} dir={-1} visual={CIENTISTA} estilo={EST}
          pose={poseEm(lf, [[0, (x) => falando(x, 31, 0.6)], [P("relógio") - 4, (x) => apontando(x, 140, 31)], [P("perigosamente") - 4, (x) => apontando(x, 115, 31)]], 7)}
          expr={exprEm(lf, [[0, "pensativo"], [P("perigosamente") - 2, "desconfiado"]])} olhosAbertos={piscar(lf, 31)} />
      </Camera>
    </AbsoluteFill>
  );
};

// ================================================================== 10 RESPOSTA FINAL
export const Cena10: C = ({ inicio, fim }) => {
  const { lf, P, T } = useCena(inicio);
  const dur = fim - inicio, sistema = P("sistema"), vivo = P("vivo"), impr = P("Impressionante");
  const xr = eio(ramp(lf, sistema - 6, sistema + 6)) * (1 - eio(ramp(lf, vivo - 20, vivo - 6)));
  const respira = 0.5 + 0.5 * Math.sin(lf * 0.1);
  const quente = clamp01(ramp(lf, 0, dur * 0.6));
  const XV = 400, YV = 1745; // Rafael em pé perto da janela
  const peito: [number, number] = [XV, YV - RS * 380], cab: [number, number] = [XV, YV - RS * 530];
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 620, 1150, 1.25], [sistema, peito[0], peito[1] + 20, 1.9], [vivo - 10, cab[0], cab[1] + 30, 2.3], [dur, cab[0] - 20, cab[1] + 40, 2.55]]} deriva={0.4}>
        <Sala f={lf} quente={quente} />
        <Personagem id="rafa-10" x={XV} y={YV} escala={RS} visual={RAFAEL} estilo={EST_QUENTE}
          pose={{ ...parado(lf, 5), bob: -respira * 6, bracoE: [10 + respira * 4, 12], bracoD: [10 + respira * 4, 12], virar: 0.35, olhar: lf < vivo ? [0.9, -0.5] : [0, 0], cabecaIncl: lf < vivo ? -6 : 3 }}
          expr={exprEm(lf, [[0, "sereno"], [P("Seu") - 2, "surpreso"], [vivo - 2, "maravilhado"], [impr, "feliz"]], 6)} olhosAbertos={piscar(lf, 5)} />
        <RaioX id="xr10" cx={peito[0]} cy={peito[1] + 40} rx={160} ry={190} o={xr}>
          <g transform={`translate(${peito[0]} ${peito[1] + 20}) scale(0.42)`}><Torax f={lf} expansao={respira} co2={0.25} o2={0.85} /></g>
          {Array.from({ length: 6 }, (_, i) => { const u = ((lf * 0.03 + i / 6) % 1); return <circle key={i} cx={peito[0] - 4} cy={peito[1] - 160 + u * 140} r={7} fill={O2} opacity={1 - u} />; })}
        </RaioX>
      </Camera>
      {lf >= impr - 4 && (
        <Sobre>
          <g transform={`translate(540 360) scale(${eback(ramp(lf, impr - 4, impr + 8))})`}>
            <rect x={-470} y={-110} width={940} height={210} rx={24} fill="#fff8e6" stroke={TINTA} strokeWidth={8} />
            <text y={-20} textAnchor="middle" fontFamily="Anton" fontSize={64} fill={TINTA}>SEU CORPO TRABALHA</text>
            <text y={62} textAnchor="middle" fontFamily="Anton" fontSize={64} fill="#e4572e">ATÉ SEM VOCÊ PERCEBER.</text>
          </g>
        </Sobre>
      )}
    </AbsoluteFill>
  );
};
