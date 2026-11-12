"""Pipeline completo de um vídeo.

  python ferramentas/produzir.py projetos/<slug>                 # tudo: voz → áudio → render → mux → QA
  python ferramentas/produzir.py projetos/<slug> --etapas voz,audio
  python ferramentas/produzir.py projetos/<slug> --stills 0,60,120 # quadros de conferência (rápido)
  python ferramentas/produzir.py projetos/<slug> --escala 0.5      # rascunho em 540x960

Motores visuais (projeto.json → "motor"):
  "remotion" (padrão)  Video.tsx anima tudo (kit engine/src/kit: 2D SVG, 3D three.js, explicativo)
  "cartoon"            o motor da skill cartoon-audio-short desenha os quadros (cartoon/story.js) e o
                       Remotion compõe legendas/efeitos por cima e exporta (ver ferramentas/cartoon.py)

Saída final: saida/<slug>.mp4 (H.264, 1080x1920, 30 fps, AAC 48 kHz) + saida/<slug>_qa.jpg (folha de conferência).
"""
from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
import time
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
ENGINE = RAIZ / "engine"
sys.path.insert(0, str(Path(__file__).parent))


def selecionar(projeto: Path) -> None:
    """Aponta o motor Remotion para o projeto (src/projeto.gen.ts)."""
    rel = Path("..", "..", projeto.relative_to(RAIZ)).as_posix()
    (ENGINE / "src" / "projeto.gen.ts").write_text(
        "// GERADO por ferramentas/produzir.py — não editar.\n"
        f'export {{ default as Video }} from "{rel}/Video";\n'
        f'import tempos from "{rel}/build/tempos.json";\n'
        "export { tempos };\n",
        encoding="utf-8",
    )


def rodar(cmd: list[str], **kw) -> None:
    print("$", " ".join(cmd), flush=True)
    subprocess.run(cmd, check=True, **kw)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("projeto")
    ap.add_argument("--etapas", default="voz,audio,quadros,render,mux,qa")
    ap.add_argument("--stills", default=None, help="frames separados por vírgula: só gera quadros de conferência")
    ap.add_argument("--escala", default="1")
    args = ap.parse_args()
    projeto = Path(args.projeto).resolve()
    slug = projeto.name
    build = projeto / "build"
    saida = RAIZ / "saida"
    saida.mkdir(exist_ok=True)
    etapas = args.etapas.split(",")
    t0 = time.time()
    motor = json.loads((projeto / "projeto.json").read_text(encoding="utf-8")).get("motor", "remotion")
    publico = []  # public dir do Remotion (padrão: engine/public)

    if "voz" in etapas or not (build / "tempos.json").exists():
        import voz
        voz.gerar(projeto)
    selecionar(projeto)

    if motor == "cartoon":
        import cartoon
        if args.stills:  # conferência: quadros do motor cartoon (sem legendas)
            cartoon.quadros(projeto, args.stills, build / "stills")
            return
        if "quadros" in etapas:
            cartoon.quadros(projeto)
        publico = ["--public", str(build / "cartoon" / "quadros")]

    if args.stills:
        rodar(["node", "render.mjs", "stills", str(build / "stills"), args.stills, "--escala", args.escala], cwd=ENGINE)
        return

    if "audio" in etapas:
        import audio
        audio.gerar(projeto)
    video_mudo = build / "video_mudo.mp4"
    if "render" in etapas:
        rodar(["node", "render.mjs", "video", str(video_mudo), "--escala", args.escala, *publico], cwd=ENGINE)
    final = saida / f"{slug}.mp4"
    if "mux" in etapas:
        # reencode final: H.264 High, yuv420p (faixa TV, compatível com todos os apps), áudio no tamanho exato do vídeo
        dur = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(video_mudo)],
                             capture_output=True, text=True, check=True).stdout.strip()
        rodar(["ffmpeg", "-v", "error", "-y", "-i", str(video_mudo), "-i", str(build / "mix.wav"),
               "-map", "0:v:0", "-map", "1:a:0", "-c:v", "libx264", "-profile:v", "high", "-preset", "medium", "-crf", "20", "-maxrate", "12M", "-bufsize", "24M",
               "-pix_fmt", "yuv420p", "-color_range", "tv", "-r", "30", "-af", f"apad,atrim=0:{dur}",
               "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", "-t", dur, str(final)])
    if "qa" in etapas:
        import qa
        ok = qa.verificar(final, build / "tempos.json", saida / f"{slug}_qa.jpg", esperado_altura=int(1920 * float(args.escala)))
        if not ok:
            sys.exit(2)
    print(f"\n✅ {final} ({time.time() - t0:.0f}s)")


if __name__ == "__main__":
    main()
