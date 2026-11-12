# EPISÓDIO — E se a 3ª Guerra Mundial começasse hoje?

**Formato:** animação 2D original, vertical 1080 × 1920, 30 FPS, narração pt-BR informal e didática.

**Importante:** É uma **SIMULAÇÃO FICTÍCIA**, não notícia real. A tela deve manter a tarja "SIMULAÇÃO FICTÍCIA" ou equivalente em todas as cenas de alerta. Não afirmar que EUA e China estão em guerra. Evitar reproduzir marcas reais de emissoras como se fossem boletins atuais.

## Referência e preservação da estética
O usuário enviou `E_se_Jesus_voltasse_hoje_2D_FINAL.mp4`, guardado no Drive:
https://drive.google.com/file/d/1vAihjGdpYkrk5l1RK5OVkS3pK6bnUQol/view?usp=drivesdk

O **arquivo MP4 original ainda não está incluído como blob no GitHub**. Foi tentado upload direto, mas a conexão falhou para o arquivo de 41 MB. O Drive contém o original. Este documento registra a referência e o plano de edição, **não afirma uma análise quadro a quadro**.

O desejo específico do usuário é recuperar a linguagem de "alertas nos celulares" do vídeo de Jesus. Para não depender de conteúdo indisponível na execução Cloud, `Video.tsx` contém uma **recriação animada original** de celulares e cartões de alerta. Se o Claude tiver acesso autorizado ao MP4 do Drive, analisar a cena dos celulares e ajustar os movimentos e paleta em um novo commit, preservando a autonomia do projeto. Não inserir imagens religiosas no cenário de guerra nem inventar que as imagens mostram eventos bélicos. O usuário possui o original enviado.

## Base de personagens
Usar o rig do próprio projeto em `engine/src/kit/Personagem.tsx`, `poses.ts`, `expressoes.ts` e `Legendas.tsx`:
- Leo: jovem brasileiro com moletom vermelho, figura recorrente que conecta abertura e final.
- Ana: especialista / representante diplomática estilizada, jaleco e expressões sérias.
- João: trabalhador/cidadão, roupa azul.
- Não substituir personagens por bolas e cilindros, nem por fotos estáticas com zoom.
- Atualizar o elenco de acordo com continuidade e visibilidade dos rostos.

## Plano de cena (11 tomadas narrativas; horários definidos pela duração REAL da voz)
| ID | Narração | Composição e movimento de câmera | Som e legibilidade |
|---|---|---|---|
| 01 | gancho | Leo olha para o celular; dois aparelhos entram com notificações "EUA x CHINA?" enquanto a cidade escurece | Ding e impacto leve, manter simulação na tela |
| 02 | taiwan | Oceano, navios, radar circular e rótulo Taiwan, sem mapas de alvos | Whoosh, transição para vista ampla |
| 03 | ataques | Silhuetas de drones voando, navio e clarão ilustrativo distante; não descrever trajetórias técnicas | Camadas de nuvens/água e som de alerta |
| 04 | internet | Dois celulares, falha de conexão, "vazamento?" e "fonte não verificada" | Glitch, deixar claro que boato não é prova |
| 05 | mundo | Globo ilustrado, etiquetas Japão/Coreia/Europa, circulação de notícias | Efeitos discretos, sem atribuir ações certas a governos |
| 06 | cadeias | Contêineres e cargueiro em movimento, conceito de ruptura logística | O comércio não para automaticamente em todo o planeta |
| 07 | brasil | Cidade brasileira, Leo reage a dólar e combustível, cartões sem valores inventados | Sons leves, cores brasileiras em detalhes |
| 08 | comercio | Porto, contêineres e setor exportador; palavras agro, mineração, empregos | Mostrar efeitos como possibilidades, não certezas |
| 09 | diplomacia | Personagens em reunião; placa "não é automático" | Separar decisões diplomáticas de alianças militares |
| 10 | escalada | Terra e ondas de alerta; risco nuclear representado por aviso, não explosão especulativa | Baixar trilha; importância das negociações |
| 11 | final | Voltar ao celular de Leo, alerta econômico e questionamento final | Som de notificação, frase final clara |

## Montagem e atenção
1. Início: alerta em celular nos primeiros 2 segundos, sem vinheta longa.
2. A cada cena deve haver ação visível: braços, olhos, telas, drones, água, objetos, câmera e/ou rótulos em movimento.
3. Personagens consistentes entre cenas. Evitar falsa notícia ou brasão oficial.
4. Legendas brancas, palavra-chave amarela, 2–3 palavras por bloco, na área segura.
5. Legenda e animação precisam seguir a narração REAL; usar `T.fala()` e `T.palavra()`.
6. Sincronizar efeitos de telefone com o roteiro, não apenas ruído aleatório.
7. Cenários simples, mas ricos em detalhes — parar e revisar os quadros aos 0s, 2s e em cada transição.
8. Uma guerra nuclear **não é inevitável**; nunca mostrar previsão de destruição brasileira como fato.
9. Não executar novos serviços pagos sem autorização.

## Execução técnica (Claude Code)
```bash
cd engine && npm ci && npx tsc --noEmit -p . && cd ..
python ferramentas/produzir.py projetos/terceira-guerra-mundial --stills 0,60,180 --escala 0.5
python ferramentas/produzir.py projetos/terceira-guerra-mundial
```
**Recomendação:** renderizar primeiro uma prévia curta e conferir frames/áudio. O GitHub Actions `renderizar.yml` é acionado automaticamente por alterações em `projeto.json` ou `Video.tsx`, mas não existe garantia de que o job conclua sem falhas.

## Conferência antes de publicar
- [ ] Voz em português brasileiro natural
- [ ] Aparelhos e notificações visíveis nos primeiros segundos
- [ ] Leo reconhecível na abertura e no final
- [ ] Pelo menos uma tomada animada com drones
- [ ] Cenário do Brasil e explicação de efeitos econômicos
- [ ] Tarja de simulação presente e legível
- [ ] Legendas corretas, sem erros de acentuação e sem cobrir rostos
- [ ] MP4 decodificado até último frame e áudio revisado
- [ ] `qa.json` sem problemas críticos e quadro de contato revisado


---

## Implementação (12/11/2026) — o que foi feito de fato

**Referência do Drive:** o arquivo `E_se_Jesus_voltasse_hoje_2D_FINAL.mp4` existe no Drive do usuário (41 MB), mas a
única via de acesso disponível devolve o arquivo inteiro como texto base64 dentro da conversa (inviável nesse
tamanho), e o container não alcança o Drive. **Nenhuma análise visual do vídeo foi feita.** A linguagem de celulares
(tela de bloqueio com hora, notificações empilhadas que caem com "pop", vibração, close na mão, tela que reflete
cenas) foi criada a partir da descrição do pedido.

**Arquivos:** `Video.tsx` (orquestra 11 cenas, legenda por cena, tarja), `cenasA.tsx` (1–4), `cenasB.tsx` (5–8),
`cenasC.tsx` (9–11), `pecas.tsx` (celulares, notificações, navios/drones genéricos, cargueiro, porto, fábrica, chips,
posto, mercado, cidades, radar, servidores, bandeira estilizada), `elenco.tsx` (Leo, jornalista, trabalhadora,
militares, cidadãos de 3 regiões, diplomatas — definidos uma vez).

**Kit (extensões compatíveis):** `Personagem` aceita `itemD/itemE` (objeto na mão); pose `olhandoCelular`;
`Globo.tsx` + `geo.ts` (globo ortográfico com destaque de EUA, China, Taiwan, Japão, Coreia do Sul, Europa, Brasil,
alertas, rotas e rótulos); `Camera` aceita `inicio` (chaves em tempo local da tomada) e a deriva passou a contar da
1ª chave; `voz.py` aceita `velocidade` por fala e corrige ordem de palavras sem silêncio; `audio.py` ganhou
vibracao, notificacao, drone, alarme, radar, buzina, cidade, ondas, guindaste, estatica, trilha `tensao` e
`musica.automacao` (volume por cena: mais baixa na diplomacia e no trecho nuclear).

**Cuidados de conteúdo:** tarja "SIMULAÇÃO FICTÍCIA" em todas as cenas; notificações marcadas como simulação;
Taiwan explicado como ponto de partida *desta* simulação; ataques só como drones genéricos, linha de luz e clarões
distantes (sem alvos, trajetórias ou procedimentos); vazamento como "suposto, sem confirmação"; nenhum valor
inventado de dólar/combustível ("R$ ?", "pressão de alta" ilustrativa); dado real com fonte: ~28,7% das exportações
brasileiras de 2025 foram para a China (MDIC/Secex); risco nuclear como aviso, sem explosão; final com "não é previsão".
