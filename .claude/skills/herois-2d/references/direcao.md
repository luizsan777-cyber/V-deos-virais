# Direção de arte, câmera e movimento

## O que observar nas referências

- As três capturas do estilo antigo mostram cabeças grandes, contorno forte, cores sólidas e legendas de alto contraste. Reaproveite a clareza das silhuetas e a leitura no celular. Nos heróis, use anatomia e proporções da versão, mais variação de gestos e ambientação.
- `visuais/04-1000576068.jpg` e `visuais/05-1000576069.jpg` mostram variantes do Homem-Aranha e linguagens gráficas diferentes. Na saída 2D, fixe o desenho da máscara, a forma das lentes e a distribuição das cores da variante escolhida. Teias, cenário e sombra devem ajudar o público a ler a pose.
- `visuais/06-1000576070.jpg` e `visuais/07-1000576071.jpg` mostram o Batman com silhueta de máscara e capa, luz recortando as bordas e expressão em planos próximos. Use contraste suficiente para ver o traje na tela do celular.
- No MP4 fornecido de Batman e Bane, os quadros alternam detalhe do rosto, ângulos fechados e planos mais abertos para situar os corpos. O corte volta ao rosto para mostrar consequência. Aproveite essa progressão em ação original e mantenha a continuidade do eixo. Nenhuma cena precisa repetir o confronto, o sangue, as falas, a música ou os fotogramas da referência.

## Do desenho ao movimento

1. Faça uma ficha visual com frente, 3/4, perfil se necessário, escala, paleta e quatro expressões ou poses. Mantenha emblema e costuras na mesma posição anatômica. Planeje roupa, capa, cabelo, acessórios e olhos da máscara em camadas. Se houver desenho por IA, compare cada pose contra a ficha aprovada e refaça apenas o plano divergente.
2. Monte as ações com antecipação, pose principal, reação e recuperação. Fixe o pé de apoio quando ele está no chão. Marque cotovelos, joelhos, mão e cabeça antes de mover a câmera. A capa, a teia ou o cabelo reagem com atraso e ajudam a mostrar direção. Se a pose for um desenho inteiro, separe 3–5 poses coerentes e combine com deslocamento de corpo e sobreposições. Evite deformar a anatomia por interpolação de imagens inteiras.
3. Mostre onde o personagem está antes de encurtar o plano. Use detalhe para pista ou emoção. Nos movimentos rápidos dê um quadro legível de partida e chegada. Use a câmera fixa em momentos onde a pose explica a ação. Reserve tremor curto para um momento de impacto relevante. Para 9:16, confirme enquadramento e texto fora de rosto, mãos e ícones.
4. Nos planos coloridos use sombras em dois ou três níveis, cores de luz e sombra distintas e textura moderada. Para suspense, ilumine o contorno e pelo menos uma face ou detalhe de leitura mesmo nos fundos escuros. Use três planos de cenário com contraste decrescente.
5. Em curiosidades, prenda a primeira fala a uma imagem que já mostre o assunto. Mude a informação visual a cada tomada e preserve o tempo necessário para entender uma pose. Use o áudio de narração como régua e alinhe cortes, legendas e efeitos. Mantenha a voz clara sobre trilha e som ambiente.

## Exemplo de integração com o Viral Video Engine

`scripts/plano.py` imprime JSON com `camera`, `poses` e `movimento_secundario`. Gere um arquivo intermediário no diretório do episódio, com duração e FPS da **tomada**, e ajuste enquadramento para as coordenadas reais do cenário. No kit conhecido, `Camera.chaves` recebe `[frame, cx, cy, zoom, rot]` e o tipo `Pose` de `poses.ts` aceita os mesmos nomes e pares de ângulos. Use `poseEm` a partir dos mesmos frames locais ou interpole com `misturaPose`. Coordenadas iniciais pressupõem um mundo vertical de 1080 × 1920 e personagem central. Reenquadre um projeto horizontal na composição, mantendo as poses e adaptando a câmera. Dentro de `Sequence` mantenha todos os tempos locais e evite subtrair o início duas vezes.

O rig genérico do motor pode ter proporções e roupas que não representam o herói. Aproveite a geometria de movimento e aplique-a a camadas desenhadas para aquele personagem, com pivôs articulados, ou use poses autorais. No fluxo Gemini, converta as chaves em uma descrição de tomada e confira a fidelidade dos quadros gerados. Se só houver arte estática, deixe claro que o lote precisa de poses ou camadas para entregar o movimento pedido.

Use uma amostra curta de cada ação e inspecione o quadro inicial, a pose principal e a saída. Confira o deslocamento das mãos e pernas com a câmera temporariamente fixa. Isso ajuda a detectar um plano em que só o cenário se move.

## Novas versões

1. Determine a mídia e a identidade antes de escolher o traje. Abra o [diretório Marvel](https://www.marvel.com/characters) ou o [diretório DC](https://www.dc.com/characters) e confirme os fatos na edição ou página correspondente quando disponível.
2. Copie `modelo-ficha.json` para o episódio, preencha a fonte consultada e escolha um modo: `acrobacia`, `furtivo`, `voo`, `velocidade`, `peso`, `magia` ou `revelacao`.
3. Use `python3 .claude/skills/herois-2d/scripts/plano.py --ficha caminho/da-ficha.json --segundos 4 --fps 30`. Depois de validar a arte em duas tomadas, acrescente a ficha ao catálogo se ela for reutilizável.
