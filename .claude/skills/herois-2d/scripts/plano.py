#!/usr/bin/env python3
"""Monta chaves de câmera e poses para uma tomada 2D, sem dependências."""
import argparse
import json
import math
from pathlib import Path

REFERENCIAS = Path(__file__).resolve().parent.parent / "references"
BASE = dict(bracoE=[10, 8], bracoD=[10, 8], pernaE=[4, 0], pernaD=[4, 0])
FASES = (0, 0.25, 0.52, 0.75, 1)

# Poses correspondem a início, antecipação, ação, reação e postura final.
# Cada câmera guarda centro X, centro Y, zoom e rotação, no mundo 1080 × 1920.
MOVIMENTOS = {
    "acrobacia": (
        [(550, 990, 1.10, 0), (520, 965, 1.04, -2), (620, 780, 1.02, 3),
         (650, 990, 1.05, 1), (605, 980, 1.13, 0)],
        [{}, dict(agachar=40, tronco=16, bracoE=[30, 75], pernaD=[20, 45]),
         dict(dx=130, bob=-235, tronco=-16, bracoD=[155, 16], bracoE=[70, 48],
              pernaD=[35, 60], pernaE=[-25, 22]),
         dict(dx=175, agachar=54, tronco=26, bracoE=[46, 45], pernaE=[20, 48], pernaD=[12, 68]),
         dict(dx=175, agachar=9, virar=0.25)],
        "Acessório ou cabelo acompanha o arco com leve atraso. Aterrissagem termina nos pés."
    ),
    "furtivo": (
        [(525, 980, 1.03, 0), (535, 950, 1.10, 0), (605, 920, 1.18, 0),
         (650, 870, 1.21, 0), (650, 840, 1.28, 0)],
        [dict(agachar=15), dict(olhar=[0.75, 0.05], cabecaIncl=8, virar=0.55),
         dict(dx=100, agachar=30, tronco=12, bracoD=[28, 60], pernaD=[35, 28], pernaE=[-17, 46]),
         dict(dx=160, agachar=17, tronco=5, bracoE=[35, 32], pernaE=[21, 21]),
         dict(dx=160, virar=0.4, olhar=[0.5, 0])],
        "Capa ou roupa reage depois do giro. A luz revela primeiro o contorno, depois o rosto."
    ),
    "voo": (
        [(540, 985, 1.07, 0), (540, 950, 1.01, 0), (635, 725, 1.01, 3),
         (655, 700, 1.04, 1), (665, 715, 1.08, 0)],
        [{}, dict(agachar=24, tronco=11, bracoE=[35, 35]),
         dict(dx=100, bob=-285, tronco=26, bracoD=[165, 8], pernaE=[10, 15], pernaD=[-12, 8]),
         dict(dx=140, bob=-315, tronco=8, bracoE=[35, 20], bracoD=[105, 15]),
         dict(dx=155, bob=-315, bracoE=[25, 12], bracoD=[28, 15])],
        "Capa, asas ou rastro respondem à direção do deslocamento, conforme a versão."
    ),
    "velocidade": (
        [(460, 980, 1.07, 0), (480, 980, 1.03, 1), (590, 980, 1.03, 2),
         (670, 980, 1.04, 0), (710, 930, 1.20, 0)],
        [{}, dict(agachar=25, tronco=19, bracoE=[30, 75], pernaD=[20, 38]),
         dict(dx=100, bob=-22, tronco=25, bracoE=[-28, 82], bracoD=[52, 85],
              pernaD=[-25, 65], pernaE=[54, 25]),
         dict(dx=205, agachar=29, tronco=13, bracoE=[45, 80], bracoD=[-20, 85],
              pernaE=[-20, 60], pernaD=[44, 23]),
         dict(dx=240, tronco=2, pernaD=[16, 8])],
        "Na composição, acrescente passadas intermediárias com apoio. O rastro só entra após a partida."
    ),
    "peso": (
        [(535, 990, 1.06, 0), (535, 1040, 1.04, 0), (575, 1020, 1.09, 0),
         (600, 990, 1.11, 0), (610, 930, 1.22, 0)],
        [{}, dict(agachar=36, tronco=12, bracoE=[25, 55], bracoD=[30, 55]),
         dict(dx=62, tronco=17, pernaD=[35, 18], pernaE=[-9, 19], bracoE=[45, 100]),
         dict(dx=92, agachar=28, tronco=7, pernaE=[12, 20], pernaD=[28, 24]),
         dict(dx=92, tronco=2, bracoE=[20, 12], bracoD=[21, 15])],
        "Mostre transferência de peso e pé plantado. O cenário reage depois do contato se fizer sentido."
    ),
    "magia": (
        [(540, 960, 1.09, 0), (540, 900, 1.21, 0), (540, 920, 1.10, 0),
         (540, 935, 1.09, 0), (540, 900, 1.16, 0)],
        [{}, dict(cabecaIncl=8, virar=0.18, bracoE=[33, 94], bracoD=[36, 98]),
         dict(tronco=-6, bracoE=[89, 30], bracoD=[95, 31], frenteE=True, frenteD=True),
         dict(bracoE=[72, 45], bracoD=[76, 50]), dict(bracoE=[21, 22], bracoD=[24, 25])],
        "O efeito é uma camada separada. Ele entra após o gesto e não cobre mãos ou rosto."
    ),
    "revelacao": (
        [(540, 980, 1.04, 0), (540, 940, 1.11, 0), (575, 865, 1.23, 0),
         (575, 865, 1.23, 0), (560, 920, 1.12, 0)],
        [{}, dict(virar=0.3, olhar=[0.5, 0], bracoD=[23, 57]),
         dict(tronco=-6, cabecaIncl=-5, bracoD=[73, 35], frenteD=True, maoD="aponta"),
         dict(tronco=-5, bracoD=[64, 44], frenteD=True, maoD="aberta"),
         dict(virar=0.2, bracoD=[14, 16])],
        "Apoie a revelação com luz ou detalhe de cenário e permita uma pausa para leitura."
    ),
}


def carregar(path):
    return json.loads(path.read_text(encoding="utf-8"))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    entrada = parser.add_mutually_exclusive_group(required=True)
    entrada.add_argument("--lista", action="store_true")
    entrada.add_argument("--id")
    entrada.add_argument("--ficha", type=Path)
    parser.add_argument("--segundos", type=float, default=4)
    parser.add_argument("--fps", type=int, default=30)
    args = parser.parse_args()
    if not math.isfinite(args.segundos) or not 1 <= args.segundos <= 60:
        parser.error("--segundos deve estar entre 1 e 60")
    if not 12 <= args.fps <= 120:
        parser.error("--fps deve estar entre 12 e 120")

    try:
        catalogo = carregar(REFERENCIAS / "personagens.json")
        if args.lista:
            for ficha in catalogo:
                print(f"{ficha['id']}\t{ficha['nome']}\t{ficha['versao']}")
            return
        if args.ficha:
            ficha = carregar(args.ficha)
        else:
            ficha = next((item for item in catalogo if item["id"] == args.id), None)
            if ficha is None:
                parser.error(f"ID não cadastrado: {args.id}. Use --lista ou --ficha.")
        obrigatorios = ("id", "nome", "versao", "silhueta", "traje", "gesto", "fundo", "movimento", "fonte")
        if not isinstance(ficha, dict) or any(
            not isinstance(ficha.get(campo), str) or not ficha[campo].strip() for campo in obrigatorios
        ):
            parser.error("Ficha incompleta. Consulte references/modelo-ficha.json.")
        if ficha["movimento"] not in MOVIMENTOS:
            parser.error("Movimento inválido. Opções: " + ", ".join(MOVIMENTOS))
    except (OSError, ValueError) as erro:
        parser.error(str(erro))

    camera, poses, secundario = MOVIMENTOS[ficha["movimento"]]
    total = round(args.segundos * args.fps)
    frames = [round((total - 1) * fase) for fase in FASES]
    plano = {
        "personagem": ficha,
        "fps": args.fps,
        "quadros": total,
        "mundo": [1080, 1920],
        "camera": [[frame, *chave] for frame, chave in zip(frames, camera)],
        "poses": [[frame, {**BASE, **pose}] for frame, pose in zip(frames, poses)],
        "movimento_secundario": secundario,
    }
    print(json.dumps(plano, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
