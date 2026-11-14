# Relatório de verificação — curiosidade_02_lua_sumiu

- Arquivo: `saida/curiosidade_02_lua_sumiu/curiosidade_02_lua_sumiu.mp4` (+ `curiosidade_02_lua_sumiu.srt`, folha `curiosidade_02_lua_sumiu_qa.jpg`, capturas `captura_*.jpg`)
- ffprobe: h264 yuv420p 1080x1920 @ 30/1 · áudio aac 48000 Hz 2 canais
- Duração: vídeo 75.73 s · áudio 75.73 s · narração 75.71 s (última fala termina em 74.31 s)
- Decodificação completa (ffmpeg -v error): sem erros
- Loudness -14.7 LUFS · pico -4.4 dBFS · maior amostra 0.619 (sem clipping)
- Volume RMS por janela de 4 s: [-18.5, -18.9, -18.2, -18.6, -18.5, -18.5, -18.9, -18.1, -18.8, -18.7, -19.2, -18.6, -18.3, -19.1, -17.2, -19.1, -18.9, -18.6, -20.3]
- QA automático (pretos/congelados/duração): problemas [] · avisos []
- Conferido visualmente: quadros de todas as cenas antes do render, folha de QA e capturas do início, fim e de cada troca de cena.
- Não testado: audição humana do áudio (verificado por medição de volume, sincronismo pelos tempos reais das palavras).

## Observações
- Overlay HyperFrames (Terra–Lua, sinal de ~1,3 s; a linha percorre o trajeto em 1,3 s reais) composto na cena 2.
- 1º render: selo 'NOITE' encostava na legenda (cena 7) → movido para baixo e vídeo renderizado de novo; conferido no quadro de 55,3 s.
- Marés: Sol também influencia; inclinação/clima como longo prazo, sem prazos.
