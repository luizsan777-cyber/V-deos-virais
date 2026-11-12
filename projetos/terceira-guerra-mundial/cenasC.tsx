// Cenas 9–11: diplomacia (Brasil não entra automaticamente), pior cenário (risco, não destino), final no quarto do Leo.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Camera } from "../../engine/src/kit/Camera";
import { Personagem } from "../../engine/src/kit/Personagem";
import { poseEm, parado, olhandoCelular, falando, apontando, pensando, Pose } from "../../engine/src/kit/poses";
import { exprEm, EXPRESSOES } from "../../engine/src/kit/expressoes";
import { Globo } from "../../engine/src/kit/Globo";
import { LUGARES } from "../../engine/src/kit/geo";
import { chaves, clamp01, eback, eio, eout, piscar, ramp } from "../../engine/src/kit/anim";
import { Particulas } from "../../engine/src/kit/efeitos";
import {
  AMARELO, VERMELHO, TINTA, Txt, Celular, TelaBloqueio, BandeiraBR, MesaReuniao, Selo, QuartoManha, Cobertor, CriadoMudo,
  NavioMilitar, DroneAsa, Cargueiro, Conteiner,
} from "./pecas";
import { LEO, DIPLOMATA_BR, DIPLOMATA_B, DIPLOMATA_C, EST, useCena, CelularMao } from "./elenco";

const W = 1080, H = 1920;
const Sobre: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>{children}</svg>
);

const Papel: React.FC = () => (
  <g transform="translate(0 -40) rotate(-4)">
    <rect x={-70} y={-90} width={140} height={180} rx={6} fill="#f4f1e8" stroke={TINTA} strokeWidth={5} />
    {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={-50} x2={i % 2 ? 30 : 50} y1={-55 + i * 28} y2={-55 + i * 28} stroke="#8a8f9a" strokeWidth={6} />)}
  </g>
);

// ================================================================== CENA 9 — diplomacia
export const Cena9: React.FC<{ inicio: number }> = ({ inicio }) => {
  const { lf, f, T, P } = useCena(inicio);
  const nosso = P("Nosso"), autom = P("automaticamente");
  if (lf < nosso - 2) {
    return (
      <AbsoluteFill>
        <Camera inicio={inicio} chaves={[[0, 540, 1080, 1.0], [autom, 560, 1060, 1.12], [nosso, 640, 980, 1.2]]} deriva={0.5}>
          <rect x={-600} y={-500} width={2300} height={2500} fill="#e8dcc6" />
          <rect x={-600} y={-500} width={2300} height={300} fill="#c9b99a" />
          {Array.from({ length: 10 }, (_, i) => <rect key={i} x={-400 + i * 220} y={-200} width={14} height={1700} fill="#d8c9ab" />)}
          <g transform="translate(70 380)"><BandeiraBR f={lf} w={380} /></g>
          <rect x={60} y={360} width={10} height={700} fill="#8a6a3a" />
          <g transform="translate(790 560)">
            <rect x={-250} y={-230} width={500} height={460} rx={18} fill="#0f1830" stroke={TINTA} strokeWidth={10} />
            <Globo id="g9a" cx={0} cy={0} r={190} lon0={-45} lat0={-8} destaques={{ brasil: "#1f9d55" }} grade={false} />
          </g>
          <Personagem id="dip-c" x={860} y={1620} escala={0.98} dir={-1} visual={DIPLOMATA_C} estilo={EST}
            pose={poseEm(lf, [[0, (x) => falando(x, 61, 0.5)], [P("Brasil") - 6, (x) => apontando(x, 150, 61)]], 7)}
            expr={EXPRESSOES.pensativo} olhosAbertos={piscar(lf, 61)} />
          <Personagem id="dip-br" x={520} y={1640} escala={1.02} visual={DIPLOMATA_BR} estilo={EST}
            pose={falando(lf, 62, 0.7)} expr={exprEm(lf, [[0, "sereno"], [autom - 2, "desconfiado"], [autom + 20, "sereno"]])}
            olhosAbertos={piscar(lf, 62)} boca={T.falando(f) ? T.boca(f) * 0.7 : 0} />
          <Personagem id="dip-b" x={170} y={1620} escala={0.96} visual={DIPLOMATA_B} estilo={EST}
            pose={{ ...olhandoCelular(lf, 63, 0.3), olhar: [0.3, 0.7] }} expr={EXPRESSOES.pensativo} olhosAbertos={piscar(lf, 63)} itemD={<Papel />} />
          <MesaReuniao y={1400} />
        </Camera>
        <Sobre>
          <Selo f={lf} em={4} texto="DIPLOMACIA" y={300} fundo="#1f9d55" cor="#fff" />
          <Selo f={lf} em={autom - 2} texto="NÃO É AUTOMÁTICO" y={440} tam={62} />
        </Sobre>
      </AbsoluteFill>
    );
  }
  const capitais = [LUGARES.washington, LUGARES.pequim, LUGARES.bruxelas, [37.6, 55.7] as [number, number], [28, -26] as [number, number], [-58.4, -34.6] as [number, number]];
  return (
    <AbsoluteFill style={{ backgroundColor: "#0b1224" }}>
      <Sobre>
        <Particulas tipo="poeira" n={40} seed={9} cor="#9fb3d8" opacidade={0.4} />
        <Globo id="g9b" cx={540} cy={980} r={chaves(lf, [[nosso - 2, 520], [nosso + 80, 640]], eio)} lon0={chaves(lf, [[nosso - 2, -45], [nosso + 110, -20]], eio)} lat0={0}
          destaques={{ brasil: "#1f9d55" }}
          rotas={capitais.map((c, i) => ({ de: LUGARES.brasilia, para: c, cor: "#ffffff", inicio: P("decisões") - 10 + i * 5, dur: 26, altura: 0.2, largura: 5, tracejada: true }))}
          rotulos={[{ ll: [-52, -10], texto: "BRASIL", cor: AMARELO, inicio: 0, dy: 0, tamanho: 64 }]} />
        {lf >= P("dependeria") && [["NEGOCIAÇÃO", 260, 1560], ["COMUNICAÇÃO", 540, 1660], ["DECISÕES POLÍTICAS", 820, 1560]].map(([t, x, y], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${eback(ramp(lf, P("dependeria") + i * 6, P("dependeria") + i * 6 + 8))})`}>
            <rect x={-((t as string).length * 13 + 30)} y={-40} width={(t as string).length * 26 + 60} height={66} rx={33} fill="#f4f6fb" stroke={TINTA} strokeWidth={5} />
            <Txt x={0} y={8} t={t as string} s={30} c={TINTA} contorno={0} />
          </g>
        ))}
        <Selo f={lf} em={0} texto="DIPLOMACIA" y={300} fundo="#1f9d55" cor="#fff" />
      </Sobre>
    </AbsoluteFill>
  );
};

// ================================================================== CENA 10 — o pior cenário (risco, não destino)
export const Cena10: React.FC<{ inicio: number }> = ({ inicio }) => {
  const { lf, P } = useCena(inicio);
  const nucl = P("nucleares"), nao = P("Não"), just = P("Justamente"), negociar = P("negociar");
  if (lf < just - 2) {
    const alivio = eout(ramp(lf, nao, nao + 24));
    const al = [
      { ll: LUGARES.taiwan, t: 6 }, { ll: LUGARES.toquio, t: 26 }, { ll: LUGARES.seul, t: 36 }, { ll: [-122, 37] as [number, number], t: P("escalada") },
      { ll: LUGARES.havai, t: P("envolvendo") }, { ll: LUGARES.pequim, t: P("outros") }, { ll: [151, -33.9] as [number, number], t: P("países") }, { ll: LUGARES.singapura, t: P("países") + 6 },
    ];
    const tensao = clamp01(ramp(lf, 0, nucl)) * (1 - alivio);
    return (
      <AbsoluteFill style={{ backgroundColor: "#03040a" }}>
        <Sobre>
          <Particulas tipo="brilhos" n={70} seed={10} cor="#fff" opacidade={0.45} />
          <Globo id="g10" cx={540} cy={1000} r={chaves(lf, [[0, 560], [nucl, 640], [just, 600]], eio)} lon0={chaves(lf, [[0, 170], [just, 140]])} lat0={20}
            destaques={lf >= P("países") ? { eua: "#b33a3a", china: "#b33a3a", japao: "#d9622b", coreiaSul: "#d9622b", taiwan: AMARELO } : { taiwan: AMARELO, china: "#b33a3a" }}
            alertas={lf < nao + 10 ? al.map((a) => ({ ll: a.ll, inicio: a.t, cor: VERMELHO })) : []} noite={0.4} />
          {[0, 1, 2, 3].map((k) => {
            const u = ((lf + k * 18) % 72) / 72;
            return <circle key={k} cx={540} cy={1000} r={620 + u * 520} fill="none" stroke={VERMELHO} strokeWidth={10 * (1 - u)} opacity={0.5 * (1 - u) * tensao} />;
          })}
          <rect width={W} height={H} fill="#5a0000" opacity={0.25 * tensao} style={{ mixBlendMode: "multiply" }} />
          {lf >= nucl - 4 && (
            <g transform={`translate(540 1000) scale(${eback(ramp(lf, nucl - 4, nucl + 6)) * (1 - 0.6 * alivio) * (1 + 0.03 * Math.sin(lf * 0.3))})`} opacity={1 - alivio}>
              <path d="M 0,-260 L 250,180 L -250,180 Z" fill={AMARELO} stroke={TINTA} strokeWidth={18} strokeLinejoin="round" />
              <text y={120} textAnchor="middle" fontFamily="Anton" fontSize={300} fill={TINTA}>!</text>
              <g transform="translate(0 290)"><rect x={-260} y={-56} width={520} height={100} rx={18} fill={TINTA} /><Txt x={0} y={14} t="RISCO NUCLEAR" s={64} c={AMARELO} fonte="Anton" peso={400} contorno={0} /></g>
            </g>
          )}
          <Selo f={lf} em={2} ate={nucl - 6} texto="O PIOR CENÁRIO" y={300} fundo={VERMELHO} cor="#fff" />
          <Selo f={lf} em={nao + 4} texto="ESCALADA NÃO É INEVITÁVEL" y={300} tam={60} />
        </Sobre>
      </AbsoluteFill>
    );
  }
  // negociação: duas delegações se cumprimentam
  const aperto = eio(ramp(lf, negociar - 18, negociar));
  const maoE: Pose = { ...parado(lf, 71), bracoD: [20 + 72 * aperto, 30 - 22 * aperto], frenteD: true };
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[just - 2, 540, 1060, 1.05], [negociar, 540, 1000, 1.3], [negociar + 60, 540, 980, 1.4]]} deriva={0.6}>
        <rect x={-600} y={-500} width={2300} height={2500} fill="#f1e2c4" />
        <circle cx={540} cy={500} r={520} fill="#fff4d6" opacity={0.7} />
        <g transform="translate(540 500)">
          <Globo id="g10b" cx={0} cy={0} r={220} lon0={20} lat0={15} grade={false} oceano={["#7fc4ff", "#3d7bd9"]} />
        </g>
        <Personagem id="neg-a" x={330} y={1640} escala={1.05} dir={1} visual={DIPLOMATA_C} estilo={EST} pose={{ ...maoE, virar: 0.4, olhar: [0.8, 0] }}
          expr={exprEm(lf, [[0, "pensativo"], [negociar, "sereno"]])} olhosAbertos={piscar(lf, 71)} />
        <Personagem id="neg-b" x={750} y={1640} escala={1.05} dir={-1} visual={DIPLOMATA_BR} estilo={EST} pose={{ ...maoE, respirar: lf * 0.09 + 3, virar: 0.4, olhar: [0.8, 0] }}
          expr={exprEm(lf, [[0, "desconfiado"], [negociar, "feliz"]])} olhosAbertos={piscar(lf, 72)} />
        <MesaReuniao y={1450} />
      </Camera>
      <Sobre><Selo f={lf} em={negociar - 4} texto="NEGOCIAR É URGENTE" y={300} fundo="#1f9d55" cor="#fff" /></Sobre>
    </AbsoluteFill>
  );
};

// ================================================================== CENA 11 — o final conecta com o começo
export const Cena11: React.FC<{ inicio: number }> = ({ inicio }) => {
  const { lf, T, P } = useCena(inicio);
  const naoUma = P("Não"), mas = P("mas"), notif = P("notificação"), precos = P("preços"), fimFala = T.fala("final").fim - inicio;
  const escurece = clamp01(ramp(lf, fimFala + 6, fimFala + 26));
  let cena: React.ReactNode;
  if (lf < naoUma - 2 || lf >= precos - 4) {
    const fecha = lf >= precos - 4;
    const baixa = eio(ramp(lf, precos + 4, precos + 34));
    cena = (
      <Camera inicio={inicio} chaves={fecha ? [[precos - 4, 540, 960, 1.7], [fimFala + 30, 540, 900, 2.25]] : [[0, 560, 1060, 1.2], [naoUma, 540, 990, 1.5]]} deriva={0.6}>
        <QuartoManha f={lf} luz={0.85} />
        <CriadoMudo x={-40} y={1010} />
        <Personagem id="leo-final" x={540} y={1540} escala={1.1} visual={LEO} estilo={EST}
          pose={{ ...olhandoCelular(lf, 3, 0.25 * (1 - baixa)), bracoD: [40 - 3.5 * (1 - baixa) - 28 * baixa, (112 + 9.5 * (1 - baixa)) * (1 - baixa) + 14 * baixa], olhar: fecha ? [0, 0.2 + 0.4 * (1 - baixa)] : [0.25, 0.75], cabecaIncl: fecha ? -2 - 5 * baixa : 6 }}
          expr={fecha ? exprEm(lf, [[precos - 4, "pensativo"], [precos + 10, "triste"]]) : EXPRESSOES.pensativo} olhosAbertos={piscar(lf, 3)}
          itemD={<CelularMao f={lf} tela={<TelaBloqueio f={999} notifs={[{ app: "ECONOMIA • SIMULAÇÃO", titulo: "Preços podem subir", texto: "cenário hipotético", cor: "#f08c00", em: 0, icone: "$" }]} />} />} />
        <g transform="translate(-200 60)"><Cobertor f={lf} respira={0} /></g>
      </Camera>
    );
  } else if (lf < mas - 2) {
    // a tela "reflete" as cenas anteriores
    const quadros = [
      <g key="d" transform="translate(150 300) scale(0.6)"><rect x={-300} y={-500} width={600} height={1000} fill="#141a3c" /><DroneAsa f={lf} /></g>,
      <g key="n" transform="translate(150 300) scale(0.25)"><rect x={-1200} y={-1200} width={2400} height={2400} fill="#2b5f8c" /><NavioMilitar f={lf} /></g>,
      <g key="m" transform="translate(150 300)"><rect x={-300} y={-500} width={600} height={1000} fill="#050816" /><Globo id="g11" cx={0} cy={0} r={130} lon0={125} lat0={20} destaques={{ china: "#c94b4b", eua: "#3d7bd9" }} grade={false} /></g>,
      <g key="c" transform="translate(150 300) scale(0.22)"><rect x={-1200} y={-1500} width={2400} height={3000} fill="#8ec5ff" /><Cargueiro f={lf} /></g>,
    ];
    const k = Math.floor((lf - naoUma) / 6) % quadros.length;
    cena = (
      <svg width={W} height={H}>
        <rect width={W} height={H} fill="#141532" />
        <g transform={`translate(540 960) scale(2.15)`}>
          <Celular f={lf} luz={1}>{quadros[k]}<rect width={300} height={600} fill="#ffffff" opacity={0.08 + 0.08 * Math.sin(lf)} /></Celular>
        </g>
      </svg>
    );
  } else {
    const notifs = [{ app: "ECONOMIA • SIMULAÇÃO", titulo: "Preços podem subir", texto: "cenário hipotético", cor: "#f08c00", em: notif - 2, icone: "$" }];
    cena = (
      <svg width={W} height={H}>
        <g opacity={0.35}><QuartoManha f={lf} luz={0.5} /></g>
        <rect width={W} height={H} fill="#0b0d22" opacity={0.45} />
        <g transform={`translate(540 ${chaves(lf, [[mas, 960], [notif + 10, 900]], eout)}) scale(${chaves(lf, [[mas, 2.0], [notif + 10, 2.35]], eout)})`}>
          <Celular f={lf} luz={1} vibra={lf >= notif - 2 && lf < notif + 10}><TelaBloqueio f={lf} hora="07:13" notifs={notifs} /></Celular>
        </g>
      </svg>
    );
  }
  return (
    <AbsoluteFill>
      {cena}
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: 0.88 * escurece }} />
      {lf >= fimFala + 18 && (
        <Sobre>
          <g transform={`translate(540 900) scale(${0.9 + 0.1 * eout(ramp(lf, fimFala + 18, fimFala + 34))})`} opacity={clamp01(ramp(lf, fimFala + 18, fimFala + 30))}>
            <Txt x={0} y={-60} t="UMA GUERRA DISTANTE" s={88} c="#fff" fonte="Anton" peso={400} />
            <Txt x={0} y={50} t="PODE MUDAR" s={88} c="#fff" fonte="Anton" peso={400} />
            <Txt x={0} y={160} t="SUA ROTINA." s={96} c={AMARELO} fonte="Anton" peso={400} />
            <Txt x={0} y={280} t="simulação fictícia • não é previsão" s={30} c="#9fb3d8" peso={700} />
          </g>
        </Sobre>
      )}
    </AbsoluteFill>
  );
};
