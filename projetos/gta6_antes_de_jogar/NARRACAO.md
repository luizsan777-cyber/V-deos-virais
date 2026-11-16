# GTA 6 — Faça isso antes de jogar · narração usada (versão 2: Chatterbox PT-BR)

Voz escolhida pelo usuário (amostra C-cadu): **Chatterbox Multilingual PT-BR** (ResembleAI/Chatterbox-Multilingual-pt-br, MIT), com referência de timbre e sotaque da voz sintética brasileira Piper `pt_BR-cadu-medium` (dataset CC0). Ajustes: expressividade 0,55, cfg 0,45, temperatura 0,8, velocidade natural (sem aceleração).

A versão 1 (Kokoro pm_alex) foi guardada em `saida/gta6_antes_de_jogar_v1_kokoro/`.

| Bloco | Tomada (semente) | Início | Fim | Texto narrado |
|---|---|---|---|---|
| c01 | 7 | 0.2 s | 10.0 s | GTA 6 chega dia 19! Mas antes de sair acelerando por Vice City, faz essas coisas pra aproveitar melhor o jogo desde o começo. |
| c02 | 11 | 10.5 s | 21.8 s | Primeiro: dá uma olhada nas configurações de imagem da sua TV. Se ela tiver o Modo Jogo, vale ativar: ele pode reduzir o atraso entre o comando no controle e a ação na tela. |
| c03 | 11 | 22.3 s | 34.0 s | Agora confere o brilho e, se sua TV tiver HDR, calibra essa opção no console. Uma imagem escura demais pode esconder detalhes; clara demais pode apagar as cores. |
| c04 | 21 | 34.5 s | 48.2 s | Terceiro: abre as opções de áudio e acessibilidade e ajusta o que estiver disponível pro seu jeito de jogar. Se tiver legendas, tamanho de texto ou volume das falas, isso pode fazer diferença pra acompanhar a história. |
| c05 | 7 | 48.8 s | 53.7 s | E uma dica pras primeiras horas: não sai correndo só atrás de missão. |
| c06 | 11 | 54.2 s | 66.1 s | Explora a cidade, presta atenção no ambiente e experimenta os controles com calma. Você vai se acostumando com o mundo e pode encontrar detalhes que passariam despercebidos. |
| c07 | 33 | 66.6 s | 73.5 s | Por último, evita spoiler: se quiser descobrir a história sozinho, toma cuidado com vídeos e comentários nas redes. |
| c08 | 11 | 74.0 s | 79.6 s | Agora me conta: qual vai ser a primeira coisa que você vai fazer quando entrar no GTA 6? |

## Como as tomadas foram escolhidas

Para cada fala foram geradas até 4 tomadas (sementes 7, 11, 21 e 33) e transcritas automaticamente; ficou a que mais bate com o texto. Ex.: na c04 a semente 7 soava "teve ser o" no lugar de "Terceiro"; a 21 diz "Terceiro".

## Alterações em relação ao texto enviado

1. **Abertura:** "GTA 6 chega dia 19!" no lugar de "GTA 6 finalmente lançou!" (em 16/11/2026 o site oficial ainda diz *Coming November 19, 2026*).
2. **Acessibilidade:** fala condicional ("Se tiver legendas, tamanho de texto ou volume das falas…"), porque a lista oficial de opções do GTA 6 não foi publicada.
3. Pronúncia só no áudio (campo `tts_chatterbox`): "Vaice Síti", "tevê", "agá dê érre", "spóiler". A legenda usa a escrita normal.
