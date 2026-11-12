"""Controle de qualidade do MP4 final.

Verifica: contêiner/codec (H.264 + AAC), resolução 9:16, 30 fps, duração de vídeo = áudio = narração,
quadros pretos, trechos congelados (animação parada), loudness (-14 LUFS ± 2) e pico.
Gera uma folha de conferência (contact sheet) com 12 quadros.

  python ferramentas/qa.py saida/<slug>.mp4 projetos/<slug>/build/tempos.json
"""
from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path


def sh(cmd: list[str]) -> str:
    r = subprocess.run(cmd, capture_output=True, text=True)
    return r.stdout + r.stderr


def verificar(mp4: Path, tempos_json: Path, folha: Path, esperado_altura: int = 1920) -> bool:
    info = json.loads(sh(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(mp4)]))
    v = next(s for s in info["streams"] if s["codec_type"] == "video")
    a = next((s for s in info["streams"] if s["codec_type"] == "audio"), None)
    tempos = json.loads(tempos_json.read_text(encoding="utf-8"))
    problemas, avisos = [], []
    alt = esperado_altura
    larg = round(alt * 9 / 16)
    if v["codec_name"] != "h264":
        problemas.append(f"codec de vídeo {v['codec_name']} (esperado h264)")
    if (v["width"], v["height"]) != (larg, alt):
        problemas.append(f"resolução {v['width']}x{v['height']} (esperado {larg}x{alt})")
    if v.get("pix_fmt") != "yuv420p":
        problemas.append(f"pix_fmt {v.get('pix_fmt')} (esperado yuv420p)")
    fps = eval(v["r_frame_rate"])  # noqa: S307 (fração do ffprobe)
    if abs(fps - 30) > 0.01:
        problemas.append(f"fps {fps}")
    if not a or a["codec_name"] != "aac":
        problemas.append("sem trilha de áudio AAC")
    dv = float(v["duration"])
    da = float(a["duration"]) if a else 0
    dn = tempos["duracao_s"]
    if abs(dv - dn) > 0.12 or abs(da - dn) > 0.12:
        problemas.append(f"duração vídeo {dv:.2f}s / áudio {da:.2f}s / narração {dn:.2f}s não batem")

    # quadros pretos
    bd = sh(["ffmpeg", "-hide_banner", "-i", str(mp4), "-vf", "blackdetect=d=0.15:pix_th=0.06", "-an", "-f", "null", "-"])
    pretos = re.findall(r"black_start:([\d.]+) black_end:([\d.]+)", bd)
    if pretos:
        problemas.append(f"trechos pretos: {pretos}")
    # congelamentos (animação parada >= 0.7 s)
    fz = sh(["ffmpeg", "-hide_banner", "-i", str(mp4), "-vf", "freezedetect=n=0.0008:d=0.7", "-an", "-f", "null", "-"])
    congel = re.findall(r"freeze_start: ([\d.]+)", fz)
    if congel:
        avisos.append(f"possíveis quadros congelados a partir de {congel}s")
    # loudness
    lu = sh(["ffmpeg", "-hide_banner", "-i", str(mp4), "-af", "ebur128=peak=true", "-vn", "-f", "null", "-"])
    m_i = re.findall(r"I:\s+(-?[\d.]+) LUFS", lu)
    m_p = re.findall(r"Peak:\s+(-?[\d.]+) dBFS", lu)
    lufs = float(m_i[-1]) if m_i else None
    pico = float(m_p[-1]) if m_p else None
    if lufs is None or abs(lufs + 14) > 2:
        avisos.append(f"loudness {lufs} LUFS (alvo -14)")
    if pico is not None and pico > -0.5:
        avisos.append(f"pico {pico} dBFS (alvo ≤ -1)")

    # folha de conferência: 12 quadros espaçados
    n = 12
    sel = "+".join(f"eq(n\\,{int(i * (dv * fps - 1) / (n - 1))})" for i in range(n))
    sh(["ffmpeg", "-v", "error", "-y", "-i", str(mp4), "-vf", f"select='{sel}',scale=270:-1,tile=6x2:padding=6:color=white",
        "-frames:v", "1", "-vsync", "vfr", str(folha)])

    rel = {"arquivo": str(mp4), "resolucao": f"{v['width']}x{v['height']}", "fps": fps, "duracao_video": dv,
           "duracao_audio": da, "duracao_narracao": dn, "lufs": lufs, "pico_dbfs": pico,
           "tamanho_mb": round(mp4.stat().st_size / 1e6, 2), "problemas": problemas, "avisos": avisos}
    folha.with_suffix(".json").write_text(json.dumps(rel, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(rel, ensure_ascii=False, indent=2))
    return not problemas


if __name__ == "__main__":
    mp4 = Path(sys.argv[1])
    ok = verificar(mp4, Path(sys.argv[2]), mp4.with_name(mp4.stem + "_qa.jpg"))
    sys.exit(0 if ok else 2)
