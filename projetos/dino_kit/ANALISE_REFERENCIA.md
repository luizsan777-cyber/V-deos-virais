# Análise da referência — "O dia em que os dinossauros morreram — Minuto a minuto"

Arquivo analisado: MP4 enviado pelo usuário (ZIP `dinossauros_ate_30mb.zip`), **10 min 38 s, 640×360, 24 fps, áudio AAC mono**.
O vídeo original **não** foi copiado para o repositório (direitos do autor). Esta análise só registra características
para inspirar produções originais.

## O que foi usado para analisar
| Ferramenta | O que fez | Limite |
|---|---|---|
| **rea-video** (decompose, modo offline, sem VLM) | 78 cortes, ritmo, textos na tela (OCR), música (BPM/tom), candidatos a efeitos sonoros | Sem modelo de visão, classificou a animação 2D como "IA/3D" — **errado**; corrigido pela revisão visual abaixo |
| **Revisão visual** (106 quadros, 1 a cada 6 s, vistos um a um) | estilo, cores, composição, personagens, recursos gráficos | 360p: detalhes finos não aparecem |
| **Transcrição** (Whisper base multilíngue via sherpa-onnx, local) | narração completa em português, com tempos | erros pontuais de reconhecimento (ex.: nomes próprios) |
| **ffmpeg** | silêncios, loudness | — |

## Observado (fatos medidos ou vistos)
- **Estrutura (10 min):** 0:00–1:20 o mundo "normal" do Cretáceo · 1:20–2:30 o "ponto de luz" no céu e a chegada · 2:30–3:50 impacto e cratera · 3:50–5:20 terremoto, Índia, tsunami · 5:20–6:45 destroços reentrando, calor, incêndios · 6:45–8:55 escuridão, frio, extinção, sobreviventes · 8:55–9:40 reflexão sobre a humanidade · 9:40–10:38 propaganda da loja.
- **Ritmo:** 78 cortes; na parte narrativa (até ~8:25) a duração mediana de cada plano é **~8 s** (mínimo ~1 s, máximo ~25 s). Os planos longos são panorâmicas lentas; cortes rápidos só no impacto.
- **Animação:** 2D vetorial, contornos limpos, **cores muito saturadas**, profundidade por **camadas** (primeiro plano escuro, fundo claro), luz em feixes, partículas (poeira, brasas, neve).
- **Paleta por ato:** verde/turquesa (mundo vivo) → roxo/índigo (noite e espera) → azul/branco (céu e clarão) → laranja/vermelho (calor e fogo) → roxo-escuro/cinza (inverno) → lavanda (amanhecer dos sobreviventes).
- **Recursos visuais que explicam:** comparação de escala com rótulos (asteroide × Everest × prédio), régua de km na lateral, **corte do terreno** (água/crosta/manto) com cota "100 km", mapa-múndi com marcador, cartões de tempo ("Semana 2", "15 horas após o impacto"), selos de temperatura, infográfico "75%", linha do tempo comparando dinossauros × humanos.
- **Personagens:** pequenos dinossauros com penas como "mascotes" que reagem (medo, calor, fuga) e dão escala humana às cenas.
- **Narração × imagem:** cada frase tem um elemento visual próprio; números importantes aparecem escritos na tela por poucos segundos.
- **Som:** narração masculina dublada sobre trilha contínua (rea-video: ~123 BPM, fá maior, "biblioteca" — a confirmar), efeitos discretos; **nenhum silêncio > 0,8 s** até o fim (ffmpeg silencedetect).

## Estimado (não confirmado)
- Origem da trilha (biblioteca × composta) e se a voz brasileira é humana ou sintética: o rea-video **inclina** para "TTS"/"biblioteca", sem certeza.
- Os ~100 "efeitos sonoros" são candidatos automáticos (picos), não todos efeitos reais.

## O que adaptamos para o nosso 2D (sem copiar)
- Mais saturação, camadas com parallax e primeiro plano escuro (`Selva`, `PrimeiroPlano` no kit `projetos/dino_kit/kit.tsx`).
- Cortes ~8 s por fala, com movimento contínuo de câmera e um elemento visual novo por frase.
- Comparações de escala com régua, cortes esquemáticos rotulados "fora de escala", cartões de tempo, mapas com aviso de "continentes de hoje".
- Dinossauros próprios (rex, tricerátopo, hadrossauro, titanossauro, raptor), aves e mamíferos desenhados do zero; avatar do canal no final da série.
- Não reproduzimos falas, sequência de cenas, personagens, ilustrações nem trilha da referência.
