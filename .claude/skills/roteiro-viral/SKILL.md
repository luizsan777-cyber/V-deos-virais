---
name: roteiro-viral
description: Regras para escrever roteiros virais originais em português brasileiro, prontos para narração (gancho em 3 s, estrutura de curiosidade crescente, linguagem falada informal, verificação de fatos). Use ao criar ou revisar o roteiro de qualquer vídeo do Viral Video Engine.
---

# Roteiro viral em pt-BR

## Estrutura

1. **Gancho (0–3 s)**: a frase mais estranha/forte do vídeo. Pergunta absurda, fato chocante ou ameaça.
   - "E se a Terra parasse de girar agora?" / "Seu corpo brilha no escuro. Sério!"
2. **Situação rápida (3–10 s)**: onde, quando, quem — em 1 ou 2 frases.
3. **Desenvolvimento com curiosidade crescente**: cada fala abre uma pergunta que a próxima responde.
4. **Revelações / viradas**: pelo menos uma coisa que o público não esperava.
5. **Clímax**: o momento mais intenso (visual forte + efeito sonoro).
6. **Conclusão marcante**: frase curta que dá vontade de comentar ou rever (callback ao gancho funciona bem).

Ritmo: ~2,6–3 palavras por segundo de vídeo. 30 s ≈ 80 palavras; 60 s ≈ 165; 70 s ≈ 190.

## Linguagem (como um brasileiro contando para um amigo)

- Frases curtas (até ~14 palavras). Uma ideia por fala no `projeto.json`.
- Informal e conversado: "cara", "tipo", "olha só", "sabe o que é pior?", "agora vem a parte doida" —
  **com moderação** (no máximo 1 expressão dessas a cada 3–4 falas). Use "tá", "pra", "a gente" naturalmente.
- Nada de formalidade de livro: troque "Imagine a possibilidade hipotética de nosso planeta interromper
  abruptamente seu movimento rotacional" por "E se a Terra parasse de girar agora? Cara, o que aconteceria
  nos primeiros segundos seria absurdo!".
- Sem repetir palavras próximas; sem "neste vídeo vamos ver"; sem introdução lenta; sem "não esqueça de se inscrever" no meio.
- Humor leve e ironia quando o tema permite, sem distorcer o fato.
- **Respeito**: histórias bíblicas, tragédias e mortes reais → tom sereno, sem gíria, sem piada.
- Números: escreva com algarismos no texto (o normalizador lê por extenso: "1.670 km/h" → "mil seiscentos e
  setenta quilômetros por hora"). Se a leitura ficar estranha, use o campo `"tts"` com a grafia falada.
- Palavras estrangeiras/nomes difíceis: use `"tts"` com a pronúncia aportuguesada.

## Perfis de narração (`projeto.json → perfil`)

`ciencia`, `suspense`, `terror`, `historia`, `biblico`, `engenharia`, `curiosidades`, `documentario`
(definidos em `ferramentas/perfis.json`: velocidade, pausas, voz por motor, música padrão).

## Verificação de fatos (obrigatória em ciência e história)

- Pesquise antes de escrever (WebSearch). Prefira fontes primárias: artigos, NASA/ESA, museus, enciclopédias.
- Cada número/data no roteiro precisa de fonte em `projeto.json → fontes`.
- "Dizem que…" / lenda → deixe claro que é lenda. Hipótese → "os cientistas acham que…".
- Histórias de terror ficcionais: deixe claro que é ficção (ou "lenda urbana") quando parecer real.

## Formato no projeto.json

```json
{
  "titulo": "…", "modo": "2d|3d|explicativo", "estilo": "…", "perfil": "ciencia",
  "voz": { "motor": "kokoro", "voz": "pm_alex" },
  "musica": { "humor": "curioso|ciencia|suspense|terror|epico|biblico|alegre", "volume_db": -22 },
  "legenda": "impacto|moderno|biblico|terror",
  "fontes": ["…"],
  "falas": [ { "id": "gancho", "texto": "…" }, { "id": "x", "texto": "…", "pausa": 0.3, "tts": "grafia falada opcional" } ],
  "destaques": ["palavras", "em", "amarelo"],
  "sfx": [ { "som": "impacto", "em": "palavra:girar" }, { "som": "whoosh", "em": "gancho:fim-0.1" }, { "som": "riser", "em": "t:12.5" } ]
}
```

Efeitos disponíveis: `whoosh, impacto, pop, clique, magia, brilho, desce, riser, trovao, coracao, vento, glitch, ding, swoosh_sobe`.
