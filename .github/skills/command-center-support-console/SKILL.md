---
name: command-center-support-console
description: Use esta skill quando a tarefa envolver support-console.tsx, support-chat.ts, inbox, thread, painel de contexto, unread/read, update otimista ou performance percebida do suporte.
---

Ao trabalhar no suporte:

1. preserve a estrutura:
   - inbox à esquerda
   - thread no centro
   - contexto à direita
2. trate a rota como full-height
3. valide sincronização entre lista e thread
4. preserve unread/read
5. tenha cuidado com update otimista
6. priorize legibilidade, responsividade e latência percebida
7. ao finalizar, revise:
   - loading
   - empty
   - error
   - success
   - disabled
   - scroll
   - sticky regions
