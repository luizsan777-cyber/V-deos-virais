"""Servidor local do Qwen3-TTS (Apache-2.0) para o voz.py (motor "qwen3_local").

Roda no ambiente isolado do Qwen3 (Python 3.11 + torch CPU + qwen-tts), separado do Python do projeto.
Pedido (uma linha JSON no stdin): {"texto": "...", "saida": "/tmp/x.wav", "voz": "aiden",
                                   "instrucao": "...", "seed": 1}
Resposta: "ok <arquivo>" no stdout. O modelo é carregado uma vez só.
Modelo: QWEN3_MODELO (pasta local ou id do Hugging Face).
"""
import json
import os
import sys

import soundfile as sf
import torch
from qwen_tts import Qwen3TTSModel

torch.set_num_threads(int(os.environ.get("QWEN3_THREADS", os.cpu_count() or 4)))
modelo = os.environ.get("QWEN3_MODELO", "/home/user/ferramentas-externas/qwen3-modelos/Qwen3-TTS-12Hz-0.6B-CustomVoice")
dev = "cuda:0" if torch.cuda.is_available() else "cpu"
m = Qwen3TTSModel.from_pretrained(modelo, device_map=dev, dtype=torch.float32 if dev == "cpu" else torch.bfloat16)
print(f"pronto dev={dev}", flush=True)

for linha in sys.stdin:
    if not linha.strip():
        continue
    p = json.loads(linha)
    torch.manual_seed(int(p.get("seed", 1)))
    wavs, sr = m.generate_custom_voice(text=p["texto"], language="portuguese", speaker=p.get("voz", "aiden"),
                                       instruct=p.get("instrucao", ""))
    sf.write(p["saida"], wavs[0], sr)
    print(f"ok {p['saida']}", flush=True)
