"""Gera o index.html do overlay HyperFrames do short fe_estoy_bien_es (es-419).

Camada TRANSPARENTE (renderizada em WebM com alpha) com: legendas em espanhol sincronizadas pelas palavras reais
(build/tempos.json do projeto Remotion), nomes das cidades e a referência "Mateo 11:28".
A animação dos personagens fica no Remotion; o ffmpeg sobrepõe esta camada ao vídeo.

    python3 experimentos/hyperframes/estoy-bien/gerar.py projetos/fe_estoy_bien_es
"""
import html
import json
import re
import shutil
import sys
from pathlib import Path

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parents[2]
proj = Path(sys.argv[1]).resolve()
t = json.loads((proj / "build" / "tempos.json").read_text(encoding="utf-8"))
dur = t["frames"] / t["fps"]
pal = t["palavras"]
fala = {f["id"]: f for f in t["falas"]}
limpa = lambda w: re.sub(r"[^\w]", "", w.lower())


def palavra(w, n=1):
    c = 0
    for p in pal:
        if limpa(p["w"]) == limpa(w):
            c += 1
            if c == n:
                return p["ini"]
    raise SystemExit(f"palavra {w} não encontrada")


# ---------------------------------------------------------------- grupos de legenda (frases curtas, 2 linhas no máx.)
def grupos(max_p=5, max_l=26):
    out, atual = [], []
    for i, p in enumerate(pal):
        letras = sum(len(a["w"]) + 1 for a in atual) + len(p["w"])
        if atual and (len(atual) >= max_p or letras > max_l or atual[0]["fala"] != p["fala"]):
            out.append(atual)
            atual = []
        atual.append(p)
        if re.search(r"[.!?…,;:’]$", p["w"]) or i == len(pal) - 1:
            out.append(atual)
            atual = []
    if atual:
        out.append(atual)
    return out


def juntar(gs, lim=34):
    """Legenda de 1 palavra junta-se à vizinha da mesma fala (cabe em 2 linhas): nada pisca rápido demais."""
    out = []
    for g in gs:
        letras = lambda x: sum(len(a["w"]) + 1 for a in x)
        if len(g) == 1 and out and out[-1][0]["fala"] == g[0]["fala"] and letras(out[-1]) + letras(g) <= lim:
            out[-1] = out[-1] + g
        else:
            out.append(g)
    res = []
    for i, g in enumerate(out):  # 1 palavra que sobrou no início de fala: vai para a próxima
        if res and len(res[-1]) == 1 and res[-1][0]["fala"] == g[0]["fala"]:
            res[-1] = res[-1] + g
        else:
            res.append(g)
    return res


DEST = {"dios", "jesús"}
gs = juntar(grupos())
caps = []
for i, g in enumerate(gs):
    ini = max(0.05, g[0]["ini"] - 0.06)
    prox = gs[i + 1][0]["ini"] if i + 1 < len(gs) else dur
    fim = prox - 0.03 if prox - g[-1]["fim"] < 0.7 else g[-1]["fim"] + 0.35
    if i == len(gs) - 1:
        fim = dur - 0.05  # a oração final fica na tela até o fim
    spans = "".join(f'<span class="w{" dest" if limpa(p["w"]) in DEST else ""}">{html.escape(p["w"])}</span>' for p in g)
    caps.append(f'      <div id="cap-{i}" class="clip cap" data-start="{ini:.3f}" data-duration="{fim - ini:.3f}" data-track-index="2">{spans}</div>')

# ---------------------------------------------------------------- etiquetas (cidades) e referência
f03, f04, f05, f06 = (fala[k] for k in ("f03", "f04", "f05", "f06"))
etq = [
    ("cdmx", "CIUDAD DE MÉXICO", 0.0, palavra("pregunte") - 0.25, "topo"),
    ("bog", "BOGOTÁ", f03["ini"] - 0.2, f03["fim"], "topo"),
    ("lima", "LIMA", f04["ini"] - 0.2, f04["fim"], "topo"),
    ("t1", "CIUDAD DE MÉXICO", f05["ini"] - 0.15, palavra("ciudad") - 0.15, "f1"),
    ("t2", "BOGOTÁ", f05["ini"] - 0.15, palavra("ciudad") - 0.15, "f2"),
    ("t3", "LIMA", f05["ini"] - 0.15, palavra("ciudad") - 0.15, "f3"),
]
etqs = "\n".join(f'      <div id="e-{k}" class="clip etq {pos}" data-start="{a:.3f}" data-duration="{b - a:.3f}" data-track-index="1"><span>{html.escape(txt)}</span></div>' for k, txt, a, b, pos in etq)
ref_ini, ref_fim = f06["ini"] + 0.4, fala["f09"]["fim"]

doc = f"""<!doctype html>
<!-- GERADO por gerar.py — overlay transparente (legendas es-419, cidades, referência) do short fe_estoy_bien_es -->
<html lang="es" data-resolution="portrait">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <script src="assets/lib/gsap.min.js"></script>
    <style>
      @font-face {{ font-family: "Montserrat"; src: url("assets/fonts/montserrat-700.woff2") format("woff2"); font-weight: 700; }}
      @font-face {{ font-family: "Montserrat"; src: url("assets/fonts/montserrat-800.woff2") format("woff2"); font-weight: 800; }}
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{ width: 1080px; height: 1920px; overflow: hidden; background: transparent; }}
      #root {{ position: relative; width: 1080px; height: 1920px; overflow: hidden; font-family: "Montserrat", sans-serif; }}
      /* legendas: centro em ~1500 px (abaixo dos rostos, acima da área de descrição do Shorts), longe da coluna de botões */
      .cap {{ position: absolute; left: 80px; right: 150px; top: 1430px; text-align: center; line-height: 1.18; }}
      .w {{ display: inline-block; margin: 0 7px; font-weight: 800; font-size: 62px; color: #fffdf6;
        -webkit-text-stroke: 9px rgba(10,10,18,0.92); paint-order: stroke fill; text-shadow: 0 4px 16px rgba(0,0,0,0.55); }}
      .w.dest {{ color: #ffd98a; }}
      .etq {{ position: absolute; }}
      .etq span {{ display: inline-block; font-weight: 800; font-size: 34px; letter-spacing: 6px; color: #fffdf6;
        padding: 12px 22px 12px 26px; border-left: 6px solid #ffd98a; background: rgba(10,12,24,0.55); }}
      .topo {{ left: 60px; top: 230px; }}
      .f1 {{ left: 64px; top: 140px; }} .f2 {{ left: 64px; top: 700px; }} .f3 {{ left: 64px; top: 1260px; }}
      .f1 span, .f2 span, .f3 span {{ font-size: 28px; padding: 8px 16px 8px 18px; }}
      #ref {{ position: absolute; right: 150px; top: 240px; }}
      #ref span {{ font-weight: 700; font-size: 32px; letter-spacing: 3px; color: #ffe7b8; opacity: 0.9;
        border-bottom: 2px solid rgba(255,217,138,0.6); padding-bottom: 6px; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{dur:.3f}" data-width="1080" data-height="1920">
{etqs}
      <div id="ref" class="clip" data-start="{ref_ini:.3f}" data-duration="{ref_fim - ref_ini:.3f}" data-track-index="1"><span>Mateo 11:28</span></div>
{chr(10).join(caps)}
    </div>
    <script>
      window.__timelines = window.__timelines || {{}};
      const tl = gsap.timeline({{ paused: true }});
      document.querySelectorAll(".cap").forEach((g) => {{
        const ini = parseFloat(g.dataset.start), d = parseFloat(g.dataset.duration);
        tl.fromTo(g, {{ opacity: 0, y: 14 }}, {{ opacity: 1, y: 0, duration: 0.18, ease: "power2.out" }}, ini);
        tl.set(g, {{ opacity: 0, visibility: "hidden" }}, ini + d);
      }});
      document.querySelectorAll(".etq").forEach((e) => {{
        const ini = parseFloat(e.dataset.start), d = parseFloat(e.dataset.duration);
        if (ini < 0.01) tl.set(e, {{ opacity: 1, x: 0 }}, 0);  // 1º quadro já com a cidade (miniatura)
        else tl.fromTo(e, {{ opacity: 0, x: -30 }}, {{ opacity: 1, x: 0, duration: 0.35, ease: "power3.out" }}, ini);
        tl.to(e, {{ opacity: 0, duration: 0.3, ease: "power2.in" }}, ini + d - 0.3);
      }});
      tl.fromTo("#ref", {{ opacity: 0, y: 10 }}, {{ opacity: 1, y: 0, duration: 0.8, ease: "sine.out" }}, {ref_ini:.3f});
      tl.to("#ref", {{ opacity: 0, duration: 0.6, ease: "sine.in" }}, {ref_fim - 0.6:.3f});
      tl.set({{}}, {{}}, {dur:.3f});
      window.__timelines["main"] = tl;
      tl.seek(0);
    </script>
  </body>
</html>
"""
(AQUI / "assets" / "lib").mkdir(parents=True, exist_ok=True)
(AQUI / "assets" / "fonts").mkdir(parents=True, exist_ok=True)
shutil.copy2(RAIZ / "experimentos/hyperframes/teste-alerta/assets/lib/gsap.min.js", AQUI / "assets/lib/gsap.min.js")
fs = RAIZ / "engine/node_modules/@fontsource/montserrat/files"
shutil.copy2(fs / "montserrat-latin-700-normal.woff2", AQUI / "assets/fonts/montserrat-700.woff2")
shutil.copy2(fs / "montserrat-latin-800-normal.woff2", AQUI / "assets/fonts/montserrat-800.woff2")
(AQUI / "index.html").write_text(doc, encoding="utf-8")
print(f"[hf] overlay: {len(caps)} legendas, {len(etq)} etiquetas, duração {dur:.2f}s")
