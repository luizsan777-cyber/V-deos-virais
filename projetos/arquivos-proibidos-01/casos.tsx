// As 10 ilustrações animadas (painel 900 x 600) e os dados de cada caso.
// Regras: nada de "foto histórica" inventada — tudo é desenho marcado como ILUSTRAÇÃO; pessoas reais aparecem
// só como nome em documento; vítimas e pacientes nunca caricaturados (silhuetas, leitos vazios, prontuários).
import React from "react";
import { Personagem, ESTILOS_PERSONAGEM, Visual } from "../../engine/src/kit/Personagem";
import { parado, olhandoCelular, falando, pensando, apontando } from "../../engine/src/kit/poses";
import { EXPRESSOES } from "../../engine/src/kit/expressoes";
import { Globo } from "../../engine/src/kit/Globo";
import { LUGARES } from "../../engine/src/kit/geo";
import { chaves, clamp01, eback, eio, eout, piscar, ramp, rnd } from "../../engine/src/kit/anim";
import { Caso, T_, TINTA, PAPEL, VERMELHO, SEPIA, Silhueta, Jornal } from "./dossie";

const EST = { ...ESTILOS_PERSONAGEM.terror, sombra: 0.5, brilho: 0.4, corBrilho: "#ffcf8a" };
const CIENTISTA: Visual = { pele: "#e8c3a0", cabelo: "careca", corCabelo: "#555", roupa: "jaleco", cor: "#2d3748", cor2: "#999", calca: "#2d2a26", oculos: true, barba: "bigode", corpo: "idoso" };
const CIENTISTA2: Visual = { pele: "#f1d2b6", cabelo: "curto", corCabelo: "#3a2a1c", roupa: "jaleco", cor: "#4a5568", calca: "#2d2a26", oculos: true, corpo: "magro" };
const AGENTE: Visual = { pele: "#d8b090", cabelo: "curto", corCabelo: "#1a1410", roupa: "terno", cor: "#2b2b30", cor2: "#7a1d1d", calca: "#1f1f24", corpo: "forte" };
const FUNCIONARIO: Visual = { pele: "#e0b896", cabelo: "topete", corCabelo: "#2a1f17", roupa: "terno", cor: "#4a4a52", cor2: "#2b4c7e", calca: "#2a2a30", oculos: true, corpo: "medio" };

const Fumaca: React.FC<{ x: number; y: number; lf: number; n?: number }> = ({ x, y, lf, n = 6 }) => (
  <g>{Array.from({ length: n }, (_, i) => { const u = ((lf * 0.6 + i * 17) % 100) / 100; return <circle key={i} cx={x + Math.sin(u * 6 + i) * 20} cy={y - u * 160} r={10 + u * 30} fill="#cfc6b8" opacity={0.35 * (1 - u)} />; })}</g>
);

// 1 ---------------------------------------------------------------- MKULTRA
const IlMk: Caso["Ilustracao"] = ({ lf, P }) => {
  const pessoas = P("pessoas");
  return (
    <g>
      <rect width={900} height={600} fill="#1e2a26" />
      <g transform={`rotate(${Math.sin(lf * 0.06) * 6} 450 0)`}><line x1={450} y1={0} x2={450} y2={90} stroke="#111" strokeWidth={5} /><path d="M 400,90 L 500,90 L 470,60 L 430,60 Z" fill="#3a3a3a" /><ellipse cx={450} cy={300} rx={300} ry={260} fill="#fff2c4" opacity={0.08} /></g>
      {[0, 1].map((r) => <rect key={r} x={520} y={120 + r * 130} width={360} height={14} fill="#3a2c22" />)}
      {Array.from({ length: 8 }, (_, i) => {
        const x = 545 + (i % 4) * 85, y = 120 + Math.floor(i / 4) * 130, cor = ["#7cff9a", "#ff6b9a", "#6bd5ff", "#ffd36b"][i % 4];
        return (
          <g key={i}>
            <path d={`M ${x - 18},${y} L ${x - 18},${y - 50} L ${x - 8},${y - 70} L ${x + 8},${y - 70} L ${x + 18},${y - 50} L ${x + 18},${y} Z`} fill={cor} opacity={0.6} stroke="#0b0a0d" strokeWidth={3} />
            {[0, 1].map((k) => { const u = ((lf + i * 9 + k * 15) % 30) / 30; return <circle key={k} cx={x + (k ? 5 : -5)} cy={y - 10 - u * 50} r={3} fill="#fff" opacity={1 - u} />; })}
          </g>
        );
      })}
      <rect x={0} y={470} width={900} height={130} fill="#2b221c" />
      <Personagem id="mk-cient" x={260} y={600} escala={0.6} visual={CIENTISTA} estilo={EST}
        pose={{ ...olhandoCelular(lf, 41, 0.6), olhar: [0.7, 0.4] }} expr={EXPRESSOES.desconfiado} olhosAbertos={piscar(lf, 41)}
        itemD={<g transform="translate(0 -20)"><path d="M -14,0 L -14,-40 L -6,-56 L 6,-56 L 14,-40 L 14,0 Z" fill="#7cff9a" opacity={0.8} stroke={TINTA} strokeWidth={4} /></g>} />
      {lf >= pessoas - 4 && (
        <g opacity={clamp01(ramp(lf, pessoas - 4, pessoas + 6))}>
          <rect x={620} y={420} width={150} height={20} fill="#3a2c22" /><rect x={640} y={440} width={14} height={60} fill="#3a2c22" /><rect x={740} y={440} width={14} height={60} fill="#3a2c22" />
          <Silhueta x={700} y={430} s={0.9} f={lf} seed={3} cor="#0d0b0a" />
          <text x={700} y={220} textAnchor="middle" fontFamily="Anton" fontSize={90} fill="#c1121f" opacity={0.6 + 0.4 * Math.sin(lf * 0.3)}>?</text>
        </g>
      )}
    </g>
  );
};

// 2 ---------------------------------------------------------------- TUSKEGEE
const IlTusk: Caso["Ilustracao"] = ({ lf, P, dur }) => {
  const ano = Math.round(chaves(lf, [[P("Durante"), 1932], [P("penicilina") - 6, 1972]], eio));
  const pen = P("penicilina");
  return (
    <g>
      <rect width={900} height={600} fill="#d2c4a2" />
      <rect y={430} width={900} height={170} fill="#8f7d5e" />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${70 + i * 200} 400)`}>
          <rect x={0} y={0} width={170} height={40} fill="#efe8d8" stroke={TINTA} strokeWidth={4} />
          <rect x={0} y={-30} width={40} height={70} fill="#7a6a52" stroke={TINTA} strokeWidth={4} />
          <rect x={10} y={40} width={8} height={60} fill="#555" /><rect x={150} y={40} width={8} height={60} fill="#555" />
        </g>
      ))}
      <g transform="translate(680 110)">
        <rect x={0} y={0} width={180} height={210} fill="#f4eedf" stroke={TINTA} strokeWidth={5} />
        <rect x={0} y={0} width={180} height={50} fill={VERMELHO} />
        <T_ x={90} y={36} t="ANO" s={32} c="#fff" fonte="Anton" />
        <T_ x={90} y={140} t={String(ano)} s={66} fonte="Anton" />
        {lf % 4 < 2 && lf < pen && <rect x={0} y={60} width={180} height={150} fill="#fff" opacity={0.25} />}
      </g>
      <g transform="translate(80 70) rotate(-4)">
        <rect width={220} height={270} fill="#f7f1e2" stroke={TINTA} strokeWidth={4} />
        <T_ x={110} y={40} t="PRONTUÁRIO" s={28} />
        {Array.from({ length: 7 }, (_, i) => <rect key={i} x={20} y={60 + i * 28} width={i % 2 ? 140 : 180} height={10} fill="#7a6a52" />)}
      </g>
      {lf >= pen - 4 && (
        <g transform={`translate(470 220) scale(${eback(ramp(lf, pen - 4, pen + 6))})`}>
          <rect x={-55} y={-80} width={110} height={160} rx={14} fill="#e8f4ff" stroke={TINTA} strokeWidth={5} />
          <rect x={-35} y={-110} width={70} height={34} fill="#555" />
          <T_ x={0} y={10} t="PENI-" s={26} fonte="Anton" /><T_ x={0} y={40} t="CILINA" s={26} fonte="Anton" />
          <path d="M -90,-100 L 90,100 M 90,-100 L -90,100" stroke={VERMELHO} strokeWidth={14} strokeLinecap="round" opacity={0.9} />
          <T_ x={0} y={140} t="não oferecida" s={30} c={VERMELHO} fonte="Montserrat" peso={900} />
        </g>
      )}
    </g>
  );
};

// 3 ---------------------------------------------------------------- GUATEMALA
const IlGua: Caso["Ilustracao"] = ({ lf, P }) => {
  const mudaDocs = P("pessoas") - 4;
  if (lf < mudaDocs) {
    return (
      <g>
        <rect width={900} height={600} fill="#0f0c0a" />
        <Globo id="gua" cx={450} cy={300} r={chaves(lf, [[0, 900], [mudaDocs, 1500]], eio)} lon0={-88} lat0={15} grade={false}
          oceano={["#2a3a3a", "#0e1414"]} terra="#8a6a45" contorno="#1a120c"
          alertas={[{ ll: [-90.5, 14.6], inicio: 6, cor: VERMELHO, tamanho: 1.2 }]}
          rotulos={[{ ll: [-90.5, 14.6], texto: "GUATEMALA", inicio: 4, cor: "#f3e3c0", dy: -60, tamanho: 44 }]} />
        <T_ x={450} y={560} t="1946 – 1948" s={48} c="#f3e3c0" fonte="Anton" />
      </g>
    );
  }
  return (
    <g>
      <rect width={900} height={600} fill="#2a231c" />
      {Array.from({ length: 5 }, (_, i) => {
        const t = eout(ramp(lf, mudaDocs + i * 5, mudaDocs + i * 5 + 12));
        return (
          <g key={i} transform={`translate(${160 + i * 140 + (1 - t) * 400} ${300 + (i % 2) * 40}) rotate(${-12 + i * 6})`} opacity={t}>
            <rect x={-110} y={-150} width={220} height={290} fill="#efe6cf" stroke={TINTA} strokeWidth={4} />
            <T_ x={0} y={-105} t={i % 2 ? "PROTOCOLO" : "RELATÓRIO"} s={26} />
            <T_ x={0} y={-75} t={i % 2 ? "1947" : "1948"} s={24} c="#6b5640" />
            {Array.from({ length: 6 }, (_, k) => <rect key={k} x={-85} y={-55 + k * 30} width={k % 2 ? 130 : 170} height={10} fill="#8a7a5e" />)}
          </g>
        );
      })}
    </g>
  );
};

// 4 ---------------------------------------------------------------- COINTELPRO
const IlCoin: Caso["Ilustracao"] = ({ lf, P }) => {
  const roub = P("roubados") - 4;
  const fios = eout(ramp(lf, P("conflitos") - 4, P("conflitos") + 20));
  const fotos: [number, number][] = [[120, 120], [300, 90], [210, 260], [390, 240]];
  return (
    <g>
      <rect width={900} height={600} fill="#15131a" />
      <g transform="translate(40 30)">
        <rect width={470} height={380} fill="#6e4f33" stroke={TINTA} strokeWidth={6} />
        {fotos.map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y}) rotate(${(i - 1.5) * 5})`}>
            <rect x={-55} y={-65} width={110} height={130} fill="#ddd2bd" stroke={TINTA} strokeWidth={3} />
            <circle cx={0} cy={-15} r={25} fill="#333" /><rect x={-35} y={12} width={70} height={40} rx={20} fill="#333" />
            <circle cx={0} cy={-62} r={7} fill={VERMELHO} />
          </g>
        ))}
        {fotos.slice(1).map(([x, y], i) => (
          <line key={i} x1={fotos[0][0]} y1={fotos[0][1] - 62} x2={fotos[0][0] + (x - fotos[0][0]) * fios} y2={fotos[0][1] - 62 + (y - fotos[0][1]) * fios} stroke={VERMELHO} strokeWidth={4} />
        ))}
      </g>
      <Personagem id="coin-ag" x={700} y={640} escala={0.62} dir={-1} visual={AGENTE} estilo={EST}
        pose={{ ...apontando(lf, 110, 51), olhar: [0.6, -0.2] }} expr={EXPRESSOES.desconfiado} olhosAbertos={piscar(lf, 51)} />
      {lf >= roub && (
        <g>
          {Array.from({ length: 6 }, (_, i) => {
            const u = clamp01((lf - roub - i * 3) / 26);
            return <g key={i} transform={`translate(${300 + u * (i % 2 ? 500 : -400)} ${450 - u * 380 + i * 10}) rotate(${u * 200 * (i % 2 ? 1 : -1)})`} opacity={1 - u * 0.4}>
              <rect x={-40} y={-50} width={80} height={100} fill="#efe6cf" stroke={TINTA} strokeWidth={3} />
              <rect x={-30} y={-35} width={50} height={8} fill="#8a7a5e" />
            </g>;
          })}
        </g>
      )}
    </g>
  );
};

// 5 ---------------------------------------------------------------- CARTAS
const IlCartas: Caso["Ilustracao"] = ({ lf, P }) => {
  const foto = P("fotografar") - 2;
  const flash = [foto, foto + 14, foto + 30].some((x) => lf >= x && lf < x + 3);
  return (
    <g>
      <rect width={900} height={600} fill="#1d1b20" />
      <ellipse cx={330} cy={300} rx={420} ry={330} fill="#ffdca0" opacity={0.08} />
      <rect y={440} width={900} height={160} fill="#3a2a20" />
      {Array.from({ length: 9 }, (_, i) => {
        const x = (((i * 130 + lf * 3) % 1170) - 135);
        return <g key={i} transform={`translate(${x} 470)`}><rect x={-50} y={-30} width={100} height={60} fill="#efe6cf" stroke={TINTA} strokeWidth={3} /><path d="M -50,-30 L 0,5 L 50,-30" fill="none" stroke={TINTA} strokeWidth={3} /></g>;
      })}
      <Personagem id="cartas-f" x={250} y={640} escala={0.62} visual={FUNCIONARIO} estilo={EST}
        pose={{ ...olhandoCelular(lf, 61, 0.4), olhar: [0.5, 0.6] }} expr={EXPRESSOES.pensativo} olhosAbertos={piscar(lf, 61)}
        itemD={<g transform="translate(0 -30)"><rect x={-60} y={-36} width={120} height={72} fill="#efe6cf" stroke={TINTA} strokeWidth={5} /><path d="M -60,-36 L 0,4 L 60,-36" fill="none" stroke={TINTA} strokeWidth={5} /></g>} />
      <Fumaca x={330} y={330} lf={lf} />
      <g transform="translate(680 300)">
        <rect x={-70} y={-50} width={140} height={100} rx={12} fill="#2a2a30" stroke={TINTA} strokeWidth={5} />
        <circle cx={0} cy={0} r={34} fill="#111" stroke="#666" strokeWidth={6} />
        <rect x={-50} y={-72} width={40} height={24} fill="#2a2a30" />
        <path d="M 0,50 L -50,220 M 0,50 L 50,220 M 0,50 L 0,220" stroke="#444" strokeWidth={8} />
      </g>
      {flash && <rect width={900} height={600} fill="#fff" opacity={0.75} />}
    </g>
  );
};

// 6 ---------------------------------------------------------------- PENTÁGONO
const IlPent: Caso["Ilustracao"] = ({ lf, P }) => {
  const div = P("divulgação") - 4;
  return (
    <g>
      <rect width={900} height={600} fill="#191716" />
      {Array.from({ length: 5 }, (_, i) => {
        const h = 8 + (i % 3) * 3;
        return (
          <g key={i} transform={`translate(${90 + i * 175} 560)`}>
            {Array.from({ length: Math.min(h, Math.floor(lf / 2) - i) }, (_, k) => <rect key={k} x={-70 + (rnd(`pt${i}${k}`) - 0.5) * 10} y={-k * 30 - 28} width={140} height={28} fill={k % 2 ? "#e6dcc4" : "#d6c9a8"} stroke={TINTA} strokeWidth={2} />)}
            {lf > 20 + i * 6 && <g transform={`translate(0 ${-h * 30 - 40}) rotate(-10) scale(${eback(ramp(lf, 20 + i * 6, 26 + i * 6))})`}><rect x={-70} y={-24} width={140} height={44} fill="none" stroke={VERMELHO} strokeWidth={5} /><T_ x={0} y={10} t="SECRETO" s={28} c={VERMELHO} fonte="Anton" /></g>}
          </g>
        );
      })}
      {lf >= div && <rect width={900} height={600} fill="#000" opacity={0.55} />}
      <Jornal f={lf} em={div} manchete="ESCÂNDALO NACIONAL" sub="Documentos do Pentágono vêm a público" ano="(1971)" x={450} y={300} />
    </g>
  );
};

// 7 ---------------------------------------------------------------- IRÃ 1953
const IlIra: Caso["Ilustracao"] = ({ lf, P }) => {
  const rua = P("derrubada") - 6;
  if (lf < rua) {
    return (
      <g>
        <rect width={900} height={600} fill="#0f0c0a" />
        <Globo id="ira" cx={450} cy={300} r={chaves(lf, [[0, 700], [rua, 1100]], eio)} lon0={53} lat0={32} grade={false}
          oceano={["#2a3a3a", "#0e1414"]} terra="#8a6a45" contorno="#1a120c"
          alertas={[{ ll: [51.4, 35.7], inicio: 8, cor: VERMELHO, tamanho: 1.2 }]}
          rotulos={[{ ll: [53, 32], texto: "IRÃ • 1953", inicio: 6, cor: "#f3e3c0", dy: 20, tamanho: 50 }]} />
        <g transform={`translate(700 120) rotate(6) scale(${eback(ramp(lf, P("desclassificados") - 2, P("desclassificados") + 6))})`}>
          <rect x={-120} y={-80} width={240} height={160} fill="#efe6cf" stroke={TINTA} strokeWidth={4} />
          <T_ x={0} y={-35} t="DESCLASSIFICADO" s={26} c={VERMELHO} fonte="Anton" />
          <T_ x={0} y={5} t="CIA • MI6" s={30} />
          <T_ x={0} y={45} t="1953" s={28} c="#6b5640" />
        </g>
      </g>
    );
  }
  return (
    <g>
      <rect width={900} height={600} fill="#2b2118" />
      <rect y={0} width={900} height={330} fill="#4a3a2a" />
      {Array.from({ length: 6 }, (_, i) => <rect key={i} x={i * 160 - 20} y={120 + (i % 2) * 40} width={140} height={260} fill="#3a2d22" stroke={TINTA} strokeWidth={4} />)}
      {Array.from({ length: 14 }, (_, i) => {
        const x = 40 + i * 62 + Math.sin(lf * 0.1 + i) * 6, s = 0.55 + (i % 3) * 0.1;
        return <Silhueta key={i} x={x} y={560 + (i % 2) * 20} s={s} f={lf + i * 7} seed={i} braco={i % 3 === 0 ? 120 : 0} cor="#120e0b" />;
      })}
      {[0, 1].map((i) => <g key={i} transform={`translate(${250 + i * 400} ${250 + Math.sin(lf * 0.12 + i) * 8}) rotate(${Math.sin(lf * 0.08 + i) * 6})`}><rect x={-4} y={0} width={8} height={160} fill="#1a120c" /><rect x={-80} y={-60} width={160} height={70} fill="#e6dcc4" stroke={TINTA} strokeWidth={4} /></g>)}
      <g transform="translate(450 70)"><rect x={-260} y={-40} width={520} height={70} fill="#000" opacity={0.6} /><T_ x={0} y={10} t="primeiro-ministro Mossadegh" s={34} c="#f3e3c0" /></g>
    </g>
  );
};

// 8 ---------------------------------------------------------------- VIGILÂNCIA
const IlVig: Caso["Ilustracao"] = ({ lf, P }) => {
  const cidades: [number, number][] = [[-77, 38.9], [-0.1, 51.5], [2.3, 48.8], [139.7, 35.7], [-46.6, -23.5], [37.6, 55.7], [151.2, -33.9], [28, -26], [116.4, 39.9], [77.2, 28.6]];
  return (
    <g>
      <rect width={900} height={600} fill="#06080d" />
      <Globo id="vig" cx={600} cy={330} r={260} lon0={chaves(lf, [[0, -40], [200, 40]])} lat0={20} grade
        oceano={["#0d2a3a", "#040b12"]} terra="#123d3a" contorno="#3ff0c0"
        rotas={cidades.flatMap((c, i) => cidades.slice(i + 1, i + 3).map((d, k) => ({ de: c, para: d, cor: "#3ff0c0", inicio: P("programas") - 10 + i * 3 + k, dur: 16, altura: 0.25, largura: 3 })))} />
      {[0, 1, 2].map((i) => {
        const a = Math.sin(lf * 0.05 + i * 2) * 25;
        return (
          <g key={i} transform={`translate(${80 + i * 10} ${80 + i * 170}) rotate(${a})`}>
            <rect x={0} y={-22} width={120} height={44} rx={10} fill="#d9d9d9" stroke={TINTA} strokeWidth={4} />
            <circle cx={120} cy={0} r={18} fill="#111" stroke="#666" strokeWidth={4} />
            <circle cx={20} cy={-10} r={6} fill={VERMELHO} opacity={(lf + i * 5) % 20 < 10 ? 1 : 0.2} />
          </g>
        );
      })}
      <g transform={`translate(300 520) scale(${eback(ramp(lf, P("revelou") - 2, P("revelou") + 6))})`}>
        <rect x={-180} y={-40} width={360} height={70} fill="#efe6cf" stroke={TINTA} strokeWidth={4} />
        <T_ x={0} y={8} t="E. SNOWDEN • 2013" s={34} />
      </g>
    </g>
  );
};

// 9 ---------------------------------------------------------------- WATERGATE
const IlWat: Caso["Ilustracao"] = ({ lf, P }) => {
  const ren = P("renúncia") - 4;
  return (
    <g>
      <rect width={900} height={600} fill="#1b1a22" />
      <g transform="translate(640 210)" opacity={0.6}>
        <rect x={-210} y={0} width={420} height={140} fill="#e6e2d6" />
        <path d="M -240,0 L 0,-70 L 240,0 Z" fill="#e6e2d6" />
        {Array.from({ length: 6 }, (_, i) => <rect key={i} x={-180 + i * 70} y={10} width={18} height={130} fill="#b9b3a3" />)}
      </g>
      <rect y={420} width={900} height={180} fill="#3a2a20" />
      <g transform="translate(220 400)">
        <rect x={-150} y={-90} width={300} height={140} rx={12} fill="#2a2a30" stroke={TINTA} strokeWidth={5} />
        {[-70, 70].map((x) => (
          <g key={x} transform={`translate(${x} -30) rotate(${lf * 6 * (x > 0 ? 1 : 1.2)})`}>
            <circle r={48} fill="#4a4a52" stroke={TINTA} strokeWidth={4} /><circle r={12} fill="#111" />
            {[0, 120, 240].map((a) => <rect key={a} x={-4} y={-44} width={8} height={30} fill="#111" transform={`rotate(${a})`} />)}
          </g>
        ))}
        <rect x={-110} y={20} width={220} height={8} fill="#8a6a45" />
        <circle cx={120} cy={30} r={8} fill={VERMELHO} opacity={lf % 20 < 10 ? 1 : 0.3} />
      </g>
      <g transform="translate(560 430)">
        <path d="M -60,0 Q 0,-40 60,0 L 50,40 L -50,40 Z" fill="#111" />
        <rect x={-14} y={-60} width={28} height={50} rx={10} fill="#333" stroke="#777" strokeWidth={3} />
        <circle cx={0} cy={-70} r={6} fill={VERMELHO} opacity={(lf + 7) % 16 < 8 ? 1 : 0.2} />
      </g>
      {lf >= ren && <rect width={900} height={600} fill="#000" opacity={0.55} />}
      <Jornal f={lf} em={ren} manchete="NIXON RENUNCIA" sub="Escândalo Watergate" ano="(1974)" x={450} y={300} />
    </g>
  );
};

// 10 --------------------------------------------------------------- PAPERCLIP
const IlPaper: Caso["Ilustracao"] = ({ lf, P }) => {
  const lanc = P("projetos") - 6;
  const sobe = Math.max(0, lf - lanc);
  return (
    <g>
      <rect width={900} height={600} fill="#0d0f16" />
      {Array.from({ length: 30 }, (_, i) => <circle key={i} cx={rnd(`es${i}`) * 900} cy={rnd(`et${i}`) * 300} r={1.5} fill="#fff" opacity={0.6} />)}
      <rect y={460} width={900} height={140} fill="#2a2a24" />
      <g transform="translate(110 260)">
        <rect x={0} y={0} width={260} height={170} fill="#1f2a22" stroke="#6b5640" strokeWidth={10} />
        {Array.from({ length: 5 }, (_, i) => <text key={i} x={20} y={38 + i * 30} fontFamily={"Special Elite"} fontSize={22} fill="#e9e4d4" opacity={0.85}>{["F = m·a", "Δv = Isp·g·ln(m0/m)", "h = ½gt²", "x(t) = …", "≈ 1945"][i]}</text>)}
      </g>
      <Personagem id="pap-c1" x={190} y={640} escala={0.5} visual={CIENTISTA2} estilo={EST} pose={{ ...apontando(lf, 140, 71), olhar: [0.4, -0.6] }} expr={EXPRESSOES.pensativo} olhosAbertos={piscar(lf, 71)} />
      <Personagem id="pap-c2" x={420} y={640} escala={0.5} dir={-1} visual={CIENTISTA} estilo={EST} pose={{ ...pensando(lf, 72), olhar: [0.5, -0.6] }} expr={EXPRESSOES.desconfiado} olhosAbertos={piscar(lf, 72)} />
      <g transform={`translate(700 ${460 - sobe * sobe * 0.12})`}>
        {sobe > 0 && <g><ellipse cx={0} cy={40} rx={30 + Math.sin(lf) * 6} ry={70 + Math.sin(lf * 1.3) * 12} fill="#ffb347" opacity={0.85} /><ellipse cx={0} cy={30} rx={16} ry={40} fill="#fff1c9" /></g>}
        <path d="M -24,0 L -24,-200 Q 0,-270 24,-200 L 24,0 Z" fill="#d9d9d9" stroke={TINTA} strokeWidth={5} />
        <path d="M -24,0 L -50,30 L -24,-40 Z M 24,0 L 50,30 L 24,-40 Z" fill={VERMELHO} stroke={TINTA} strokeWidth={4} />
        <rect x={-24} y={-150} width={48} height={14} fill="#111" />
      </g>
      {sobe === 0 && <path d="M 760,460 L 760,200 M 760,220 L 724,220 M 760,300 L 724,300" stroke="#666" strokeWidth={8} />}
      {sobe > 0 && <Fumaca x={700} y={520} lf={lf} n={8} />}
    </g>
  );
};

export const CASOS: Record<string, Caso> = {
  mkultra: { n: 1, titulo: "PROJETO MKULTRA", periodo: "1953 – 1973 • CIA", fonte: "Comitê Church, Senado dos EUA (1975–77)", carimbo: "CONTROLE MENTAL", carimboEm: "mental", Ilustracao: IlMk },
  tuskegee: { n: 2, titulo: "ESTUDO DE TUSKEGEE", periodo: "1932 – 1972 • Serviço de Saúde dos EUA", fonte: "CDC — Untreated Syphilis Study at Tuskegee", carimbo: "SEM TRATAMENTO", carimboEm: "tratamento", Ilustracao: IlTusk },
  guatemala: { n: 3, titulo: "EXPERIMENTOS NA GUATEMALA", periodo: "1946 – 1948 • pesquisadores dos EUA", fonte: "Comissão Presidencial de Bioética dos EUA (2011)", carimbo: "SEM CONSENTIMENTO", carimboEm: "consentimento", Ilustracao: IlGua },
  cointelpro: { n: 4, titulo: "OPERAÇÃO COINTELPRO", periodo: "1956 – 1971 • FBI", fonte: "Comitê Church, Livro III (1976)", carimbo: "VAZADO", carimboEm: "roubados", Ilustracao: IlCoin },
  cartas: { n: 5, titulo: "CARTAS INTERCEPTADAS", periodo: "1952 – 1973 • CIA (HTLINGUAL)", fonte: "Comissão Rockefeller (1975)", carimbo: "INTERCEPTADO", carimboEm: "interceptar", Ilustracao: IlCartas },
  pentagono: { n: 6, titulo: "DOCUMENTOS DO PENTÁGONO", periodo: "1971 • Guerra do Vietnã", fonte: "Arquivo Nacional dos EUA (íntegra em 2011)", carimbo: "ULTRASSECRETO", carimboEm: "secretos", Ilustracao: IlPent },
  ira: { n: 7, titulo: "GOLPE NO IRÃ", periodo: "1953 • CIA e serviço secreto britânico", fonte: "Documentos da CIA desclassificados (2013)", carimbo: "DESCLASSIFICADO", carimboEm: "desclassificados", Ilustracao: IlIra },
  vigilancia: { n: 8, titulo: "VIGILÂNCIA EM MASSA", periodo: "2013 • inteligência americana (NSA)", fonte: "The Guardian / Washington Post (2013)", carimbo: "REVELADO", carimboEm: "revelou", Ilustracao: IlVig },
  watergate: { n: 9, titulo: "ESCÂNDALO WATERGATE", periodo: "1972 – 1974 • Casa Branca", fonte: "Arquivo Nacional dos EUA", carimbo: "RENÚNCIA", carimboEm: "renúncia", Ilustracao: IlWat },
  paperclip: { n: 10, titulo: "OPERAÇÃO PAPERCLIP", periodo: "1945 – 1959 • EUA", fonte: "Arquivo Nacional dos EUA (JIOA)", carimbo: "RECRUTADOS", carimboEm: "recrutaram", Ilustracao: IlPaper },
};
