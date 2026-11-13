// ARQUIVOS PROIBIDOS — Episódio 01 (roteiro: João). 2D cinematográfico "dossiê noir", sincronizado com a narração.
// Gancho (pasta CONFIDENCIAL) → 10 dossiês (casos.tsx) → sala de arquivos e pasta preta → cartelas finais.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useTempos } from "../../engine/src/kit/tempo";
import { Camera } from "../../engine/src/kit/Camera";
import { Legendas } from "../../engine/src/kit/Legendas";
import { Vinheta, Granulacao, Flash } from "../../engine/src/kit/efeitos";
import { clamp01, eback, eio, eout, ramp, rnd } from "../../engine/src/kit/anim";
import { Mesa, Pasta, Carimbo, DefsPapel, T_, TINTA, VERMELHO, PAPEL, useCena, useFonteMaquina } from "./dossie";
import { CASOS } from "./casos";

const W = 1080, H = 1920;
const ORDEM = ["mkultra", "tuskegee", "guatemala", "cointelpro", "cartas", "pentagono", "ira", "vigilancia", "watergate", "paperclip"];

// ------------------------------------------------------------------ gancho
const Gancho: React.FC<{ inicio: number; fim: number }> = ({ inicio }) => {
  const { lf, P } = useCena(inicio);
  const g2 = P("Existem");
  const itens: { em: number; el: React.ReactNode; x: number; y: number; r: number }[] = [
    { em: P("documentos"), x: 230, y: 520, r: -10, el: <g><rect x={-90} y={-115} width={180} height={230} fill="#efe6cf" stroke={TINTA} strokeWidth={5} />{Array.from({ length: 6 }, (_, k) => <rect key={k} x={-65} y={-80 + k * 30} width={k % 2 ? 100 : 130} height={10} fill="#8a7a5e" />)}</g> },
    { em: P("experiências"), x: 850, y: 560, r: 8, el: <g><path d="M -30,60 L -30,-30 L -14,-70 L 14,-70 L 30,-30 L 30,60 Z" fill="#7cff9a" opacity={0.8} stroke={TINTA} strokeWidth={5} /><circle cx={0} cy={20} r={8} fill="#fff" opacity={0.7} /></g> },
    { em: P("operações"), x: 260, y: 1150, r: -6, el: <g><rect x={-110} y={-80} width={220} height={160} fill="#c9b994" stroke={TINTA} strokeWidth={5} /><path d="M -90,40 C -40,-30 20,30 90,-40" stroke={VERMELHO} strokeWidth={6} fill="none" strokeDasharray="14 10" /><circle cx={90} cy={-40} r={12} fill={VERMELHO} /></g> },
    { em: P("escondidas"), x: 830, y: 1140, r: 6, el: <g><rect x={-120} y={-90} width={240} height={180} fill="#efe6cf" stroke={TINTA} strokeWidth={5} />{Array.from({ length: 4 }, (_, k) => <rect key={k} x={-100} y={-65 + k * 40} width={200} height={24} fill="#000" />)}</g> },
  ];
  const dez = P("10");
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Camera inicio={inicio} chaves={[[0, 540, 900, 0.7], [10, 540, 900, 0.75], [34, 540, 860, 1.25], [g2, 540, 820, 1.15], [dez, 540, 800, 1.32]]} deriva={0.5} tremores={[P("fatos") - 1, dez]} forcaTremor={12}>
        <DefsPapel />
        <g opacity={clamp01(ramp(lf, 4, 14))}>
          <Mesa f={lf} luz={clamp01(ramp(lf, 8, 30))} />
          <g transform={`translate(540 860) scale(${eback(ramp(lf, 8, 20))}) rotate(-3)`}>
            <path d="M -360,-460 L -110,-460 L -80,-510 L 140,-510 L 170,-460 L 360,-460 L 360,460 L -360,460 Z" fill="#a8844f" stroke={TINTA} strokeWidth={10} strokeLinejoin="round" />
            <rect x={-330} y={-430} width={660} height={860} fill={PAPEL} stroke={TINTA} strokeWidth={6} />
            <rect x={-330} y={-430} width={660} height={860} fill="url(#manchas)" opacity={0.5} />
            <T_ x={0} y={-330} t="ARQUIVOS PROIBIDOS" s={56} />
            <T_ x={0} y={-275} t="EP. 01 • 10 DESCOBERTAS" s={32} c="#5a4630" />
            {Array.from({ length: 10 }, (_, k) => <rect key={k} x={-270} y={-200 + k * 50} width={k % 3 ? 470 : 540} height={14} fill="#8a7a5e" opacity={0.7} />)}
            <Carimbo f={lf} em={16} texto="CONFIDENCIAL" x={0} y={-30} tam={80} rot={-14} />
            <Carimbo f={lf} em={P("fatos") - 2} texto="FATOS COMPROVADOS" x={0} y={260} tam={58} rot={8} />
          </g>
          {itens.map((it, i) => lf >= it.em - 2 && (
            <g key={i} transform={`translate(${it.x} ${it.y}) rotate(${it.r}) scale(${eback(ramp(lf, it.em - 2, it.em + 6))})`}>{it.el}</g>
          ))}
          {lf >= dez - 2 && (
            <g transform={`translate(540 760) scale(${eback(ramp(lf, dez - 2, dez + 8))})`}>
              <circle r={210} fill={VERMELHO} opacity={0.9} />
              <text y={100} textAnchor="middle" fontFamily="Anton" fontSize={300} fill="#fff" stroke={TINTA} strokeWidth={14} paintOrder="stroke">10</text>
            </g>
          )}
        </g>
      </Camera>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ caso
const CenaCaso: React.FC<{ id: string; inicio: number; fim: number }> = ({ id, inicio, fim }) => {
  const { lf, P } = useCena(inicio);
  const dur = fim - inicio;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Camera inicio={inicio} chaves={[[0, 540, 820, 1.02], [dur, 540, 760, 1.1, (CASOS[id].n % 2 ? 1 : -1) * 1.2]]} deriva={0.4} tremores={[P(CASOS[id].carimboEm)]} forcaTremor={8}>
        <DefsPapel />
        <Mesa f={lf + inicio} />
        <Pasta caso={CASOS[id]} lf={lf} dur={dur} P={P} />
      </Camera>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ mistério + pasta preta + cartelas
const Final: React.FC<{ inicio: number; fimNarr: number }> = ({ inicio, fimNarr }) => {
  const { lf, P, f } = useCena(inicio);
  const rev = P("revelado"), cor = P("coragem"), preto = fimNarr - inicio + 2;
  if (lf >= preto) {
    const k = lf - preto;
    const cartela = (txt: string, em: number, y: number, s: number, c = "#e9e2d0", fonte = "Anton") =>
      k >= em ? <T_ x={540} y={y} t={txt} s={s} c={c} fonte={fonte} op={clamp01((k - em) / 6)} /> : null;
    return (
      <AbsoluteFill style={{ backgroundColor: "#000" }}>
        <svg width={W} height={H}>
          {cartela("ARQUIVOS PROIBIDOS", 8, 820, 110)}
          {cartela("EPISÓDIO 002", 30, 940, 64, "#bfb6a2", "Special Elite")}
          {k >= 52 && <g transform={`translate(540 1080) scale(${eback(ramp(k, 52, 58))})`}><rect x={-300} y={-58} width={600} height={100} fill="none" stroke={VERMELHO} strokeWidth={8} /><T_ x={0} y={14} t="ACESSO RESTRITO" s={62} c={VERMELHO} fonte="Anton" /></g>}
          {cartela("CONTINUA...", 78, 1230, 56, "#e9e2d0", "Special Elite")}
        </svg>
      </AbsoluteFill>
    );
  }
  const abre = eio(ramp(lf, cor - 4, preto - 2));
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Camera inicio={inicio} chaves={[[0, 540, 820, 1.0], [rev, 540, 1080, 1.55], [preto, 540, 1240, 2.3]]} deriva={0.2} tremores={[rev + 2]} forcaTremor={6}>
        <DefsPapel />
        <rect x={-600} y={-600} width={2300} height={3100} fill="#050506" />
        {/* estantes de arquivo em perspectiva */}
        {[-1, 1].map((s) => (
          <g key={s}>
            {Array.from({ length: 7 }, (_, r) => Array.from({ length: 4 }, (_, c) => {
              const x = 540 + s * (160 + c * 130 + r * 0), y = 160 + r * 150, w = 110 - c * 4;
              return <g key={`${r}${c}`}><rect x={s > 0 ? x : x - w} y={y} width={w} height={120} fill={["#3a2c22", "#2a221c", "#4a3a2a"][(r + c) % 3]} stroke="#000" strokeWidth={4} /><rect x={(s > 0 ? x : x - w) + 20} y={y + 40} width={w - 40} height={22} fill="#c9b994" opacity={0.5} /></g>;
            }))}
          </g>
        ))}
        <rect x={-600} y={1250} width={2300} height={1300} fill="#0d0b0a" />
        {/* luminária pendurada */}
        <g transform={`rotate(${Math.sin(lf * 0.04) * 3} 540 0)`}>
          <line x1={540} y1={-200} x2={540} y2={760} stroke="#111" strokeWidth={5} />
          <path d="M 470,760 L 610,760 L 580,720 L 500,720 Z" fill="#2a2a2a" />
          <path d="M 470,760 L 610,760 L 900,1500 L 180,1500 Z" fill="#ffe2b0" opacity={0.1} />
        </g>
        {/* mesa e pasta preta */}
        <rect x={160} y={1360} width={760} height={50} fill="#2a1d14" stroke="#000" strokeWidth={6} />
        <g transform="translate(540 1300)">
          <rect x={-230} y={-60} width={460} height={110} rx={8} fill="#0b0b0c" stroke="#2a2a2e" strokeWidth={6} />
          <g transform={`translate(0 -60) scale(1 ${1 - 1.6 * abre})`}>
            <rect x={-230} y={0} width={460} height={110} rx={8} fill="#111114" stroke="#333" strokeWidth={6} />
          </g>
          {abre > 0.02 && <ellipse cx={0} cy={-60} rx={240 * abre} ry={60 * abre} fill={VERMELHO} opacity={0.5 * abre} style={{ mixBlendMode: "screen" }} />}
          <Carimbo f={lf} em={rev - 2} texto="CLASSIFICADO" x={0} y={0} tam={48} rot={-8} />
        </g>
        {Array.from({ length: 30 }, (_, i) => {
          const x = 300 + rnd(`fp${i}`) * 480, y = ((rnd(`fq${i}`) * 900 - (f * 0.4)) % 900 + 900) % 900 + 600;
          return <circle key={i} cx={x} cy={y} r={2} fill="#ffe8c4" opacity={0.3} />;
        })}
      </Camera>
    </AbsoluteFill>
  );
};

export default function Video() {
  useFonteMaquina();
  const f = useCurrentFrame();
  const T = useTempos();
  const ini = (id: string) => T.fala(id).ini - 6;
  const cenas: { tipo: string; inicio: number; fim: number }[] = [{ tipo: "gancho", inicio: 0, fim: ini("mkultra") }];
  ORDEM.forEach((id, i) => cenas.push({ tipo: id, inicio: ini(id), fim: i < 9 ? ini(ORDEM[i + 1]) : ini("misterio") }));
  cenas.push({ tipo: "final", inicio: ini("misterio"), fim: T.total });
  const c = cenas.find((x) => f >= x.inicio && f < x.fim) ?? cenas[cenas.length - 1];
  const fimNarr = T.fala("coragem").fim;
  const emCartelas = f >= fimNarr + 2;
  const yLeg = c.tipo === "final" ? 0.76 : 0.745;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {c.tipo === "gancho" && <Gancho inicio={c.inicio} fim={c.fim} />}
      {CASOS[c.tipo] && <CenaCaso id={c.tipo} inicio={c.inicio} fim={c.fim} />}
      {c.tipo === "final" && <Final inicio={c.inicio} fimNarr={fimNarr} />}
      {CASOS[c.tipo] && <Flash em={c.inicio} dur={4} cor="#ffffff" forca={0.25} />}
      {!emCartelas && <Vinheta forca={0.6} />}
      {!emCartelas && <Granulacao forca={0.06} />}
      {!emCartelas && (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <g transform="translate(40 150)" opacity={0.92}>
            <rect width={520} height={56} rx={8} fill="#0b0a0d" stroke={VERMELHO} strokeWidth={3} />
            <text x={260} y={38} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={28} fill="#e9dcb8">FATOS DOCUMENTADOS • ILUSTRAÇÕES</text>
          </g>
        </svg>
      )}
      {!emCartelas && <Legendas estilo="terror" y={yLeg} />}
    </AbsoluteFill>
  );
}
