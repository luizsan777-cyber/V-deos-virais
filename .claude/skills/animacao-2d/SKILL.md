---
name: animacao-2d
description: Como animar no MODO 2D do Viral Video Engine (terror, suspense, histórias bíblicas, contos, curiosidades) — personagem articulado em SVG com expressões, poses, lip-sync, cenários ilustrados, câmera, efeitos e legendas. Use ao escrever o Video.tsx de um vídeo 2D.
---

# Animação 2D (kit em `engine/src/kit/`)

Exemplo completo e testado: `projetos/teste-corpo-brilha/Video.tsx`.

## Peças

- `tempo.tsx` → `useTempos()`: `T.palavra("x")`, `T.fala("id").ini/.fim`, `T.sfx("impacto")`, `T.boca(f)`,
  `T.falando(f)`, `T.total`. Tudo em frames (30 fps).
- `Personagem.tsx` → `<Personagem id x y escala dir visual estilo pose expr olhosAbertos boca brilhoCorpo />`
  - `Visual`: pele, cabelo (`curto|topete|cacheado|longo|careca|coque|veu|rabo|espetado`), corCabelo,
    roupa (`camiseta|moletom|jaleco|tunica|manto|vestido|terno|regata`), cor, cor2, calca, sapato,
    barba (`curta|longa|bigode`), corpo (`magro|medio|forte|crianca|idoso`), oculos.
  - `estilo`: `ESTILOS_PERSONAGEM.conto|terror|biblico|flat|noite` (contorno, sombra cel, luz de recorte).
  - Altura ≈ 640 unidades × escala; origem nos pés. Para personagem ocupar bem a tela vertical use escala
    1.1–1.4 e câmera com zoom 1.3–2.0 no rosto/corpo.
- `poses.ts`: `parado, falando, andando, correndo, apontando, surpreso, comMedo, bracosAoAlto, orando,
  pensando, encolhendoOmbros, olhandoMao`; `poseEm(f, [[frame, fn], …])` faz transições suaves.
  Pose própria: `{...parado(f), bracoD: [ângulo, dobra], frenteD: true, maoD: "aponta"}`.
- `expressoes.ts`: `neutro, feliz, empolgado, surpreso, medo, triste, bravo, pensativo, desconfiado, sereno,
  maravilhado, horrorizado`; `exprEm(f, [[frame, "nome"], …])`.
- `anim.ts`: `ramp, eio, eout, eback, mola, chaves, wobble, ruido, piscar, tremor`.
- `Camera.tsx`: `<Camera chaves={[[frame, cx, cy, zoom, rot?], …]} tremores={[frames]} deriva mao>` —
  mundo 1080×1920 (chão em y≈1500).
- `cenarios2d.tsx`: `QuartoNoturno`, `FlorestaSombria`, `DesertoEntardecer` (com `luz` 0..1). Para outros
  lugares, desenhe um cenário novo NO PRÓPRIO Video.tsx (camadas: céu → fundo → meio → chão → frente),
  com algum elemento animado (nuvem, chama, folhas, névoa).
- `efeitos.tsx`: `Particulas (poeira|brasas|vagalumes|neve|chuva|brilhos)`, `Vinheta`, `Granulacao`, `Flash`,
  `Relampago`, `Fade`, `RaiosDeLuz`, `TextoPop`.
- `Legendas.tsx`: `<Legendas estilo="impacto|moderno|biblico|terror" />` — sempre a última camada.

## Receita por gênero

- **Terror/suspense**: `ESTILOS_PERSONAGEM.terror`, FlorestaSombria ou cenário escuro próprio, `Granulacao 0.08`,
  `Vinheta 0.7`, `Relampago` nos sustos + sfx `trovao`, câmera com `mao={0.6}`, cortes secos, música `terror`.
  O "monstro" aparece pouco e em silhueta; susto = corte + flash + impacto.
- **Bíblico**: `ESTILOS_PERSONAGEM.biblico`, túnica/manto/véu, barba, DesertoEntardecer, `RaiosDeLuz`,
  legenda `biblico`, música `biblico`, movimentos de câmera lentos e solenes. Nada caricato em figuras sagradas.
- **Contos/curiosidades**: `conto` ou `flat`, cores saturadas, mais gestos (`falando` com energia 0.8+),
  TextoPop em números, efeitos `pop/whoosh/ding`.

## Regras

- Cada personagem com `id` único na cena; `visual` definido uma vez no topo do arquivo.
- Lip-sync só para quem está falando: `boca={T.falando(f) ? T.boca(f) : 0}`.
- Algo muda a cada 2–4 s. Câmera nunca parada (deriva padrão 0.6 %/s já ativa).
- Cenas diferentes: `<Sequence from durationInFrames>` com transição (Flash curto ou whoosh + movimento).
- Conferir nos stills: rosto visível e grande, texto não cobre rosto, contraste do personagem com o fundo.
