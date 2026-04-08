Investigue um bug no CodeTrail Command Center.

Bug:
{{bug}}

Contexto:
{{context}}

Área suspeita:
{{files}}

Regras:

- buscar a causa raiz
- não aplicar remendo superficial se o problema for estrutural
- preservar contratos e comportamento esperado
- considerar impacto em AppShell, command-center-data.ts, auth.ts, support-chat.ts e rotas /api/admin/\* quando aplicável
- considerar também estados de ambiente, dual source de dados e permissões

Quero como saída:

1. causa provável
2. arquivos envolvidos
3. correção mínima segura
4. risco de regressão
5. pontos de teste manual
