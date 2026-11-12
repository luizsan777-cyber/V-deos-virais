#!/usr/bin/env python3
"""Extrai o kit 2D do Drive para dentro da skill, sem apagar arquivos existentes."""
from __future__ import annotations
import argparse
from pathlib import Path, PurePosixPath
import stat
import zipfile

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / ".claude/skills/cartoon-audio-short/kit-source/cartoon-short-kit.zip"
TARGET = ROOT / ".claude/skills/cartoon-audio-short/kit"
REQUIRED = [
    "engine/main.js", "engine/roman.js", "engine/motion.js",
    "tools/timing.py", "tools/render.mjs", "tools/setup.sh",
]
MISSING_FROM_SUPPLIED_ARCHIVE = [
    "tools/mix.py",
    "engine/toonbase.js",
    "engine/three.module.js",
]

def main() -> int:
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument("--dry-run", action="store_true")
    args = cli.parse_args()
    if not SOURCE.is_file():
        print(f"ERRO: ZIP nao encontrado: {SOURCE}")
        return 2
    TARGET.mkdir(parents=True, exist_ok=True) if not args.dry_run else None
    with zipfile.ZipFile(SOURCE) as z:
        infos = z.infolist()
        if sum(x.file_size for x in infos) > 100 * 1024 * 1024:
            raise RuntimeError("Arquivo ZIP excede 100 MB descompactados")
        count = 0
        for item in infos:
            p = PurePosixPath(item.filename)
            if p.is_absolute() or ".." in p.parts:
                raise RuntimeError(f"ZIP inseguro: {item.filename}")
            # O ZIP fornecido tem raiz cartoon-short-kit/
            parts = p.parts[1:] if p.parts and p.parts[0] == "cartoon-short-kit" else p.parts
            if not parts:
                continue
            if (item.external_attr >> 16) & stat.S_IFMT((item.external_attr >> 16)) == stat.S_IFLNK:
                raise RuntimeError("ZIP contem link simbolico; revise manualmente")
            destination = TARGET.joinpath(*parts)
            if item.is_dir():
                if not args.dry_run:
                    destination.mkdir(parents=True, exist_ok=True)
                continue
            if not args.dry_run:
                destination.parent.mkdir(parents=True, exist_ok=True)
                payload = z.read(item)
                if destination.exists():
                    if destination.read_bytes() != payload:
                        raise FileExistsError(f"Recusando sobrescrever: {destination}")
                else:
                    destination.write_bytes(payload)
            count += 1
    print(f"{'Seriam extraidos' if args.dry_run else 'Extraidos'} {count} arquivos em {TARGET}")
    for path in REQUIRED:
        print(f"{'OK' if (TARGET / path).exists() else 'PENDENTE'}: {path}" if not args.dry_run else f"Esperado: {path}")
    print("ATENCAO: o kit original nao traz, pelo menos: " + ", ".join(MISSING_FROM_SUPPLIED_ARCHIVE))
    print("Nao execute o renderizador antes de resolver e testar as dependencias adicionais.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
