// Wolverine — O homem que não morre (1920 x 1080, 30 fps, 3:00). Montagem pela duração real da voz (tempos.json).
// Capa nos quadros 0–29 (a PNG do usuário é sobreposta na composição final, sem corte nem deformação).
import React from "react";
import { AbsoluteFill, useCurrentFrame, Img, staticFile } from "remotion";
import { clamp01, eio, lerp, ramp, rnd } from "../../engine/src/kit/anim";
import { carregarFontes } from "../../engine/src/kit/fontes";
import { useTempos } from "../../engine/src/kit/tempo";
import { SaltoFrente, SaltoLado, CelularNoChao, BecoLado, Drone, Chuva, T_CONGELA } from "./salto";
import { Figura, LOGAN_CIVIL, guarda } from "./elenco";
import * as C from "./cenas";

const W = 1920, H = 1080;
export const CAPA_FIM = 30, ACAO_INI = 30, REFLEXO_FIM = 56;
export const CONGELA_INI = ACAO_INI + T_CONGELA; // 240
export const CONGELA_Q = 7; // quadros congelados (6 a 8 pedidos)
export const REVERSO_INI = CONGELA_INI + CONGELA_Q; // 247
export const REVERSO_ATE = 90; // τ onde o reverso termina (rastros das garras na tela)
export const REVERSO_FIM = REVERSO_INI + (T_CONGELA - REVERSO_ATE); // 367

/** capa provisória desenhada (substituída pela PNG do usuário na composição final, quando existir) */
const CapaProvisoria: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#0b0f24" }}>
    <svg width={W} height={H}>
      <rect width={W} height={H} fill="#1a1230" />
      <circle cx={1350} cy={540} r={460} fill="#f2c418" opacity={0.18} />
      <Figura fig={LOGAN_CIVIL} pose={{ ...guarda(0), bracoD: [100, 20], bracoE: [100, 30] }} x={1350} y={1100} escala={1.6} expr="bravo" garras="metal" />
      <text x={110} y={420} fontFamily="Anton" fontSize={170} fill="#f2c418" stroke="#0d0b10" strokeWidth={10} paintOrder="stroke">WOLVERINE</text>
      <text x={120} y={540} fontFamily="Montserrat" fontWeight={900} fontSize={66} fill="#ffffff" stroke="#0d0b10" strokeWidth={8} paintOrder="stroke">O HOMEM QUE NÃO MORRE</text>
    </svg>
  </AbsoluteFill>
);

const Retícula: React.FC = () => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
    <defs><pattern id="ret" width={10} height={10} patternUnits="userSpaceOnUse"><circle cx={5} cy={5} r={1.6} fill="#000" /></pattern>
      <radialGradient id="vin" cx="0.5" cy="0.5" r="0.75"><stop offset="0.6" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.45} /></radialGradient></defs>
    <rect width={W} height={H} fill="url(#ret)" opacity={0.07} />
    <rect width={W} height={H} fill="url(#vin)" />
  </svg>
);

const Cartela: React.FC<{ f: number; ini: number; fim: number; texto: string; sub?: string; y?: number; destaque?: boolean }> = ({ f, ini, fim, texto, sub, y = 70, destaque }) => {
  if (f < ini || f >= fim) return null;
  const e = eio(clamp01((f - ini) / 10)) * (1 - eio(clamp01((f - (fim - 10)) / 10)));
  return (
    <div style={{ position: "absolute", left: 70, top: y, opacity: e, transform: `translateX(${(1 - e) * -30}px)` }}>
      <div style={{ display: "inline-block", fontFamily: "Montserrat", fontWeight: 900, fontSize: 40, letterSpacing: 4, color: "#fff", padding: "12px 24px 12px 26px", borderLeft: `8px solid ${destaque ? "#ff3b3b" : "#f2c418"}`, background: "rgba(8,8,14,0.72)" }}>{texto}</div>
      {sub && <div style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: 30, color: "#f2c418", marginTop: 10, marginLeft: 6, textShadow: "0 3px 10px #000" }}>{sub}</div>}
    </div>
  );
};

/** legendas curtas em português, faixa inferior (fora de rostos e garras) */
const Legendas: React.FC<{ f: number }> = ({ f }) => {
  const T = useTempos();
  const pal = T.raw.palavras;
  const grupos: (typeof pal)[] = [];
  let g: typeof pal = [];
  pal.forEach((p, i) => {
    const letras = g.reduce((a, b) => a + b.w.length + 1, 0) + p.w.length;
    if (g.length && (g.length >= 7 || letras > 40 || g[0].fala !== p.fala)) { grupos.push(g); g = []; }
    g.push(p);
    if (/[.!?…,;:]$/.test(p.w) || i === pal.length - 1) { grupos.push(g); g = []; }
  });
  if (g.length) grupos.push(g);
  const juntos: (typeof pal)[] = [];
  for (const x of grupos) { const ult = juntos[juntos.length - 1]; if (x.length === 1 && ult && ult[0].fala === x[0].fala && ult.length < 8) juntos[juntos.length - 1] = [...ult, ...x]; else juntos.push(x); }
  const t = f / 30;
  const k = juntos.findIndex((x, i) => t >= x[0].ini - 0.05 && t < (juntos[i + 1] && juntos[i + 1][0].ini - x[x.length - 1].fim < 0.7 ? juntos[i + 1][0].ini - 0.05 : x[x.length - 1].fim + 0.35));
  if (k < 0 || f < CAPA_FIM) return null;
  const ws = juntos[k];
  return (
    <div style={{ position: "absolute", left: 160, right: 160, bottom: 46, textAlign: "center" }}>
      <span style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: 46, lineHeight: 1.2, color: "#ffffff", WebkitTextStroke: "8px rgba(5,5,10,0.95)", paintOrder: "stroke fill", textShadow: "0 4px 14px rgba(0,0,0,0.6)" }}>
        {ws.map((w) => w.w).join(" ")}
      </span>
    </div>
  );
};

/** beco visto de lado, já vazio: grade no chão, metades do drone, chuva */
const BecoLadoVazio: React.FC<{ lf: number }> = ({ lf }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
    <g transform={`translate(${W / 2} ${H / 2}) scale(${lerp(1.0, 1.08, clamp01(lf / 200))}) translate(-1060 -560)`}>
      <BecoLado tau={lf} grade={1} />
      <Drone x={1250} y={800} s={0.7} f={0} partido={1} luz="#333" />
      <Chuva tau={lf} />
    </g>
  </svg>
);

export default function Video() {
  carregarFontes();
  const f = useCurrentFrame();
  const T = useTempos();
  const fa = (id: string) => T.fala(id);
  const pal = (w: string, n = 1) => T.palavra(w, n);

  // ---------------------------------------------------------------- linha do tempo
  const B2 = fa("w05").ini - 8, ALB = fa("w06").ini - 6, B3 = fa("w11").ini - 8, MAD = fa("w12").ini - 6;
  const B4 = fa("w15").ini - 8, MAG = fa("w17").ini - 6, B5 = fa("w20").ini - 8, XM = fa("w21").ini - 4, BAL = fa("w22").ini - 4;
  const NV = pal("wolverine", 3) - 6, B6 = fa("w24").ini - 10, B7 = fa("w29").ini - 8, BLQ = fa("w32").ini - 4;
  const T2 = pal("passam") - 2; // garras passam pela câmera: fim da repetição frontal = quadro do congelamento
  const REP = T2 - (T_CONGELA - 120); // repetição frontal começa em τ=120
  const QUEDA = fa("w36").ini - 4, CORTA = fa("w37").ini + 4, VAZIO = CORTA + 16, FIM = T.total;
  const CEL_FINAL = FIM - 48;

  let cena: React.ReactNode = null;
  if (f < CAPA_FIM) cena = <CapaProvisoria />;
  else if (f < REFLEXO_FIM) cena = <CelularNoChao tau={f - ACAO_INI} tela="reflexo" />;
  else if (f < CONGELA_INI) cena = <SaltoFrente tau={f - ACAO_INI} />;
  else if (f < REVERSO_INI) cena = <SaltoFrente tau={T_CONGELA} />;
  else if (f < REVERSO_FIM) cena = <SaltoFrente tau={T_CONGELA - (f - REVERSO_INI)} />;
  else if (f < B2) cena = <C.JanelaRiscos lf={f - REVERSO_FIM} morph={eio(ramp(f, REVERSO_FIM + 6, REVERSO_FIM + 30))} />;
  else if (f < ALB) cena = <C.Jornal1888 lf={f - B2} dur={ALB - B2} />;
  else if (f < B3) cena = <C.Alberta lf={f - ALB} dur={B3 - ALB} tragedia={fa("w07").ini - 4 - ALB} garras={fa("w08").ini - 4 - ALB} foge={fa("w09").ini - 4 - ALB} mao={pal("passou") - 6 - ALB} adulto={pal("logan", 2) - ALB} />;
  else if (f < MAD) cena = <C.Guerra1941 lf={f - B3} dur={MAD - B3} />;
  else if (f < B4) cena = <C.Madripoor lf={f - MAD} dur={B4 - MAD} escudo={pal("capitão") - MAD} resgate={fa("w13").ini - MAD} viuva={fa("w14").ini - MAD} />;
  else if (f < MAG) cena = <C.ArmaX lf={f - B4} dur={MAG - B4} metalEm={pal("adamantium") - B4} memoria={pal("bagunçou") - B4} />;
  else if (f < B5) cena = <C.Magneto lf={f - MAG} dur={B5 - MAG} quase={fa("w18").ini - MAG} osso={pal("conseguiu") - MAG} />;
  else if (f < XM) cena = <C.Hulk lf={f - B5} dur={XM - B5} />;
  else if (f < BAL) cena = <C.XMen lf={f - XM} dur={BAL - XM} />;
  else if (f < NV) cena = <C.Balsa lf={f - BAL} dur={NV - BAL} />;
  else if (f < B6) cena = <C.NovosVingadores lf={f - NV} dur={B6 - NV} equipe={fa("w23").ini - NV} />;
  else if (f < B7) cena = <C.Morte lf={f - B6} dur={B7 - B6} endurece={fa("w26").ini - B6} morreu={fa("w27").ini - B6} olho={pal("voltou") - 10 - B6} />;
  else if (f < BLQ) cena = <C.SaoPaulo lf={f - B7} dur={BLQ - B7} />;
  else if (f < REP) cena = <C.BecoBloqueio lf={f - BLQ} dur={REP - BLQ} />;
  else if (f < T2) cena = <SaltoFrente tau={T_CONGELA - (T2 - f)} />;
  else if (f < QUEDA) {
    // continuação pela lateral, com as ações nas palavras: "partem", "puxa", "ceder"
    const ks: [number, number][] = [[T2, 0], [pal("partem"), 12], [pal("puxa"), 36], [pal("ceder"), 58], [QUEDA, 70]];
    let l = 70;
    for (let i = 0; i < ks.length - 1; i++) if (f < ks[i + 1][0]) { l = lerp(ks[i][1], ks[i + 1][1], clamp01((f - ks[i][0]) / Math.max(1, ks[i + 1][0] - ks[i][0]))); break; }
    cena = <SaltoLado tau={T_CONGELA + l} />;
  } else if (f < VAZIO) cena = <C.CelularCai lf={f - QUEDA} dur={VAZIO - QUEDA} corta={CORTA - QUEDA} />;
  else if (f < CEL_FINAL) cena = <BecoLadoVazio lf={f - VAZIO} />;
  else cena = <CelularNoChao tau={f - CEL_FINAL} tela="apagada" />;

  // ---------------------------------------------------------------- cartelas (fatos e edições na imagem)
  const cart: [number, number, string, string?, boolean?][] = [
    [B2 + 4, ALB, "BRASIL · 1888", "Lei Áurea (Lei nº 3.353) · abolição legal"],
    [ALB + 4, ALB + 150, "ALBERTA, CANADÁ", "fim do século XIX"],
    [B3 + 4, MAD, "1941", "Segunda Guerra Mundial"],
    [MAD + 4, MAD + 120, "MADRIPOOR", "ilha fictícia da Marvel"],
    [fa("w13").ini, B4, "UNCANNY X-MEN #268", "1941 na história"],
    [B4 + 4, MAG, "ARMA X", "Marvel Comics Presents #72–84"],
    [MAG + 4, B5, "FATAL ATTRACTIONS", "X-Men #25"],
    [B5 + 4, XM, "THE INCREDIBLE HULK #181", "estreia"],
    [BAL + 4, B6, "NEW AVENGERS #1–6", "Breakout"],
    [B6 + 4, pal("voltou") - 10, "A MORTE DE WOLVERINE #4", "publicação: 2014"],
    [pal("voltou") - 10, B7, "O RETORNO DE WOLVERINE", "publicação: 2018"],
    [B7 + 4, B7 + 170, "SÃO PAULO · 2026", "Dramatização original", true],
  ];
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {cena}
      {f >= CAPA_FIM && <Retícula />}
      {cart.map(([a, b, t, s, d], i) => <Cartela key={i} f={f} ini={a} fim={b} texto={t} sub={s} destaque={d} />)}
      {/* aviso permanente e discreto durante toda a cena de 2026 */}
      {f >= B7 + 170 && f < FIM && (
        <div style={{ position: "absolute", right: 60, top: 54, fontFamily: "Montserrat", fontWeight: 800, fontSize: 26, letterSpacing: 2, color: "#fff", background: "rgba(8,8,14,0.6)", padding: "8px 16px", borderLeft: "6px solid #ff3b3b" }}>DRAMATIZAÇÃO ORIGINAL · SP 2026</div>
      )}
      <Legendas f={f} />
    </AbsoluteFill>
  );
}
