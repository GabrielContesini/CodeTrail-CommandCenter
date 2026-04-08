---
name: command-center-shell-safety
description: Use esta skill quando a tarefa impactar AppShell, sidebar, topbar, layout global, offsets, altura útil de página ou comportamento especial da rota /support.
---

Ao trabalhar no shell do Command Center:

1. trate AppShell como área crítica
2. preserve sidebar fixa, topbar fixa e offsets consistentes
3. revise:
   - altura útil
   - scroll
   - overflow
   - alinhamento global
   - espaçamento entre shell e conteúdo
4. se houver impacto em /support, validar o canvas full-height
5. não introduza hacks de layout desnecessários
6. prefira mudanças mínimas e previsíveis
7. ao concluir, explique:
   - o que mudou
   - o risco para o shell
   - o que deve ser validado manualmente
