import { ActivityChart } from "@/components/charts/activity-chart";
import { DatabaseChart } from "@/components/charts/database-chart";
import { FleetChart } from "@/components/charts/fleet-chart";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatusPill } from "@/components/ui/status-pill";
import { getCommandCenterSnapshot } from "@/lib/command-center-data";
import {
  formatDateTime,
  formatPercent,
  formatRelativeTime,
  platformLabel,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const snapshot = await getCommandCenterSnapshot();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Visao operacional"
        title="Command Center do ecossistema CodeTrail"
        description="Painel unico para acompanhar usuarios, fila de sincronizacao, saude dos apps e heartbeat do ambiente Windows."
        meta={[
          {
            label: snapshot.mode === "supabase" ? "modo live" : "status",
            value:
              snapshot.mode === "supabase"
                ? "dados reais conectados"
                : "aguardando fontes operacionais",
          },
          {
            label: "atualizado",
            value: formatDateTime(snapshot.generatedAt),
          },
        ]}
      />

      <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {snapshot.metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <SectionCard
          title="Movimento dos ultimos 7 dias"
          subtitle="Sessoes registradas, usuarios ativos e calor da fila de sync."
        >
          <ActivityChart data={snapshot.activity} />
        </SectionCard>

        <SectionCard
          title="Saude da frota"
          subtitle="Leitura agregada por plataforma, usuarios ativos e pressao de backlog."
        >
          <FleetChart data={snapshot.platforms} />
        </SectionCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_1fr_1fr]">
        <SectionCard
          title="Usuarios em atencao"
          subtitle="Quem merece follow-up do time ainda hoje."
        >
          <div className="space-y-3">
            {snapshot.users.length ? (
              snapshot.users.slice(0, 5).map((user) => (
                <div
                  key={user.id}
                  className="rounded-3xl border border-white/8 bg-black/10 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-white">{user.name}</p>
                      <p className="mt-1 text-xs text-[var(--text-secondary)]">
                        {user.trackName} · {user.desiredArea}
                      </p>
                    </div>
                    <StatusPill value={user.riskLevel} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--text-secondary)]">
                    <span>{user.pendingSync} item(ns) na fila</span>
                    <span>{user.weeklyHours.toFixed(1)}h na semana</span>
                    <span>visto {formatRelativeTime(user.lastSeenAt)}</span>
                  </div>
                  <p className="mt-3 text-sm text-[var(--text-secondary)]">
                    {user.internalNote}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-white/8 bg-black/10 p-4 text-sm text-[var(--text-secondary)]">
                Nenhum usuario operacional carregado ainda.
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Banco de dados"
          subtitle="Leitura rapida das tabelas mais sensiveis para a operacao."
        >
          <DatabaseChart data={snapshot.database} />
        </SectionCard>

        <SectionCard
          title="Incidentes ativos"
          subtitle="Alertas persistidos ou derivados da operacao atual."
        >
          <div className="space-y-3">
            {snapshot.incidents.length ? (
              snapshot.incidents.map((incident) => (
                <div
                  key={incident.id}
                  className="rounded-3xl border border-white/8 bg-black/10 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {incident.title}
                      </p>
                      <p className="mt-1 text-xs text-[var(--text-secondary)]">
                        {incident.source} · aberto {formatRelativeTime(incident.openedAt)}
                      </p>
                    </div>
                    <StatusPill value={incident.severity} />
                  </div>
                  <p className="mt-3 text-sm text-[var(--text-secondary)]">
                    {incident.summary}
                  </p>
                  <p className="mt-3 text-xs uppercase tracking-[0.24em] text-[var(--accent)]">
                    {incident.action}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-white/8 bg-black/10 p-4 text-sm text-[var(--text-secondary)]">
                Nenhum incidente operacional aberto no momento.
              </div>
            )}
          </div>
        </SectionCard>
      </section>

      <SectionCard
        title="Radar de releases"
        subtitle="As versoes ativas do ecossistema e onde a operacao deve concentrar atencao."
      >
        <div className="grid gap-4 xl:grid-cols-3">
          {snapshot.releases.length ? (
            snapshot.releases.slice(0, 6).map((release) => (
              <article
                key={release.id}
                className="rounded-3xl border border-white/8 bg-black/10 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {platformLabel(release.platform)} · {release.version}
                    </p>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      {release.environments.join(", ")} · visto{" "}
                      {formatRelativeTime(release.lastSeenAt)}
                    </p>
                  </div>
                  <StatusPill value={release.health} />
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-xs text-[var(--text-secondary)]">
                  <span>{release.instances} instancia(s)</span>
                  <span>{release.activeUsers} usuarios</span>
                  <span>{release.pendingSync} pendencias</span>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-3xl border border-white/8 bg-black/10 p-4 text-sm text-[var(--text-secondary)] xl:col-span-3">
              Nenhuma release esta sendo observada ainda.
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard
        title="Radar de servicos"
        subtitle="Cada instancia vista pelo Command Center e sua telemetria mais recente."
      >
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
          {snapshot.fleet.length ? (
            snapshot.fleet.map((node) => (
              <article
                key={node.id}
                className="rounded-3xl border border-white/8 bg-black/10 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{node.label}</p>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      {platformLabel(node.platform)} · {node.environment}
                    </p>
                  </div>
                  <StatusPill value={node.status} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-white/4 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                      versao
                    </p>
                    <p className="mt-2 font-medium text-white">{node.version}</p>
                  </div>
                  <div className="rounded-2xl bg-white/4 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                      uptime
                    </p>
                    <p className="mt-2 font-medium text-white">
                      {formatPercent(node.uptimePercent)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-xs text-[var(--text-secondary)]">
                  <span>{node.activeUsers} usuarios ativos</span>
                  <span>{node.pendingSync} pendencias</span>
                  <span>visto {formatRelativeTime(node.lastSeenAt)}</span>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-3xl border border-white/8 bg-black/10 p-4 text-sm text-[var(--text-secondary)] lg:col-span-2 2xl:col-span-4">
              Nenhuma instancia reportou heartbeat ainda.
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
