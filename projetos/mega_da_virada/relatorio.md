# Relatório de verificação — mega_da_virada

- Arquivo: `saida/mega_da_virada/mega_da_virada.mp4` (+ `mega_da_virada.srt`, folha `mega_da_virada_qa.jpg`, capturas `captura_*.jpg`)
- ffprobe: h264 yuv420p 1080x1920 @ 30/1 · áudio aac 48000 Hz 2 canais
- Duração: vídeo 62.97 s · áudio 62.97 s · narração 62.94 s (última fala termina em 62.04 s)
- Decodificação completa (ffmpeg -v error): sem erros
- Loudness -14.9 LUFS · pico -4.3 dBFS · maior amostra 0.603 (sem clipping)
- Volume RMS por janela de 4 s: [-17.6, -16.9, -18.2, -16.5, -17.9, -18.3, -18.6, -17.2, -16.5, -17.1, -16.9, -16.8, -16.9, -18.8, -19.7, -20.2]
- QA automático (pretos/congelados/duração): problemas [] · avisos []
- Conferido visualmente: quadros de todas as cenas antes do render, folha de QA e capturas do início, fim e de cada troca de cena.
- Não testado: audição humana do áudio (verificado por medição de volume, sincronismo pelos tempos reais das palavras).

## Observações
- Voz de teste: Qwen3-TTS 0.6B CustomVoice, voz Aiden (abertura = tomada aprovada 'Aiden grito'; demais falas escolhidas por transcrição). Kokoro do projeto não foi alterado.
- Fatos: C(60,6)=50.063.860 (aposta simples); prêmio não acumula, passa para 5 e 4 acertos; prêmio dividido entre ganhadores. Números de cartões e bolas são fictícios.
