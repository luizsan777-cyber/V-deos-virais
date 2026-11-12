// Cenas 5–8: reação global (jornalista em transmissão fictícia), cadeias de comércio, Brasil, exportações.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Camera } from "../../engine/src/kit/Camera";
import { Personagem } from "../../engine/src/kit/Personagem";
import { poseEm, parado, olhandoCelular, falando, apontando, andando, pensando, encolhendoOmbros } from "../../engine/src/kit/poses";
import { exprEm, EXPRESSOES } from "../../engine/src/kit/expressoes";
import { Globo } from "../../engine/src/kit/Globo";
import { LUGARES, LL } from "../../engine/src/kit/geo";
import { chaves, eback, eio, eout, piscar, ramp, rnd } from "../../engine/src/kit/anim";
import { Particulas } from "../../engine/src/kit/efeitos";
import {
  AMARELO, VERMELHO, TINTA, Txt, Celular, TelaGrafico, Mar, Ceu, Cargueiro, Fabrica, PlacaChips, CidadeFundo, Posto, Mercado,
  Guindaste, Caminhao, Plantacao, TremMinerio, MesaReuniao, Selo, Conteiner,
} from "./pecas";
import { LEO, JORNALISTA, TRABALHADORA, DIPLOMATA_B, DIPLOMATA_C, EUROPA, EST, useCena, CelularMao } from "./elenco";

const W = 1080, H = 1920;
const Sobre: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>{children}</svg>
);

// ================================================================== CENA 5 — o mundo reage
export const Cena5: React.FC<{ inicio: number }> = ({ inicio }) => {
  const { lf, T, f, P } = useCena(inicio);
  const europa = P("Europa"), governos = P("governos"), mercados = P("mercados") - 8;
  if (lf < governos + 8) {
    const lon0 = chaves(lf, [[0, 134], [europa - 10, 126], [europa + 4, 15]], eio);
    const lat0 = chaves(lf, [[0, 34], [europa - 10, 36], [europa + 4, 50]], eio);
    const r = chaves(lf, [[0, 1350], [europa - 10, 1250], [europa - 2, 700], [europa + 10, 1150]], eio);
    return (
      <AbsoluteFill style={{ backgroundColor: "#050816" }}>
        <Sobre>
          <Particulas tipo="brilhos" n={50} seed={5} cor="#fff" opacidade={0.4} />
          <Globo id="g5" cx={540} cy={1000} r={r} lon0={lon0} lat0={lat0}
            destaques={{ japao: "#ff8c1a", coreiaSul: "#ff8c1a", europa: lf >= europa - 4 ? "#3d7bd9" : "#79c27a", china: "#c94b4b" }}
            alertas={[{ ll: LUGARES.toquio, inicio: 4, cor: "#ff8c1a" }, { ll: LUGARES.seul, inicio: P("Coreia"), cor: "#ff8c1a" }, { ll: LUGARES.bruxelas, inicio: europa, cor: "#5fa8ff" }]}
            rotulos={[
              { ll: [138.5, 37.5], texto: "JAPÃO", inicio: 2, dy: -60 },
              { ll: [127.8, 36.2], texto: "COREIA DO SUL", inicio: P("Coreia"), dy: 80, tamanho: 38 },
              { ll: [10, 48], texto: "EUROPA", inicio: europa, dy: -40, tamanho: 54 },
            ]} />
          <Selo f={lf} em={2} ate={europa - 2} texto="REAÇÃO GLOBAL" y={330} />
        </Sobre>
      </AbsoluteFill>
    );
  }
  if (lf < mercados) {
    return (
      <AbsoluteFill>
        <Camera inicio={inicio} chaves={[[governos + 8, 540, 1080, 1.2], [mercados, 540, 1060, 1.32]]} deriva={0.6}>
          <rect x={-600} y={-500} width={2300} height={2500} fill="#28324d" />
          <g transform="translate(540 760)">
            <rect x={-440} y={-260} width={880} height={480} rx={20} fill="#0f1830" stroke={TINTA} strokeWidth={10} />
            <Txt x={0} y={-170} t="REUNIÃO DE EMERGÊNCIA" s={52} c={AMARELO} />
            <Txt x={0} y={-118} t="(cenário fictício)" s={30} c="#9fb3d8" peso={700} />
            <g transform="translate(0 70)">
              <Globo id="g5b" cx={0} cy={0} r={150} lon0={60} lat0={35} destaques={{ europa: "#3d7bd9", japao: "#ff8c1a", coreiaSul: "#ff8c1a", eua: "#7a8fb8", china: "#c94b4b" }} grade={false} />
            </g>
          </g>
          {[[260, -1, DIPLOMATA_B, 31], [540, 1, EUROPA, 32], [820, -1, DIPLOMATA_C, 33]].map(([x, d, v, sd], i) => (
            <Personagem key={i} id={`gov${i}`} x={x as number} y={1640} escala={0.95} dir={d as 1 | -1} visual={v as typeof LEO} estilo={EST}
              pose={i === 1 ? apontando(lf, 140, 32) : falando(lf + i * 13, sd as number, 0.8)}
              expr={[EXPRESSOES.pensativo, EXPRESSOES.desconfiado, EXPRESSOES.bravo][i]} olhosAbertos={piscar(lf, sd as number)}
              boca={i !== 1 && (Math.floor((lf + i * 20) / 25) % 2 === 0) ? 0.35 + 0.3 * Math.abs(Math.sin(lf * 0.6)) : 0} />
          ))}
          <MesaReuniao y={1420} />
        </Camera>
        <Sobre>
          <g transform={`translate(540 1500) scale(${eback(ramp(lf, governos + 14, governos + 22))})`}>
            <rect x={-440} y={-52} width={880} height={100} rx={20} fill="#0f1830" stroke={AMARELO} strokeWidth={4} opacity={0.93} />
            <Txt x={0} y={14} t="reações dependeriam de decisões políticas" s={32} c="#fff" peso={800} />
          </g>
        </Sobre>
      </AbsoluteFill>
    );
  }
  // transmissão fictícia: jornalista + gráfico de mercado caindo
  const queda = eout(ramp(lf, mercados, mercados + 50));
  const pts = Array.from({ length: Math.max(2, Math.floor(30 * queda)) }, (_, i) => `${40 + i * 21},${120 + i * 9 + Math.sin(i * 1.9) * 26 + rnd(`m${i}`) * 18}`);
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[mercados, 540, 1000, 1.05], [mercados + 90, 520, 980, 1.18]]} deriva={0.5}>
        <rect x={-600} y={-500} width={2300} height={2500} fill="#162035" />
        {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-400 + i * 180} y={300} width={6} height={1300} fill="#24314f" />)}
        <g transform="translate(560 760)">
          <rect x={-460} y={-330} width={920} height={620} rx={22} fill="#0b1224" stroke={TINTA} strokeWidth={10} />
          <rect x={-460} y={-330} width={920} height={86} rx={22} fill={VERMELHO} />
          <Txt x={0} y={-272} t="PLANTÃO DA SIMULAÇÃO" s={48} c="#fff" />
          <Txt x={-400} y={-180} t="ÍNDICE GLOBAL (fictício)" s={34} c="#9fb3d8" anchor="start" peso={800} />
          <g transform="translate(-440 -160)"><polyline points={pts.join(" ")} fill="none" stroke={VERMELHO} strokeWidth={10} strokeLinejoin="round" strokeLinecap="round" /></g>
          {queda > 0.6 && <g transform={`translate(300 180) scale(${eback(ramp(lf, mercados + 30, mercados + 38))})`}><path d="M 0,60 L 60,-20 L 25,-20 L 25,-80 L -25,-80 L -25,-20 L -60,-20 Z" fill={VERMELHO} stroke={TINTA} strokeWidth={6} /></g>}
        </g>
        <Personagem id="jornalista" x={300} y={1820} escala={1.12} visual={JORNALISTA} estilo={EST}
          pose={poseEm(lf, [[0, (x) => falando(x, 41, 0.7)], [P("nervosos") - 6, (x) => apontando(x, 128, 41)]], 7)}
          expr={exprEm(lf, [[0, "pensativo"], [P("nervosos") - 4, "surpreso"]])} olhosAbertos={piscar(lf, 41)} boca={T.falando(f) ? T.boca(f) * 0.8 : 0} />
        <rect x={-600} y={1600} width={2300} height={140} fill="#0b1224" />
        <text x={1400 - ((lf * 9) % 2600)} y={1690} fontFamily="Montserrat" fontWeight={900} fontSize={54} fill={AMARELO}>MERCADOS NERVOSOS • CENÁRIO HIPOTÉTICO • SEM DADOS REAIS • MERCADOS NERVOSOS •</text>
      </Camera>
    </AbsoluteFill>
  );
};

// ================================================================== CENA 6 — cadeias globais
export const Cena6: React.FC<{ inicio: number }> = ({ inicio }) => {
  const { lf, P } = useCena(inicio);
  const fab = P("fábricas"), pecas = P("peças"), uma = P("Uma");
  if (lf < fab - 2) {
    const desvio = P("alteram");
    return (
      <AbsoluteFill>
        <Camera inicio={inicio} chaves={[[0, 500, 1120, 1.0], [fab, 600, 1100, 1.08]]} deriva={0.4}>
          <Ceu cores={["#3d7bd9", "#8ec5ff", "#d9efff"]} f={lf} nuvens={6} brilho={0.6} />
          <Mar f={lf} yH={1150} cores={["#1f6fae", "#0c3a66"]} brilho="#bfe4ff" />
          <g transform={`translate(${380 + lf * 2} 1310) scale(0.72)`}><Cargueiro f={lf} /></g>
        </Camera>
        <Sobre>
          <g transform={`translate(780 520) scale(${eback(ramp(lf, 4, 14))})`}>
            <circle r={250} fill="#0b1224" stroke={AMARELO} strokeWidth={6} />
            <Globo id="g6a" cx={0} cy={0} r={230} lon0={112} lat0={12} grade={false}
              rotas={[
                { de: LUGARES.xangai, para: LUGARES.singapura, cor: VERMELHO, inicio: 6, dur: 16, altura: 0.02, largura: 6 },
                { de: LUGARES.xangai, para: [128, 10], cor: AMARELO, inicio: desvio, dur: 14, altura: 0.03, largura: 6, tracejada: true },
                { de: [128, 10], para: LUGARES.singapura, cor: AMARELO, inicio: desvio + 12, dur: 14, altura: 0.03, largura: 6, tracejada: true },
              ]} />
            {lf >= desvio && <g transform={`translate(-48 -6) scale(${eback(ramp(lf, desvio, desvio + 8))})`}><path d="M -26,-26 L 26,26 M 26,-26 L -26,26" stroke={VERMELHO} strokeWidth={14} strokeLinecap="round" /></g>}
            <Txt x={0} y={300} t="ROTA ALTERADA" s={44} c={AMARELO} />
          </g>
          <Selo f={lf} em={2} texto="COMÉRCIO GLOBAL" y={1000} />
        </Sobre>
      </AbsoluteFill>
    );
  }
  if (lf < pecas - 2) {
    return (
      <AbsoluteFill>
        <Camera inicio={inicio} chaves={[[fab - 2, 560, 600, 1.0], [pecas, 560, 560, 1.15]]} deriva={0.6} mundo={[1080, 1920]}>
          <g transform="translate(0 500)"><Fabrica f={lf} paraEm={P("atrasam") + 2} /></g>
        </Camera>
      </AbsoluteFill>
    );
  }
  if (lf < uma - 2) {
    return (
      <AbsoluteFill style={{ backgroundColor: "#0e3b26" }}>
        <Camera inicio={inicio} chaves={[[pecas - 2, 0, 0, 0.9], [uma, 60, 0, 1.25]]} deriva={0.5} mundo={[1080, 1920]}>
          <PlacaChips f={lf} vaziosEm={P("faltar") - 6} />
        </Camera>
        <Sobre>
          {lf >= P("faltar") - 4 && <g transform={`translate(540 1500) scale(${eback(ramp(lf, P("faltar") - 4, P("faltar") + 4))})`}>
            <rect x={-360} y={-60} width={720} height={110} rx={20} fill={AMARELO} stroke={TINTA} strokeWidth={7} />
            <Txt x={0} y={20} t="PEÇAS EM FALTA?" s={64} c={TINTA} fonte="Anton" peso={400} contorno={0} />
          </g>}
        </Sobre>
      </AbsoluteFill>
    );
  }
  const origem: LL = LUGARES.xangai;
  const destinos: LL[] = [[-46.6, -23.5], [4.4, 51.9], [-118, 34], [-74, 40.7], [31, 30], [151, -33.9], [55, 25], [77, 19], [18.4, -33.9]];
  return (
    <AbsoluteFill style={{ backgroundColor: "#050816" }}>
      <Sobre>
        <Particulas tipo="brilhos" n={50} seed={6} cor="#fff" opacidade={0.4} />
        <Globo id="g6b" cx={540} cy={1000} r={chaves(lf, [[uma - 2, 820], [uma + 60, 560]], eio)} lon0={chaves(lf, [[uma - 2, 115], [uma + 90, 50]], eio)} lat0={15}
          destaques={{ china: "#c94b4b" }}
          rotas={destinos.map((d, i) => ({ de: origem, para: d, cor: i % 2 ? AMARELO : "#ff8c1a", inicio: P("bagunçaria") - 10 + i * 5, dur: 22, altura: 0.18, largura: 6 }))}
          alertas={[{ ll: LUGARES.pacificoOeste, inicio: P("guerra") - 2, cor: VERMELHO, tamanho: 1.4 }]} />
        <Selo f={lf} em={P("bagunçaria")} texto="O EFEITO SE ESPALHA" y={330} />
      </Sobre>
    </AbsoluteFill>
  );
};

// ================================================================== CENA 7 — e o Brasil?
export const Cena7: React.FC<{ inicio: number }> = ({ inicio }) => {
  const { lf, P } = useCena(inicio);
  const mesmo = P("Mesmo"), dolar = P("Dólar"), comb = P("combustível"), import_ = P("importados"), preco = P("preço");
  if (lf < mesmo - 2) {
    const lon0 = chaves(lf, [[0, 115], [mesmo - 4, -52]], eio), lat0 = chaves(lf, [[0, 25], [mesmo - 4, -13]], eio);
    return (
      <AbsoluteFill style={{ backgroundColor: "#050816" }}>
        <Sobre>
          <Particulas tipo="brilhos" n={50} seed={7} cor="#fff" opacidade={0.4} />
          <Globo id="g7" cx={540} cy={1000} r={chaves(lf, [[0, 600], [mesmo - 4, 950]], eio)} lon0={lon0} lat0={lat0} destaques={{ brasil: "#1f9d55" }}
            rotulos={[{ ll: [-52, -10], texto: "BRASIL", cor: AMARELO, inicio: P("Brasil") - 2, dy: 0, tamanho: 72 }]} />
          <Selo f={lf} em={P("Brasil") - 6} texto="E NO BRASIL?" y={330} />
        </Sobre>
      </AbsoluteFill>
    );
  }
  if (lf < comb - 2) {
    const para = P("sentiríamos") - 10;
    const xLeo = chaves(lf, [[mesmo, 140], [para, 470]], (t) => t);
    return (
      <AbsoluteFill>
        <Camera inicio={inicio} chaves={[[mesmo - 2, 540, 1150, 1.05], [para, 520, 1080, 1.25], [comb, 520, 1060, 1.3]]} deriva={0.5}>
          <g transform="translate(0 -60)"><CidadeFundo f={lf} estilo="brasil" noite={false} /></g>
          {/* ônibus passando */}
          <g transform={`translate(${1500 - lf * 9} 1330)`}>
            <rect x={-260} y={-200} width={520} height={200} rx={30} fill="#f2b134" stroke={TINTA} strokeWidth={8} />
            {[0, 1, 2, 3].map((i) => <rect key={i} x={-230 + i * 120} y={-170} width={100} height={80} rx={10} fill="#bfe3ff" stroke={TINTA} strokeWidth={5} />)}
            {[-160, 160].map((x) => <circle key={x} cx={x} cy={0} r={40} fill="#1d1f28" stroke={TINTA} strokeWidth={6} />)}
          </g>
          <rect x={-600} y={1380} width={2300} height={40} fill="#c9c2b5" />
          <Personagem id="leo-rua" x={xLeo} y={1640} escala={1.1} visual={LEO} estilo={EST}
            pose={poseEm(lf, [[0, (x) => andando(x, 1.7, 3)], [para, (x) => olhandoCelular(x, 3, 0.3)]], 8)}
            expr={exprEm(lf, [[0, "neutro"], [para + 6, "desconfiado"]])} olhosAbertos={piscar(lf, 3)}
            itemD={lf >= para - 4 ? <CelularMao f={lf} tela={<TelaGrafico f={lf} em={para} titulo="DÓLAR" />} /> : undefined} />
        </Camera>
        {lf >= dolar - 10 && (
          <Sobre>
            <g transform={`translate(800 820) rotate(6) scale(${0.95 * eback(ramp(lf, dolar - 10, dolar - 2))})`}>
              <Celular f={lf} luz={1}><TelaGrafico f={lf} em={dolar - 34} titulo="DÓLAR (ilustrativo)" /></Celular>
            </g>
          </Sobre>
        )}
      </AbsoluteFill>
    );
  }
  if (lf < import_ - 6) {
    return (
      <AbsoluteFill>
        <Camera inicio={inicio} chaves={[[comb - 2, 560, 900, 1.0], [import_, 600, 860, 1.12]]} deriva={0.6}>
          <Ceu cores={["#3d7bd9", "#8ec5ff", "#ffd59e"]} f={lf} nuvens={5} brilho={0.6} />
          <rect x={-600} y={1100} width={2300} height={900} fill="#8a8f99" />
          <g transform="translate(40 420) scale(0.88)"><Posto f={lf} sobeEm={comb + 4} /></g>
        </Camera>
        <Sobre><Selo f={lf} em={comb} texto="COMBUSTÍVEL" y={330} fundo={VERMELHO} cor="#fff" tam={66} /></Sobre>
      </AbsoluteFill>
    );
  }
  if (lf < preco + 2) {
    return (
      <AbsoluteFill>
        <Camera inicio={inicio} chaves={[[import_ - 6, 540, 900, 1.0], [preco + 2, 520, 860, 1.15]]} deriva={0.6}>
          <Mercado f={lf} sobeEm={import_ - 2} />
        </Camera>
        <Sobre><Selo f={lf} em={import_} texto="IMPORTADOS" y={330} fundo={VERMELHO} cor="#fff" tam={66} /></Sobre>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <Camera inicio={inicio} chaves={[[preco + 2, 540, 980, 1.7], [preco + 40, 540, 960, 1.95]]} deriva={1}>
        <g transform="translate(0 -60)"><CidadeFundo f={lf} estilo="brasil" noite={false} /></g>
        <Personagem id="leo-rua2" x={540} y={1640} escala={1.1} visual={LEO} estilo={EST}
          pose={{ ...olhandoCelular(lf, 3, 0), olhar: [0, 0.1], cabecaIncl: -5 }} expr={EXPRESSOES.triste} olhosAbertos={piscar(lf, 3)}
          itemD={<CelularMao f={lf} tela={<TelaGrafico f={lf} em={-99} titulo="PREÇOS" />} />} />
      </Camera>
    </AbsoluteFill>
  );
};

// ================================================================== CENA 8 — exportações, portos e empregos
export const Cena8: React.FC<{ inicio: number }> = ({ inicio }) => {
  const { lf, P } = useCena(inicio);
  const se = P("Se"), trava = P("travasse"), agro = P("agronegócio");
  if (lf < se - 2) {
    return (
      <AbsoluteFill style={{ backgroundColor: "#050816" }}>
        <Sobre>
          <Particulas tipo="brilhos" n={50} seed={8} cor="#fff" opacidade={0.4} />
          <Globo id="g8" cx={540} cy={980} r={560} lon0={chaves(lf, [[0, -20], [se, 30]], eio)} lat0={5}
            destaques={{ brasil: "#1f9d55", china: "#c94b4b" }}
            rotas={[{ de: LUGARES.santos, para: LUGARES.xangai, cor: AMARELO, inicio: P("China") - 4, dur: 40, altura: 0.35, largura: 9 }]}
            rotulos={[{ ll: [-50, -10], texto: "BRASIL", inicio: 0, dy: 0, tamanho: 46 }, { ll: [105, 34], texto: "CHINA", inicio: P("China"), dy: 0, tamanho: 46 }]} />
          {lf >= P("muitos") - 2 && (
            <g transform={`translate(540 1620) scale(${eback(ramp(lf, P("muitos") - 2, P("muitos") + 6))})`}>
              <rect x={-470} y={-110} width={940} height={210} rx={24} fill="#0f1830" stroke={AMARELO} strokeWidth={5} opacity={0.95} />
              <Txt x={0} y={-30} t="QUASE 3 EM CADA 10 DÓLARES" s={50} c={AMARELO} />
              <Txt x={0} y={22} t="exportados pelo Brasil em 2025 foram para a China" s={28} c="#fff" peso={700} />
              <Txt x={0} y={66} t="Fonte: MDIC/Secex (≈ 28,7%)" s={24} c="#9fb3d8" peso={700} />
            </g>
          )}
        </Sobre>
      </AbsoluteFill>
    );
  }
  if (lf < agro - 3) {
    const congela = lf >= trava ? trava : lf;
    return (
      <AbsoluteFill>
        <Camera inicio={inicio} chaves={[[se - 2, 560, 1050, 1.0], [trava, 580, 1060, 1.12], [agro, 540, 1100, 1.22]]} deriva={0.5} tremores={[trava + 2]} forcaTremor={8}>
          <Ceu cores={["#5b8fd9", "#a9d4ff", "#ffe2b8"]} f={lf} nuvens={5} brilho={0.6} />
          <Mar f={lf} yH={1180} cores={["#2a6fa6", "#0f3d66"]} brilho="#d6efff" />
          <g transform="translate(-60 1230) scale(0.55)"><Cargueiro f={0} /></g>
          <g transform="translate(160 1180) scale(0.95)"><Guindaste f={congela} /></g>
          <g transform="translate(720 1180) scale(0.85)"><Guindaste f={congela} fase={60} cor="#e4572e" /></g>
          <rect x={-600} y={1250} width={2300} height={900} fill="#8b8f9a" />
          {Array.from({ length: 6 }, (_, i) => <Conteiner key={i} x={-80 + i * 170} y={1300 - (i % 2) * 64} cor={["#e4572e", "#2e86ab", "#f3a712", "#4c956c"][i % 4]} />)}
          <g transform={`translate(${chaves(lf, [[se, 1500], [trava, 900]], eout)} 1560) scale(0.9)`}><Caminhao f={congela} /></g>
          <Personagem id="trabalhadora" x={330} y={1820} escala={1.08} visual={TRABALHADORA} estilo={EST}
            pose={poseEm(lf, [[0, (x) => olhandoCelular(x, 51, 0.2)], [trava + 4, (x) => ({ ...olhandoCelular(x, 51, 0.1), cabecaIncl: -8 })]], 6)}
            expr={exprEm(lf, [[0, "neutro"], [trava + 2, "medo"]])} olhosAbertos={piscar(lf, 51)}
            itemD={
              <g transform="translate(0 -30) rotate(-6)">
                <rect x={-70} y={-95} width={140} height={190} rx={14} fill="#1b1d29" stroke={TINTA} strokeWidth={6} />
                <rect x={-58} y={-82} width={116} height={164} rx={8} fill={lf >= trava ? "#3b0d12" : "#123522"} />
                <text x={0} y={8} textAnchor="middle" fontFamily="Anton" fontSize={34} fill={lf >= trava ? VERMELHO : "#39e07a"}>{lf >= trava ? "ATRASO" : "OK"}</text>
              </g>
            } />
          {/* capacete de segurança desenhado por cima da cabeça */}
        </Camera>
        <Sobre><Selo f={lf} em={trava - 2} texto="EXPORTAÇÕES EM RISCO" y={330} fundo={VERMELHO} cor="#fff" /></Sobre>
      </AbsoluteFill>
    );
  }
  const tiles: { nome: string; em: number; el: React.ReactNode }[] = [
    { nome: "AGRO", em: agro - 2, el: <g transform="translate(-540 -900) scale(1)"><Plantacao f={lf} para={lf > agro + 20} /></g> },
    { nome: "MINERAÇÃO", em: P("mineração") - 2, el: <g><rect x={-600} y={-600} width={1300} height={1200} fill="#c98e62" /><path d="M -600,40 L -200,-220 L 100,-80 L 400,-260 L 700,40 Z" fill="#8b3a2b" stroke={TINTA} strokeWidth={8} /><g transform="translate(-540 100)"><TremMinerio f={lf} vel={lf > P("portos") ? 0.5 : 4} /></g></g> },
    { nome: "PORTOS", em: P("portos") - 2, el: <g><rect x={-600} y={-600} width={1300} height={1200} fill="#8ec5ff" /><rect x={-600} y={180} width={1300} height={500} fill="#2a6fa6" /><g transform="translate(-160 200) scale(0.8)"><Guindaste f={trava} /></g></g> },
    { nome: "EMPREGOS", em: P("empregos") - 2, el: <g><rect x={-600} y={-600} width={1300} height={1200} fill="#e9e3d6" /><g transform="translate(-30 30)"><Personagem id="trab2" x={0} y={560} escala={1.1} visual={TRABALHADORA} estilo={EST} pose={{ ...pensando(lf, 52), olhar: [0.3, -0.4] }} expr={EXPRESSOES.triste} olhosAbertos={piscar(lf, 52)} /></g></g> },
  ];
  return (
    <AbsoluteFill style={{ backgroundColor: "#0b1020" }}>
      <Sobre>
        {tiles.map((t, i) => {
          const x = i % 2 ? 810 : 270, y = i < 2 ? 640 : 1220, s = eback(ramp(lf, t.em, t.em + 8));
          if (lf < t.em) return null;
          return (
            <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
              <clipPath id={`tile${i}`}><rect x={-255} y={-270} width={510} height={540} rx={26} /></clipPath>
              <g clipPath={`url(#tile${i})`}><g transform="scale(0.45)">{t.el}</g></g>
              <rect x={-255} y={-270} width={510} height={540} rx={26} fill="none" stroke={TINTA} strokeWidth={10} />
              <g transform="translate(0 225)"><rect x={-200} y={-42} width={400} height={70} rx={14} fill={AMARELO} stroke={TINTA} strokeWidth={6} /><Txt x={0} y={10} t={t.nome} s={44} c={TINTA} fonte="Anton" peso={400} contorno={0} /></g>
            </g>
          );
        })}
        <g transform="translate(540 1620)">
          <rect x={-470} y={-50} width={940} height={96} rx={20} fill="#0f1830" stroke={AMARELO} strokeWidth={4} opacity={0.92} />
          <Txt x={0} y={14} t="impacto dependeria da duração e intensidade da crise" s={28} c="#fff" peso={800} />
        </g>
        <Selo f={lf} em={0} texto="EXPORTAÇÕES EM RISCO" y={300} fundo={VERMELHO} cor="#fff" tam={64} />
      </Sobre>
    </AbsoluteFill>
  );
};
