# Relatório de verificação — dino_05_inverno

- Arquivo: `saida/dino_05_inverno/dino_05_inverno.mp4` (+ `dino_05_inverno.srt`, folha `dino_05_inverno_qa.jpg`, capturas `captura_*.jpg`)
- ffprobe: h264 yuv420p 1080x1920 @ 30/1 · áudio aac 48000 Hz 2 canais
- Duração: vídeo 72.53 s · áudio 72.53 s · narração 72.52 s (última fala termina em 71.12 s)
- Decodificação completa (ffmpeg -v error): sem erros
- Loudness -14.8 LUFS · pico -4.3 dBFS · maior amostra 0.605 (sem clipping)
- Volume RMS por janela de 4 s: [-18.6, -18.1, -18.2, -19.2, -17.7, -19.4, -19.4, -18.6, -18.4, -18.3, -19.2, -18.8, -18.1, -19.2, -18.0, -19.2, -18.4, -19.1, -63.1]
- QA automático (pretos/congelados/duração): problemas [] · avisos []
- Conferido visualmente: quadros de todas as cenas antes do render, folha de QA e capturas do início, fim e de cada troca de cena.
- Não testado: audição humana do áudio (verificado por medição de volume, sincronismo pelos tempos reais das palavras).

## Observações
- Inspiração: referência 6:45–8:55 (escuridão, frio, colapso da cadeia alimentar, ~75% das espécies, sobreviventes).
- Escuridão de ~2 anos: Senel et al. 2023 (Nature Geoscience); ~3/4 das espécies extintas; aves como dinossauros sobreviventes. Grade 15/20 marcada como quadro ilustrativo.
- Correção após a 1ª exportação: réptil marinho e hadrossauro reposicionados fora da área da legenda.
