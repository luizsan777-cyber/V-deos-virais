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
# Sotaque: o pacote original dizia só "native Brazilian Portuguese" e o resultado soou lusitano. A direção agora
# descreve a pronúncia brasileira e proíbe a de Portugal, e o texto de referência é português brasileiro informal
# (formas como "tô", "cê", "tá", "peraí", "sacar", "a gente") cheio de palavras em que o sotaque aparece:
# "noite" (noitchi), "cidade"/"verdade" (cidadji), "de" (dji), "gente", "tranquilo".
DIRECAO_PTBR = (
    "Original voice. Speaks Brazilian Portuguese from Brazil with a clear Brazilian accent (São Paulo / Rio), "
    "casual everyday Brazilian speech: 'ti' and 'di' pronounced 'tchi' and 'dji', unstressed final 'e' sounds "
    "like 'i' and final 'o' like 'u', full open vowels, warm melodic Brazilian intonation. "
    "Absolutely not a European Portuguese or Portugal accent. "
)
TEXTO_REFERENCIA = (
    "Ô, peraí, rapidinho. Cê tá ouvindo isso? Tem gente lá do outro lado da rua, de verdade. "
    "Fica tranquilo, tá? Quando a luz da cidade acender de noite, a gente vai sacar quem chegou."
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


def semente(id_voz: str, tomada: int = 1) -> int:
    """Tomada 1 = semente-base do ID; tomadas 2, 3… geram outras vozes candidatas com a mesma descrição."""
    return int(hashlib.sha256(id_voz.encode()).hexdigest()[:6], 16) + (tomada - 1) * 7919


def caminho_referencia(pasta: Path, id_voz: str, direcao: str, tomada: int = 1) -> Path:
    identidade = "\n".join((id_voz, MODELO_DESIGN, IDIOMA, TEXTO_REFERENCIA, direcao) + ((f"tomada {tomada}",) if tomada > 1 else ()))
    marca = hashlib.sha256(identidade.encode()).hexdigest()[:18]
    return pasta / f"{id_voz.replace('/', '_')}-{marca}.wav"


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
        # um modelo de 1.7B por processo: ao trocar de etapa (design -> clone), reinicia o servidor para devolver
        # toda a RAM do modelo anterior (com os dois carregados o processo passou de 13 GB e foi morto por falta de memória)
        if getattr(self, "op", None) not in (None, pedido["op"]):
            self.fechar()
            self.__init__()
        self.op = pedido["op"]
        self.p.stdin.write(json.dumps(pedido, ensure_ascii=False) + "\n")
        self.p.stdin.flush()
        return Path(self._esperar("ok ")[3:].strip())

    def fechar(self):
        self.p.stdin.close()
        try:
            self.p.wait(timeout=60)
        except subprocess.TimeoutExpired:
            self.p.kill()


class VozesHerois:
    def __init__(self, cfg, falas, cache, reamostrar):
        if not isinstance(cfg, dict):
            raise ValueError("vozes_herois deve ser um objeto no projeto.json.")
        perfis = carregar_perfis(cfg)
        self.padrao = cfg.get("narrar_com", "narrador")
        # idioma das FALAS (a referência continua a mesma, em pt-BR): "Portuguese" (padrão), "Spanish", "English"…
        self.idioma = cfg.get("idioma", IDIOMA)
        if not isinstance(self.idioma, str) or not self.idioma.strip():
            raise ValueError("vozes_herois.idioma deve ser um nome de idioma do Qwen3, ex.: \"Spanish\".")
        tomadas = cfg.get("tomadas", {})  # voz candidata escolhida de ouvido: {"dc/batman": 2}
        if not isinstance(tomadas, dict) or any(not isinstance(v, int) or v < 1 for v in tomadas.values()):
            raise ValueError("vozes_herois.tomadas deve mapear ID para número de tomada (1, 2, 3…).")
        self.tomadas = {}
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
            self.tomadas[id_voz] = tomadas.get(id_voz, 1)
            caminho = caminho_referencia(pasta, id_voz, direcao, self.tomadas[id_voz])
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
            tmp = self.srv.pedir(op="design", texto=TEXTO_REFERENCIA, instrucao=direcao, seed=semente(id_voz, self.tomadas[id_voz]),
                                 saida=str(self.td / f"ref_{id_voz.replace('/', '_')}.wav"))
            shutil.move(str(tmp), self.referencias[id_voz])

    def registrar(self):
        """Manifesto versionado: permite conferir se uma referência restaurada é a mesma voz aprovada."""
        man = json.loads(MANIFESTO.read_text(encoding="utf-8")) if MANIFESTO.exists() else {}
        for id_voz, cam in self.referencias.items():
            man[id_voz] = {"arquivo": cam.name, "sha256": hashlib.sha256(cam.read_bytes()).hexdigest(),
                           "segundos": round(sf.info(cam).duration, 2), "direcao": self.direcoes[id_voz],
                           "modelo_design": MODELO_DESIGN, "modelo_clone": MODELO_BASE, "tomada": self.tomadas[id_voz],
                           "semente": semente(id_voz, self.tomadas[id_voz]), "texto_referencia": TEXTO_REFERENCIA}
        MANIFESTO.write_text(json.dumps(dict(sorted(man.items())), ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

    def falar(self, id_voz, texto, seed=None):
        # cache: mesma referência + texto + semente + idioma = mesmo áudio (a síntese é determinística);
        # assim mudar só pausas/cenas não exige sintetizar de novo
        seed = seed if seed is not None else semente(id_voz, self.tomadas[id_voz])
        chave = hashlib.sha256("\n".join((self.referencias[id_voz].name, texto, str(seed), self.idioma)).encode()).hexdigest()[:24]
        cache = self.referencias[id_voz].parent.parent / "falas_herois" / f"{chave}.wav"
        if cache.is_file():
            a, sr = sf.read(cache, dtype="float32")
            return self.reamostrar(a if a.ndim == 1 else a.mean(1), sr)
        self.n += 1
        out = self.srv.pedir(op="clone", texto=texto, idioma=self.idioma, ref_audio=str(self.referencias[id_voz]), ref_texto=TEXTO_REFERENCIA,
                             seed=seed, saida=str(self.td / f"f{self.n}.wav"))
        cache.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(out, cache)
        a, sr = sf.read(out, dtype="float32")
        return self.reamostrar(a if a.ndim == 1 else a.mean(1), sr)
