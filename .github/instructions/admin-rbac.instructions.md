---
applyTo: "src/lib/auth.ts,src/lib/admin-data.ts,src/app/api/admin/**/*.ts,src/app/api/admin/**/*.tsx,src/app/(protected)/admin/**/*.ts,src/app/(protected)/admin/**/*.tsx"
---

# Admin RBAC Instructions

RBAC é crítico neste projeto.

Regras:

- não relaxar permissões
- preservar papéis owner, admin, operator e viewer
- owner continua sendo o papel mais sensível
- não quebrar bootstrap do primeiro owner
- não quebrar gestão de membros
- qualquer alteração deve manter compatibilidade com o fluxo atual de autenticação e autorização
- handlers devem responder de forma tipada, previsível e segura
- sempre considerar cenários de acesso negado, loading, erro e vazio na UI consumidora
