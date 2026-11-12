# Integração da skill local e do motor 2D

## O que foi realmente recuperado
1. Arquivo `SKILL.md` da skill `cartoon-audio-short` no Drive do usuario: copia fiel no repositorio.
2. Arquivo ZIP `cartoon-short-kit.zip` do Drive: pacote de engine + exemplo + utilitarios.
3. Documento `ESPECIFICACAO_SKILL_CLAUDE_CODE.md` da biblioteca do usuario: texto da **especificacao de desenvolvimento**.
4. Uma nova skill `viral-video-engine` derivada dessa especificacao, como **orquestrador inicial para nuvem**, nao como clone do projeto de Windows.

## Bloqueios confirmados no kit ZIP
Conteudo presente: `engine/roman.js`, `engine/main.js`, `engine/motion.js`, `engine/paint.js`, `tools/setup.sh`, `tools/timing.py`, `tools/render.mjs`, `tools/finish.sh`, `tools/sheet.py` e exemplo de historia.

Arquivos mencionados no SKILL.md, mas nao presentes no ZIP: `mix.py`, copia de `toon.ts` e copia de `three.js`. O arquivo `finish.sh` e o setup podem precisar de correcoes adicionais. Testar de verdade antes de prometer exportacao.

## Como usar no Claude Code Cloud
- O repositório deve estar ligado a sessao Code.
- Rodar `python scripts/bootstrap_cartoon.py` para descompactar o kit sob a skill 2D.
- Rodar `python scripts/check_environment.py` e corrigir dependencias suportadas.
- Instalar Python deps apenas se necessario; conferir Node, Chromium/Playwright, FFmpeg.
- Instalar/obter dependencias que faltam **somente apos avaliar suas licencas e integridade**.
- Criar um teste 2D **original** de 5 a 8 s, com audio pt-BR realmente sintetizado e composicao animada, renderizar, verificar e disponibilizar MP4. Nada de declarar pronto antes.
- Trabalhar separadamente do processo de render em curso no notebook.

## Sincronizacao futura com Windows
No projeto local original, procurar `.claude/skills/viral-video-engine/SKILL.md`, `references/`, `scripts/`, `config/voz_identidade.json` e assets de render.
Comparar a skill local com a versao em nuvem e **fazer merge sem perder ajustes**. Antes de qualquer sincronizacao, eliminar `assets/voz/`, audio de referencia de voz, chaves, tokens, credenciais e caminhos privados. Nunca empurrar voz clonada para repo publico.

## Privacidade
Este repositorio foi encontrado **publico**. Se quiser guardar materiais privados ou uma configuracao de voz, primeiro o torne privado e mesmo assim use armazenamento seguro para segredos e audios sensiveis.

## Fontes dos arquivos
- Skill e kit: https://drive.google.com/drive/folders/1frRlFTSyGrIHnSJYz5djqq7sgDHZKcng
- Projeto original: documentos e especificacao recuperados da biblioteca do usuario.
