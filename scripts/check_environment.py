#!/usr/bin/env python3
"""Diagnostico sem instalacao e sem custos de dependencias para gerar MP4."""
from __future__ import annotations
import importlib.util
import json
import platform
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BINARIES = ("ffmpeg", "ffprobe", "node", "npm")
PY_MODULES = ("PIL", "numpy", "playwright", "remotion", "kokoro", "torch")

def main() -> int:
    report = {
        "platform": platform.platform(),
        "python": sys.version.split()[0],
        "executables": {name: shutil.which(name) for name in BINARIES},
        "python_modules": {},
        "kit_zip_exists": (ROOT / ".claude/skills/cartoon-audio-short/kit-source/cartoon-short-kit.zip").is_file(),
        "kit_extracted": (ROOT / ".claude/skills/cartoon-audio-short/kit/engine/main.js").is_file(),
        "node_modules_exists": (ROOT / "engine/node_modules").is_dir(),
    }
    for name in PY_MODULES:
        try:
            report["python_modules"][name] = importlib.util.find_spec(name) is not None
        except Exception:
            report["python_modules"][name] = False
    print(json.dumps(report, indent=2, ensure_ascii=False))
    if not report["executables"]["ffmpeg"] or not report["executables"]["ffprobe"]:
        print("BLOQUEIO: ffmpeg/ffprobe ausentes; MP4 ainda nao validado.")
    if not report["kit_extracted"]:
        print("INFO: rode python scripts/bootstrap_cartoon.py primeiro.")
    print("AVISO: presenca de executaveis nao comprova qualidade de video/voz.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
