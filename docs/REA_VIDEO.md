# rea-video — análise de vídeos de referência (ferramenta complementar)

**O que é:** https://github.com/JuneYaooo/rea-video (Apache-2.0). Lê um vídeo pronto e devolve, cena a cena: cortes e
ritmo, tipo de imagem (filmado / IA / 3D / 2D / gráfico por código), textos e legendas na tela (com tempos), efeitos
sonoros, música e voz, e um relatório (`report.html` + `VIDEO.md`). **Não gera vídeo**; aqui ele serve só para estudar
referências (abertura, ritmo, cortes, movimentos, textos, cores, efeitos, clareza) e melhorar nossos vídeos 2D
originais — como inspiração, sem copiar cenas, roteiros, personagens ou músicas.

Não substitui nada do projeto: fica **fora do repositório**, num Python isolado, e não usa a narração, as vozes, os perfis
nem as skills existentes.

## Instalar / reinstalar (cada sessão nova da nuvem começa limpa)
```bash
bash scripts/instalar_rea_video.sh      # ~1–2 min; clona em /home/user/ferramentas-externas e cria o venv (~400 MB)
```
Versão fixada no script: commit `ebe853e` (testado em 15/11/2026). Sem conta, sem chave, sem custo.

## Usar
```bash
R=/home/user/ferramentas-externas/venv-rea/bin/rea-video
# análise leve e gratuita (sem separar voz/música, sem modelo pago):
$R decompose referencias/videos/ref1.mp4 -o referencias/analises/ref1 --no-stems --no-vlm --lang en
$R summary referencias/analises/ref1/breakdown.json
# o Claude (que vê imagens) faz a revisão visual cena a cena e junta ao resultado:
$R review referencias/analises/ref1   →  preencher review_answers.json  →  $R apply-review referencias/analises/ref1 --by claude
```
- `referencias/videos/` e `referencias/analises/` estão no `.gitignore`: vídeos de terceiros e relatórios **não vão para o GitHub**.
- Relatórios saem em inglês ou chinês (`--lang en|zh`); o Claude resume em português.
- Sem a revisão visual, desenhos 2D tendem a ser rotulados como "3D render" (o próprio rea-video avisa que 2D precisa de olho).

## Downloads que ele pode fazer (avisar antes)
| Quando | O quê | Tamanho | Origem |
|---|---|---|---|
| separação voz/música (sem `--no-stems`) | UVR MDX-Net + BandIt v2 | ~67 MB + ~149 MB | releases do GitHub |
| detecção de rosto | YuNet | pequeno | GitHub (opencv_zoo) — **bloqueado na nuvem em 15/11** (cai para método alternativo) |
| `[asr]` (não instalado) | SenseVoice | ~160 MB | GitHub (sherpa-onnx) |
| `--vlm` | modelo de visão **pago** (Gemini/GPT-4o…) | — | **não configurado** — só com autorização |

**Não usar** sem autorização: `--vlm` (API paga), `remake-run` (gera vídeo e cobra), `capsule-cinema`, ChatCut.

## Como mandar uma referência pelo celular
Anexe o arquivo MP4 na conversa do app (ícone de anexo). Links de TikTok/YouTube/Instagram não são baixados aqui
(redes bloqueadas e termos dos sites); se só houver link, baixe no celular e anexe. Arquivos originais (sem
recompressão) dão resultado melhor.
