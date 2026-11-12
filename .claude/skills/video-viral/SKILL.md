---
name: video-viral
description: Produz um vídeo vertical completo (YouTube Shorts, TikTok, Reels, Facebook) a partir de um tema — roteiro original em pt-BR, narração brasileira, personagens e cenários animados (2D, 3D ou explicativo), legendas, trilha, efeitos sonoros e MP4 1080x1920 30 fps verificado. Use quando o usuário pedir "crie um vídeo sobre…", "faz um short de…", "vídeo de terror/bíblico/ciência/curiosidade", ou mencionar o Viral Video Engine.
---

# Viral Video Engine — produção completa

Pedido típico: *"Crie um vídeo de 70 segundos sobre o que aconteceria se a Terra parasse, com animação 3D e
narração brasileira informal."*

Leia também, conforme o caso: `roteiro-viral` (sempre), `voz-ptbr`, `animacao-2d`, `animacao-3d`,
`animacao-explicativa`. Visão geral técnica: `CLAUDE.md` na raiz.

## Etapas (siga na ordem)

1. **Interpretar o pedido.** Tema, duração-alvo (padrão 60 s; Shorts ≤ 60 s, TikTok/Reels até 90 s), modo
   (2d / 3d / explicativo), tom. Se faltar algo essencial, assuma o padrão e diga qual assumiu.
2. **Escolher motor visual e estilo** (tabela abaixo). Consulte `docs/estilos-usados.md` e **não repita** o
   estilo dos 2 últimos vídeos. Registre o novo estilo nesse arquivo ao final.
3. **Pesquisar e verificar fatos** (ciência/história): use WebSearch; anote fontes em `projeto.json → fontes`.
   Sem fonte confiável, não afirme como fato — reformule como hipótese ou tire.
4. **Roteiro** (skill `roteiro-viral`): gancho ≤ 3 s, ~2,6–3 palavras por segundo de vídeo
   (70 s ≈ 180–200 palavras). Escreva em `projetos/<slug>/projeto.json` (falas curtas, 1 ideia por fala).
   Mostre o roteiro ao usuário só se ele pediu para aprovar; senão siga.
5. **Narração**: `python3 ferramentas/voz.py projetos/<slug>` → `build/narracao.wav` + `build/tempos.json`.
   Confira a duração total; ajuste o texto se passar/faltar mais de 10 %.
6. **Planejar cenas** em comentário no topo do `Video.tsx`: lista de cenas com fala, cenário, ação do personagem,
   câmera e efeito. Cada cena muda algo a cada 2–4 s (câmera, pose, expressão, objeto) — nada fica parado.
7. **Animar**: escreva `projetos/<slug>/Video.tsx` usando o kit (`engine/src/kit/`). Ações acontecem 0–3 frames
   ANTES da palavra correspondente (`T.palavra("x") - 2`).
8. **Conferir quadros**: `python3 ferramentas/produzir.py projetos/<slug> --etapas none --stills 30,90,150,… --escala 0.5`
   e OLHE as imagens (Read). Corrija: personagem pequeno demais, texto sobre o rosto, cenário vazio, contraste.
9. **Áudio**: trilha + efeitos (`sfx` no projeto.json) — feito por `produzir.py` (etapa `audio`).
10. **Render + mux + QA**: `python3 ferramentas/produzir.py projetos/<slug>` (2D ≈ 1,5 fps, 3D ≈ 3 fps em 4 núcleos).
    Vídeos longos: prefira o GitHub Actions (workflow "Renderizar vídeo").
11. **Verificar**: leia `saida/<slug>_qa.json` (precisa `problemas: []`) e OLHE `saida/<slug>_qa.jpg`.
12. **Entregar**: `SendUserFile` com `saida/<slug>.mp4` e um resumo de 3 linhas (duração, estilo, fontes).
    Se o usuário quiser o arquivo depois, o Actions publica em Releases (link direto para o celular).

Nunca declare pronto sem o QA aprovado e sem ter olhado a folha de conferência.

## Modos e estilos (varie!)

| Modo | Bom para | Estilos disponíveis (escolha 1, varie paleta) |
|---|---|---|
| 2d | terror, suspense, bíblico, contos, curiosidades com personagem | `noite-conto` (ESTILOS_PERSONAGEM.noite + cenário noturno), `terror-tinta` (terror, granulação, vinheta forte, relâmpagos), `biblico-pintado` (biblico, deserto/entardecer, raios de luz, legenda Cinzel), `conto-colorido` (conto, cores saturadas), `flat` |
| 3d | ciência, universo, história, engenharia, animais | `espaco` (Planeta/Estrelas/Sol), `vilarejo-toon` (Terreno/Árvore/Casa com contorno), `cidade-noturna` (Predio com janelas acesas, neblina), personagens 2D projetados com `projetar()` |
| explicativo | experimentos, fenômenos, "como funciona" | `quadro` (giz), `papel` (caderno quadriculado), `blueprint` (engenharia), `gradiente` (moderno) + apresentador 2D apontando |

Legendas: `impacto` (Anton), `moderno` (Montserrat 900), `biblico` (Cinzel), `terror`.

## Regras de qualidade (não negociáveis)

- Animação de verdade: personagens com poses, expressões, lip-sync quando falam; câmera sempre em movimento
  (deriva lenta + movimentos de câmera nos pontos fortes). Nunca "slide com zoom".
- Personagens consistentes: defina o `Visual` de cada um UMA vez no topo e reutilize.
- Texto de destaque (TextoPop) nunca cobre o rosto: confira nos stills.
- Legendas na zona segura (já calibrado: y ≈ 64 % da altura, margem direita maior por causa dos ícones).
- Música nunca atrapalha a voz (ducking já automático; `musica.volume_db` padrão -22, use -24 a -26 em falas rápidas).
- Respeito em temas religiosos e trágicos: sem gírias forçadas, sem humor sobre sofrimento real.
- Nada de serviços pagos sem autorização expressa do usuário.

## Estrutura de um projeto

```
projetos/<slug>/
  projeto.json   roteiro, perfil de voz, destaques, sfx, música, fontes
  Video.tsx      a animação (React/Remotion) — export default function Video()
  build/         gerado (narração, tempos, mix, stills) — não versionado
saida/<slug>.mp4, saida/<slug>_qa.jpg, saida/<slug>_qa.json   — não versionados
```

Exemplos completos e testados: `projetos/teste-corpo-brilha/` (2D) e `projetos/teste-3d-terra/` (3D).
