# CodeTrail Command Center

Painel web de operacao e observabilidade do ecossistema CodeTrail.

## Objetivo

Este projeto centraliza:

- monitoramento de usuarios do app
- utilizacao do banco principal no Supabase
- saude da fila de sincronizacao
- status do app Android, app Windows e Command Center
- heartbeat e telemetria do ambiente Windows
- notas operacionais por usuario

## Stack

- Next.js 16
- TypeScript
- Tailwind CSS 4
- Supabase
- Recharts
- Lucide React
- Zod

## Estrutura

```text
src/
  app/
    api/
    users/
    systems/
    database/
    incidents/
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
TELEMETRY_INGEST_TOKEN=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

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

## Supabase

O painel usa o mesmo projeto Supabase do CodeTrail principal.

1. aplique o schema base do app principal
2. aplique o schema deste projeto em `supabase/schema.sql`
3. configure a service role key no ambiente do Command Center

## Heartbeat Windows

O script base esta em:

```text
agent/windows-heartbeat.ps1
```

Exemplo:

```powershell
.\agent\windows-heartbeat.ps1 `
  -CommandCenterUrl http://localhost:3000 `
  -IngestToken SEU_TOKEN
```

## Endpoints

- `GET /api/health`
- `POST /api/telemetry/heartbeat`
- `POST /api/admin/user-watchlist`

## Observacoes

- sem `SUPABASE_SERVICE_ROLE_KEY`, a UI entra em modo blueprint e mostra dados mock
- a rota de watchlist foi pensada para ambiente interno; proteja o deploy antes de expor publicamente
