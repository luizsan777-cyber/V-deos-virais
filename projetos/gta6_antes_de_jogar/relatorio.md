# Relatório de verificação — gta6_antes_de_jogar

- Arquivo: `saida/gta6_antes_de_jogar/gta6_antes_de_jogar.mp4` (+ `gta6_antes_de_jogar.srt`, folha `gta6_antes_de_jogar_qa.jpg`, capturas `captura_*.jpg`)
- ffprobe: h264 yuv420p 1080x1920 @ 30/1 · áudio aac 48000 Hz 2 canais
- Duração: vídeo 74.47 s · áudio 74.47 s · narração 74.47 s (última fala termina em 73.56 s)
- Decodificação completa (ffmpeg -v error): sem erros
- Loudness -14.8 LUFS · pico -4.2 dBFS · maior amostra 0.614 (sem clipping)
- Volume RMS por janela de 4 s: [-18.0, -18.4, -18.6, -19.1, -18.5, -18.2, -17.9, -19.5, -18.1, -19.1, -18.6, -18.5, -19.0, -18.6, -18.9, -18.6, -19.1, -18.2, -21.3]
- QA automático (pretos/congelados/duração): problemas [] · avisos []
- Conferido visualmente: quadros de todas as cenas antes do render, folha de QA e capturas do início, fim e de cada troca de cena.
- Não testado: audição humana do áudio (verificado por medição de volume, sincronismo pelos tempos reais das palavras).

## Observações
- Híbrido: avatar 2D do canal + trailer e imagens oficiais da Rockstar (etiquetados).
- Abertura adaptada para 'GTA 6 chega dia 19!' (jogo ainda não lançado em 16/11/2026); fala de acessibilidade condicional.
- Correções após 1ª exportação: primeiro quadro sem imagem, logo do trailer aparecendo na TV, zoom da cena 5.
