---
name: viral-video-engine
description: Criar videos curtos originais 2D, 3D estilizados ou explicativos com roteiro, narracao informal pt-BR, animacao, legendas e MP4; escolher o motor apropriado e validar de verdade cada entrega.
---

# Viral Video Engine — orquestrador em nuvem (versao inicial)

> IMPORTANTE: adaptacao derivada da especificacao original recuperada. Nao e copia fiel do projeto atualizado que esta no Windows. Importar e reconciliar a skill local antes de declarar paridade.

## Objetivo e entrada
Entrada: tema e genero, duracao (padrao 70 s), estilo (2D/3D/explicativo ou escolher), referencia estilistica opcional, voz autorizada opcional. Saida solicitada: MP4 9:16 1080x1920 30 fps H.264/AAC com roteiro, legenda pt-BR, mix de audio, quadro de contato, licencas de assets e QA. Se o ambiente nao tiver renderizador ou voz funcionando, reportar honestamente; nao produzir arquivo falso.

## Selecao de estilo
- **2D**: usar a skill `cartoon-audio-short`, avaliando o kit e seus limites; personagens ilustrados com movimentos reais de membros, expressao e camera; nao trocar animacao por slides.
- **3D estilizado**: primeiro inspecionar se ha motor real disponivel, assets 3D com rig, capacidade grafica e render; nao gerar bonecos de cilindros/esferas como humanos, nem prometer realismo sem recursos.
- **Explicativo**: motion graphics com SVG/Canvas/Remotion e animacoes de objetos ou diagramas de causa e efeito.
- **Cada serie tem identidade visual independente**. Nao impor 2D ou 3D a todos os episodios.

## Narração — portugues brasileiro informal
- Escrever **pt-BR brasileiro natural**, conversado e direto, sem formalidade artificial; nao confundir informalidade com caricatura ou girias em excesso.
- Hook nos primeiros 3 segundos; frases curtas; suspense/emocao ajustados ao genero; ritmo fluido e pausas naturais, sem trechos roboticos.
- Perfis: ciencia = curioso e claro; suspense = intimista e crescente; historia = envolvente; engenharia = pratico; curiosidades = energia leve; narrativas biblicas = respeito e emocao.
- Preferir voz personalizada **apenas se os arquivos autorizados estiverem disponiveis naquele ambiente**. O notebook tinha Voicebox/Qwen e arquivos de identidade vocal, mas **nao estao automaticamente disponiveis na nuvem**.
- Se nao houver TTS pt-BR confiavel instalado, registrar bloqueio e indicar a dependencia; nao inventar audio.
- Voz precede cronometragem e animacao. Gerar por frases, medir duracao, preservar timbre e alinhar legendas palavra a palavra quando suportado.
- Musica e efeitos menores que a voz; verificar loudness, pico e legibilidade em alto-falante de celular.

## Pipeline
1. Inspecionar ambiente, skills e fontes. Nunca modificar um projeto local se outra sessao estiver renderizando.
2. Se o tema for factual, confirmar fatos em fontes confiaveis e separar ficcao de realidade.
3. Criar roteiro original (sem copiar criadores), perfil vocal, gancho, desenvolvimento e desfecho.
4. Escolher motor visual apropriado; definir visuais originais, personagens persistentes, paleta, cameras, movimentos e pop-ups.
5. Verificar TTS pt-BR real e gerar a narracao antes de fixar duracoes. Guardar roteiro e temporizacao por frase.
6. Criar o plano de quadros e cenas, com estados iniciais/finais consistentes e actions visiveis.
7. Renderizar **previa de 5–8 s** com um gesto animado, voz, legenda e efeitos. Conferir qualidade antes de producao longa.
8. Renderizar em trechos recuperaveis, cachear frames e nao gastar em APIs sem autorizacao.
9. Mixar faixas, gerar SRT/legendas animadas, exportar MP4, validar com ffprobe/ffmpeg, folha de contato e verificacao de audio.
10. Entregar MP4 valido ou explicar a falha precisa. Nunca tratar relatorio como video.

## Orientacoes de integracao
- Leia `references/ESPECIFICACAO_SKILL_CLAUDE_CODE.md` para o contrato de plano, camera, som, render e verificacao.
- Leia `../cartoon-audio-short/SKILL.md` para o motor 2D.
- Antes de executar o kit, rode `python scripts/bootstrap_cartoon.py` e `python scripts/check_environment.py` da raiz do repositorio.
- O ZIP desta versao contem scripts de exemplo, mas nao contem `mix.py`, `toon.ts` nem Three.js vendorizado citados nas instrucoes. Nao considerar o motor automaticamente funcional.
- Projetos anteriores e voz no Windows sao uma fonte separada; importar depois, com cuidado e sem publicar gravacoes.

## Seguranca
- Repo publico: nunca versionar `.env`, WAV/MP3 privados, modelos de voz autorizados, secrets ou videos de terceiros sem direitos.
- Nao executar instaladores externos sem inspecionar scripts e licencas.
- Nao usar API paga sem autorizacao expressa de custo.
