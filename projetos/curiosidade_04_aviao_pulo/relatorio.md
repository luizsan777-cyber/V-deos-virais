# Relatório de verificação — curiosidade_04_aviao_pulo

- Arquivo: `saida/curiosidade_04_aviao_pulo/curiosidade_04_aviao_pulo.mp4` (+ `curiosidade_04_aviao_pulo.srt`, folha `curiosidade_04_aviao_pulo_qa.jpg`, capturas `captura_*.jpg`)
- ffprobe: h264 yuv420p 1080x1920 @ 30/1 · áudio aac 48000 Hz 2 canais
- Duração: vídeo 63.30 s · áudio 63.30 s · narração 63.30 s (última fala termina em 61.90 s)
- Decodificação completa (ffmpeg -v error): sem erros
- Loudness -14.9 LUFS · pico -4.3 dBFS · maior amostra 0.632 (sem clipping)
- Volume RMS por janela de 4 s: [-18.8, -18.5, -18.3, -19.3, -18.3, -18.1, -19.5, -18.5, -18.9, -18.4, -19.2, -17.6, -20.1, -17.9, -19.2, -21.8]
- QA automático (pretos/congelados/duração): problemas [] · avisos []
- Conferido visualmente: quadros de todas as cenas antes do render, folha de QA e capturas do início, fim e de cada troca de cena.
- Não testado: audição humana do áudio (verificado por medição de volume, sincronismo pelos tempos reais das palavras).

## Observações
- Overlay HyperFrames (balança de massas ilustrativa + sustentação) composto na cena 6; o selo 'SUSTENTAÇÃO SEGUE' fica sobre o desenho do avião, mas legível.
- Hipótese didática; cena 8 reforça seguir a tripulação e o sinal de cinto. Sem quantificação, sem queda ou pânico.
