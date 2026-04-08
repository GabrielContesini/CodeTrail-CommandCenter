# Command Center Agent Notes

Ao atuar neste repositório:

- pense como um engenheiro de manutenção de produto maduro
- priorize confiabilidade operacional sobre brilho visual desnecessário
- preserve o AppShell e a coerência entre sidebar, topbar e conteúdo principal
- trate /support como rota especial full-height
- ao alterar dados, valide impacto em command-center-data.ts
- ao alterar autenticação, RBAC ou membros, valide impacto em auth.ts, admin-data.ts e rotas /api/admin/\*
- não assuma bibliotecas que o projeto não usa
- não introduza store global sem necessidade real
- prefira leitura server-side e componentes client só para interação
- toda mudança visual deve revisar:
  - alinhamento
  - padding
  - gap
  - hover
  - focus
  - active
  - disabled
  - loading
  - empty
  - error
- em rotas administrativas, preservar permissões e compatibilidade
