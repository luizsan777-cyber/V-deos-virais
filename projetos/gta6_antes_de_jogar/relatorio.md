# Relatório de verificação — gta6_antes_de_jogar

- Arquivo: `saida/gta6_antes_de_jogar/gta6_antes_de_jogar.mp4` (+ `gta6_antes_de_jogar.srt`, folha `gta6_antes_de_jogar_qa.jpg`, capturas `captura_*.jpg`)
- ffprobe: h264 yuv420p 1080x1920 @ 30/1 · áudio aac 48000 Hz 2 canais
- Duração: vídeo 80.50 s · áudio 80.50 s · narração 80.48 s (última fala termina em 79.58 s)
- Decodificação completa (ffmpeg -v error): sem erros
- Loudness -15.1 LUFS · pico -4.0 dBFS · maior amostra 0.621 (sem clipping)
- Volume RMS por janela de 4 s: [-18.4, -19.1, -17.7, -18.0, -18.3, -17.8, -17.9, -18.5, -19.2, -18.3, -18.6, -18.1, -17.9, -19.5, -18.3, -18.5, -20.4, -18.2, -18.7, -18.6, -60.4]
- QA automático (pretos/congelados/duração): problemas [] · avisos []
- Conferido visualmente: quadros de todas as cenas antes do render, folha de QA e capturas do início, fim e de cada troca de cena.
- Não testado: audição humana do áudio (verificado por medição de volume, sincronismo pelos tempos reais das palavras).

## Observações
- Versão 2: voz Chatterbox PT-BR (amostra C-cadu) com tomada escolhida por transcrição em cada fala; trilha original synthwave (sem música de terceiros), ~16 dB abaixo da voz.
- Trechos do trailer recortados para não mostrar armas nem outros planos; versão 1 (Kokoro) guardada em saida/gta6_antes_de_jogar_v1_kokoro/.
