# Relatório de verificação — dino_04_ceu_forno

- Arquivo: `saida/dino_04_ceu_forno/dino_04_ceu_forno.mp4` (+ `dino_04_ceu_forno.srt`, folha `dino_04_ceu_forno_qa.jpg`, capturas `captura_*.jpg`)
- ffprobe: h264 yuv420p 1080x1920 @ 30/1 · áudio aac 48000 Hz 2 canais
- Duração: vídeo 67.33 s · áudio 67.33 s · narração 67.32 s (última fala termina em 65.92 s)
- Decodificação completa (ffmpeg -v error): sem erros
- Loudness -14.8 LUFS · pico -4.2 dBFS · maior amostra 0.622 (sem clipping)
- Volume RMS por janela de 4 s: [-18.4, -17.9, -19.9, -18.9, -18.1, -18.8, -20.1, -19.2, -17.9, -18.5, -19.0, -18.5, -18.1, -18.9, -18.9, -18.2, -20.7]
- QA automático (pretos/congelados/duração): problemas [] · avisos ["possíveis quadros congelados a partir de ['29.9667']s"]
- Conferido visualmente: quadros de todas as cenas antes do render, folha de QA e capturas do início, fim e de cada troca de cena.
- Não testado: audição humana do áudio (verificado por medição de volume, sincronismo pelos tempos reais das palavras).

## Observações
- Inspiração: referência 5:20–6:45 (destroços reentrando, calor no céu, incêndios e abrigos).
- Intensidade/duração do pulso de calor e alcance dos incêndios apresentados como DUAS HIPÓTESES (Robertson et al.; Belcher et al.); camada de fuligem e sinais mais fortes na América do Norte.
- Correção após a 1ª exportação: painéis de hipótese reposicionados acima da legenda.
