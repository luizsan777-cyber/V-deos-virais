// MEGA DA VIRADA — como funciona e por que é tão difícil acertar os seis. 2D família do canal.
// Abertura é ENCENAÇÃO (o avatar imagina que ganhou); números de cartão e bolas são fictícios.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Camera } from "../../engine/src/kit/Camera";
import { Personagem, Visual } from "../../engine/src/kit/Personagem";
import { parado, apontando, surpreso, pensando, bracosAoAlto, misturaPose, Pose } from "../../engine/src/kit/poses";
import { EXPRESSOES, exprEm } from "../../engine/src/kit/expressoes";
import { chaves, clamp01, eback, eio, eout, lerp, piscar, ramp, rnd, wobble } from "../../engine/src/kit/anim";
import { useCena } from "../../engine/src/kit/tempo";
import { Avatar, EST_CANAL, SeloCanal, TarjaCanal, TINTA_CANAL as TINTA } from "../../engine/src/kit/canal";

const W = 1080, H = 1920;
type C = React.FC<{ inicio: number; fim: number }>;
const Tela: React.FC<{ children: React.ReactNode; op?: number }> = ({ children, op = 1 }) => <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: op }}>{children}</svg>;
const OURO = "#ffcc33", VERDE = "#2fbf71", ROSA = "#ff5c8a", AZUL = "#4fb4ff", ROXO = "#7b5cff";

const GENTE: Visual[] = [
  { pele: "#f0c8a0", cabelo: "longo", corCabelo: "#8a4b22", roupa: "camiseta", cor: "#e4572e", calca: "#333", sapato: "#3a2a20", corpo: "medio" },
  { pele: "#8d5a3b", cabelo: "cacheado", corCabelo: "#1d1210", roupa: "camiseta", cor: "#ffcf3f", calca: "#2b2d42", sapato: "#fff", corpo: "medio" },
  { pele: "#e8c4a8", cabelo: "coque", corCabelo: "#d9d9d9", roupa: "moletom", cor: "#3fae6a", calca: "#4a4a4a", sapato: "#555", corpo: "idoso" },
  { pele: "#5a3826", cabelo: "careca", corCabelo: "#111", roupa: "terno", cor: "#3a4a6a", calca: "#2a3450", sapato: "#111", barba: "curta", corpo: "medio" },
];

// ------------------------------------------------------------------ peças desenhadas
const Confetes: React.FC<{ f: number; n?: number; op?: number; seed?: string }> = ({ f, n = 90, op = 1, seed = "cf" }) => (
  <g opacity={op}>
    {Array.from({ length: n }, (_, i) => {
      const x = (rnd(`${seed}x${i}`) * 1300 - 110 + Math.sin(f * 0.07 + i) * 30);
      const y = ((rnd(`${seed}y${i}`) * 2200 + f * (6 + rnd(`${seed}v${i}`) * 7)) % 2200) - 200;
      const c = [OURO, VERDE, ROSA, AZUL, ROXO, "#ffffff"][i % 6];
      return <rect key={i} x={x} y={y} width={18} height={30} rx={4} fill={c} transform={`rotate(${f * (3 + i % 5) + i * 37} ${x + 9} ${y + 15})`} />;
    })}
  </g>
);
const Cadeira: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-150} y={-330} width={300} height={260} rx={40} fill="#e07a5f" stroke={TINTA} strokeWidth={9} />
    <rect x={-170} y={-90} width={340} height={90} rx={28} fill="#c4614a" stroke={TINTA} strokeWidth={9} />
    <rect x={-150} y={0} width={20} height={70} fill={TINTA} /><rect x={130} y={0} width={20} height={70} fill={TINTA} />
  </g>
);
const Sala: React.FC<{ f: number; tv?: React.ReactNode; calendario?: number }> = ({ f, tv, calendario = 1 }) => (
  <g>
    <rect x={-800} y={-400} width={2700} height={2120} fill="#f6e3c0" />
    {Array.from({ length: 16 }, (_, i) => <rect key={i} x={-800 + i * 170} y={-400} width={70} height={2120} fill="#efd6ad" />)}
    <rect x={-800} y={1720} width={2700} height={600} fill="#b88c62" />
    <rect x={-800} y={1700} width={2700} height={30} fill="#8a6343" />
    {/* janela com fogos ao longe */}
    <g transform="translate(-60 380)">
      <rect x={0} y={0} width={360} height={440} rx={14} fill="#1d2550" stroke={TINTA} strokeWidth={10} />
      {[0, 1, 2].map((k) => { const t = ((f + k * 37) % 90) / 90; return <g key={k} opacity={1 - t}><circle cx={80 + k * 110} cy={140 + k * 60} r={10 + t * 60} fill="none" stroke={[OURO, ROSA, AZUL][k]} strokeWidth={6} strokeDasharray="6 10" /></g>; })}
      <line x1={180} y1={0} x2={180} y2={440} stroke={TINTA} strokeWidth={8} />
    </g>
    {/* calendário */}
    <g transform="translate(860 420)" opacity={calendario}>
      <rect x={-120} y={-150} width={240} height={290} rx={18} fill="#fff" stroke={TINTA} strokeWidth={8} />
      <rect x={-120} y={-150} width={240} height={80} rx={18} fill="#e4572e" stroke={TINTA} strokeWidth={8} />
      <text x={0} y={-95} textAnchor="middle" fontFamily="Anton" fontSize={46} fill="#fff">DEZEMBRO</text>
      <text x={0} y={95} textAnchor="middle" fontFamily="Anton" fontSize={150} fill={TINTA}>31</text>
    </g>
    {/* TV */}
    <g transform="translate(540 820)">
      <rect x={-300} y={-190} width={600} height={360} rx={18} fill="#1b2230" stroke={TINTA} strokeWidth={10} />
      <g>{tv}</g>
      <rect x={-60} y={170} width={120} height={60} fill="#6b4a3a" />
    </g>
    {/* sofá */}
    <rect x={60} y={1380} width={960} height={240} rx={50} fill="#5b8bd9" stroke={TINTA} strokeWidth={9} />
    <rect x={40} y={1560} width={1000} height={150} rx={30} fill="#4672bd" stroke={TINTA} strokeWidth={9} />
  </g>
);
const TelaContagem: React.FC<{ f: number; n: number }> = ({ f, n }) => (
  <g>
    <rect x={-284} y={-174} width={568} height={328} fill="#24145a" />
    {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={-260 + rnd(`tv${i}`) * 520} cy={-160 + rnd(`tw${i}`) * 300} r={3} fill="#fff" opacity={0.4 + 0.6 * Math.abs(Math.sin(f * 0.1 + i))} />)}
    <text x={0} y={-80} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={34} fill={OURO}>CONTAGEM REGRESSIVA</text>
    <text x={0} y={80} textAnchor="middle" fontFamily="Anton" fontSize={170} fill="#fff">{String(n).padStart(2, "0")}</text>
  </g>
);
const Bola: React.FC<{ x: number; y: number; r?: number; n: number; cor?: string; s?: number }> = ({ x, y, r = 70, n, cor = OURO, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={r} fill={cor} stroke={TINTA} strokeWidth={8} />
    <circle r={r * 0.62} fill="#fff" />
    <ellipse cx={-r * 0.35} cy={-r * 0.45} rx={r * 0.25} ry={r * 0.14} fill="#fff" opacity={0.6} />
    <text y={r * 0.25} textAnchor="middle" fontFamily="Anton" fontSize={r * 0.75} fill={TINTA}>{String(n).padStart(2, "0")}</text>
  </g>
);
const Cartela: React.FC<{ x: number; y: number; s?: number; marcados: number[]; prog: number; cor?: string }> = ({ x, y, s = 1, marcados, prog, cor = VERDE }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-170} y={-140} width={340} height={280} rx={18} fill="#fff" stroke={TINTA} strokeWidth={7} />
    <rect x={-170} y={-140} width={340} height={46} rx={18} fill={cor} stroke={TINTA} strokeWidth={7} />
    <text x={0} y={-106} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={22} fill="#fff">MEU JOGO</text>
    {Array.from({ length: 60 }, (_, i) => {
      const cx = -150 + (i % 10) * 33.3 + 16, cy = -80 + Math.floor(i / 10) * 34 + 16;
      const k = marcados.indexOf(i + 1);
      const on = k >= 0 && prog > k / marcados.length;
      return <g key={i}><rect x={cx - 13} y={cy - 13} width={26} height={26} rx={5} fill={on ? cor : "#f1f1f1"} stroke="#ccc" strokeWidth={2} /><text x={cx} y={cy + 6} textAnchor="middle" fontFamily="Montserrat" fontWeight={700} fontSize={13} fill={on ? "#fff" : "#999"}>{i + 1}</text></g>;
    })}
  </g>
);
const BalaoPensa: React.FC<{ x: number; y: number; s: number; children: React.ReactNode }> = ({ x, y, s, children }) => (
  s <= 0.01 ? null :
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse rx={190} ry={150} fill="#fff" stroke={TINTA} strokeWidth={8} />
    {children}
  </g>
);

// pose sentado na cadeira/sofá
const sentado = (f: number, seed = 1): Pose => ({ ...parado(f, seed), agachar: 120, pernaE: [80, 90], pernaD: [70, 90], bracoE: [20, 60], bracoD: [20, 60] });

// ================================================================== 01 GANHEI! (encenação: ele imagina)
export const Cena01: C = ({ inicio, fim }) => {
  const { lf, T, f } = useCena(inicio);
  const dur = fim - inicio;
  const levanta = eio(ramp(lf, 22, 40));
  const pose = misturaPose(sentado(lf, 1), { ...bracosAoAlto(lf, 1), bob: -20 * Math.abs(Math.sin(lf * 0.35)) }, levanta);
  const titulo = eback(ramp(lf, 18, 30));
  return (
    <AbsoluteFill style={{ backgroundColor: "#ffb733" }}>
      <Camera inicio={inicio} chaves={[[0, 540, 640, 2.6], [12, 540, 700, 2.3], [26, 540, 900, 1.35], [dur, 540, 960, 1.25]]} deriva={0}>
        <defs><radialGradient id="mg1" cx="0.5" cy="0.45" r="0.7"><stop offset="0" stopColor="#fff3b0" /><stop offset="0.6" stopColor="#ffcc33" /><stop offset="1" stopColor="#ff8a3d" /></radialGradient></defs>
        <rect x={-600} y={-400} width={2300} height={2800} fill="url(#mg1)" />
        {Array.from({ length: 18 }, (_, i) => <path key={i} d={`M 540,900 L ${540 + Math.cos((i / 18) * Math.PI * 2 + lf * 0.01) * 2000},${900 + Math.sin((i / 18) * Math.PI * 2 + lf * 0.01) * 2000} L ${540 + Math.cos(((i + 0.5) / 18) * Math.PI * 2 + lf * 0.01) * 2000},${900 + Math.sin(((i + 0.5) / 18) * Math.PI * 2 + lf * 0.01) * 2000} Z`} fill="#fff" opacity={0.18} />)}
        <Cadeira x={540} y={1650} />
        <Avatar id="mg-av1" x={540} y={1780 - 40 * levanta} escala={1.25} pose={pose} f={lf} boca={T.boca(f)}
          expr={exprEm(lf, [[0, "surpreso"], [10, "empolgado"]])} />
      </Camera>
      <Tela>
        <Confetes f={lf} op={clamp01(ramp(lf, 16, 24))} />
        {/* bordas de "sonho": deixam claro que é imaginação */}
        <rect width={W} height={H} fill="none" stroke="#ffffff" strokeWidth={60} opacity={0.35} rx={80} />
        <g transform={`translate(540 300) rotate(-3) scale(${titulo})`}>
          <rect x={-450} y={-95} width={900} height={190} rx={30} fill={VERDE} stroke={TINTA} strokeWidth={10} />
          <text y={50} textAnchor="middle" fontFamily="Anton" fontSize={130} fill="#fff" stroke={TINTA} strokeWidth={6} paintOrder="stroke">GANHEI 1 MILHÃO!</text>
        </g>
      </Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 02 ERA SÓ IMAGINAÇÃO — 31 de dezembro
export const Cena02: C = ({ inicio, fim }) => {
  const { lf, P, T, f } = useCena(inicio);
  const dur = fim - inicio;
  const estoura = eio(ramp(lf, 4, 16));
  const vir = P("virada");
  const n = Math.max(0, 10 - Math.floor(Math.max(0, lf - vir + 10) / 6));
  const pose: Pose = { ...sentado(lf, 2), olhar: lf < vir - 20 ? [0.9, -0.6] : [0, -0.2], cabecaIncl: lf < vir - 20 ? -6 : 4 };
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 540, 1150, 1.15], [vir - 25, 700, 900, 1.3], [vir, 540, 900, 1.15], [dur, 540, 960, 1.05]]} deriva={0}>
        <Sala f={lf} tv={<TelaContagem f={lf} n={n} />} />
        <Avatar id="mg-av2" x={540} y={1760} escala={1.05} pose={pose} f={lf} boca={T.boca(f)}
          expr={exprEm(lf, [[0, "surpreso"], [10, "feliz"], [vir - 20, "pensativo"], [vir, "empolgado"]])} />
        {/* o sonho vira um balão de pensamento e estoura */}
        <BalaoPensa x={760} y={980} s={(1 - estoura) * 1.1}>
          <text y={18} textAnchor="middle" fontFamily="Anton" fontSize={60} fill={VERDE}>R$ 1 MILHÃO?</text>
        </BalaoPensa>
      </Camera>
      <Tela>
        <Confetes f={lf + 40} op={1 - estoura} seed="c2" />
        <TarjaCanal t="ERA SÓ IMAGINAÇÃO" f={lf} />
        <SeloCanal f={lf} em={vir - 4} t="31 DE DEZEMBRO" y={330} tam={64} fundo={OURO} />
      </Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 03 COMO FUNCIONA: escolhem números, globo sorteia 6
const SORTEADAS = [7, 13, 21, 34, 42, 58]; // fictícias, só para ilustrar
export const Cena03: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const globo = P("torcem") - 6;
  const seis = P("seis");
  const parte2 = clamp01(ramp(lf, globo, globo + 14));
  return (
    <AbsoluteFill style={{ backgroundColor: "#bfe6f5" }}>
      <Tela>
        <rect width={W} height={H} fill="#bfe6f5" />
        {/* parte 1: pessoas marcando seus números */}
        <g transform={`translate(${-W * parte2} 0)`}>
          {GENTE.slice(0, 3).map((v, i) => {
            const e = eout(ramp(lf, i * 8, i * 8 + 14));
            const y = 330 + i * 420;
            return (
              <g key={i} transform={`translate(${(1 - e) * (i % 2 ? 900 : -900)} 0)`}>
                <rect x={60} y={y - 170} width={960} height={380} rx={30} fill={["#ffe0cc", "#fff3c4", "#d9f5e3"][i]} stroke={TINTA} strokeWidth={7} />
                <clipPath id={`mg3c${i}`}><rect x={60} y={y - 170} width={960} height={380} rx={30} /></clipPath>
                <g clipPath={`url(#mg3c${i})`}>
                  <Personagem id={`mg3p${i}`} x={260} y={y + 600} escala={0.9} visual={v} estilo={EST_CANAL}
                    pose={{ ...apontando(lf + i * 9, 75, i), olhar: [0.8, 0.2] }} expr={[EXPRESSOES.feliz, EXPRESSOES.pensativo, EXPRESSOES.sereno][i]} olhosAbertos={piscar(lf, 30 + i)} />
                </g>
                <Cartela x={720} y={y + 20} s={0.95} marcados={[[3, 11, 25, 30, 47, 52], [7, 9, 18, 33, 41, 60], [2, 15, 22, 38, 44, 56]][i]} prog={clamp01(ramp(lf, 8 + i * 8, 40 + i * 8))} cor={[ROSA, OURO, VERDE][i]} />
              </g>
            );
          })}
          <text x={540} y={1690} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={30} fill={TINTA} opacity={0.7}>números ilustrativos</text>
        </g>
        {/* parte 2: globo e as seis bolas */}
        {parte2 > 0 && (
          <g transform={`translate(${W * (1 - parte2)} 0)`}>
            <g transform="translate(540 640)">
              <circle r={330} fill="#e8f6ff" stroke={TINTA} strokeWidth={12} opacity={0.95} />
              {Array.from({ length: 22 }, (_, i) => {
                const a = i * 2.4 + lf * 0.12 * (i % 2 ? 1 : -1), r = 60 + (i * 37) % 230;
                return <Bola key={i} x={Math.cos(a) * r} y={Math.sin(a) * r * 0.9} r={44} n={(i * 7) % 60 + 1} cor={[OURO, ROSA, AZUL, VERDE][i % 4]} />;
              })}
              <ellipse cx={-120} cy={-200} rx={90} ry={40} fill="#fff" opacity={0.6} />
              <rect x={-60} y={320} width={120} height={140} fill="#9aa3b5" stroke={TINTA} strokeWidth={10} />
            </g>
            {SORTEADAS.map((n, k) => {
              const em = globo + 8 + k * ((seis - globo + 6) / 6);
              const s = eback(ramp(lf, em, em + 9));
              return s > 0 ? <Bola key={k} x={130 + k * 164} y={1250} r={72} n={n} cor={[OURO, ROSA, AZUL, VERDE, ROXO, "#ff8a3d"][k]} s={s} /> : null;
            })}
          </g>
        )}
      </Tela>
      <Tela><SeloCanal f={lf} em={seis - 4} t="ACERTAR AS 6 DEZENAS" y={170} tam={62} fundo={OURO} /></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 04 A CHANCE REAL: 1 em 50.063.860
export const Cena04: C = ({ inicio, fim }) => {
  const { lf, P, T, f } = useCena(inicio);
  const dur = fim - inicio;
  const dificil = P("difícil"), chance = P("chance"), cinq = P("cinquenta");
  const num = eout(ramp(lf, chance, cinq + 20));
  const valor = Math.round(lerp(1, 50063860, num));
  const multidao = clamp01(ramp(lf, cinq + 4, cinq + 20));
  const pose: Pose = lf < dificil ? { ...parado(lf, 4), bracoE: [30, 120], frenteE: true, maoE: "punho", cabecaIncl: -4 } : surpreso(lf, 4);
  return (
    <AbsoluteFill style={{ backgroundColor: "#2a2440" }}>
      <Camera inicio={inicio} chaves={[[0, 540, 1200, 1.4], [dificil, 540, 1150, 1.6], [chance, 540, 960, 1.0], [dur, 540, 960, 1.0]]} deriva={0}>
        <rect x={-600} y={-400} width={2300} height={2800} fill="#2a2440" />
        {/* multidão de pontinhos: um só destacado */}
        <g opacity={multidao}>
          {Array.from({ length: 700 }, (_, i) => <circle key={i} cx={40 + (i % 35) * 29 + (Math.floor(i / 35) % 2) * 14} cy={980 + Math.floor(i / 35) * 26} r={9} fill={["#6d6a8a", "#7d7a9a", "#5f5c7c"][i % 3]} />)}
          <circle cx={40 + 17 * 29} cy={980 + 9 * 26} r={18} fill={OURO} stroke="#fff" strokeWidth={5} opacity={0.6 + 0.4 * Math.sin(lf * 0.3)} />
        </g>
        <g opacity={1 - multidao * 0.85}>
          <Avatar id="mg-av4" x={540} y={1760} escala={1.05} pose={pose} f={lf} boca={T.boca(f)}
            expr={exprEm(lf, [[0, "feliz"], [dificil - 2, "desconfiado"], [cinq, "horrorizado"]])} />
        </g>
      </Camera>
      <Tela>
        {lf >= chance - 6 && (
          <g transform={`translate(540 520) scale(${eback(ramp(lf, chance - 6, chance + 6))})`}>
            <rect x={-470} y={-230} width={940} height={420} rx={34} fill="#fff" stroke={TINTA} strokeWidth={10} />
            <rect x={-200} y={-262} width={400} height={74} rx={20} fill={AZUL} stroke={TINTA} strokeWidth={7} />
            <text y={-210} textAnchor="middle" fontFamily="Anton" fontSize={46} fill="#fff">APOSTA SIMPLES</text>
            <text y={-90} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={44} fill={TINTA}>1 CHANCE EM</text>
            <text y={55} textAnchor="middle" fontFamily="Anton" fontSize={lerp(80, 128, num)} fill="#e4572e">{valor.toLocaleString("pt-BR")}</text>
            <text y={140} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={28} fill="#666">de acertar as 6 dezenas com 1 aposta</text>
          </g>
        )}
      </Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 05 A MONTANHA DE GRÃOS
export const Cena05: C = ({ inicio, fim }) => {
  const { lf, P, T, f } = useCena(inicio);
  const dur = fim - inicio;
  const unico = P("único"), torcer = P("torcer");
  const brilho = clamp01(ramp(lf, unico - 2, unico + 6)) * (1 - clamp01(ramp(lf, unico + 30, unico + 40)));
  const pose: Pose = lf < torcer ? { ...apontando(lf, 140, 5), olhar: [0.3, -0.9], cabecaIncl: -8 } : { ...surpreso(lf, 5), olhar: [0.2, -1] };
  return (
    <AbsoluteFill style={{ backgroundColor: "#ffe7b8" }}>
      <Camera inicio={inicio} chaves={[[0, 540, 760, 0.95], [unico, 700, 700, 1.4], [torcer - 4, 540, 1100, 1.1], [dur, 540, 1150, 1.05]]} deriva={0}>
        <rect x={-600} y={-400} width={2300} height={2800} fill="#ffe7b8" />
        <circle cx={880} cy={260} r={90} fill="#fff4b8" />
        <rect x={-600} y={1720} width={2300} height={700} fill="#d9b27a" />
        {/* montanha */}
        <path d="M -200,1730 L 540,260 L 1280,1730 Z" fill="#f2c45a" stroke={TINTA} strokeWidth={10} />
        {Array.from({ length: 520 }, (_, i) => {
          const t = rnd(`gy${i}`), y = 290 + Math.sqrt(t) * 1420, half = (y - 260) * 0.5, x = 540 + (rnd(`gx${i}`) * 2 - 1) * half * 0.95;
          return <ellipse key={i} cx={x} cy={y} rx={9} ry={6} fill={i % 3 ? "#e3a93b" : "#f7d77a"} transform={`rotate(${rnd(`gr${i}`) * 180} ${x} ${y})`} />;
        })}
        <g opacity={brilho}><circle cx={700} cy={700} r={46} fill="#fff" opacity={0.5} /><ellipse cx={700} cy={700} rx={16} ry={11} fill="#fffbe0" stroke={OURO} strokeWidth={4} /></g>
        <Avatar id="mg-av5" x={260} y={1860} escala={0.85} pose={pose} f={lf} boca={T.boca(f)}
          expr={exprEm(lf, [[0, "maravilhado"], [torcer - 4, "medo"]])} />
      </Camera>
      <Tela><SeloCanal f={lf} em={8} t="≈ 50 MILHÕES DE GRÃOS" y={170} tam={60} fundo="#fff" /><text x={540} y={1770} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={28} fill={TINTA} opacity={0.7}>comparação ilustrativa</text></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 06 O PRÊMIO PODE SER DIVIDIDO
export const Cena06: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const outras = P("outras") - 4, div = P("dividido") - 4;
  const sep = eio(ramp(lf, div, div + 16));
  const ent = (i: number) => eout(ramp(lf, outras + i * 6, outras + i * 6 + 14));
  return (
    <AbsoluteFill style={{ backgroundColor: "#c9f0d8" }}>
      <Tela>
        <rect width={W} height={H} fill="#c9f0d8" />
        {/* caixa do prêmio em 3 partes */}
        {[0, 1, 2].map((k) => (
          <g key={k} transform={`translate(${(k - 1) * 120 * sep} ${-30 * sep * (k === 1 ? 1 : 0)})`}>
            <rect x={240 + k * 200} y={420} width={200} height={300} fill={[OURO, "#ffd966", OURO][k]} stroke={TINTA} strokeWidth={9} />
            <rect x={240 + k * 200} y={380} width={200} height={70} fill="#e4572e" stroke={TINTA} strokeWidth={9} />
          </g>
        ))}
        <text x={540} y={620} textAnchor="middle" fontFamily="Anton" fontSize={90} fill={TINTA} opacity={1 - sep}>PRÊMIO</text>
        {sep > 0.5 && [0, 1, 2].map((k) => <text key={k} x={340 + k * 200 + (k - 1) * 120} y={600} textAnchor="middle" fontFamily="Anton" fontSize={72} fill={TINTA}>⅓</text>)}
        {/* três ganhadores com cartões */}
        {GENTE.slice(0, 3).map((v, i) => (
          <g key={i} opacity={ent(i)} transform={`translate(0 ${(1 - ent(i)) * 300})`}>
            <Personagem id={`mg6p${i}`} x={220 + i * 320} y={1680} escala={0.85} visual={v} estilo={EST_CANAL}
              pose={{ ...bracosAoAlto(lf + i * 7, i + 1), bob: -14 * Math.abs(Math.sin(lf * 0.3 + i)) }} expr={EXPRESSOES.empolgado} olhosAbertos={piscar(lf, 40 + i)}
              itemD={<g transform="rotate(-10)"><rect x={-40} y={-55} width={80} height={60} rx={8} fill="#fff" stroke={TINTA} strokeWidth={5} /><text y={-15} textAnchor="middle" fontFamily="Anton" fontSize={30} fill={VERDE}>6✓</text></g>} />
          </g>
        ))}
      </Tela>
      <Tela><SeloCanal f={lf} em={div - 2} t="PODE SER DIVIDIDO" y={180} tam={66} fundo={OURO} /></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 07 NÃO ACUMULA: 6 → 5 → 4
export const Cena07: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const acum = P("acumula") - 4, ninguem = P("ninguém"), cinco = P("cinco"), quatro = P("quatro");
  const ativa = lf < cinco - 4 ? 0 : lf < quatro - 4 ? 1 : 2; // só uma faixa recebe o prêmio por vez
  const placas = [["6 ACERTOS", VERDE], ["5 ACERTOS", AZUL], ["4 ACERTOS", ROXO]] as const;
  const ys = [520, 900, 1280];
  const sacoY = chaves(lf, [[cinco - 6, ys[0]], [cinco + 6, ys[1]], [quatro - 6, ys[1]], [quatro + 6, ys[2]]]);
  const riscado6 = clamp01(ramp(lf, ninguem, ninguem + 10));
  return (
    <AbsoluteFill style={{ backgroundColor: "#fff3d6" }}>
      <Tela>
        <rect width={W} height={H} fill="#fff3d6" />
        {placas.map(([t, c], i) => {
          const e = eback(ramp(lf, i * 6, i * 6 + 12));
          const on = i === ativa;
          return (
            <g key={i} transform={`translate(400 ${ys[i]}) scale(${e})`} opacity={on ? 1 : 0.45}>
              <rect x={-300} y={-110} width={600} height={220} rx={30} fill={c} stroke={TINTA} strokeWidth={on ? 12 : 8} />
              <text y={30} textAnchor="middle" fontFamily="Anton" fontSize={92} fill="#fff">{t}</text>
              {i === 0 && riscado6 > 0 && <line x1={-260} y1={0} x2={-260 + 520 * riscado6} y2={0} stroke="#e4572e" strokeWidth={16} strokeLinecap="round" />}
            </g>
          );
        })}
        {/* setas que descem conforme a fala */}
        {[[ys[0] + 110, ys[1] - 110, cinco], [ys[1] + 110, ys[2] - 110, quatro]].map(([a, b, em], k) => {
          const p = eio(ramp(lf, em - 8, em + 4));
          return p > 0 ? <g key={k}><line x1={400} y1={a} x2={400} y2={a + (b - a) * p} stroke={TINTA} strokeWidth={14} strokeLinecap="round" />{p > 0.95 && <path d={`M 370,${b - 30} L 400,${b} L 430,${b - 30}`} fill="none" stroke={TINTA} strokeWidth={14} strokeLinecap="round" />}</g> : null;
        })}
        {/* saco do prêmio acompanhando a faixa da vez */}
        <g transform={`translate(860 ${sacoY})`}>
          <path d="M -70,-40 C -110,40 -90,110 0,110 C 90,110 110,40 70,-40 Z" fill={OURO} stroke={TINTA} strokeWidth={8} />
          <path d="M -40,-40 L -55,-85 L 55,-85 L 40,-40 Z" fill="#e3a93b" stroke={TINTA} strokeWidth={8} />
          <text y={60} textAnchor="middle" fontFamily="Anton" fontSize={70} fill={TINTA}>$</text>
        </g>
      </Tela>
      <Tela><SeloCanal f={lf} em={acum} t="NÃO ACUMULA" y={190} tam={70} fundo="#e4572e" cor="#fff" /></Tela>
    </AbsoluteFill>
  );
};

// ================================================================== 08 E VOCÊ?
export const Cena08: C = ({ inicio, fim }) => {
  const { lf, P, T, f } = useCena(inicio);
  const dur = fim - inicio;
  const se = P("Se");
  const b = (k: number) => eback(ramp(lf, 6 + k * 10, 18 + k * 10)) * (1 - eio(ramp(lf, se - 8, se + 4))); // somem antes da pergunta final
  const olhaCam = lf >= se;
  const pose: Pose = olhaCam ? { ...apontando(lf, 95, 8), olhar: [0, 0] } : pensando(lf, 8);
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 540, 1000, 1.05], [se, 540, 1150, 1.25], [dur, 540, 1180, 1.3]]} deriva={0}>
        <Sala f={lf} tv={<TelaContagem f={lf} n={0} />} calendario={0.5} />
        <Avatar id="mg-av8" x={540} y={1760} escala={1.05} pose={pose} f={lf} boca={T.boca(f)} expr={exprEm(lf, [[0, "pensativo"], [se, "feliz"]])} />
      </Camera>
      <Tela>
        {/* ajudar a família, viajar, comprar casa */}
        <BalaoPensa x={230} y={520} s={b(0) * 0.8}>
          {[-70, 0, 70].map((x, i) => <g key={i}><circle cx={x} cy={-20} r={34} fill={["#f0c8a0", "#8d5a3b", "#e8c4a8"][i]} stroke={TINTA} strokeWidth={5} /><rect x={x - 34} y={20} width={68} height={60} rx={20} fill={[ROSA, AZUL, VERDE][i]} stroke={TINTA} strokeWidth={5} /></g>)}
          <text y={130} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={30} fill={TINTA}>FAMÍLIA</text>
        </BalaoPensa>
        <BalaoPensa x={850} y={520} s={b(1) * 0.8}>
          <path d="M -120,0 L 110,-20 C 140,-22 140,22 110,20 L -120,0 Z M -10,-8 L -70,-90 L -30,-90 L 50,-12 Z M -10,8 L -70,90 L -30,90 L 50,12 Z" fill="#fff" stroke={TINTA} strokeWidth={6} />
          <text y={130} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={30} fill={TINTA}>VIAJAR</text>
        </BalaoPensa>
        <BalaoPensa x={540} y={300} s={b(2) * 0.8}>
          <path d="M -100,10 L 0,-80 L 100,10 Z" fill="#e4572e" stroke={TINTA} strokeWidth={6} />
          <rect x={-80} y={10} width={160} height={90} fill={OURO} stroke={TINTA} strokeWidth={6} />
          <rect x={-20} y={45} width={40} height={55} fill="#8a5a3a" />
          <text y={140} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={30} fill={TINTA}>CASA</text>
        </BalaoPensa>
        <SeloCanal f={lf} em={se + 4} t="O QUE VOCÊ FARIA?" y={300} tam={76} fundo={OURO} />
      </Tela>
    </AbsoluteFill>
  );
};
