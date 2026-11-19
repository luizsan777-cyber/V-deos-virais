"""Audição de vozes candidatas por personagem (complemento Vozes Heróis).

Para cada ID gera N tomadas de VoiceDesign (mesma descrição, sementes diferentes), clona uma fala de teste em
cada uma (modelo Base, como no episódio) e monta um WAV de audição por personagem com rótulos falados na
narração padrão ("Batman, opção um"). Depois de ouvir, fixe a escolha no projeto:
    "vozes_herois": {"tomadas": {"dc/batman": 2}}

Uso: python3 ferramentas/vozes_herois_candidatos.py saida/audicao dc/batman=Batman marvel/gwen-stacy=Gwen \
        --tomadas 3 --fala "dc/batman=Peraí. A luz apagou."
"""
import argparse
import json
import os
import shutil
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

sys.path.insert(0, str(Path(__file__).parent))
import voz  # noqa: E402
from vozes_herois import (DIRECAO_PTBR, TEXTO_REFERENCIA, _Servidor, caminho_referencia,  # noqa: E402
                          carregar_perfis, semente)

NUMEROS = ["um", "dois", "três", "quatro", "cinco"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("saida")
    ap.add_argument("ids", nargs="+", help="id=Nome falado no rótulo")
    ap.add_argument("--tomadas", type=int, default=3)
    ap.add_argument("--fala", action="append", default=[], help="id=texto de teste")
    a = ap.parse_args()
    perfis = carregar_perfis({})
    nomes = dict(x.split("=", 1) for x in a.ids)
    falas = dict(x.split("=", 1) for x in a.fala)
    pasta = Path(os.environ.get("VOZES_HEROIS_DIR", voz.CACHE / "referencias_herois"))
    pasta.mkdir(parents=True, exist_ok=True)
    out = Path(a.saida)
    out.mkdir(parents=True, exist_ok=True)
    srv = _Servidor()
    refs = {}
    for id_voz in nomes:  # 1) todas as referências (modelo VoiceDesign carregado uma vez)
        direcao = DIRECAO_PTBR + perfis[id_voz]["direcao"]
        for k in range(1, a.tomadas + 1):
            cam = caminho_referencia(pasta, id_voz, direcao, k)
            if not cam.is_file():
                print(f"[candidatos] VoiceDesign {id_voz} tomada {k}", flush=True)
                tmp = srv.pedir(op="design", texto=TEXTO_REFERENCIA, instrucao=direcao, seed=semente(id_voz, k),
                                saida=str(out / f"_ref_{k}.wav"))
                shutil.move(str(tmp), cam)
            refs[(id_voz, k)] = cam
    clones = {}
    for (id_voz, k), cam in refs.items():  # 2) a fala de teste em cada voz (modelo Base, como no episódio)
        print(f"[candidatos] clone {id_voz} tomada {k}", flush=True)
        o = srv.pedir(op="clone", texto=voz.normalizar(falas.get(id_voz, TEXTO_REFERENCIA)), ref_audio=str(cam),
                      ref_texto=TEXTO_REFERENCIA, seed=semente(id_voz, k), saida=str(out / f"_c_{k}.wav"))
        x, sr = sf.read(o, dtype="float32")
        clones[(id_voz, k)] = voz.aparar(voz.reamostrar(x if x.ndim == 1 else x.mean(1), sr))
    narr = voz.MOTORES["kokoro"](None, dict(voz.PERFIS["documentario"]))  # rótulos na narração padrão
    sil = lambda s: np.zeros(int(s * voz.SR), np.float32)
    manifesto = {}
    for id_voz, nome in nomes.items():
        partes = []
        for k in range(1, a.tomadas + 1):
            rot = voz.aparar(narr.falar(f"{nome}, opção {NUMEROS[k - 1]}."))
            c = clones[(id_voz, k)]
            partes += [rot * 0.6 / max(1e-6, np.abs(rot).max()), sil(0.45), c * 0.89 / max(1e-6, np.abs(c).max()), sil(1.0)]
            manifesto.setdefault(id_voz, {})[k] = refs[(id_voz, k)].name
        arq = out / f"audicao_{id_voz.replace('/', '_')}.wav"
        sf.write(arq, np.concatenate(partes), voz.SR, subtype="PCM_16")
        print(f"[candidatos] {arq}", flush=True)
    for f in out.glob("_*.wav"):
        f.unlink()
    (out / "candidatos.json").write_text(json.dumps(manifesto, ensure_ascii=False, indent=1), encoding="utf-8")


if __name__ == "__main__":
    main()
