# Relatório de verificação — dino_01_estrela

- Arquivo: `saida/dino_01_estrela/dino_01_estrela.mp4` (+ `dino_01_estrela.srt`, folha `dino_01_estrela_qa.jpg`, capturas `captura_*.jpg`)
- ffprobe: h264 yuv420p 1080x1920 @ 30/1 · áudio aac 48000 Hz 2 canais
- Duração: vídeo 76.47 s · áudio 76.47 s · narração 76.46 s (última fala termina em 75.06 s)
- Decodificação completa (ffmpeg -v error): sem erros
- Loudness -14.8 LUFS · pico -4.2 dBFS · maior amostra 0.609 (sem clipping)
- Volume RMS por janela de 4 s: [-18.2, -18.9, -19.2, -17.7, -19.8, -17.9, -18.6, -18.4, -18.1, -20.2, -18.2, -17.8, -19.7, -18.9, -18.1, -18.7, -18.6, -19.3, -19.5, -52.4]
- QA automático (pretos/congelados/duração): problemas [] · avisos []
- Conferido visualmente: quadros de todas as cenas antes do render, folha de QA e capturas do início, fim e de cada troca de cena.
- Não testado: audição humana do áudio (verificado por medição de volume, sincronismo pelos tempos reais das palavras).

## Observações
- Inspiração: referência 1:20–2:30 (o ponto de luz no céu, escala do asteroide, velocidade e entrada na atmosfera).
- Tamanho ~10 km, 12–20 km/s, local em Iucatã (mar raso): Imperial College / Chicxulub. Everest 8.849 m. Asteroide sinalizado como RECONSTRUÇÃO ARTÍSTICA.
- Correções após exportações anteriores: textos do mapa, régua do Everest e rótulos de altitude sem sobreposição.
