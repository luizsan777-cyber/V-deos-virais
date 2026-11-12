# Viral Video Engine · especificação de desenvolvimento

**Entrega da futura skill** · A partir de tema ou briefing, produzir um MP4 original de aproximadamente 70 segundos com roteiro, animação, som e legendas verificáveis. Padrão proposto para este projeto: 1080 × 1920, 30 fps, 2.100 quadros, H.264 yuv420p e AAC estéreo. Tema, idioma e referência visual são entradas independentes. A mesma composição pode servir às quatro plataformas; créditos ou gráficos devem ficar legíveis nas prévias de cada destino.

## Contrato de entrada e saída

| Entrada | Padrão ou comportamento |
|---|---|
| Tema e pergunta central | Obrigatórios em conjunto ou inferidos da frase do usuário. Delimitar o fenômeno e sua consequência visível. |
| Série ou referência | Quando indicada, preservar suas escolhas de dimensão, câmera, densidade e som. Sem indicação, selecionar pela necessidade do tema e registrar a escolha. |
| Duração, idioma, proporção | 70 s, português brasileiro e 9:16 por padrão. A voz sintetizada determina a temporização dentro do orçamento. |
| Ativos permitidos | Originais ou licenciados para o uso solicitado. Registrar arquivo, autoria, licença, atribuição e origem. |
| Infraestrutura | Descobrir binários locais, renderizador, fontes, voz e espaço livre. Serviços pagos desligados. |
| Saída | MP4, legendas SRT, roteiro com fontes quando factual, créditos, relatório de validação e projeto reproduzível. O MP4 deve abrir e decodificar até o último quadro. |

## Organização proposta

A entrada da skill no projeto Claude Code é `.claude/skills/viral-video-engine/SKILL.md`. Manter ali o gatilho, as perguntas que a skill resolve e a sequência operacional. Carregar apenas o perfil e os exemplos aplicáveis ao pedido. Guardar os contratos e catálogos em `references/` e os executáveis locais em `scripts/`. A documentação da plataforma descreve o mecanismo de skills e materiais associados. [Claude Code](https://code.claude.com/docs/en/skills)

Separar cada produção em um diretório próprio com `brief.json`, `roteiro.json`, `plano.json`, `assets.json`, `voz.wav`, `palavras.json`, cenas renderizadas, mixagem e `final.mp4`. As decisões criativas residem no plano e podem ser revisadas sem editar o motor de render. O presente pacote contém evidência e especificação para desenvolver esse projeto.

## Planejamento por ação

1. Escrever a pergunta que restará aberta depois da primeira imagem e o que a última imagem deve resolver. Distinguir introdução editorial, título e promoção. Em V18, esses momentos ocupam tempos diferentes.
2. Dividir o tema em ações ou relações observáveis. A cada beat associar o que se ouve, o que se vê mudar e a evidência que permite compreender a mudança. Se o episódio contiver explicações independentes demais para 70 s, selecionar uma cadeia causal e guardar o restante para outro episódio.
3. Escolher um estado inicial e um final por entidade. Especificar posição de personagens e objetos, mão que segura a peça, sentido de deslocamento, iluminação, escala e eixo de ação. O plano seguinte herda o estado final do anterior. Um retorno no tempo precisa de marca visual ou verbal.
4. Gerar voz temporária local. Medir a duração de cada frase com silêncios. Ajustar conteúdo e pausas até o arco caber. Os PPM do relatório são ponto de comparação por gênero. Uma frase importante pode precisar de silêncio visual antes da próxima.
5. Distribuir quadros inteiros, cobrindo o intervalo [0, 2100). Definir a ação que justifica cada troca de vista. Um beat pode conter várias tomadas; uma tomada pode atravessar mais de um beat. Um destaque, uma porta que abre ou um clarão podem acontecer na tomada vigente.
6. Renderizar um animatic com trajetória, enquadramentos e voz. Verificar o gancho com e sem áudio e a legibilidade em retrato. Realizar ajustes localizados antes da renderização final.

### Campos mínimos do plano

| Unidade | Campos |
|---|---|
| Beat | ID, pergunta, resposta parcial, evidência em tela, trecho de voz, intervalo, referência de estilo, fonte factual quando aplicável |
| Tomada | ID, cena e entidades persistentes, início inclusivo, fim exclusivo, câmera e alvo, perspectiva, altura relativa e ponto de interesse |
| Movimento | Quadro de início/fim, coordenadas ou keyframes, easing, alvo, movimento local dos objetos e continuidade na saída |
| Texto | Conteúdo, função (fala, rótulo, unidade ou escolha), âncora, origem temporal, quadros de entrada e saída, contraste e tratamento tipográfico |
| Som | Trilha separada, arquivo ou gerador, origem e licença, instante, ação que motiva o som, ganho e envelopes de entrada/saída |
| Render | Versões, seed, resolução, fps, renderer, espaço de cor, arquivos intermediários, comandos e resumos criptográficos dos insumos |

### Regras de câmera por necessidade

- **Revelar onde algo está.** Começar com um geral que fixe duas referências e aproximar quando o detalhe não tiver leitura no tamanho de celular. V03 usa acostamento, cabine e cortina como três espaços distintos.
- **Explicar um mecanismo simultâneo.** Conservar o corpo e abrir um detalhe da peça no mesmo instante. V12 fornece o teste de tela dividida. Se a peça ocultar o gesto no vertical, trocar o eixo ou empilhar as vistas.
- **Mostrar o invisível.** Conservar a orientação do modelo e retirar a superfície com máscara, transparência ou corte em seção. V06 e V11 usam rótulos e cores locais para indicar qual componente ganhou importância.
- **Escalar um fenômeno.** Identificar o objeto antes de mudar de escala, repetir uma forma ou cor na vista seguinte e dar a unidade ao gráfico. V16 e V17 oferecem exemplos diferentes de passagem entre indivíduo, ambiente e escala global.
- **Dar tempo a uma reação.** Travar a câmera quando olhos, mão ou vestígio mudarem a interpretação. O plano termina quando a ação encerra sua informação. Usar órbita apenas se a mudança de ângulo revelar uma relação espacial nova.

## Perfis que a implementação deve poder combinar

| Perfil | Técnica proposta | Elementos que permanecem consistentes | Teste visual |
|---|---|---|---|
| Suspense de personagem | Blender/EEVEE ou Three.js, materiais foscos, luz localizada e contracampo | Personagem, eixo, marco espacial e pista | O último detalhe muda a interpretação de uma imagem anterior? |
| Engenharia e reforma | Cena paramétrica com peças nomeadas, cortes e pontos animados | Geometria-base, escala, cor semântica e estado físico | O espectador consegue acompanhar de onde vem e para onde vai a ação? |
| Ciência ilustrada | SVG/canvas, Grease Pencil ou camadas de forma, mapas e máscaras | Linguagem de silhueta, direção do movimento e unidade | O gráfico continua legível no celular sem diminuir a tipografia? |
| História/documental | Mapa, datas e reconstruções originais; estética definida por série | Localização, identificação de fonte e sequência temporal | O episódio diferencia registro histórico e reconstituição? |
| Química/biologia | Diagrama 2D ou modelo 3D conforme a escala explicada | Legenda de cor, orientação e mudança de escala | O que é símbolo, ampliação ou passagem de tempo fica explícito? |
| Híbrido | Cena 3D com rótulos vetoriais ou passagem justificada para diagrama | Mesmos objetos, cores e sentido antes/depois | A mudança de técnica resolve uma dúvida do espectador? |

Os perfis de história e química são propostas de extensão. O lote não contém amostras dedicadas a todas as categorias desejadas. Reservar identidade distinta por série e aceitar novos perfis sem alterar os existentes.

## Exemplo de planejamento para “E se a Terra parasse de girar?”

**Premissa de roteiro a pesquisar** · Distinguir o solo que para, em um cenário instantâneo hipotético, da matéria que conserva seu movimento. Registrar o referencial da câmera e quais efeitos serão tratados. Este exemplo testa a implementação; o roteiro factual de produção precisa de fontes próprias.

| Intervalo ilustrativo | Decisão de cena e som | Critério para passar adiante |
|---|---|---|
| 0–6 s | Uma pessoa ao lado de um objeto e uma marca no chão. A voz formula a hipótese sobre o solo. | O espectador conhece o marco imóvel da comparação. |
| 6–19 s | O mesmo ponto aparece em um globo com eixo e sentido de rotação. | A relação entre vista global e marca local fica legível. |
| 19–36 s | Retorno ao mesmo lugar. Congelar uma camada e animar a outra; manter uma seta e um referencial explícitos. | A imagem oferece uma resposta parcial antes de trocar de vista. |
| 36–54 s | Comparação gráfica de duas posições no globo. Dimensões e unidades verificadas na pesquisa do roteiro. | A diferença fica visível sem repetir a explicação por inteiro. |
| 54–70 s | Voltar à marca da abertura, completar a consequência escolhida, baixar a trilha e deixar a última imagem respirar. | A pergunta inicial recebe uma resposta legível. |

Essas durações pertencem ao exemplo. Um episódio sobre uma porta de elevador pode empregar o mesmo tempo total em um único cenário com dois pontos de vista.

## Produção local

**3D.** Separar malha, material, esqueleto, clipes de animação e câmeras. Exportar GLB com escala e orientação documentadas se intercambiar Blender e Three.js. Reutilizar o mesmo ativo e o mesmo estado inicial por tomada. Uma animação de contato pede mão e peça vinculadas durante o gesto. Um ciclo de caminhada pede pés estáveis no apoio e deslocamento do corpo coerente.

**2D.** Usar formas fechadas, máscaras e camadas com pivôs explícitos. A posição de uma camada pode variar com a câmera para criar parallax. Reenquadrar os componentes do horizontal para 9:16 individualmente. Planejar texto e eixo antes de recortar.

**Narração e legendas.** Sintetizar por frase com Piper ou gravar voz original. Manter fala, ambiente, trilha e efeitos em canais separados. Gerar marcações da própria voz e comparar com o texto planejado. O editor deve poder corrigir nomes e números. Gerar SRT por frase e JSON por palavra; usar o JSON para destacar uma palavra quando o perfil pedir. Testar contorno contra o fundo mais claro e o mais escuro.

**Som.** Diferenciar som contínuo do local, textura musical e evento causal. Amarrar efeitos a ações específicas e ajustar o envelope pela imagem renderizada. Medir pico e loudness do mix, conferir a audibilidade em mono e em alto-falante de celular. Conservar um trecho sem fala se a imagem precisar concluir sua ação.

## Validação de entrega e retomada

- Conferir o número de quadros, resolução, fps, duração das pistas, codec e formato de pixel. Decodificar todas as pistas até o fim com FFmpeg e conferir o código de saída.
- Conferir legendas dentro do intervalo, fonte disponível, palavras sensíveis à acentuação, unidades e sobreposição com a interface de cada plataforma.
- Gerar folha de contato, conferir primeiro e último quadro e revisar transições. Uma câmera estática é legítima quando a ação está animada. Uma sequência de imagens imóveis com zoom não satisfaz um briefing de animação de personagem.
- Se a duração exceder o alvo, editar a frase ou sua ação no beat apropriado, sintetizar novamente e recalcular os tempos dependentes. Evitar cortar a última palavra para encaixar o arquivo.
- Cachear por hash dos insumos e parâmetros. Escrever renders intermediários em arquivo temporário e promover ao destino após teste. Uma falha na tomada 8 deve permitir retomar dessa tomada com o mesmo estado.
- Guardar relatório com falhas, correções, fontes e medições. Cada hipótese de desempenho só muda de categoria quando houver métricas reais associadas ao vídeo publicado.

**Aceitação do desenvolvimento** · Executar três episódios completos, um de suspense com continuidade de personagem, um de mecanismo com múltiplas vistas simultâneas e um de ciência 2D. Cada um deve produzir e validar seu MP4 localmente, preservar sua estética e concluir a pergunta dentro do orçamento de tempo.