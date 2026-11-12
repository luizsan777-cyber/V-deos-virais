---
name: animacao-3d
description: Como animar no MODO 3D do Viral Video Engine (ciência, universo, história, engenharia, animais) — palco three.js no Remotion com câmera por chaves, luz estilizada com sombras, planetas, terreno, árvores, casas e prédios toon com contorno, e personagens 2D projetados no mundo 3D. Use ao escrever o Video.tsx de um vídeo 3D.
---

# Animação 3D (kit em `engine/src/kit/tres/`)

Exemplo completo e testado: `projetos/teste-3d-terra/Video.tsx`.

## Peças

- `Palco3D.tsx`
  - `<Palco3D chaves={[[frame, [x,y,z] posição, [x,y,z] alvo, fov], …]} fundo neblina={[cor, perto, longe]} tremores mao exposicao>`
  - `<LuzesEstilizadas sol corSol intensidade ambiente recorte />` (sol com sombra suave + recorte frio)
  - `projetar(f, chaves, [x,y,z], width, height)` → posição e escala na tela para desenhar um `<Personagem>`
    2D por cima do 3D (estilo "personagens 2D em mundo 3D"). Use o MESMO array de chaves do palco.
- `objetos.tsx`: `Planeta (terra|marte|lua, giro, nuvens, atmosfera)`, `Estrelas`, `Sol`, `Ceu (degradê)`,
  `Terreno`, `Arvore`, `Casa`, `Predio`, `ComContorno` (qualquer geometria com material toon + contorno de tinta),
  `Toon` (material).
- Unidades ≈ metros. Chão em y = 0. Personagem 2D com `escala = proj.escala * 0.8` ≈ 1,7 m de altura.

## Câmera (o que faz parecer cinema)

- Movimentos suaves de 1–3 s entre chaves (o easing já é aplicado), câmera nunca parada.
- Comece aberto (contexto) e aproxime nos pontos fortes; use `tremores` nos impactos.
- Troque de plano (Sequence) a cada 4–8 s: aberto → médio → detalhe.
- `mao={0.3–0.8}` dá vida (câmera na mão sutil).

## Desempenho

- Render 3D por software (sem GPU): ~3 fps em 1080×1920 com 4 núcleos. Texturas procedurais são criadas uma vez
  (`useMemo`). Evite >200 objetos com contorno ou sombras de mapa > 2048.
- Objetos que mudam por frame: calcule posição/rotação a partir de `f` (nunca estado/aleatório sem semente).

## Evitar

- Personagens feitos só de cilindros e esferas: use o personagem 2D articulado projetado no 3D,
  ou construa formas orgânicas (Lathe/Extrude, várias peças com contorno) e anime as partes.
- Cena vazia: sempre fundo (Ceu/Estrelas), meio (objetos) e frente (algo perto da câmera em 1/3 dos planos).
