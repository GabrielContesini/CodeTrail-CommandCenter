# Projeto: CodeTrail Command Center

Ultima atualizacao: 2026-04-08

## Objetivo:

O `CodeTrail Command Center` e o painel operacional e administrativo do ecossistema CodeTrail.

Ele existe para:
- monitorar usuarios, incidentes, sincronizacao e saude operacional
- observar sistemas e heartbeats da frota Windows/apps
- centralizar operacoes administrativas com RBAC
- acompanhar APIs e integrações do `CodeTrailWeb`
- operar o suporte ao cliente com inbox, thread e contexto operacional

No ecossistema, ele nao e o produto final do aluno. Ele e a camada de operacao interna da equipe.

## Stack:

- `Next.js 16` com `App Router`
- `React 19`
- `TypeScript 5`
- `Tailwind CSS 4`
- `Supabase` (`@supabase/ssr` + `@supabase/supabase-js`)
- `Recharts` para graficos
- `Zod` para schemas/validacao
- `nuqs` para adapter de query state no App Router
- `Vitest` para testes
- `ESLint` + `TypeScript` para qualidade

Observacoes importantes:
- hoje o projeto **nao usa Zustand**
- hoje o projeto **nao usa shadcn como base declarada do codebase**
- o estado e majoritariamente local por componente (`useState`) + dados server-side
- a autenticacao/autorizacao depende de `Supabase Auth` + tabelas operacionais internas

## Estrutura principal:

```text
codetrail-command-center/
  src/
    app/
      (protected)/
        admin/
        analytics/
        apis/
        billing/
        database/
        incidents/
        support/
        systems/
        users/
      api/
        admin/
          incidents/
          members/
          support/
          user-watchlist/
        bootstrap/
        health/
        telemetry/
      login/
      layout.tsx
      globals.css
    components/
      apis/
      auth/
      charts/
      chat/
      dashboard/
      forms/
      icons/
      pages/
      shell/
      tables/
      ui/
    lib/
      auth.ts
      command-center-data.ts
      admin-data.ts
      support-chat.ts
      api-catalog-data.ts
      env.ts
      schemas.ts
      types.ts
      supabase/
        browser.ts
        server.ts
  supabase/
  tests/
  design_system.md
  design_system_v2.md
  REDESIGN_GUIDE.md
```

## Telas principais:

- `Dashboard` (`/`)
  - overview operacional
  - cards de metricas, APIs, growth, active users, performance e incidentes
- `Usuarios` (`/users`, `/users/[userId]`)
  - lista operacional de usuarios
  - watchlist, risco, suporte e contexto individual
- `Sistemas` (`/systems`)
  - saude da frota, heartbeat, versoes, ambientes e degradacoes
- `Database` (`/database`)
  - leitura operacional de tabelas principais e backlog de sync
- `Incidentes` (`/incidents`)
  - triagem e acompanhamento de incidentes operacionais
- `APIs` (`/apis`)
  - catalogo estilo Swagger operacional
  - health real do `CodeTrailWeb`
  - documentacao de auth, payload, retorno e dependencias
- `Billing` (`/billing`)
  - painel financeiro/assinaturas
  - hoje ainda tem parte estaticamente mockada no backend do painel
- `Support` (`/support`)
  - inbox de conversas
  - thread principal
  - painel lateral com contexto do cliente
- `Admin` (`/admin`)
  - membros administrativos, papeis e operacoes de acesso
- `Login` (`/login`)
  - acesso do time interno

Observacao:
- `analytics` existe como rota, mas nao parece ser hoje o fluxo principal do painel
- `trilhas`, `formacoes`, `ranking` e `achievements` **nao existem como telas principais dedicadas** neste projeto hoje

## Fluxos principais:

### 1. Acesso administrativo

- usuario autentica via Supabase
- `requireAdminAccess()` protege as rotas de `src/app/(protected)`
- o perfil em `ops_admin_profiles` define o papel e o acesso

### 2. Snapshot operacional

- o layout protegido carrega `getCommandCenterSnapshot()`
- esse snapshot consolida:
  - usuarios
  - sessoes
  - sync queue
  - watchlist
  - frota
  - heartbeats
  - incidentes
- a leitura vem de duas fontes:
  - banco operacional do Command Center
  - banco do produto via `PRODUCT_SUPABASE_*`

### 3. Operacao de usuarios

- a tela de usuarios mostra risco, onboarding, trilha, sync pendente e suporte
- a watchlist e atualizada via APIs internas do painel
- o detalhe do usuario aprofunda contexto e acao operacional

### 4. Operacao de incidentes

- incidentes podem vir persistidos do banco
- quando nao existem, parte deles pode ser derivada do estado operacional
- a equipe usa a tela para triagem e acompanhamento

### 5. Monitoramento de APIs

- a tela `/apis` documenta e monitora o backend do `CodeTrailWeb`
- consome `PRODUCT_APP_URL` para chamar `/api/health`
- combina catalogo manual + health real

### 6. Suporte

- operador abre `/support`
- inbox mostra as conversas recentes
- thread centraliza a conversa ativa
- painel lateral mostra metadados, email, origem e status
- hoje o fluxo foi melhorado para ficar mais rapido com base realtime no produto

### 7. Telemetria de heartbeat

- o endpoint `POST /api/telemetry/heartbeat` recebe dados operacionais
- isso alimenta `ops_heartbeats`, sistemas e performance do painel

## O que nao pode quebrar:

### Design system atual

- tema dark/OLED com accent cyan
- tipografia `Inter`
- `Material Symbols` como familia principal de icones
- superficies com borda sutil, contraste alto e glow controlado
- uso consistente de tokens em `src/app/globals.css`

### Estrutura de layout

- `AppShell` e o layout base das telas protegidas
- sidebar fixa a esquerda
- topbar fixa no topo
- conteudo principal com offsets consistentes
- a rota `/support` usa um canvas especial full-height e precisa de cuidado extra com scroll

### Estrutura de rotas

- projeto usa `App Router`
- rotas protegidas ficam em `src/app/(protected)`
- APIs ficam em `src/app/api`
- nao criar `pages/api`

### Estado e fluxo de dados

- evitar criar global store sem necessidade real
- priorizar:
  - Server Components para leitura inicial
  - componentes client apenas para interacao
  - `useState` local para estado efemero
- manter o modelo atual de fetch interno para `/api/admin/...`

### Padrao de API

- handlers em `route.ts`
- respostas tipadas e previsiveis
- loading, erro e empty state na UI que consome essas rotas
- preservar compatibilidade com os contratos ja usados pelo front

### Autorizacao

- `owner`, `admin`, `operator`, `viewer`
- nao relaxar controle de permissao
- `owner` continua sendo o papel mais sensivel

## Padroes visuais:

- linguagem visual: `cyber dark premium`, operacional, sem excesso de ornamento
- cards com raio generoso, borda sutil e fundos escuros por camadas
- cyan e usado para highlight, nao para poluir a tela toda
- spacing e hierarquia visual importam mais do que adicionar novos componentes
- hover/focus/active devem existir e ser discretos
- animacoes devem ser sutis e uteis
- tabelas, cards e paines devem manter leitura limpa e contraste alto

Referencias concretas do projeto:
- `src/app/globals.css`
- `design_system.md`
- `design_system_v2.md`
- `REDESIGN_GUIDE.md`

## Padroes de codigo:

- preservar comportamento existente
- mudancas devem ser pequenas, seguras e faceis de revisar
- nao refatorar fora do escopo sem necessidade real
- preferir causa raiz a remendo
- reutilizar componentes, estilos e utilitarios ja existentes
- evitar duplicacao de UI e de logica
- manter tipagem forte em `lib/types.ts` e tipos locais quando necessario
- quando a tela muda, entregar tambem:
  - loading
  - empty
  - error
  - success
  - disabled
  - hover/focus/active quando aplicavel

Padrao pratico atual do repo:
- leitura server-side nos pages/layouts
- componentes client para formularios, modais, chat e interacoes
- utilitarios de dados concentrados em `src/lib/*`
- clientes Supabase centralizados em `src/lib/supabase/*`

## Areas sensiveis:

### 1. Dual source de dados

O projeto mistura:
- banco do proprio Command Center
- banco do produto via `PRODUCT_SUPABASE_*`
- health do produto via `PRODUCT_APP_URL`

Erros de ambiente quebram facilmente:
- dashboard
- users
- apis
- support
- billing

### 2. Snapshot operacional

`src/lib/command-center-data.ts` e uma area central e sensivel.

Ela deriva:
- usuarios
- atividade
- frota
- sistemas
- plataformas
- releases
- incidentes
- metricas de database

Mudancas aqui afetam varias telas ao mesmo tempo.

### 3. Layout do shell

`src/components/shell/app-shell.tsx` impacta o painel inteiro.

Qualquer ajuste errado aqui costuma quebrar:
- spacing global
- alinhamento de topbar/sidebar
- altura util das paginas
- scroll da rota `/support`

### 4. Suporte/chat

`src/components/chat/support-console.tsx` e `src/lib/support-chat.ts` exigem cuidado com:
- sincronizacao de inbox e thread
- update otimista
- unread/read
- performance percebida
- layout full-height

### 5. Catalogo de APIs

`src/lib/api-catalog-data.ts` e manual.

Se o `CodeTrailWeb` mudar e esse arquivo nao for atualizado, a tela `/apis` fica inconsistente.

### 6. Billing

Parte do billing ainda usa retorno estatico/mockado em `getBillingSnapshot()`.

Nao assumir que tudo ali ja esta vindo do backend real sem validar antes.

### 7. Permissoes administrativas

`src/lib/auth.ts`, `src/lib/admin-data.ts` e rotas `/api/admin/*` sao sensiveis.

Nao quebrar:
- RBAC
- bootstrap do primeiro owner
- gestao de membros

## O que quero que o Copilot faca melhor:

- nao refatorar fora do escopo
- nao inventar arquitetura nova sem necessidade
- preservar comportamento existente
- manter a UI fiel ao padrao visual do projeto
- sempre considerar loading, erro, empty e estados interativos
- respeitar a estrutura do `App Router`
- reaproveitar componentes e utilitarios antes de criar novos
- evitar dependencias novas
- nao supor que ha Zustand, shadcn ou outra infra que o repo nao usa
- quando mexer em tela protegida, validar impacto no `AppShell`
- quando mexer em dados, validar impacto em `command-center-data.ts`
- quando mexer no suporte, priorizar legibilidade, responsividade e latencia percebida

## Referencias visuais:

### Sidebar

- fixa a esquerda
- fundo preto
- itens com icone Material Symbols
- item ativo com cyan + borda lateral

### Topbar

- fixa no topo
- busca, notificacoes, ajuda e perfil
- translucida/escura no mesmo tom do shell

### Dashboard

- composicao em bento grid
- cards de metrica no topo
- blocos operacionais densos, mas visualmente organizados

### Tabelas e paines

- fundos escuros escalonados
- bordas finas
- cantos arredondados
- texto claro com hierarquia forte

### Chat de suporte

- inbox a esquerda
- thread no centro
- contexto a direita
- header interno proprio
- rota full-canvas, sem tratamentos genericos de pagina

## Resumo executivo:

Este projeto e um painel interno de operacao. O que mais importa nele e:
- confiabilidade operacional
- consistencia visual
- seguranca de acesso
- leitura clara de dados
- manutencao cuidadosa de layout e fluxos sensiveis

Se o Copilot for usado aqui, ele deve agir mais como um engenheiro de manutencao de produto maduro do que como um gerador de UI aleatoria.
