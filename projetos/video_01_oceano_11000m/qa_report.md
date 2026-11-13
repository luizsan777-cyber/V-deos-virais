# QA — video_01_oceano_11000m

**Arquivo:** `saida/video_01_oceano_11000m.mp4` (gerado localmente; MP4 não é versionado no Git) · folha de quadros `saida/video_01_oceano_11000m_qa.jpg`

| Item | Resultado (ffprobe / qa.py) |
|---|---|
| Resolução | 1080×1920 (9:16), yuv420p |
| FPS | 30 |
| Codec | H.264 (high) + AAC 48 kHz |
| Duração | vídeo 102,77 s · áudio 102,77 s · narração 102,74 s (≤ 110 s) |
| Loudness | −14,9 LUFS integrado, pico −4,1 dBFS |
| Quadros pretos / congelados | nenhum (blackdetect / freezedetect) |
| Áudio por janela de 4 s | −18 a −20 dB RMS do início ao fim (narração contínua; só a cauda final de 0,7 s é mais baixa) |
| Problemas | `[]` |

## Conteúdo
- 12 cenas = 12 falas exatas do roteiro (`scene_manifest.json`), voz única Kokoro `pm_alex` em velocidade 1,0 (sem aceleração), 241 palavras, sem palavras repetidas/fora de ordem.
- Legendas palavra a palavra alinhadas à voz; destaques em amarelo.
- Ciência: +1 atm a cada 10 m; "≈ 1.100 ATM — aproximadamente" (ordem de grandeza); gás × água ilustrado sem "corpo de lata"; nenhum mergulhador vivo a 11 km (trajetória sem proteção termina muito antes, sem corpo caindo); fauna = anfípodes/organismos genéricos, sem peixes de outras zonas; tímpano e pulmões em 2D sem gore.
- Isolamento: nenhum asset, personagem, fala ou legenda dos vídeos 02/03/04 (busca por "imortal", "cócegas", "Rafael" nos arquivos do projeto: nenhum resultado).
- HyperFrames: instalado e funcional no repositório, mas não usado neste episódio (régua, setas e letreiros ficaram mais coerentes no próprio Remotion).
- Inspeção visual: quadros de começo/meio/fim de cada cena conferidos antes do render; folha final conferida.
