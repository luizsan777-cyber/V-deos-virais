"""Normalização de texto em português brasileiro para TTS.

- Números por extenso (inteiros, decimais, ordinais simples, porcentagem, anos).
- Unidades e abreviações comuns (km, km/h, °C, etc.).
- Contagem de sílabas aproximada (usada para distribuir o tempo das palavras nas legendas).

Sem dependências externas.
"""
from __future__ import annotations

import re

UNID = ["zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove",
        "dez", "onze", "doze", "treze", "catorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"]
DEZ = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"]
CEM = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos",
       "oitocentos", "novecentos"]
ESCALAS = [(10**12, "trilhão", "trilhões"), (10**9, "bilhão", "bilhões"), (10**6, "milhão", "milhões")]


def _ate_mil(n: int) -> str:
    if n < 20:
        return UNID[n]
    if n < 100:
        d, u = divmod(n, 10)
        return DEZ[d] + ("" if u == 0 else " e " + UNID[u])
    if n == 100:
        return "cem"
    c, r = divmod(n, 100)
    return CEM[c] + ("" if r == 0 else " e " + _ate_mil(r))


def por_extenso(n: int) -> str:
    if n < 0:
        return "menos " + por_extenso(-n)
    if n < 1000:
        return _ate_mil(n)
    partes: list[tuple[int, str]] = []
    resto = n
    for valor, sing, plur in ESCALAS:
        if resto >= valor:
            q, resto = divmod(resto, valor)
            partes.append((q, ("um " + sing) if q == 1 else (por_extenso(q) + " " + plur)))
    if resto >= 1000:
        q, resto = divmod(resto, 1000)
        partes.append((q, "mil" if q == 1 else _ate_mil(q) + " mil"))
    if resto:
        partes.append((resto, _ate_mil(resto)))
    # "e" antes do último grupo quando ele é < 100 ou centena redonda (dois milhões e quinhentos mil)
    if len(partes) > 1:
        q = partes[-1][0]
        if q < 100 or q % 100 == 0:
            return " ".join(p for _, p in partes[:-1]) + " e " + partes[-1][1]
    return " ".join(p for _, p in partes)


def _decimal(inteiro: str, frac: str) -> str:
    frac = frac.rstrip("0") or "0"
    if len(frac) <= 2 and not frac.startswith("0"):
        return f"{por_extenso(int(inteiro))} vírgula {por_extenso(int(frac))}"
    return f"{por_extenso(int(inteiro))} vírgula " + " ".join(UNID[int(c)] for c in frac)


UNIDADES = [
    (r"km/h", "quilômetros por hora"), (r"km/s", "quilômetros por segundo"), (r"m/s", "metros por segundo"),
    (r"km²", "quilômetros quadrados"), (r"km", "quilômetros"), (r"cm", "centímetros"), (r"mm", "milímetros"),
    (r"kg", "quilos"), (r"°C", "graus"), (r"ºC", "graus"), (r"°", "graus"), (r"m", "metros"), (r"g", "gramas"),
    (r"h", "horas"), (r"min", "minutos"), (r"s", "segundos"),
]
ABREV = {"dr.": "doutor", "dra.": "doutora", "sr.": "senhor", "sra.": "senhora", "etc.": "etcétera",
         "a.C.": "antes de Cristo", "d.C.": "depois de Cristo", "vc": "você", "pq": "porque", "tb": "também"}


def normalizar(texto: str) -> str:
    t = texto
    for k, v in ABREV.items():
        t = re.sub(re.escape(k), v, t, flags=re.IGNORECASE)
    # milhares com ponto: 1.000.000 -> 1000000
    t = re.sub(r"(?<=\d)\.(?=\d{3}\b)", "", t)
    # porcentagem
    t = re.sub(r"(\d+),(\d+)\s*%", lambda m: _decimal(m[1], m[2]) + " por cento", t)
    t = re.sub(r"(\d+)\s*%", lambda m: por_extenso(int(m[1])) + " por cento", t)
    # número + unidade
    for un, ext in UNIDADES:
        t = re.sub(r"(\d+(?:,\d+)?)\s*" + re.escape(un) + r"(?![\wÀ-ú])", lambda m, e=ext: m[1] + " " + e, t)
    # ordinais 1º 2ª
    t = re.sub(r"(\d+)[ºo]\b", lambda m: _ordinal(int(m[1]), "o"), t)
    t = re.sub(r"(\d+)[ªa]\b", lambda m: _ordinal(int(m[1]), "a"), t)
    # decimais
    t = re.sub(r"(\d+),(\d+)", lambda m: _decimal(m[1], m[2]), t)
    # inteiros
    t = re.sub(r"\d+", lambda m: por_extenso(int(m[0])), t)
    t = t.replace("&", " e ").replace("+", " mais ")
    return re.sub(r"\s+", " ", t).strip()


ORD = {1: "primeir", 2: "segund", 3: "terceir", 4: "quart", 5: "quint", 6: "sext", 7: "sétim", 8: "oitav",
       9: "non", 10: "décim"}


def _ordinal(n: int, g: str) -> str:
    return ORD[n] + g if n in ORD else por_extenso(n)


VOG = "aeiouáéíóúâêôãõàü"


def silabas(palavra: str) -> int:
    """Aproximação: conta núcleos vocálicos, tratando ditongos comuns como um só."""
    w = re.sub(r"[^a-zà-ú]", "", palavra.lower())
    if not w:
        return 1
    w = re.sub(r"(ai|ei|oi|ui|au|eu|iu|ou|ão|õe|ãe|qu|gu)", "a", w)
    n = sum(1 for c in w if c in VOG)
    return max(1, n)


if __name__ == "__main__":
    for s in ["Em 1831, 74 soldados", "A Terra gira a 1.670 km/h no equador", "3,14% de 2.500.000",
              "O 1º lugar", "Faz 40 °C"]:
        print(s, "->", normalizar(s))
