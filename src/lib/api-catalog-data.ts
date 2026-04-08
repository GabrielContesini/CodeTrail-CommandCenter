import { unstable_noStore as noStore } from "next/cache";
import { getCommandCenterEnv } from "@/lib/env";

export type ApiDomain =
  | "health"
  | "auth"
  | "billing"
  | "privacy"
  | "skillthree"
  | "support";
export type ApiMethod = "GET" | "POST";
export type ApiAuthMode =
  | "public"
  | "session"
  | "session_or_bearer"
  | "anonymous_or_session";
export type ApiProbeMode = "public" | "authenticated" | "redirect_flow" | "manual";
export type ApiParameterLocation = "body" | "query" | "path" | "header";
export type ApiDependencyKind =
  | "storage"
  | "edge_function"
  | "rpc"
  | "external"
  | "auth"
  | "redirect";

export type ApiParameter = {
  name: string;
  type: string;
  description: string;
  location: ApiParameterLocation;
  required?: boolean;
};

export type ApiStatusCode = {
  code: number;
  label: string;
  note?: string;
};

export type ApiDependency = {
  kind: ApiDependencyKind;
  name: string;
  detail: string;
};

export type ApiOperationSpec = {
  id: string;
  domain: ApiDomain;
  method: ApiMethod;
  path: string;
  summary: string;
  description: string;
  auth: ApiAuthMode;
  tags: string[];
  parameters: ApiParameter[];
  response: {
    success: string;
    notes?: string[];
  };
  statusCodes: ApiStatusCode[];
  dependencies: ApiDependency[];
  monitoring: {
    probeMode: ApiProbeMode;
    checklist: string[];
    note: string;
  };
};

export type TechnicalRouteSpec = {
  id: string;
  method: "GET";
  path: string;
  summary: string;
  description: string;
  behavior: string;
  dependencies: ApiDependency[];
  monitoring: {
    probeMode: ApiProbeMode;
    checklist: string[];
    note: string;
  };
};

export type ConnectedSystemDependency = {
  name: string;
  detail: string;
  usedBy: string[];
};

export type ApiHealthStatus = "ok" | "degraded" | "error";
export type ProductApiHealthCheckStatus = ApiHealthStatus | "skipped";

export type ProductApiHealthCheck = {
  status: ProductApiHealthCheckStatus;
  critical: boolean;
  summary: string;
  errorCategory?: string;
  details?: Record<string, unknown>;
};

export type ProductApiHealthReport = {
  status: ApiHealthStatus;
  timestamp: string;
  requestId?: string;
  durationMs?: number;
  summary: {
    ok: number;
    skipped: number;
    degraded: number;
    error: number;
  };
  checks: {
    app: ProductApiHealthCheck;
    auth: ProductApiHealthCheck;
    supabase: ProductApiHealthCheck;
    billing: ProductApiHealthCheck;
    integrations: ProductApiHealthCheck;
  };
};

export type ProductApiHealthSnapshot = {
  state: "live" | "unconfigured" | "unavailable";
  endpointUrl: string | null;
  httpStatus?: number;
  report?: ProductApiHealthReport;
  message: string;
};

export type ApiCatalogSnapshot = {
  generatedAt: string;
  source: {
    product: string;
    appRouterRoutes: number;
    httpOperations: number;
    technicalRoutes: number;
    hasPagesApi: boolean;
    hasSwagger: boolean;
  };
  summary: {
    protectedOperations: number;
    publicOperations: number;
    hybridOperations: number;
    publicProbeCandidates: number;
    authProbeCandidates: number;
    flowOnlyCandidates: number;
  };
  groups: Array<{
    domain: ApiDomain;
    label: string;
    operations: number;
  }>;
  operations: ApiOperationSpec[];
  technicalRoutes: TechnicalRouteSpec[];
  edgeFunctions: ConnectedSystemDependency[];
  rpcs: ConnectedSystemDependency[];
  externalApis: ConnectedSystemDependency[];
  liveHealth: ProductApiHealthSnapshot;
  gaps: string[];
  recommendations: string[];
};

const operations: ApiOperationSpec[] = [
  {
    id: "health-get",
    domain: "health",
    method: "GET",
    path: "/api/health",
    summary: "Consolida o health operacional das APIs do produto.",
    description:
      "Retorna um relatório consolidado com status geral, duração, requestId e checks separados para app, auth, Supabase, billing e integrações.",
    auth: "public",
    tags: ["health", "monitoring", "observability"],
    parameters: [],
    response: {
      success: "{ status, timestamp, requestId, durationMs, summary, checks }",
      notes: [
        "200 indica health ok ou degraded; 503 indica erro crítico em checks marcados como críticos.",
        "Checks individuais também podem vir como skipped quando o probe ativo é opcional e não roda naquele ambiente.",
        "O payload inclui checks detalhados por domínio para consumo de monitoramento.",
      ],
    },
    statusCodes: [
      { code: 200, label: "Health consolidado disponível." },
      { code: 503, label: "Um ou mais checks críticos falharam." },
      { code: 500, label: "Falha ao consolidar o relatório de health." },
    ],
    dependencies: [
      {
        kind: "auth",
        name: "Supabase auth settings",
        detail: "Valida a camada de auth via endpoint público/settings do Supabase.",
      },
      {
        kind: "storage",
        name: "Supabase database + support storage",
        detail: "Confirma acesso ao banco principal e ao storage persistente do suporte.",
      },
      {
        kind: "external",
        name: "Stripe / Resend / ClickUp",
        detail: "Entra no health de billing e integrações auxiliares.",
      },
    ],
    monitoring: {
      probeMode: "public",
      checklist: [
        "status code",
        "latência",
        "requestId",
        "checks por domínio",
        "erro crítico vs degradado",
      ],
      note:
        "Agora é o probe público principal do produto. Ideal para alimentar o Command Center e synthetic monitoring externo.",
    },
  },
  {
    id: "auth-welcome-post",
    domain: "auth",
    method: "POST",
    path: "/api/auth/welcome",
    summary: "Envia o e-mail de boas-vindas se ainda não tiver sido enviado.",
    description:
      "Endpoint autenticado que usa a sessão Supabase para decidir se o e-mail inicial deve ser disparado ou ignorado.",
    auth: "session",
    tags: ["auth", "email", "welcome"],
    parameters: [
      {
        name: "planCode",
        type: '"free" | "pro" | "founding"',
        description: "Plano associado ao usuário para customizar o nome do plano no e-mail.",
        location: "body",
      },
    ],
    response: {
      success: "{ success, skipped }",
      notes: [
        "200 informa se o envio foi executado ou pulado por já ter sido disparado.",
      ],
    },
    statusCodes: [
      { code: 200, label: "Envio concluído ou pulado." },
      { code: 401, label: "Sessão Supabase inválida." },
      { code: 429, label: "Rate limit por IP." },
      { code: 500, label: "Falha no envio do e-mail." },
    ],
    dependencies: [
      {
        kind: "auth",
        name: "Supabase session",
        detail: "Recupera o usuário autenticado via supabase.auth.getUser().",
      },
      {
        kind: "storage",
        name: "Supabase",
        detail: "Consulta/atualiza o estado do envio do welcome e-mail.",
      },
      {
        kind: "external",
        name: "Resend",
        detail: "Entrega o e-mail transacional de boas-vindas.",
      },
    ],
    monitoring: {
      probeMode: "authenticated",
      checklist: [
        "status code",
        "latência",
        "sessão Supabase válida",
        "entrega Resend",
        "idempotência do envio",
      ],
      note:
        "Bom candidato para probe autenticado de onboarding. Também vale registrar skipped vs sent para separar sucesso real de idempotência.",
    },
  },
  {
    id: "billing-checkout-post",
    domain: "billing",
    method: "POST",
    path: "/api/billing/checkout",
    summary: "Inicia o checkout de assinatura.",
    description:
      "Cria uma sessão de checkout de assinatura para os planos pagos e devolve checkoutUrl, clientSecret e snapshot de billing.",
    auth: "session_or_bearer",
    tags: ["billing", "stripe", "checkout"],
    parameters: [
      {
        name: "x-supabase-auth",
        type: "Bearer <token>",
        description: "Alternativa à sessão web para autenticação server-to-server.",
        location: "header",
      },
      {
        name: "planCode",
        type: '"pro" | "founding"',
        description: "Plano pago solicitado no checkout.",
        location: "body",
        required: true,
      },
      {
        name: "uiMode",
        type: '"hosted" | "embedded"',
        description: "Modo de renderização do checkout Stripe.",
        location: "body",
      },
      {
        name: "returnUrl",
        type: "string",
        description: "URL de retorno após concluir ou cancelar o checkout.",
        location: "body",
      },
    ],
    response: {
      success: "{ checkoutUrl, clientSecret, snapshot }",
      notes: [
        "422 cobre payload inválido antes de chamar Stripe.",
        "Pode devolver apenas checkoutUrl ou clientSecret dependendo do uiMode.",
      ],
    },
    statusCodes: [
      { code: 200, label: "Sessão criada com sucesso." },
      { code: 401, label: "Sem sessão ou token válido." },
      { code: 422, label: "Plano ou payload inválido." },
      { code: 429, label: "Rate limit por IP." },
      { code: 500, label: "Falha interna no billing." },
    ],
    dependencies: [
      {
        kind: "auth",
        name: "Supabase session / token",
        detail: "Aceita sessão web ou x-supabase-auth com bearer token.",
      },
      {
        kind: "edge_function",
        name: "billing-create-checkout",
        detail: "Edge Function usada para abrir a sessão Stripe.",
      },
      {
        kind: "external",
        name: "Stripe",
        detail: "Criação da sessão de checkout e retorno do client secret.",
      },
      {
        kind: "rpc",
        name: "get_my_billing_snapshot",
        detail: "Atualiza o snapshot retornado ao front após o checkout.",
      },
    ],
    monitoring: {
      probeMode: "authenticated",
      checklist: [
        "status code",
        "latência",
        "sessão/token válido",
        "Edge Function billing-create-checkout",
        "Stripe checkout session",
        "billing snapshot",
      ],
      note:
        "Como passa por Stripe e Edge Function, o monitor ideal precisa separar falha de auth, falha de provider e falha de snapshot no retorno.",
    },
  },
  {
    id: "billing-cancel-post",
    domain: "billing",
    method: "POST",
    path: "/api/billing/cancel",
    summary: "Cancela a assinatura atual.",
    description:
      "Aciona o cancelamento da assinatura do usuário autenticado e devolve o snapshot atualizado de billing.",
    auth: "session",
    tags: ["billing", "subscription", "cancel"],
    parameters: [],
    response: {
      success: "{ snapshot }",
      notes: [
        "A resposta bem-sucedida já retorna o estado atualizado do billing para o front.",
      ],
    },
    statusCodes: [
      { code: 200, label: "Assinatura cancelada com snapshot atualizado." },
      { code: 401, label: "Sessão obrigatória." },
      { code: 429, label: "Rate limit por IP." },
      { code: 500, label: "Falha no cancelamento." },
    ],
    dependencies: [
      {
        kind: "auth",
        name: "Supabase session",
        detail: "Identifica o usuário e a assinatura alvo.",
      },
      {
        kind: "edge_function",
        name: "billing-cancel-subscription",
        detail: "Edge Function usada para cancelar a assinatura no provedor.",
      },
      {
        kind: "external",
        name: "Stripe",
        detail: "Cancela a assinatura ativa do cliente.",
      },
      {
        kind: "rpc",
        name: "get_my_billing_snapshot",
        detail: "Retorna o snapshot final após o cancelamento.",
      },
    ],
    monitoring: {
      probeMode: "authenticated",
      checklist: [
        "status code",
        "latência",
        "auth",
        "cancelamento Stripe",
        "snapshot atualizado",
      ],
      note:
        "Requer conta com assinatura ativa para teste realista. Um probe autenticado deve validar também o comportamento idempotente para repetição de cancelamento.",
    },
  },
  {
    id: "billing-portal-post",
    domain: "billing",
    method: "POST",
    path: "/api/billing/portal",
    summary: "Abre o portal do cliente no billing.",
    description:
      "Gera uma URL do portal do cliente para gestão de assinatura, com returnUrl opcional.",
    auth: "session",
    tags: ["billing", "portal", "stripe"],
    parameters: [
      {
        name: "returnUrl",
        type: "string",
        description: "URL opcional para retorno do usuário ao sair do portal.",
        location: "body",
      },
    ],
    response: {
      success: "{ url }",
      notes: [
        "409 pode indicar ausência de assinatura/cliente elegível.",
        "503 cobre indisponibilidade transitória do serviço de billing.",
      ],
    },
    statusCodes: [
      { code: 200, label: "Portal pronto para redirecionamento." },
      { code: 401, label: "Sessão obrigatória." },
      { code: 409, label: "Conta sem estado de billing compatível." },
      { code: 429, label: "Rate limit por IP." },
      { code: 500, label: "Falha interna." },
      { code: 503, label: "Billing indisponível temporariamente." },
    ],
    dependencies: [
      {
        kind: "auth",
        name: "Supabase session",
        detail: "Garante identidade do cliente antes do portal.",
      },
      {
        kind: "edge_function",
        name: "billing-create-portal-session",
        detail: "Edge Function usada para gerar a sessão do portal.",
      },
      {
        kind: "external",
        name: "Stripe",
        detail: "Customer portal do Stripe.",
      },
    ],
    monitoring: {
      probeMode: "authenticated",
      checklist: [
        "status code",
        "latência",
        "auth",
        "Edge Function billing-create-portal-session",
        "URL do portal no payload",
      ],
      note:
        "Como a saída principal é uma URL, o monitor deve validar campo url não vazio e diferenciação entre 409 funcional e falha real 5xx.",
    },
  },
  {
    id: "billing-status-get",
    domain: "billing",
    method: "GET",
    path: "/api/billing/status",
    summary: "Consulta o snapshot do billing e pode forçar sync.",
    description:
      "Retorna o snapshot atual de billing e opcionalmente força uma reconciliação curta com o provider via query sync=1.",
    auth: "session",
    tags: ["billing", "snapshot", "sync"],
    parameters: [
      {
        name: "plan",
        type: '"free" | "pro" | "founding"',
        description: "Plano solicitado pelo front para contexto de UI.",
        location: "query",
      },
      {
        name: "sync",
        type: '"1"',
        description: "Quando presente, força sync curto com o provider.",
        location: "query",
      },
    ],
    response: {
      success: "{ snapshot, requestedPlan, status? }",
      notes: [
        "Sem sync, lê o snapshot persistido; com sync, chama a sincronização guardada do billing.",
      ],
    },
    statusCodes: [
      { code: 200, label: "Snapshot retornado com sucesso." },
      { code: 401, label: "Sessão obrigatória." },
      { code: 429, label: "Rate limit por IP." },
      { code: 500, label: "Falha ao carregar ou sincronizar." },
    ],
    dependencies: [
      {
        kind: "auth",
        name: "Supabase session",
        detail: "Restringe o snapshot ao usuário logado.",
      },
      {
        kind: "rpc",
        name: "get_my_billing_snapshot",
        detail: "Fonte principal do snapshot persistido.",
      },
      {
        kind: "edge_function",
        name: "billing-sync-subscription",
        detail: "Usada quando sync=1 para reconciliação curta com o provider.",
      },
      {
        kind: "external",
        name: "Stripe",
        detail: "Fonte de verdade remota para sync sob demanda.",
      },
    ],
    monitoring: {
      probeMode: "authenticated",
      checklist: [
        "status code",
        "latência",
        "auth",
        "RPC get_my_billing_snapshot",
        "sync Stripe opcional",
      ],
      note:
        "É uma boa rota para monitorar o estado de billing, mas só com autenticação. O branch sync=1 merece medição separada por custo e latência.",
    },
  },
  {
    id: "billing-config-get",
    domain: "billing",
    method: "GET",
    path: "/api/billing/config",
    summary: "Expõe a chave pública do Stripe para o front.",
    description:
      "Endpoint público usado pelo front para obter a publishable key do Stripe antes de inicializar o checkout.",
    auth: "public",
    tags: ["billing", "stripe", "public"],
    parameters: [],
    response: {
      success: "{ publishableKey }",
      notes: [
        "Continua sendo um bom probe público de config do billing, mas agora divide esse papel com o /api/health.",
      ],
    },
    statusCodes: [
      { code: 200, label: "Chave pública disponível." },
      { code: 429, label: "Rate limit por IP." },
      { code: 500, label: "Env/config indisponível." },
    ],
    dependencies: [
      {
        kind: "external",
        name: "Stripe",
        detail: "Entrega a publishable key consumida no front.",
      },
    ],
    monitoring: {
      probeMode: "public",
      checklist: [
        "status code",
        "latência",
        "publishableKey presente",
        "configuração Stripe carregada",
      ],
      note:
        "Segue útil como sentinela simples para regressões de env/config do billing, enquanto o /api/health cobre a visão consolidada.",
    },
  },
  {
    id: "privacy-export-get",
    domain: "privacy",
    method: "GET",
    path: "/api/privacy/export",
    summary: "Exporta os dados do usuário em JSON para download.",
    description:
      "Gera um payload JSON com dados do controller, do usuário e do workspace para download LGPD.",
    auth: "session",
    tags: ["privacy", "lgpd", "export"],
    parameters: [],
    response: {
      success: "Arquivo application/json com controller, user e workspace.",
      notes: [
        "É um contrato de download, não uma resposta JSON comum da UI.",
      ],
    },
    statusCodes: [
      { code: 200, label: "Arquivo pronto para download." },
      { code: 401, label: "Sessão obrigatória." },
    ],
    dependencies: [
      {
        kind: "auth",
        name: "Supabase session",
        detail: "Identifica o titular dos dados.",
      },
      {
        kind: "storage",
        name: "Supabase",
        detail: "Lê os dados do usuário e do workspace para compor o arquivo.",
      },
    ],
    monitoring: {
      probeMode: "authenticated",
      checklist: [
        "status code",
        "latência",
        "auth",
        "header application/json",
        "storage Supabase",
      ],
      note:
        "O monitor precisa validar cabeçalho/content-type e tamanho mínimo do download, não apenas 200 OK.",
    },
  },
  {
    id: "privacy-requests-get",
    domain: "privacy",
    method: "GET",
    path: "/api/privacy/requests",
    summary: "Lista até 25 solicitações LGPD/privacidade do usuário.",
    description:
      "Consulta a trilha auditável de privacidade do usuário autenticado, ordenada por created_at desc.",
    auth: "session",
    tags: ["privacy", "lgpd", "requests"],
    parameters: [],
    response: {
      success: "{ requests: [...] }",
      notes: [
        "503 cobre ambiente sem tabela/trilha auditável habilitada.",
      ],
    },
    statusCodes: [
      { code: 200, label: "Lista carregada." },
      { code: 401, label: "Sessão obrigatória." },
      { code: 503, label: "Storage de privacidade indisponível." },
      { code: 500, label: "Falha ao carregar solicitações." },
    ],
    dependencies: [
      {
        kind: "auth",
        name: "Supabase session",
        detail: "Recupera o usuário autenticado.",
      },
      {
        kind: "storage",
        name: "data_subject_requests",
        detail: "Tabela usada como trilha auditável de privacidade.",
      },
    ],
    monitoring: {
      probeMode: "authenticated",
      checklist: [
        "status code",
        "latência",
        "auth",
        "tabela data_subject_requests",
        "fallback 503 quando storage não existe",
      ],
      note:
        "Importante diferenciar 503 funcional por storage não habilitado de 500 real. Esse endpoint é sensível ao setup do ambiente.",
    },
  },
  {
    id: "privacy-requests-post",
    domain: "privacy",
    method: "POST",
    path: "/api/privacy/requests",
    summary: "Cria uma solicitação de privacidade.",
    description:
      "Valida o payload LGPD do usuário autenticado e persiste uma nova solicitação auditável.",
    auth: "session",
    tags: ["privacy", "lgpd", "write"],
    parameters: [
      {
        name: "request_type",
        type: "string",
        description: "Tipo da solicitação do titular.",
        location: "body",
        required: true,
      },
      {
        name: "subject",
        type: "string",
        description: "Assunto resumido da requisição.",
        location: "body",
        required: true,
      },
      {
        name: "details",
        type: "string",
        description: "Detalhamento do pedido LGPD.",
        location: "body",
        required: true,
      },
    ],
    response: {
      success: "{ request }",
      notes: [
        "201 representa criação bem-sucedida de uma nova solicitação.",
      ],
    },
    statusCodes: [
      { code: 201, label: "Solicitação criada." },
      { code: 400, label: "Payload inválido." },
      { code: 401, label: "Sessão obrigatória." },
      { code: 503, label: "Storage de privacidade indisponível." },
      { code: 500, label: "Falha ao persistir solicitação." },
    ],
    dependencies: [
      {
        kind: "auth",
        name: "Supabase session",
        detail: "Vincula a solicitação ao usuário autenticado.",
      },
      {
        kind: "storage",
        name: "data_subject_requests",
        detail: "Tabela onde a solicitação é persistida.",
      },
    ],
    monitoring: {
      probeMode: "authenticated",
      checklist: [
        "status code",
        "latência",
        "auth",
        "validação de payload",
        "insert em data_subject_requests",
      ],
      note:
        "Precisa de payload válido e sessão real. Em monitor sintético, use um tenant/controlado para não poluir a trilha produtiva.",
    },
  },
  {
    id: "skillthree-leaderboard-get",
    domain: "skillthree",
    method: "GET",
    path: "/api/skillthree/leaderboard",
    summary: "Retorna o leaderboard do SkillThree por escopo global, weekly e track.",
    description:
      "Carrega o ranking do SkillThree para o usuário logado e agora diferencia melhor auth inválida, falha upstream/storage e erro interno.",
    auth: "session",
    tags: ["skillthree", "leaderboard", "gamification"],
    parameters: [],
    response: {
      success: "{ leaderboardByScope, source }",
      notes: [
        "Falhas agora retornam { error, errorCategory } com status coerente com a categoria do problema.",
      ],
    },
    statusCodes: [
      { code: 200, label: "Leaderboard carregado." },
      { code: 401, label: "Sessão inválida ou auth ausente." },
      { code: 502, label: "Falha upstream ao compor o ranking." },
      { code: 503, label: "Storage/config indisponível." },
      { code: 500, label: "Falha interna não categorizada." },
    ],
    dependencies: [
      {
        kind: "auth",
        name: "Supabase session",
        detail: "Necessária para carregar o ranking do usuário.",
      },
      {
        kind: "storage",
        name: "SkillThree leaderboard data",
        detail: "Leituras usadas para compor leaderboard por escopo.",
      },
    ],
    monitoring: {
      probeMode: "authenticated",
      checklist: [
        "status code",
        "latência",
        "auth",
        "leitura do ranking",
        "diferenciação de falha",
      ],
      note:
        "O endpoint agora ficou observável o suficiente para alertas mais precisos, desde que exista tenant/auth controlado para o probe.",
    },
  },
  {
    id: "support-post",
    domain: "support",
    method: "POST",
    path: "/api/support",
    summary: "Envia contato de suporte por e-mail e tenta abrir task no ClickUp.",
    description:
      "Aceita usuário autenticado ou anônimo, valida o payload e envia a mensagem por e-mail; em seguida tenta abrir uma task operacional no ClickUp.",
    auth: "anonymous_or_session",
    tags: ["support", "contact", "clickup"],
    parameters: [
      {
        name: "name",
        type: "string",
        description: "Nome do remetente.",
        location: "body",
        required: true,
      },
      {
        name: "email",
        type: "string",
        description: "E-mail do remetente.",
        location: "body",
        required: true,
      },
      {
        name: "subject",
        type: "string",
        description: "Assunto da solicitação.",
        location: "body",
        required: true,
      },
      {
        name: "description",
        type: "string",
        description: "Mensagem principal enviada ao suporte.",
        location: "body",
        required: true,
      },
      {
        name: "pageUrl",
        type: "string",
        description: "Contexto de página de onde o contato saiu.",
        location: "body",
      },
      {
        name: "origin",
        type: "string",
        description: "Origem funcional do contato no produto.",
        location: "body",
      },
    ],
    response: {
      success: "{ success, message }",
      notes: [
        "ClickUp é tentativa best effort: o endpoint ainda pode responder 200 se o e-mail for enviado e a task falhar.",
      ],
    },
    statusCodes: [
      { code: 200, label: "Contato enviado com sucesso." },
      { code: 400, label: "Payload inválido." },
      { code: 429, label: "Rate limit por IP." },
      { code: 500, label: "Falha ao enviar contato." },
    ],
    dependencies: [
      {
        kind: "auth",
        name: "Supabase session (opcional)",
        detail: "Usada para enriquecer contexto e plano quando o usuário está logado.",
      },
      {
        kind: "rpc",
        name: "get_my_billing_snapshot",
        detail: "Usada para descobrir o plano do usuário autenticado.",
      },
      {
        kind: "external",
        name: "Resend",
        detail: "Envio do e-mail de suporte.",
      },
      {
        kind: "external",
        name: "ClickUp",
        detail: "Criação best effort de task operacional.",
      },
    ],
    monitoring: {
      probeMode: "authenticated",
      checklist: [
        "status code",
        "latência",
        "validação de payload",
        "entrega Resend",
        "ClickUp opcional",
      ],
      note:
        "Como aceita anônimo, também pode receber probe público controlado. Ainda assim, a validação real depende de payload e da disponibilidade do e-mail.",
    },
  },
  {
    id: "support-chat-conversations-get",
    domain: "support",
    method: "GET",
    path: "/api/support/chat/conversations",
    summary: "Lista a inbox de conversas persistidas do usuário.",
    description:
      "Retorna a inbox persistida do usuário autenticado com viewerRole, isMaster e até 50 conversas.",
    auth: "session",
    tags: ["support", "chat", "inbox"],
    parameters: [
      {
        name: "limit",
        type: "number <= 50",
        description: "Quantidade máxima de conversas na inbox.",
        location: "query",
      },
    ],
    response: {
      success: "{ viewerRole, isMaster, conversations }",
      notes: [
        "503 cobre storage do chat indisponível.",
      ],
    },
    statusCodes: [
      { code: 200, label: "Inbox carregada." },
      { code: 401, label: "Sessão obrigatória." },
      { code: 503, label: "Storage do chat indisponível." },
      { code: 500, label: "Falha no carregamento da inbox." },
    ],
    dependencies: [
      {
        kind: "auth",
        name: "Supabase session",
        detail: "Define qual inbox o usuário pode consultar.",
      },
      {
        kind: "storage",
        name: "Support chat storage",
        detail: "Persistência de conversas e mensagens do chat.",
      },
    ],
    monitoring: {
      probeMode: "authenticated",
      checklist: [
        "status code",
        "latência",
        "auth",
        "storage do chat",
        "shape da inbox",
      ],
      note:
        "É a leitura principal do inbox. Um synthetic monitor autenticado deve validar viewerRole e array conversations, não só 200.",
    },
  },
  {
    id: "support-chat-conversations-post",
    domain: "support",
    method: "POST",
    path: "/api/support/chat/conversations",
    summary: "Garante ou cria a conversa principal do usuário.",
    description:
      "Cria ou reutiliza a thread principal de suporte do usuário autenticado e devolve a thread inicial.",
    auth: "session",
    tags: ["support", "chat", "thread"],
    parameters: [
      {
        name: "origin",
        type: "string",
        description: "Origem funcional da conversa.",
        location: "body",
      },
      {
        name: "pageUrl",
        type: "string",
        description: "Página onde a thread foi iniciada.",
        location: "body",
      },
      {
        name: "subject",
        type: "string",
        description: "Assunto inicial sugerido para a thread.",
        location: "body",
      },
    ],
    response: {
      success: "{ conversation, messages, viewerRole, isMaster }",
      notes: [
        "Serve tanto para bootstrap da inbox quanto para garantir a thread principal do usuário.",
      ],
    },
    statusCodes: [
      { code: 200, label: "Thread criada ou retornada." },
      { code: 401, label: "Sessão obrigatória." },
      { code: 503, label: "Storage do chat indisponível." },
      { code: 500, label: "Falha ao garantir a thread." },
    ],
    dependencies: [
      {
        kind: "auth",
        name: "Supabase session",
        detail: "Identifica o dono da thread principal.",
      },
      {
        kind: "storage",
        name: "Support chat storage",
        detail: "Persistência da conversa principal e mensagens.",
      },
    ],
    monitoring: {
      probeMode: "authenticated",
      checklist: [
        "status code",
        "latência",
        "auth",
        "upsert da conversa",
        "payload da thread inicial",
      ],
      note:
        "É uma rota boa para smoke test autenticado do chat, mas gera efeito colateral ao criar thread. Use tenant/controlado.",
    },
  },
  {
    id: "support-chat-conversation-get",
    domain: "support",
    method: "GET",
    path: "/api/support/chat/conversations/[conversationId]",
    summary: "Carrega uma conversa específica com mensagens.",
    description:
      "Busca uma thread específica do chat persistido com suas mensagens e valida o acesso do usuário autenticado.",
    auth: "session",
    tags: ["support", "chat", "detail"],
    parameters: [
      {
        name: "conversationId",
        type: "string",
        description: "Identificador da conversa persistida.",
        location: "path",
        required: true,
      },
    ],
    response: {
      success: "{ conversation, messages, viewerRole, isMaster }",
      notes: [
        "404 cobre conversa inexistente ou não acessível.",
      ],
    },
    statusCodes: [
      { code: 200, label: "Conversa carregada." },
      { code: 401, label: "Sessão obrigatória." },
      { code: 404, label: "Conversa não encontrada." },
      { code: 503, label: "Storage do chat indisponível." },
      { code: 500, label: "Falha ao carregar conversa." },
    ],
    dependencies: [
      {
        kind: "auth",
        name: "Supabase session",
        detail: "Restringe o acesso à conversa do usuário.",
      },
      {
        kind: "storage",
        name: "Support chat storage",
        detail: "Busca conversa e mensagens persistidas.",
      },
    ],
    monitoring: {
      probeMode: "authenticated",
      checklist: [
        "status code",
        "latência",
        "auth",
        "integridade do conversationId",
        "storage do chat",
      ],
      note:
        "Precisa de um conversationId real para smoke test. Sem fixture estável, a observabilidade tende a depender mais de logs estruturados.",
    },
  },
  {
    id: "support-chat-messages-post",
    domain: "support",
    method: "POST",
    path: "/api/support/chat/conversations/[conversationId]/messages",
    summary: "Envia mensagem para a conversa.",
    description:
      "Valida o corpo da mensagem, grava a mensagem na conversa e devolve o registro persistido.",
    auth: "session",
    tags: ["support", "chat", "messages"],
    parameters: [
      {
        name: "conversationId",
        type: "string",
        description: "Identificador da conversa alvo.",
        location: "path",
        required: true,
      },
      {
        name: "body",
        type: "string",
        description: "Corpo textual da mensagem.",
        location: "body",
        required: true,
      },
      {
        name: "clientMessageId",
        type: "string",
        description: "Identificador opcional de deduplicação vindo do cliente.",
        location: "body",
      },
    ],
    response: {
      success: "{ message }",
      notes: [
        "400 cobre payload inválido antes de persistir.",
      ],
    },
    statusCodes: [
      { code: 200, label: "Mensagem persistida." },
      { code: 400, label: "Mensagem inválida." },
      { code: 401, label: "Sessão obrigatória." },
      { code: 404, label: "Conversa não encontrada." },
      { code: 503, label: "Storage do chat indisponível." },
      { code: 500, label: "Falha ao gravar mensagem." },
    ],
    dependencies: [
      {
        kind: "auth",
        name: "Supabase session",
        detail: "Garante o emissor autenticado.",
      },
      {
        kind: "storage",
        name: "Support chat storage",
        detail: "Persistência de mensagens e estado da conversa.",
      },
    ],
    monitoring: {
      probeMode: "authenticated",
      checklist: [
        "status code",
        "latência",
        "auth",
        "persistência da mensagem",
        "deduplicação por clientMessageId",
      ],
      note:
        "Por gerar escrita, o monitor deve usar fixture isolada e talvez rotação automática da conversa para não poluir a inbox real.",
    },
  },
  {
    id: "support-chat-read-post",
    domain: "support",
    method: "POST",
    path: "/api/support/chat/conversations/[conversationId]/read",
    summary: "Marca mensagens do suporte como lidas.",
    description:
      "Atualiza a conversa para marcar as mensagens do suporte como lidas pelo usuário autenticado.",
    auth: "session",
    tags: ["support", "chat", "read"],
    parameters: [
      {
        name: "conversationId",
        type: "string",
        description: "Identificador da conversa alvo.",
        location: "path",
        required: true,
      },
    ],
    response: {
      success: "{ conversation }",
      notes: [
        "Operação de estado útil para sincronizar badge/unread no front.",
      ],
    },
    statusCodes: [
      { code: 200, label: "Conversa atualizada." },
      { code: 401, label: "Sessão obrigatória." },
      { code: 404, label: "Conversa não encontrada." },
      { code: 503, label: "Storage do chat indisponível." },
      { code: 500, label: "Falha ao marcar leitura." },
    ],
    dependencies: [
      {
        kind: "auth",
        name: "Supabase session",
        detail: "Restringe a atualização ao dono da conversa.",
      },
      {
        kind: "storage",
        name: "Support chat storage",
        detail: "Atualiza o estado de leitura da conversa.",
      },
    ],
    monitoring: {
      probeMode: "authenticated",
      checklist: [
        "status code",
        "latência",
        "auth",
        "update de unread/read",
        "storage do chat",
      ],
      note:
        "Como altera estado da inbox, funciona melhor em ambiente controlado ou com fixtures descartáveis para testes sintéticos.",
    },
  },
];

const technicalRoutes: TechnicalRouteSpec[] = [
  {
    id: "auth-callback-get",
    method: "GET",
    path: "/auth/callback",
    summary: "Callback OAuth do Google.",
    description:
      "Troca o code por sessão Supabase, trata conflito de conta existente e redireciona para o destino pós-auth.",
    behavior: "303 redirect para a superfície final de auth/checkout.",
    dependencies: [
      {
        kind: "auth",
        name: "Supabase OAuth exchange",
        detail: "exchangeCodeForSession + recuperação de usuário.",
      },
      {
        kind: "external",
        name: "Google OAuth",
        detail: "Provider que devolve code/error para o callback.",
      },
      {
        kind: "redirect",
        name: "Post-auth destination",
        detail: "Normaliza redirect para /auth ou destino pós-login.",
      },
      {
        kind: "external",
        name: "Resend",
        detail: "Pode disparar e-mail de boas-vindas para fluxo free.",
      },
    ],
    monitoring: {
      probeMode: "redirect_flow",
      checklist: [
        "redirect status",
        "troca de code por sessão",
        "tratamento de conflito de conta",
        "destino final",
      ],
      note:
        "Não é uma API JSON. Requer monitor de fluxo OAuth completo, idealmente com browser automation e conta de teste.",
    },
  },
  {
    id: "auth-reset-session-get",
    method: "GET",
    path: "/auth/reset-session",
    summary: "Encerra a sessão e redireciona para /auth.",
    description:
      "Faz signOut da sessão atual e redireciona com query params explicando o motivo do reset.",
    behavior: "303 redirect para /auth com auth_reason/auth_error.",
    dependencies: [
      {
        kind: "auth",
        name: "Supabase signOut",
        detail: "Encerra a sessão atual do usuário.",
      },
      {
        kind: "redirect",
        name: "/auth",
        detail: "Tela de destino após reset da sessão.",
      },
    ],
    monitoring: {
      probeMode: "redirect_flow",
      checklist: [
        "redirect status",
        "supabase signOut",
        "query params de erro/motivo",
      ],
      note:
        "Também é rota de fluxo, não JSON. O smoke test ideal valida o redirect contract e limpeza real da sessão.",
    },
  },
  {
    id: "billing-checkout-redirect-get",
    method: "GET",
    path: "/billing/checkout",
    summary: "Rota de redirecionamento para billing do workspace.",
    description:
      "Normaliza o plano e redireciona para /workspace/settings/billing?checkout=... com fallback para /auth quando necessário.",
    behavior: "303 redirect para billing do workspace ou fallback com billing_error.",
    dependencies: [
      {
        kind: "redirect",
        name: "/workspace/settings/billing",
        detail: "Destino principal para o billing do produto.",
      },
      {
        kind: "redirect",
        name: "/auth",
        detail: "Fallback quando o plano é inválido ou o fluxo falha.",
      },
    ],
    monitoring: {
      probeMode: "redirect_flow",
      checklist: [
        "redirect status",
        "normalização do plan",
        "fallback com billing_error",
      ],
      note:
        "É basicamente contrato de redirect. Deve ser monitorado por fluxo, não por parsing de payload.",
    },
  },
];

const edgeFunctions = [
  {
    name: "billing-create-checkout",
    detail: "Abre a sessão Stripe de checkout para assinatura.",
    usedBy: ["/api/billing/checkout"],
  },
  {
    name: "billing-create-portal-session",
    detail: "Cria a sessão do customer portal do Stripe.",
    usedBy: ["/api/billing/portal"],
  },
  {
    name: "billing-cancel-subscription",
    detail: "Cancela a assinatura atual no provider.",
    usedBy: ["/api/billing/cancel"],
  },
  {
    name: "billing-sync-subscription",
    detail: "Reconcilia snapshot local com o provider quando sync=1.",
    usedBy: ["/api/billing/status"],
  },
] satisfies ConnectedSystemDependency[];

const rpcs = [
  {
    name: "get_my_billing_snapshot",
    detail: "Snapshot atual de billing usado no app e em fluxos de suporte.",
    usedBy: [
      "/api/billing/status",
      "/api/billing/checkout",
      "/api/billing/cancel",
      "/api/support",
    ],
  },
  {
    name: "upsert_project_step_with_progress",
    detail: "Atualiza passos e progresso de projeto diretamente no app.",
    usedBy: ["App cliente / workspace"],
  },
  {
    name: "start_track_timeline",
    detail: "Inicia timeline de trilha no produto.",
    usedBy: ["App cliente / workspace"],
  },
  {
    name: "pause_track_timeline",
    detail: "Pausa timeline de trilha no produto.",
    usedBy: ["App cliente / workspace"],
  },
  {
    name: "resume_track_timeline",
    detail: "Retoma timeline de trilha no produto.",
    usedBy: ["App cliente / workspace"],
  },
  {
    name: "complete_track_timeline_step",
    detail: "Conclui passo específico da timeline.",
    usedBy: ["App cliente / workspace"],
  },
  {
    name: "complete_track_timeline",
    detail: "Conclui a timeline completa da trilha.",
    usedBy: ["App cliente / workspace"],
  },
  {
    name: "delete_project_step_with_progress",
    detail: "Remove passo/progresso de projeto.",
    usedBy: ["App cliente / workspace"],
  },
] satisfies ConnectedSystemDependency[];

const externalApis = [
  {
    name: "Stripe",
    detail: "Checkout, portal do cliente, sync de assinatura e publishable key.",
    usedBy: [
      "/api/billing/checkout",
      "/api/billing/cancel",
      "/api/billing/portal",
      "/api/billing/status",
      "/api/billing/config",
    ],
  },
  {
    name: "Resend",
    detail: "Entrega dos e-mails de boas-vindas e contatos de suporte.",
    usedBy: ["/api/auth/welcome", "/api/support"],
  },
  {
    name: "ClickUp",
    detail: "Criação best effort de tasks operacionais a partir do suporte.",
    usedBy: ["/api/support"],
  },
] satisfies ConnectedSystemDependency[];

const gaps: string[] = [];

const recommendations: string[] = [];

function countByAuth(auth: ApiAuthMode) {
  return operations.filter((operation) => operation.auth === auth).length;
}

function stripTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function isApiHealthStatus(value: unknown): value is ApiHealthStatus {
  return value === "ok" || value === "degraded" || value === "error";
}

function isProductApiHealthCheckStatus(
  value: unknown,
): value is ProductApiHealthCheckStatus {
  return isApiHealthStatus(value) || value === "skipped";
}

function isProductApiHealthReport(value: unknown): value is ProductApiHealthReport {
  if (!value || typeof value !== "object") {
    return false;
  }

  const report = value as Partial<ProductApiHealthReport>;
  return (
    isApiHealthStatus(report.status) &&
    typeof report.timestamp === "string" &&
    typeof report.summary === "object" &&
    report.summary !== null &&
    typeof report.summary.ok === "number" &&
    typeof report.summary.skipped === "number" &&
    typeof report.summary.degraded === "number" &&
    typeof report.summary.error === "number" &&
    typeof report.checks === "object" &&
    report.checks !== null &&
    isProductApiHealthCheckStatus(report.checks.app?.status) &&
    isProductApiHealthCheckStatus(report.checks.auth?.status) &&
    isProductApiHealthCheckStatus(report.checks.supabase?.status) &&
    isProductApiHealthCheckStatus(report.checks.billing?.status) &&
    isProductApiHealthCheckStatus(report.checks.integrations?.status)
  );
}

async function getLiveHealthSnapshot(): Promise<ProductApiHealthSnapshot> {
  const env = getCommandCenterEnv();

  if (!env.productAppUrl) {
    return {
      state: "unconfigured",
      endpointUrl: null,
      message:
        "Configure PRODUCT_APP_URL no Command Center para consumir o /api/health real do CodeTrailWeb.",
    };
  }

  const endpointUrl = `${stripTrailingSlash(env.productAppUrl)}/api/health`;

  try {
    const response = await fetch(endpointUrl, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(5_000),
    });

    const payload = (await response.json().catch(() => null)) as unknown;

    if (!isProductApiHealthReport(payload)) {
      return {
        state: "unavailable",
        endpointUrl,
        httpStatus: response.status,
        message:
          "O /api/health respondeu, mas o payload não bate com o contrato esperado pelo Command Center.",
      };
    }

    return {
      state: "live",
      endpointUrl,
      httpStatus: response.status,
      report: payload,
      message:
        response.ok
          ? "Health real carregado diretamente do CodeTrailWeb."
          : "O /api/health respondeu com falha crítica ou degradação.",
    };
  } catch (error) {
    return {
      state: "unavailable",
      endpointUrl,
      message:
        error instanceof Error
          ? error.message
          : "Não foi possível alcançar o /api/health do CodeTrailWeb.",
    };
  }
}

export async function getApiCatalogSnapshot(): Promise<ApiCatalogSnapshot> {
  noStore();

  const generatedAt = new Date().toISOString();
  const publicOperations = countByAuth("public");
  const hybridOperations =
    countByAuth("session_or_bearer") + countByAuth("anonymous_or_session");
  const protectedOperations =
    operations.length - publicOperations - hybridOperations;
  const liveHealth = await getLiveHealthSnapshot();

  return {
    generatedAt,
    source: {
      product: "CodeTrailWeb",
      appRouterRoutes: new Set(operations.map((operation) => operation.path)).size,
      httpOperations: operations.length,
      technicalRoutes: technicalRoutes.length,
      hasPagesApi: false,
      hasSwagger: false,
    },
    summary: {
      protectedOperations,
      publicOperations,
      hybridOperations,
      publicProbeCandidates: operations.filter(
        (operation) => operation.monitoring.probeMode === "public",
      ).length,
      authProbeCandidates: operations.filter(
        (operation) => operation.monitoring.probeMode === "authenticated",
      ).length,
      flowOnlyCandidates:
        technicalRoutes.filter(
          (route) => route.monitoring.probeMode === "redirect_flow",
        ).length +
        operations.filter((operation) => operation.monitoring.probeMode === "manual")
          .length,
    },
    groups: [
      { domain: "health", label: "Health", operations: 1 },
      { domain: "auth", label: "Auth", operations: 1 },
      { domain: "billing", label: "Billing", operations: 5 },
      { domain: "privacy", label: "Privacy", operations: 3 },
      { domain: "skillthree", label: "SkillThree", operations: 1 },
      { domain: "support", label: "Support", operations: 6 },
    ],
    operations,
    technicalRoutes,
    edgeFunctions,
    rpcs,
    externalApis,
    liveHealth,
    gaps,
    recommendations,
  };
}
