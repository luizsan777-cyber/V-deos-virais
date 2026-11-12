---
name: voz-ptbr
description: Narração em português brasileiro do Viral Video Engine — escolha de motor (Kokoro, Piper, Chatterbox, Qwen3-TTS, edge-tts), perfis de voz, ajuste de pausas e pronúncia, voz personalizada autorizada. Use ao gerar, ajustar ou trocar a voz de um vídeo.
---

# Voz pt-BR

Script: `python3 ferramentas/voz.py projetos/<slug>` (chamado também por `produzir.py`).

## Escolha do usuário (12/11/2026)

**Padrão: Kokoro com voz masculina** — `pm_alex` (ciência, curiosidades, engenharia, documentário) e
`pm_santa` (terror, suspense, história, bíblico). Só use `pf_dora` ou outro motor se o usuário pedir.

## Motores

| motor | onde roda | observação |
|---|---|---|
| `kokoro` (padrão) | aqui e no Actions, CPU, offline | vozes `pm_alex` (masc. jovem), `pm_santa` (masc. grave), `pf_dora` (fem.) |
| `piper` | só Actions (modelo no Hugging Face) | `pt_BR-faber-medium` |
| `chatterbox` | só Actions, lento em CPU | aceita **voz de referência autorizada** (clonagem) |
| `qwen3` | só Actions, lento em CPU | aceita instrução de estilo (campo `instrucao` do perfil) |
| `edge` | só Actions (serviço online gratuito da Microsoft, não oficial) | muito natural; termos para uso comercial incertos |

Trocar motor: `projeto.json → "voz": {"motor": "piper"}` ou variável `VOZ_MOTOR=piper`.
O código recusa vozes que não sejam pt-BR. Nunca use voz inglesa ou de Portugal como substituta.

Para comparar motores, rode o workflow **"Amostras de voz"** no GitHub Actions: ele gera a mesma frase em
todos os motores e publica um release com os arquivos (ouça pelo celular e escolha).

## Naturalidade

- Pausas entre falas e o limite de pausas internas vêm do perfil (`ferramentas/perfis.json`). Pausa longa
  num ponto específico: `"pausa": 0.5` na fala.
- Pronúncia: `"tts": "texto como deve ser falado"` (ex.: siglas "NASA" → "nása").
- Emoção: divida em falas curtas; reticências e exclamações mudam a entonação no Kokoro/Piper.

## Voz personalizada (sua voz) — com segurança

1. Grave 10–15 s de fala natural, sem música, em mp3 de ~32 kbps (≤ 35 KB).
2. **Não** coloque o arquivo no repositório. Converta para base64 e salve como *secret* do repositório
   `VOZ_REFERENCIA_B64` (GitHub → Settings → Secrets and variables → Actions).
3. No projeto: `"voz": {"motor": "chatterbox", "voz": "vozes/referencia.mp3"}`. O workflow recria o arquivo
   a partir do secret só durante a execução. `vozes/` está no `.gitignore`.
4. Só use voz de outra pessoa com autorização por escrito dela.
