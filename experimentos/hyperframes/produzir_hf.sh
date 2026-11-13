#!/usr/bin/env bash
# Pipeline Viral Video Engine → HyperFrames (motor visual OPCIONAL; o Remotion continua sendo o padrão).
#   bash experimentos/hyperframes/produzir_hf.sh experimentos/hyperframes/<projeto>
# Etapas: voz pt-BR (voz.py) → trilha/SFX/mix (audio.py) → bundle do rig de personagens (vve-kit.js)
#         → legendas + tempos no HTML (vve_para_hf.py) → hyperframes check → render → QA da VVE.
# Saída: saida/hf-<projeto>.mp4 e saida/hf-<projeto>_qa.{jpg,json}
set -euo pipefail
RAIZ="$(cd "$(dirname "$0")/../.." && pwd)"
HF="$(cd "$1" && pwd)"; NOME="$(basename "$HF")"
export HYPERFRAMES_NO_TELEMETRY=1 DO_NOT_TRACK=1 HYPERFRAMES_NO_UPDATE_CHECK=1 HYPERFRAMES_SKIP_SKILLS=1
cd "$RAIZ"
[ -d experimentos/hyperframes/node_modules ] || (cd experimentos/hyperframes && npm ci --no-audit --no-fund)
[ -d engine/node_modules ] || (cd engine && npm ci --no-audit --no-fund)
python3 ferramentas/voz.py "$HF/vve"
python3 ferramentas/audio.py "$HF/vve"
node experimentos/hyperframes/rig/build.mjs "$HF"
python3 experimentos/hyperframes/vve_para_hf.py "$HF"
cd "$HF"
npx --prefix "$RAIZ/experimentos/hyperframes" hyperframes check
t0=$(date +%s)
npx --prefix "$RAIZ/experimentos/hyperframes" hyperframes render -o "renders/$NOME.mp4" --fps 30 --quality delivery --max-bitrate 12M --quiet
echo "[hf] render em $(( $(date +%s) - t0 ))s"
cd "$RAIZ" && mkdir -p saida && cp "$HF/renders/$NOME.mp4" "saida/hf-$NOME.mp4"
python3 -c "
import sys; sys.path.insert(0, 'ferramentas'); import qa
from pathlib import Path
ok = qa.verificar(Path('saida/hf-$NOME.mp4'), Path('$HF/vve/build/tempos.json'), Path('saida/hf-${NOME}_qa.jpg'))
sys.exit(0 if ok else 2)"
echo "✅ saida/hf-$NOME.mp4"
