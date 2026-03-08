import { IncidentConsole } from "@/components/forms/incident-console";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatusPill } from "@/components/ui/status-pill";
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

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Alertas"
        title="Fila de incidentes e investigacoes"
        description="Tudo que o time precisa para priorizar falhas de sync, degradacao de app e risco operacional por usuario."
        meta={[
          { label: "criticos", value: String(critical) },
          { label: "warnings", value: String(warnings) },
          { label: "abertos", value: String(openCount) },
        ]}
      />

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
        title="Radar rapido"
        subtitle="Leitura enxuta dos incidentes mais quentes da fila atual."
      >
        <div className="grid gap-4 xl:grid-cols-3">
          {snapshot.incidents.length ? (
            snapshot.incidents.slice(0, 3).map((incident) => (
              <article
                key={incident.id}
                className="rounded-3xl border border-white/8 bg-black/10 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold text-white">
                        {incident.title}
                      </p>
                      <StatusPill value={incident.severity} />
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {incident.source} · aberto {formatRelativeTime(incident.openedAt)}
                    </p>
                  </div>
                  <StatusPill value={incident.status} />
                </div>
                <p className="mt-4 text-sm text-[var(--text-secondary)]">
                  {incident.summary}
                </p>
              </article>
            ))
          ) : (
            <div className="rounded-3xl border border-white/8 bg-black/10 p-5 text-sm text-[var(--text-secondary)] xl:col-span-3">
              Nenhum incidente operacional aberto no momento.
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
