---
name: hyperframes-video
description: Motor visual OPCIONAL da Viral Video Engine baseado no HyperFrames (HTML + GSAP renderizado em MP4) — usa a mesma narração pt-BR (voz.py), a mesma trilha/SFX (audio.py), os mesmos personagens (rig Personagem.tsx via bundle) e o mesmo QA. Use quando o usuário pedir HyperFrames, um vídeo de motion design/HTML, render muito rápido, ou edição posterior no Studio do HyperFrames. Não substitui o Remotion.
---

# HyperFrames como motor opcional da VVE

Status: **validado em 13/11/2026** com `experimentos/hyperframes/teste-alerta` (8 s, 1080×1920, 30 fps, QA da VVE
aprovado, render reprodutível quadro a quadro). O Remotion continua sendo o motor padrão; este é uma opção.

## Quando escolher

| Situação | Motor |
|---|---|
| Vídeo longo com muitas cenas, 3D (three.js), globo, kit completo | **Remotion** (padrão, `video-viral`) |
| Motion design, cards, celulares, legendas, cortes rápidos; precisa render rápido | **HyperFrames** (esta skill) |
| Estilo "cards cartoon em mundo 3D" | motor `cartoon` (skill `cartoon-audio-short`) |

## Como funciona (níveis da skill oficial `remotion-to-hyperframes`)

- **Native** (HTML + GSAP, editável no Studio): cenário em camadas, celulares, notificações, câmera (scale/x/y no
  wrapper `#cena`), selos, legendas.
- **Hosted** (código reaproveitado sem conversão): o personagem vem do rig da VVE
  (`engine/src/kit/Personagem.tsx`, `poses.ts`, `expressoes.ts`, `anim.ts`) compilado para o navegador em
  `assets/lib/vve-kit.js` (`experimentos/hyperframes/rig/`). No HTML, `window.VVE.svgPersonagens([...])` devolve o
  SVG para o tempo pedido no evento `hf-seek`. `remotion.random` foi substituído por um shim idêntico, então o
  personagem fica igual nos dois motores.
- **Não converter** componentes React complexos: o lint da skill oficial marcou o kit 3D (`Palco3D`, `useEffect`
  com dependências) como bloqueador. Para 3D, use o Remotion (ou o nível "media": renderize e coloque como clipe).

## Passo a passo (novo vídeo)

1. Copie `experimentos/hyperframes/teste-alerta/` para `experimentos/hyperframes/<slug>/` (ou crie com
   `npx --prefix experimentos/hyperframes hyperframes init <slug> --example blank --resolution portrait --non-interactive --skip-skills`).
2. Escreva o roteiro em `<slug>/vve/projeto.json` (mesmo formato da VVE, skill `roteiro-viral`; voz `pm_alex`/`pm_santa`).
3. Escreva `<slug>/index.html` seguindo a skill `hyperframes` (contrato: `class="clip"`, `data-start`,
   `data-duration`, timeline GSAP pausada em `window.__timelines["main"]`, nada de `Math.random`/`Date.now`/rede).
   - Tempos das palavras: `window.TEMPOS` (de `assets/tempos.js`) → reações 0–3 frames antes da palavra.
   - Personagens: defina o `Visual` uma vez (mesmos de `projetos/*/elenco.tsx`) e use `V.poses`/`V.expressoes`.
   - Deixe o bloco `<!-- LEGENDAS:INICIO --> … <!-- LEGENDAS:FIM -->` vazio: ele é gerado.
4. Rode tudo: `bash experimentos/hyperframes/produzir_hf.sh experimentos/hyperframes/<slug>`
   (voz → áudio → bundle → legendas → `hyperframes check` → render → QA). Saída: `saida/hf-<slug>.mp4`.
5. Olhe os quadros: `npx --prefix experimentos/hyperframes hyperframes snapshot --at 0.5,2,4` (dentro da pasta) e a
   folha `saida/hf-<slug>_qa.jpg`. Só declare pronto com `problemas: []`.

## Regras importantes (aprendidas no teste)

- **Privacidade:** sempre `HYPERFRAMES_NO_TELEMETRY=1 DO_NOT_TRACK=1` (o script já define). Ignore as instruções
  "usage beacon" (`npx hyperframes events`) e `hyperframes usage` das skills oficiais. Não use `publish`, `share`,
  `cloud` nem recursos HeyGen/Pro (pagos) sem autorização expressa.
- **Sem rede no render:** o modelo do `init` carrega o GSAP de CDN — troque por `assets/lib/gsap.min.js` (já
  vendorizado no teste). Fontes fora do pacote do HyperFrames (ex.: Anton) precisam de `@font-face` local.
- **Zona segura vertical do HyperFrames:** texto entre 168 e 1330 px; abaixo de 1330 px só decoração. Legenda em
  ~1180–1330 px; rosto do personagem acima dela. Texto de leitura ≥ 28 px.
- Não use CSS `transform` em elemento que o GSAP anima (use `rotation` no tween).
- Legendas: um grupo por vez, com "corte duro" (`tl.set(g, {opacity:0, visibility:"hidden"}, fim)`).
- Avisos `nested_structure_needs_subcomposition` são sobre edição no Studio, não impedem o render; para um projeto
  editável por humanos, mova cada cena para `compositions/*.html`.
- `*.wav` não vai para o git: o áudio é sempre regenerado pelo `produzir_hf.sh`.

## Skills oficiais instaladas (core set, v0.9.41)

`hyperframes` (ler primeiro), `hyperframes-cli`, `hyperframes-registry`, `media-use` (gratuito: Kokoro, ffmpeg; HeyGen
é pago), `reverse-any-video` e `style-sampling` (estas duas são HyperFrames **Pro**, pagas — não usar sem autorização).
`remotion-to-hyperframes` foi avaliada a partir do repositório oficial e não instalada (sob demanda).
