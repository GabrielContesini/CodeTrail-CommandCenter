---
name: command-center-data-safety
description: Use esta skill quando a tarefa envolver command-center-data.ts, auth.ts, admin-data.ts, api-catalog-data.ts, billing snapshots, dual source de dados ou contratos consumidos por várias telas.
---

Ao trabalhar em dados do Command Center:

1. identifique a origem do dado
2. identifique quem consome
3. valide impacto cruzado em:
   - dashboard
   - users
   - apis
   - support
   - billing
4. preserve contratos existentes
5. trate cenários de ausência de dado, falha de ambiente e inconsistência entre fontes
6. não assumir backend real onde ainda houver mock
7. ao concluir, descreva:
   - origem afetada
   - telas impactadas
   - risco operacional
