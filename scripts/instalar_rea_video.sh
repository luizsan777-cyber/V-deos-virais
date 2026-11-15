#!/usr/bin/env bash
# Instala (ou reinstala) o rea-video como FERRAMENTA COMPLEMENTAR de análise de vídeos de referência.
# Fica FORA do repositório (padrão: /home/user/ferramentas-externas) num ambiente Python isolado (venv),
# sem tocar em requirements.txt, voz.py, perfis, skills ou no fluxo de vídeos do projeto.
#   bash scripts/instalar_rea_video.sh            # instala/atualiza na versão fixada abaixo
#   REA_DIR=/outro/lugar bash scripts/instalar_rea_video.sh
# Depois: $REA_DIR/venv-rea/bin/rea-video --help   (ou: source $REA_DIR/venv-rea/bin/activate)
set -euo pipefail
REA_DIR="${REA_DIR:-/home/user/ferramentas-externas}"
REA_COMMIT="${REA_COMMIT:-ebe853e330d63719a1f91754f789647c515eac19}"   # versão testada em 15/11/2026
mkdir -p "$REA_DIR"
cd "$REA_DIR"
command -v ffmpeg >/dev/null || { echo "✗ falta ffmpeg"; exit 1; }
if [ ! -d rea-video/.git ]; then
  # sem os vídeos/GIFs grandes da documentação (blobs > 1 MB ficam de fora)
  git clone --filter=blob:limit=1m https://github.com/JuneYaooo/rea-video rea-video
fi
git -C rea-video fetch --filter=blob:limit=1m origin "$REA_COMMIT" 2>/dev/null || git -C rea-video fetch --filter=blob:limit=1m origin
git -C rea-video -c advice.detachedHead=false checkout -q "$REA_COMMIT"
[ -x venv-rea/bin/python ] || python3 -m venv venv-rea
venv-rea/bin/pip install -q --upgrade pip
venv-rea/bin/pip install -q -e "./rea-video[ocr]"
# só uma cópia do OpenCV (o pacote de OCR pode trazer a versão com interface gráfica)
if venv-rea/bin/pip show opencv-python >/dev/null 2>&1; then
  venv-rea/bin/pip uninstall -y -q opencv-python
  venv-rea/bin/pip install -q --force-reinstall --no-deps "opencv-python-headless>=4.8,<5"
fi
venv-rea/bin/rea-video --help >/dev/null && echo "✅ rea-video pronto: $REA_DIR/venv-rea/bin/rea-video (commit ${REA_COMMIT:0:7})"
