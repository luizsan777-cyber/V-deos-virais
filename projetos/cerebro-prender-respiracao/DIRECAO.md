# Direção — EP.02 Cérebro × prender a respiração (2D)

- **Motor:** Remotion (principal). **HyperFrames** só em 2 sobreposições: medidor da vontade de respirar (cena 6) e
  os dois gráficos ilustrativos + lupa "DIFERENÇA" (cena 9). Elas ficam em `hf/medidor` e `hf/graficos`, são renderizadas
  como PNG transparente em `engine/public/hf/cerebro-*` (não versionado) e compostas por `OverlayHF` no tempo exato da cena.
- **Voz:** Kokoro `pm_alex`, velocidade 1,0 (natural, sem aceleração). 87,8 s de narração + 2,6 s de respiro final.
- **Personagem:** Rafael (`elenco.tsx → RAFAEL`), definido uma vez; arco curioso → concentrado → desconforto moderado → surpresa → alívio.
- **Cenas (cenas.tsx):** 1 raio-X do cérebro · 2 pulmões O₂/CO₂ · 3 células e sangue · 4 sensores carótida + tronco com
  "CO₂ SOBE → pH MUDA → SINAL RESPIRATÓRIO AUMENTA" · 5 tronco encefálico + lendo/dormindo · 6 sala, desconforto e medidor ·
  7 diafragma com contração pequena · 8 O₂ diminuindo → "RISCO ESPECIAL NA ÁGUA" (sem pessoas na água) ·
  9 gráficos + cientista · 10 Rafael respirando na janela, luz quente, frase final.
- **Som:** batimento discreto, whooshes nos cortes, brilho/partículas, radar/ding nos sensores, cliques suaves na
  contração; música "curioso" baixando na parte de risco.

## Reproduzir
```bash
export HYPERFRAMES_NO_TELEMETRY=1 DO_NOT_TRACK=1 HYPERFRAMES_NO_UPDATE_CHECK=1
for n in medidor graficos; do (cd projetos/cerebro-prender-respiracao/hf/$n && \
  npx --prefix ../../../../experimentos/hyperframes hyperframes render --format png-sequence \
  -o ../../../../engine/public/hf/cerebro-$n --fps 30); done
python3 ferramentas/produzir.py projetos/cerebro-prender-respiracao
```
