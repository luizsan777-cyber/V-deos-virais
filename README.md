# 🎬 Viral Video Engine — vídeos virais 2D e 3D com narração brasileira

Sistema para criar vídeos verticais inéditos (YouTube Shorts, TikTok, Reels, Facebook) a partir de um tema:
roteiro original, narração em português brasileiro, personagens e cenários animados, legendas, trilha,
efeitos sonoros e MP4 final 1080×1920 30 fps — tudo gerado por código, sem serviços pagos.

## Como usar pelo celular

No Claude Code (app ou claude.ai/code), com este repositório aberto, peça:

> Crie um vídeo de 70 segundos sobre o que aconteceria se a Terra parasse, com animação 3D e narração brasileira informal.

O Claude segue a skill `video-viral`: pesquisa os fatos, escreve o roteiro, gera a voz, anima, renderiza,
confere a qualidade e te envia o MP4 na conversa.

Para vídeos longos, ele pode só preparar o projeto e deixar o **GitHub Actions** renderizar:
o vídeo aparece na aba **Releases** do repositório (toque no `.mp4` para baixar no celular).

Outros exemplos de pedido:
- "Faz um short de terror de 45 s sobre uma lenda urbana brasileira, estilo 2D sombrio."
- "Vídeo bíblico de 60 s sobre Davi e Golias, narração respeitosa."
- "Explica por que o céu é azul em 40 s, modo explicativo com quadro-negro."

## Modos

| Modo | Para quê | Como é feito |
|---|---|---|
| **2D** | terror, suspense, bíblico, contos, curiosidades | personagens SVG articulados (expressões, poses, lip-sync), cenários ilustrados em camadas, câmera 2D |
| **3D** | ciência, universo, história, engenharia | three.js: planetas procedurais, terreno, casas, prédios toon com contorno, luz e sombra, câmera 3D; personagens 2D projetados no mundo |
| **Explicativo** | experimentos, fenômenos, "como funciona" | diagramas que se desenham, setas, contadores, gráficos, apresentador apontando |

## Estrutura

```
.claude/skills/        skills do Claude (video-viral, roteiro-viral, voz-ptbr, animacao-2d/3d/explicativa)
engine/                motor de animação (Remotion + React + three.js) e kit reutilizável (engine/src/kit)
ferramentas/           Python: voz.py (narração pt-BR), audio.py (trilha/SFX/mix), produzir.py, qa.py
projetos/<slug>/       um vídeo = projeto.json (roteiro, voz, efeitos) + Video.tsx (animação)
.github/workflows/     renderizar.yml (MP4 → Release) e amostras-voz.yml (comparar motores de voz)
referencias/terceiros/ código MIT original dos repositórios estudados (com licenças)
docs/                  ANALISE.md (licenças, viabilidade), estilos-usados.md (para não repetir estilo)
```

## Rodar localmente / na nuvem

```bash
pip install -r requirements.txt
cd engine && npm ci && cd ..
python3 ferramentas/produzir.py projetos/teste-corpo-brilha       # gera saida/teste-corpo-brilha.mp4
python3 ferramentas/produzir.py projetos/teste-corpo-brilha --etapas none --stills 30,120 --escala 0.5  # só quadros
```

Requisitos: Python 3.10+, Node 18+, ffmpeg, Chromium (o Remotion baixa sozinho se não houver).

## Narração

Padrão: **Kokoro** (open source, Apache-2.0, roda em CPU, vozes pt-BR `pm_alex`, `pm_santa`, `pf_dora`).
Também implementados: Piper, Chatterbox Multilingual (com voz de referência autorizada), Qwen3-TTS e edge-tts —
estes rodam no GitHub Actions. Rode **Actions → Amostras de voz → Run workflow** para ouvir todos e escolher.
Detalhes e voz personalizada: `.claude/skills/voz-ptbr/SKILL.md`.

## Licenças

Código deste repositório: ainda sem licença definida (escolha a sua). Remotion tem licença própria (grátis para pessoa física e empresas até 3 pessoas).
Trilhas e efeitos sonoros são sintetizados em código (originais). Fontes: OFL (via @fontsource).
Análise completa dos repositórios de referência em `docs/ANALISE.md`.

## Motor 2D adicional: cartoon-audio-short (skill do Drive)

Integrado ao pipeline em 12/11/2026 e validado com um MP4 de teste (`projetos/teste-cartoon-vigia`, QA aprovado).
Use `"motor": "cartoon"` no `projeto.json`: o kit desenha os quadros (three.js + personagens em cards) e o
Remotion aplica as legendas pt-BR e exporta. Preparação: `python scripts/bootstrap_cartoon.py` e
`python scripts/check_environment.py`. As peças que faltavam no ZIP (three.js r160, `toon.ts`, `mix.py`) estão em
`.claude/skills/cartoon-audio-short/kit-extra/` (MIT) e são aplicadas pelo bootstrap sem alterar o ZIP.
