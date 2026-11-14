"""Gera legenda .srt a partir de build/tempos.json (tempo real das palavras da narração).

  python3 ferramentas/srt.py projetos/<slug> [saida.srt]

Blocos curtos (até ~38 caracteres por linha, no máximo 2 linhas), quebrados na pontuação.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path


def ts(s: float) -> str:
    ms = int(round(s * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    sec, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{sec:02d},{ms:03d}"


def linhas(txt: str, maxc: int = 38) -> str:
    if len(txt) <= maxc:
        return txt
    ws, l1 = txt.split(), ""
    while ws and len((l1 + " " + ws[0]).strip()) <= len(txt) / 2 + 4:
        l1 = (l1 + " " + ws.pop(0)).strip()
    return l1 + "\n" + " ".join(ws)


def gerar(proj: Path, destino: Path | None = None) -> Path:
    t = json.loads((proj / "build" / "tempos.json").read_text(encoding="utf-8"))
    blocos, atual = [], []
    for i, p in enumerate(t["palavras"]):
        if atual and (atual[0]["fala"] != p["fala"] or len(" ".join(a["w"] for a in atual + [p])) > 70):
            blocos.append(atual)
            atual = []
        atual.append(p)
        if re.search(r"[.!?…]$", p["w"]) or (re.search(r"[,;:]$", p["w"]) and len(" ".join(a["w"] for a in atual)) > 28):
            blocos.append(atual)
            atual = []
    if atual:
        blocos.append(atual)
    out = []
    for n, b in enumerate(blocos, 1):
        txt = " ".join(a["w"] for a in b)
        fim = b[-1]["fim"] + 0.15
        if n < len(blocos):
            fim = min(fim, blocos[n][0]["ini"] - 0.02)  # sem sobreposição com o bloco seguinte
        out.append(f"{n}\n{ts(b[0]['ini'])} --> {ts(fim)}\n{linhas(txt)}\n")
    destino = destino or proj / f"{proj.name}.srt"
    destino.write_text("\n".join(out), encoding="utf-8")
    return destino


if __name__ == "__main__":
    print(gerar(Path(sys.argv[1]), Path(sys.argv[2]) if len(sys.argv) > 2 else None))
