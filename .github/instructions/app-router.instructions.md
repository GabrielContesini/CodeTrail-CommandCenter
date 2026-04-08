---
applyTo: "src/app/**/*.ts,src/app/**/*.tsx"
---

# App Router Instructions

Neste repositório:

- use App Router
- mantenha rotas protegidas em src/app/(protected)
- mantenha APIs em src/app/api
- não usar pages/api
- handlers devem viver em route.ts
- preserve leitura server-side em pages e layouts quando esse for o padrão atual
- não mover lógica para client component sem motivo real
- ao criar páginas protegidas, validar integração com requireAdminAccess() e com o layout já existente
- ao alterar layouts, considerar impacto no AppShell e na rota /support
