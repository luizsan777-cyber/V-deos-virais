# Relatório de verificação — curiosidade_03_buraco_negro

- Arquivo: `saida/curiosidade_03_buraco_negro/curiosidade_03_buraco_negro.mp4` (+ `curiosidade_03_buraco_negro.srt`, folha `curiosidade_03_buraco_negro_qa.jpg`, capturas `captura_*.jpg`)
- ffprobe: h264 yuv420p 1080x1920 @ 30/1 · áudio aac 48000 Hz 2 canais
- Duração: vídeo 77.57 s · áudio 77.57 s · narração 77.56 s (última fala termina em 76.16 s)
- Decodificação completa (ffmpeg -v error): sem erros
- Loudness -14.9 LUFS · pico -3.9 dBFS · maior amostra 0.636 (sem clipping)
- Volume RMS por janela de 4 s: [-18.7, -18.2, -18.8, -19.1, -18.4, -19.8, -18.4, -18.7, -18.4, -18.4, -19.0, -18.7, -20.4, -19.5, -18.3, -17.8, -19.5, -18.5, -18.7, -48.8]
- QA automático (pretos/congelados/duração): problemas [] · avisos []
- Conferido visualmente: quadros de todas as cenas antes do render, folha de QA e capturas do início, fim e de cada troca de cena.
- Não testado: audição humana do áudio (verificado por medição de volume, sincronismo pelos tempos reais das palavras).

## Observações
- Overlay HyperFrames (painel de forças de maré) composto na cena 6.
- Buraco negro supermassivo idealizado, sem disco quente; horizonte como linha tracejada; espaguetificação simbólica, sem ferimentos.
- Os últimos ~0,5 s após a fala têm só a música baixando (janela final de RMS mais baixa), sem tela preta.
