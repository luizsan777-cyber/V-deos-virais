# QA — video_03_imortalidade

**Arquivo:** `saida/video_03_imortalidade.mp4` (local; MP4 não versionado) · folha `saida/video_03_imortalidade_qa.jpg`

| Item | Resultado (ffprobe / qa.py) |
|---|---|
| Resolução | 1080×1920 (9:16), yuv420p |
| FPS | 30 |
| Codec | H.264 + AAC |
| Duração | vídeo 107,30 s · áudio 107,30 s · narração 107,30 s (≤ 110 s) |
| Loudness | −14,9 LUFS, pico −4,0 dBFS |
| Quadros pretos / congelados | nenhum |
| Áudio por janela de 4 s | −18 a −20 dB RMS do início ao fim (cauda final mais baixa) |
| Problemas | `[]` |

## Conteúdo
- 12 cenas = 12 falas exatas (`scene_manifest.json`), voz única Kokoro `pm_santa` 1,0 (sem aceleração). Para caber em 110 s, só as pausas entre falas foram reduzidas (0,95 → 0,55 s); 1ª geração tinha 112,3 s.
- Premissa explícita como hipótese: ninguém morre, mas doença, dor e envelhecimento continuam; nenhum colapso apresentado como inevitável; painel de recursos marcado "ilustrativa", sem números.
- Mesmo protagonista em todas as idades (cabelo castanho → branco interpolado, rugas e postura graduais; camisa azul royal sempre).
- Cidade cresce por construção andar a andar, transporte e pedestres; árvore/praça como âncora até o plano final.
- Sem violência gráfica (grupos discutem e há mediação; sem armas), sem autoagressão.
- Isolamento: busca por "oceano", "mergulh", "cócegas", "Rafael" nos .tsx/.json do projeto → nenhum resultado.
- Alinhamento de legendas: corrigido em `ferramentas/voz.py` um caso em que duas palavras eram coladas num micro-silêncio.
- HyperFrames: disponível, não usado (painéis e letreiros ficaram coerentes no Remotion).
