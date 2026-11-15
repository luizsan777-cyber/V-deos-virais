# Relatório de verificação — dino_03_tsunami

- Arquivo: `saida/dino_03_tsunami/dino_03_tsunami.mp4` (+ `dino_03_tsunami.srt`, folha `dino_03_tsunami_qa.jpg`, capturas `captura_*.jpg`)
- ffprobe: h264 yuv420p 1080x1920 @ 30/1 · áudio aac 48000 Hz 2 canais
- Duração: vídeo 68.67 s · áudio 68.67 s · narração 68.64 s (última fala termina em 67.24 s)
- Decodificação completa (ffmpeg -v error): sem erros
- Loudness -14.8 LUFS · pico -4.2 dBFS · maior amostra 0.615 (sem clipping)
- Volume RMS por janela de 4 s: [-18.1, -18.7, -18.4, -18.8, -19.0, -18.6, -18.1, -18.9, -18.0, -18.9, -20.0, -17.8, -18.8, -18.2, -19.1, -18.7, -19.5, -64.8]
- QA automático (pretos/congelados/duração): problemas [] · avisos []
- Conferido visualmente: quadros de todas as cenas antes do render, folha de QA e capturas do início, fim e de cada troca de cena.
- Não testado: audição humana do áudio (verificado por medição de volume, sincronismo pelos tempos reais das palavras).

## Observações
- Inspiração: referência 3:50–5:20 (abalo, tsunami e a menção às erupções na Índia).
- Altura de ~1,5 km e ondas >10 m em litorais distantes: simulação de Range et al. 2022 (AGU Advances). Ligação com o Deccan marcada na tela como HIPÓTESE EM DEBATE.
- Correção após a 1ª exportação: nota do globo saiu de trás da legenda.
