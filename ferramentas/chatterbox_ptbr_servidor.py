"""Servidor local do Chatterbox Multilingual PT-BR (ResembleAI/Chatterbox-Multilingual-pt-br, MIT).

Roda no ambiente isolado do Chatterbox (Python 3.11 + torch), separado do Python do projeto.
O voz.py (motor "chatterbox_ptbr") inicia este processo uma vez, manda um pedido JSON por linha
no stdin e recebe "ok <arquivo>" no stdout. O modelo é carregado só uma vez.

Pedido: {"texto": "...", "saida": "/tmp/x.wav", "ref": "ref.wav", "exag": 0.55, "cfg": 0.45, "temp": 0.8, "seed": 7}

Instalação (fora do repositório): ver docs/CHATTERBOX_PTBR.md.
"""
import json
import os
import random
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
import torch

BASE = Path(os.environ.get("CHATTERBOX_PTBR_DIR", "/home/user/ferramentas-externas/chatterbox-ptbr"))
sys.path.insert(0, str(BASE))
from chatterbox.src.chatterbox.tts import ChatterboxTTS  # noqa: E402  (código oficial do Space pt-br)

torch.set_num_threads(int(os.environ.get("CHATTERBOX_THREADS", os.cpu_count() or 4)))
dev = "cuda" if torch.cuda.is_available() else "cpu"
m = ChatterboxTTS.from_local(BASE / "modelo", dev, t3_filename="t3_pt_br.safetensors", s3gen_filename="s3gen_v3.pt")
print(f"pronto sr={m.sr} dev={dev}", flush=True)

for linha in sys.stdin:
    if not linha.strip():
        continue
    p = json.loads(linha)
    seed = int(p.get("seed", 7))
    torch.manual_seed(seed); random.seed(seed); np.random.seed(seed)
    kw = dict(language_id="pt", exaggeration=float(p.get("exag", 0.55)), cfg_weight=float(p.get("cfg", 0.45)),
              temperature=float(p.get("temp", 0.8)))
    if p.get("ref"):
        kw["audio_prompt_path"] = p["ref"]
    wav = m.generate(p["texto"], **kw)
    sf.write(p["saida"], wav.squeeze(0).cpu().numpy(), m.sr)
    print(f"ok {p['saida']}", flush=True)
