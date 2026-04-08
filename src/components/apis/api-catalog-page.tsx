"use client";

import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import type {
  ApiAuthMode,
  ApiCatalogSnapshot,
  ApiDependency,
  ApiDependencyKind,
  ApiDomain,
  ApiOperationSpec,
  ApiParameter,
  ApiParameterLocation,
  ApiProbeMode,
  ApiStatusCode,
  TechnicalRouteSpec,
} from "@/lib/api-catalog-data";
import { cn, formatDateTime } from "@/lib/utils";
import { useMemo, useState } from "react";

const domainMeta: Record<ApiDomain, { label: string; icon: string }> = {
  health: { label: "Health", icon: "monitor_heart" },
  auth: { label: "Auth", icon: "lock" },
  billing: { label: "Billing", icon: "payments" },
  privacy: { label: "Privacy", icon: "policy" },
  skillthree: { label: "SkillThree", icon: "military_tech" },
  support: { label: "Support", icon: "support_agent" },
};

const authMeta: Record<ApiAuthMode, string> = {
  public: "Pública",
  session: "Sessão Supabase",
  session_or_bearer: "Sessão ou bearer",
  anonymous_or_session: "Anônimo ou sessão",
};

const probeMeta: Record<
  ApiProbeMode,
  { label: string; className: string; description: string }
> = {
  public: {
    label: "Probe público",
    className:
      "border-[var(--status-green-border)] bg-[var(--status-green-bg)] text-[var(--status-green)]",
    description: "Pode ser monitorado sem sessão.",
  },
  authenticated: {
    label: "Probe autenticado",
    className:
      "border-[var(--status-yellow-border)] bg-[var(--status-yellow-bg)] text-[var(--status-yellow)]",
    description: "Precisa sessão ou token controlado.",
  },
  redirect_flow: {
    label: "Fluxo de redirect",
    className:
      "border-[var(--border-default)] bg-[var(--bg-surface-high)] text-[var(--text-secondary)]",
    description: "Deve ser validado como fluxo, não como JSON.",
  },
  manual: {
    label: "Somente manual",
    className:
      "border-[var(--status-red-border)] bg-[var(--status-red-bg)] text-[var(--status-red)]",
    description: "Ainda sem caminho seguro para probe automático.",
  },
};

const dependencyMeta: Record<ApiDependencyKind, string> = {
  storage: "Storage",
  edge_function: "Edge",
  rpc: "RPC",
  external: "Externo",
  auth: "Auth",
  redirect: "Redirect",
};

const locationLabels: Record<ApiParameterLocation, string> = {
  body: "Body",
  query: "Query",
  path: "Path",
  header: "Header",
};

function getHealthTone(status?: "ok" | "skipped" | "degraded" | "error") {
  if (status === "ok") {
    return {
      label: "OK",
      tone: "good" as const,
      className:
        "border-[var(--status-green-border)] bg-[var(--status-green-bg)] text-[var(--status-green)]",
    };
  }

  if (status === "skipped") {
    return {
      label: "SKIPPED",
      tone: "neutral" as const,
      className:
        "border-[var(--border-neutral)] bg-[var(--bg-surface-high)] text-[var(--text-secondary)]",
    };
  }

  if (status === "error") {
    return {
      label: "ERROR",
      tone: "critical" as const,
      className:
        "border-[var(--status-red-border)] bg-[var(--status-red-bg)] text-[var(--status-red)]",
    };
  }

  return {
    label: "DEGRADED",
    tone: "warning" as const,
    className:
      "border-[var(--status-yellow-border)] bg-[var(--status-yellow-bg)] text-[var(--status-yellow)]",
  };
}

function SummaryCard({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "neutral" | "good" | "warning" | "critical";
}) {
  const toneClass =
    tone === "good"
      ? "border-[var(--status-green-border)]"
      : tone === "critical"
        ? "border-[var(--status-red-border)]"
      : tone === "warning"
        ? "border-[var(--status-yellow-border)]"
        : "border-[var(--border-neutral)]";

  return (
    <article
      className={cn(
        "rounded-xl border bg-[var(--bg-surface-container)] p-5 shadow-[var(--shadow-card)]",
        toneClass,
      )}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-quaternary)]">
        {label}
      </p>
      <p className="mt-3 text-3xl font-black tracking-tight text-[var(--text-primary)]">
        {value}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-[var(--text-tertiary)]">{hint}</p>
    </article>
  );
}

function MethodBadge({ method }: { method: ApiOperationSpec["method"] }) {
  const className =
    method === "GET"
      ? "border-[var(--status-green-border)] bg-[var(--status-green-bg)] text-[var(--status-green)]"
      : "border-[var(--accent)]/20 bg-[var(--accent)]/10 text-[var(--accent)]";

  return (
    <span
      className={cn(
        "inline-flex min-w-14 justify-center rounded-lg border px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.14em]",
        className,
      )}
    >
      {method}
    </span>
  );
}

function StatusCodeBadge({ status }: { status: ApiStatusCode }) {
  const toneClass =
    status.code < 300
      ? "border-[var(--status-green-border)] bg-[var(--status-green-bg)] text-[var(--status-green)]"
      : status.code < 500
        ? "border-[var(--status-yellow-border)] bg-[var(--status-yellow-bg)] text-[var(--status-yellow)]"
        : "border-[var(--status-red-border)] bg-[var(--status-red-bg)] text-[var(--status-red)]";

  return (
    <span
      title={status.label}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold",
        toneClass,
      )}
    >
      {status.code}
    </span>
  );
}

function ParameterGroup({
  title,
  items,
}: {
  title: string;
  items: ApiParameter[];
}) {
  if (!items.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-[var(--border-neutral)] bg-black/20 p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-quaternary)]">
        {title}
      </p>
      <div className="mt-3 space-y-3">
        {items.map((item) => (
          <div
            key={`${title}-${item.name}`}
            className="rounded-lg border border-[var(--border-neutral)] bg-[var(--bg-surface-high)] px-3 py-2.5"
          >
            <div className="flex flex-wrap items-center gap-2">
              <code className="text-sm font-semibold text-[var(--accent)]">{item.name}</code>
              <span className="text-[11px] text-[var(--text-secondary)]">{item.type}</span>
              {item.required ? (
                <span className="rounded-full bg-[var(--status-red-bg)] px-2 py-0.5 text-[10px] font-bold text-[var(--status-red)]">
                  obrigatório
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-[var(--text-tertiary)]">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DependencyList({ items }: { items: ApiDependency[] }) {
  return (
    <div className="space-y-3">
      {items.map((dependency) => (
        <div
          key={`${dependency.kind}-${dependency.name}`}
          className="rounded-xl border border-[var(--border-neutral)] bg-black/20 p-4"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[var(--border-neutral)] bg-[var(--bg-surface-high)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
              {dependencyMeta[dependency.kind]}
            </span>
            <p className="text-sm font-semibold text-[var(--text-primary)]">{dependency.name}</p>
          </div>
          <p className="mt-2 text-sm text-[var(--text-tertiary)]">{dependency.detail}</p>
        </div>
      ))}
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border px-3 py-2 text-xs font-bold transition-colors",
        active
          ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
          : "border-[var(--border-neutral)] bg-[var(--bg-surface-high)] text-[var(--text-secondary)] hover:border-[var(--border-default)] hover:text-[var(--text-primary)]",
      )}
    >
      {children}
    </button>
  );
}

function OperationCard({ operation }: { operation: ApiOperationSpec }) {
  const groupedParameters = {
    body: operation.parameters.filter((item) => item.location === "body"),
    query: operation.parameters.filter((item) => item.location === "query"),
    path: operation.parameters.filter((item) => item.location === "path"),
    header: operation.parameters.filter((item) => item.location === "header"),
  };

  return (
    <details className="overflow-hidden rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-low)] shadow-[var(--shadow-card)]">
      <summary className="cursor-pointer list-none p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <MethodBadge method={operation.method} />
              <code className="rounded-lg bg-black/30 px-3 py-1.5 text-sm font-semibold text-[var(--accent)]">
                {operation.path}
              </code>
              <span className="rounded-full border border-[var(--border-neutral)] px-2.5 py-1 text-[11px] font-bold text-[var(--text-secondary)]">
                {domainMeta[operation.domain].label}
              </span>
            </div>
            <div>
              <h4 className="text-base font-bold text-[var(--text-primary)]">
                {operation.summary}
              </h4>
              <p className="mt-1 max-w-3xl text-sm leading-relaxed text-[var(--text-tertiary)]">
                {operation.description}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-[var(--border-neutral)] bg-[var(--bg-surface-high)] px-3 py-1 text-[11px] font-bold text-[var(--text-secondary)]">
              {authMeta[operation.auth]}
            </span>
            <span
              className={cn(
                "rounded-full border px-3 py-1 text-[11px] font-bold",
                probeMeta[operation.monitoring.probeMode].className,
              )}
            >
              {probeMeta[operation.monitoring.probeMode].label}
            </span>
          </div>
        </div>
      </summary>

      <div className="border-t border-[var(--border-neutral)] p-5">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.95fr)]">
          <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {(["body", "query", "path", "header"] as ApiParameterLocation[]).map(
                (location) => (
                  <ParameterGroup
                    key={location}
                    title={locationLabels[location]}
                    items={groupedParameters[location]}
                  />
                ),
              )}
            </div>

            {!operation.parameters.length ? (
              <div className="rounded-xl border border-[var(--border-neutral)] bg-black/20 p-4 text-sm text-[var(--text-tertiary)]">
                Esta operação não exige parâmetros explícitos além do contexto de autenticação.
              </div>
            ) : null}

            <div className="rounded-xl border border-[var(--border-neutral)] bg-black/20 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-quaternary)]">
                Response
              </p>
              <code className="mt-3 block rounded-lg border border-[var(--border-neutral)] bg-[var(--bg-surface-high)] px-3 py-3 text-sm text-[var(--accent)]">
                {operation.response.success}
              </code>
              {operation.response.notes?.length ? (
                <ul className="mt-3 space-y-2 text-sm text-[var(--text-tertiary)]">
                  {operation.response.notes.map((note) => (
                    <li key={note} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="rounded-xl border border-[var(--border-neutral)] bg-black/20 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-quaternary)]">
                Status Codes
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {operation.statusCodes.map((status) => (
                  <StatusCodeBadge key={`${operation.id}-${status.code}`} status={status} />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-[var(--border-neutral)] bg-black/20 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-quaternary)]">
                  Estratégia de monitoramento
                </p>
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[10px] font-bold",
                    probeMeta[operation.monitoring.probeMode].className,
                  )}
                >
                  {probeMeta[operation.monitoring.probeMode].label}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-tertiary)]">
                {operation.monitoring.note}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {operation.monitoring.checklist.map((item) => (
                  <span
                    key={`${operation.id}-${item}`}
                    className="rounded-full border border-[var(--border-neutral)] bg-[var(--bg-surface-high)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-secondary)]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border-neutral)] bg-black/20 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-quaternary)]">
                Dependências
              </p>
              <div className="mt-3">
                <DependencyList items={operation.dependencies} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </details>
  );
}

function TechnicalRouteCard({ route }: { route: TechnicalRouteSpec }) {
  return (
    <article className="rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-low)] p-5 shadow-[var(--shadow-card)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <MethodBadge method={route.method} />
            <code className="rounded-lg bg-black/30 px-3 py-1.5 text-sm font-semibold text-[var(--accent)]">
              {route.path}
            </code>
          </div>
          <h4 className="text-base font-bold text-[var(--text-primary)]">{route.summary}</h4>
          <p className="text-sm text-[var(--text-tertiary)]">{route.description}</p>
          <p className="text-sm text-[var(--text-secondary)]">{route.behavior}</p>
        </div>
        <span
          className={cn(
            "rounded-full border px-3 py-1 text-[11px] font-bold",
            probeMeta[route.monitoring.probeMode].className,
          )}
        >
          {probeMeta[route.monitoring.probeMode].label}
        </span>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="rounded-xl border border-[var(--border-neutral)] bg-black/20 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-quaternary)]">
            Checklist do fluxo
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {route.monitoring.checklist.map((item) => (
              <span
                key={`${route.id}-${item}`}
                className="rounded-full border border-[var(--border-neutral)] bg-[var(--bg-surface-high)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-secondary)]"
              >
                {item}
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm text-[var(--text-tertiary)]">{route.monitoring.note}</p>
        </div>
        <div className="rounded-xl border border-[var(--border-neutral)] bg-black/20 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-quaternary)]">
            Dependências
          </p>
          <div className="mt-3">
            <DependencyList items={route.dependencies} />
          </div>
        </div>
      </div>
    </article>
  );
}

function HealthCheckCard({
  label,
  summary,
  status,
  critical,
  errorCategory,
}: {
  label: string;
  summary: string;
  status: "ok" | "skipped" | "degraded" | "error";
  critical: boolean;
  errorCategory?: string;
}) {
  const tone = getHealthTone(status);

  return (
    <div className="rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-low)] p-4 shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-bold text-[var(--text-primary)]">{label}</p>
        <div className="flex flex-wrap gap-2">
          <span className={cn("rounded-full border px-2.5 py-1 text-[10px] font-bold", tone.className)}>
            {tone.label}
          </span>
          {critical ? (
            <span className="rounded-full border border-[var(--border-neutral)] bg-[var(--bg-surface-high)] px-2.5 py-1 text-[10px] font-bold text-[var(--text-secondary)]">
              crítico
            </span>
          ) : null}
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-[var(--text-tertiary)]">{summary}</p>
      {errorCategory ? (
        <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--text-quaternary)]">
          categoria: {errorCategory}
        </p>
      ) : null}
    </div>
  );
}

export function ApiCatalogPage({ snapshot }: { snapshot: ApiCatalogSnapshot }) {
  const [search, setSearch] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<ApiDomain | "all">("all");
  const [selectedAuth, setSelectedAuth] = useState<ApiAuthMode | "all">("all");

  const filteredOperations = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return snapshot.operations.filter((operation) => {
      const matchesDomain =
        selectedDomain === "all" || operation.domain === selectedDomain;
      const matchesAuth = selectedAuth === "all" || operation.auth === selectedAuth;
      const haystack = [
        operation.path,
        operation.summary,
        operation.description,
        ...operation.tags,
      ]
        .join(" ")
        .toLowerCase();
      const matchesSearch =
        !normalizedSearch || haystack.includes(normalizedSearch);

      return matchesDomain && matchesAuth && matchesSearch;
    });
  }, [search, selectedAuth, selectedDomain, snapshot.operations]);

  const groupedOperations = useMemo(
    () =>
      snapshot.groups
        .map((group) => ({
          ...group,
          items: filteredOperations.filter((operation) => operation.domain === group.domain),
        }))
        .filter((group) => group.items.length > 0),
    [filteredOperations, snapshot.groups],
  );

  const publicOrHybrid =
    snapshot.summary.publicOperations + snapshot.summary.hybridOperations;
  const liveHealthTone = snapshot.liveHealth.report
    ? getHealthTone(snapshot.liveHealth.report.status)
    : null;
  const liveHealthValue = snapshot.liveHealth.report
    ? liveHealthTone?.label ?? "LIVE"
    : snapshot.liveHealth.state === "unconfigured"
      ? "PENDENTE"
      : "SEM LINK";

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="CodeTrailWeb API Surface"
        title="Swagger Operacional das APIs"
        description="Catálogo das APIs do produto com foco em contrato, autenticação, dependências e prontidão de monitoramento. Agora a tela também consegue consumir o health consolidado real do CodeTrailWeb quando a URL do produto está configurada."
        meta={[
          {
            label: "Operações",
            value: `${snapshot.source.httpOperations} HTTP`,
          },
          {
            label: "Rotas App Router",
            value: `${snapshot.source.appRouterRoutes} /app/api`,
          },
          {
            label: "Rotas técnicas",
            value: `${snapshot.source.technicalRoutes} fora de /api`,
          },
          {
            label: "Healthcheck global",
            value: "presente",
            tone: "good",
          },
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-4">
        <SummaryCard
          label="Operações protegidas"
          value={String(snapshot.summary.protectedOperations)}
          hint="Exigem sessão Supabase para leitura ou escrita."
          tone="warning"
        />
        <SummaryCard
          label="Superfície pública/híbrida"
          value={String(publicOrHybrid)}
          hint="Rotas que podem ser acessadas sem sessão obrigatória ou com bearer alternativo."
          tone="good"
        />
        <SummaryCard
          label="Probes públicos"
          value={String(snapshot.summary.publicProbeCandidates)}
          hint="Agora o produto tem /api/health consolidado e /api/billing/config para probes públicos."
          tone="good"
        />
        <SummaryCard
          label="Health ao vivo"
          value={liveHealthValue}
          hint={
            snapshot.liveHealth.report
              ? `${snapshot.liveHealth.message} Última leitura em ${formatDateTime(snapshot.liveHealth.report.timestamp)}.`
              : snapshot.liveHealth.message
          }
          tone={liveHealthTone?.tone ?? "warning"}
        />
      </div>

      <SectionCard
        title="Health real do produto"
        subtitle="Consumo opcional do /api/health do CodeTrailWeb para mostrar o estado operacional consolidado já no Command Center."
      >
        {snapshot.liveHealth.report ? (
          <div className="space-y-5">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
              <div className="rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-low)] p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full border px-3 py-1 text-[11px] font-bold",
                      liveHealthTone?.className,
                    )}
                  >
                    {liveHealthTone?.label}
                  </span>
                  <span className="rounded-full border border-[var(--border-neutral)] bg-[var(--bg-surface-high)] px-3 py-1 text-[11px] font-bold text-[var(--text-secondary)]">
                    HTTP {snapshot.liveHealth.httpStatus ?? 200}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-[var(--text-tertiary)]">
                  {snapshot.liveHealth.message}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <code className="rounded-full border border-[var(--border-neutral)] bg-[var(--bg-surface-high)] px-2.5 py-1 text-[11px] text-[var(--text-secondary)]">
                    {snapshot.liveHealth.endpointUrl}
                  </code>
                  {snapshot.liveHealth.report.requestId ? (
                    <code className="rounded-full border border-[var(--border-neutral)] bg-[var(--bg-surface-high)] px-2.5 py-1 text-[11px] text-[var(--text-secondary)]">
                      requestId: {snapshot.liveHealth.report.requestId}
                    </code>
                  ) : null}
                  {typeof snapshot.liveHealth.report.durationMs === "number" ? (
                    <code className="rounded-full border border-[var(--border-neutral)] bg-[var(--bg-surface-high)] px-2.5 py-1 text-[11px] text-[var(--text-secondary)]">
                      {snapshot.liveHealth.report.durationMs} ms
                    </code>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <SummaryCard
                  label="Checks OK"
                  value={String(snapshot.liveHealth.report.summary.ok)}
                  hint="Checks sem degradação."
                  tone="good"
                />
                <SummaryCard
                  label="Checks pulados"
                  value={String(snapshot.liveHealth.report.summary.skipped)}
                  hint="Probes opcionais não executados neste ambiente."
                />
                <SummaryCard
                  label="Checks degradados"
                  value={String(snapshot.liveHealth.report.summary.degraded)}
                  hint="Checks que responderam, mas com limitação."
                  tone="warning"
                />
                <SummaryCard
                  label="Checks com erro"
                  value={String(snapshot.liveHealth.report.summary.error)}
                  hint="Checks críticos ou auxiliares em erro."
                  tone={snapshot.liveHealth.report.summary.error > 0 ? "critical" : "neutral"}
                />
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-5">
              <HealthCheckCard
                label="App"
                summary={snapshot.liveHealth.report.checks.app.summary}
                status={snapshot.liveHealth.report.checks.app.status}
                critical={snapshot.liveHealth.report.checks.app.critical}
                errorCategory={snapshot.liveHealth.report.checks.app.errorCategory}
              />
              <HealthCheckCard
                label="Auth"
                summary={snapshot.liveHealth.report.checks.auth.summary}
                status={snapshot.liveHealth.report.checks.auth.status}
                critical={snapshot.liveHealth.report.checks.auth.critical}
                errorCategory={snapshot.liveHealth.report.checks.auth.errorCategory}
              />
              <HealthCheckCard
                label="Supabase"
                summary={snapshot.liveHealth.report.checks.supabase.summary}
                status={snapshot.liveHealth.report.checks.supabase.status}
                critical={snapshot.liveHealth.report.checks.supabase.critical}
                errorCategory={snapshot.liveHealth.report.checks.supabase.errorCategory}
              />
              <HealthCheckCard
                label="Billing"
                summary={snapshot.liveHealth.report.checks.billing.summary}
                status={snapshot.liveHealth.report.checks.billing.status}
                critical={snapshot.liveHealth.report.checks.billing.critical}
                errorCategory={snapshot.liveHealth.report.checks.billing.errorCategory}
              />
              <HealthCheckCard
                label="Integrações"
                summary={snapshot.liveHealth.report.checks.integrations.summary}
                status={snapshot.liveHealth.report.checks.integrations.status}
                critical={snapshot.liveHealth.report.checks.integrations.critical}
                errorCategory={snapshot.liveHealth.report.checks.integrations.errorCategory}
              />
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-[var(--status-yellow-border)] bg-[var(--status-yellow-bg)]/20 p-5">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {snapshot.liveHealth.state === "unconfigured"
                ? "Health real ainda não conectado"
                : "Health real indisponível neste momento"}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-tertiary)]">
              {snapshot.liveHealth.message}
            </p>
            {snapshot.liveHealth.endpointUrl ? (
              <code className="mt-4 inline-flex rounded-full border border-[var(--border-neutral)] bg-[var(--bg-surface-high)] px-2.5 py-1 text-[11px] text-[var(--text-secondary)]">
                {snapshot.liveHealth.endpointUrl}
              </code>
            ) : null}
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Leitura operacional"
        subtitle="O que este módulo consegue dizer hoje sobre a superfície de APIs e observabilidade."
      >
        <div className="grid gap-4 xl:grid-cols-3">
          <div className="rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-low)] p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-quaternary)]">
              Cobertura atual
            </p>
            <div className="mt-4 space-y-3 text-sm text-[var(--text-tertiary)]">
              <p>
                O catálogo cobre <strong className="text-[var(--text-primary)]">o que cada rota faz</strong>, auth, payload, retorno e dependências.
              </p>
              <p>
                O produto já expõe <strong className="text-[var(--text-primary)]">/api/health consolidado</strong> e melhorou a categorização de falhas do SkillThree leaderboard.
              </p>
              <p>
                Resultado: a documentação ficou alinhada ao backend novo, mas rotas autenticadas ainda dependem de probes dedicados e histórico separado.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-low)] p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-quaternary)]">
              Modos de probe
            </p>
            <div className="mt-4 space-y-3">
              {Object.values(probeMeta).map((meta) => (
                <div
                  key={meta.label}
                  className="rounded-xl border border-[var(--border-neutral)] bg-black/20 p-3"
                >
                  <span className={cn("rounded-full border px-2.5 py-1 text-[10px] font-bold", meta.className)}>
                    {meta.label}
                  </span>
                  <p className="mt-2 text-sm text-[var(--text-tertiary)]">{meta.description}</p>
                </div>
              ))}
            </div>
          </div>

          {snapshot.gaps.length ? (
            <div className="rounded-xl border border-[var(--status-yellow-border)] bg-[var(--status-yellow-bg)]/20 p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-quaternary)]">
                Pendências restantes
              </p>
              <ul className="mt-4 space-y-3 text-sm text-[var(--text-secondary)]">
                {snapshot.gaps.map((gap) => (
                  <li key={gap} className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--status-yellow)]" />
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="rounded-xl border border-[var(--status-green-border)] bg-[var(--status-green-bg)]/20 p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-quaternary)]">
                Pendências restantes
              </p>
              <p className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)]">
                Não há pendências operacionais abertas neste módulo no momento.
              </p>
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard
        title="Catálogo de endpoints"
        subtitle="Superfície interna em formato Swagger-like, com filtros por domínio e autenticação."
        action={
          <span className="text-xs font-medium text-[var(--text-tertiary)]">
            {filteredOperations.length} de {snapshot.operations.length} operações
          </span>
        }
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)]">
          <div className="rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-low)] p-4">
            <label
              htmlFor="api-search"
              className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-quaternary)]"
            >
              Buscar por path, resumo ou tag
            </label>
            <input
              id="api-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Ex.: billing, support chat, /api/privacy..."
              className="mt-3 w-full rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-high)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-placeholder)] focus:border-[var(--accent)]"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-low)] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-quaternary)]">
                Domínio
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <FilterButton active={selectedDomain === "all"} onClick={() => setSelectedDomain("all")}>
                  Todos
                </FilterButton>
                {snapshot.groups.map((group) => (
                  <FilterButton
                    key={group.domain}
                    active={selectedDomain === group.domain}
                    onClick={() => setSelectedDomain(group.domain)}
                  >
                    {group.label}
                  </FilterButton>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-low)] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-quaternary)]">
                Auth
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <FilterButton active={selectedAuth === "all"} onClick={() => setSelectedAuth("all")}>
                  Todos
                </FilterButton>
                {(Object.entries(authMeta) as Array<[ApiAuthMode, string]>).map(([key, label]) => (
                  <FilterButton
                    key={key}
                    active={selectedAuth === key}
                    onClick={() => setSelectedAuth(key)}
                  >
                    {label}
                  </FilterButton>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {groupedOperations.length ? (
            groupedOperations.map((group) => (
              <div key={group.domain} className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="material-symbols-outlined text-[18px] text-[var(--accent)]">
                    {domainMeta[group.domain].icon}
                  </span>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    {group.label}
                  </h3>
                  <span className="text-xs text-[var(--text-tertiary)]">
                    {group.items.length} operação(ões)
                  </span>
                </div>
                <div className="space-y-3">
                  {group.items.map((operation) => (
                    <OperationCard key={operation.id} operation={operation} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-[var(--border-default)] bg-[var(--bg-surface-low)] p-8 text-center text-sm text-[var(--text-tertiary)]">
              Nenhum endpoint encontrado para os filtros atuais.
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard
        title="Rotas técnicas fora de /api"
        subtitle="Fluxos de redirect e callback que também impactam a operação do produto."
      >
        <div className="space-y-4">
          {snapshot.technicalRoutes.map((route) => (
            <TechnicalRouteCard key={route.id} route={route} />
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Integrações conectadas"
        subtitle="Dependências que entram nesta superfície operacional além das rotas HTTP."
      >
        <div className="grid gap-4 xl:grid-cols-3">
          {[
            {
              title: "Supabase Edge Functions",
              items: snapshot.edgeFunctions,
            },
            {
              title: "Supabase RPCs",
              items: snapshot.rpcs,
            },
            {
              title: "APIs externas",
              items: snapshot.externalApis,
            },
          ].map((section) => (
            <div
              key={section.title}
              className="rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-low)] p-5"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-quaternary)]">
                {section.title}
              </p>
              <div className="mt-4 space-y-3">
                {section.items.map((item) => (
                  <div
                    key={`${section.title}-${item.name}`}
                    className="rounded-xl border border-[var(--border-neutral)] bg-black/20 p-4"
                  >
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {item.name}
                    </p>
                    <p className="mt-1 text-sm text-[var(--text-tertiary)]">{item.detail}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.usedBy.map((usage) => (
                        <code
                          key={`${item.name}-${usage}`}
                          className="rounded-full border border-[var(--border-neutral)] bg-[var(--bg-surface-high)] px-2.5 py-1 text-[11px] text-[var(--text-secondary)]"
                        >
                          {usage}
                        </code>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {snapshot.recommendations.length ? (
        <SectionCard
          title="Próximos passos recomendados"
          subtitle="Sequência enxuta para transformar este catálogo em uma superfície real de health e alerting."
        >
          <div className="grid gap-4 xl:grid-cols-2">
            {snapshot.recommendations.map((recommendation, index) => (
              <div
                key={recommendation}
                className="rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-low)] p-5"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-quaternary)]">
                  Passo {index + 1}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {recommendation}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>
      ) : null}
    </div>
  );
}
