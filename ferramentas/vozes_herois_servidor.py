"""Servidor Qwen3-TTS das vozes por personagem (complemento Vozes Heróis Marvel/DC).

Roda no ambiente isolado do Qwen3 (QWEN3_PY, padrão /home/user/ferramentas-externas/venv-qwen3), como o
servidor do motor qwen3_local. Carrega UM modelo por vez (RAM): VoiceDesign para criar a referência sintética
de cada voz, depois Base para clonar essa referência nas falas.

Pedidos (uma linha JSON no stdin):
  {"op": "design", "texto": ..., "instrucao": ..., "seed": 7, "saida": "/x.wav"}
  {"op": "clone", "texto": ..., "ref_audio": "/ref.wav", "ref_texto": ..., "seed": 7, "saida": "/y.wav"}
Resposta: "ok <arquivo>" ou "erro <mensagem>".
"""
import json
import os
import sys
import traceback

import numpy as np
import soundfile as sf
import torch
from qwen_tts import Qwen3TTSModel

PASTA = "/home/user/ferramentas-externas/qwen3-modelos"
MODELOS = {
    "design": os.environ.get("QWEN3_DESIGN_MODELO") or (f"{PASTA}/Qwen3-TTS-12Hz-1.7B-VoiceDesign" if os.path.isdir(f"{PASTA}/Qwen3-TTS-12Hz-1.7B-VoiceDesign") else "Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign"),
    "clone": os.environ.get("QWEN3_BASE_MODELO") or (f"{PASTA}/Qwen3-TTS-12Hz-1.7B-Base" if os.path.isdir(f"{PASTA}/Qwen3-TTS-12Hz-1.7B-Base") else "Qwen/Qwen3-TTS-12Hz-1.7B-Base"),
}
IDIOMA = "Portuguese"
torch.set_num_threads(int(os.environ.get("QWEN3_THREADS", os.cpu_count() or 4)))
dev = "cuda:0" if torch.cuda.is_available() else "cpu"
atual, modelo, prompts = None, None, {}


def usar(tipo):
    global atual, modelo, prompts
    if atual != tipo:
        modelo = None  # libera o anterior antes de carregar o próximo
        prompts = {}
        modelo = Qwen3TTSModel.from_pretrained(MODELOS[tipo], device_map=dev, dtype=torch.float32 if dev == "cpu" else torch.bfloat16)
        atual = tipo
    return modelo


print(f"pronto dev={dev}", flush=True)
for linha in sys.stdin:
    if not linha.strip():
        continue
    try:
        p = json.loads(linha)
        torch.manual_seed(int(p.get("seed", 1)))
        if p["op"] == "design":
            wavs, sr = usar("design").generate_voice_design(text=p["texto"], language=IDIOMA, instruct=p["instrucao"])
        else:
            m = usar("clone")
            if p["ref_audio"] not in prompts:
                prompts[p["ref_audio"]] = m.create_voice_clone_prompt(ref_audio=p["ref_audio"], ref_text=p["ref_texto"])
            wavs, sr = m.generate_voice_clone(text=p["texto"], language=p.get("idioma", IDIOMA), voice_clone_prompt=prompts[p["ref_audio"]])
        a = np.asarray(wavs[0], dtype=np.float32).reshape(-1)
        if not a.size or not np.isfinite(a).all() or not np.any(a):
            raise RuntimeError("o modelo devolveu áudio vazio ou inválido")
        sf.write(p["saida"], a, sr, subtype="PCM_16")
        print(f"ok {p['saida']}", flush=True)
    except Exception as e:  # informa o erro ao voz.py em vez de trocar de voz em silêncio
        traceback.print_exc(file=sys.stderr)
        print(f"erro {type(e).__name__}: {e}".replace("\n", " "), flush=True)
