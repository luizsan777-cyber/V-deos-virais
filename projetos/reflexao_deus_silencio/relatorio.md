# Relatório de verificação — reflexao_deus_silencio

- Arquivo: `saida/reflexao_deus_silencio/reflexao_deus_silencio.mp4` (+ `reflexao_deus_silencio.srt`, folha `reflexao_deus_silencio_qa.jpg`, capturas `captura_*.jpg`)
- ffprobe: h264 yuv420p 1080x1920 @ 30/1 · áudio aac 48000 Hz 2 canais
- Duração: vídeo 83.73 s · áudio 83.73 s · narração 83.70 s (última fala termina em 81.50 s)
- Decodificação completa (ffmpeg -v error): sem erros
- Loudness -14.9 LUFS · pico -4.2 dBFS · maior amostra 0.619 (sem clipping)
- Volume RMS por janela de 4 s: [-18.4, -19.7, -19.1, -19.2, -19.9, -20.0, -19.8, -18.1, -20.0, -18.4, -18.4, -19.3, -18.6, -19.2, -20.5, -19.2, -19.1, -19.1, -20.3, -18.5, -24.0]
- QA automático (pretos/congelados/duração): problemas [] · avisos []
- Conferido visualmente: quadros de todas as cenas antes do render, folha de QA e capturas do início, fim e de cada troca de cena.
- Não testado: audição humana do áudio (verificado por medição de volume, sincronismo pelos tempos reais das palavras).

## Observações
- Voz: Kokoro pm_alex 0,95 (configurada nos vídeos), pausas do perfil biblico; trilha original 'reflexao' (piano) + chuva sintetizada; Mateus 11:28 (NVI) igual na fala e na tela.
- Defeito de composição do navegador em 19 quadros (cena 3, ~15 s) detectado por comparação quadro a quadro; trecho 435–470 substituído por quadros renderizados isoladamente; nova comparação: 0 quadros com defeito.
