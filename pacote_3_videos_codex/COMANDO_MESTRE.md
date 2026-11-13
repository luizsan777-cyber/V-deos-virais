# CODEX — COMANDO MESTRE | 3 VÍDEOS ANIMADOS 2D INDEPENDENTES

**Versão:** 2026-11-13 · **Uso:** repositório GitHub aberto no Codex pelo aplicativo de celular.

> EXECUTE O PROJETO. Não entregue somente um plano, roteiro, protótipo ou imagens fixas. Produza os três MP4 quando o ambiente realmente permitir, verifique os arquivos e relate objetivamente eventuais limitações.

## 1. OBJETIVO E FONTES DE VERDADE

Produzir **exatamente** estes três vídeos completos, cada um com projeto, cenas, áudio, legendas e exportação separados:

1. `VIDEO_01_OCEANO.md` — **O que aconteceria com seu corpo a 11 mil metros de profundidade?**
2. `VIDEO_03_IMORTALIDADE.md` — **E se ninguém mais pudesse morrer?**
3. `VIDEO_04_COCEGAS.md` — **Por que você não consegue fazer cócegas em si mesmo?**

**NÃO produzir o vídeo 02 (prender a respiração)**. Já foi tratado em separado. Não gerar vídeos adicionais nem mudar temas.

**Ordem de autoridade:** instruções específicas deste arquivo para infraestrutura, isolamento e entregas; arquivo individual do episódio para história, locução e direção; referências de estilo validadas e assets existentes do repositório, se localizados. Se versões anteriores das histórias 03/04 existirem no Git e forem **mais detalhadas**, incorporar detalhes compatíveis sem perder nenhum elemento essencial dos arquivos atuais. Não incorporar premissas de outros temas. Se um texto prévio não estiver disponível, execute com o conteúdo completo dos arquivos entregues, sem travar aguardando o usuário.

### Fontes e caminhos

Localize os quatro `.md` mesmo se tiverem sido colocados na raiz ou na pasta `pacote_3_videos_codex/`. Leia cada arquivo **por completo** antes de executar. Não dependa de um resumo automático que elimine instruções. Cite no relatório quais caminhos exatos leu. Trate os roteiros como especificação do projeto, não como mensagens para imprimir em vídeo.

## 2. INSPEÇÃO DO AMBIENTE — NÃO INVENTAR FERRAMENTAS

Antes de editar, examine README, configurações, scripts, dependências, pipelines, exemplos existentes e estrutura de saída. Verifique:

- Se há ferramenta de renderização (por exemplo, Remotion, FFmpeg, Blender ou outra) **realmente instalada e funcional**.
- Se há pipeline 2D de vetores, camadas, puppets/rig, animação por código, assets ilustrados, compositing, transições e câmeras.
- Se **HyperFrames** existe e qual é a interface real de uso. Aplicar somente funções compatíveis com produção 2D e passíveis de teste. Não afirmar que HyperFrames está ativo sem evidência.
- Se **Voicebox** e motores de TTS para PT-BR existem e estão executáveis; se não houver, identificar alternativa operacional adequada, sem fingir narração concluída.
- Se existe pipeline de legendagem, mixagem, SFX, bancos de música licenciada e QA de MP4.
- Se a execução no Codex possui limites de disco, CPU, memória, rede, tempo e dependências. O celular é apenas uma interface: não presumir que renderização acontece no dispositivo.

Reutilize as ferramentas já instaladas. **Não reinstalar ou reconfigurar cegamente**. Preserve o repositório e outros projetos. Alterações devem ser pequenas, justificadas e reversíveis. Não usar downloads sem licença verificada. Não presumir que o Codex pode acessar imagens de outros chats se não estiverem nos arquivos do Git.

## 3. ESTILO VISUAL INEGOCIÁVEL

- **ANIMAÇÃO 2D de verdade**, desenho de contorno limpo, cores vivas, ambientes ilustrados com camadas/parallax, figuras consistentes; referência geral da série de vídeos 2D anterior sobre Jesus e 3ª Guerra Mundial, **somente se os materiais estiverem acessíveis no repositório**.
- Proibido converter para Pixar, 3D forte, Lego, Minecraft, pixel art, pessoas reais ou fotorrealismo.
- Ilustração de anatomia deve ser **2D** (silhuetas, camadas, linhas, esquemas, setas e órgãos ilustrados).
- Não substituir animação por slideshow, imagens estáticas com zoom, cortes de cartões ou pan repetido.
- Personagens devem mexer membros, articulações, olhos, sobrancelhas, boca e tronco conforme a atuação; ações físicas com continuidade espacial.
- Foco em movimentos motivados pela história, sem câmera agitada gratuita. Movimento fluido e controle de deformações/inconsistências entre frames.
- Evitar letras ou HUDs excessivos. Letreiros pontuais, bem posicionados e sem cobrir a cena.

## 4. ESPECIFICAÇÃO DE ÁUDIO, VÍDEO E DURAÇÃO

- Formato **vertical 9:16**, **1080 × 1920**, **30 FPS**, MP4, vídeo H.264, áudio AAC, idealmente `yuv420p` para ampla compatibilidade.
- Cada vídeo: **alvo entre 1min35s e 1min50s; máximo absoluto de 1min50s**. Os roteiros possuem 12 cenas planejadas em ~1min47s. Não acelerar a narração para encaixar trechos. Ajustar tempo visual, pausas e sincronismo sem perder conteúdo narrativo.
- Locução masculina **PT-BR**, natural, conversada, curiosa, sem dicção robótica nem formalidade excessiva; referência aproximada 125–140 palavras/minuto, mas priorizar a duração real de fala, pausas e expressividade.
- Uma única identidade vocal estável **dentro do episódio**. Gerar clipes por cena, testar pronúncia e concatenação sem duplicar frases ou palavras finais.
- Legendas PT-BR por palavra ou frases curtas com alinhamento real à voz; alto contraste; mantê-las em área segura para Shorts/TikTok/Reels.
- Música ambiente adequada à emoção do vídeo, **licenciada ou original**, volume abaixo da locução; sons pontuais de impacto, água, ambiente, laboratório, passos etc.
- Início de 0–3 segundos com acontecimento visual e pergunta forte; progressão de revelações; final com pergunta breve. Ritmo compreensível, sem flash/cortes frenéticos.

## 5. ISOLAMENTO ABSOLUTO: TRÊS PRODUÇÕES SEPARADAS

Trate cada vídeo como uma unidade de produção com **identificador único**:

- `video_01_oceano_11000m`
- `video_03_imortalidade`
- `video_04_cocegas_cerebro`

Ao adaptar à estrutura existente, mantenha para cada projeto seus próprios manifests, cenas, sprites/rigs, áudio de locução, música mixada, legendas, temporários, renders e `final.mp4`. Não compartilhe caminhos mutáveis ou cache com colisões de nome. Assets globais só em leitura; IDs de personagens, cenas, composições, sementes e arquivos sempre específicos do episódio. Não carregar o estado do episódio anterior.

**Verificações obrigatórias de contaminação:** sem personagem do mergulho no hospital de imortalidade; sem frase sobre morte no episódio das cócegas; sem créditos, legendas ou assets do episódio vizinho. Pesquisar trechos de narração e identificadores cruzados nos manifests antes do render. Para vídeo 01 e 04, anatomia é ilustrativa e cientificamente rigorosa. Vídeo 03 é hipótese fictícia, não fato.

## 6. PIPELINE POR EPISÓDIO (NÃO PULAR ETAPAS)

1. **Planejamento interno:** ler roteiro integral, gerar manifest `scene_id`, intervalo previsto, locução EXATA, personagens, cenário, movimento físico, câmera, transição, legenda, som e checagens. Não descartar descrições. Informar como as 12 cenas serão cumpridas.
2. **Construção visual:** criar/usar assets 2D com identidade consistente. Implementar animação contínua por cena (rig/keyframes/tweens/elementos vetoriais) e parallax onde fizer sentido; inserir partes anatômicas corretas. Evitar fotografias realistas e deformações.
3. **Narração:** sintetizar gravação masculina PT-BR de todas as 12 falas ou usar material já aprovado. Validar voz, cortes, pronúncia e duração; regenerar somente trechos problemáticos.
4. **Sincronização:** reconstruir temporalidade segundo a duração **real** do áudio. Ajustar pontos de corte sem reduzir ou acelerar fala. Inserir pequenas pausas de respiração e ações visuais entre frases. Nunca ultrapassar 110 s.
5. **Animação/composição:** aplicar HyperFrames **se disponível e compatível**; renderizar ou compor animações por cena; verificar movimento real, continuidade, enquadramento e qualidade.
6. **Áudio e legendas:** inserir FX, trilha licenciada/original e legendas corretas, com entradas/saídas limpas.
7. **Render final:** exportar MP4 H.264/AAC compatível.
8. **QA obrigatório:** testar abertura dos arquivos, resolução, FPS, codec, duração, áudio, número de cenas, ausência de quadros pretos/congelados, duplicação de narração, grafia das legendas e mistura de histórias. Verificar pelo menos amostras visuais do começo/meio/fim de cada cena, se o ambiente permitir.
9. **Entrega/registro:** salvar MP4 e manifest/relatório no diretório do episódio; só marcar `concluído` após verificar arquivo real.

**Execução sequencial:** 01 → validar → 03 → validar → 04 → validar. Não iniciar vários renders pesados simultaneamente, salvo se o ambiente mostrar capacidade comprovada. Em interrupções, retomar a partir do estado durável (manifest/checkpoint) sem sobrescrever renders aprovados.

## 7. REQUISITOS CIENTÍFICOS E NARRATIVOS

- **Oceano:** pressão ≈ 1 atm adicional a cada 10 m; em ~11 km ≈ 1.100 atm de pressão total como ordem de grandeza; diferença entre tecidos com água e espaços gasosos; risco sério e letal sem proteção muito antes do fundo; não inventar que corpo é achatado como lata; distinguir profundidades e organismos reais por habitat.
- **Imortalidade:** cenário **ficcional** no qual ninguém morre, mas envelhecimento, doença e dor podem continuar; implicações dependem de premissas demográficas e sociais; não afirmar certezas científicas inevitáveis; evitar violência gráfica.
- **Cócegas:** previsão sensorial/atenuação de sensações autogeradas, participação de redes motoras e cerebelo; toque de outra pessoa é menos previsível; nuances e variabilidade individual; não afirmar impossibilidade absoluta; experimento de atraso apresentado sem números inventados.

## 8. SAÍDAS E PASTAS

Preserve a convenção do repositório. Caso não exista, crie algo semelhante a:

```text
producoes/
  video_01_oceano_11000m/
    roteiro.md
    scene_manifest.json
    assets/
    audio/
    captions/
    renders/
    video_01_oceano_11000m.mp4
    qa_report.md
  video_03_imortalidade/
    roteiro.md
    scene_manifest.json
    assets/
    audio/
    captions/
    renders/
    video_03_imortalidade.mp4
    qa_report.md
  video_04_cocegas_cerebro/
    roteiro.md
    scene_manifest.json
    assets/
    audio/
    captions/
    renders/
    video_04_cocegas_cerebro.mp4
    qa_report.md
```

O Codex deve adaptar o layout ao projeto real, sem criar estrutura duplicada desnecessária. Não comitar binários gigantes se houver restrições de Git/LFS: nesse caso guardar saída em localização de artefatos acessível e fornecer caminho verificável. **Não afirmar que arquivo existe se não existe.**

## 9. CRITÉRIOS DE APROVAÇÃO

- [ ] 3 arquivos MP4 reproduzíveis e **apenas** os vídeos 01, 03 e 04.
- [ ] Em cada episódio, as **12 cenas** estão presentes, sem resumir narrativa.
- [ ] Duração correta, fala natural, sem palavras cortadas/repetidas.
- [ ] 1080x1920, 30 FPS, H.264/AAC, 9:16.
- [ ] Animação 2D real e consistente, sem slides disfarçados.
- [ ] Legendas corretas e sincronizadas; música não encobre locução.
- [ ] Sem personagens, narração, cenários, arquivos ou legendas trocados entre episódios.
- [ ] Correção técnica da pressão/anatomia, e separação entre fato científico e hipótese.
- [ ] QA documentado com evidências verificáveis.

## 10. COMANDO FINAL

**Execute a produção, não apenas o planejamento.** Inspecione o Git, leia os arquivos Markdown integrais, use as ferramentas **realmente instaladas** (incluindo HyperFrames se compatível), produza um vídeo por vez, faça QA e entregue os três MP4. Se o ambiente bloquear algum passo (p. ex., TTS, falta de recursos, render ou licença), mantenha o progresso real salvo, indique exatamente o bloqueio e nunca simule uma entrega concluída.

Para execução individual, consulte `EXECUTAR_CADA_VIDEO.md`.
