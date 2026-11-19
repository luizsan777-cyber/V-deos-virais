# Vozes por personagem (complemento Vozes Heróis Marvel/DC)

Opcional e só sob pedido. Sem `vozes_herois` no `projeto.json`, a narração segue exatamente a configuração do
episódio (Kokoro `pm_alex` por padrão): nenhum modelo extra é carregado (testado byte a byte).

## Como escolher a voz

Um personagem narra o episódio todo:

```json
"vozes_herois": {"narrar_com": "dc/batman"}
```

Voz por fala (conversa); fala sem marcação = narração padrão do episódio:

```json
"vozes_herois": {},
"falas": [
  {"id": "abertura", "texto": "A cidade ainda estava acordada."},
  {"id": "b", "voz_personagem": "dc/batman", "texto": "Escuta antes de abrir."},
  {"id": "a", "voz_personagem": "marvel/peter-parker", "texto": "Tá bom. Mas eu já tinha ouvido."}
]
```

- Com `narrar_com`, use `"voz_personagem": "narrador"` numa fala para voltar à narração normal.
- IDs: os 69 de `ferramentas/perfis_vozes_herois.json` (iguais ao catálogo da skill `herois-2d`).
- Personagem/versão nova: `"vozes_herois": {"perfis": {"original/meu-heroi": "Adult male, ... timbre, idade, ritmo, energia"}}`.
- Por fala também valem: `pausa`, `velocidade`, `semente` (outra tomada), `audio_fixo` (tomada aprovada),
  `tts_personagem` (grafia só para a pronúncia).

## Como funciona

1. **VoiceDesign** (Qwen3-TTS 1.7B) cria uma referência sintética original de ~10 s por voz, a partir da descrição
   (sempre com a direção "Brazilian Portuguese"). Semente fixa por ID.
2. **Base** (Qwen3-TTS 1.7B) clona essa referência em cada fala → mesmo timbre em todos os episódios.
3. Roda no ambiente isolado `venv-qwen3` (`ferramentas/vozes_herois_servidor.py`); `QWEN3_PY` muda o Python.
   Modelos locais em `/home/user/ferramentas-externas/qwen3-modelos/Qwen3-TTS-12Hz-1.7B-{VoiceDesign,Base}`
   (senão baixa do Hugging Face). Se algo falhar, o `voz.py` para com erro: **nunca troca a voz em silêncio**.

## Referências (para manter as mesmas vozes)

- Ficam em `$VOZES_HEROIS_DIR` ou `~/.cache/viral-engine/referencias_herois/` (`<id>-<hash>.wav`).
- `ferramentas/referencias_vozes_herois.json` (versionado) guarda ID, arquivo, SHA-256, descrição e semente de
  cada referência aprovada. Para reutilizar em outra sessão, coloque os WAVs aprovados de volta na pasta acima e
  confira o SHA-256. Se a referência sumir, o modelo cria outro timbre a partir da mesma descrição.
- **Os WAVs não são versionados** porque este repositório é público (o pacote pede pasta durável privada).
- São vozes sintéticas originais: nada de gravação de dublador nem de voz pessoal.

## Teste de áudio

`python3 ferramentas/voz.py projetos/teste-vozes-herois` → `projetos/teste-vozes-herois/build/narracao.wav`.
Em CPU, a primeira criação de cada referência é lenta; as seguintes reutilizam o arquivo.
No GitHub Actions, o workflow *Renderizar vídeo* instala `qwen-tts` só quando o projeto usa vozes por personagem.
