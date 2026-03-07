import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatusPill } from "@/components/ui/status-pill";
import { getCommandCenterSnapshot } from "@/lib/command-center-data";
import { formatRelativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function IncidentsPage() {
  const snapshot = await getCommandCenterSnapshot();
  const critical = snapshot.incidents.filter(
    (incident) => incident.severity === "critical",
  ).length;
  const warnings = snapshot.incidents.filter(
    (incident) => incident.severity === "warning",
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
        ]}
      />

      <SectionCard
        title="Incidentes abertos"
        subtitle="Mistura de eventos persistidos e alertas derivados do estado atual."
      >
        <div className="space-y-4">
          {snapshot.incidents.map((incident) => (
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
                    <StatusPill value={incident.status} />
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {incident.source} · aberto {formatRelativeTime(incident.openedAt)}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-[var(--text-secondary)]">
                {incident.summary}
              </p>
              <div className="mt-4 rounded-2xl border border-[var(--stroke-strong)] bg-[rgba(99,179,255,0.08)] p-4 text-sm text-white">
                {incident.action}
              </div>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
