# CodeTrail Command Center

Painel web de operacao e administracao do ecossistema CodeTrail.

## O que este projeto entrega

- visao operacional do ecossistema Android, Windows e Command Center
- leitura de usuarios, watchlist e incidentes
- telemetria de heartbeat do app Windows
- painel administrativo com controle de membros e papeis
- trilha de auditoria para acoes administrativas
- protecao de rotas com Supabase Auth + RBAC

## Stack

- Next.js 16
- TypeScript
- Tailwind CSS 4
- Supabase Auth + Postgres
- Recharts
- Lucide React
- Zod

## Estrutura

```text
src/
  app/
    (protected)/
    api/
    login/
  components/
    charts/
    forms/
    shell/
    ui/
  lib/
    supabase/
supabase/
agent/
public/
```

## Variaveis de ambiente

Use `.env.example` como base:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
PRODUCT_SUPABASE_URL=
PRODUCT_SUPABASE_SERVICE_ROLE_KEY=
TELEMETRY_INGEST_TOKEN=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Descricao rapida:

- `NEXT_PUBLIC_SUPABASE_URL`: URL do projeto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: chave publica usada no login do painel
- `SUPABASE_SERVICE_ROLE_KEY`: chave privada usada pelo backend para operacoes administrativas
- `PRODUCT_SUPABASE_URL`: URL do banco do produto CodeTrail App
- `PRODUCT_SUPABASE_SERVICE_ROLE_KEY`: chave privada para leitura operacional do banco do produto
- `TELEMETRY_INGEST_TOKEN`: token compartilhado para ingestao de heartbeat
- `NEXT_PUBLIC_APP_URL`: URL publica do painel

## Setup do Supabase

Voce pode usar o mesmo projeto do app principal ou um projeto Supabase dedicado ao Command Center.

Se usar o mesmo banco do app principal:

1. aplique o schema base do ecossistema CodeTrail
2. aplique [supabase/schema.sql](./supabase/schema.sql)
3. configure as variaveis de ambiente do painel
4. crie ao menos um usuario no Supabase Auth
5. promova esse usuario como owner com [supabase/bootstrap_owner.sql](./supabase/bootstrap_owner.sql)

Se usar um Supabase separado so para o Command Center:

1. aplique [supabase/schema_standalone.sql](./supabase/schema_standalone.sql)
2. configure as variaveis de ambiente do painel
3. crie ao menos um usuario no Supabase Auth
4. promova esse usuario como owner com [supabase/bootstrap_owner.sql](./supabase/bootstrap_owner.sql)
5. aponte `PRODUCT_SUPABASE_URL` e `PRODUCT_SUPABASE_SERVICE_ROLE_KEY` para o banco do CodeTrail App

Se voce ja aplicou uma versao anterior do schema standalone, rode tambem a migration:

- [supabase/migrations/20260308_standalone_external_entities.sql](./supabase/migrations/20260308_standalone_external_entities.sql)

Exemplo de bootstrap do primeiro owner:

- abra [supabase/bootstrap_owner.sql](./supabase/bootstrap_owner.sql)
- troque `SEU_EMAIL_AQUI`
- execute o script no SQL Editor do Supabase

Depois do bootstrap, esse owner consegue:

- acessar `/admin`
- conceder acesso a outros membros
- alterar papeis
- remover membros
- auditar alteracoes feitas no painel

## Papeis administrativos

- `owner`: controla membros, papeis e configuracao operacional
- `admin`: acesso amplo ao painel sem gestao de membros
- `operator`: operacao do dia a dia
- `viewer`: somente leitura

## Como rodar

```powershell
npm install
npm run dev
```

## Como validar

```powershell
npm run lint
npm run typecheck
npm run build
```

## Rotas e endpoints

Rotas protegidas:

- `/`
- `/users`
- `/systems`
- `/database`
- `/incidents`
- `/admin`

Endpoints principais:

- `GET /api/health`
- `POST /api/telemetry/heartbeat`
- `POST /api/admin/user-watchlist`
- `POST /api/admin/members`
- `PATCH /api/admin/members/:memberId`
- `DELETE /api/admin/members/:memberId`

## Heartbeat Windows

O script base esta em [agent/windows-heartbeat.ps1](./agent/windows-heartbeat.ps1).

Exemplo:

```powershell
.\agent\windows-heartbeat.ps1 `
  -CommandCenterUrl http://localhost:3000 `
  -IngestToken SEU_TOKEN
```

## Observacoes operacionais

- sem `SUPABASE_SERVICE_ROLE_KEY`, o painel continua navegavel, mas entra em modo blueprint para a parte administrativa
- a autenticacao usa Supabase Auth; a autorizacao usa `ops_admin_profiles`
- a auditoria administrativa grava em `ops_audit_logs`
- o painel pode operar com banco separado do produto; nesse caso os dados do app entram por `PRODUCT_SUPABASE_*`
- publique esse projeto protegido por login; ele nao foi desenhado para acesso anonimo
