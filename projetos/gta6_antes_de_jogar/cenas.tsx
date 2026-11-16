// GTA 6 — FAÇA ISSO ANTES DE JOGAR. Híbrido: avatar 2D do canal + material OFICIAL da Rockstar
// (screenshots do pacote de imprensa e trechos do Launch Trailer) em molduras neon animadas.
// Mídia local em engine/public/gta/ (não versionada; origem registrada em projeto.json e relatorio.md).
import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile } from "remotion";
import { camEm, ChaveCam } from "../../engine/src/kit/Camera";
import { parado, andando, correndo, apontando, surpreso, pensando, misturaPose, Pose } from "../../engine/src/kit/poses";
import { EXPRESSOES, exprEm } from "../../engine/src/kit/expressoes";
import { clamp01, eback, eio, eout, lerp, ramp, rnd, wobble } from "../../engine/src/kit/anim";
import { useCena } from "../../engine/src/kit/tempo";
import { Avatar, SeloCanal, TINTA_CANAL as TINTA } from "../../engine/src/kit/canal";

const W = 1080, H = 1920;
type C = React.FC<{ inicio: number; fim: number }>;
const ROSA = "#ff4fa3", CIANO = "#33e6ff", AMARELO = "#ffd60a", ROXO = "#7b3cff";

// ------------------------------------------------------------------ câmera para camadas HTML + SVG juntas
const Cam: React.FC<{ chaves: ChaveCam[]; lf: number; children: React.ReactNode }> = ({ chaves, lf, children }) => {
  const c = camEm(lf, chaves);
  return (
    <AbsoluteFill style={{ transformOrigin: "0 0", transform: `translate(${W / 2 - c.cx * c.z}px, ${H / 2 - c.cy * c.z}px) scale(${c.z}) rotate(${c.r}deg)` }}>
      {children}
    </AbsoluteFill>
  );
};
const Svg: React.FC<{ children: React.ReactNode; op?: number }> = ({ children, op = 1 }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, opacity: op, overflow: "visible" }}>{children}</svg>
);

// ------------------------------------------------------------------ cenário 2D próprio: pôr do sol neon (sem logos)
const FundoNeon: React.FC<{ f: number; noite?: number; id: string }> = ({ f, noite = 0, id }) => {
  const sol = 1 - noite;
  return (
    <Svg>
      <defs>
        <linearGradient id={`${id}c`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={noite > 0.5 ? "#080420" : "#1a0838"} />
          <stop offset="0.45" stopColor={noite > 0.5 ? "#2a0f4f" : "#5b1a78"} />
          <stop offset="0.7" stopColor={noite > 0.5 ? "#6a1f6e" : "#ff5f8f"} />
          <stop offset="1" stopColor={noite > 0.5 ? "#ff5f8f" : "#ffb86b"} />
        </linearGradient>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff36b" /><stop offset="1" stopColor="#ff4fa3" /></linearGradient>
        <linearGradient id={`${id}chao`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a0f5e" /><stop offset="1" stopColor="#0b0420" /></linearGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${id}c)`} />
      {/* estrelas */}
      {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={rnd(`${id}e${i}`) * W} cy={rnd(`${id}f${i}`) * 900} r={1.5 + rnd(`${id}g${i}`) * 2} fill="#fff" opacity={(0.3 + 0.5 * Math.abs(Math.sin(f * 0.05 + i))) * (0.4 + noite * 0.6)} />)}
      {/* sol listrado */}
      <g opacity={0.35 + 0.65 * sol}>
        <circle cx={540} cy={1330} r={300} fill={`url(#${id}s)`} />
        {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={200} y={1250 + i * 30 + ((f * 0.6) % 30)} width={680} height={6 + i * 2} fill="#5b1a78" opacity={0.9} />)}
      </g>
      {/* skyline em silhueta (desenho próprio) */}
      {[[-20, 160, 380], [130, 120, 520], [240, 150, 300], [380, 110, 610], [480, 170, 420], [640, 120, 560], [750, 150, 330], [890, 130, 480], [1010, 140, 360]].map(([x, w, h], i) => (
        <g key={i}>
          <rect x={x} y={1500 - h} width={w} height={h} fill="#2b0d4a" />
          {Array.from({ length: Math.floor(h / 46) }, (_, a) => <rect key={a} x={x + 16 + (a % 3) * 30} y={1500 - h + 20 + a * 46} width={14} height={20} fill={a % 4 === 0 ? CIANO : "#ffcf6b"} opacity={0.25 + 0.55 * noite * (rnd(`${id}j${i}${a}`) > 0.4 ? 1 : 0.2)} />)}
        </g>
      ))}
      {/* chão com grade em perspectiva */}
      <rect y={1500} width={W} height={420} fill={`url(#${id}chao)`} />
      {Array.from({ length: 9 }, (_, i) => { const t = ((i + (f * 0.03) % 1) / 9); const y = 1500 + Math.pow(t, 2) * 420; return <line key={i} x1={0} x2={W} y1={y} y2={y} stroke={ROSA} strokeWidth={2 + t * 3} opacity={0.5} />; })}
      {Array.from({ length: 13 }, (_, i) => <line key={i} x1={540 + (i - 6) * 40} y1={1500} x2={540 + (i - 6) * 260} y2={1920} stroke={ROSA} strokeWidth={3} opacity={0.4} />)}
      {/* palmeiras em silhueta */}
      {[[60, 1.1, 1], [1010, 1.25, -1]].map(([x, s, d], i) => (
        <g key={i} transform={`translate(${x} 1520) scale(${(d as number) * (s as number)} ${s})`}>
          <path d="M 0,0 C 10,-160 30,-300 60,-430" fill="none" stroke="#14061f" strokeWidth={22} strokeLinecap="round" />
          {[-150, -110, -60, -20, 20].map((a, k) => <path key={k} transform={`translate(60 -430) rotate(${a + wobble(f, i * 7 + k, 0.4) * 4})`} d="M 0,0 C 60,-30 140,-10 200,50 C 130,10 60,10 0,0 Z" fill="#14061f" />)}
        </g>
      ))}
    </Svg>
  );
};

// ------------------------------------------------------------------ material oficial em moldura neon (HTML)
type Midia = { tipo: "foto"; src: string } | { tipo: "clipe"; src: string; rate?: number };
const Moldura: React.FC<{
  x: number; y: number; w: number; h: number; lf: number; entra?: number; rot?: number; cor?: string;
  credito?: string; zoom?: [number, number]; pan?: [number, number]; dur: number; filtro?: string; borda?: number;
  children?: React.ReactNode; midias: { de: number; m: Midia; ate?: number }[]; op?: number; ini: number;
}> = ({ ini, x, y, w, h, lf, entra = 0, rot = 0, cor = ROSA, credito, zoom = [1.05, 1.18], pan = [0, 0], dur, filtro, borda = 8, children, midias, op = 1 }) => {
  const e = eback(ramp(lf, entra, entra + 12));
  const t = clamp01(lf / Math.max(1, dur));
  const z = lerp(zoom[0], zoom[1], eio(t));
  const px = lerp(-pan[0], pan[0], eio(t)), py = lerp(-pan[1], pan[1], eio(t));
  if (lf < entra) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, transform: `rotate(${rot}deg) scale(${e})`, opacity: op, borderRadius: 34, boxShadow: `0 0 0 ${borda}px ${TINTA}, 0 0 0 ${borda + 6}px ${cor}, 0 0 60px 10px ${cor}88, 14px 22px 0 ${borda + 4}px rgba(0,0,0,0.45)`, overflow: "hidden", background: "#000" }}>
      {midias.map((md, i) => {
        const ate = md.ate ?? (midias[i + 1]?.de ?? 1e6);
        if (lf < md.de - 1 || lf >= ate + 1) return null;
        const est: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: `scale(${z}) translate(${px}px, ${py}px)`, filter: filtro };
        const fadeIn = clamp01((lf - md.de) / 5);
        return (
          <div key={i} style={{ position: "absolute", inset: 0, opacity: i === 0 ? 1 : fadeIn }}>
            {md.m.tipo === "foto" ? <Img src={staticFile(md.m.src)} style={est} /> : (
              <Sequence from={ini + md.de} durationInFrames={Math.min(ate, dur + 2) - md.de + 2} layout="none">
                <OffthreadVideo src={staticFile(md.m.src)} muted playbackRate={md.m.rate ?? 1} style={est} />
              </Sequence>
            )}
          </div>
        );
      })}
      {children}
      {credito && (
        <div style={{ position: "absolute", left: 18, top: 16, padding: "6px 14px", borderRadius: 12, background: "rgba(10,6,24,0.78)", border: `2px solid ${cor}`, fontFamily: "Montserrat", fontWeight: 900, fontSize: 22, color: "#fff", letterSpacing: 1 }}>{credito}</div>
      )}
    </div>
  );
};
const TRAILER = "TRAILER OFICIAL • ROCKSTAR GAMES";
const OFICIAL = "IMAGEM OFICIAL • ROCKSTAR GAMES";

// ------------------------------------------------------------------ objetos 2D próprios
const Controle: React.FC<{ s?: number; brilho?: number; aperta?: number }> = ({ s = 1, brilho = 0, aperta = 0 }) => (
  <g transform={`scale(${s})`}>
    <path d="M -70,-10 C -70,-40 -40,-44 0,-44 C 40,-44 70,-40 70,-10 C 74,20 84,52 60,58 C 40,62 30,36 18,28 L -18,28 C -30,36 -40,62 -60,58 C -84,52 -74,20 -70,-10 Z" fill="#20243a" stroke={TINTA} strokeWidth={6} />
    <path d="M -46,-14 h 10 v -10 h 8 v 10 h 10 v 8 h -10 v 10 h -8 v -10 h -10 Z" fill="#9aa3c7" />
    {[[36, -24, CIANO], [50, -10, ROSA], [36, 4, "#7dff9a"], [22, -10, AMARELO]].map(([cx, cy, c], i) => <circle key={i} cx={cx as number} cy={(cy as number) + (i === 1 ? aperta * 4 : 0)} r={6} fill={c as string} opacity={i === 1 ? 0.6 + 0.4 * aperta : 0.8} />)}
    <rect x={-14} y={-34} width={28} height={8} rx={4} fill={CIANO} opacity={0.4 + brilho * 0.6} />
  </g>
);
const IconeCirc: React.FC<{ x: number; y: number; s: number; cor: string; children: React.ReactNode; rot?: number }> = ({ x, y, s, cor, children, rot = 0 }) => (
  s <= 0.01 ? null :
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <circle r={78} fill={TINTA} opacity={0.4} cx={6} cy={8} />
    <circle r={78} fill="#1b1036" stroke={cor} strokeWidth={8} />
    {children}
  </g>
);
const Rotulo: React.FC<{ x: number; y: number; t: string; cor?: string; tam?: number; op?: number; anc?: "start" | "middle" | "end" }> = ({ x, y, t, cor = "#fff", tam = 30, op = 1, anc = "middle" }) => (
  <text x={x} y={y} textAnchor={anc} fontFamily="Montserrat" fontWeight={900} fontSize={tam} fill={cor} stroke={TINTA} strokeWidth={8} paintOrder="stroke" opacity={op}>{t}</text>
);

// pose segurando o controle com as duas mãos (controle na mão direita)
const segurando = (f: number, seed = 1): Pose => ({ ...parado(f, seed), bracoE: [28, 118], bracoD: [30, 112], frenteE: true, frenteD: true, maoE: "punho", maoD: "punho", olhar: [0.1, 0.5], cabecaIncl: 5 });
const espera = (f: number, seed = 1): Pose => ({ ...parado(f, seed), bracoD: [70, 100 + wobble(f, seed, 1) * 6], maoD: "aberta", frenteD: true, bracoE: [26, 112], frenteE: true, maoE: "punho", olhar: [0, 0], virar: 0, cabecaIncl: -3 });
const MAO_CONTROLE = (b = 0, a = 0) => <g transform="translate(-20 6) rotate(-8)"><Controle s={0.62} brilho={b} aperta={a} /></g>;

// ================================================================== 01 ABERTURA
export const Cena01: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const mas = P("Mas");
  const lan = P("lançou");
  const pose = lf < mas - 4 ? segurando(lf, 1) : misturaPose(segurando(lf, 1), espera(lf, 1), eio(ramp(lf, mas - 4, mas + 6)));
  // abertura com energia: soco de câmera no 1º quadro + pulso no tempo da trilha (118 bpm ≈ 15,25 quadros)
  const soco = 1 + 0.28 * (1 - eout(ramp(lf, 0, 10)));
  const fb = 30 * 60 / 118;
  const pulso = 1 + 0.025 * Math.exp(-((lf % fb) / 4)) * (lf < mas + 30 ? 1 : 0.4);
  const treme = lf >= lan && lf < lan + 8 ? Math.sin(lf * 2.7) * 10 * (1 - (lf - lan) / 8) : 0;
  const est = eback(ramp(lf, lan - 2, lan + 8));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `translate(${treme}px, ${treme * 0.6}px) scale(${soco * pulso})`, transformOrigin: "540px 700px" }}>
        <Cam lf={lf} chaves={[[0, 540, 900, 1.12], [mas, 540, 960, 1.0], [dur, 540, 960, 1.03]]}>
          <FundoNeon f={lf * 2} id="g1" />
          <Moldura ini={inicio} x={40} y={190} w={1000} h={880} lf={lf} dur={dur} entra={-14} rot={-1.5} credito={TRAILER} zoom={[1.08, 1.2]} pan={[20, 0]}
            midias={[{ de: 0, m: { tipo: "clipe", src: "gta/k4.mp4", rate: 0.6 } }, { de: 45, m: { tipo: "clipe", src: "gta/k3.mp4", rate: 0.72 } }, { de: 92, m: { tipo: "clipe", src: "gta/k5.mp4", rate: 1.0 } }, { de: 148, m: { tipo: "clipe", src: "gta/k1.mp4", rate: 1.0 } }]} />
          <Svg>
            {/* explosão de neon no "lançou" */}
            {lf >= lan - 2 && lf < lan + 26 && Array.from({ length: 18 }, (_, i) => {
              const a = (i / 18) * Math.PI * 2, r = 60 + eout(ramp(lf, lan - 2, lan + 22)) * 420;
              return <line key={i} x1={830 + Math.cos(a) * r * 0.55} y1={1135 + Math.sin(a) * r * 0.55} x2={830 + Math.cos(a) * r} y2={1135 + Math.sin(a) * r} stroke={[ROSA, CIANO, AMARELO][i % 3]} strokeWidth={10} strokeLinecap="round" opacity={1 - ramp(lf, lan + 8, lan + 26)} />;
            })}
            <Avatar id="g1-av" x={300} y={2130} escala={1.1} pose={pose} f={lf} dir={1}
              expr={exprEm(lf, [[0, "empolgado"], [mas - 2, "desconfiado"], [P("aproveitar"), "feliz"]])}
              itemD={MAO_CONTROLE(lf < mas ? 1 : 0, Math.abs(Math.sin(lf * 0.5)) * (lf < mas ? 1 : 0))} />
            {lf >= lan - 2 && (
              <g transform={`translate(830 1135) rotate(${-8 + wobble(lf, 3, 0.4) * 2}) scale(${est})`}>
                <rect x={-170} y={-74} width={340} height={148} rx={24} fill={AMARELO} stroke={TINTA} strokeWidth={8} />
                <text y={-14} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={32} fill={TINTA}>GTA 6</text>
                <text y={50} textAnchor="middle" fontFamily="Anton" fontSize={66} fill={TINTA}>JÁ LANÇOU!</text>
              </g>
            )}
          </Svg>
        </Cam>
      </AbsoluteFill>
      <Svg><SeloCanal f={lf} em={mas - 4} t="ANTES DE JOGAR, FAÇA ISSO!" y={140} tam={64} /></Svg>
    </AbsoluteFill>
  );
};

// ================================================================== 02 TV: MODO JOGO
const TV: React.FC<{ x: number; y: number; w: number; h: number; children?: React.ReactNode }> = ({ x, y, w, h }) => (
  <g>
    <rect x={x - 26} y={y - 26} width={w + 52} height={h + 52} rx={30} fill="#11131f" stroke={TINTA} strokeWidth={8} />
    <rect x={x - 26} y={y - 26} width={w + 52} height={h + 52} rx={30} fill="none" stroke={CIANO} strokeWidth={3} opacity={0.5} />
    <path d={`M ${x + w / 2 - 120},${y + h + 26} L ${x + w / 2 - 160},${y + h + 110} L ${x + w / 2 + 160},${y + h + 110} L ${x + w / 2 + 120},${y + h + 26} Z`} fill="#1b1e30" stroke={TINTA} strokeWidth={7} />
  </g>
);
const BarraAtraso: React.FC<{ x: number; y: number; rot: string; cor: string; atraso: number; f0: number; lf: number; vis: number }> = ({ x, y, rot, cor, atraso, f0, lf, vis }) => {
  if (vis <= 0) return null;
  const ciclo = 54; const t = (lf - f0) % ciclo; const k = Math.floor((lf - f0) / ciclo);
  const aperto = t < 6; const resp = t >= atraso && t < atraso + 14;
  return (
    <g transform={`translate(${x} ${y})`} opacity={vis}>
      <rect x={-20} y={-60} width={920} height={130} rx={26} fill="#140c2a" stroke={cor} strokeWidth={5} opacity={0.92} />
      <Rotulo x={30} y={14} t={rot} cor={cor} tam={34} anc="start" />
      <g transform="translate(330 4)"><Controle s={0.55} aperta={aperto ? 1 : 0} /></g>
      <line x1={400} y1={4} x2={720} y2={4} stroke="#ffffff33" strokeWidth={10} strokeLinecap="round" />
      <line x1={400} y1={4} x2={400 + 320 * clamp01(t / atraso)} y2={4} stroke={cor} strokeWidth={10} strokeLinecap="round" opacity={t < atraso ? 1 : 0.25} />
      <g transform="translate(800 4)">
        <rect x={-62} y={-42} width={124} height={84} rx={12} fill="#0c0e18" stroke={cor} strokeWidth={4} />
        <circle r={resp ? 26 : 10} fill={resp ? cor : "#333"} opacity={resp ? 1 : 0.6} />
      </g>
      {k >= 0 && <text x={870} y={-70} textAnchor="end" fontFamily="Montserrat" fontWeight={900} fontSize={22} fill="#ffffffaa"></text>}
    </g>
  );
};
export const Cena02: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const modo = P("Modo"), atr = P("atraso");
  const cmp = eout(ramp(lf, atr - 6, atr + 10));
  const pose = lf < modo - 6 ? apontando(lf, 118, 2) : segurando(lf, 2);
  const tx = 120, ty = 260, tw = 840, th = 472;
  const osd = clamp01(ramp(lf, modo - 4, modo + 6)) * (1 - clamp01(ramp(lf, atr - 8, atr)));
  return (
    <AbsoluteFill>
      <Cam lf={lf} chaves={[[0, 540, 760, 1.25], [modo - 8, 540, 820, 1.12], [atr - 6, 540, 960, 1.0], [dur, 540, 960, 1.0]]}>
        <FundoNeon f={lf} noite={0.8} id="g2" />
        <Svg><rect y={1180} width={W} height={740} fill="#1a0c33" opacity={0.6} /><TV x={tx} y={ty} w={tw} h={th} /></Svg>
        <Moldura ini={inicio} x={tx} y={ty} w={tw} h={th} lf={lf} dur={dur} borda={0} cor="#00000000" credito={TRAILER} zoom={[1.02, 1.1]}
          midias={[{ de: 0, m: { tipo: "clipe", src: "gta/k5.mp4", rate: 0.6 } }, { de: 95, m: { tipo: "clipe", src: "gta/k1.mp4", rate: 0.46 } }]}>
          {/* menu genérico da TV (desenho próprio, sem marca) */}
          <div style={{ position: "absolute", right: 24, top: 70, width: 330, padding: 18, borderRadius: 18, background: "rgba(8,10,20,0.88)", border: `3px solid ${CIANO}`, opacity: osd, transform: `translateX(${(1 - osd) * 60}px)`, fontFamily: "Montserrat", fontWeight: 900, color: "#fff", fontSize: 24 }}>
            <div style={{ fontSize: 18, opacity: 0.7, marginBottom: 10 }}>IMAGEM (ILUSTRATIVO)</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>MODO JOGO
              <div style={{ width: 70, height: 36, borderRadius: 18, background: ramp(lf, modo + 4, modo + 10) > 0.5 ? "#2bd96b" : "#444", position: "relative" }}>
                <div style={{ position: "absolute", top: 4, left: 4 + 34 * eio(ramp(lf, modo + 4, modo + 10)), width: 28, height: 28, borderRadius: 14, background: "#fff" }} />
              </div>
            </div>
          </div>
        </Moldura>
        <Svg>
          <BarraAtraso x={110} y={950} rot="SEM" cor="#ff6b6b" atraso={34} f0={atr} lf={lf} vis={cmp} />
          <BarraAtraso x={110} y={1085} rot="COM" cor="#2bd96b" atraso={10} f0={atr} lf={lf} vis={eout(ramp(lf, atr + 4, atr + 16))} />
          {cmp > 0 && <Rotulo x={540} y={1185} t="comparação ilustrativa • o resultado varia conforme a TV" tam={24} cor="#ffd7ef" op={cmp} />}
          <Avatar id="g2-av" x={lerp(260, 200, cmp)} y={lerp(2130, 2190, cmp)} escala={lerp(1.05, 0.95, cmp)} pose={pose} f={lf}
            expr={exprEm(lf, [[0, "pensativo"], [modo, "empolgado"], [atr, "feliz"]])} itemD={lf < modo - 6 ? undefined : MAO_CONTROLE(1, Math.abs(Math.sin(lf * 0.4)))} />
        </Svg>
      </Cam>
      <Svg><SeloCanal f={lf} em={modo - 4} t="TV: MODO JOGO" y={140} tam={66} /></Svg>
    </AbsoluteFill>
  );
};

// ================================================================== 03 BRILHO + HDR
export const Cena03: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const esc = P("escura"), cla = P("clara");
  // valor do controle deslizante: meio → escuro → claro → meio (ajustado)
  const v = lf < esc - 4 ? lerp(0.5, 0.5, 0) : lf < cla - 4 ? lerp(0.5, 0.08, eio(ramp(lf, esc - 4, esc + 10))) : lf < cla + 30 ? lerp(0.08, 0.95, eio(ramp(lf, cla - 4, cla + 10))) : lerp(0.95, 0.55, eio(ramp(lf, cla + 30, cla + 46)));
  const br = lerp(0.25, 1.9, v);
  const ok = clamp01(ramp(lf, cla + 40, cla + 50));
  const pose: Pose = { ...parado(lf, 3), bracoD: [62, 40], maoD: "punho", frenteD: true, olhar: [0.6, -0.5], cabecaIncl: -4 };
  return (
    <AbsoluteFill>
      <Cam lf={lf} chaves={[[0, 540, 960, 1.0], [esc, 540, 900, 1.06], [cla, 540, 900, 1.06], [dur, 540, 940, 1.02]]}>
        <FundoNeon f={lf} noite={0.6} id="g3" />
        <Moldura ini={inicio} x={60} y={200} w={960} h={760} lf={lf} dur={dur} rot={1.2} cor={CIANO} credito={OFICIAL} zoom={[1.04, 1.14]} pan={[25, 8]}
          filtro={`brightness(${br}) contrast(${lerp(0.85, 1.1, 1 - Math.abs(v - 0.55) * 1.6)}) saturate(${lerp(0.6, 1.2, 1 - Math.abs(v - 0.55) * 1.8)})`}
          midias={[{ de: 0, m: { tipo: "foto", src: "gta/Vice_City_10.jpg" } }]}>
          <div style={{ position: "absolute", left: 18, bottom: 16, padding: "6px 14px", borderRadius: 12, background: "rgba(10,6,24,0.78)", fontFamily: "Montserrat", fontWeight: 900, fontSize: 22, color: "#fff" }}>comparação ilustrativa (brilho alterado por nós)</div>
        </Moldura>
        <Svg>
          {/* controle deslizante 2D */}
          <g transform="translate(140 1080)">
            <Rotulo x={0} y={-30} t="BRILHO" anc="start" tam={34} cor={AMARELO} />
            <rect x={0} y={0} width={800} height={26} rx={13} fill="#1b1036" stroke={TINTA} strokeWidth={5} />
            <rect x={0} y={0} width={800 * v} height={26} rx={13} fill={AMARELO} />
            <circle cx={800 * v} cy={13} r={34} fill="#fff" stroke={TINTA} strokeWidth={7} />
            <Rotulo x={0} y={90} t="escura demais" tam={26} anc="start" cor={v < 0.2 ? "#ff6b6b" : "#ffffff88"} />
            <Rotulo x={800} y={90} t="clara demais" tam={26} anc="end" cor={v > 0.85 ? "#ff6b6b" : "#ffffff88"} />
            {ok > 0 && <g transform={`translate(${800 * v} -70) scale(${eback(ok)})`}><rect x={-110} y={-36} width={220} height={58} rx={16} fill="#2bd96b" stroke={TINTA} strokeWidth={6} /><text y={6} textAnchor="middle" fontFamily="Anton" fontSize={36} fill={TINTA}>AJUSTADA ✓</text></g>}
          </g>
          {lf >= esc - 4 && lf < cla - 4 && <Rotulo x={540} y={560} t="DETALHES SOMEM NO ESCURO" tam={44} cor="#ffd7ef" />}
          {lf >= cla && lf < cla + 30 && <Rotulo x={540} y={560} t="AS CORES SE APAGAM" tam={44} cor="#ffd7ef" />}
          <Avatar id="g3-av" x={860} y={2130} escala={1.05} dir={-1} pose={pose} f={lf} expr={exprEm(lf, [[0, "pensativo"], [esc, "desconfiado"], [cla, "surpreso"], [cla + 40, "feliz"]])} />
        </Svg>
      </Cam>
      <Svg><SeloCanal f={lf} em={P("HDR") - 4} t="BRILHO + HDR" y={140} tam={66} fundo={CIANO} /></Svg>
    </AbsoluteFill>
  );
};

// ================================================================== 04 ÁUDIO E ACESSIBILIDADE
export const Cena04: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const leg = P("legendas"), tam = P("tamanho"), vol = P("volume");
  const fone = lf >= 18;
  const pose: Pose = lf < 18 ? { ...parado(lf, 4), bracoD: [150, 120], bracoE: [150, 120], frenteE: false, frenteD: false, cabecaIncl: 0 } : lf < vol ? { ...parado(lf, 4), olhar: [-0.5, -0.4] } : { ...parado(lf, 4), bracoD: [70, 30], maoD: "punho", olhar: [-0.6, -0.3] };
  const iv = (em: number) => eback(ramp(lf, em - 4, em + 8));
  const nivel = lerp(0.35, 0.8, eio(ramp(lf, vol, vol + 20)));
  return (
    <AbsoluteFill>
      <Cam lf={lf} chaves={[[0, 540, 1100, 1.15], [18, 540, 1050, 1.08], [leg - 6, 540, 960, 1.0], [dur, 540, 960, 1.02]]}>
        <FundoNeon f={lf} noite={0.9} id="g4" />
        <Moldura ini={inicio} x={70} y={210} w={940} h={620} lf={lf} dur={dur} rot={-1.2} cor={ROXO} credito={OFICIAL} zoom={[1.0, 1.12]} pan={[0, 12]}
          midias={[{ de: 0, m: { tipo: "foto", src: "gta/Lucia_Caminos_09.jpg" } }]} />
        <Svg>
          {/* painel de ícones ilustrativos (não é o menu do jogo) */}
          <IconeCirc x={210} y={960} s={iv(P("áudio"))} cor={CIANO}>
            <path d="M -30,-16 h 18 l 26,-22 v 76 l -26,-22 h -18 Z" fill={CIANO} />
            {[0, 1].map((i) => <path key={i} d={`M ${26 + i * 16},-${18 + i * 10} C ${40 + i * 18},-6 ${40 + i * 18},6 ${26 + i * 16},${18 + i * 10}`} fill="none" stroke={CIANO} strokeWidth={6} strokeLinecap="round" opacity={0.5 + 0.5 * Math.sin(lf * 0.3 + i)} />)}
          </IconeCirc>
          <IconeCirc x={430} y={960} s={iv(leg)} cor={AMARELO}>
            <rect x={-44} y={-30} width={88} height={60} rx={10} fill="none" stroke={AMARELO} strokeWidth={7} />
            <text y={14} textAnchor="middle" fontFamily="Anton" fontSize={36} fill={AMARELO}>CC</text>
          </IconeCirc>
          <IconeCirc x={650} y={960} s={iv(tam)} cor={ROSA}>
            <text x={-8} y={20} textAnchor="middle" fontFamily="Anton" fontSize={lerp(36, 64, (Math.sin(lf * 0.15) + 1) / 2)} fill={ROSA}>Aa</text>
          </IconeCirc>
          <IconeCirc x={870} y={960} s={iv(vol)} cor="#7dff9a">
            <path d="M -26,-30 C -60,-30 -60,20 -26,20 L -6,40 L -6,20 L 26,20 C 60,20 60,-30 26,-30 Z" fill="none" stroke="#7dff9a" strokeWidth={6} />
            <rect x={-40} y={52} width={80} height={10} rx={5} fill="#ffffff33" /><rect x={-40} y={52} width={80 * nivel} height={10} rx={5} fill="#7dff9a" />
          </IconeCirc>
          {lf >= leg - 4 && <Rotulo x={540} y={1090} t="ícones ilustrativos • as opções variam no jogo e no console" tam={24} cor="#ffd7ef" op={clamp01(ramp(lf, leg - 4, leg + 6))} />}
          <Avatar id="g4-av" x={540} y={2130} escala={1.05} pose={pose} f={lf} fone={fone}
            expr={exprEm(lf, [[0, "neutro"], [18, "sereno"], [leg, "feliz"], [vol, "empolgado"]])} />
        </Svg>
      </Cam>
      <Svg><SeloCanal f={lf} em={P("acessibilidade") - 4} t="ÁUDIO E ACESSIBILIDADE" y={140} tam={60} fundo={ROSA} cor="#fff" /></Svg>
    </AbsoluteFill>
  );
};

// ================================================================== 05 NÃO SAI CORRENDO SÓ ATRÁS DE MISSÃO
export const Cena05: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const nao = P("não"), freia = P("missão");
  const corre = lf < freia - 4;
  const x = corre ? 540 + Math.sin(lf * 0.05) * 30 : 540;
  const pose: Pose = corre && lf >= nao - 6 ? correndo(lf, 5) : lf < nao - 6 ? apontando(lf, 110, 5) : misturaPose(correndo(lf, 5), { ...parado(lf, 5), bracoD: [100, 150], maoD: "aponta", frenteD: true }, eio(ramp(lf, freia - 4, freia + 6)));
  return (
    <AbsoluteFill>
      <Cam lf={lf} chaves={[[0, 540, 960, 1.0], [nao, 540, 975, 1.03], [freia, 540, 990, 1.06], [dur, 540, 990, 1.07]]}>
        <FundoNeon f={lf * (corre ? 3 : 1)} noite={0.3} id="g5" />
        <Moldura ini={inicio} x={60} y={230} w={960} h={760} lf={lf} dur={dur} rot={1.5} cor={AMARELO} credito={TRAILER} zoom={[1.05, 1.15]}
          midias={[{ de: 0, m: { tipo: "clipe", src: "gta/k6.mp4", rate: 0.32 } }]} />
        <Svg>
          {/* placa de missão que fica pra trás */}
          {lf >= nao - 4 && (
            <g transform={`translate(${lerp(820, 1000, eio(ramp(lf, freia, freia + 20)))} 1120) rotate(6) scale(${eback(ramp(lf, nao - 4, nao + 8))})`}>
              <rect x={-120} y={-50} width={240} height={100} rx={20} fill={AMARELO} stroke={TINTA} strokeWidth={7} />
              <text y={16} textAnchor="middle" fontFamily="Anton" fontSize={44} fill={TINTA}>MISSÃO ➜</text>
            </g>
          )}
          {/* linhas de velocidade enquanto corre */}
          {corre && lf >= nao - 6 && Array.from({ length: 6 }, (_, i) => <line key={i} x1={((lf * 40 + i * 230) % 1300) - 200} y1={1300 + i * 70} x2={((lf * 40 + i * 230) % 1300) - 40} y2={1300 + i * 70} stroke="#fff" strokeWidth={6} opacity={0.5} strokeLinecap="round" />)}
          <Avatar id="g5-av" x={x} y={2130} escala={1.05} pose={pose} f={lf} expr={exprEm(lf, [[0, "feliz"], [nao, "empolgado"], [freia, "sereno"]])} />
        </Svg>
      </Cam>
      <Svg><SeloCanal f={lf} em={P("primeiras") - 4} t="PRIMEIRAS HORAS" y={140} tam={66} /></Svg>
    </AbsoluteFill>
  );
};

// ================================================================== 06 EXPLORA COM CALMA (carrossel de lugares oficiais)
const LUGARES: { src: Midia; nome: string }[] = [
  { src: { tipo: "clipe", src: "gta/k5.mp4", rate: 0.5 }, nome: "VICE CITY" },
  { src: { tipo: "foto", src: "gta/Leonida_Keys_01.jpg" }, nome: "LEONIDA KEYS" },
  { src: { tipo: "foto", src: "gta/Grassrivers_05.jpg" }, nome: "GRASSRIVERS" },
  { src: { tipo: "foto", src: "gta/Mount_Kalaga_National_Park_06.jpg" }, nome: "MOUNT KALAGA" },
  { src: { tipo: "clipe", src: "gta/k7.mp4", rate: 0.45 }, nome: "VICE CITY" },
];
export const Cena06: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const marcos = [0, P("presta") - 4, P("experimenta") - 4, P("acostumando") - 4, P("detalhes") - 4];
  let k = 0; for (let i = 0; i < marcos.length; i++) if (lf >= marcos[i]) k = i;
  const desliza = (i: number) => {
    const e = eio(ramp(lf, marcos[i], marcos[i] + 14));
    const sai = i < marcos.length - 1 ? eio(ramp(lf, marcos[i + 1], marcos[i + 1] + 14)) : 0;
    return { x: lerp(1100, 60, e) - 1100 * sai, op: lf >= marcos[i] && sai < 1 ? 1 : 0 };
  };
  const pose: Pose = { ...apontando(lf, 135 + Math.sin(lf * 0.05) * 6, 6), olhar: [0.4, -0.7], cabecaIncl: -6 };
  return (
    <AbsoluteFill>
      <Cam lf={lf} chaves={[[0, 540, 960, 1.0], [dur, 540, 960, 1.04]]}>
        <FundoNeon f={lf} noite={0.15} id="g6" />
        {LUGARES.map((l, i) => {
          const d = desliza(i);
          if (!d.op) return null;
          const lfl = lf - marcos[i];
          return (
            <div key={i} style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transform: `translateX(${d.x - 60}px)` }}>
              <Moldura ini={inicio} x={60} y={220} w={960} h={760} lf={lf} dur={dur} rot={i % 2 ? 1.5 : -1.5} cor={[ROSA, CIANO, "#7dff9a", AMARELO, ROSA][i]} credito={l.src.tipo === "clipe" ? TRAILER : OFICIAL}
                zoom={[1.04, 1.2]} pan={[30, 10]} midias={[{ de: marcos[i], m: l.src }]}>
                <div style={{ position: "absolute", right: 18, bottom: 16, padding: "6px 16px", borderRadius: 12, background: "rgba(10,6,24,0.8)", fontFamily: "Anton", fontSize: 40, color: "#fff", letterSpacing: 2, opacity: clamp01(lfl / 8) }}>{l.nome}</div>
              </Moldura>
            </div>
          );
        })}
        <Svg>
          <Avatar id="g6-av" x={300} y={2130} escala={1.05} pose={pose} f={lf} expr={exprEm(lf, [[0, "maravilhado"], [marcos[2], "feliz"], [marcos[4], "maravilhado"]])} />
          {/* lupa: "detalhes" */}
          {lf >= marcos[4] && <g transform={`translate(760 1180) scale(${eback(ramp(lf, marcos[4], marcos[4] + 10))}) rotate(${Math.sin(lf * 0.08) * 8})`}><circle r={80} fill="#ffffff22" stroke={AMARELO} strokeWidth={14} /><line x1={58} y1={58} x2={130} y2={130} stroke={AMARELO} strokeWidth={22} strokeLinecap="round" /></g>}
        </Svg>
      </Cam>
      <Svg><SeloCanal f={lf} em={4} t="EXPLORE COM CALMA" y={140} tam={66} fundo="#7dff9a" /></Svg>
    </AbsoluteFill>
  );
};

// ================================================================== 07 CUIDADO COM SPOILERS
const IconeRede: React.FC<{ tipo: number; s: number }> = ({ tipo, s }) => (
  <g transform={`scale(${s})`}>
    <rect x={-56} y={-56} width={112} height={112} rx={30} fill={["#ff3b5c", "#2a8cff", "#a74bff", "#1fd1a5"][tipo]} stroke={TINTA} strokeWidth={7} />
    {tipo === 0 && <path d="M -16,-24 L 26,0 L -16,24 Z" fill="#fff" />}
    {tipo === 1 && <path d="M -30,-20 h 60 v 36 h -36 l -16,14 v -14 h -8 Z" fill="#fff" />}
    {tipo === 2 && <path d="M 0,26 C -40,0 -34,-30 -12,-26 C -4,-24 0,-16 0,-12 C 0,-16 4,-24 12,-26 C 34,-30 40,0 0,26 Z" fill="#fff" />}
    {tipo === 3 && <g fill="#fff"><circle cx={-18} r={7} /><circle r={7} /><circle cx={18} r={7} /></g>}
  </g>
);
export const Cena07: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const aviso = P("spoiler") - 4, empurra = P("toma") - 2;
  const fora = eio(ramp(lf, empurra + 6, empurra + 22));
  const pose: Pose = lf < empurra ? { ...surpreso(lf, 7) } : { ...parado(lf, 7), bracoD: [lerp(80, 95, eio(ramp(lf, empurra, empurra + 8))), 10], maoD: "aberta", tronco: 6 * (1 - fora), olhar: [0.3, -0.6] };
  return (
    <AbsoluteFill>
      <Cam lf={lf} chaves={[[0, 540, 960, 1.0], [aviso, 540, 900, 1.08], [empurra + 10, 540, 960, 1.0], [dur, 540, 960, 1.03]]}>
        <FundoNeon f={lf} noite={1} id="g7" />
        <Moldura ini={inicio} x={60} y={220} w={960} h={760} lf={lf} dur={dur} rot={-1} cor={ROXO} credito={OFICIAL} zoom={[1.02, 1.12]} pan={[20, 0]}
          filtro={`blur(${lerp(6, 0, fora)}px) brightness(${lerp(0.6, 1, fora)})`} midias={[{ de: 0, m: { tipo: "foto", src: "gta/Vice_City_27.jpg" } }]} />
        <Svg>
          {[0, 1, 2, 3].map((i) => {
            const e = eback(ramp(lf, 4 + i * 6, 16 + i * 6));
            const x = [230, 420, 660, 860][i] + fora * (i < 2 ? -700 : 700);
            return <g key={i} transform={`translate(${x} ${420 + Math.sin(lf * 0.1 + i) * 20 + (i % 2) * 140})`}><IconeRede tipo={i} s={e} /></g>;
          })}
          {lf >= aviso && (
            <g transform={`translate(${540 + fora * 900} 640) rotate(${-4 + fora * 25}) scale(${eback(ramp(lf, aviso, aviso + 10))})`}>
              <rect x={-420} y={-110} width={840} height={220} rx={30} fill="#ff2d55" stroke={TINTA} strokeWidth={10} />
              <rect x={-400} y={-90} width={800} height={180} rx={22} fill="none" stroke={AMARELO} strokeWidth={6} strokeDasharray="30 18" strokeDashoffset={-lf * 3} />
              <text y={-8} textAnchor="middle" fontFamily="Anton" fontSize={70} fill="#fff">⚠ CUIDADO COM</text>
              <text y={70} textAnchor="middle" fontFamily="Anton" fontSize={70} fill={AMARELO}>SPOILERS</text>
            </g>
          )}
          <Avatar id="g7-av" x={300} y={2130} escala={1.05} pose={pose} f={lf} expr={exprEm(lf, [[0, "desconfiado"], [aviso, "surpreso"], [empurra, "bravo"], [empurra + 20, "sereno"]])} />
        </Svg>
      </Cam>
    </AbsoluteFill>
  );
};

// ================================================================== 08 PERGUNTA FINAL
export const Cena08: C = ({ inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  const q = P("qual");
  const pose: Pose = lf < q ? { ...parado(lf, 8), olhar: [0.4, -0.6], cabecaIncl: -5, bracoE: [26, 112], frenteE: true, maoE: "punho" } : apontando(lf, 95, 8);
  return (
    <AbsoluteFill>
      <Cam lf={lf} chaves={[[0, 540, 900, 1.1], [q, 540, 960, 1.0], [dur, 540, 960, 1.04]]}>
        <FundoNeon f={lf} id="g8" />
        <Moldura ini={inicio} x={60} y={230} w={960} h={660} lf={lf} dur={dur} rot={1} cor={ROSA} credito={TRAILER} zoom={[1.04, 1.16]}
          midias={[{ de: 0, m: { tipo: "clipe", src: "gta/k8.mp4", rate: 0.5 } }, { de: 68, m: { tipo: "foto", src: "gta/Jason_and_Lucia_16.jpg" } }]} />
        <Svg>
          <Avatar id="g8-av" x={780} y={2130} escala={1.05} dir={-1} pose={pose} f={lf} expr={exprEm(lf, [[0, "sereno"], [q, "empolgado"]])} itemE={MAO_CONTROLE(1, 0)} />
        </Svg>
      </Cam>
      <Svg>
        {lf >= q - 4 && (
          <g transform={`translate(540 1035) scale(${eback(ramp(lf, q - 4, q + 10))}) rotate(-2)`}>
            <rect x={-470} y={-110} width={940} height={220} rx={30} fill={AMARELO} stroke={TINTA} strokeWidth={10} />
            <text y={-14} textAnchor="middle" fontFamily="Anton" fontSize={60} fill={TINTA}>QUAL A PRIMEIRA COISA</text>
            <text y={62} textAnchor="middle" fontFamily="Anton" fontSize={60} fill={TINTA}>QUE VOCÊ VAI FAZER?</text>
          </g>
        )}
      </Svg>
    </AbsoluteFill>
  );
};
