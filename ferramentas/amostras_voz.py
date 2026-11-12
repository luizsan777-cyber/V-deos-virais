"""Gera a mesma frase em todos os motores de voz pt-BR disponíveis, para comparar de ouvido.

  python ferramentas/amostras_voz.py amostras/ [--motores kokoro,piper,edge,chatterbox,qwen3] [--perfil ciencia]

Cria amostras/<motor>-<voz>.mp3 e amostras/RELATORIO.md (o que funcionou, tempo de geração, erros).
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
import time
import traceback
from pathlib import Path

import soundfile as sf

sys.path.insert(0, str(Path(__file__).parent))
import voz  # noqa: E402
from texto_ptbr import normalizar  # noqa: E402

TEXTO = ("E se a Terra parasse de girar agora? Cara, o que aconteceria nos primeiros segundos seria absurdo! "
         "Tudo que não tá preso no chão ia sair voando a 1.670 km/h.")

VOZES_EXTRA = {"kokoro": ["pm_alex", "pm_santa", "pf_dora"], "edge": ["pt-BR-AntonioNeural", "pt-BR-FranciscaNeural", "pt-BR-ThalitaMultilingualNeural"]}


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("saida")
    ap.add_argument("--motores", default="kokoro,piper,edge,chatterbox,qwen3")
    ap.add_argument("--perfil", default="ciencia")
    ap.add_argument("--referencia", default=None, help="áudio de referência autorizado (chatterbox)")
    a = ap.parse_args()
    out = Path(a.saida)
    out.mkdir(parents=True, exist_ok=True)
    perfil = voz.PERFIS[a.perfil]
    linhas = [f"# Amostras de voz pt-BR\n\nTexto: \"{TEXTO}\"\n\nPerfil: {a.perfil}\n", "| motor | voz | resultado | tempo de geração | duração |", "|---|---|---|---|---|"]
    for motor in a.motores.split(","):
        vozes = VOZES_EXTRA.get(motor, [a.referencia if motor == "chatterbox" else None])
        for v in vozes:
            nome = f"{motor}-{Path(v).stem if v and motor == 'chatterbox' else (v or 'padrao')}"
            try:
                t0 = time.time()
                m = voz.MOTORES[motor](v, perfil)
                t1 = time.time()
                audio = voz.aparar(m.falar(normalizar(TEXTO)))
                dt = time.time() - t1
                wav = out / f"{nome}.wav"
                sf.write(wav, audio, voz.SR)
                subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(wav), "-b:a", "128k", str(out / f"{nome}.mp3")], check=True)
                wav.unlink()
                linhas.append(f"| {motor} | {v or 'padrão'} | ✅ | {dt:.1f}s (+{t1 - t0:.0f}s carregando) | {len(audio) / voz.SR:.1f}s |")
                print(f"[amostra] {nome} ok", flush=True)
            except Exception as e:  # noqa: BLE001
                linhas.append(f"| {motor} | {v or 'padrão'} | ❌ {type(e).__name__}: {str(e)[:120]} | | |")
                traceback.print_exc()
    (out / "RELATORIO.md").write_text("\n".join(linhas) + "\n", encoding="utf-8")
    print("\n".join(linhas))


if __name__ == "__main__":
    main()
