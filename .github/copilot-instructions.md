# CodeTrail Command Center - Repository Instructions

Você está trabalhando no CodeTrail Command Center, o painel operacional e administrativo interno do ecossistema CodeTrail.

## Missão do projeto

Este repositório não é o produto final do aluno.
Ele é a camada interna de operação da equipe e deve priorizar:

- confiabilidade operacional
- clareza visual e leitura de dados
- segurança de acesso
- estabilidade do layout
- mudanças pequenas e seguras
- manutenção previsível

## Stack real do projeto

Considere sempre o stack real antes de sugerir mudanças:

- Next.js 16 com App Router
- React 19
- TypeScript 5
- Tailwind CSS 4
- Supabase Auth + tabelas operacionais internas
- Recharts
- Zod
- nuqs
- Vitest
- ESLint + TypeScript

Importante:

- não assumir Zustand
- não assumir shadcn como base do codebase
- não inventar arquitetura nova sem necessidade
- o estado atual é majoritariamente local por componente e dados server-side

## Regras de trabalho

- Preserve comportamento existente.
- Não refatore fora do escopo sem necessidade real.
- Prefira corrigir a causa raiz em vez de aplicar remendos.
- Faça a menor mudança segura possível.
- Reaproveite componentes, utilitários, tipos e estilos existentes antes de criar novos.
- Evite novas dependências.
- Preserve contratos já consumidos pelo front.

## App Router e estrutura do projeto

- use App Router
- rotas protegidas ficam em src/app/(protected)
- APIs ficam em src/app/api
- não criar pages/api
- handlers de API devem ficar em route.ts

## Estratégia de implementação

Antes de mudar qualquer coisa:

1. localize os arquivos certos
2. entenda o fluxo completo
3. avalie impacto em layout, dados e autorização
4. implemente a mudança mínima segura
5. valide estados de loading, erro, empty e interação

## Layout e UI

A UI deve seguir a linguagem operacional do projeto:

- dark/OLED
- accent cyan
- Inter
- Material Symbols
- superfícies escuras em camadas
- bordas sutis
- alto contraste
- glow controlado
- animações discretas e úteis

Nunca poluir a interface com excesso de ornamento.

## Shell e áreas sensíveis

Tenha cuidado extra ao mexer em:

- src/components/shell/app-shell.tsx
- src/lib/command-center-data.ts
- src/lib/auth.ts
- src/lib/admin-data.ts
- src/lib/support-chat.ts
- src/components/chat/support-console.tsx
- src/lib/api-catalog-data.ts

Mudanças nessas áreas podem quebrar o painel inteiro, RBAC, snapshot operacional, suporte, catálogo de APIs e layout global.

## Estado e dados

Priorize:

- Server Components para leitura inicial
- componentes client apenas para interação
- useState local para estado efêmero
- fetch interno para /api/admin/... quando esse for o padrão existente

## Autorização

Respeite rigorosamente os papéis:

- owner
- admin
- operator
- viewer

Nunca relaxar permissões.
Owner continua sendo o papel mais sensível.

## Entrega esperada

Quando responder com implementação:

- explique o que foi alterado
- liste arquivos impactados
- destaque riscos ou pontos sensíveis
- mencione validações manuais recomendadas
