// Peças desenhadas do episódio (SVG, mesmo traço do kit: contorno escuro, sombra cel, cores vivas).
// Tudo é original e genérico: navios, drones e telas NÃO reproduzem equipamentos, marcas ou emissoras reais.
import React from "react";
import { clamp01, eback, eout, ramp, rnd, wobble } from "../../engine/src/kit/anim";

export const TINTA = "#10121f";
export const AMARELO = "#ffd60a";
export const VERMELHO = "#ff3b3b";
export const BRANCO = "#f8f7f2";

export const Txt: React.FC<{ x: number; y: number; t: string; s?: number; c?: string; anchor?: "start" | "middle" | "end"; peso?: number; fonte?: string; contorno?: number; op?: number }> = ({
  x, y, t, s = 40, c = BRANCO, anchor = "middle", peso = 900, fonte = "Montserrat", contorno, op = 1,
}) => (
  <text x={x} y={y} textAnchor={anchor} fontFamily={fonte} fontWeight={peso} fontSize={s} fill={c} stroke={TINTA}
    strokeWidth={contorno ?? s * 0.16} paintOrder="stroke" strokeLinejoin="round" opacity={op}>{t}</text>
);

// ------------------------------------------------------------------ celular
export type Notif = { app: string; titulo: string; texto: string; cor: string; em: number; icone?: string };

/** Card de notificação (estilo genérico de sistema). Coordenadas da tela: largura 300. */
export const CardNotif: React.FC<{ n: Notif; f: number; y: number; w?: number }> = ({ n, f, y, w = 300 }) => {
  const t = eback(ramp(f, n.em, n.em + 9));
  if (f < n.em) return null;
  return (
    <g transform={`translate(${w / 2} ${y - (1 - t) * 60}) scale(${0.85 + 0.15 * t})`} opacity={clamp01(t * 1.5)}>
      <rect x={-w / 2 + 12} y={0} width={w - 24} height={96} rx={18} fill="#f4f6fb" stroke={TINTA} strokeWidth={3} />
      <rect x={-w / 2 + 24} y={14} width={30} height={30} rx={8} fill={n.cor} />
      <text x={-w / 2 + 39} y={36} textAnchor="middle" fontFamily="Anton" fontSize={20} fill="#fff">{n.icone ?? "!"}</text>
      <text x={-w / 2 + 62} y={34} fontFamily="Montserrat" fontWeight={800} fontSize={14} fill="#5b6275">{n.app}</text>
      <text x={-w / 2 + 24} y={64} fontFamily="Montserrat" fontWeight={900} fontSize={17} fill="#121626">{n.titulo}</text>
      <text x={-w / 2 + 24} y={86} fontFamily="Montserrat" fontWeight={700} fontSize={14} fill="#39405a">{n.texto}</text>
    </g>
  );
};

/** Celular (tela 300 x 600 em coordenadas locais; origem no centro do aparelho). */
export const Celular: React.FC<{ f: number; escala?: number; vibra?: boolean; luz?: number; children?: React.ReactNode; rot?: number; fundo?: string }> = ({
  f, escala = 1, vibra = false, luz = 1, children, rot = 0, fundo = "#18213a",
}) => {
  const vx = vibra ? Math.sin(f * 2.7) * 4 : 0, vr = vibra ? Math.sin(f * 3.1) * 1.6 : 0;
  return (
    <g transform={`translate(${vx} 0) rotate(${rot + vr}) scale(${escala})`}>
      {luz > 0 && <ellipse cx={0} cy={0} rx={260} ry={360} fill="url(#brilhoTela)" opacity={0.55 * luz} />}
      <rect x={-172} y={-330} width={344} height={660} rx={48} fill="#1b1d29" stroke={TINTA} strokeWidth={8} />
      <rect x={-164} y={-322} width={328} height={644} rx={42} fill="#2b2f42" />
      <g transform="translate(-150 -300)">
        <clipPath id="clipTela"><rect width={300} height={600} rx={30} /></clipPath>
        <g clipPath="url(#clipTela)">
          <rect width={300} height={600} fill={fundo} />
          {children}
          <rect width={300} height={600} fill="#ffffff" opacity={0.05} />
        </g>
      </g>
      <rect x={-40} y={-312} width={80} height={16} rx={8} fill="#0b0c12" />
      {vibra && [1, 2].map((k) => (
        <g key={k} opacity={0.7 - k * 0.2}>
          <path d={`M ${-195 - k * 18},-60 q -14,60 0,120`} stroke="#ffffff" strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d={`M ${195 + k * 18},-60 q 14,60 0,120`} stroke="#ffffff" strokeWidth={6} fill="none" strokeLinecap="round" />
        </g>
      ))}
    </g>
  );
};

/** Tela de bloqueio com hora e notificações empilhadas. */
export const TelaBloqueio: React.FC<{ f: number; hora?: string; notifs: Notif[]; papel?: [string, string] }> = ({ f, hora = "07:12", notifs, papel = ["#2b4c8c", "#13203f"] }) => (
  <g>
    <defs>
      <linearGradient id={`pp${papel[0].slice(1)}`} x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stopColor={papel[0]} /><stop offset="1" stopColor={papel[1]} /></linearGradient>
    </defs>
    <rect width={300} height={600} fill={`url(#pp${papel[0].slice(1)})`} />
    <circle cx={240} cy={120} r={90} fill="#ffffff" opacity={0.06} />
    <text x={150} y={110} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={66} fill="#fff">{hora}</text>
    <text x={150} y={140} textAnchor="middle" fontFamily="Montserrat" fontWeight={700} fontSize={16} fill="#dfe6ff">quarta-feira</text>
    {notifs.map((n, i) => {
      const visiveis = notifs.filter((m) => f >= m.em).length;
      const ordem = notifs.slice(0, i + 1).filter((m) => f >= m.em).length;
      const y = 170 + (visiveis - ordem) * 104;
      return <CardNotif key={i} n={n} f={f} y={y} />;
    })}
  </g>
);

/** App carregando que falha: spinner → "SERVIÇO INDISPONÍVEL". */
export const TelaFalha: React.FC<{ f: number; falhaEm: number; app?: string }> = ({ f, falhaEm, app = "MENSAGENS" }) => {
  const falhou = f >= falhaEm;
  return (
    <g>
      <rect width={300} height={600} fill="#eef1f8" />
      <rect width={300} height={70} fill="#3d5af1" />
      <text x={150} y={46} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={20} fill="#fff">{app}</text>
      {!falhou && (
        <g transform={`translate(150 300) rotate(${f * 12})`}>
          {Array.from({ length: 10 }, (_, i) => <rect key={i} x={-5} y={-48} width={10} height={22} rx={5} fill="#3d5af1" opacity={0.15 + i * 0.085} transform={`rotate(${i * 36})`} />)}
        </g>
      )}
      {!falhou && <text x={150} y={400} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={18} fill="#4b5470">carregando…</text>}
      {falhou && (
        <g transform={`translate(150 290) scale(${eback(ramp(f, falhaEm, falhaEm + 8))})`}>
          <circle r={62} fill={VERMELHO} stroke={TINTA} strokeWidth={5} />
          <path d="M -24,-24 L 24,24 M 24,-24 L -24,24" stroke="#fff" strokeWidth={13} strokeLinecap="round" />
          <text y={115} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={21} fill="#141826">SERVIÇO</text>
          <text y={142} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={21} fill="#141826">INDISPONÍVEL</text>
        </g>
      )}
    </g>
  );
};

/** Vídeo "viral" circulando: miniatura borrada antiga + selos de alerta. */
export const TelaViral: React.FC<{ f: number; selo: string; cor: string; em: number }> = ({ f, selo, cor, em }) => (
  <g>
    <rect width={300} height={600} fill="#101420" />
    <rect x={14} y={110} width={272} height={200} rx={14} fill="#596579" />
    {Array.from({ length: 9 }, (_, i) => <rect key={i} x={14 + i * 30} y={110 + (i % 3) * 30} width={34} height={200} fill={["#6d7a8f", "#4f5a6d", "#7d6a5a"][i % 3]} opacity={0.6} />)}
    <rect x={14} y={110} width={272} height={200} rx={14} fill="#c9b07a" opacity={0.25} />
    <circle cx={150} cy={210} r={34} fill="#000" opacity={0.5} /><path d="M 138,190 L 166,210 L 138,230 Z" fill="#fff" />
    <text x={20} y={340} fontFamily="Montserrat" fontWeight={900} fontSize={17} fill="#fff">"VÍDEO DE HOJE"???</text>
    <text x={20} y={364} fontFamily="Montserrat" fontWeight={700} fontSize={13} fill="#9aa4b8">↪ encaminhada muitas vezes</text>
    {f >= em && (
      <g transform={`translate(150 450) rotate(-8) scale(${eback(ramp(f, em, em + 8))})`}>
        <rect x={-130} y={-34} width={260} height={68} rx={10} fill={cor} stroke={TINTA} strokeWidth={5} />
        <text y={12} textAnchor="middle" fontFamily="Anton" fontSize={30} fill="#fff">{selo}</text>
      </g>
    )}
  </g>
);

/** Gráfico de linha subindo (sem valores) — "pressão de alta". */
export const TelaGrafico: React.FC<{ f: number; em: number; titulo: string; cor?: string; subindo?: boolean }> = ({ f, em, titulo, cor = VERMELHO, subindo = true }) => {
  const t = eout(ramp(f, em, em + 40));
  const n = 24;
  const pts = Array.from({ length: Math.max(2, Math.floor(n * t)) }, (_, i) => {
    const x = 24 + (i / (n - 1)) * 252;
    const base = subindo ? 470 - i * 11 : 230 + i * 10;
    return `${x},${base + Math.sin(i * 1.7) * 18 + rnd(`g${i}`) * 14}`;
  });
  return (
    <g>
      <rect width={300} height={600} fill="#0f172a" />
      <text x={150} y={80} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={24} fill="#fff">{titulo}</text>
      {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={20} x2={280} y1={200 + i * 70} y2={200 + i * 70} stroke="#ffffff" opacity={0.08} strokeWidth={2} />)}
      <polyline points={pts.join(" ")} fill="none" stroke={cor} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" />
      {t > 0.95 && (
        <g transform={`translate(150 540) scale(${eback(ramp(f, em + 40, em + 48))})`}>
          <rect x={-120} y={-28} width={240} height={52} rx={10} fill={cor} />
          <text y={9} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={18} fill="#fff">{subindo ? "PRESSÃO DE ALTA ▲" : "EM QUEDA ▼"}</text>
        </g>
      )}
    </g>
  );
};

// ------------------------------------------------------------------ mar, céu, navios, drones
export const Ceu: React.FC<{ cores: [string, string, string]; nuvens?: number; f: number; brilho?: number }> = ({ cores, nuvens = 6, f, brilho = 0 }) => (
  <g>
    <defs>
      <linearGradient id={`ceu${cores[0].slice(1)}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={cores[0]} /><stop offset="0.6" stopColor={cores[1]} /><stop offset="1" stopColor={cores[2]} />
      </linearGradient>
    </defs>
    <rect x={-800} y={-600} width={2700} height={1800} fill={`url(#ceu${cores[0].slice(1)})`} />
    {Array.from({ length: nuvens }, (_, i) => {
      const x = ((rnd(`nx${i}`) * 2400 + f * (0.4 + rnd(`nv${i}`) * 0.6)) % 2600) - 800;
      const y = 120 + rnd(`ny${i}`) * 520;
      const s = 0.7 + rnd(`ns${i}`) * 0.9;
      return (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`} opacity={0.75}>
          <ellipse cx={0} cy={0} rx={150} ry={42} fill="#ffffff" opacity={0.12 + brilho * 0.5} />
          <ellipse cx={-60} cy={-20} rx={80} ry={40} fill="#ffffff" opacity={0.1 + brilho * 0.45} />
          <ellipse cx={50} cy={-28} rx={90} ry={48} fill="#ffffff" opacity={0.1 + brilho * 0.45} />
        </g>
      );
    })}
  </g>
);

/** Mar em camadas com ondas animadas (horizonte em yH). */
export const Mar: React.FC<{ f: number; yH?: number; cores?: [string, string]; brilho?: string }> = ({ f, yH = 1050, cores = ["#1d4e7a", "#0b2340"], brilho = "#7fc4ff" }) => (
  <g>
    <defs>
      <linearGradient id={`mar${cores[0].slice(1)}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={cores[0]} /><stop offset="1" stopColor={cores[1]} /></linearGradient>
    </defs>
    <rect x={-800} y={yH} width={2700} height={1400} fill={`url(#mar${cores[0].slice(1)})`} />
    {Array.from({ length: 7 }, (_, k) => {
      const y = yH + 30 + k * k * 22;
      const amp = 4 + k * 3, comp = 120 + k * 40, vel = 0.6 + k * 0.5;
      const pts = Array.from({ length: 40 }, (_, i) => {
        const x = -800 + i * 70;
        return `${x},${y + Math.sin((x + f * vel * 4) / comp * Math.PI * 2) * amp}`;
      });
      return <polyline key={k} points={pts.join(" ")} fill="none" stroke={brilho} strokeWidth={2 + k * 1.2} opacity={0.12 + k * 0.03} />;
    })}
  </g>
);

/** Navio militar genérico (vista lateral, sem marcas reais). Origem na linha d'água, comprimento ~900. */
export const NavioMilitar: React.FC<{ f: number; cor?: string; luzes?: boolean; seed?: number }> = ({ f, cor = "#7d8a99", luzes = false, seed = 1 }) => {
  const esc = (c: string, k: number) => {
    const n = parseInt(c.slice(1), 16);
    const ch = (v: number) => Math.round(Math.min(255, v * k)).toString(16).padStart(2, "0");
    return `#${ch((n >> 16) & 255)}${ch((n >> 8) & 255)}${ch(n & 255)}`;
  };
  const balanco = Math.sin(f * 0.06 + seed) * 1.2;
  const radar = (f * 6) % 360;
  return (
    <g transform={`rotate(${balanco})`}>
      {/* casco */}
      <path d="M -460,-60 L 430,-60 L 470,-110 L 455,-60 L 400,40 L -420,40 Z" fill={esc(cor, 0.8)} stroke={TINTA} strokeWidth={8} strokeLinejoin="round" />
      <path d="M -460,-60 L 430,-60 L 470,-110 L 455,-60 Z" fill={esc(cor, 1.05)} stroke={TINTA} strokeWidth={6} />
      <path d="M -440,-8 L 420,-8" stroke={esc(cor, 0.6)} strokeWidth={6} />
      {/* superestrutura */}
      <path d="M -200,-60 L -180,-200 L 60,-200 L 90,-60 Z" fill={cor} stroke={TINTA} strokeWidth={8} strokeLinejoin="round" />
      <path d="M -140,-200 L -120,-290 L 20,-290 L 40,-200 Z" fill={esc(cor, 1.08)} stroke={TINTA} strokeWidth={7} />
      {[-160, -110, -60, -10, 40].map((x) => <rect key={x} x={x} y={-180} width={30} height={22} rx={3} fill={luzes ? "#ffe08a" : "#22324a"} stroke={TINTA} strokeWidth={3} />)}
      {[-100, -50, 0].map((x) => <rect key={x} x={x} y={-272} width={28} height={18} rx={3} fill={luzes ? "#ffe08a" : "#22324a"} stroke={TINTA} strokeWidth={3} />)}
      {/* mastro + antena girando */}
      <path d="M -50,-290 L -50,-420" stroke={TINTA} strokeWidth={10} />
      <path d="M -90,-380 L -10,-380" stroke={TINTA} strokeWidth={7} />
      <g transform={`translate(-50 -425) scale(${Math.cos((radar * Math.PI) / 180)} 1)`}>
        <rect x={-55} y={-12} width={110} height={24} rx={6} fill={esc(cor, 1.2)} stroke={TINTA} strokeWidth={5} />
      </g>
      {luzes && <circle cx={-50} cy={-438} r={8} fill={VERMELHO} opacity={0.5 + 0.5 * Math.sin(f * 0.4)} />}
      {/* convés: estruturas genéricas */}
      <rect x={200} y={-100} width={110} height={40} rx={10} fill={esc(cor, 0.95)} stroke={TINTA} strokeWidth={6} />
      <rect x={-380} y={-95} width={120} height={35} rx={8} fill={esc(cor, 0.95)} stroke={TINTA} strokeWidth={6} />
      {/* espuma na proa e esteira */}
      {Array.from({ length: 6 }, (_, i) => (
        <ellipse key={i} cx={420 - i * 30 + Math.sin(f * 0.3 + i) * 6} cy={40} rx={46 - i * 5} ry={12} fill="#e8f6ff" opacity={0.75 - i * 0.1} />
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <ellipse key={`e${i}`} cx={-430 - i * 70 - ((f * 3) % 70)} cy={44 + i * 2} rx={60} ry={9} fill="#e8f6ff" opacity={0.45 - i * 0.05} />
      ))}
    </g>
  );
};

/** Drone genérico de asa fixa (estilizado) com hélice traseira girando. Origem no centro, envergadura ~260. */
export const DroneAsa: React.FC<{ f: number; cor?: string; luz?: boolean }> = ({ f, cor = "#5f6b7a", luz = true }) => (
  <g>
    <path d="M -10,-6 L -40,-120 L -10,-120 L 40,-6 Z" fill={cor} stroke={TINTA} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -10,6 L -40,120 L -10,120 L 40,6 Z" fill={cor} stroke={TINTA} strokeWidth={5} strokeLinejoin="round" opacity={0.85} />
    <path d="M -110,0 C -110,-18 -60,-22 60,-14 C 110,-10 130,-4 130,0 C 130,4 110,10 60,14 C -60,22 -110,18 -110,0 Z" fill="#8a96a6" stroke={TINTA} strokeWidth={6} />
    <path d="M -110,0 L -140,-34 L -125,-34 L -98,-6 Z M -110,0 L -140,34 L -125,34 L -98,6 Z" fill={cor} stroke={TINTA} strokeWidth={4} />
    <ellipse cx={-150} cy={0} rx={6} ry={30 * Math.abs(Math.cos(f * 1.3))} fill="#d9e2ec" opacity={0.7} />
    {luz && <circle cx={100} cy={0} r={6} fill={VERMELHO} opacity={0.4 + 0.6 * ((f % 20) < 10 ? 1 : 0)} />}
  </g>
);

/** Quadricóptero genérico (vista frontal-superior) com hélices em borrão. */
export const Quadricoptero: React.FC<{ f: number; cor?: string }> = ({ f, cor = "#2f3a4c" }) => (
  <g transform={`rotate(${Math.sin(f * 0.15) * 4})`}>
    {[-1, 1].map((s) => (
      <g key={s}>
        <path d={`M 0,0 L ${s * 120},-30`} stroke={TINTA} strokeWidth={14} strokeLinecap="round" />
        <path d={`M 0,0 L ${s * 120},-30`} stroke={cor} strokeWidth={8} strokeLinecap="round" />
        <ellipse cx={s * 120} cy={-42} rx={70} ry={10} fill="#cfd8e3" opacity={0.45 + 0.2 * Math.sin(f * 2 + s)} />
        <rect x={s * 120 - 8} y={-42} width={16} height={14} rx={3} fill={TINTA} />
      </g>
    ))}
    <rect x={-46} y={-26} width={92} height={46} rx={16} fill={cor} stroke={TINTA} strokeWidth={6} />
    <circle cx={0} cy={26} r={14} fill="#111" stroke="#9fb0c4" strokeWidth={4} />
    <circle cx={30} cy={-6} r={5} fill={VERMELHO} opacity={(f % 16) < 8 ? 1 : 0.3} />
  </g>
);

/** Avião de reconhecimento genérico (silhueta estilizada). */
export const AviaoGenerico: React.FC<{ cor?: string }> = ({ cor = "#9aa6b5" }) => (
  <g>
    <path d="M -160,0 C -150,-14 120,-16 170,-6 C 180,-2 180,2 170,6 C 120,16 -150,14 -160,0 Z" fill={cor} stroke={TINTA} strokeWidth={6} />
    <path d="M -20,-8 L -80,-110 L -50,-110 L 40,-10 Z M -20,8 L -80,110 L -50,110 L 40,10 Z" fill={cor} stroke={TINTA} strokeWidth={5} />
    <path d="M -140,-4 L -170,-50 L -150,-50 L -120,-6 Z" fill={cor} stroke={TINTA} strokeWidth={4} />
    <ellipse cx={-10} cy={-2} rx={50} ry={22} fill="#c7d2de" stroke={TINTA} strokeWidth={4} opacity={0.9} />
  </g>
);

/** Clarão distante no horizonte (ilustrativo, sem violência gráfica). */
export const Clarao: React.FC<{ f: number; em: number; x: number; y: number; cor?: string; tam?: number }> = ({ f, em, x, y, cor = "#ffb15c", tam = 1 }) => {
  const d = f - em;
  if (d < 0 || d > 40) return null;
  const k = d < 4 ? d / 4 : Math.exp(-(d - 4) / 9);
  return (
    <g transform={`translate(${x} ${y}) scale(${tam})`} style={{ mixBlendMode: "screen" }}>
      <circle r={260 * (0.6 + 0.4 * k)} fill={cor} opacity={0.22 * k} />
      <circle r={110 * (0.6 + 0.4 * k)} fill="#fff1c9" opacity={0.55 * k} />
      <ellipse rx={420 * k} ry={30 * k} fill="#ffe2b0" opacity={0.4 * k} />
    </g>
  );
};

/** Tela de radar com varredura e alvos genéricos piscando. */
export const Radar: React.FC<{ f: number; r?: number; alvos?: [number, number][] }> = ({ f, r = 230, alvos = [[0.4, -0.3], [-0.5, 0.2], [0.2, 0.55]] }) => {
  const a = (f * 4) % 360;
  return (
    <g>
      <circle r={r + 18} fill="#0a1a12" stroke={TINTA} strokeWidth={10} />
      <circle r={r} fill="#0d2a1b" />
      {[0.33, 0.66, 1].map((k) => <circle key={k} r={r * k} fill="none" stroke="#39e07a" strokeWidth={2} opacity={0.35} />)}
      <path d={`M ${-r},0 L ${r},0 M 0,${-r} L 0,${r}`} stroke="#39e07a" strokeWidth={2} opacity={0.3} />
      <g transform={`rotate(${a})`}>
        <path d={`M 0,0 L ${r},0 A ${r},${r} 0 0,0 ${r * Math.cos(-0.6)},${r * Math.sin(-0.6)} Z`} fill="#39e07a" opacity={0.25} />
        <line x1={0} y1={0} x2={r} y2={0} stroke="#7dffae" strokeWidth={4} />
      </g>
      {alvos.map(([x, y], i) => {
        const ang = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
        const desde = (a - ang + 360) % 360;
        return <circle key={i} cx={x * r} cy={y * r} r={9} fill="#9dffbf" opacity={Math.max(0.1, 1 - desde / 300)} />;
      })}
    </g>
  );
};

// ------------------------------------------------------------------ economia, logística
const CORES_CONT = ["#e4572e", "#2e86ab", "#f3a712", "#4c956c", "#a23b72", "#3b8ea5"];

export const Conteiner: React.FC<{ x: number; y: number; w?: number; h?: number; cor: string }> = ({ x, y, w = 150, h = 62, cor }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect width={w} height={h} fill={cor} stroke={TINTA} strokeWidth={5} />
    {Array.from({ length: Math.floor(w / 18) }, (_, i) => <line key={i} x1={10 + i * 18} x2={10 + i * 18} y1={6} y2={h - 6} stroke={TINTA} strokeWidth={2} opacity={0.35} />)}
  </g>
);

/** Navio cargueiro com contêineres empilhados (comprimento ~1000). */
export const Cargueiro: React.FC<{ f: number; casco?: string }> = ({ f, casco = "#2b3a55" }) => (
  <g transform={`rotate(${Math.sin(f * 0.05) * 0.8})`}>
    <path d="M -500,-40 L 470,-40 L 520,-90 L 500,40 L -470,40 Z" fill={casco} stroke={TINTA} strokeWidth={8} strokeLinejoin="round" />
    <path d="M -480,10 L 490,10 L 480,40 L -470,40 Z" fill="#b8323a" opacity={0.9} />
    <rect x={-470} y={-210} width={110} height={170} fill="#e9ecf2" stroke={TINTA} strokeWidth={6} />
    {[0, 1, 2].map((i) => <rect key={i} x={-455 + i * 32} y={-190} width={22} height={18} fill="#2c3e5c" />)}
    <rect x={-440} y={-260} width={30} height={50} fill="#3b4256" stroke={TINTA} strokeWidth={5} />
    {Array.from({ length: 4 }, (_, row) => Array.from({ length: 5 }, (_, col) => (
      <Conteiner key={`${row}-${col}`} x={-330 + col * 152} y={-40 - (row + 1) * 62} cor={CORES_CONT[(row * 5 + col) % CORES_CONT.length]} />
    )))}
    {Array.from({ length: 5 }, (_, i) => <ellipse key={i} cx={-520 - i * 80 - ((f * 2.5) % 80)} cy={42} rx={70} ry={10} fill="#e8f6ff" opacity={0.45 - i * 0.08} />)}
  </g>
);

/** Guindaste de pórtico portuário que move um contêiner (t 0..1 do ciclo). */
export const Guindaste: React.FC<{ f: number; fase?: number; cor?: string }> = ({ f, fase = 0, cor = "#f2b134" }) => {
  const ciclo = ((f + fase) % 150) / 150;
  const carroX = ciclo < 0.5 ? -40 + ciclo * 2 * 380 : 340 - (ciclo - 0.5) * 2 * 380;
  const desce = Math.abs(Math.sin(ciclo * Math.PI * 2)) * 160;
  return (
    <g>
      {[-120, 60].map((x) => <path key={x} d={`M ${x},0 L ${x + 20},-560 L ${x + 50},-560 L ${x + 70},0`} fill="none" stroke={cor} strokeWidth={22} />)}
      <rect x={-200} y={-600} width={640} height={44} fill={cor} stroke={TINTA} strokeWidth={6} />
      <rect x={-60} y={-680} width={100} height={80} fill="#e9ecf2" stroke={TINTA} strokeWidth={6} />
      <rect x={carroX - 30} y={-562} width={60} height={30} fill="#3b4256" />
      <line x1={carroX} x2={carroX} y1={-532} y2={-400 + desce} stroke={TINTA} strokeWidth={5} />
      <Conteiner x={carroX - 75} y={-400 + desce} cor="#2e86ab" />
    </g>
  );
};

/** Caminhão genérico de carga. */
export const Caminhao: React.FC<{ f: number; cor?: string; carga?: string }> = ({ f, cor = "#d64545", carga = "#4c956c" }) => (
  <g>
    <rect x={-260} y={-140} width={330} height={120} fill={carga} stroke={TINTA} strokeWidth={6} />
    <path d="M 80,-20 L 80,-120 L 170,-120 L 210,-70 L 210,-20 Z" fill={cor} stroke={TINTA} strokeWidth={6} strokeLinejoin="round" />
    <path d="M 100,-108 L 160,-108 L 190,-74 L 100,-74 Z" fill="#bfe3ff" stroke={TINTA} strokeWidth={4} />
    {[-200, -110, 150].map((x) => (
      <g key={x} transform={`translate(${x} -10) rotate(${f * 8})`}>
        <circle r={30} fill="#1d1f28" stroke={TINTA} strokeWidth={5} /><circle r={11} fill="#9aa3b2" />
        <rect x={-3} y={-28} width={6} height={18} fill="#9aa3b2" />
      </g>
    ))}
  </g>
);

/** Fábrica de eletrônicos: esteira com placas, braço robótico, painel "ATRASADO". */
export const Fabrica: React.FC<{ f: number; paraEm: number }> = ({ f, paraEm }) => {
  const parado = f >= paraEm;
  const fe = parado ? paraEm + Math.min(20, f - paraEm) * 0.15 : f;
  const braco = parado ? -20 : Math.sin(f * 0.12) * 35;
  return (
    <g>
      <rect x={-600} y={-700} width={2300} height={1500} fill="#c9d3e0" />
      {Array.from({ length: 8 }, (_, i) => <rect key={i} x={-600 + i * 300} y={-700} width={14} height={1500} fill="#aeb9c9" />)}
      <rect x={-600} y={420} width={2300} height={500} fill="#8b97a8" />
      {/* esteira */}
      <rect x={-100} y={250} width={1300} height={60} rx={30} fill="#3a4052" stroke={TINTA} strokeWidth={6} />
      {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={-70 + i * 95} cy={280} r={20} fill="#5a6175" stroke={TINTA} strokeWidth={3} transform={`rotate(${fe * 9} ${-70 + i * 95} 280)`} />)}
      {Array.from({ length: 7 }, (_, i) => {
        const x = ((i * 190 + fe * 4) % 1330) - 100;
        return (
          <g key={i} transform={`translate(${x} 205)`}>
            <rect width={120} height={42} rx={4} fill="#2f8f5b" stroke={TINTA} strokeWidth={4} />
            <rect x={40} y={8} width={40} height={26} fill="#1b1d26" />
          </g>
        );
      })}
      {/* braço robótico */}
      <g transform="translate(560 250)">
        <rect x={-60} y={-40} width={120} height={40} fill="#f2b134" stroke={TINTA} strokeWidth={6} />
        <g transform={`rotate(${-60 + braco})`}>
          <rect x={-16} y={-260} width={32} height={260} rx={14} fill="#f2b134" stroke={TINTA} strokeWidth={6} />
          <g transform={`translate(0 -260) rotate(${110 - braco * 1.4})`}>
            <rect x={-14} y={-200} width={28} height={200} rx={12} fill="#f2b134" stroke={TINTA} strokeWidth={6} />
            <path d="M -24,-200 L -24,-236 M 24,-200 L 24,-236" stroke={TINTA} strokeWidth={10} strokeLinecap="round" />
          </g>
        </g>
      </g>
      {/* painel de status */}
      <g transform="translate(560 -330)">
        <rect x={-300} y={-120} width={600} height={240} rx={20} fill="#10172a" stroke={TINTA} strokeWidth={8} />
        <text y={-40} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={44} fill="#9fb3d8">LINHA 3</text>
        <text y={50} textAnchor="middle" fontFamily="Anton" fontSize={84} fill={parado ? VERMELHO : "#39e07a"} opacity={parado ? 0.6 + 0.4 * Math.sin(f * 0.4) : 1}>{parado ? "ATRASADO" : "PRODUZINDO"}</text>
      </g>
    </g>
  );
};

/** Placa de circuito com chips — alguns encaixes vazios piscando ("faltando peças"). */
export const PlacaChips: React.FC<{ f: number; vaziosEm: number }> = ({ f, vaziosEm }) => (
  <g>
    <rect x={-480} y={-380} width={960} height={760} rx={30} fill="#1f7a4c" stroke={TINTA} strokeWidth={10} />
    {Array.from({ length: 26 }, (_, i) => {
      const y = -340 + i * 27;
      return <path key={i} d={`M -450,${y} L ${-200 + (i % 5) * 40},${y} L ${-160 + (i % 5) * 40},${y + 30} L 450,${y + 30}`} stroke="#d8b25a" strokeWidth={4} fill="none" opacity={0.55} />;
    })}
    {[[-260, -160], [60, -160], [-260, 140], [60, 140], [330, -10]].map(([x, y], i) => {
      const vazio = i % 2 === 1 && f >= vaziosEm;
      const brilho = 0.5 + 0.5 * Math.sin(f * 0.35 + i);
      return (
        <g key={i} transform={`translate(${x} ${y})`}>
          {vazio ? (
            <g>
              <rect x={-90} y={-90} width={180} height={180} rx={10} fill="none" stroke={AMARELO} strokeWidth={8} strokeDasharray="22 14" opacity={brilho} />
              <text y={22} textAnchor="middle" fontFamily="Anton" fontSize={80} fill={AMARELO} opacity={brilho}>?</text>
            </g>
          ) : (
            <g>
              <rect x={-90} y={-90} width={180} height={180} rx={14} fill="#15171f" stroke={TINTA} strokeWidth={6} />
              {Array.from({ length: 6 }, (_, k) => <rect key={k} x={-80 + k * 30} y={-108} width={12} height={20} fill="#c9ced8" />)}
              {Array.from({ length: 6 }, (_, k) => <rect key={k} x={-80 + k * 30} y={88} width={12} height={20} fill="#c9ced8" />)}
              <circle cx={-60} cy={-60} r={8} fill="#3a3f4f" />
            </g>
          )}
        </g>
      );
    })}
  </g>
);

// ------------------------------------------------------------------ cenários
/** Quarto de manhã (Leo): parede, janela com amanhecer, criado-mudo, cama. Mundo 1080 x 1920. */
export const QuartoManha: React.FC<{ f: number; luz?: number }> = ({ f, luz = 1 }) => (
  <g>
    <defs>
      <linearGradient id="qmParede" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3b3f6e" /><stop offset="1" stopColor="#262848" /></linearGradient>
      <linearGradient id="qmJanela" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5b6fc2" /><stop offset="0.7" stopColor="#f2a07b" /><stop offset="1" stopColor="#ffd59e" /></linearGradient>
      <linearGradient id="qmFeixe" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd9a8" stopOpacity="0.32" /><stop offset="1" stopColor="#ffd9a8" stopOpacity="0" /></linearGradient>
    </defs>
    <rect x={-600} y={-500} width={2300} height={2100} fill="url(#qmParede)" />
    {Array.from({ length: 30 }, (_, i) => <rect key={i} x={-600 + i * 80} y={-500} width={6} height={2100} fill="#4a4f86" opacity={0.25} />)}
    {/* pôster genérico */}
    <g transform="translate(120 330) rotate(-3)">
      <rect x={-110} y={-150} width={220} height={300} fill="#f1e3c3" stroke={TINTA} strokeWidth={8} />
      <circle cx={0} cy={-30} r={60} fill="#e4572e" /><path d="M -80,90 L 0,10 L 80,90 Z" fill="#2e86ab" />
    </g>
    {/* janela */}
    <g transform="translate(760 420)">
      <rect x={-200} y={-240} width={400} height={480} rx={14} fill="url(#qmJanela)" stroke={TINTA} strokeWidth={12} />
      <circle cx={-40} cy={150} r={60} fill="#fff1c9" opacity={0.9} />
      {Array.from({ length: 5 }, (_, i) => <rect key={i} x={-190 + i * 80} y={140 - (i % 3) * 40} width={70} height={110 + (i % 3) * 40} fill="#2f2a4a" />)}
      <rect x={-6} y={-240} width={12} height={480} fill={TINTA} />
      <rect x={-200} y={-6} width={400} height={12} fill={TINTA} />
      <path d={`M -240,-270 C -210,-60 ${-260 + wobble(f, 1, 0.3) * 6},120 -220,270 L -150,270 C -180,100 -160,-80 -160,-270 Z`} fill="#3a7d6b" stroke={TINTA} strokeWidth={8} />
      <path d={`M 240,-270 C 210,-60 ${260 + wobble(f, 2, 0.3) * 6},120 220,270 L 150,270 C 180,100 160,-80 160,-270 Z`} fill="#3a7d6b" stroke={TINTA} strokeWidth={8} />
    </g>
    <path d="M 560,660 L 960,660 L 1250,1700 L 380,1700 Z" fill="url(#qmFeixe)" opacity={luz} />
    {/* chão */}
    <rect x={-600} y={1420} width={2300} height={700} fill="#4a3346" />
    {Array.from({ length: 16 }, (_, i) => <line key={i} x1={-600 + i * 150} y1={1430} x2={-800 + i * 190} y2={2100} stroke="#3a2638" strokeWidth={4} />)}
    <rect x={-600} y={1405} width={2300} height={28} fill="#1d1a33" />
  </g>
);

/** Cama (frente do quarto) — desenhar DEPOIS do personagem deitado para o cobertor cobri-lo. */
export const Cobertor: React.FC<{ f: number; respira?: number }> = ({ f, respira = 1 }) => {
  const r = Math.sin(f * 0.08) * 6 * respira;
  return (
    <g>
      <path d={`M -40,1260 C 200,${1170 - r} 600,${1175 - r} 940,1240 L 960,1500 L -60,1500 Z`} fill="#3f6fb5" stroke={TINTA} strokeWidth={10} strokeLinejoin="round" />
      <path d={`M -40,1260 C 200,${1170 - r} 600,${1175 - r} 940,1240`} stroke="#6f9be0" strokeWidth={22} fill="none" opacity={0.6} />
      {[150, 400, 650].map((x) => <path key={x} d={`M ${x},${1220 - r} q 40,90 10,240`} stroke="#2f5590" strokeWidth={8} fill="none" />)}
      <rect x={-80} y={1480} width={1060} height={70} rx={14} fill="#6b4a3a" stroke={TINTA} strokeWidth={8} />
    </g>
  );
};

/** Criado-mudo com abajur. O celular é desenhado por cima pelo chamador. */
export const CriadoMudo: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-150} y={0} width={300} height={260} rx={10} fill="#8a5a3c" stroke={TINTA} strokeWidth={8} />
    <rect x={-120} y={40} width={240} height={80} rx={6} fill="#7a4e33" stroke={TINTA} strokeWidth={5} />
    <circle cx={0} cy={80} r={10} fill="#d9b36a" />
    <g transform="translate(-90 0)">
      <rect x={-8} y={-140} width={16} height={140} fill="#3a2a22" />
      <path d="M -60,-140 L 60,-140 L 40,-230 L -40,-230 Z" fill="#ffd48a" stroke={TINTA} strokeWidth={6} />
    </g>
  </g>
);

/** Silhuetas de cidade (para os cidadãos ao redor do mundo). estilo muda a paleta e o recorte. */
export const CidadeFundo: React.FC<{ f: number; estilo: "brasil" | "asia" | "europa" | "eua"; noite?: boolean }> = ({ f, estilo, noite = true }) => {
  const pal = {
    brasil: ["#ff9a62", "#ffcf8a", "#2d3b6b", "#3c4f86"],
    asia: ["#2b1c5a", "#ff5ea8", "#1d2050", "#2b2f72"],
    europa: ["#1e3a5f", "#8fb7e8", "#28344f", "#36476a"],
    eua: ["#14213d", "#4f6db8", "#1f2a44", "#2d3c5e"],
  }[estilo];
  return (
    <g>
      <defs>
        <linearGradient id={`cf${estilo}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={pal[0]} /><stop offset="1" stopColor={pal[1]} /></linearGradient>
      </defs>
      <rect x={-600} y={-500} width={2300} height={2100} fill={`url(#cf${estilo})`} />
      {estilo === "europa" && <path d="M 700,700 L 760,400 L 820,700 Z" fill={pal[2]} />}
      {Array.from({ length: 16 }, (_, i) => {
        const h = 380 + ((i * 37) % 5) * 90 + (estilo === "asia" ? 160 : 0), x = -250 + i * 105;
        return (
          <g key={i}>
            <rect x={x} y={1150 - h} width={96} height={h + 400} fill={i % 2 ? pal[2] : pal[3]} stroke={TINTA} strokeWidth={5} />
            {estilo === "europa" && <path d={`M ${x},${1150 - h} L ${x + 48},${1080 - h} L ${x + 96},${1150 - h} Z`} fill="#8a4a3c" stroke={TINTA} strokeWidth={4} />}
            {Array.from({ length: 10 }, (_, k) => (
              <rect key={k} x={x + 14 + (k % 2) * 40} y={1180 - h + Math.floor(k / 2) * 70} width={24} height={36}
                fill={estilo === "asia" && k % 3 === 0 ? "#5ef0ff" : "#ffe09a"} opacity={noite ? 0.25 + 0.6 * Math.abs(Math.sin(f / 37 + i * 1.7 + k)) : 0.15} />
            ))}
          </g>
        );
      })}
      {estilo === "brasil" && [80, 980].map((x) => (
        <g key={x} transform={`translate(${x} 1250)`}>
          <path d="M 0,0 C -6,-150 8,-300 20,-420" stroke="#5a3a24" strokeWidth={20} fill="none" strokeLinecap="round" />
          {[-150, -90, -30, 30, 90, 150].map((a, k) => <path key={k} transform={`translate(20 -420) rotate(${a + wobble(f, k, 0.5) * 5})`} d="M 0,0 C 60,-30 130,-10 180,40 C 120,10 60,10 0,0 Z" fill="#2f7a46" stroke={TINTA} strokeWidth={5} />)}
        </g>
      ))}
      <rect x={-600} y={1150} width={2300} height={900} fill={noite ? "#1c2134" : "#585e70"} />
    </g>
  );
};

/** Posto de combustível genérico (sem marca), placa de preço com "?" e setas subindo. */
export const Posto: React.FC<{ f: number; sobeEm: number }> = ({ f, sobeEm }) => (
  <g>
    <rect x={-120} y={300} width={980} height={60} fill="#f2f2f2" stroke={TINTA} strokeWidth={8} />
    <rect x={-120} y={360} width={980} height={26} fill="#2e86ab" />
    {[0, 740].map((x) => <rect key={x} x={x} y={386} width={40} height={520} fill="#d9dde5" stroke={TINTA} strokeWidth={6} />)}
    {[200, 520].map((x) => (
      <g key={x} transform={`translate(${x} 680)`}>
        <rect x={-60} y={-220} width={120} height={220} rx={12} fill="#e4572e" stroke={TINTA} strokeWidth={6} />
        <rect x={-42} y={-196} width={84} height={56} fill="#10172a" />
        <path d="M 60,-150 q 50,0 50,60 l 0,80" stroke={TINTA} strokeWidth={10} fill="none" />
      </g>
    ))}
    <g transform="translate(960 260)">
      <rect x={-20} y={0} width={40} height={650} fill="#9aa3b2" stroke={TINTA} strokeWidth={6} />
      <rect x={-150} y={-260} width={300} height={280} rx={16} fill="#10172a" stroke={TINTA} strokeWidth={8} />
      <text y={-190} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={34} fill="#9fb3d8">COMBUSTÍVEL</text>
      <text y={-80} textAnchor="middle" fontFamily="Anton" fontSize={100} fill={f >= sobeEm ? VERMELHO : AMARELO}>R$ ?</text>
      {f >= sobeEm && [0, 1, 2].map((k) => {
        const u = ((f - sobeEm + k * 10) % 30) / 30;
        return <path key={k} transform={`translate(${-90 + k * 90} ${-10 - u * 60})`} d="M 0,-20 L 18,6 L -18,6 Z" fill={VERMELHO} opacity={1 - u} />;
      })}
    </g>
  </g>
);

/** Prateleiras de mercado com etiquetas "▲". */
export const Mercado: React.FC<{ f: number; sobeEm: number }> = ({ f, sobeEm }) => (
  <g>
    <rect x={-600} y={-300} width={2300} height={2100} fill="#f4efe4" />
    {[0, 1, 2, 3].map((r) => (
      <g key={r} transform={`translate(0 ${200 + r * 300})`}>
        <rect x={-100} y={150} width={1280} height={30} fill="#b9bfcc" stroke={TINTA} strokeWidth={5} />
        {Array.from({ length: 10 }, (_, i) => {
          const cor = ["#e4572e", "#f3a712", "#2e86ab", "#4c956c", "#a23b72"][(i + r) % 5];
          const alt = 90 + ((i * 7 + r * 3) % 4) * 18;
          return (
            <g key={i}>
              <rect x={-60 + i * 125} y={150 - alt} width={100} height={alt} rx={10} fill={cor} stroke={TINTA} strokeWidth={5} />
              <rect x={-45 + i * 125} y={150 - alt + 22} width={70} height={30} rx={4} fill="#fff" opacity={0.85} />
            </g>
          );
        })}
        {Array.from({ length: 5 }, (_, i) => {
          const ativo = f >= sobeEm + i * 3 + r * 2;
          return (
            <g key={`p${i}`} transform={`translate(${-20 + i * 250} 205) scale(${ativo ? eback(ramp(f, sobeEm + i * 3 + r * 2, sobeEm + i * 3 + r * 2 + 8)) : 1})`}>
              <rect x={-55} y={-22} width={110} height={44} rx={6} fill={ativo ? "#ffe3e3" : "#ffffff"} stroke={TINTA} strokeWidth={4} />
              <text y={12} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={26} fill={ativo ? VERMELHO : "#333"}>{ativo ? "▲ R$" : "R$"}</text>
            </g>
          );
        })}
      </g>
    ))}
  </g>
);

/** Plantação em fileiras (soja estilizada) com colheitadeira genérica atravessando. */
export const Plantacao: React.FC<{ f: number; para?: boolean }> = ({ f, para = false }) => {
  const x = para ? 300 : ((f * 3) % 1500) - 400;
  return (
    <g>
      <rect x={-600} y={-500} width={2300} height={1300} fill="#8ecbff" />
      <path d="M -600,780 C -100,700 500,760 1700,720 L 1700,2000 L -600,2000 Z" fill="#7fb04a" />
      {Array.from({ length: 22 }, (_, i) => <path key={i} d={`M ${540 + (i - 11) * 20},780 L ${540 + (i - 11) * 160},2000`} stroke="#4f7a2c" strokeWidth={14} opacity={0.6} />)}
      <g transform={`translate(${x} 1020)`}>
        <rect x={-150} y={-160} width={260} height={150} rx={14} fill="#3d8b3d" stroke={TINTA} strokeWidth={6} />
        <rect x={40} y={-260} width={110} height={110} rx={10} fill="#bfe3ff" stroke={TINTA} strokeWidth={6} />
        <rect x={-250} y={-60} width={110} height={70} fill="#f2b134" stroke={TINTA} strokeWidth={6} />
        {[-80, 80].map((wx) => <g key={wx} transform={`translate(${wx} 0) rotate(${para ? 0 : f * 6})`}><circle r={52} fill="#1d1f28" stroke={TINTA} strokeWidth={5} /><circle r={18} fill="#f2b134" /></g>)}
      </g>
    </g>
  );
};

/** Trem de minério com vagões carregados. */
export const TremMinerio: React.FC<{ f: number; vel?: number }> = ({ f, vel = 4 }) => {
  const off = -((f * vel) % 300);
  return (
    <g>
      <rect x={-600} y={90} width={2300} height={20} fill="#5a4a3a" />
      {Array.from({ length: 9 }, (_, i) => (
        <g key={i} transform={`translate(${off + i * 300 - 300} 0)`}>
          <path d="M 0,0 L 260,0 L 235,80 L 25,80 Z" fill="#7a4e33" stroke={TINTA} strokeWidth={6} />
          <path d="M 10,0 Q 130,-70 250,0 Z" fill="#8b3a2b" stroke={TINTA} strokeWidth={5} />
          {[60, 200].map((w) => <circle key={w} cx={w} cy={88} r={20} fill="#1d1f28" stroke={TINTA} strokeWidth={4} />)}
        </g>
      ))}
    </g>
  );
};

/** Bandeira do Brasil estilizada (sem lema/texto), tremulando. */
export const BandeiraBR: React.FC<{ f: number; w?: number }> = ({ f, w = 420 }) => {
  const h = w * 0.7;
  const onda = (y: number) => Math.sin(f * 0.12 + y * 0.02) * 10;
  return (
    <g>
      <path d={`M 0,${onda(0)} L ${w},${onda(w)} L ${w},${h + onda(w)} L 0,${h + onda(0)} Z`} fill="#1f9d55" stroke={TINTA} strokeWidth={6} />
      <path d={`M ${w * 0.08},${h / 2} L ${w / 2},${h * 0.1 + onda(w / 2)} L ${w * 0.92},${h / 2 + onda(w)} L ${w / 2},${h * 0.9 + onda(w / 2)} Z`} fill="#ffd60a" />
      <circle cx={w / 2} cy={h / 2 + onda(w / 2) * 0.5} r={h * 0.25} fill="#1f4ea3" />
      <path d={`M ${w / 2 - h * 0.25},${h / 2 - 6} Q ${w / 2},${h / 2 - 26} ${w / 2 + h * 0.25},${h / 2 + 10}`} stroke="#fff" strokeWidth={8} fill="none" />
    </g>
  );
};

/** Rack de servidores com LEDs piscando (alguns falhando em vermelho). */
export const Servidores: React.FC<{ f: number; falhaEm: number }> = ({ f, falhaEm }) => (
  <g>
    {[0, 1, 2].map((r) => (
      <g key={r} transform={`translate(${r * 330} 0)`}>
        <rect x={0} y={0} width={300} height={900} rx={12} fill="#1a2030" stroke={TINTA} strokeWidth={8} />
        {Array.from({ length: 12 }, (_, i) => {
          const falha = f >= falhaEm + i * 2 + r * 5 && (i + r) % 3 === 0;
          return (
            <g key={i} transform={`translate(20 ${24 + i * 72})`}>
              <rect width={260} height={56} rx={6} fill="#262e44" />
              {Array.from({ length: 5 }, (_, k) => {
                const on = falha ? (f % 10 < 5) : rnd(`led${r}${i}${k}${Math.floor(f / 4)}`) > 0.35;
                return <circle key={k} cx={30 + k * 26} cy={28} r={7} fill={falha ? VERMELHO : "#39e07a"} opacity={on ? 1 : 0.2} />;
              })}
              <rect x={170} y={18} width={72} height={20} rx={4} fill="#11151f" />
            </g>
          );
        })}
      </g>
    ))}
  </g>
);

/** Mesa de reunião (vista frontal) — desenhar na frente dos personagens. */
export const MesaReuniao: React.FC<{ y?: number; papel?: boolean }> = ({ y = 1500, papel = true }) => (
  <g>
    <path d={`M -100,${y} L 1180,${y} L 1260,${y + 90} L -180,${y + 90} Z`} fill="#6b4a3a" stroke={TINTA} strokeWidth={10} strokeLinejoin="round" />
    <rect x={-180} y={y + 90} width={1440} height={40} fill="#4e3428" stroke={TINTA} strokeWidth={8} />
    {papel && [150, 520, 860].map((x) => <rect key={x} x={x} y={y + 18} width={110} height={50} rx={4} fill="#f4f1e8" stroke={TINTA} strokeWidth={4} transform={`skewX(-20)`} />)}
    {[320, 700].map((x) => <g key={x}><rect x={x} y={y - 40} width={14} height={50} fill={TINTA} /><ellipse cx={x + 7} cy={y - 50} rx={18} ry={24} fill="#3a3f4f" stroke={TINTA} strokeWidth={4} /></g>)}
  </g>
);

/** Tarja fixa de aviso (fora das zonas de interface das redes). */
export const TarjaSimulacao: React.FC<{ f: number }> = ({ f }) => (
  <g transform="translate(40 150)" opacity={0.92}>
    <rect width={430} height={62} rx={16} fill="#111a2e" stroke={AMARELO} strokeWidth={4} />
    <circle cx={34} cy={31} r={10} fill={VERMELHO} opacity={0.5 + 0.5 * Math.sin(f * 0.2)} />
    <text x={58} y={42} fontFamily="Montserrat" fontWeight={900} fontSize={28} fill="#fff3b3">SIMULAÇÃO FICTÍCIA</text>
  </g>
);

/** Selo/rótulo de cena (texto em destaque) que entra com pop e balança levemente. */
export const Selo: React.FC<{ f: number; em: number; ate?: number; texto: string; y?: number; cor?: string; fundo?: string; tam?: number }> = ({
  f, em, ate = 1e9, texto, y = 330, cor = TINTA, fundo = AMARELO, tam = 74,
}) => {
  if (f < em || f > ate) return null;
  const s = eback(ramp(f, em, em + 9)) * (1 - ramp(f, ate - 6, ate));
  const w = texto.length * tam * 0.58 + 80;
  return (
    <g transform={`translate(540 ${y}) rotate(${-2 + Math.sin(f * 0.06) * 0.8}) scale(${s})`}>
      <rect x={-w / 2 + 10} y={-tam * 0.8 + 12} width={w} height={tam * 1.5} rx={18} fill={TINTA} opacity={0.5} />
      <rect x={-w / 2} y={-tam * 0.8} width={w} height={tam * 1.5} rx={18} fill={fundo} stroke={TINTA} strokeWidth={7} />
      <text y={tam * 0.32} textAnchor="middle" fontFamily="Anton" fontSize={tam} fill={cor} letterSpacing={1}>{texto}</text>
    </g>
  );
};
