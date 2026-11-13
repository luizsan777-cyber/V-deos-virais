// Anatomia 2D ilustrada (SVG, mesmo traço do kit: contorno escuro, sombra cel, cores vivas).
// Didática e simplificada — não é atlas médico. Nada de 3D, holograma ou realismo.
import React from "react";
import { clamp01, eio, eout, ramp, rnd, wobble } from "../../engine/src/kit/anim";

export const TINTA = "#1a1424";
export const O2 = "#5fc8ff";   // oxigênio: azul-claro
export const CO2 = "#ff8c32";  // gás carbônico: laranja
export const AMARELO = "#ffd23f";

// ------------------------------------------------------------------ cérebro em corte lateral
/** Cérebro lateral (frente à esquerda). Origem no centro do cérebro; largura ~600. */
export const CerebroLateral: React.FC<{ f: number; tronco?: number; sinais?: number; circuitos?: number; alerta?: number; opacidade?: number }> = ({
  f, tronco = 0, sinais = 0, circuitos = 0, alerta = 0, opacidade = 1,
}) => {
  const cerebro = "M -300,-20 C -310,-150 -190,-250 -40,-255 C 120,-262 270,-190 300,-60 C 318,20 285,85 220,105 C 150,128 60,118 0,130 C -80,146 -170,140 -235,105 C -285,80 -298,40 -300,-20 Z";
  const cerebelo = "M 90,120 C 140,95 250,100 270,150 C 285,195 220,225 150,220 C 100,215 70,180 90,120 Z";
  const ponte = "M 20,120 C 50,110 95,118 100,160 C 104,200 70,215 40,210 C 15,205 5,170 20,120 Z";
  const bulbo = "M 35,205 C 60,205 80,215 78,245 L 72,330 C 70,345 40,345 38,330 L 30,245 C 28,222 25,207 35,205 Z";
  const meso = "M 0,95 C 25,85 75,88 90,120 L 20,130 Z";
  const pulso = 0.5 + 0.5 * Math.sin(f * 0.25);
  const corTronco = `rgb(${Math.round(196 + 59 * tronco)},${Math.round(150 - 10 * tronco)},${Math.round(160 - 110 * tronco)})`;
  return (
    <g opacity={opacidade}>
      <defs>
        <radialGradient id="brilhoTronco"><stop offset="0" stopColor={AMARELO} stopOpacity="0.9" /><stop offset="1" stopColor={CO2} stopOpacity="0" /></radialGradient>
      </defs>
      {/* sombra */}
      <path d={cerebro} transform="translate(10 14)" fill="#000" opacity={0.18} />
      <path d={cerebro} fill="#f4b6c2" stroke={TINTA} strokeWidth={8} strokeLinejoin="round" />
      {/* lobos com tons suaves */}
      <clipPath id="clipCerebro"><path d={cerebro} /></clipPath>
      <g clipPath="url(#clipCerebro)" opacity={0.55}>
        <path d="M -320,-300 L -60,-300 L -10,40 L -320,60 Z" fill="#ffd0a8" />
        <path d="M -60,-300 L 180,-300 L 120,10 L -10,40 Z" fill="#c9d8ff" />
        <path d="M 180,-300 L 340,-300 L 340,150 L 120,10 Z" fill="#d8c4ff" />
        <path d="M -320,60 L -10,40 L 120,10 L 340,150 L -320,180 Z" fill="#bfeac6" />
        <path d={cerebro} fill="none" stroke="#c97d8f" strokeWidth={60} opacity={0.35} transform="translate(-14 10)" />
      </g>
      {/* giros (sulcos) */}
      {["M -240,-120 C -200,-160 -150,-130 -120,-170", "M -200,-40 C -150,-80 -90,-40 -60,-90", "M -90,-200 C -60,-150 -20,-190 10,-140",
        "M 40,-220 C 60,-170 100,-200 130,-150", "M 160,-170 C 190,-120 230,-140 250,-90", "M 60,-80 C 100,-40 150,-70 190,-20",
        "M -230,40 C -180,10 -120,50 -70,20", "M -40,-30 C 0,-60 40,-20 80,-50", "M 120,40 C 160,10 210,40 260,10"].map((d, i) => (
        <path key={i} d={d} stroke="#b9677d" strokeWidth={7} fill="none" strokeLinecap="round" />
      ))}
      <path d="M -10,40 C 10,-60 0,-160 -40,-255" stroke="#b9677d" strokeWidth={9} fill="none" strokeLinecap="round" />
      {/* cerebelo */}
      <path d={cerebelo} fill="#e89aac" stroke={TINTA} strokeWidth={7} />
      {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M ${100 + i * 8},${140 + i * 15} C ${150},${125 + i * 16} ${220},${130 + i * 16} ${262 - i * 4},${150 + i * 13}`} stroke="#b9677d" strokeWidth={4} fill="none" />)}
      {/* tronco encefálico: mesencéfalo, ponte, bulbo */}
      {tronco > 0 && <ellipse cx={55} cy={210} rx={140 * (0.8 + 0.2 * pulso)} ry={180 * (0.8 + 0.2 * pulso)} fill="url(#brilhoTronco)" opacity={0.55 * tronco} />}
      <path d={meso} fill={corTronco} stroke={TINTA} strokeWidth={6} />
      <path d={ponte} fill={corTronco} stroke={TINTA} strokeWidth={6} />
      <path d={bulbo} fill={corTronco} stroke={TINTA} strokeWidth={6} />
      {/* circuitos do ritmo respiratório (linhas luminosas) */}
      {circuitos > 0 && (
        <g opacity={circuitos}>
          {["M 40,150 C 60,190 50,240 55,300", "M 70,140 C 85,180 80,230 62,290", "M 30,180 C 70,200 40,250 70,310"].map((d, i) => (
            <path key={i} d={d} stroke={AMARELO} strokeWidth={4} fill="none" strokeDasharray="14 10" strokeDashoffset={-f * 2.5 - i * 8} opacity={0.9} />
          ))}
        </g>
      )}
      {/* sinais que descem (para os músculos da respiração) */}
      {sinais > 0 && Array.from({ length: 4 }, (_, i) => {
        const u = ((f * 0.025 + i / 4) % 1);
        return <circle key={i} cx={55 + Math.sin(u * 6) * 4} cy={150 + u * 200} r={9} fill={AMARELO} opacity={sinais * (1 - u) * 0.95} />;
      })}
      {alerta > 0 && <circle cx={55} cy={230} r={60 + 30 * pulso} fill="none" stroke="#ff4d4d" strokeWidth={8} opacity={alerta * (0.6 + 0.4 * pulso)} />}
    </g>
  );
};

// ------------------------------------------------------------------ tórax: costelas, pulmões, diafragma, coração
/** Tórax em corte frontal. Origem no centro do peito; largura ~700. expansao 0..1 (respiração). */
export const Torax: React.FC<{
  f: number; expansao?: number; co2?: number; o2?: number; diafragmaTremor?: number; nervos?: number; costelas?: boolean; destaqueDiafragma?: number; alveolos?: boolean;
}> = ({ f, expansao = 0.5, co2 = 0.3, o2 = 0.7, diafragmaTremor = 0, nervos = 0, costelas = true, destaqueDiafragma = 0, alveolos = true }) => {
  const e = 1 + 0.06 * (expansao - 0.5);
  const dy = (expansao - 0.5) * 30 + diafragmaTremor;
  const pulmao = (s: number) => `M ${s * 40},-260 C ${s * 120},-300 ${s * 280},-240 ${s * 300},-60 C ${s * 315},90 ${s * 290},${190 + dy} ${s * 200},${215 + dy} C ${s * 130},${235 + dy} ${s * 60},${210 + dy} ${s * 45},${150 + dy} L ${s * 40},-260 Z`;
  return (
    <g>
      {/* traqueia e brônquios */}
      <path d="M -26,-470 L 26,-470 L 26,-290 L -26,-290 Z" fill="#f6c9cf" stroke={TINTA} strokeWidth={6} />
      {Array.from({ length: 7 }, (_, i) => <line key={i} x1={-24} x2={24} y1={-450 + i * 24} y2={-450 + i * 24} stroke="#d99aa6" strokeWidth={5} />)}
      <path d="M 0,-292 L -70,-200 M 0,-292 L 70,-200" stroke="#f6c9cf" strokeWidth={30} strokeLinecap="round" />
      <g transform={`scale(${e} ${e})`}>
        {[-1, 1].map((s) => (
          <g key={s}>
            <path d={pulmao(s)} fill="#f7a8b8" stroke={TINTA} strokeWidth={8} strokeLinejoin="round" />
            <path d={pulmao(s)} fill="none" stroke="#e07b93" strokeWidth={36} opacity={0.35} transform={`translate(${s * -10} 8)`} />
            {/* árvore brônquica */}
            {[[-200, 60], [-120, 130], [-60, -60], [-140, -150]].map(([y, x], i) => (
              <path key={i} d={`M ${s * 70},-200 Q ${s * (x * 0.6 + 60)},${y * 0.5 - 100} ${s * (Math.abs(x) + 80)},${y}`} stroke="#d97a90" strokeWidth={10 - i} fill="none" strokeLinecap="round" />
            ))}
            {/* alvéolos com O2 (azul) e CO2 (laranja) */}
            {alveolos && Array.from({ length: 16 }, (_, i) => {
              const ax = s * (110 + rnd(`ax${i}`) * 170), ay = -180 + rnd(`ay${i}`) * 360;
              const laranja = rnd(`al${i}`) < co2;
              const azul = rnd(`ab${i}`) < o2;
              return (
                <g key={i}>
                  <circle cx={ax} cy={ay} r={20} fill="#fbd0d8" stroke="#d97a90" strokeWidth={3} />
                  {azul && <circle cx={ax - 6 + Math.sin(f * 0.1 + i) * 3} cy={ay - 4} r={6} fill={O2} />}
                  {laranja && <circle cx={ax + 6 + Math.cos(f * 0.1 + i) * 3} cy={ay + 5} r={6} fill={CO2} />}
                </g>
              );
            })}
          </g>
        ))}
      </g>
      {/* coração entre os pulmões */}
      <g transform={`translate(-30 80) scale(${1 + 0.05 * Math.max(0, Math.sin(f * 0.35))})`}>
        <path d="M 0,40 C -90,-20 -70,-110 -10,-90 C 10,-110 80,-100 70,-30 C 60,10 30,30 0,40 Z" fill="#d6455d" stroke={TINTA} strokeWidth={6} />
        <path d="M -20,-90 C -20,-130 10,-140 20,-120" stroke="#b5304a" strokeWidth={14} fill="none" strokeLinecap="round" />
      </g>
      {/* diafragma (cúpula azul) */}
      <path d={`M -360,${250 + dy} C -260,${130 + dy} -110,${150 + dy} 0,${180 + dy} C 110,${150 + dy} 260,${130 + dy} 360,${250 + dy} L 360,${282 + dy} C 260,${165 + dy} 110,${185 + dy} 0,${212 + dy} C -110,${185 + dy} -260,${165 + dy} -360,${282 + dy} Z`}
        fill="#4f86e8" stroke={TINTA} strokeWidth={7} strokeLinejoin="round" />
      {destaqueDiafragma > 0 && (
        <path d={`M -360,${250 + dy} C -260,${130 + dy} -110,${150 + dy} 0,${180 + dy} C 110,${150 + dy} 260,${130 + dy} 360,${250 + dy}`} stroke="#9fd0ff" strokeWidth={16} fill="none" opacity={destaqueDiafragma * (0.5 + 0.5 * Math.sin(f * 0.3))} />
      )}
      {/* nervos (frênicos, ilustrativos) descendo do pescoço até o diafragma */}
      {nervos > 0 && [-1, 1].map((s) => (
        <g key={s} opacity={nervos}>
          <path d={`M ${s * 60},-470 C ${s * 90},-300 ${s * 70},-50 ${s * 140},${160 + dy}`} stroke={AMARELO} strokeWidth={6} fill="none" />
          {Array.from({ length: 3 }, (_, i) => {
            const u = ((f * 0.03 + i / 3) % 1), t = u;
            const x = s * (60 + (140 - 60) * t + Math.sin(t * 3) * 25), y = -470 + (630 + dy) * t;
            return <circle key={i} cx={x} cy={y} r={10} fill={AMARELO} opacity={1 - u * 0.6} />;
          })}
        </g>
      ))}
      {/* costelas, esterno */}
      {costelas && (
        <g>
          {Array.from({ length: 7 }, (_, i) => [-1, 1].map((s) => (
            <path key={`${i}${s}`} d={`M ${s * 20},${-250 + i * 62} C ${s * 200},${-300 + i * 66} ${s * 330},${-210 + i * 62} ${s * 320},${-80 + i * 55}`}
              stroke="#f3e6c8" strokeWidth={22 - i} fill="none" strokeLinecap="round" opacity={0.92} />
          )))}
          {Array.from({ length: 7 }, (_, i) => [-1, 1].map((s) => (
            <path key={`o${i}${s}`} d={`M ${s * 20},${-250 + i * 62} C ${s * 200},${-300 + i * 66} ${s * 330},${-210 + i * 62} ${s * 320},${-80 + i * 55}`}
              stroke={TINTA} strokeWidth={3} fill="none" opacity={0.5} />
          )))}
          <rect x={-22} y={-270} width={44} height={380} rx={18} fill="#f3e6c8" stroke={TINTA} strokeWidth={5} />
        </g>
      )}
    </g>
  );
};

// ------------------------------------------------------------------ circulação: vaso + células
/** Interior de um vaso sanguíneo (mundo 1080 x 1920, faixa central). Partículas sempre em movimento. */
export const Circulacao: React.FC<{ f: number; o2: number; co2: number; celulas?: number; brilhoAzul?: number }> = ({ f, o2, co2, celulas = 1, brilhoAzul = 1 }) => {
  const yA = 620, yB = 1240; // paredes do vaso
  const hemacias = Array.from({ length: 16 }, (_, i) => {
    const x = (((rnd(`hx${i}`) * 1500 + f * (5 + rnd(`hv${i}`) * 2)) % 1700) - 300);
    const y = yA + 80 + rnd(`hy${i}`) * (yB - yA - 160) + Math.sin(f * 0.05 + i) * 12;
    return { x, y, r: rnd(`hr${i}`) * 360 + f * 1.5 };
  });
  const part = (n: number, cor: string, seed: string, nivel: number) =>
    Array.from({ length: n }, (_, i) => {
      if (rnd(`${seed}n${i}`) > nivel) return null;
      const x = (((rnd(`${seed}x${i}`) * 1500 + f * (6 + rnd(`${seed}v${i}`) * 3)) % 1700) - 300);
      const y = yA + 40 + rnd(`${seed}y${i}`) * (yB - yA - 80) + Math.sin(f * 0.07 + i * 2) * 18;
      return <g key={i}><circle cx={x} cy={y} r={20} fill={cor} opacity={0.18} /><circle cx={x} cy={y} r={10} fill={cor} stroke={TINTA} strokeWidth={2.5} /></g>;
    });
  return (
    <g>
      <defs>
        <linearGradient id="plasma" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7a1430" /><stop offset="0.5" stopColor="#a82545" /><stop offset="1" stopColor="#7a1430" /></linearGradient>
      </defs>
      <rect x={-600} y={-500} width={2300} height={3000} fill="#2a0f22" />
      {/* tecido com células acima e abaixo do vaso */}
      {[0, 1].map((lado) => Array.from({ length: 9 }, (_, i) => {
        const cx = -40 + i * 145 + (lado ? 70 : 0), cy = lado ? yB + 190 : yA - 190;
        const resp = 1 + 0.04 * Math.sin(f * 0.12 + i);
        return (
          <g key={`${lado}${i}`} transform={`translate(${cx} ${cy}) scale(${resp})`} opacity={celulas}>
            <ellipse rx={64} ry={52} fill="#f2a6b8" stroke={TINTA} strokeWidth={5} />
            <circle cx={8} cy={-4} r={20} fill="#9a4f86" stroke={TINTA} strokeWidth={3} />
            {/* troca: entra O2 (azul), sai CO2 (laranja) */}
            {[0, 1].map((k) => {
              const u = ((f * 0.02 + i * 0.13 + k * 0.5) % 1);
              const dir = lado ? -1 : 1;
              return k === 0
                ? <circle key={k} cx={-20} cy={dir * (100 - u * 90)} r={7} fill={O2} opacity={(1 - u) * brilhoAzul} />
                : <circle key={k} cx={30} cy={dir * (10 + u * 100)} r={7} fill={CO2} opacity={1 - u} />;
            })}
          </g>
        );
      }))}
      {/* vaso */}
      <rect x={-600} y={yA} width={2300} height={yB - yA} fill="url(#plasma)" />
      <rect x={-600} y={yA - 26} width={2300} height={30} fill="#d9536f" stroke={TINTA} strokeWidth={5} />
      <rect x={-600} y={yB - 4} width={2300} height={30} fill="#d9536f" stroke={TINTA} strokeWidth={5} />
      {/* sentido da circulação */}
      {Array.from({ length: 6 }, (_, i) => {
        const x = ((i * 300 + f * 4) % 1800) - 300;
        return <path key={i} d={`M ${x},${(yA + yB) / 2} l 60,0 l -18,-16 M ${x + 60},${(yA + yB) / 2} l -18,16`} stroke="#ffd0dc" strokeWidth={6} opacity={0.35} fill="none" />;
      })}
      {hemacias.map((h, i) => (
        <g key={i} transform={`translate(${h.x} ${h.y}) rotate(${h.r})`}>
          <ellipse rx={50} ry={34} fill="#e8344f" stroke={TINTA} strokeWidth={5} />
          <ellipse rx={24} ry={14} fill="#b81d38" />
        </g>
      ))}
      {part(26, O2, "o", o2)}
      {part(34, CO2, "c", co2)}
    </g>
  );
};

// ------------------------------------------------------------------ cabeça/pescoço com sensores
/** Perfil de cabeça e pescoço (frente à esquerda) com artéria carótida, corpo carotídeo e tronco encefálico. */
export const PescocoSensores: React.FC<{ f: number; periferico?: number; central?: number; sinal?: number }> = ({ f, periferico = 0, central = 0, sinal = 0 }) => {
  const pul = 0.5 + 0.5 * Math.sin(f * 0.3);
  return (
    <g>
      {/* silhueta */}
      <path d="M 120,-520 C 330,-560 470,-400 460,-200 C 455,-90 420,-30 380,20 L 380,520 L 40,520 L 60,170 C 0,150 -40,120 -40,70 C -40,30 -10,10 -30,-20 C -60,-60 -50,-90 -20,-110 C -40,-170 -40,-260 -10,-340 C 20,-430 60,-500 120,-520 Z"
        fill="#f1c7a8" stroke={TINTA} strokeWidth={9} opacity={0.95} />
      <path d="M 120,-520 C 330,-560 470,-400 460,-200 C 455,-90 420,-30 380,20 L 380,520 L 40,520 L 60,170 C 0,150 -40,120 -40,70 C -40,30 -10,10 -30,-20 C -60,-60 -50,-90 -20,-110 C -40,-170 -40,-260 -10,-340 C 20,-430 60,-500 120,-520 Z"
        fill="#ffffff" opacity={0.3} />
      {/* cérebro pequeno dentro */}
      <g transform="translate(250 -300) scale(0.48)"><CerebroLateral f={f} tronco={central} sinais={sinal} /></g>
      {/* carótida subindo pelo pescoço */}
      <path d="M 230,520 C 230,400 200,260 210,120 C 215,40 230,-40 250,-120" stroke="#d6455d" strokeWidth={26} fill="none" strokeLinecap="round" />
      <path d="M 210,120 C 190,60 160,20 120,-10" stroke="#d6455d" strokeWidth={18} fill="none" strokeLinecap="round" />
      {/* corpo carotídeo (sensor periférico) */}
      <g transform="translate(212 118)">
        <circle r={36 + 16 * pul * periferico} fill={AMARELO} opacity={0.35 * periferico} />
        <circle r={20} fill={periferico > 0 ? AMARELO : "#d8b25a"} stroke={TINTA} strokeWidth={5} />
      </g>
      {/* sinal do sensor até o tronco */}
      {periferico > 0 && (
        <path d="M 212,118 C 300,40 300,-60 280,-195" stroke={AMARELO} strokeWidth={6} fill="none" strokeDasharray="16 12" strokeDashoffset={-f * 3} opacity={periferico} />
      )}
      {central > 0 && <circle cx={277} cy={-197} r={36 + 14 * pul} fill="none" stroke={AMARELO} strokeWidth={7} opacity={central} />}
    </g>
  );
};

/** Água estilizada (superfície com ondas) — sem pessoas. */
export const Agua: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <defs><linearGradient id="aguaG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1f7fc9" /><stop offset="1" stopColor="#0a2e57" /></linearGradient></defs>
    <rect x={-600} y={-500} width={2300} height={3000} fill="url(#aguaG)" />
    {Array.from({ length: 9 }, (_, k) => {
      const y = 200 + k * 190;
      const pts = Array.from({ length: 30 }, (_, i) => `${-600 + i * 90},${y + Math.sin((i * 90 + f * (3 + k)) / (140 + k * 20) * Math.PI * 2) * (10 + k * 2)}`);
      return <polyline key={k} points={pts.join(" ")} fill="none" stroke="#bfe8ff" strokeWidth={4 + k * 0.6} opacity={0.25 + k * 0.03} />;
    })}
    {Array.from({ length: 20 }, (_, i) => <circle key={i} cx={rnd(`ag${i}`) * 1080} cy={((rnd(`ah${i}`) * 1900 - f * 2) % 1900 + 1900) % 1900} r={4 + rnd(`ai${i}`) * 8} fill="#fff" opacity={0.18} />)}
  </g>
);

export const fade = (f: number, a: number, b: number) => clamp01(ramp(f, a, b));
export { eio, eout, wobble };
