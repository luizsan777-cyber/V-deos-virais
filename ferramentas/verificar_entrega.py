"""Verificação de entrega de um vídeo já renderizado (complementa o qa.py).

  python3 ferramentas/verificar_entrega.py projetos/<slug>

- decodifica o MP4 inteiro com ffmpeg (-v error) e registra qualquer erro;
- confere ffprobe (1080x1920, 30 fps, h264 yuv420p, faixa AAC) e duração vídeo = áudio;
- mede o volume (RMS) em janelas de 4 s para achar trechos sem som;
- gera SRT (ferramentas/srt.py) e capturas do início, fim e de cada transição de cena;
- copia MP4, SRT, folha de QA e capturas para saida/<slug>/.
Escreve saida/<slug>/verificacao.json.
"""
from __future__ import annotations

import json
import shutil
import subprocess
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
import srt  # noqa: E402

RAIZ = Path(__file__).resolve().parent.parent


def main(proj: Path) -> dict:
    slug = proj.name
    mp4 = RAIZ / "saida" / f"{slug}.mp4"
    dest = RAIZ / "saida" / slug
    dest.mkdir(parents=True, exist_ok=True)
    rel: dict = {"arquivo": str(mp4.relative_to(RAIZ))}
    dec = subprocess.run(["ffmpeg", "-v", "error", "-i", str(mp4), "-f", "null", "-"], capture_output=True, text=True)
    rel["decodificacao_erros"] = dec.stderr.strip().splitlines()[:20]
    pr = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(mp4)], capture_output=True, text=True).stdout)
    v = next(s for s in pr["streams"] if s["codec_type"] == "video")
    a = [s for s in pr["streams"] if s["codec_type"] == "audio"]
    rel["video"] = {"codec": v["codec_name"], "pix_fmt": v.get("pix_fmt"), "w": v["width"], "h": v["height"], "fps": v["r_frame_rate"], "dur": float(v["duration"])}
    rel["audio"] = [{"codec": s["codec_name"], "hz": s.get("sample_rate"), "canais": s.get("channels"), "dur": float(s["duration"])} for s in a]
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", str(mp4), "-ac", "1", "-ar", "8000", "-f", "s16le", "-"], capture_output=True).stdout
    x = np.frombuffer(pcm, np.int16).astype(float) / 32768
    w = 8000 * 4
    rel["rms_db_4s"] = [round(float(20 * np.log10(np.sqrt((x[i:i + w] ** 2).mean()) + 1e-9)), 1) for i in range(0, len(x), w)]
    rel["pico_amostra"] = round(float(np.abs(x).max()), 3)
    t = json.loads((proj / "build" / "tempos.json").read_text(encoding="utf-8"))
    rel["narracao_s"] = t["duracao_s"]
    rel["fim_ultima_fala_s"] = t["falas"][-1]["fim"]
    # capturas: início, fim e a meia-seg de cada troca de cena
    pontos = [0.3] + [max(0.0, f["ini"] - 0.05) for f in t["falas"][1:]] + [rel["video"]["dur"] - 0.1]
    caps = []
    for i, s in enumerate(pontos):
        out = dest / f"captura_{i:02d}.jpg"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{s:.2f}", "-i", str(mp4), "-frames:v", "1", "-vf", "scale=360:-1", str(out)])
        caps.append(out.name)
    rel["capturas"] = caps
    srt_path = srt.gerar(proj, dest / f"{slug}.srt")
    rel["srt"] = srt_path.name
    shutil.copy(mp4, dest / mp4.name)
    for extra in (f"{slug}_qa.jpg", f"{slug}_qa.json"):
        if (RAIZ / "saida" / extra).exists():
            shutil.copy(RAIZ / "saida" / extra, dest / extra)
    (dest / "verificacao.json").write_text(json.dumps(rel, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({k: rel[k] for k in ("video", "audio", "decodificacao_erros", "pico_amostra", "narracao_s")}, ensure_ascii=False))
    return rel


if __name__ == "__main__":
    main(Path(sys.argv[1]).resolve())
