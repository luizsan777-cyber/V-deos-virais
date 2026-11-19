"""Vozes originais por personagem (complemento Vozes Heróis Marvel/DC), acionadas explicitamente no episódio.

Adaptado do pacote Vozes_Herois_Marvel_DC.zip ao gerador real deste repositório:
- o Qwen3-TTS roda no ambiente isolado venv-qwen3 (ferramentas/vozes_herois_servidor.py), como o motor qwen3_local;
- os modelos 1.7B VoiceDesign/Base são lidos de /home/user/ferramentas-externas/qwen3-modelos quando existem;
- a identidade (hash) de cada referência é a mesma do pacote original (id + modelo + idioma + texto + direção).

projeto.json:
  "vozes_herois": {"narrar_com": "dc/batman"}              -> o personagem narra o episódio todo
  "vozes_herois": {}  + fala "voz_personagem": "dc/batman"  -> voz por fala; sem marcação = narração padrão
  "vozes_herois": {"perfis": {"original/x": "descrição"}}  -> personagens/versões novos
  fala "voz_personagem": "narrador"                        -> volta à narração padrão nessa fala
Referências sintéticas: $VOZES_HEROIS_DIR ou $VIRAL_CACHE/referencias_herois (manifesto em referencias_vozes_herois.json).
"""
from __future__ import annotations

import hashlib
import json
import os
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

import numpy as np
import soundfile as sf

MODELO_DESIGN = "Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign"
MODELO_BASE = "Qwen/Qwen3-TTS-12Hz-1.7B-Base"
IDIOMA = "Portuguese"
DIRECAO_PTBR = "Original voice speaking native Brazilian Portuguese, natural and intelligible. "
TEXTO_REFERENCIA = (
    "É melhor esperar um instante. Ouvi passos do outro lado da rua. "
    "Quando a luz acender, a gente vai saber quem chegou."
)
AQUI = Path(__file__).parent
CATALOGO = AQUI / "perfis_vozes_herois.json"
MANIFESTO = AQUI / "referencias_vozes_herois.json"
FORMATO_ID = re.compile(r"(?:marvel|dc|original)/[a-z0-9]+(?:-[a-z0-9]+)*")


def carregar_perfis(cfg: dict) -> dict:
    perfis = json.loads(CATALOGO.read_text(encoding="utf-8"))
    personalizados = cfg.get("perfis", {})
    if not isinstance(personalizados, dict):
        raise ValueError("vozes_herois.perfis deve mapear ID para descrição.")
    for id_voz, direcao in personalizados.items():
        if not FORMATO_ID.fullmatch(id_voz) or not isinstance(direcao, str) or not direcao.strip():
            raise ValueError(f"Perfil de voz inválido: {id_voz!r}.")
        perfis[id_voz] = {"direcao": direcao.strip()}
    return perfis


def semente(id_voz: str) -> int:
    return int(hashlib.sha256(id_voz.encode()).hexdigest()[:6], 16)


class _Servidor:
    def __init__(self):
        py = os.environ.get("QWEN3_PY", "/home/user/ferramentas-externas/venv-qwen3/bin/python")
        if not Path(py).exists():
            raise SystemExit("Vozes por personagem: Qwen3-TTS local não instalado (QWEN3_PY). A voz NÃO foi trocada.")
        self.p = subprocess.Popen([py, str(AQUI / "vozes_herois_servidor.py")], stdin=subprocess.PIPE,
                                  stdout=subprocess.PIPE, text=True, bufsize=1)
        self._esperar("pronto")

    def _esperar(self, prefixo):
        while True:
            linha = self.p.stdout.readline()
            if not linha:
                raise SystemExit("O servidor das vozes por personagem parou. A voz NÃO foi trocada.")
            if linha.startswith("erro "):
                raise SystemExit(f"Vozes por personagem falharam: {linha[5:].strip()}. A voz NÃO foi trocada.")
            if linha.startswith(prefixo):
                return linha

    def pedir(self, **pedido) -> Path:
        self.p.stdin.write(json.dumps(pedido, ensure_ascii=False) + "\n")
        self.p.stdin.flush()
        return Path(self._esperar("ok ")[3:].strip())


class VozesHerois:
    def __init__(self, cfg, falas, cache, reamostrar):
        if not isinstance(cfg, dict):
            raise ValueError("vozes_herois deve ser um objeto no projeto.json.")
        perfis = carregar_perfis(cfg)
        self.padrao = cfg.get("narrar_com", "narrador")
        self.reamostrar = reamostrar
        self._srv = None
        self.td = Path(tempfile.mkdtemp())
        self.n = 0
        ids = list(dict.fromkeys(self.id_da_fala(fala) for fala in falas))
        ids = [id_voz for id_voz in ids if id_voz != "narrador"]
        for id_voz in ids:
            if id_voz not in perfis:
                raise ValueError(f"Voz {id_voz!r} fora do catálogo. Cadastre em vozes_herois.perfis.")

        pasta = Path(os.environ.get("VOZES_HEROIS_DIR", cache / "referencias_herois"))
        self.referencias, self.direcoes = {}, {}
        pendentes = {}
        for id_voz in ids:
            direcao = DIRECAO_PTBR + perfis[id_voz]["direcao"]
            identidade = "\n".join((id_voz, MODELO_DESIGN, IDIOMA, TEXTO_REFERENCIA, direcao))
            marca = hashlib.sha256(identidade.encode()).hexdigest()[:18]
            caminho = pasta / f"{id_voz.replace('/', '_')}-{marca}.wav"
            self.referencias[id_voz] = caminho
            self.direcoes[id_voz] = direcao
            if caminho.is_file() and sf.info(caminho).frames > 0:
                print(f"[voz] referência reutilizada: {caminho.name}", flush=True)
                continue
            pendentes[id_voz] = direcao
        if pendentes:
            pasta.mkdir(parents=True, exist_ok=True)
            self.criar_referencias(pendentes)
        self.registrar()

    @property
    def srv(self):
        if self._srv is None:
            self._srv = _Servidor()
        return self._srv

    def id_da_fala(self, fala):
        id_voz = fala.get("voz_personagem", self.padrao)
        if id_voz == "narrador":
            return id_voz
        if not isinstance(id_voz, str) or not FORMATO_ID.fullmatch(id_voz):
            raise ValueError(f"voz_personagem inválida na fala {fala.get('id')!r}: {id_voz!r}.")
        return id_voz

    def criar_referencias(self, pendentes):
        for id_voz, direcao in pendentes.items():
            print(f"[voz] criando referência sintética de {id_voz} (VoiceDesign)…", flush=True)
            tmp = self.srv.pedir(op="design", texto=TEXTO_REFERENCIA, instrucao=direcao, seed=semente(id_voz),
                                 saida=str(self.td / f"ref_{id_voz.replace('/', '_')}.wav"))
            shutil.move(str(tmp), self.referencias[id_voz])

    def registrar(self):
        """Manifesto versionado: permite conferir se uma referência restaurada é a mesma voz aprovada."""
        man = json.loads(MANIFESTO.read_text(encoding="utf-8")) if MANIFESTO.exists() else {}
        for id_voz, cam in self.referencias.items():
            man[id_voz] = {"arquivo": cam.name, "sha256": hashlib.sha256(cam.read_bytes()).hexdigest(),
                           "segundos": round(sf.info(cam).duration, 2), "direcao": self.direcoes[id_voz],
                           "modelo_design": MODELO_DESIGN, "modelo_clone": MODELO_BASE, "semente": semente(id_voz)}
        MANIFESTO.write_text(json.dumps(dict(sorted(man.items())), ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

    def falar(self, id_voz, texto, seed=None):
        self.n += 1
        out = self.srv.pedir(op="clone", texto=texto, ref_audio=str(self.referencias[id_voz]), ref_texto=TEXTO_REFERENCIA,
                             seed=seed if seed is not None else semente(id_voz), saida=str(self.td / f"f{self.n}.wav"))
        a, sr = sf.read(out, dtype="float32")
        return self.reamostrar(a if a.ndim == 1 else a.mean(1), sr)
