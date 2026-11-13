"""Ponte Viral Video Engine → HyperFrames (experimento).

Reaproveita o que o pipeline já produz para um projeto VVE (projeto.json + voz.py + audio.py):
  <vve>/build/tempos.json   → assets/tempos.js (tempos de falas/palavras/sfx para a coreografia)
                            → grupos de legenda escritos NO HTML (elementos temporizados, editáveis no Studio)
  <vve>/build/mix.wav       → assets/audio/mix.wav (narração pt-BR + trilha + SFX já mixados, -14 LUFS)
e ajusta a duração da composição raiz à narração real.

  python experimentos/hyperframes/vve_para_hf.py <projeto-hyperframes> [<pasta-vve>]

No index.html, o bloco entre <!-- LEGENDAS:INICIO --> e <!-- LEGENDAS:FIM --> é regenerado; o resto é autoral.
"""
from __future__ import annotations

import html
import json
import re
import shutil
import sys
from pathlib import Path


def limpar(w: str) -> str:
    return re.sub(r"[^\w]", "", w.lower()).replace("_", "")


def grupos(palavras: list[dict], max_p: int = 3, max_l: int = 18) -> list[list[dict]]:
    """Mesma regra do kit Remotion (Legendas.tsx): 2–3 palavras, quebra em pontuação e troca de fala."""
    out, atual = [], []
    for i, p in enumerate(palavras):
        letras = sum(len(a["w"]) + 1 for a in atual) + len(p["w"])
        if atual and (len(atual) >= max_p or letras > max_l or atual[0]["fala"] != p["fala"]):
            out.append(atual)
            atual = []
        atual.append(p)
        if re.search(r"[.!?…,;:]$", p["w"]) or i == len(palavras) - 1:
            out.append(atual)
            atual = []
    if atual:
        out.append(atual)
    return out


def main() -> None:
    hf = Path(sys.argv[1]).resolve()
    vve = Path(sys.argv[2]).resolve() if len(sys.argv) > 2 else hf / "vve"
    t = json.loads((vve / "build" / "tempos.json").read_text(encoding="utf-8"))
    dur = t["duracao_s"]
    (hf / "assets").mkdir(exist_ok=True)
    leve = {k: t[k] for k in ("fps", "frames", "duracao_s", "falas", "palavras", "sfx")}
    (hf / "assets" / "tempos.js").write_text("// GERADO por vve_para_hf.py — não editar\nwindow.TEMPOS = "
                                             + json.dumps(leve, ensure_ascii=False) + ";\n", encoding="utf-8")
    (hf / "assets" / "audio").mkdir(exist_ok=True)
    shutil.copy2(vve / "build" / "mix.wav", hf / "assets" / "audio" / "mix.wav")

    gs = grupos(t["palavras"])
    linhas = []
    for i, g in enumerate(gs):
        ini = max(0.1, g[0]["ini"] - 0.05)
        fim = gs[i + 1][0]["ini"] - 0.02 if i + 1 < len(gs) and gs[i + 1][0]["ini"] - g[-1]["fim"] < 0.6 else g[-1]["fim"] + 0.15
        spans = "".join(
            f'<span class="w{" dest" if p.get("destaque") else ""}" data-ini="{p["ini"]:.3f}" data-fim="{p["fim"]:.3f}">'
            f'{html.escape(p["w"].upper().rstrip(",;:"))}</span>'
            for p in g
        )
        linhas.append(f'        <div id="cap-{i}" class="clip cap" data-start="{ini:.3f}" data-duration="{fim - ini:.3f}">{spans}</div>')
    bloco = "<!-- LEGENDAS:INICIO -->\n" + "\n".join(linhas) + "\n        <!-- LEGENDAS:FIM -->"
    idx = hf / "index.html"
    s = idx.read_text(encoding="utf-8")
    s = re.sub(r"<!-- LEGENDAS:INICIO -->.*?<!-- LEGENDAS:FIM -->", lambda _: bloco, s, flags=re.S)
    s = re.sub(r'(id="root"[^>]*?data-duration=")[\d.]+(")', lambda m: f"{m[1]}{dur:.3f}{m[2]}", s, flags=re.S)
    s = re.sub(r'(id="mix"[^>]*?data-duration=")[\d.]+(")', lambda m: f"{m[1]}{dur:.3f}{m[2]}", s, flags=re.S)
    idx.write_text(s, encoding="utf-8")
    print(f"[vve→hf] {len(gs)} grupos de legenda, duração {dur:.2f}s, áudio e tempos copiados para {hf}")


if __name__ == "__main__":
    main()
