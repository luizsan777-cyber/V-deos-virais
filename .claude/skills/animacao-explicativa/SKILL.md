---
name: animacao-explicativa
description: Como animar no MODO EXPLICATIVO do Viral Video Engine (curiosidades científicas, experimentos, fenômenos naturais, "como funciona") — diagramas que se desenham, setas, rótulos, contadores, gráficos, ondas, órbitas e um apresentador 2D. Use ao escrever o Video.tsx de um vídeo explicativo.
---

# Animação explicativa (kit em `engine/src/kit/diagramas.tsx`)

## Peças

- `FundoExplicativo tipo="quadro|papel|blueprint|gradiente"` — escolha um por vídeo e varie entre vídeos.
- `Seta de ate em dur curva cor tracejada` — desenha-se no tempo, ponta salta no fim.
- `Rotulo x y texto em ate` — etiqueta que salta.
- `Contador x y de ate em dur sufixo casas` — número contando (formato pt-BR).
- `Barras x y dados em` — gráfico de barras crescendo com valores.
- `Onda`, `Orbita`, `Cartao (titulo/texto deslizando)`.
- Apresentador: `<Personagem>` com `apontando(f, ângulo)` para o diagrama, `falando` no resto, lip-sync com a voz.
- Use dentro de `<Camera>` (mundo 1080×1920) para poder dar zoom em partes do diagrama.

## Receita

1. Gancho visual em 1 s (objeto grande + pergunta na legenda).
2. Cada conceito = um diagrama que se constrói enquanto a voz fala (sincronize `em={T.palavra("…") - 2}`).
3. Câmera passeia pelo diagrama (zoom no detalhe citado), nunca mostra tudo estático.
4. Números importantes → `Contador` ou `TextoPop`, e efeito `pop`/`ding`.
5. Final: resumo visual em uma imagem + frase de impacto.

Diagramas desenhados à mão no próprio Video.tsx (SVG paths) são bem-vindos: objetos do experimento
(copo, ímã, vulcão…) animados com `ramp/eout/mola` são o que diferencia de slides.
