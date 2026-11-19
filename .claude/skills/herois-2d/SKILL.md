---
name: herois-2d
description: Produz ou planeja curiosidades e histórias em 2D sobre personagens, heróis e vilões da Marvel e DC com fichas por versão, poses articuladas, câmera e acabamento. Use com o fluxo de vídeo existente do Claude Code na nuvem.
disable-model-invocation: true
---

# Heróis 2D para o Viral Video Engine

Entrada explícita: `/herois-2d` seguido de tema, personagem, versão, duração e formato quando definidos. Em uma sessão que só consegue ler o repositório, aceite o pedido em texto com a instrução para ler este arquivo. Aplique estas instruções ao episódio solicitado e aproveite a pipeline do projeto.

1. Leia o `CLAUDE.md` da raiz e as instruções existentes de `video-viral`, `animacao-2d` e `voz-ptbr`, quando presentes. Inspecione a integração com Gemini somente se ela fizer parte do projeto. Preserve o motor, perfil de narração, fontes de áudio e comportamento padrão. Se uma voz só estiver configurada no PC, diga qual opção a sessão realmente pode usar e confirme antes de trocar.
2. Selecione o personagem e a versão em [references/personagens.json](references/personagens.json). Use apenas as fichas da cena. Leia [references/direcao.md](references/direcao.md) para aplicar o padrão visual e de movimento. Cada ficha é um ponto de partida artístico. Confirme o traje e os fatos na obra escolhida. Diferencie HQ, filme, jogo e animação. Para listar o catálogo ou obter poses e câmera, use `scripts/plano.py`. Os links oficiais e o processo para ficha nova estão na direção.
3. Se o personagem ou a versão não estiver no catálogo, copie [references/modelo-ficha.json](references/modelo-ficha.json) para um arquivo do episódio e complete-o com fonte e referência. Use a ficha com `--ficha`. Se o usuário deu liberdade, assuma uma versão visual clara e diga qual. Se uma dúvida alterar o fato central da curiosidade, resolva-a antes de escrever a fala.
4. Parta de um gancho com ação e contexto. Cada cena deve mostrar uma ideia da narração. Crie primeiro uma ficha visual com proporções, traje, máscara, símbolo e silhueta, validada em pose neutra e 3/4. Use arte em camadas ou desenho articulado quando a geração visual permitir. A preparação com Gemini é opcional e só deve usar integração comprovada, quando disponível. Para quadros inteiros, use troca de poses consistentes, sem confundir movimento de câmera com movimento do corpo.
5. Para animar, use o quadro de poses e câmera do planejador como ponto de partida. Para a ação de cada tomada, ajuste as chaves à fala real e à geometria do desenho. O planejador entrega dados, não gera a arte nem renderiza. Adapte-os aos componentes reais do projeto e consulte o exemplo em [references/direcao.md](references/direcao.md). Use um cenário desenhado em planos, silhueta legível, câmera com propósito e movimentos secundários coerentes com a ação.
6. Em modo produção, siga o render e a verificação do repositório. Faça primeiro uma tomada curta ou stills úteis para revisar poses, enquadramento e consistência. Dentro da duração final, confira voz, sincronização, legendas, emblemas, mãos, recortes, flashes e se há movimento visível mesmo com a câmera fixa. Entregue vídeo apenas quando pedido. Diferencie prévia, render verificado e limitação de ferramenta.

Amostra rápida de plano no projeto:

```bash
python3 .claude/skills/herois-2d/scripts/plano.py --id marvel/peter-parker --segundos 4 --fps 30
```

Com direitos de uso confirmados, use referências visuais para extrair características. A composição, as falas, o áudio e as cenas do episódio devem ser originais. As referências do ZIP servem para estudo de direção.
