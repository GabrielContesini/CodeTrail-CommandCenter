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
    <div className="space-y-7 animate-fade-in">
      <PageHeader
        eyebrow="Visão operacional"
        title="Command Center do ecossistema CodeTrail"
        description="Painel único para acompanhar usuários, fila de sincronização, saúde dos apps e heartbeat do ambiente Windows."
        meta={[
          {
            label: snapshot.mode === "supabase" ? "modo live" : "status",
            value:
              snapshot.mode === "supabase"
                ? "dados reais conectados"
                : "aguardando fontes",
            tone: snapshot.mode === "supabase" ? "good" : "warning",
          },
          {
            label: "atualizado",
            value: formatDateTime(snapshot.generatedAt),
          },
        ]}
      />

      {/* ── Tab bar ── */}
      <div className="flex items-end gap-0 border-b border-[var(--border-subtle)]">
        {[
          { key: "overview", label: "Visão Geral" },
          { key: "infra",    label: "Topologia & Infra" },
        ].map(({ key, label }) => (
          <Link
            key={key}
            href={`?tab=${key}`}
            className={cn(
              "mr-6 pb-3 text-[13px] font-semibold transition-all",
              tab === key
                ? "border-b-2 border-[var(--accent-mid)] text-[var(--accent-mid)]"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]",
            )}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* ══════════════════════════════════════════
          OVERVIEW TAB
      ══════════════════════════════════════════ */}
      {tab === "overview" && (
        <div className="space-y-6 animate-enter-up">
          {/* Metric grid */}
          <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
            {snapshot.metrics.map((metric) => (
              <MetricCard key={metric.label} metric={metric} />
            ))}
          </section>

          {/* Charts row */}
          <section className="grid gap-4 xl:grid-cols-[5fr_4fr]">
            <SectionCard
              title="Movimento dos últimos 7 dias"
              subtitle="Sessões registradas, usuários ativos e calor da fila de sync."
            >
              <ActivityChart data={snapshot.activity} />
            </SectionCard>

            <SectionCard
              title="Saúde da frota"
              subtitle="Leitura agregada por plataforma, usuários ativos e pressão de backlog."
            >
              <FleetChart data={snapshot.platforms} />
            </SectionCard>
          </section>

          {/* Users section */}
          <SectionCard
            title="Usuários em atenção"
            subtitle="Quem merece follow-up do time ainda hoje."
            action={
              <Link
                href="/users"
                className="text-[12px] font-semibold text-[var(--accent-mid)] hover:underline"
              >
                Ver todos →
              </Link>
            }
          >
            <div className="space-y-3">
              {snapshot.users.length ? (
                snapshot.users.slice(0, 5).map((user) => (
                  <div
                    key={user.id}
                    className="rounded-[12px] border border-[var(--border-subtle)] bg-[var(--bg-base)] p-4 transition-colors hover:border-[var(--border-default)] hover:bg-white"
                  >
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[13px] font-semibold text-[var(--text-primary)]">
                          {user.name}
                        </p>
                        <p className="mt-0.5 text-[12px] text-[var(--text-tertiary)]">
                          {user.trackName} · {user.desiredArea}
                        </p>
                      </div>
                      <StatusPill value={user.riskLevel} />
                    </div>

                    {/* Stat chips */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {[
                        `${user.pendingSync} pendentes`,
                        `${user.weeklyHours.toFixed(1)}h/sem`,
                        formatRelativeTime(user.lastSeenAt),
                      ].map((chip) => (
                        <span
                          key={chip}
                          className="rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-tertiary)]"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>

                    {/* Note */}
                    <p className="mt-3 text-[12px] leading-[1.5] text-[var(--text-secondary)]">
                      {user.internalNote}
                    </p>

                    {/* Actions */}
                    <div className="mt-3 flex items-center gap-2 border-t border-[var(--border-subtle)] pt-3">
                      <button className="flex-1 rounded-[8px] bg-[var(--accent-light)] px-3 py-2 text-[12px] font-semibold text-[var(--accent-mid)] transition-colors hover:bg-[var(--accent-glow)]">
                        Forçar Sync
                      </button>
                      <button className="flex-1 rounded-[8px] border border-[var(--border-default)] bg-transparent px-3 py-2 text-[12px] font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]">
                        Investigar
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center rounded-[12px] border border-[var(--border-subtle)] bg-[var(--bg-base)] p-8 text-center">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--status-green-bg)] border border-[var(--status-green-border)]">
                    <span className="dot-green" />
                  </div>
                  <p className="text-[13px] font-semibold text-[var(--text-primary)]">
                    Nenhum usuário em atenção
                  </p>
                  <p className="mt-1 text-[12px] text-[var(--text-tertiary)]">
                    A fila está zerada — sem falhas de sync recentes.
                  </p>
                </div>
              )}
            </div>
          </SectionCard>
        </div>
      )}

      {/* ══════════════════════════════════════════
          INFRA TAB
      ══════════════════════════════════════════ */}
      {tab === "infra" && (
        <div className="space-y-6 animate-enter-up">
          <section className="grid gap-4 xl:grid-cols-2">
            <SectionCard
              title="Banco de dados"
              subtitle="Leitura rápida das tabelas mais sensíveis para a operação."
            >
              <DatabaseChart data={snapshot.database} />
            </SectionCard>

            <SectionCard
              title="Incidentes ativos"
              subtitle="Alertas persistidos ou derivados da operação atual."
            >
              <div className="space-y-3">
                {snapshot.incidents.length ? (
                  snapshot.incidents.map((incident) => (
                    <div
                      key={incident.id}
                      className="rounded-[12px] border border-[var(--border-subtle)] bg-[var(--bg-base)] p-4 transition-colors hover:border-[var(--border-default)] hover:bg-white"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[13px] font-semibold text-[var(--text-primary)]">
                            {incident.title}
                          </p>
                          <p className="mt-0.5 text-[12px] text-[var(--text-tertiary)]">
                            {incident.source} · aberto {formatRelativeTime(incident.openedAt)}
                          </p>
                        </div>
                        <StatusPill value={incident.severity} />
                      </div>
                      <p className="mt-3 text-[12px] leading-[1.5] text-[var(--text-secondary)]">
                        {incident.summary}
                      </p>
                      <div className="mt-3 flex items-center justify-between border-t border-[var(--border-subtle)] pt-3">
                        <p className="label-caps text-[var(--accent-mid)]">{incident.action}</p>
                        <button className="rounded-full bg-[var(--accent-light)] px-3 py-1 text-[11px] font-semibold text-[var(--accent-mid)] hover:bg-[var(--accent-glow)] transition-colors">
                          Acknowledge
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-[12px] border border-[var(--border-subtle)] bg-[var(--bg-base)] p-8 text-center min-h-[160px]">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--status-green-bg)] border border-[var(--status-green-border)]">
                      <span className="dot-green animate-pulse-slow" />
                    </div>
                    <p className="text-[13px] font-semibold text-[var(--text-primary)]">Sem incidentes</p>
                    <p className="mt-1 text-[12px] text-[var(--text-tertiary)]">
                      Nenhum incidente operacional aberto no ecossistema.
                    </p>
                  </div>
                )}
              </div>
            </SectionCard>
          </section>

          {/* Releases radar */}
          <SectionCard
            title="Radar de releases"
            subtitle="As versões ativas do ecossistema e onde a operação deve concentrar atenção."
          >
            <div className="grid gap-3 xl:grid-cols-3">
              {snapshot.releases.length ? (
                snapshot.releases.slice(0, 6).map((release) => (
                  <article
                    key={release.id}
                    className="rounded-[12px] border border-[var(--border-subtle)] bg-[var(--bg-base)] p-4 transition-colors hover:border-[var(--border-default)] hover:bg-white"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[13px] font-semibold text-[var(--text-primary)]">
                          {platformLabel(release.platform)} · {release.version}
                        </p>
                        <p className="mt-0.5 text-[12px] text-[var(--text-tertiary)]">
                          {release.environments.join(", ")} · {formatRelativeTime(release.lastSeenAt)}
                        </p>
                      </div>
                      <StatusPill value={release.health} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {[
                        `${release.instances} instância(s)`,
                        `${release.activeUsers} usuários`,
                        `${release.pendingSync} pendências`,
                      ].map((chip) => (
                        <span
                          key={chip}
                          className="rounded-full border border-[var(--border-default)] bg-white px-2 py-0.5 text-[11px] font-medium text-[var(--text-tertiary)]"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  </article>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center rounded-[12px] border border-[var(--border-subtle)] bg-[var(--bg-base)] p-8 text-center xl:col-span-3 min-h-[140px]">
                  <p className="text-[13px] font-semibold text-[var(--text-primary)]">Nenhuma release rastreada</p>
                  <p className="mt-1 text-[12px] text-[var(--text-tertiary)]">
                    Assim que os agentes conectarem, as versões entrarão no radar automaticamente.
                  </p>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Fleet radar */}
          <SectionCard
            title="Radar de serviços"
            subtitle="Cada instância vista pelo Command Center e sua telemetria mais recente."
          >
            <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-4">
              {snapshot.fleet.length ? (
                snapshot.fleet.map((node) => (
                  <article
                    key={node.id}
                    className="rounded-[12px] border border-[var(--border-subtle)] bg-[var(--bg-base)] p-4 transition-colors hover:border-[var(--border-default)] hover:bg-white"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[13px] font-semibold text-[var(--text-primary)]">{node.label}</p>
                        <p className="mt-0.5 text-[12px] text-[var(--text-tertiary)]">
                          {platformLabel(node.platform)} · {node.environment}
                        </p>
                      </div>
                      <StatusPill value={node.status} />
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {[
                        { label: "versão",  value: node.version },
                        { label: "uptime",  value: formatPercent(node.uptimePercent) },
                      ].map((kv) => (
                        <div
                          key={kv.label}
                          className="rounded-[8px] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2"
                        >
                          <p className="label-caps">{kv.label}</p>
                          <p className="data-value mt-1 text-[12px] font-semibold text-[var(--text-primary)]">
                            {kv.value}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {[
                        `${node.activeUsers} usuários ativos`,
                        `${node.pendingSync} pendências`,
                        `visto ${formatRelativeTime(node.lastSeenAt)}`,
                      ].map((chip) => (
                        <span
                          key={chip}
                          className="rounded-full border border-[var(--border-default)] bg-white px-2 py-0.5 text-[11px] font-medium text-[var(--text-tertiary)]"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  </article>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center rounded-[12px] border border-[var(--border-subtle)] bg-[var(--bg-base)] p-8 text-center lg:col-span-2 2xl:col-span-4 min-h-[160px]">
                  <p className="text-[13px] font-semibold text-[var(--text-primary)]">Frota offline</p>
                  <p className="mt-1 text-[12px] text-[var(--text-tertiary)]">
                    Nenhuma instância ativou heartbeat na última janela de inspeção.
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
