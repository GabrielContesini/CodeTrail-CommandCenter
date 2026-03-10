import { ActivityChart } from "@/components/charts/activity-chart";
import { DatabaseChart } from "@/components/charts/database-chart";
import { FleetChart } from "@/components/charts/fleet-chart";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatusPill } from "@/components/ui/status-pill";
import { getCommandCenterSnapshot } from "@/lib/command-center-data";
import {
  cn,
  formatDateTime,
  formatPercent,
  formatRelativeTime,
  platformLabel,
} from "@/lib/utils";

import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function OverviewPage(
  props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }
) {
  const searchParams = await props.searchParams;
  const tab = searchParams?.tab || "overview";
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

      <div className="flex border-b border-white/10 gap-6 px-2">
        <Link
          href="?tab=overview"
          className={cn(
            "pb-3 text-sm font-semibold transition-colors",
            tab === "overview" ? "border-b-2 border-[var(--accent-secondary)] text-white" : "text-[var(--text-secondary)] hover:text-white"
          )}
        >
          Visao Geral
        </Link>
        <Link
          href="?tab=infra"
          className={cn(
            "pb-3 text-sm font-semibold transition-colors",
            tab === "infra" ? "border-b-2 border-[var(--accent-secondary)] text-white" : "text-[var(--text-secondary)] hover:text-white"
          )}
        >
          Topologia & Infra
        </Link>
      </div>

      {tab === "overview" && (
        <div className="space-y-6 animate-enter-up">
          <section className="grid gap-6 md:grid-cols-2 2xl:grid-cols-4">
            {snapshot.metrics.map((metric) => (
              <MetricCard key={metric.label} metric={metric} />
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[5fr_4fr]">
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
                      <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-medium text-[var(--text-secondary)]">
                        <span className="rounded bg-black/30 px-1.5 py-0.5 border border-white/5">{user.pendingSync} pendentes</span>
                        <span className="rounded bg-black/30 px-1.5 py-0.5 border border-white/5">{user.weeklyHours.toFixed(1)}h/sem</span>
                        <span className="rounded bg-black/30 px-1.5 py-0.5 border border-white/5">{formatRelativeTime(user.lastSeenAt)}</span>
                      </div>
                      <p className="mt-3 text-[13px] leading-relaxed text-white/70">
                        {user.internalNote}
                      </p>
                      <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-4">
                        <button className="flex-1 rounded-xl bg-white/5 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/15">
                          Forçar Sync
                        </button>
                        <button className="flex-1 rounded-xl border border-white/10 bg-transparent px-3 py-2 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:border-white/20 hover:text-white">
                          Investigar
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-white/[0.02] p-8 text-center">
                    <p className="text-sm font-medium text-white mb-1">Nenhum usuario em atencao</p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      A fila esta zerada ou nenhum usuario apresentou falhas de sync recentes.
                    </p>
                  </div>
                )}
              </div>
            </SectionCard>
          </section>
        </div>
      )}

      {tab === "infra" && (
        <div className="space-y-6 animate-enter-up">
          <section className="grid gap-6 xl:grid-cols-2">
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
                      <p className="mt-3 text-[13px] leading-relaxed text-white/70">
                        {incident.summary}
                      </p>
                      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-secondary)]">
                          {incident.action}
                        </p>
                        <button className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-white hover:bg-white/15 transition-colors">
                          Acknowledge
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-white/[0.02] p-8 text-center min-h-[160px]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(23,232,159,0.1)] mb-3">
                      <div className="h-3 w-3 rounded-full bg-[var(--success)] shadow-[0_0_12px_var(--success)] animate-pulse" />
                    </div>
                    <p className="text-sm font-medium text-white mb-1">Sem incidentes</p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Nenhum incidente operacional aberto no ecosistema.
                    </p>
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
                    <div className="mt-4 flex flex-wrap gap-3 text-[11px] font-medium text-[var(--text-secondary)]">
                      <span className="rounded bg-black/30 px-1.5 py-0.5 border border-white/5">{release.instances} instancia(s)</span>
                      <span className="rounded bg-black/30 px-1.5 py-0.5 border border-white/5">{release.activeUsers} usuarios</span>
                      <span className="rounded bg-black/30 px-1.5 py-0.5 border border-white/5">{release.pendingSync} pendencias</span>
                    </div>
                  </article>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-white/[0.02] p-8 text-center xl:col-span-3 min-h-[160px]">
                  <p className="text-sm font-medium text-white mb-1">Nenhuma release rastreada</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Assim que os agentes conectarem, as versoes entrarao no radar de deploys automaticamente.
                  </p>
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
                      <div className="rounded-2xl border border-white/5 bg-black/20 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                          versao
                        </p>
                        <p className="mt-1.5 font-medium text-white">{node.version}</p>
                      </div>
                      <div className="rounded-2xl border border-white/5 bg-black/20 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                          uptime
                        </p>
                        <p className="mt-1.5 font-medium text-white">
                          {formatPercent(node.uptimePercent)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-medium text-[var(--text-secondary)]">
                      <span className="rounded bg-black/30 px-1.5 py-0.5 border border-white/5">{node.activeUsers} usuarios ativos</span>
                      <span className="rounded bg-black/30 px-1.5 py-0.5 border border-white/5">{node.pendingSync} pendencias</span>
                      <span className="rounded bg-black/30 px-1.5 py-0.5 border border-white/5">visto {formatRelativeTime(node.lastSeenAt)}</span>
                    </div>
                  </article>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-white/[0.02] p-8 text-center lg:col-span-2 2xl:col-span-4 min-h-[200px]">
                  <p className="text-sm font-medium text-white mb-1">Frota offline</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Nenhuma instancia ativou heartbeat na ultima janela de inspecao.
                  </p>
                </div>
              )}
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
}
