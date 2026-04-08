---
applyTo: "src/components/chat/**/*.ts,src/components/chat/**/*.tsx,src/lib/support-chat.ts,src/app/(protected)/support/**/*.ts,src/app/(protected)/support/**/*.tsx"
---

# Support Console Instructions

O suporte é um fluxo sensível e full-height.

Prioridades:

- latência percebida
- legibilidade
- estabilidade visual
- sincronização confiável entre inbox, thread e painel de contexto

Regras:

- preservar layout de inbox à esquerda, thread no centro e contexto à direita
- não quebrar unread/read
- ter cuidado com update otimista
- preservar performance percebida
- revisar scroll, sticky regions e altura útil
- não aplicar layout genérico de página se isso afetar o canvas do suporte
- sempre prever loading, empty, error, disabled e success quando aplicável
