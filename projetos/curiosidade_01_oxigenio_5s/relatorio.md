# Relatório de verificação — curiosidade_01_oxigenio_5s

- Arquivo: `saida/curiosidade_01_oxigenio_5s/curiosidade_01_oxigenio_5s.mp4` (+ `curiosidade_01_oxigenio_5s.srt`, folha `curiosidade_01_oxigenio_5s_qa.jpg`, capturas `captura_*.jpg`)
- ffprobe: h264 yuv420p 1080x1920 @ 30/1 · áudio aac 48000 Hz 2 canais
- Duração: vídeo 70.27 s · áudio 70.27 s · narração 70.25 s (última fala termina em 68.84 s)
- Decodificação completa (ffmpeg -v error): sem erros
- Loudness -14.7 LUFS · pico -3.8 dBFS · maior amostra 0.631 (sem clipping)
- Volume RMS por janela de 4 s: [-19.1, -18.4, -18.5, -19.0, -17.8, -19.3, -18.2, -18.0, -19.4, -18.0, -18.1, -18.7, -19.5, -18.4, -18.6, -18.6, -18.2, -24.8]
- QA automático (pretos/congelados/duração): problemas [] · avisos []
- Conferido visualmente: quadros de todas as cenas antes do render, folha de QA e capturas do início, fim e de cada troca de cena.
- Não testado: audição humana do áudio (verificado por medição de volume, sincronismo pelos tempos reais das palavras).

## Observações
- Overlay HyperFrames (gráfico 1/5 do ar + medidor de pressão) composto na cena 3.
- Transições: dissolve de 0,2 s entre cenas (as capturas tiradas exatamente na troca mostram a sobreposição).
- Travessão da cena 4 trocado por vírgula (só pontuação).
