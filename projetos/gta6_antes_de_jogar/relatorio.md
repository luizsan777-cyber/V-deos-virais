# Relatório de verificação — gta6_antes_de_jogar

- Arquivo: `saida/gta6_antes_de_jogar/gta6_antes_de_jogar.mp4` (+ `gta6_antes_de_jogar.srt`, folha `gta6_antes_de_jogar_qa.jpg`, capturas `captura_*.jpg`)
- ffprobe: h264 yuv420p 1080x1920 @ 30/1 · áudio aac 48000 Hz 2 canais
- Duração: vídeo 73.43 s · áudio 73.43 s · narração 73.42 s (última fala termina em 72.53 s)
- Decodificação completa (ffmpeg -v error): sem erros
- Loudness -14.9 LUFS · pico -4.1 dBFS · maior amostra 0.618 (sem clipping)
- Volume RMS por janela de 4 s: [-18.2, -18.7, -18.5, -18.5, -19.0, -18.1, -17.9, -19.2, -18.2, -18.9, -19.2, -18.4, -18.5, -18.4, -19.2, -18.2, -19.1, -18.3, -31.9]
- QA automático (pretos/congelados/duração): problemas [] · avisos []
- Conferido visualmente: quadros de todas as cenas antes do render, folha de QA e capturas do início, fim e de cada troca de cena.
- Não testado: audição humana do áudio (verificado por medição de volume, sincronismo pelos tempos reais das palavras).

## Observações
- Versão 3 (pós-lançamento, publicar a partir de 19/11/2026 após conferir o lançamento): voz Kokoro pm_alex 0,95 / curiosidades; trilha original synthwave_animado ~16 dB abaixo da voz.
- Removidos trecho do trailer com pistola (lowrider) e imagem Grassrivers_04 (possível arma); substituídos por material oficial sem armas.
