# Análise dos repositórios de referência e do ambiente

Data: 12/11/2026. Ambiente analisado: Claude Code na nuvem (container Linux, 4 vCPU, 15 GB RAM, **sem GPU**),
rede limitada (registros npm/PyPI e GitHub liberados; Hugging Face, Google Fonts, Bing e Blender bloqueados).

## 1. Os quatro repositórios

| Repositório | Licença | O que é | Dependências | Funciona aqui? | Decisão |
|---|---|---|---|---|---|
| [deenukhan/story-animator](https://github.com/deenukhan/story-animator) | MIT | Skill de contos animados 2D em SVG com Remotion; câmera, rosto com piscada, legendas, mix | Remotion, Node, ffmpeg, Python; **voz via ElevenLabs** (pago para uso comercial) | Parcial: Remotion sim, ElevenLabs não (pago + conector) | **Integrado**: ideias de câmera em log-zoom, piscar com semente, "wobble" e mix com voz no topo foram reescritas no nosso kit. Original preservado em `referencias/terceiros/story-animator/`. |
| [a252937166/claude-video-studio](https://github.com/a252937166/claude-video-studio) | MIT | Skill de MVs pixel/flat em HTML+GSAP renderizado pelo **HyperFrames (HeyGen)**; muita ferramenta de edição de vídeo real em chinês; 2D via Kling (pago) | HyperFrames CLI, Chrome, FunASR, mediapipe, Kling/Veo (pagos) | Parcial: scripts de QA sim; motor HyperFrames e Kling não usados | **Referência**: o checklist de QA (quadros pretos, folha de conferência) inspirou `ferramentas/qa.py`. Original em `referencias/terceiros/claude-video-studio/`. |
| [mromidev/claude-animated-shorts](https://github.com/mromidev/claude-animated-shorts) | MIT (código). Os 1.238 frames de referência são de um canal privado, "só para estudo" | Shorts 55–70 s: personagens 2D em mundo 3D (three.js dentro do Remotion), tinta, lens blur, SFX e trilha sintetizados | Remotion + @remotion/three, three.js, modelos Kenney (não incluídos) | Sim, o conceito (WebGL por software funciona) | **Integrado**: o conceito "2D em mundo 3D" e a síntese de som em código. Código original (sem os frames privados) em `referencias/terceiros/claude-animated-shorts/`. |
| [bp-abe/skills-video](https://github.com/bp-abe/skills-video) | **Sem arquivo de licença** (= todos os direitos reservados) | Skills em português: produção completa com Remotion, Gemini TTS/VoxCPM/Kokoro, trilha MIDI, crítico independente | Remotion, Gemini (cota grátis pequena), VoxCPM (10–13 GB RAM), FluidSynth, VSCO2 | Não copiado | **Só referência de ideias**: não copiamos código nem textos. Os SFX Kenney que ele traz são CC0, mas preferimos sintetizar os nossos (100% originais). |

## 2. Motor de animação escolhido

**Remotion 4 (React) + SVG para 2D/explicativo + three.js (@remotion/three) para 3D**, renderizado em
Chromium headless. Três dos quatro repositórios usam Remotion; roda em CPU; é determinístico (cada quadro é uma
função do número do frame). Licença Remotion: grátis para pessoas físicas e empresas com até 3 pessoas
([remotion.dev/license](https://www.remotion.dev/license)).

## 3. Narração pt-BR — viabilidade

| Motor | Licença | pt-BR | Roda aqui (sem GPU, sem HF)? | Roda no GitHub Actions? | Situação |
|---|---|---|---|---|---|
| **Kokoro v1.0 (ONNX)** | Apache-2.0 | Sim (`pm_alex`, `pm_santa`, `pf_dora`), fonemas espeak pt-BR conferidos (`leite → leitʃi`, `de → dʒi`) | **Sim**, ~4× mais rápido que tempo real | Sim | **Padrão atual**, usado nos vídeos-teste |
| Piper (`pt_BR-faber-medium`) | MIT | Sim | Não (modelo no Hugging Face) | Sim | Implementado; testar com o workflow de amostras |
| Chatterbox Multilingual | MIT | Português (sotaque segue a referência) | Não (pesos no HF, torch pesado) | Sim, lento em CPU | Implementado; **único com clonagem de voz** |
| Qwen3-TTS | Apache-2.0 | Português, aceita instrução de estilo | Não (pesos no HF) | Possível, lento em CPU (1,7B) | Implementado (experimental) |
| Voicebox | MIT | Usa Qwen3-TTS | **Não**: é aplicativo de desktop (interface gráfica), não serve para servidor | Não | Descartado; o motor que ele usa (Qwen3-TTS) está integrado direto |
| edge-tts (vozes neurais Microsoft) | Biblioteca LGPL; serviço Microsoft gratuito **não oficial** | Sim, muito natural (Antonio, Francisca, Thalita) | Não (host bloqueado) | Sim | Implementado como opção; termos de uso comercial incertos — use por sua conta |

Vozes inglesas e de Portugal **são recusadas pelo código** (`voz.py` só aceita vozes pt-BR).

## 4. O que não funciona / limites

- Sem GPU: 3D e motores de voz grandes ficam lentos (render 2D ≈ 1,5 fps em 1080×1920 com 4 núcleos).
- Hugging Face bloqueado neste container: Piper, Chatterbox e Qwen3 só rodam no GitHub Actions (ou liberando
  `huggingface.co` na rede do ambiente).
- O roteiro original precisa de um modelo de linguagem: é escrito pelo Claude nesta sessão (o Actions só renderiza).
- Tempo das palavras nas legendas é estimado por sílabas + pausas detectadas (precisão típica ~0,1 s).
  Alinhamento forçado com Whisper pode ser adicionado no Actions.

## 5. Teste real dos motores no GitHub Actions (12/11/2026, runner ubuntu-latest, CPU)

Workflow "Amostras de voz", execução nº 1 — release `amostras-voz-1`. Mesma frase de ~10 s:

| motor | voz | gerou? | tempo de geração | duração do áudio | observação |
|---|---|---|---|---|---|
| kokoro | pm_alex / pm_santa / pf_dora | ✅ | 4 s | 10,5 s | rápido, offline |
| piper | pt_BR-faber-medium | ✅ | 0,4 s | 9,8 s | o mais rápido |
| edge | Antonio / Francisca / Thalita | ✅ | 4–13 s | 10–11 s | serviço online da Microsoft (não oficial) |
| chatterbox | sem referência | ✅ | 98 s (+34 s carregando) | 9,8 s | ~10× mais lento que tempo real; ideal com voz de referência brasileira |
| qwen3 | locutor padrão "Ryan" | ✅ | 96 s (+40 s carregando) | **16,2 s** | ficou 60 % mais longo que os outros (pausas/ritmo lento) — precisa de ajuste |

Qualidade de pronúncia/sotaque: **precisa ser avaliada de ouvido pelo usuário** (as amostras foram enviadas).
