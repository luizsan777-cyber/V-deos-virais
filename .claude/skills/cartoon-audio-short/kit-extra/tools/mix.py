#!/usr/bin/env python3
"""Mix com níveis travados (regra da skill cartoon-audio-short), escrito porque o ZIP do kit não o trazia.

  python3 mix.py voz.(wav|mp3) musica.wav sfx.wav [--saida mix_raw.wav] [--musica-db -6] [--sfx-db -6]

- Música ajustada para exatamente --musica-db (padrão -6 dB = 50 %) abaixo do RMS da voz com gate
  (só trechos com fala contam).
- SFX ajustados para no máximo --sfx-db abaixo da voz, com picos limitados a 0,7 x o pico da voz.
- Sem ducking nem compressão: um único ganho linear no mix inteiro + limitador de pico (-1 dBFS).
- Imprime os níveis medidos para conferência. A voz não é alterada (só o ganho global final).
"""
from __future__ import annotations

import argparse
import subprocess

import numpy as np

SR = 48000


def ler(caminho: str) -> np.ndarray:
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", caminho, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def rms_gate(x: np.ndarray, jan: float = 0.05, limiar_db: float = -40.0) -> float:
    n = int(jan * SR)
    k = len(x) // n
    if k == 0:
        return float(np.sqrt(np.mean(x ** 2) + 1e-12))
    b = np.sqrt((x[: k * n].reshape(k, n) ** 2).mean(axis=1) + 1e-12)
    ref = b.max()
    ativos = b[20 * np.log10(b / ref + 1e-12) > limiar_db]
    return float(np.sqrt(np.mean(ativos ** 2))) if len(ativos) else float(ref)


def db(x: float) -> float:
    return 20 * np.log10(max(x, 1e-12))


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("voz")
    ap.add_argument("musica")
    ap.add_argument("sfx")
    ap.add_argument("--saida", default="mix_raw.wav")
    ap.add_argument("--musica-db", type=float, default=-6.0)
    ap.add_argument("--sfx-db", type=float, default=-6.0)
    a = ap.parse_args()
    voz, mus, fx = ler(a.voz), ler(a.musica), ler(a.sfx)
    n = len(voz)
    mus = np.pad(mus, (0, max(0, n - len(mus))))[:n]
    fx = np.pad(fx, (0, max(0, n - len(fx))))[:n]
    rv = rms_gate(voz)
    pico_v = float(np.abs(voz).max())
    gm = 10 ** (a.musica_db / 20) * rv / max(rms_gate(mus), 1e-9) if np.abs(mus).max() > 0 else 0.0
    mus = mus * gm
    if np.abs(fx).max() > 0:
        gf = 10 ** (a.sfx_db / 20) * rv / max(rms_gate(fx, limiar_db=-30), 1e-9)
        gf = min(gf, 0.7 * pico_v / float(np.abs(fx).max()))
        fx = fx * gf
    mix = voz + mus + fx
    # um único ganho linear + limitador de pico em -1 dBFS (sem compressão de dinâmica)
    teto = 10 ** (-1 / 20)
    g = min(1.0, teto / float(np.abs(mix).max() + 1e-9))
    mix = mix * g
    pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
    import wave
    with wave.open(a.saida, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f"voz RMS {db(rv):.1f} dBFS | música {db(rms_gate(mus)) - db(rv):+.1f} dB vs voz | "
          f"sfx {db(rms_gate(fx, limiar_db=-30)) - db(rv) if np.abs(fx).max() > 0 else float('nan'):+.1f} dB vs voz | "
          f"ganho final {db(g):+.1f} dB -> {a.saida}")


if __name__ == "__main__":
    main()
