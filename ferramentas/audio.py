"""Efeitos sonoros e trilha sintetizados em código (100% originais, sem licença de terceiros) + mixagem.

  python ferramentas/audio.py projetos/<slug>

Lê build/narracao.wav e build/tempos.json, gera build/sfx.wav, build/musica.wav e build/mix.wav
(voz sempre em primeiro plano: trilha com ducking por sidechain, loudness final -14 LUFS, pico -1 dBTP).
"""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

SR = 48000
RNG = np.random.default_rng(7)


# ------------------------------------------------------------------ blocos de síntese
def t_(d: float) -> np.ndarray:
    return np.arange(int(d * SR)) / SR


def env(n: int, a: float, d: float, curva: float = 3.0) -> np.ndarray:
    """ataque linear (s) + decaimento exponencial (s)"""
    t = np.arange(n) / SR
    e = np.where(t < a, t / max(a, 1e-4), np.exp(-(t - a) * curva / max(d, 1e-4)))
    return e.astype(np.float32)


def lowpass(x: np.ndarray, fc: float | np.ndarray) -> np.ndarray:
    """filtro passa-baixa de 1 polo (fc pode variar no tempo)."""
    fc = np.broadcast_to(np.asarray(fc, dtype=np.float64), x.shape)
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x)
    s = 0.0
    for i in range(len(x)):
        s = (1 - a[i]) * x[i] + a[i] * s
        y[i] = s
    return y


def lp_rapido(x: np.ndarray, fc: float, ordem: int = 2) -> np.ndarray:
    """passa-baixa via FFT (rápido, fc fixo)."""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (f / fc) ** (2 * ordem))
    return np.fft.irfft(X, len(x)).astype(np.float32)


def hp_rapido(x: np.ndarray, fc: float, ordem: int = 2) -> np.ndarray:
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR) + 1e-6
    X *= 1 / np.sqrt(1 + (fc / f) ** (2 * ordem))
    return np.fft.irfft(X, len(x)).astype(np.float32)


def bp_rapido(x: np.ndarray, f0: float, q: float = 2.0) -> np.ndarray:
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR) + 1e-6
    X *= 1 / np.sqrt(1 + q * q * (f / f0 - f0 / f) ** 2)
    return np.fft.irfft(X, len(x)).astype(np.float32)


def ruido(d: float) -> np.ndarray:
    return RNG.standard_normal(int(d * SR)).astype(np.float32)


def reverb(x: np.ndarray, dur: float = 1.8, mix: float = 0.25, brilho: float = 6000) -> np.ndarray:
    """reverb por convolução com resposta impulsiva sintética (ruído decaindo)."""
    n = int(dur * SR)
    ir = RNG.standard_normal(n).astype(np.float32) * np.exp(-np.arange(n) / SR * 6.5 / dur)
    ir = lp_rapido(ir, brilho)
    ir /= np.sqrt((ir ** 2).sum()) + 1e-9
    L = len(x) + n
    nfft = 1 << (L - 1).bit_length()
    w = np.fft.irfft(np.fft.rfft(x, nfft) * np.fft.rfft(ir, nfft), nfft)[:L].astype(np.float32)
    out = np.zeros(L, np.float32)
    out[: len(x)] += x * (1 - mix)
    out += w * mix * 0.9
    return out


def norm(x: np.ndarray, pico: float = 0.9) -> np.ndarray:
    m = np.abs(x).max()
    return (x / m * pico).astype(np.float32) if m > 0 else x


def saw(f: np.ndarray | float, d: float, fase: float = 0) -> np.ndarray:
    t = t_(d)
    ph = np.cumsum(np.broadcast_to(f, t.shape) / SR) + fase
    return (2 * (ph % 1) - 1).astype(np.float32)


def seno(f: np.ndarray | float, d: float) -> np.ndarray:
    t = t_(d)
    ph = np.cumsum(np.broadcast_to(f, t.shape) / SR)
    return np.sin(2 * np.pi * ph).astype(np.float32)


# ------------------------------------------------------------------ efeitos sonoros
def sfx_whoosh(d=0.55):
    n = ruido(d)
    t = t_(d)
    fc = 300 + 5000 * np.sin(np.pi * t / d) ** 2
    x = lowpass(n, fc) * np.sin(np.pi * t / d) ** 1.5
    return norm(reverb(hp_rapido(x, 150), 0.6, 0.2), 0.8)


def sfx_impacto(d=1.4):
    t = t_(d)
    sub = seno(55 * np.exp(-t * 3) + 38, d) * env(len(t), 0.002, 0.9, 4)
    clique = lp_rapido(ruido(d), 2500) * env(len(t), 0.001, 0.08, 6)
    corpo = lp_rapido(ruido(d), 400) * env(len(t), 0.003, 0.4, 5)
    return norm(reverb(sub * 1.0 + clique * 0.6 + corpo * 0.7, 1.4, 0.25, 3000), 0.95)


def sfx_pop(d=0.18):
    t = t_(d)
    x = seno(900 * np.exp(-t * 18) + 300, d) * env(len(t), 0.001, 0.08, 5)
    return norm(x, 0.7)


def sfx_clique(d=0.08):
    t = t_(d)
    x = hp_rapido(ruido(d), 1500) * env(len(t), 0.0005, 0.01, 6) + seno(2200, d) * env(len(t), 0.0005, 0.02, 6) * 0.4
    return norm(reverb(x, 0.3, 0.15), 0.6)


def sfx_magia(d=1.6):
    """brilho mágico: arpejo de sinos agudos com reverb."""
    out = np.zeros(int(d * SR), np.float32)
    notas = [1046.5, 1318.5, 1568, 2093, 2637, 3136]
    for i, fq in enumerate(notas):
        o = int(i * 0.07 * SR)
        dd = d - i * 0.07
        tt = t_(dd)
        s = (seno(fq, dd) + 0.4 * seno(fq * 2.76, dd) * np.exp(-tt * 8)) * env(len(tt), 0.002, 0.5, 4)
        out[o:o + len(s)] += s[: len(out) - o] * (0.9 - i * 0.08)
    shimmer = bp_rapido(ruido(d), 7000, 3) * env(int(d * SR), 0.2, 1.0, 3) * 0.15
    return norm(reverb(out + shimmer, 2.2, 0.4, 9000)[: int(d * SR * 1.3)], 0.6)


def sfx_brilho(d=0.7):
    t = t_(d)
    x = (seno(2637, d) + seno(3520, d) * 0.6) * env(len(t), 0.002, 0.3, 5)
    return norm(reverb(x, 1.2, 0.35, 10000), 0.45)


def sfx_desce(d=0.7):
    """"wah-wah" cômico descendo (decepção)."""
    t = t_(d)
    f = 520 * np.exp(-t * 1.6)
    x = lp_rapido(saw(f, d), 1800) * env(len(t), 0.01, 0.6, 2.5)
    vib = 1 + 0.15 * np.sin(2 * np.pi * 7 * t)
    return norm(reverb(x * vib, 0.6, 0.15), 0.55)


def sfx_riser(d=2.0):
    t = t_(d)
    n = lowpass(ruido(d), 200 + 7000 * (t / d) ** 2) * (t / d) ** 2
    tom = saw(110 * 2 ** (2 * t / d), d) * (t / d) ** 2 * 0.25
    return norm(lp_rapido(n + tom, 9000), 0.7)


def sfx_trovao(d=3.5):
    t = t_(d)
    x = lp_rapido(ruido(d), 600) * env(len(t), 0.01, 2.6, 3) + lp_rapido(ruido(d), 3000) * env(len(t), 0.001, 0.15, 5) * 0.5
    return norm(reverb(x, 2.5, 0.35, 2000), 0.95)


def sfx_coracao(d=0.9):
    out = np.zeros(int(d * SR), np.float32)
    for o, a in ((0, 1.0), (0.22, 0.75)):
        tt = t_(0.25)
        s = seno(48 * np.exp(-tt * 6) + 30, 0.25) * env(len(tt), 0.003, 0.15, 4) * a
        i = int(o * SR)
        out[i:i + len(s)] += s
    return norm(lp_rapido(out, 300), 0.9)


def sfx_vento(d=4.0):
    t = t_(d)
    x = bp_rapido(ruido(d), 500, 1.5) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.3 * t)) * np.minimum(1, np.minimum(t, d - t) / 0.8)
    return norm(x, 0.5)


def sfx_glitch(d=0.35):
    x = np.zeros(int(d * SR), np.float32)
    for i in range(8):
        o = int(RNG.uniform(0, d - 0.04) * SR)
        s = np.sign(seno(RNG.uniform(200, 2000), 0.03)) * 0.5
        x[o:o + len(s)] += s
    return norm(x, 0.5)


def sfx_ding(d=1.2):
    t = t_(d)
    x = (seno(1760, d) + 0.5 * seno(1760 * 2.4, d) * np.exp(-t * 6)) * env(len(t), 0.001, 0.8, 4)
    return norm(reverb(x, 1.0, 0.2), 0.5)


def sfx_swoosh_sobe(d=0.6):
    t = t_(d)
    x = lowpass(ruido(d), 400 + 6000 * (t / d)) * np.sin(np.pi * t / d)
    return norm(x, 0.6)


def sfx_vibracao(d=0.9):
    """celular vibrando em cima da mesa: dois zumbidos curtos."""
    out = np.zeros(int(d * SR), np.float32)
    for o in (0.0, 0.45):
        dd = 0.32
        tt = t_(dd)
        z = np.sign(seno(155, dd)) * 0.6 + seno(310, dd) * 0.3
        z *= (0.55 + 0.45 * np.sign(seno(32, dd)))  # chocalho na madeira
        z *= np.minimum(1, np.minimum(tt / 0.01, (dd - tt) / 0.02))
        i = int(o * SR)
        out[i:i + len(z)] += lp_rapido(z.astype(np.float32), 1800)[: len(out) - i]
    return norm(out, 0.7)


def sfx_notificacao(d=0.8):
    """notificação genérica de app: dois tons ascendentes."""
    out = np.zeros(int(d * SR), np.float32)
    for o, fq in ((0.0, 1318.5), (0.11, 1975.5)):
        dd = d - o
        tt = t_(dd)
        z = (seno(fq, dd) + 0.3 * seno(fq * 2, dd)) * env(len(tt), 0.003, 0.25, 4)
        i = int(o * SR)
        out[i:i + len(z)] += z[: len(out) - i]
    return norm(reverb(out, 0.5, 0.15), 0.5)


def sfx_drone(d=2.6):
    """drone passando: zumbido de hélices com efeito Doppler (sobe e desce)."""
    t = t_(d)
    k = np.sin(np.pi * t / d)
    f0 = 180 * (1 + 0.06 * np.tanh((d / 2 - t) * 3))
    z = saw(f0, d) * 0.5 + saw(f0 * 2.01, d) * 0.3 + lp_rapido(ruido(d), 900) * 0.4
    z *= (0.8 + 0.2 * seno(38, d))
    return norm(lp_rapido(z * k ** 1.5, 2600), 0.6)


def sfx_alarme(d=1.8):
    """alarme de bordo genérico: dois tons alternados."""
    t = t_(d)
    fq = np.where((t * 2.5) % 1 < 0.5, 880, 660)
    z = np.sign(seno(fq, d)) * 0.4 + seno(fq, d) * 0.4
    z *= np.minimum(1, np.minimum(t / 0.02, (d - t) / 0.1))
    return norm(reverb(lp_rapido(z.astype(np.float32), 3000), 0.8, 0.2), 0.45)


def sfx_radar(d=1.4):
    """ping de radar/sonar."""
    t = t_(d)
    z = seno(1200, d) * env(len(t), 0.002, 0.6, 5)
    return norm(reverb(z, 1.6, 0.45, 5000), 0.45)


def sfx_buzina(d=2.2):
    """buzina grave de navio."""
    t = t_(d)
    z = saw(98, d) + saw(147, d) * 0.6 + saw(98.6, d) * 0.5
    z = lp_rapido(z, 700) * np.minimum(1, np.minimum(t / 0.08, (d - t) / 0.4))
    return norm(reverb(z, 1.8, 0.3, 2500), 0.6)


def sfx_cidade(d=4.0):
    """ambiente de cidade: trânsito distante + uma buzina curta."""
    t = t_(d)
    z = bp_rapido(ruido(d), 350, 0.8) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.2 * t))
    hb = int(1.6 * SR)
    hd = 0.35
    h = (np.sign(seno(440, hd)) + np.sign(seno(554, hd))) * 0.12 * np.minimum(1, (hd - t_(hd)) / 0.05)
    z[hb:hb + len(h)] += lp_rapido(h.astype(np.float32), 2500)
    return norm(z * np.minimum(1, np.minimum(t / 0.5, (d - t) / 0.8)), 0.45)


def sfx_ondas(d=3.5):
    """ondas batendo no casco."""
    t = t_(d)
    sw = (0.5 + 0.5 * np.sin(2 * np.pi * 0.6 * t - 1.5)) ** 2
    z = lp_rapido(ruido(d), 1400) * sw
    return norm(z * np.minimum(1, np.minimum(t / 0.3, (d - t) / 0.6)), 0.5)


def sfx_guindaste(d=1.6):
    """bipes de ré de máquina portuária + motor."""
    t = t_(d)
    bip = seno(1000, d) * ((t * 2.2) % 1 < 0.45) * 0.35
    motor = lp_rapido(saw(55, d), 300) * 0.5
    return norm((bip + motor) * np.minimum(1, np.minimum(t / 0.1, (d - t) / 0.2)), 0.45)


def sfx_estatica(d=0.6):
    """estática / falha de conexão."""
    t = t_(d)
    z = hp_rapido(ruido(d), 2000) * (np.abs(np.sin(2 * np.pi * 13 * t)) > 0.3)
    return norm(z * np.minimum(1, (d - t) / 0.1), 0.4)


def sfx_papel(d=0.6):
    """folhas de papel sendo mexidas / pasta abrindo."""
    t = t_(d)
    z = bp_rapido(ruido(d), 3500, 1.2) * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 7 * t))) * np.sin(np.pi * t / d)
    return norm(z, 0.5)


def sfx_carimbo(d=0.5):
    """carimbo batendo na mesa: golpe grave + estalo de madeira."""
    t = t_(d)
    z = seno(90 * np.exp(-t * 18) + 55, d) * env(len(t), 0.001, 0.18, 5) + lp_rapido(ruido(d), 1800) * env(len(t), 0.0005, 0.04, 6) * 0.7
    return norm(reverb(z, 0.4, 0.12), 0.85)


def sfx_obturador(d=0.35):
    """obturador de câmera fotográfica antiga (dois cliques)."""
    out = np.zeros(int(d * SR), np.float32)
    for o in (0.0, 0.09):
        tt = t_(0.05)
        z = hp_rapido(ruido(0.05), 2500) * env(len(tt), 0.0005, 0.015, 6)
        i = int(o * SR)
        out[i:i + len(z)] += z
    return norm(out, 0.6)


def sfx_maquina(d=1.2):
    """máquina de escrever: teclas irregulares (determinístico)."""
    out = np.zeros(int(d * SR), np.float32)
    k, tpos = 0, 0.0
    while tpos < d - 0.05:
        tt = t_(0.03)
        z = hp_rapido(ruido(0.03), 1800) * env(len(tt), 0.0005, 0.01, 6) + seno(320, 0.03) * env(len(tt), 0.0005, 0.012, 6) * 0.4
        i = int(tpos * SR)
        out[i:i + len(z)] += z[: len(out) - i]
        tpos += 0.07 + 0.05 * ((k * 7919) % 13) / 13
        k += 1
    return norm(out, 0.5)


def sfx_gaveta(d=0.9):
    """gaveta de arquivo de metal deslizando e batendo."""
    t = t_(d)
    desliza = bp_rapido(ruido(d), 900, 2) * np.minimum(1, t / 0.1) * (t < 0.6)
    batida = np.zeros_like(desliza)
    i = int(0.6 * SR)
    b = (seno(180, 0.3) + seno(410, 0.3) * 0.5) * env(int(0.3 * SR), 0.001, 0.15, 5)
    batida[i:i + len(b)] += b[: len(batida) - i]
    return norm(reverb(desliza * 0.6 + batida, 0.6, 0.2), 0.7)


def sfx_metal(d=2.5):
    """batida metálica grave e longa (porta de cofre / fim)."""
    t = t_(d)
    z = sum(seno(f, d) * np.exp(-t * (2.2 + k)) * a for k, (f, a) in enumerate([(62, 1.0), (151, 0.5), (263, 0.35), (419, 0.2)]))
    z += lp_rapido(ruido(d), 2500) * env(len(t), 0.0005, 0.05, 6) * 0.6
    return norm(reverb(z, 2.4, 0.35, 3000), 0.95)


def sfx_chuva(d=42.0):
    """Chuva leve e contínua (ruído filtrado + gotinhas), entra e sai suave."""
    n = int(d * SR)
    base = lp_rapido(hp_rapido(ruido(d), 500), 5200) * 0.22
    t = np.arange(n) / SR
    base *= (0.85 + 0.15 * np.sin(2 * np.pi * 0.07 * t)).astype(np.float32)
    rng = np.random.default_rng(7)
    gotas = np.zeros(n, np.float32)
    for i in rng.integers(0, max(1, n - SR // 10), int(d * 14)):
        g = bp_rapido(ruido(0.03), 2500 + rng.random() * 3000, 3.0) * env(int(0.03 * SR), 0.0005, 0.02, 6)
        gotas[i:i + len(g)] += g[: n - i] * (0.15 + 0.25 * rng.random())
    x = base + gotas
    x *= np.minimum(1, np.minimum(t / 2.5, (d - t) / 4.0 + 1e-3)).astype(np.float32)
    return norm(x, 0.7)


def sfx_metro(d=10.0):
    """Interior de metrô em movimento: ronco grave, batidas ritmadas dos trilhos e chiado leve; entra já audível."""
    n = int(d * SR)
    t = np.arange(n) / SR
    ronco = lp_rapido(ruido(d), 160) * 0.9 * (0.8 + 0.2 * np.sin(2 * np.pi * 0.31 * t)).astype(np.float32)
    ar = bp_rapido(ruido(d), 900, 0.7) * 0.18
    chiado = seno(1850, d) * 0.012 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.13 * t))
    batidas = np.zeros(n, np.float32)
    rng = np.random.default_rng(11)
    tk = 0.35
    while tk < d - 0.3:
        for dt in (0.0, 0.11):  # par de rodas sobre a junta do trilho
            i = int((tk + dt) * SR)
            g = lp_rapido(ruido(0.07), 700) * env(int(0.07 * SR), 0.001, 0.05, 5) * (0.9 + 0.2 * rng.random())
            batidas[i:i + len(g)] += g[: n - i]
        tk += 1.15 + 0.1 * rng.random()
    x = ronco + ar + chiado.astype(np.float32) + batidas * 1.4
    x *= np.minimum(1, np.minimum(t / 0.15 + 0.35, (d - t) / 2.5 + 1e-3)).astype(np.float32)
    return norm(x, 0.6)


def sfx_passos(d=1.6):
    """passos molhados: batidas abafadas com respingo."""
    n = int(d * SR); x = np.zeros(n, np.float32)
    for k, t0 in enumerate(np.arange(0.05, d - 0.15, 0.38)):
        i = int(t0 * SR)
        g = lp_rapido(ruido(0.12), 400) * env(int(0.12 * SR), 0.002, 0.08, 4) * 1.4 + bp_rapido(ruido(0.12), 2600, 2.0) * env(int(0.12 * SR), 0.004, 0.06, 5) * 0.5
        x[i:i + len(g)] += g[: n - i] * (0.85 + 0.15 * (k % 2))
    return norm(x, 0.6)


def sfx_faisca(d=0.9):
    """faíscas elétricas: estalos curtos e chiado."""
    n = int(d * SR); x = hp_rapido(ruido(d), 3000) * 0.25 * env(n, 0.002, d * 0.7, 3)
    rng = np.random.default_rng(5)
    for i in rng.integers(0, n - 2000, 18):
        x[i:i + 600] += hp_rapido(ruido(600 / SR), 2000) * env(600, 0.0002, 0.006, 6)
    return norm(x, 0.6)


def sfx_gota(d=1.6):
    """gotejo metálico: pingos com ressonância."""
    n = int(d * SR); x = np.zeros(n, np.float32)
    for k, t0 in enumerate([0.05, 0.62, 1.1]):
        if t0 >= d - 0.3: break
        i = int(t0 * SR); f = 1700 + 300 * k
        g = (seno(f, 0.3) + 0.4 * seno(f * 2.7, 0.3)) * env(int(0.3 * SR), 0.0005, 0.22, 6)
        x[i:i + len(g)] += g[: n - i]
    return norm(x, 0.5)


def sfx_estalo(d=1.2):
    """estalo grave e seco (revelação)."""
    t = t_(d)
    x = lp_rapido(ruido(d), 900) * env(len(t), 0.001, 0.12, 5) * 1.2 + seno(55 * np.exp(-t * 3) + 30, d) * env(len(t), 0.002, 0.9, 3)
    return norm(x, 0.8)


def sfx_pulso(d=1.2):
    """pulso metálico grave (radiografia / retorno)."""
    t = t_(d)
    x = (seno(70, d) + 0.35 * seno(140.5, d) + 0.15 * seno(612, d) * np.exp(-t * 6)) * env(len(t), 0.01, d * 0.8, 3)
    return norm(x, 0.7)


def sfx_abafado(d=0.6):
    """microfone de celular abafado ao bater no chão."""
    t = t_(d)
    x = lp_rapido(ruido(d), 220) * env(len(t), 0.001, 0.2, 4) * 1.5 + seno(48, d) * env(len(t), 0.001, 0.3, 4)
    return norm(x, 0.7)


def sfx_motor(d=4.0):
    """motor abafado de laboratório."""
    t = t_(d)
    x = (seno(50, d) * 0.6 + seno(100, d) * 0.3 + lp_rapido(ruido(d), 300) * 0.4) * (0.85 + 0.15 * np.sin(2 * np.pi * 0.5 * t))
    return norm(x * np.minimum(1, np.minimum(t / 0.6, (d - t) / 0.8 + 1e-3)), 0.5)


def sfx_radio(d=3.0):
    """rádio distante dos anos 40: chiado com tom abafado."""
    t = t_(d)
    x = bp_rapido(ruido(d), 1500, 1.5) * 0.4 + bp_rapido(saw(220 + 30 * np.sin(2 * np.pi * 0.7 * t), d), 1200, 2.0) * 0.25
    return norm(x * np.minimum(1, np.minimum(t / 0.4, (d - t) / 0.6 + 1e-3)), 0.4)


def sfx_salto(d=2.2):
    """movimento do salto: vento crescente + raspado metálico no fim (usado também ao contrário)."""
    t = t_(d)
    x = bp_rapido(ruido(d), 700, 0.6) * (t / d) ** 2 * 1.2 + hp_rapido(ruido(d), 4000) * np.clip((t - d + 0.35) / 0.35, 0, 1) * 0.5
    return norm(x, 0.8)


SFX = {k[4:]: v for k, v in globals().items() if k.startswith("sfx_")}


# ------------------------------------------------------------------ trilha
ESCALAS = {
    "curioso": ([0, 2, 4, 7, 9], 57, 112),   # pentatônica maior, lá3, bpm
    "ciencia": ([0, 2, 4, 7, 11], 50, 100),
    "suspense": ([0, 1, 3, 7, 8], 45, 72),
    "terror": ([0, 1, 6, 7, 10], 40, 60),
    "epico": ([0, 2, 3, 7, 8], 45, 90),
    "biblico": ([0, 2, 3, 5, 7, 9], 50, 70),
    "alegre": ([0, 2, 4, 5, 7, 9], 60, 120),
    "tensao": ([0, 2, 3, 7, 8], 45, 96),
}


def mtof(m: float) -> float:
    return 440 * 2 ** ((m - 69) / 12)


def pad(notas: list[int], d: float, brilho: float = 1200) -> np.ndarray:
    x = np.zeros(int(d * SR), np.float32)
    for k, m in enumerate(notas):
        for det in (-0.07, 0.07):
            x += saw(mtof(m + det), d, fase=k * 0.31 + det)
    t = t_(d)
    x = lp_rapido(x, brilho)
    return x * np.minimum(1, np.minimum(t / 1.2, (d - t) / 1.2 + 1e-3)) / len(notas)


def pluck(m: float, d: float = 0.5) -> np.ndarray:
    t = t_(d)
    f = mtof(m)
    x = (seno(f, d) + 0.5 * seno(2 * f, d) * np.exp(-t * 10) + 0.25 * seno(3 * f, d) * np.exp(-t * 18))
    return x * env(len(t), 0.003, d * 0.6, 4)


def kick(d=0.35):
    t = t_(d)
    return seno(110 * np.exp(-t * 25) + 45, d) * env(len(t), 0.001, 0.25, 5)


def hat(d=0.05):
    return hp_rapido(ruido(d), 7000) * env(int(d * SR), 0.0005, 0.03, 5) * 0.25


def musica(humor: str, dur: float) -> np.ndarray:
    if humor.startswith("classica_"):
        return musica_classica(humor.split("_", 1)[1], dur)
    if humor == "reflexao":
        return musica_reflexao(dur)
    if humor == "synthwave":
        return musica_synthwave(dur)
    if humor == "synthwave_animado":
        return musica_synthwave(dur, bpm=118, energia=True)
    escala, raiz, bpm = ESCALAS.get(humor, ESCALAS["curioso"])
    beat = 60 / bpm
    n = int(dur * SR) + SR
    out = np.zeros(n, np.float32)
    # progressão de 4 acordes (graus da escala)
    progs = {"curioso": [0, 3, 4, 2], "ciencia": [0, 4, 3, 2], "suspense": [0, 0, 1, 0], "terror": [0, 1, 0, 2],
             "epico": [0, 3, 4, 1], "biblico": [0, 3, 1, 4], "alegre": [0, 3, 4, 2], "tensao": [0, 0, 3, 4]}[humor if humor in ESCALAS else "curioso"]
    compasso = beat * 4
    i = 0
    while i * compasso < dur + 1:
        g = progs[i % 4]
        base = raiz + escala[g % len(escala)]
        acorde = [base - 12, base, base + escala[(g + 2) % len(escala)] - escala[g % len(escala)] + (12 if (g + 2) >= len(escala) else 0), base + 7]
        p = pad(acorde, compasso + 1.0, 900 if humor in ("terror", "suspense") else 1600)
        o = int(i * compasso * SR)
        out[o:o + len(p)] += p[: max(0, n - o)] * 0.5
        i += 1
    if humor in ("curioso", "ciencia", "alegre", "epico"):
        # arpejo + bateria leve
        k = 0
        while k * beat / 2 < dur:
            g = progs[int(k * beat / 2 / compasso) % 4]
            m = raiz + 12 + escala[(g + [0, 2, 4, 2][k % 4]) % len(escala)]
            s = pluck(m, 0.45) * 0.28
            o = int(k * beat / 2 * SR)
            out[o:o + len(s)] += s[: max(0, n - o)]
            if k % 2 == 0 and humor != "epico":
                h = hat()
                out[o:o + len(h)] += h[: max(0, n - o)]
            if k % 4 == 0:
                kk = kick() * (0.55 if humor == "epico" else 0.35)
                out[o:o + len(kk)] += kk[: max(0, n - o)]
            k += 1
    if humor == "tensao":
        # ostinato grave em semicolcheias + bumbo a cada tempo: tensão constante, sem melodia que brigue com a voz
        k = 0
        while k * beat / 4 < dur:
            g = progs[int(k * beat / 4 / compasso) % 4]
            m = raiz - 12 + escala[g % len(escala)] + (12 if k % 8 == 6 else 0)
            s = lp_rapido(pluck(m, 0.22), 900) * (0.30 if k % 4 == 0 else 0.18)
            o = int(k * beat / 4 * SR)
            out[o:o + len(s)] += s[: max(0, n - o)]
            if k % 4 == 0:
                kk = kick() * 0.4
                out[o:o + len(kk)] += kk[: max(0, n - o)]
            k += 1
    if humor in ("terror", "suspense"):
        t = t_(n / SR)
        drone = lp_rapido(saw(mtof(raiz - 12), n / SR) + saw(mtof(raiz - 11.85), n / SR), 220) * 0.35
        out += drone * (0.7 + 0.3 * np.sin(2 * np.pi * 0.1 * t)).astype(np.float32)
        k = 0
        while k * beat * 2 < dur:
            s = sfx_coracao() * 0.35
            o = int(k * beat * 2 * SR)
            out[o:o + len(s)] += s[: max(0, n - o)]
            k += 1
    out = reverb(out, 2.4, 0.3, 5000)[: int(dur * SR)]
    t = t_(dur)
    out *= np.minimum(1, np.minimum(t / 0.4, (dur - t) / 1.2 + 1e-3))
    return norm(out, 0.8)


def musica_synthwave(dur: float, raiz: int = 57, bpm: float = 100, energia: bool = False) -> np.ndarray:
    """Trilha original estilo synthwave anos 80 (composição própria do projeto, livre de direitos):
    lá menor, 4 acordes (i-VI-III-VII), bumbo 4/4, caixa com reverb 'gated', baixo em oitavas, pad e arpejo com eco."""
    beat = 60 / bpm
    n = int(dur * SR) + SR
    out = np.zeros(n, np.float32)
    acordes = [[0, 3, 7], [-4, 0, 3], [3, 7, 10], [-2, 2, 5]]  # Am  F  C  G
    compasso = beat * 4

    def soma(x, t0, g=1.0):
        o = int(t0 * SR)
        if o < n:
            out[o:o + len(x)] += (x[: n - o] * g).astype(np.float32)

    def caixa():
        d = 0.5
        t = t_(d)
        corpo = seno(185 * np.exp(-t * 8) + 150, d) * env(len(t), 0.001, 0.08, 6) * 0.5
        chiado = bp_rapido(ruido(d), 1800, 0.8) * env(len(t), 0.001, 0.18, 4)
        x = corpo + chiado
        return reverb(x, 0.9, 0.45, 6000)[: int(0.42 * SR)] * np.linspace(1, 0, int(0.42 * SR)) ** 0.3

    def baixo(m, d):
        t = t_(d)
        x = saw(mtof(m), d) + 0.6 * saw(mtof(m) * 1.003, d)
        x = lp_rapido(x, 700)
        return x * env(len(t), 0.003, d * 0.8, 3)

    def arp(m, d):
        t = t_(d)
        x = lp_rapido(saw(mtof(m), d) + saw(mtof(m) * 1.006, d), 2600)
        return x * env(len(t), 0.002, d * 0.5, 5)

    sn = caixa()
    i = 0
    while i * compasso < dur + 1:
        ac = acordes[i % 4]
        t0 = i * compasso
        # pad largo (duas oitavas, desafinado)
        p = pad([raiz + a for a in ac] + [raiz + ac[0] + 12], compasso + 1.0, 1400)
        soma(p, t0, 0.42)
        nb = 16 if energia else 8  # versão animada: baixo em semicolcheias
        for b in range(nb):  # baixo pulsante, oitava alternada
            m = raiz - 24 + ac[0] + (12 if b % 2 else 0)
            soma(baixo(m, beat * 4 / nb * 0.95), t0 + b * beat * 4 / nb, 0.30 if not energia else (0.30 if b % 4 == 0 else 0.22))
        for b in range(4):  # bumbo 4/4 e caixa nos tempos 2 e 4
            soma(kick(), t0 + b * beat, 0.55)
            if b % 2 == 1:
                soma(sn, t0 + b * beat, 0.40)
            soma(hat(), t0 + b * beat + beat / 2, 0.9)
            if energia:  # chimbal aberto no contratempo + palmas no 2 e 4
                soma(hp_rapido(ruido(0.18), 6500) * env(int(0.18 * SR), 0.001, 0.12, 3) * 0.22, t0 + b * beat + beat / 2, 1.0)
                soma(hat(), t0 + b * beat + beat / 4, 0.5); soma(hat(), t0 + b * beat + 3 * beat / 4, 0.5)
                if b % 2 == 1:
                    soma(bp_rapido(ruido(0.2), 1500, 1.2) * env(int(0.2 * SR), 0.001, 0.09, 4) * 0.5, t0 + b * beat + 0.012, 1.0)
        notas = [ac[0], ac[1], ac[2], ac[1] + 12 if ac[1] + 12 < 24 else ac[1]]
        for k in range(16):  # arpejo em semicolcheias + eco de colcheia pontuada
            m = raiz + 12 + notas[k % 4]
            x = arp(m, beat / 4 * 0.9)
            soma(x, t0 + k * beat / 4, 0.10)
            soma(x, t0 + k * beat / 4 + beat * 0.75, 0.045)
        i += 1
    out = reverb(out, 1.8, 0.22, 7000)[: int(dur * SR)]
    t = t_(dur)
    ent, sai = (1.0, 2.0) if energia else (0.3, 1.5)
    out *= np.minimum(1, np.minimum(t / ent, (dur - t) / sai + 1e-3))
    return norm(out, 0.8)


def piano(m: float, d: float = 2.4) -> np.ndarray:
    """Nota de piano sintetizada (harmônicos com decaimento, leve desafinação)."""
    t = t_(d)
    f = mtof(m)
    x = np.zeros(len(t), np.float32)
    for k, (a, dec) in enumerate([(1.0, 2.2), (0.45, 3.2), (0.22, 4.5), (0.12, 6.0), (0.06, 8.0)], start=1):
        x += (a * np.sin(2 * np.pi * f * k * 1.0008 ** k * t) * np.exp(-t * dec)).astype(np.float32)
    ataque = np.minimum(1, t / 0.006)
    return (x * ataque * 0.5).astype(np.float32)


def musica_reflexao(dur: float, raiz: int = 57, bpm: float = 66) -> np.ndarray:
    """Trilha original suave para reflexão: piano em arpejo lento sobre pad (lá menor: Am F C G)."""
    beat = 60 / bpm
    n = int(dur * SR) + SR
    out = np.zeros(n, np.float32)
    acordes = [[0, 3, 7], [-4, 0, 3], [3, 7, 10], [-2, 2, 5]]
    compasso = beat * 4

    def soma(x, t0, g=1.0):
        o = int(t0 * SR)
        if o < n:
            out[o:o + len(x)] += (x[: n - o] * g).astype(np.float32)

    i = 0
    while i * compasso < dur + 1:
        ac = acordes[i % 4]
        t0 = i * compasso
        soma(pad([raiz - 12 + a for a in ac], compasso + 1.5, 900), t0, 0.28)
        soma(piano(raiz - 24 + ac[0], 3.5), t0, 0.35)
        padrao = [ac[0], ac[1] + 12, ac[2], ac[1] + 12, ac[0] + 12, ac[2], ac[1] + 12, ac[2] + 12]
        for k, m in enumerate(padrao):
            soma(piano(raiz + m - 12, 2.4), t0 + k * beat / 2, 0.22 if k % 2 == 0 else 0.16)
        if i % 2 == 1:  # melodia simples e espaçada
            soma(piano(raiz + 12 + ac[2], 3.0), t0 + beat * 2, 0.14)
        i += 1
    out = reverb(out, 3.0, 0.4, 4000)[: int(dur * SR)]
    t = t_(dur)
    out *= np.minimum(1, np.minimum(t / 2.0, (dur - t) / 3.0 + 1e-3))
    return norm(out, 0.8)


def cordas(m: float, d: float) -> np.ndarray:
    """Naipe de cordas sintetizado: serras desafinadas, filtro suave, vibrato e ataque lento."""
    t = t_(d)
    f = mtof(m) * (1 + 0.004 * np.sin(2 * np.pi * 5.2 * t))
    x = sum(saw(f * (1 + det), d, fase=k * 0.37) for k, det in enumerate((-0.006, 0.0, 0.007))) / 3
    x = lp_rapido(x.astype(np.float32), 2200)
    env_ = np.minimum(1, t / 0.35) * np.minimum(1, (d - t) / 0.4 + 1e-3)
    return (x * env_ * 0.6).astype(np.float32)


# Peças em DOMÍNIO PÚBLICO (composições antigas), em interpretação PRÓPRIA sintetizada aqui (sem gravação de terceiros).
# Cada evento: (início em batidas, nota MIDI, duração em batidas, instrumento "p" piano / "c" cordas).
def _bach_preludio_do():
    """J. S. Bach (1685–1750), Prelúdio em Dó maior BWV 846 — compassos 1–3 (semicolcheias)."""
    ev = []
    for b, (baixo, pad) in enumerate([((60, 64), (67, 72, 76)), ((60, 62), (69, 74, 77)), ((59, 62), (67, 74, 77))]):
        for meio in range(2):
            t0 = b * 4 + meio * 2
            ev += [(t0, baixo[0], 2, "p"), (t0 + 0.25, baixo[1], 1.75, "p")]
            for k, n in enumerate(pad + pad):
                ev.append((t0 + 0.5 + k * 0.25, n, 0.6, "p"))
    return ev, 0.62  # segundos por batida (semínima)


def _pachelbel_canone():
    """J. Pachelbel (1653–1706), Cânone em Ré — baixo, harmonia em cordas e a voz superior conhecida."""
    acordes = [(50, [62, 66, 69]), (45, [61, 64, 69]), (47, [62, 66, 71]), (42, [61, 66, 69]), (43, [62, 67, 71]), (38, [62, 66, 69])]
    melodia = [78, 76, 74, 73, 71, 69]
    ev = []
    for i, (b, ac) in enumerate(acordes):
        t0 = i * 2
        ev.append((t0, b, 2.2, "c"))
        ev += [(t0, n, 2.2, "c") for n in ac]
        ev.append((t0 + 0.02, melodia[i], 1.9, "p"))
    return ev, 0.45


def _satie_gymnopedie():
    """E. Satie (1866–1925), Gymnopédie nº 1 (1888) — acompanhamento em 3/4 e início da melodia."""
    ev = []
    comp = [(43, [59, 62, 66]), (38, [57, 61, 66]), (43, [59, 62, 66]), (38, [57, 61, 66])]
    for i, (b, ac) in enumerate(comp):
        t0 = i * 3
        ev.append((t0, b, 3, "p"))
        ev += [(t0 + 1, n, 2, "p") for n in ac]
    mel = [(1, 78, 1), (2, 81, 1), (3, 79, 1), (4, 78, 1), (5, 73, 1), (6, 71, 1), (7, 73, 1), (8, 74, 1), (9, 69, 3)]
    ev += [(t, n, d, "p") for t, n, d in mel]
    return ev, 0.5


def musica_classica(peca: str, dur: float) -> np.ndarray:
    ev, spb = {"bach": _bach_preludio_do, "canon": _pachelbel_canone, "satie": _satie_gymnopedie}[peca]()
    n = int(dur * SR) + SR
    out = np.zeros(n, np.float32)
    for tb, m, db, inst in ev:
        t0 = tb * spb
        if t0 >= dur:
            continue
        x = piano(m, max(1.2, db * spb + 1.0)) * (0.5 if m >= 72 else 0.42) if inst == "p" else cordas(m, db * spb + 0.3) * 0.33
        o = int(t0 * SR)
        out[o:o + len(x)] += x[: n - o]
    out = reverb(out, 2.4, 0.35, 5000)[: int(dur * SR)]
    t = t_(dur)
    out *= np.minimum(1, np.minimum(t / 0.25, (dur - t) / 1.2 + 1e-3))  # entra no 1º quadro e sai sem corte brusco
    return norm(out, 0.8)


# ------------------------------------------------------------------ mixagem
def ffmpeg(*a: str) -> None:
    subprocess.run(["ffmpeg", "-v", "error", "-y", *a], check=True)


def gerar(projeto_dir: Path) -> Path:
    proj = json.loads((projeto_dir / "projeto.json").read_text(encoding="utf-8"))
    b = projeto_dir / "build"
    tempos = json.loads((b / "tempos.json").read_text(encoding="utf-8"))
    dur = tempos["duracao_s"]
    perfis = json.loads((Path(__file__).parent / "perfis.json").read_text(encoding="utf-8"))
    cfg_m = proj.get("musica", {})
    humor = cfg_m.get("humor") or perfis[tempos["perfil"]].get("musica", "curioso")

    # efeitos
    pista = np.zeros(int((dur + 4) * SR), np.float32)
    for s in tempos["sfx"]:
        if s["som"] not in SFX:
            raise SystemExit(f"Efeito '{s['som']}' não existe. Disponíveis: {', '.join(sorted(SFX))}")
        x = (SFX[s["som"]](s["dur"]) if "dur" in s else SFX[s["som"]]()) * 10 ** (s.get("vol", 0) / 20)  # "dur" opcional
        if s.get("reverso"):  # o mesmo som tocado de trás para frente
            x = x[::-1].copy()
        if "ate" in s:  # corte seco depois de N segundos (ex.: ambiente que para no congelamento)
            x = x[: int(s["ate"] * SR)]
        i = max(0, int(s["t"] * SR))
        pista[i:i + len(x)] += x[: len(pista) - i]
    pista = pista[: int(dur * SR)]
    sf.write(b / "sfx.wav", pista, SR)

    # trilha
    if cfg_m.get("arquivo"):
        trilha = projeto_dir / cfg_m["arquivo"]
        ffmpeg("-stream_loop", "-1", "-i", str(trilha), "-t", f"{dur}", "-ac", "1", "-ar", str(SR), str(b / "musica.wav"))
    elif cfg_m.get("blocos"):
        # trilha por blocos: [{"de": ref, "humor": h, "db": 0}], troca com cruzamento de 1,2 s
        sys.path.insert(0, str(Path(__file__).parent))
        from voz import resolver_ref
        bl = sorted((resolver_ref(x["de"], tempos["falas"], tempos["palavras"]), x["humor"], x.get("db", 0)) for x in cfg_m["blocos"])
        n = int(dur * SR); tt = np.arange(n) / SR; mus = np.zeros(n, np.float32); cache = {}
        for i, (t0, h, g) in enumerate(bl):
            t1 = bl[i + 1][0] if i + 1 < len(bl) else dur + 2
            if h not in cache:
                cache[h] = musica(h, dur)[:n] if h != "nenhuma" else np.zeros(n, np.float32)
            m = cache[h]; m = np.pad(m, (0, max(0, n - len(m))))[:n]
            jan = np.clip((tt - t0) / 1.2 + 0.5, 0, 1) * np.clip((t1 - tt) / 1.2 + 0.5, 0, 1)
            mus += m * jan.astype(np.float32) * 10 ** (g / 20)
        sf.write(b / "musica.wav", mus, SR)
    else:
        sf.write(b / "musica.wav", musica(humor, dur), SR)

    if proj.get("mix") == "nivel50":
        # regra da skill cartoon-audio-short: música e SFX a 50 % (-6 dB) do RMS da voz, sem ducking;
        # depois só ganho linear até -14 LUFS (sem compressão)
        kit_mix = Path(__file__).resolve().parent.parent / ".claude/skills/cartoon-audio-short/kit/tools/mix.py"
        bruto = b / "mix_raw.wav"
        subprocess.run([sys.executable, str(kit_mix), str(b / "narracao.wav"), str(b / "musica.wav"), str(b / "sfx.wav"),
                        "--saida", str(bruto)], check=True)
        ffmpeg("-i", str(bruto), "-af", f"loudnorm=I=-14:TP=-1.5:LRA=20:linear=true,apad,atrim=0:{dur}", "-ar", str(SR), "-ac", "2", str(b / "mix.wav"))
        print(f"[audio] mix 'nivel50' (regra do kit cartoon) em {b / 'mix.wav'}")
        return b / "mix.wav"

    if cfg_m.get("automacao"):
        # automação: [{"em": ref de tempo (fala, palavra:x, t:s), "db": ganho}] interpolado linearmente
        sys.path.insert(0, str(Path(__file__).parent))
        from voz import resolver_ref
        pts = sorted((resolver_ref(a["em"], tempos["falas"], tempos["palavras"]), a["db"]) for a in cfg_m["automacao"])
        mus, srm = sf.read(b / "musica.wav", dtype="float32")
        tt = np.arange(len(mus)) / srm
        ganho = 10 ** (np.interp(tt, [p[0] for p in pts], [p[1] for p in pts]) / 20)
        sf.write(b / "musica.wav", (mus.T * ganho).T if mus.ndim > 1 else mus * ganho, srm)

    vol_m = cfg_m.get("volume_db", -22)
    vol_sfx = proj.get("sfx_volume_db", -9)
    # voz tratada: passa-alta, presença, compressão leve; trilha com ducking pela voz
    filtro = (
        f"[0:a]highpass=f=75,equalizer=f=3200:t=q:w=1.2:g=2.5,equalizer=f=250:t=q:w=1:g=-1.5,"
        f"acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=2,asplit=2[voz][sc];"
        f"[1:a]volume={vol_m}dB[mus];"
        f"[mus][sc]sidechaincompress=threshold=0.02:ratio=8:attack=20:release=350[musd];"
        f"[2:a]volume={vol_sfx}dB[fx];"
        f"[voz][musd][fx]amix=inputs=3:normalize=0:duration=first,"
        f"loudnorm=I=-14:TP=-1.5:LRA=9"
    )
    mix_tmp = b / "mix_tmp.wav"
    ffmpeg("-i", str(b / "narracao.wav"), "-i", str(b / "musica.wav"), "-i", str(b / "sfx.wav"),
           "-filter_complex", filtro, "-ar", str(SR), "-ac", "2", str(mix_tmp))
    # loudnorm pode alterar levemente o comprimento: corta/pad no tamanho exato
    ffmpeg("-i", str(mix_tmp), "-af", f"apad,atrim=0:{dur}", "-ar", str(SR), str(b / "mix.wav"))
    mix_tmp.unlink()
    print(f"[audio] trilha '{humor}', {len(tempos['sfx'])} efeitos, mix em {b / 'mix.wav'}")
    return b / "mix.wav"


if __name__ == "__main__":
    gerar(Path(sys.argv[1]))
