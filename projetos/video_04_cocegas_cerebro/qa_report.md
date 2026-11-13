# QA — video_04_cocegas_cerebro

**Arquivo:** `saida/video_04_cocegas_cerebro.mp4` (local; MP4 não versionado) · folha `saida/video_04_cocegas_cerebro_qa.jpg`

| Item | Resultado (ffprobe / qa.py) |
|---|---|
| Resolução | 1080×1920 (9:16), yuv420p |
| FPS | 30 |
| Codec | H.264 + AAC |
| Duração | ≈ 96,47 s (vídeo = áudio = narração; ≤ 110 s) |
| Loudness | −14,8 LUFS, pico −4,1 dBFS |
| Quadros pretos / congelados | nenhum |
| Áudio por janela de 4 s | −18 a −20 dB RMS até o fim da fala (cauda final em silêncio musical) |
| Problemas | `[]` |

## Conteúdo
- 12 cenas = 12 falas exatas (`scene_manifest.json`), voz Kokoro `pm_alex` 1,0 sem aceleração. A fala natural do roteiro dá 96,5 s (abaixo do alvo 1:35–1:50, dentro do máximo); não foram inseridas pausas artificiais longas.
- Ciência: a pele sente nos dois casos (sensores acendem com a própria mão e com a do amigo); atenuação de percepção, nunca "pele desligada"; cerebelo mostrado em rede; "quase nunca"/"pode" mantidos; experimento de atraso sem milissegundos, aparelho específico ou porcentagens.
- Cócegas lúdicas, breves e consentidas (gesto de pedir permissão), todos adultos.
- Revisão após o 1º render: o letreiro "A PELE SENTE" coincidia com a legenda na cena 2 → movido para o topo e vídeo renderizado de novo.
- Isolamento: busca por "oceano", "mergulh", "imortal", "Rafael" nos .tsx/.json do projeto → nenhum resultado.
- Risadas: sem áudio de risada no repositório; reação mostrada por animação (boca, olhos, tronco). HyperFrames disponível, não usado.
