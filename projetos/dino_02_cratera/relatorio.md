# Relatório de verificação — dino_02_cratera

- Arquivo: `saida/dino_02_cratera/dino_02_cratera.mp4` (+ `dino_02_cratera.srt`, folha `dino_02_cratera_qa.jpg`, capturas `captura_*.jpg`)
- ffprobe: h264 yuv420p 1080x1920 @ 30/1 · áudio aac 48000 Hz 2 canais
- Duração: vídeo 75.27 s · áudio 75.27 s · narração 75.25 s (última fala termina em 73.86 s)
- Decodificação completa (ffmpeg -v error): sem erros
- Loudness -14.9 LUFS · pico -4.2 dBFS · maior amostra 0.627 (sem clipping)
- Volume RMS por janela de 4 s: [-18.0, -19.0, -19.5, -18.4, -18.5, -18.4, -19.0, -18.5, -18.5, -18.9, -18.0, -19.1, -18.4, -18.0, -18.9, -18.8, -18.5, -18.3, -21.6]
- QA automático (pretos/congelados/duração): problemas [] · avisos []
- Conferido visualmente: quadros de todas as cenas antes do render, folha de QA e capturas do início, fim e de cada troca de cena.
- Não testado: audição humana do áudio (verificado por medição de volume, sincronismo pelos tempos reais das palavras).

## Observações
- Inspiração: referência 2:40–3:50 (clarão, corte do solo com a cratera de ~100 km, crosta fluindo, montanha temporária).
- Cortes do terreno sinalizados como esquemáticos e fora de escala; perfuração de 2016 = expedição IODP 364 (Morgan et al. 2016).
- Fontes: ver projetos/dino_02_cratera/roteiro.md.
