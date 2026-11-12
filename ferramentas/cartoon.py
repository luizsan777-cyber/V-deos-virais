"""Ponte entre o pipeline (voz pt-BR, áudio, legendas Remotion, QA) e o motor 2D da skill cartoon-audio-short.

O kit (three.js em Chromium headless) desenha os QUADROS da cena; o Remotion continua sendo o compositor
final (legendas pt-BR, efeitos de tela, exportação MP4). Nada do Remotion é substituído.

  python ferramentas/cartoon.py preparar projetos/<slug>     # monta build/cartoon/ a partir do kit + cartoon/story.js
  python ferramentas/cartoon.py quadros  projetos/<slug> [--frames 0,60,120] [--saida pasta]

Estrutura do projeto:
  projetos/<slug>/projeto.json   com "motor": "cartoon"
  projetos/<slug>/cartoon/story.js   plano de tomadas (importa TEMPOS de './tempos.js')
  projetos/<slug>/cartoon/*.js       opcional: roman.js / main.js próprios substituem os do kit
  projetos/<slug>/Video.tsx      compositor Remotion (QuadrosCartoon + Legendas)
"""
from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
KIT = RAIZ / ".claude" / "skills" / "cartoon-audio-short" / "kit"


def _rodar(cmd: list[str], **kw) -> None:
    print("$", " ".join(cmd), flush=True)
    subprocess.run(cmd, check=True, **kw)


def checar_kit() -> None:
    falta = [p for p in ("engine/main.js", "engine/roman.js", "tools/render.mjs", "tools/setup.sh") if not (KIT / p).exists()]
    if falta:
        raise SystemExit(f"Kit cartoon não extraído ({', '.join(falta)}). Rode: python scripts/bootstrap_cartoon.py")
    for p in ("vendor/three.module.js", "vendor/toon.ts"):
        if not (KIT / p).exists():
            print(f"[cartoon] aviso: {p} ausente — setup.sh vai tentar baixar (npm/GitHub)", flush=True)


def preparar(projeto: Path) -> Path:
    checar_kit()
    b = projeto / "build" / "cartoon"
    web = b / "web"
    if not (web / "main.js").exists():
        # three.js vendorizado primeiro: o setup.sh só baixa (npm/GitHub) se web/lib/three.module.js faltar
        if (KIT / "vendor" / "three.module.js").exists():
            (web / "lib").mkdir(parents=True, exist_ok=True)
            shutil.copy2(KIT / "vendor" / "three.module.js", web / "lib" / "three.module.js")
        _rodar(["bash", str(KIT / "tools" / "setup.sh"), str(b)])
    # arquivos próprios do projeto (story.js obrigatório; roman.js/main.js/paint.js opcionais)
    src = projeto / "cartoon"
    if not (src / "story.js").exists():
        raise SystemExit(f"Falta {src / 'story.js'} (plano de tomadas do motor cartoon)")
    for f in src.glob("*.js"):
        shutil.copy2(f, web / f.name)
    if (src / "roman.js").exists():  # elenco próprio: reconstrói toon.js
        (web / "toon.js").write_text((web / "toonbase.js").read_text() + (web / "roman.js").read_text())
    # tempos da narração pt-BR para o story.js
    tempos = json.loads((projeto / "build" / "tempos.json").read_text(encoding="utf-8"))
    leve = {k: tempos[k] for k in ("fps", "frames", "duracao_s", "falas", "palavras", "sfx")}
    (web / "tempos.js").write_text("// GERADO por ferramentas/cartoon.py — não editar\nexport const TEMPOS = "
                                   + json.dumps(leve, ensure_ascii=False) + ";\n", encoding="utf-8")
    return b


def quadros(projeto: Path, frames: str | None = None, saida: Path | None = None) -> Path:
    b = preparar(projeto)
    tempos = json.loads((projeto / "build" / "tempos.json").read_text(encoding="utf-8"))
    n = tempos["frames"]
    destino = saida or (b / "quadros")
    destino.mkdir(parents=True, exist_ok=True)
    env = dict(os.environ, WEB=str(b / "web"))
    if frames is None:
        frames = f"0-{n - 1}"
        env["RESUME"] = "1"  # retoma se interrompido (não refaz quadros prontos)
    _rodar(["node", "render.mjs", str(destino), frames], cwd=b, env=env)
    if frames == f"0-{n - 1}":
        prontos = len(list(destino.glob("f*.jpg")))
        if prontos < n:
            raise SystemExit(f"[cartoon] só {prontos}/{n} quadros renderizados")
    # o compositor Remotion lê os quadros como arquivos estáticos (public dir) + a textura de granulação
    shutil.copy2(RAIZ / "engine" / "public" / "ruido.png", destino / "ruido.png")
    return destino


if __name__ == "__main__":
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument("acao", choices=["preparar", "quadros"])
    ap.add_argument("projeto")
    ap.add_argument("--frames")
    ap.add_argument("--saida")
    a = ap.parse_args()
    p = Path(a.projeto).resolve()
    if a.acao == "preparar":
        print(preparar(p))
    else:
        print(quadros(p, a.frames, Path(a.saida) if a.saida else None))
    sys.exit(0)
