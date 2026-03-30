import { IncidentConsole } from "@/components/forms/incident-console";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatusPill } from "@/components/ui/status-pill";
import { GlassCard } from "@/components/ui/glass-card";
import { StatCard } from "@/components/ui/stat-card";
import { getAdminAccess } from "@/lib/auth";
import { getCommandCenterSnapshot } from "@/lib/command-center-data";
import { formatRelativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function IncidentsPage() {
  const [snapshot, access] = await Promise.all([
    getCommandCenterSnapshot(),
    getAdminAccess(),
  ]);
  const critical = snapshot.incidents.filter(
    (incident) => incident.severity === "critical",
  ).length;
  const warnings = snapshot.incidents.filter(
    (incident) => incident.severity === "warning",
  ).length;
  const openCount = snapshot.incidents.filter(
    (incident) => incident.status !== "resolved",
  ).length;
  const resolvedCount = snapshot.incidents.filter(
    (incident) => incident.status === "resolved",
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Alertas"
        title="Fila de incidentes e investigações"
        description="Tudo que o time precisa para priorizar falhas de sync, degradação de app e risco operacional por usuário."
        meta={[
          { label: "críticos", value: String(critical) },
          { label: "warnings", value: String(warnings) },
          { label: "abertos", value: String(openCount) },
        ]}
      />

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <GlassCard className="p-6">
          <StatCard
            label="Incidentes Críticos"
            value={String(critical)}
            delta={critical > 0 ? "Requer ação" : "Sem alertas"}
            deltaColor={critical > 0 ? "rose" : "emerald"}
            progress={critical > 0 ? 100 : 0}
          />
        </GlassCard>
        <GlassCard className="p-6">
          <StatCard
            label="Avisos Ativos"
            value={String(warnings)}
            delta={`${Math.round((warnings / Math.max(openCount, 1)) * 100)}% dos abertos`}
            deltaColor="amber"
            progress={Math.round((warnings / Math.max(openCount, 1)) * 100)}
          />
        </GlassCard>
        <GlassCard className="p-6">
          <StatCard
            label="Incidentes Abertos"
            value={String(openCount)}
            delta={`${resolvedCount} resolvidos hoje`}
            deltaColor="cyan"
          />
        </GlassCard>
        <GlassCard className="p-6">
          <StatCard
            label="Taxa de Resolução"
            value={`${resolvedCount > 0 ? Math.round((resolvedCount / (resolvedCount + openCount)) * 100) : 0}%`}
            delta="Últimas 24h"
            deltaColor="emerald"
            progress={resolvedCount > 0 ? Math.round((resolvedCount / (resolvedCount + openCount)) * 100) : 0}
          />
        </GlassCard>
      </div>

      <SectionCard
        title="Console de incidentes"
        subtitle="Registre, relacione, atualize e remova incidentes sem sair do painel."
      >
        <IncidentConsole
          incidents={snapshot.incidents}
          users={snapshot.users}
          instances={snapshot.fleet}
          currentRole={access?.profile?.role ?? "viewer"}
        />
      </SectionCard>

      <SectionCard
        title="Radar rápido"
        subtitle="Leitura enxuta dos incidentes mais quentes da fila atual."
      >
        <div className="grid gap-4 xl:grid-cols-3">
          {snapshot.incidents.length ? (
            snapshot.incidents.slice(0, 3).map((incident) => (
              <article
                key={incident.id}
                className="rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-low)] p-4 transition-all duration-200 hover:border-[var(--border-default)] hover:bg-[var(--bg-surface-high)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-[var(--text-primary)]">
                        {incident.title}
                      </p>
                      <StatusPill value={incident.severity} />
                    </div>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      {incident.source} · aberto {formatRelativeTime(incident.openedAt)}
                    </p>
                  </div>
                  <StatusPill value={incident.status} />
                </div>
                <p className="mt-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                  {incident.summary}
                </p>
              </article>
            ))
          ) : (
            <div className="rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-low)] p-8 text-sm text-[var(--text-tertiary)] xl:col-span-3 text-center">
              Nenhum incidente operacional aberto no momento.
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
