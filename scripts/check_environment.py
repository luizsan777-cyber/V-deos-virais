#!/usr/bin/env python3
"""Diagnóstico (não instala nada, sem custos) das dependências REAIS dos dois motores visuais.

Motor Remotion (padrão): Node + engine/node_modules (remotion, @remotion/renderer), Chromium.
Motor cartoon (skill cartoon-audio-short): kit extraído + vendor/three.module.js + vendor/toon.ts +
tools/mix.py, Node >= 22.6 (stripTypeScriptTypes), Playwright (Node) com Chromium.
Voz pt-BR: kokoro_onnx + modelo Kokoro em cache. Comum: ffmpeg/ffprobe, numpy, Pillow, soundfile.
"""
from __future__ import annotations
import importlib.util
import json
import os
import platform
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
KIT = ROOT / ".claude/skills/cartoon-audio-short/kit"
CACHE = Path(os.environ.get("VIRAL_CACHE", Path.home() / ".cache" / "viral-engine"))


def node_ok(expr: str) -> bool:
    if not shutil.which("node"):
        return False
    return subprocess.run(["node", "-e", expr], capture_output=True, cwd=ROOT / "engine").returncode == 0


def main() -> int:
    nodever = subprocess.run(["node", "--version"], capture_output=True, text=True).stdout.strip() if shutil.which("node") else None
    npm_g = subprocess.run(["npm", "root", "-g"], capture_output=True, text=True).stdout.strip() if shutil.which("npm") else ""
    chromium = [str(p) for p in Path("/opt/pw-browsers").glob("chromium*")] if Path("/opt/pw-browsers").exists() else []
    r = {
        "platform": platform.platform(),
        "python": sys.version.split()[0],
        "node": nodever,
        "executables": {n: shutil.which(n) for n in ("ffmpeg", "ffprobe", "node", "npm", "git")},
        "python_modules": {m: importlib.util.find_spec(m) is not None for m in ("numpy", "PIL", "soundfile", "kokoro_onnx")},
        "voz_kokoro_modelo_em_cache": (CACHE / "kokoro" / "kokoro-v1.0.onnx").exists(),
        "remotion": {
            "engine_node_modules": (ROOT / "engine/node_modules").is_dir(),
            "remotion_renderer": node_ok("require.resolve('@remotion/renderer')"),
            "chromium_sistema": chromium,
        },
        "cartoon": {
            "kit_extraido": (KIT / "engine/main.js").is_file(),
            "vendor_three": (KIT / "vendor/three.module.js").is_file(),
            "vendor_toon_ts": (KIT / "vendor/toon.ts").is_file(),
            "tools_mix_py": (KIT / "tools/mix.py").is_file(),
            "node_strip_types": node_ok("require('node:module').stripTypeScriptTypes('let a: number = 1')"),
            "playwright_node_global": (Path(npm_g) / "playwright").is_dir() if npm_g else False,
        },
    }
    print(json.dumps(r, indent=2, ensure_ascii=False))
    bloqueios = []
    if not (r["executables"]["ffmpeg"] and r["executables"]["ffprobe"]):
        bloqueios.append("ffmpeg/ffprobe ausentes")
    if not r["python_modules"]["kokoro_onnx"]:
        bloqueios.append("voz: pip install -r requirements.txt")
    if not r["remotion"]["remotion_renderer"]:
        bloqueios.append("Remotion: cd engine && npm ci")
    if not r["cartoon"]["kit_extraido"] or not r["cartoon"]["vendor_three"] or not r["cartoon"]["tools_mix_py"]:
        bloqueios.append("cartoon: python scripts/bootstrap_cartoon.py")
    if not r["cartoon"]["node_strip_types"]:
        bloqueios.append("cartoon: Node >= 22.6 necessário")
    if not r["cartoon"]["playwright_node_global"]:
        bloqueios.append("cartoon: npm i -g playwright && npx playwright install chromium")
    print("BLOQUEIOS: " + ("; ".join(bloqueios) if bloqueios else "nenhum"))
    print("AVISO: dependências presentes não comprovam qualidade; valide com um MP4 de teste e o QA.")
    return 1 if bloqueios else 0


if __name__ == "__main__":
    raise SystemExit(main())
