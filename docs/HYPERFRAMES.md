# HyperFrames × Remotion na Viral Video Engine (teste de 13/11/2026)

HyperFrames (HeyGen, Apache-2.0, CLI v0.9.41) foi adicionado como **motor visual opcional**. O Remotion continua
sendo o padrão; nenhum projeto, skill ou vídeo existente foi alterado.

## O que foi instalado / criado

- Core set oficial de skills (instalado com `npx hyperframes skills update` em HOME isolado e copiado só como pastas
  novas): `hyperframes`, `hyperframes-cli`, `hyperframes-registry`, `media-use`, `reverse-any-video`*, `style-sampling`*
  (*recursos HyperFrames Pro, pagos — não usados).
- `experimentos/hyperframes/`: CLI fixado (`package.json`), bundle do rig de personagens (`rig/`), ponte
  `vve_para_hf.py` (tempos.json → legendas no HTML), pipeline `produzir_hf.sh`, projeto de teste `teste-alerta/`.
- Skill `.claude/skills/hyperframes-video/SKILL.md`.

## Dependências (`npx hyperframes doctor`)

Node 22.23 ✓, FFmpeg 6.1 ✓, Chrome do sistema ✓, 4 CPUs/15 GB ✓. Opcionais ausentes e não necessários:
whisper-cpp (transcrição; usamos os tempos do `voz.py`), MusicGen (usamos `audio.py`), Docker.
Telemetria desligada com `HYPERFRAMES_NO_TELEMETRY=1 DO_NOT_TRACK=1`.

## Reaproveitamento do que já existia

| Peça da VVE | Como entrou no HyperFrames |
|---|---|
| Roteiro (`projeto.json`) | igual, em `<projeto>/vve/projeto.json` |
| Narração Kokoro pt-BR (`voz.py`) | `mix.wav` como `<audio>` da composição |
| Trilha + SFX + mix (`audio.py`) | idem (mesmo ducking e −14 LUFS) |
| Tempos das palavras (`tempos.json`) | `assets/tempos.js` (coreografia) + grupos de legenda escritos no HTML |
| Personagem (`Personagem.tsx`, poses, expressões) | **hosted**: bundle `vve-kit.js`, desenhado no `hf-seek` (sem conversão) |
| QA (`qa.py`) | o mesmo, sobre o MP4 do HyperFrames |
| Kit 3D (`Palco3D`) | **não convertido**: o lint da skill `remotion-to-hyperframes` o marcou como bloqueador (`useEffect` com dependências) |

## Avaliação da skill `remotion-to-hyperframes`

`lint_source.py` (da própria skill) sobre o código:
- `engine/src/kit`: 1 bloqueador (3D), 11 avisos (`useMemo`, hook `useTempos`, `delayRender`) → "não traduzir;
  usar runtime interop". Seguido: o rig 2D entrou como *hosted* (reuso integral) em vez de reescrito.
- `projetos/terceira-guerra-mundial`: 0 bloqueadores, 1 aviso (hook `useCena`). Traduzir as 11 cenas seria uma
  reescrita manual grande; não foi feita.

## Resultado do teste (8 s, original)

`saida/hf-teste-alerta.mp4` — H.264 High, yuv420p, 1080×1920, 30 fps, AAC 48 kHz, 8,00 s (vídeo = áudio =
narração), −14,9 LUFS, sem quadros pretos/congelados (`qa.py`). `hyperframes check`: 0 erros, contraste WCAG AA
24/24. Dois renders seguidos: **idênticos quadro a quadro** (mesmo hash nos 240 quadros, SSIM 1,000).

## Comparação

| Critério | Remotion (atual) | HyperFrames (teste) |
|---|---|---|
| Velocidade de render (4 CPUs, sem GPU) | ~1,5 fps (teste 8 s: 168 s; episódio 98 s: 28 min) | **~15–17 fps** (8 s em 13,7–16 s; pipeline completo do zero: 27 s) |
| Fidelidade do personagem | rig original | **idêntica** (mesmo código; ver `docs/comparacao-remotion-hyperframes.jpg`) |
| Sincronização com a voz | `useTempos()` | mesma fonte (`tempos.json` → `window.TEMPOS`); legendas no quadro certo |
| Movimentos | React por frame (tudo calculado por frame) | GSAP (eases, yoyo) + rig por frame; câmera/selos mais simples de escrever |
| Edição posterior | só por código | **Studio/desktop app** do HyperFrames (elementos nativos editáveis) |
| 3D, globo, kit grande | ✓ (three.js, `Globo`) | só "hosted"/"media"; o kit 3D não converte |
| Verificações embutidas | `qa.py` | `check` (layout, contraste, zona segura, tamanho de texto) + `qa.py` |
| Tamanho do arquivo (8 s) | ~13,6 MB (com granulação) | ~5 MB |

**Ressalva sobre o desempenho:** as cenas comparadas não são as mesmas. A do Remotion tinha granulação, partículas e
mais camadas. Parte grande da diferença vem do método de captura do HyperFrames (BeginFrame do Chrome, 2 workers).
Uma medição justa exige a mesma cena nos dois motores.

## Limitações encontradas

- O modelo do `init` busca o GSAP numa CDN (bloqueada aqui e proibida no render): o GSAP foi vendorizado.
- Avisos `nested_structure_needs_subcomposition`: para edição confortável no Studio, cada cena deveria ir para
  `compositions/*.html`. Não impede o render.
- `rotation_pivot_drift` no personagem: as articulações do rig giram em torno das juntas de propósito (falso positivo).
- As skills oficiais pedem para enviar telemetria ("usage beacon") e mostram recursos pagos (HeyGen, Pro, `cloud`,
  `publish`): desligados/ignorados por regra do projeto.
- O workflow do GitHub Actions ainda não renderiza projetos HyperFrames (só `projetos/`); render local no Claude
  Code na nuvem funciona.
