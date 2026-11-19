#!/usr/bin/env bash
# Cola a capa do usuário (PNG 1920x1080) nos quadros 0–29 do vídeo final, sem corte nem deformação, e copia a PNG para a entrega.
#   bash projetos/wolverine_homem_que_nao_morre/aplicar_capa.sh [caminho/Capa_Wolverine_1920x1080.png]
set -euo pipefail
cd "$(dirname "$0")/../.."
P=projetos/wolverine_homem_que_nao_morre
CAPA="${1:-$P/Capa_Wolverine_1920x1080.png}"
[ -f "$CAPA" ] || { echo "Capa não encontrada: $CAPA"; exit 1; }
DIM=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "$CAPA")
[ "$DIM" = "1920x1080" ] || { echo "A capa tem $DIM; precisa ser 1920x1080 para entrar sem corte nem deformação."; exit 1; }
BASE=saida/wolverine_homem_que_nao_morre.mp4
OUT=saida/Wolverine_O_Homem_Que_Nao_Morre.mp4
ffmpeg -v error -y -i "$BASE" -loop 1 -i "$CAPA" -filter_complex "[1:v]format=yuv420p,setsar=1[c];[0:v][c]overlay=0:0:enable='lt(n,30)':shortest=1,format=yuv420p[v]" \
  -map "[v]" -map 0:a -c:v libx264 -profile:v high -preset medium -crf 18 -maxrate 14M -bufsize 28M -pix_fmt yuv420p -color_range tv -r 30 \
  -c:a copy -movflags +faststart "$OUT"
cp "$CAPA" saida/Capa_Wolverine_1920x1080.png
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,nb_frames -show_entries format=duration -of compact "$OUT"
echo "✅ $OUT (capa aplicada nos quadros 0–29)"
