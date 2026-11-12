// Cenas 1–4: abertura (quarto + celulares pelo mundo), Pacífico/Taiwan, primeiros confrontos, guerra na internet.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Camera } from "../../engine/src/kit/Camera";
import { Personagem } from "../../engine/src/kit/Personagem";
import { poseEm, parado, olhandoCelular, surpreso, comMedo, pensando, falando, Pose } from "../../engine/src/kit/poses";
import { exprEm, EXPRESSOES } from "../../engine/src/kit/expressoes";
import { Globo } from "../../engine/src/kit/Globo";
import { LUGARES } from "../../engine/src/kit/geo";
import { chaves, clamp01, eback, eio, eout, piscar, ramp, rnd } from "../../engine/src/kit/anim";
import { Particulas } from "../../engine/src/kit/efeitos";
import {
  AMARELO, VERMELHO, TINTA, Txt, Celular, TelaBloqueio, TelaFalha, TelaViral, CardNotif, Notif, Ceu, Mar, NavioMilitar, DroneAsa,
  Quadricoptero, AviaoGenerico, Clarao, Radar, QuartoManha, Cobertor, CriadoMudo, CidadeFundo, Servidores, Selo,
} from "./pecas";
import { LEO, TOQUIO, EUROPA, EUA, MILITAR_A, MILITAR_B, EST, EST_NOITE, EST_DRAMA, useCena, CelularMao } from "./elenco";

const W = 1080, H = 1920;
/** Mão estilizada segurando o celular por baixo (close de tela). */
const MaoSegurando: React.FC<{ pele?: string }> = ({ pele = "#bc805e" }) => (
  <g>
    <path d="M -230,250 C -260,160 -230,60 -170,40 L -150,120 C -150,190 -120,260 -60,320 L -60,520 L -260,520 Z" fill={pele} stroke={TINTA} strokeWidth={10} strokeLinejoin="round" />
    <path d="M 170,90 C 230,80 250,130 230,170 C 215,200 180,205 165,190 Z" fill={pele} stroke={TINTA} strokeWidth={9} />
    <path d="M 172,180 C 235,175 250,225 228,258 C 212,285 178,286 165,270 Z" fill={pele} stroke={TINTA} strokeWidth={9} />
    <path d="M 168,265 C 225,265 238,312 215,340 C 200,360 172,358 160,345 Z" fill={pele} stroke={TINTA} strokeWidth={9} />
    <path d="M -60,320 C 20,380 140,380 190,330 L 200,520 L -60,520 Z" fill={pele} stroke={TINTA} strokeWidth={10} />
    <path d="M -60,520 L 200,520 L 210,700 L -80,700 Z" fill="#e53935" stroke={TINTA} strokeWidth={10} />
  </g>
);

const NOTIFS_ALERTA = (P: (w: string, n?: number) => number): Notif[] => [
  { app: "ALERTA • SIMULAÇÃO", titulo: "EUA x CHINA", texto: "Cenário fictício deste vídeo", cor: VERMELHO, em: P("alerta") },
  { app: "PLANTÃO SIMULADO", titulo: "Tensão máxima no Pacífico", texto: "Acompanhe (simulação)", cor: "#f08c00", em: P("China"), icone: "⚡" },
  { app: "URGENTE (FICÇÃO)", titulo: "Guerra começou?", texto: "Toque para ver o cenário", cor: "#c92a2a", em: P("guerra") },
];

// ================================================================== CENA 1 — o alerta
export const Cena1: React.FC<{ inicio: number }> = ({ inicio }) => {
  const { lf, P } = useCena(inicio);
  const acorda = P("acorda"), pega = P("pega"), cel = P("celular"), parece = P("Parece"), mas = P("Mas");
  // --- tomada A: Leo deitado, celular vibrando no criado-mudo
  if (lf < cel + 4) {
    const abre = clamp01(ramp(lf, acorda - 2, acorda + 6));
    const braco = eout(ramp(lf, pega - 4, pega + 8));
    const pose: Pose = { ...parado(lf, 3), bracoD: [20 + 145 * braco, 30 - 25 * braco], bracoE: [12, 10], frenteD: braco > 0.3, virar: 0, olhar: [0.8 * abre, -0.6 * abre], cabecaIncl: -4 };
    return (
      <AbsoluteFill>
        <Camera inicio={inicio} chaves={[[0, 560, 1080, 1.05], [pega - 6, 400, 1060, 1.3], [cel + 4, 230, 1010, 2.1]]} deriva={0.4}>
          <QuartoManha f={lf} luz={0.6 + 0.4 * abre} />
          <CriadoMudo x={150} y={1010} />
          <g transform="translate(160 990)">
            <Celular f={lf} escala={0.16} rot={-78} vibra={lf < cel} luz={1}>
              <rect width={300} height={600} fill="#c92a2a" />
            </Celular>
          </g>
          <ellipse cx={420} cy={1185} rx={170} ry={70} fill="#f1f0ff" stroke={TINTA} strokeWidth={9} />
          <g transform="rotate(-90 900 1185)">
            <Personagem id="leo-deitado" x={900} y={1185} escala={1} visual={LEO} estilo={EST} pose={pose}
              expr={abre > 0.5 ? EXPRESSOES.surpreso : EXPRESSOES.sereno} olhosAbertos={abre < 0.05 ? 0 : abre} />
          </g>
          <g transform="translate(330 -95)"><Cobertor f={lf} respira={1 - abre} /></g>
          {lf < cel && <Txt x={150} y={900} t="BZZZ" s={52} c={AMARELO} op={(lf % 14) < 9 ? 1 : 0.3} />}
        </Camera>
      </AbsoluteFill>
    );
  }
  // --- tomada B: close do celular na mão, notificações chegando
  if (lf < parece - 2) {
    const z = chaves(lf, [[cel + 4, 2.0], [P("guerra") - 2, 2.25], [P("guerra") + 6, 2.75], [parece, 2.85]], eout);
    const ty = chaves(lf, [[cel + 4, 0], [P("guerra"), 0], [P("guerra") + 6, 150]], eout);
    return (
      <AbsoluteFill style={{ backgroundColor: "#141532" }}>
        <svg width={W} height={H}>
          <g opacity={0.35}><QuartoManha f={lf} luz={0.5} /></g>
          <rect width={W} height={H} fill="#0b0d22" opacity={0.45} />
          <g transform={`translate(540 ${900 + ty}) scale(${z / 2.2})`}>
            <g transform="scale(2.2)">
              <Celular f={lf} escala={1} luz={1}>
                <TelaBloqueio f={lf} notifs={NOTIFS_ALERTA(P)} />
              </Celular>
            </g>
            <g transform="scale(2.2) translate(0 0)"><MaoSegurando /></g>
          </g>
          {lf >= P("guerra") && lf < P("guerra") + 5 && <rect width={W} height={H} fill="#ff4d4d" opacity={0.35 * (1 - (lf - P("guerra")) / 5)} />}
        </svg>
      </AbsoluteFill>
    );
  }
  // --- tomada C: pessoas em outras cidades recebendo o alerta (tela dividida)
  if (lf < mas - 1) {
    const paineis: { cidade: "asia" | "europa" | "eua"; v: typeof LEO; rot: string; e: keyof typeof EXPRESSOES }[] = [
      { cidade: "asia", v: TOQUIO, rot: "ÁSIA", e: "surpreso" },
      { cidade: "europa", v: EUROPA, rot: "EUROPA", e: "medo" },
      { cidade: "eua", v: EUA, rot: "AMÉRICAS", e: "horrorizado" },
    ];
    return (
      <AbsoluteFill style={{ backgroundColor: "#090b18" }}>
        <svg width={W} height={H}>
          {paineis.map((p, i) => {
            const t0 = parece - 2 + i * 7, s = eout(ramp(lf, t0, t0 + 9));
            const y0 = i * 640, dx = (i % 2 ? 1 : -1) * (1 - s) * W;
            const lf2 = lf + i * 40;
            return (
              <g key={i} transform={`translate(${dx} ${y0})`}>
                <clipPath id={`painel${i}`}><rect width={W} height={634} /></clipPath>
                <g clipPath={`url(#painel${i})`}>
                  <g transform={`translate(0 -560) scale(1)`}>
                    <CidadeFundo f={lf2} estilo={p.cidade} />
                    <Personagem id={`cid${i}`} x={i === 1 ? 700 : 420} y={1500} escala={1.25} dir={i === 1 ? -1 : 1} visual={p.v} estilo={EST_NOITE}
                      pose={poseEm(lf, [[0, (x) => olhandoCelular(x, 10 + i)], [t0 + 14, (x) => ({ ...olhandoCelular(x, 10 + i), cabecaIncl: -6, olhar: [0, 0.4] })]], 5)}
                      expr={exprEm(lf, [[0, "neutro"], [t0 + 10, p.e]], 4)} olhosAbertos={piscar(lf, i + 4)}
                      itemD={<CelularMao f={lf} tela={<g><rect width={300} height={600} fill="#1b2747" /><CardNotif n={{ app: "ALERTA", titulo: "EUA x CHINA", texto: "simulação", cor: VERMELHO, em: -99 }} f={lf} y={200} /></g>} />} />
                  </g>
                  <rect width={W} height={634} fill="none" stroke={TINTA} strokeWidth={12} />
                  <g transform="translate(60 560)"><rect x={-10} y={-44} width={p.rot.length * 30 + 30} height={60} rx={12} fill={TINTA} opacity={0.75} /><Txt x={5} y={0} t={p.rot} s={40} anchor="start" c={AMARELO} /></g>
                </g>
              </g>
            );
          })}
        </svg>
      </AbsoluteFill>
    );
  }
  // --- tomada D: Leo sentado na cama, assustado
  const exprD = exprEm(lf, [[mas - 2, "medo"], [P("aconteceria") + 4, "pensativo"], [P("gente") - 2, "medo"]], 6);
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[mas - 2, 520, 1020, 1.45], [P("gente") + 10, 540, 940, 1.85]]} deriva={0.9}>
        <QuartoManha f={lf} luz={0.85} />
        <CriadoMudo x={-40} y={1010} />
        <Personagem id="leo-sentado" x={540} y={1540} escala={1.1} visual={LEO} estilo={EST}
          pose={poseEm(lf, [[0, (x) => olhandoCelular(x, 3, 0.25)], [P("gente") - 6, (x) => ({ ...olhandoCelular(x, 3, 0), olhar: [0, 0], cabecaIncl: -3 })]], 6)}
          expr={exprD} olhosAbertos={piscar(lf, 3)} boca={0}
          itemD={<CelularMao f={lf} tela={<TelaBloqueio f={999} notifs={[{ app: "ALERTA • SIMULAÇÃO", titulo: "EUA x CHINA", texto: "Cenário fictício", cor: VERMELHO, em: 0 }]} />} />} />
        <g transform="translate(-200 60)"><Cobertor f={lf} respira={0} /></g>
      </Camera>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <Selo f={lf} em={mas + 2} texto="E SE FOSSE HOJE?" y={360} />
      </svg>
    </AbsoluteFill>
  );
};

// ================================================================== CENA 2 — Pacífico / Taiwan
export const Cena2: React.FC<{ inicio: number }> = ({ inicio }) => {
  const { lf, P } = useCena(inicio);
  const navios = P("Navios");
  if (lf < navios - 4) {
    const lon0 = chaves(lf, [[0, 215], [P("Taiwan") + 6, 128]], eio);
    const lat0 = chaves(lf, [[0, 28], [P("Taiwan") + 6, 22]], eio);
    const r = chaves(lf, [[0, 430], [P("Taiwan") - 4, 520], [P("controle") + 6, 1250], [navios - 4, 1500]], eio);
    const cy = chaves(lf, [[0, 960], [P("controle") + 6, 1000]], eio);
    return (
      <AbsoluteFill style={{ backgroundColor: "#050816" }}>
        <svg width={W} height={H}>
          <Particulas tipo="brilhos" n={60} seed={22} cor="#ffffff" opacidade={0.5} />
          <Globo id="g2" cx={540} cy={cy} r={r} lon0={lon0} lat0={lat0}
            destaques={{ eua: "#3d7bd9", china: "#e5484d", taiwan: AMARELO }}
            alertas={[{ ll: LUGARES.taiwan, inicio: P("Taiwan") - 2, cor: AMARELO, tamanho: 1.3 }]}
            rotulos={[
              { ll: [-100, 42], texto: "EUA", inicio: 4, tamanho: 50 },
              { ll: [104, 34], texto: "CHINA", inicio: 10, tamanho: 50 },
              { ll: LUGARES.taiwan, texto: "TAIWAN", inicio: P("Taiwan"), cor: AMARELO, dy: 70, tamanho: 46 },
            ]} />
        </svg>
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <Selo f={lf} em={P("controle") - 4} texto="PACÍFICO EM ALERTA" y={330} fundo={VERMELHO} cor="#fff" />
          {lf >= P("Taiwan") + 4 && (
            <g transform={`translate(540 1560) scale(${eback(ramp(lf, P("Taiwan") + 4, P("Taiwan") + 12))})`}>
              <rect x={-430} y={-62} width={860} height={112} rx={20} fill="#0f1830" stroke={AMARELO} strokeWidth={4} opacity={0.92} />
              <Txt x={0} y={-12} t="PONTO DE PARTIDA DESTA SIMULAÇÃO" s={34} c="#fff" />
              <Txt x={0} y={30} t="não é a única origem possível de um conflito" s={26} c="#b9c6e4" peso={700} />
            </g>
          )}
        </svg>
      </AbsoluteFill>
    );
  }
  // descida até os navios
  const l2 = lf - navios;
  const amea = P("ameaças"), mundo = P("mundo");
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[navios - 4, 540, 650, 1.1], [navios + 26, 540, 1000, 1.15], [amea, 560, 1030, 1.22], [mundo + 30, 540, 1000, 1.3]]} deriva={0.5} mao={0.4}>
        <Ceu cores={["#2a3a6e", "#6a6fa8", "#e9a37c"]} f={lf} nuvens={7} brilho={0.15} />
        <Mar f={lf} yH={1010} cores={["#2b5f8c", "#0d2847"]} />
        <g transform={`translate(${-40 + l2 * 1.1} 1170) scale(0.72)`}><NavioMilitar f={lf} cor="#7d8a99" seed={1} /></g>
        <g transform={`translate(${1150 - l2 * 1.0} 1440) scale(-0.95 0.95)`}><NavioMilitar f={lf} cor="#7f8c76" seed={3} /></g>
        <g transform={`translate(${-300 + l2 * 6} ${560 + Math.sin(l2 * 0.05) * 20}) scale(0.7)`}><AviaoGenerico /></g>
        {lf >= amea && [[-40 + l2 * 1.1 - 40, 880], [1150 - l2 * 1.0 + 50, 1060]].map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${eback(ramp(lf, amea + i * 4, amea + i * 4 + 8))})`}>
            <path d="M 0,-70 L 64,46 L -64,46 Z" fill={AMARELO} stroke={TINTA} strokeWidth={8} strokeLinejoin="round" />
            <text y={34} textAnchor="middle" fontFamily="Anton" fontSize={80} fill={TINTA}>!</text>
          </g>
        ))}
        {lf >= amea && (
          <path d={`M ${-40 + l2 * 1.1 - 40},1080 Q 540,${960 - Math.sin(lf * 0.2) * 20} ${1150 - l2 * 1.0 + 50},1300`} stroke={VERMELHO} strokeWidth={8} strokeDasharray="26 18" strokeDashoffset={-lf * 3} fill="none" opacity={0.85} />
        )}
        {[0, 1, 2].map((k) => {
          const u = ((lf + k * 20) % 60) / 60;
          return <circle key={k} cx={540} cy={1200} r={100 + u * 700} fill="none" stroke="#7fd0ff" strokeWidth={5 * (1 - u)} opacity={0.5 * (1 - u)} />;
        })}
      </Camera>
      {lf >= mundo - 4 && (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          {[0, 1, 2].map((i) => {
            const s = eback(ramp(lf, mundo - 4 + i * 4, mundo + 4 + i * 4));
            return (
              <g key={i} transform={`translate(${200 + i * 340} 640) rotate(${(i - 1) * 6}) scale(${0.36 * s})`}>
                <Celular f={lf} luz={0.8}>
                  <rect width={300} height={600} fill="#1b2747" />
                  <rect x={20} y={40} width={110} height={36} rx={8} fill={VERMELHO} /><text x={75} y={65} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={18} fill="#fff">AO VIVO</text>
                  <text x={150} y={110} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={16} fill="#9fb3d8">(simulação)</text>
                  <g transform={`translate(150 330) scale(0.35)`}><NavioMilitar f={lf} /></g>
                </Celular>
              </g>
            );
          })}
        </svg>
      )}
    </AbsoluteFill>
  );
};

// ================================================================== CENA 3 — primeiros confrontos
export const Cena3: React.FC<{ inicio: number }> = ({ inicio }) => {
  const { lf, P } = useCena(inicio);
  const drones = P("Drones"), interc = P("interceptar"), explo = P("explosão"), medo = P("medo");
  const flashes = [explo - 2, explo + 9, medo + 2];
  // sala de radar no final
  if (lf >= medo + 8) {
    const alarme = 0.5 + 0.5 * Math.sin(lf * 0.5);
    return (
      <AbsoluteFill style={{ backgroundColor: "#0b1220" }}>
        <Camera inicio={inicio} chaves={[[medo + 8, 540, 1050, 1.15], [medo + 80, 560, 1020, 1.35]]} deriva={0.6} mao={0.5}>
          <rect x={-600} y={-500} width={2300} height={2400} fill="#141e30" />
          {Array.from({ length: 6 }, (_, i) => <rect key={i} x={-300 + i * 300} y={300} width={240} height={160} rx={10} fill="#0d2a1b" stroke={TINTA} strokeWidth={8} opacity={0.8} />)}
          <g transform="translate(540 760)"><Radar f={lf} r={260} /></g>
          <Personagem id="mil-a" x={330} y={1720} escala={1.05} dir={1} visual={MILITAR_A} estilo={EST_DRAMA}
            pose={{ ...falando(lf, 21, 0.6), olhar: [0.6, -0.4], virar: 0.3 }} expr={EXPRESSOES.medo} olhosAbertos={piscar(lf, 21)} />
          <Personagem id="mil-b" x={770} y={1740} escala={1.08} dir={-1} visual={MILITAR_B} estilo={EST_DRAMA}
            pose={{ ...pensando(lf, 22), olhar: [0.6, -0.5] }} expr={EXPRESSOES.bravo} olhosAbertos={piscar(lf, 22)} />
          <rect x={-200} y={1480} width={1500} height={500} fill="#232f45" stroke={TINTA} strokeWidth={10} />
          {Array.from({ length: 10 }, (_, i) => <circle key={i} cx={40 + i * 110} cy={1540} r={12} fill={i % 3 ? "#39e07a" : VERMELHO} opacity={rnd(`c${i}${Math.floor(lf / 5)}`) > 0.4 ? 1 : 0.25} />)}
        </Camera>
        <AbsoluteFill style={{ backgroundColor: "#ff2020", opacity: 0.12 * alarme, mixBlendMode: "screen" }} />
      </AbsoluteFill>
    );
  }
  const passa = eio(ramp(lf, drones + 14, drones + 34)); // drone passando perto da câmera
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[0, 540, 1050, 1.0], [drones, 540, 820, 1.05], [interc + 10, 560, 900, 1.12], [explo, 540, 1000, 1.18]]} deriva={0.6} mao={0.7}
        tremores={flashes.map((x) => x + 2)} forcaTremor={10}>
        <Ceu cores={["#060814", "#141a3c", "#3a2a4a"]} f={lf} nuvens={8} brilho={flashes.some((x) => lf >= x && lf < x + 12) ? 0.35 : 0.04} />
        {flashes.map((x, i) => <Clarao key={i} f={lf} em={x} x={[260, 820, 520][i]} y={1000} tam={[1, 0.8, 1.2][i]} />)}
        <Mar f={lf} yH={1000} cores={["#16253f", "#060c18"]} brilho="#4a7fb8" />
        {/* defesa: linha de luz sobe e encontra um ponto no céu (genérico, sem trajetória real) */}
        {lf >= interc - 4 && lf < interc + 34 && (() => {
          const t = eout(ramp(lf, interc - 4, interc + 10));
          const x1 = 720 + (180 - 720) * 0, y1 = 1150, x2 = 760, y2 = 520;
          return (
            <g>
              <line x1={x1} y1={y1} x2={x1 + (x2 - x1) * t} y2={y1 + (y2 - y1) * t} stroke="#ffe7a3" strokeWidth={6} opacity={0.9} />
              {t >= 1 && <circle cx={x2} cy={y2} r={30 + (lf - interc - 10) * 6} fill="#fff1c9" opacity={Math.max(0, 0.8 - (lf - interc - 10) * 0.04)} />}
            </g>
          );
        })()}
        <g transform="translate(560 1190) scale(1.05)"><NavioMilitar f={lf} cor="#59667a" luzes /></g>
        {Array.from({ length: 5 }, (_, i) => {
          const x = -300 + ((lf - drones + 40 + i * 70) * (5 + i)) % 1800;
          return lf >= drones - 10 + i * 4 ? (
            <g key={i} transform={`translate(${x} ${420 + i * 90 + Math.sin(lf * 0.06 + i) * 12}) scale(${0.35 + (i % 3) * 0.12})`}><DroneAsa f={lf} /></g>
          ) : null;
        })}
        {/* ondas batendo no casco */}
        {Array.from({ length: 4 }, (_, i) => {
          const u = ((lf + i * 11) % 44) / 44;
          return <ellipse key={i} cx={180 + i * 260} cy={1240 - u * 60} rx={60 + u * 50} ry={20 + u * 30} fill="#e8f6ff" opacity={0.55 * (1 - u)} />;
        })}
      </Camera>
      {passa > 0 && passa < 1 && (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <g transform={`translate(${-500 + passa * 2100} ${700 - passa * 260}) scale(${2.2 + passa})`} style={{ filter: "blur(2px)" }}><Quadricoptero f={lf} /></g>
        </svg>
      )}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <Selo f={lf} em={P("confrontos") - 4} ate={drones + 40} texto="PRIMEIROS CONFRONTOS" y={330} fundo={VERMELHO} cor="#fff" />
      </svg>
    </AbsoluteFill>
  );
};

// ================================================================== CENA 4 — a guerra chega à internet
export const Cena4: React.FC<{ inicio: number }> = ({ inicio }) => {
  const { lf, P } = useCena(inicio);
  const serv = P("Serviços"), dados = P("dados"), videos = P("vídeos"), nem = P("Nem");
  const glitch = (lf % 37 < 3 || (lf > serv && lf < serv + 6)) ? 1 : 0;
  let cena: React.ReactNode;
  if (lf < serv - 2) {
    // mapa digital com linhas se espalhando
    const cidades: [number, number][] = [[-74, 40.7], [-0.1, 51.5], [139.7, 35.7], [116.4, 39.9], [-46.6, -23.5], [77.2, 28.6], [151.2, -33.9], [37.6, 55.7], [-122.4, 37.8], [28, -26]];
    cena = (
      <svg width={W} height={H}>
        <rect width={W} height={H} fill="#06101f" />
        {Array.from({ length: 22 }, (_, i) => <text key={i} x={20 + (i % 5) * 220} y={((i * 97 + lf * 5) % 1960) - 20} fontFamily="monospace" fontSize={26} fill="#3ff0c0" opacity={0.15}>{["01101", "ERRO?", "10010", "PING", "#?!"][i % 5]}</text>)}
        <Globo id="g4" cx={540} cy={950} r={chaves(lf, [[0, 470], [serv, 560]], eio)} lon0={chaves(lf, [[0, 60], [serv, 100]])} lat0={20}
          oceano={["#0d2a4a", "#040b18"]} terra="#123d3a" contorno="#3ff0c0" grade
          rotas={cidades.flatMap((c, i) => cidades.slice(i + 1, i + 3).map((d, k) => ({ de: c, para: d, cor: "#3ff0c0", inicio: 4 + i * 3 + k * 2, dur: 18, altura: 0.25, largura: 4 })))} />
      </svg>
    );
  } else if (lf < dados - 2) {
    cena = (
      <svg width={W} height={H}>
        <rect width={W} height={H} fill="#0a0f1c" />
        <g transform="translate(70 380) scale(1.05)"><Servidores f={lf} falhaEm={serv} /></g>
        <g transform={`translate(540 980) scale(${eback(ramp(lf, serv + 6, serv + 14)) * 1.15})`}>
          <Celular f={lf} luz={1}><TelaFalha f={lf} falhaEm={P("falham") + 4} /></Celular>
        </g>
      </svg>
    );
  } else if (lf < videos - 2) {
    cena = (
      <svg width={W} height={H}>
        <rect width={W} height={H} fill="#0a0f1c" />
        <g transform="translate(70 380) scale(1.05)" opacity={0.5}><Servidores f={lf} falhaEm={0} /></g>
        {Array.from({ length: 7 }, (_, i) => {
          const u = ((lf - dados + i * 9) % 50) / 50;
          return (
            <g key={i} transform={`translate(${300 + i * 80 + u * 200} ${900 - u * 500}) rotate(${u * 40})`} opacity={1 - u}>
              <path d="M -40,-50 L 20,-50 L 40,-30 L 40,50 L -40,50 Z" fill="#e6ecf7" stroke={TINTA} strokeWidth={5} />
              <text y={22} textAnchor="middle" fontFamily="Anton" fontSize={50} fill={VERMELHO}>?</text>
            </g>
          );
        })}
        <g transform={`translate(540 1180) scale(${eback(ramp(lf, dados, dados + 8))})`}>
          <rect x={-420} y={-90} width={840} height={180} rx={24} fill="#1a2238" stroke={AMARELO} strokeWidth={6} />
          <Txt x={0} y={-8} t="VAZAMENTO?" s={78} c={AMARELO} fonte="Anton" peso={400} />
          <Txt x={0} y={58} t="suposto, sem confirmação (cenário fictício)" s={30} c="#c7d2ea" peso={700} />
        </g>
      </svg>
    );
  } else if (lf < nem - 2) {
    // vídeo antigo circulando entre celulares
    cena = (
      <svg width={W} height={H}>
        <rect width={W} height={H} fill="#101828" />
        {[0, 1, 2, 3].map((i) => {
          const em = videos - 2 + i * 9, s = eback(ramp(lf, em, em + 8));
          const x = i % 2 ? 760 : 320, y = 560 + i * 300;
          return (
            <g key={i}>
              {i > 0 && lf >= em && <path d={`M ${i % 2 ? 320 : 760},${y - 200} Q 540,${y - 120} ${x},${y - 60}`} stroke={AMARELO} strokeWidth={8} strokeDasharray="20 14" strokeDashoffset={-lf * 4} fill="none" />}
              <g transform={`translate(${x} ${y}) rotate(${i % 2 ? 6 : -6}) scale(${0.62 * s})`}>
                <Celular f={lf} luz={0.7}><TelaViral f={lf} selo={i === 3 ? "FONTE NÃO VERIFICADA" : "VÍDEO ANTIGO?"} cor={i === 3 ? VERMELHO : "#f08c00"} em={i === 3 ? P("hoje") : P("antigos") + i * 4} /></Celular>
              </g>
            </g>
          );
        })}
      </svg>
    );
  } else {
    cena = (
      <AbsoluteFill>
        <Camera inicio={inicio} chaves={[[nem - 2, 540, 1000, 1.45], [nem + 60, 540, 960, 1.6]]} deriva={0.8}>
          <rect x={-600} y={-500} width={2300} height={2400} fill="#1e2a48" />
          {Array.from({ length: 9 }, (_, i) => {
            const u = ((lf + i * 13) % 60) / 60;
            return <text key={i} x={200 + (i % 3) * 330} y={760 - u * 300} fontFamily="Anton" fontSize={90 + (i % 2) * 40} fill={i % 2 ? AMARELO : "#fff"} opacity={(1 - u) * 0.8} textAnchor="middle">?</text>;
          })}
          <Personagem id="leo-confuso" x={540} y={1640} escala={1.15} visual={LEO} estilo={EST}
            pose={poseEm(lf, [[0, (x) => olhandoCelular(x, 5)], [nem + 12, (x) => ({ ...pensando(x, 5), virar: -0.2 })]], 7)}
            expr={exprEm(lf, [[0, "desconfiado"], [nem + 12, "pensativo"]], 6)} olhosAbertos={piscar(lf, 5)}
            itemD={lf < nem + 12 ? <CelularMao f={lf} tela={<TelaViral f={lf} selo="?" cor={VERMELHO} em={0} />} /> : undefined} />
        </Camera>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      {cena}
      {glitch > 0 && (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0, mixBlendMode: "screen" }}>
          {Array.from({ length: 6 }, (_, i) => <rect key={i} x={0} y={rnd(`gl${lf}${i}`) * H} width={W} height={10 + rnd(`gh${lf}${i}`) * 50} fill={i % 2 ? "#ff2bd6" : "#2bf0ff"} opacity={0.35} />)}
        </svg>
      )}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <Selo f={lf} em={nem - 2} texto="INFORMAÇÃO OU BOATO?" y={330} />
      </svg>
    </AbsoluteFill>
  );
};
