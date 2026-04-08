---
applyTo: "src/lib/**/*.ts,src/lib/**/*.tsx,src/app/api/**/*.ts,src/app/api/**/*.tsx"
---

# Data Access Instructions

O projeto possui áreas de dados altamente sensíveis.

Regras:

- não quebrar contratos existentes
- manter tipagem forte
- preferir mudanças pequenas, seguras e previsíveis
- não supor que dados mockados já foram substituídos por backend real
- tratar falhas de ambiente e dados ausentes com cuidado

Atenção especial:

- src/lib/command-center-data.ts
- src/lib/api-catalog-data.ts
- src/lib/admin-data.ts
- src/lib/auth.ts
- src/lib/support-chat.ts

Considerar sempre:

- dual source de dados
- PRODUCT*SUPABASE*\*
- PRODUCT_APP_URL
- banco operacional do painel
- banco do produto

Antes de alterar:

1. identificar a origem do dado
2. confirmar quem consome
3. revisar risco em dashboard, users, apis, support e billing
