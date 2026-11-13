"""Narração em português brasileiro.

Gera, para um projeto:
  build/narracao.wav   voz final (48 kHz mono), já com o respiro inicial
  build/tempos.json    tempos de falas, palavras (legendas), boca (lip-sync) e efeitos sonoros

Motores (escolha em projeto.json -> voz.motor, ou variável VOZ_MOTOR):
  kokoro     local, offline, CPU, Apache-2.0 (padrão; modelo baixado do GitHub na 1ª vez)
  piper      local, offline, CPU, MIT (voz pt_BR do Hugging Face)
  chatterbox local, CPU/GPU, MIT; aceita voz de referência autorizada (clonagem)
  qwen3      local, CPU/GPU, Apache-2.0; aceita instrução de estilo
  edge       serviço online gratuito da Microsoft (não oficial; ver docs/VOZ.md)
"""
from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import tempfile
import urllib.request
from pathlib import Path

import numpy as np
import soundfile as sf

sys.path.insert(0, str(Path(__file__).parent))
from texto_ptbr import normalizar, silabas  # noqa: E402

SR = 48000
FPS = 30
CACHE = Path(os.environ.get("VIRAL_CACHE", Path.home() / ".cache" / "viral-engine"))
PERFIS = json.loads((Path(__file__).parent / "perfis.json").read_text(encoding="utf-8"))


# --------------------------------------------------------------------------- utilidades de áudio
def reamostrar(a: np.ndarray, sr: int, alvo: int = SR) -> np.ndarray:
    if sr == alvo:
        return a.astype(np.float32)
    n = int(round(len(a) * alvo / sr))
    x = np.linspace(0, len(a) - 1, n)
    return np.interp(x, np.arange(len(a)), a).astype(np.float32)


def ler_audio(caminho: str | Path) -> np.ndarray:
    """Lê qualquer formato via ffmpeg e devolve mono float32 a 48 kHz."""
    out = subprocess.run(["ffmpeg", "-v", "error", "-i", str(caminho), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(out, dtype=np.float32).copy()


def rms_janela(a: np.ndarray, jan: int) -> np.ndarray:
    n = len(a) // jan
    if n == 0:
        return np.zeros(0)
    b = a[: n * jan].reshape(n, jan)
    return np.sqrt((b ** 2).mean(axis=1) + 1e-12)


def aparar(a: np.ndarray, limiar_db: float = -42) -> np.ndarray:
    jan = SR // 200  # 5 ms
    r = rms_janela(a, jan)
    if len(r) == 0:
        return a
    ref = r.max()
    ativo = np.where(20 * np.log10(r / ref + 1e-9) > limiar_db)[0]
    if len(ativo) == 0:
        return a
    i0 = max(0, ativo[0] * jan - SR // 100)
    i1 = min(len(a), (ativo[-1] + 1) * jan + SR // 25)
    return a[i0:i1]


def silencios(a: np.ndarray, min_s: float = 0.12, limiar_db: float = -38) -> list[tuple[float, float]]:
    """Intervalos de silêncio internos (em segundos)."""
    jan = SR // 100  # 10 ms
    r = rms_janela(a, jan)
    if len(r) == 0:
        return []
    db = 20 * np.log10(r / (r.max() + 1e-9) + 1e-9)
    sil = db < limiar_db
    res, i = [], 0
    while i < len(sil):
        if sil[i]:
            j = i
            while j < len(sil) and sil[j]:
                j += 1
            if (j - i) * 0.01 >= min_s and i > 0 and j < len(sil):
                res.append((i * 0.01, j * 0.01))
            i = j
        else:
            i += 1
    return res


def limitar_pausas(a: np.ndarray, max_s: float) -> np.ndarray:
    """Encurta pausas internas maiores que max_s (com microfades, sem cliques)."""
    a = a.copy()
    partes, ini = [], 0
    fade = int(0.008 * SR)
    for s0, s1 in silencios(a, min_s=max_s + 0.02):
        excesso = (s1 - s0) - max_s
        meio = (s0 + s1) / 2
        c0, c1 = int((meio - excesso / 2) * SR), int((meio + excesso / 2) * SR)
        seg = a[ini:c0].copy()
        seg[-fade:] *= np.linspace(1, 0, fade)
        partes.append(seg)
        ini = c1
        nxt = a[ini:ini + fade]
        a[ini:ini + len(nxt)] = nxt * np.linspace(0, 1, len(nxt))
    partes.append(a[ini:])
    return np.concatenate(partes)


# --------------------------------------------------------------------------- motores
class MotorKokoro:
    nome = "kokoro"
    URL = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/"

    def __init__(self, voz: str | None, perfil: dict):
        from kokoro_onnx import Kokoro
        d = CACHE / "kokoro"
        d.mkdir(parents=True, exist_ok=True)
        for f in ("kokoro-v1.0.onnx", "voices-v1.0.bin"):
            if not (d / f).exists():
                print(f"[voz] baixando {f} (uma vez)…", flush=True)
                urllib.request.urlretrieve(self.URL + f, d / f)
        self.k = Kokoro(str(d / "kokoro-v1.0.onnx"), str(d / "voices-v1.0.bin"))
        self.voz = voz or perfil["vozes"]["kokoro"]
        if not self.voz.startswith("p"):
            raise SystemExit(f"Voz Kokoro '{self.voz}' não é pt-BR. Use pm_alex, pm_santa ou pf_dora.")
        self.vel = perfil["velocidade"]

    def falar(self, texto: str) -> np.ndarray:
        a, sr = self.k.create(texto, voice=self.voz, speed=self.vel, lang="pt-br")
        return reamostrar(np.asarray(a, dtype=np.float32), sr)


class MotorPiper:
    nome = "piper"
    HF = "https://huggingface.co/rhasspy/piper-voices/resolve/main/pt/pt_BR/{spk}/{q}/pt_BR-{spk}-{q}.onnx"

    def __init__(self, voz: str | None, perfil: dict):
        from piper import PiperVoice
        voz = voz or perfil["vozes"]["piper"]
        _, spk, q = voz.split("-")
        d = CACHE / "piper"
        d.mkdir(parents=True, exist_ok=True)
        m = d / f"{voz}.onnx"
        for suf in ("", ".json"):
            if not Path(str(m) + suf).exists():
                urllib.request.urlretrieve(self.HF.format(spk=spk, q=q) + suf, str(m) + suf)
        self.v = PiperVoice.load(str(m))
        self.vel = perfil["velocidade"]

    def falar(self, texto: str) -> np.ndarray:
        from piper import SynthesisConfig
        partes = list(self.v.synthesize(texto, syn_config=SynthesisConfig(length_scale=1 / self.vel)))
        a = np.concatenate([p.audio_float_array for p in partes])
        return reamostrar(a, self.v.config.sample_rate)


class MotorEdge:
    nome = "edge"

    def __init__(self, voz: str | None, perfil: dict):
        self.voz = voz or perfil["vozes"]["edge"]
        if not self.voz.startswith("pt-BR"):
            raise SystemExit("Voz edge precisa ser pt-BR (ex.: pt-BR-AntonioNeural).")
        pct = int(round((perfil["velocidade"] - 1) * 100))
        self.rate = f"{pct:+d}%"

    def falar(self, texto: str) -> np.ndarray:
        import asyncio
        import edge_tts
        with tempfile.TemporaryDirectory() as td:
            mp3 = Path(td) / "f.mp3"
            asyncio.run(edge_tts.Communicate(texto, self.voz, rate=self.rate).save(str(mp3)))
            return ler_audio(mp3)


class MotorChatterbox:
    nome = "chatterbox"

    def __init__(self, voz: str | None, perfil: dict):
        import torch
        from chatterbox.mtl_tts import ChatterboxMultilingualTTS
        dev = "cuda" if torch.cuda.is_available() else "cpu"
        self.m = ChatterboxMultilingualTTS.from_pretrained(device=dev)
        self.ref = voz if voz and Path(voz).exists() else None  # caminho de áudio de referência autorizado
        self.exag = perfil.get("expressividade", 0.5)
        self.vel = perfil["velocidade"]

    def falar(self, texto: str) -> np.ndarray:
        kw = dict(language_id="pt", exaggeration=self.exag, cfg_weight=0.4)
        if self.ref:
            kw["audio_prompt_path"] = self.ref
        wav = self.m.generate(texto, **kw)
        a = reamostrar(wav.squeeze().cpu().numpy(), self.m.sr)
        return acelerar(a, self.vel)


class MotorQwen3:
    nome = "qwen3"

    def __init__(self, voz: str | None, perfil: dict):
        import torch
        from qwen_tts import Qwen3TTSModel
        dev = "cuda:0" if torch.cuda.is_available() else "cpu"
        nome = os.environ.get("QWEN3_MODELO", "Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice")
        self.m = Qwen3TTSModel.from_pretrained(nome, device_map=dev, dtype=torch.float32 if dev == "cpu" else torch.bfloat16)
        self.voz = voz or perfil["vozes"]["qwen3"]
        self.instr = perfil.get("instrucao", "")
        self.vel = perfil["velocidade"]

    def falar(self, texto: str) -> np.ndarray:
        wavs, sr = self.m.generate_custom_voice(text=texto, language="Portuguese", speaker=self.voz, instruct=self.instr)
        return acelerar(reamostrar(np.asarray(wavs[0], dtype=np.float32), sr), self.vel)


MOTORES = {c.nome: c for c in (MotorKokoro, MotorPiper, MotorEdge, MotorChatterbox, MotorQwen3)}


def acelerar(a: np.ndarray, fator: float) -> np.ndarray:
    """Muda o andamento sem mudar o tom (ffmpeg atempo)."""
    if abs(fator - 1) < 0.01:
        return a
    with tempfile.TemporaryDirectory() as td:
        i, o = Path(td) / "i.wav", Path(td) / "o.wav"
        sf.write(i, a, SR)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(i), "-af", f"atempo={fator:.3f}", str(o)], check=True)
        return ler_audio(o)


# --------------------------------------------------------------------------- tempos de palavras
def tokens(texto: str) -> list[str]:
    return [w for w in re.split(r"\s+", texto.strip()) if w]


def tempos_palavras(texto: str, audio: np.ndarray, t0: float) -> list[dict]:
    """Distribui o tempo da fala entre as palavras.

    Divide a frase nos pontos de pontuação; se o número de silêncios detectados bate com as pausas
    esperadas, cada trecho fica preso ao seu segmento de áudio. Dentro do trecho, o tempo é repartido
    pelo número de sílabas (fala normalizada) + um custo fixo por palavra.
    """
    palavras = tokens(texto)
    dur = len(audio) / SR
    # grupos separados por pontuação forte/média
    grupos, atual = [], []
    for w in palavras:
        atual.append(w)
        if re.search(r"[,;:.!?…—]$", w):
            grupos.append(atual)
            atual = []
    if atual:
        grupos.append(atual)
    peso = lambda w: silabas(normalizar(w)) * 1.0 + 0.6  # noqa: E731
    sil = silencios(audio, min_s=0.07)
    # para cada fronteira de pontuação, usa o silêncio mais próximo da posição prevista pelas sílabas
    tot = sum(peso(w) for w in palavras)
    segs, ini, acum, usados = [], 0.0, 0.0, set()
    for g in grupos[:-1]:
        acum += sum(peso(w) for w in g)
        prev = dur * acum / tot
        cand = [(abs((s0 + s1) / 2 - prev), k) for k, (s0, s1) in enumerate(sil) if k not in usados and s0 > ini]
        cand = [c for c in cand if c[0] < max(0.35, dur * 0.18)]
        # o trecho precisa ter pelo menos ~60% da duração prevista pelas sílabas (evita colar 2 palavras num micro-silêncio)
        esperado = dur * sum(peso(w) for w in g) / tot
        cand = [c for c in cand if sil[c[1]][0] - ini >= 0.6 * esperado]
        if cand:
            _, k = min(cand)
            usados.add(k)
            segs.append((ini, sil[k][0]))
            ini = sil[k][1]
        else:
            # sem silêncio adequado: corta na posição prevista, mas nunca antes do início do trecho
            minimo = dur * sum(peso(w) for w in g) / tot * 0.8
            corte = min(max(prev, ini + minimo), dur - 0.05)
            segs.append((ini, corte))
            ini = corte
    segs.append((ini, dur))
    res = []
    for g, (a0, a1) in zip(grupos, segs):
        pesos = [peso(w) for w in g]
        tot = sum(pesos)
        t = a0
        for w, p in zip(g, pesos):
            d = (a1 - a0) * p / tot
            res.append({"w": w, "ini": round(t0 + t, 3), "fim": round(t0 + t + d, 3)})
            t += d
    return res


def envelope_boca(a: np.ndarray) -> list[float]:
    jan = SR // FPS
    r = rms_janela(a, jan)
    if len(r) == 0:
        return []
    db = 20 * np.log10(r + 1e-9)
    alto = np.percentile(db[db > -60], 95) if (db > -60).any() else -20
    v = np.clip((db - (alto - 30)) / 30, 0, 1)
    # suaviza (ataque rápido, soltura lenta)
    out, s = [], 0.0
    for x in v:
        s = x if x > s else s * 0.55 + x * 0.45
        out.append(round(float(s), 3))
    return out


def limpar(w: str) -> str:
    return re.sub(r"[^\w]", "", w.lower()).replace("_", "")


# --------------------------------------------------------------------------- referências de sfx
def resolver_ref(ref: str, falas: list[dict], palavras: list[dict]) -> float:
    m = re.match(r"^(.*?)([+-]\d+(?:\.\d+)?)?$", ref.strip())
    base, off = m[1], float(m[2] or 0)
    if base.startswith("t:"):
        return float(base[2:]) + off
    if base.startswith("palavra:"):
        alvo = base[8:]
        n = 1
        if "#" in alvo:
            alvo, n = alvo.split("#")
            n = int(n)
        cont = 0
        for p in palavras:
            if limpar(p["w"]) == limpar(alvo):
                cont += 1
                if cont == n:
                    return p["ini"] + off
        raise SystemExit(f"Palavra '{alvo}' (ocorrência {n}) não encontrada na narração.")
    fim = base.endswith(":fim")
    fid = base[:-4] if fim else base
    for f in falas:
        if f["id"] == fid:
            return (f["fim"] if fim else f["ini"]) + off
    raise SystemExit(f"Referência '{ref}' não encontrada (use id de fala, palavra:x ou t:segundos).")


# --------------------------------------------------------------------------- principal
def gerar(projeto_dir: Path) -> dict:
    proj = json.loads((projeto_dir / "projeto.json").read_text(encoding="utf-8"))
    perfil_nome = proj.get("perfil", "documentario")
    perfil = dict(PERFIS[perfil_nome])
    cfg = proj.get("voz", {})
    if "velocidade" in cfg:
        perfil["velocidade"] = cfg["velocidade"]
    motor_nome = os.environ.get("VOZ_MOTOR") or cfg.get("motor", "kokoro")
    voz = os.environ.get("VOZ_NOME") or cfg.get("voz")
    if motor_nome != cfg.get("motor", "kokoro") and not os.environ.get("VOZ_NOME"):
        voz = None
    print(f"[voz] motor={motor_nome} voz={voz or perfil['vozes'].get(motor_nome)} perfil={perfil_nome}", flush=True)
    motor = MOTORES[motor_nome](voz, perfil)

    build = projeto_dir / "build"
    build.mkdir(exist_ok=True)
    inicio = proj.get("inicio_s", 0.25)
    cauda = proj.get("fim_s", 0.9)
    pedacos = [np.zeros(int(inicio * SR), np.float32)]
    t = inicio
    falas, palavras = [], []
    destaques = {limpar(d) for d in proj.get("destaques", [])}
    for i, fala in enumerate(proj["falas"]):
        texto_tts = normalizar(fala.get("tts", fala["texto"]))
        vel0 = getattr(motor, "vel", None)
        if "velocidade" in fala and vel0 is not None:  # ritmo próprio desta fala (ex.: trecho mais sério)
            motor.vel = fala["velocidade"]
        a = aparar(motor.falar(texto_tts))
        if vel0 is not None:
            motor.vel = vel0
        a = limitar_pausas(a, perfil.get("pausa_max_interna", 0.32))
        pw = tempos_palavras(fala["texto"], a, t)
        for p in pw:
            p["destaque"] = limpar(p["w"]) in destaques
            p["fala"] = fala["id"]
        palavras += pw
        dur = len(a) / SR
        falas.append({"id": fala["id"], "texto": fala["texto"], "ini": round(t, 3), "fim": round(t + dur, 3)})
        pausa = fala.get("pausa", perfil["pausa_entre_falas"]) if i < len(proj["falas"]) - 1 else cauda
        pedacos += [a, np.zeros(int(pausa * SR), np.float32)]
        t += dur + pausa
        print(f"[voz] {fala['id']}: {dur:.2f}s", flush=True)

    voz_audio = np.concatenate(pedacos)
    pico = np.abs(voz_audio).max()
    if pico > 0:
        voz_audio = voz_audio / pico * 0.89
    sf.write(build / "narracao.wav", voz_audio, SR, subtype="PCM_16")
    duracao = len(voz_audio) / SR
    sfx = [{"som": s["som"], "t": round(resolver_ref(s["em"], falas, palavras), 3), "vol": s.get("vol", 0)}
           for s in proj.get("sfx", [])]
    tempos = {
        "fps": FPS, "duracao_s": round(duracao, 3), "frames": int(np.ceil(duracao * FPS)),
        "motor": motor_nome, "perfil": perfil_nome,
        "falas": falas, "palavras": palavras, "sfx": sfx, "boca": envelope_boca(voz_audio),
    }
    (build / "tempos.json").write_text(json.dumps(tempos, ensure_ascii=False), encoding="utf-8")
    print(f"[voz] total {duracao:.2f}s, {len(palavras)} palavras", flush=True)
    return tempos


if __name__ == "__main__":
    gerar(Path(sys.argv[1]))
