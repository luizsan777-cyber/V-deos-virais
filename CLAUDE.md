# Viral Video Engine — instruções para o Claude

O usuário trabalha **pelo celular**, sem notebook. Fale em português brasileiro. Entregue vídeos com `SendUserFile`.

## Para criar um vídeo
Siga a skill `video-viral` (`.claude/skills/video-viral/SKILL.md`). Ela chama `roteiro-viral`, `voz-ptbr` e
`animacao-2d` / `animacao-3d` / `animacao-explicativa`.

## Comandos
- Pipeline completo: `python3 ferramentas/produzir.py projetos/<slug>` → `saida/<slug>.mp4` + QA.
- Só quadros de conferência: `... --etapas none --stills 30,90,150 --escala 0.5` (olhe as imagens!).
- Só voz: `python3 ferramentas/voz.py projetos/<slug>`; só áudio: `python3 ferramentas/audio.py projetos/<slug>`.
- Typecheck: `cd engine && npx tsc --noEmit -p .`
- Na nuvem do Claude Code, o Chromium do sistema é usado automaticamente (`/opt/pw-browsers`).
- Primeira vez num container novo: `pip install -r requirements.txt && (cd engine && npm ci)`.

## Regras do projeto
- Narração sempre pt-BR. Nunca use voz inglesa ou de Portugal.
- Sem serviços pagos sem autorização expressa. Sem alterações irreversíveis sem perguntar.
- Fatos de ciência/história verificados, com fonte em `projeto.json → fontes`.
- Não declarar pronto sem `saida/<slug>_qa.json` com `problemas: []` e sem olhar `saida/<slug>_qa.jpg`.
- Variar estilo visual entre vídeos (registre em `docs/estilos-usados.md`).
- Preserve os componentes aprovados do kit (`engine/src/kit/`): melhorias devem ser compatíveis com os
  projetos existentes (`projetos/teste-*` precisam continuar compilando).
- Nunca versionar áudio de voz pessoal (`vozes/` está no .gitignore; use o secret `VOZ_REFERENCIA_B64`).
- `referencias/terceiros/` é material de leitura (MIT), não usar como skill ativa.
- HyperFrames é motor OPCIONAL (skill `hyperframes-video`): sempre com `HYPERFRAMES_NO_TELEMETRY=1 DO_NOT_TRACK=1`;
  nunca `publish`/`share`/`cloud`/recursos Pro ou HeyGen sem autorização (são externos/pagos).
