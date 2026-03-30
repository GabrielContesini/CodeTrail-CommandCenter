import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatusPill } from "@/components/ui/status-pill";
import { GlassCard } from "@/components/ui/glass-card";
import { StatCard } from "@/components/ui/stat-card";
import { getCommandCenterSnapshot } from "@/lib/command-center-data";
import {
  formatDateTime,
  formatPercent,
  formatRelativeTime,
  platformLabel,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

/** Small stat tile reused in platform + system grids */
function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-[var(--border-neutral)] bg-[var(--bg-surface-high)] px-3 py-2">
      <p className="label-caps">{label}</p>
      <p className="mt-1 text-sm font-bold text-[var(--text-primary)] tabular-nums">{value}</p>
    </div>
  );
}

export default async function SystemsPage() {
  const snapshot = await getCommandCenterSnapshot();
  
  const totalInstances = snapshot.platforms.reduce((sum, p) => sum + p.instances, 0);
  const totalReleases = snapshot.releases.length;
  const healthyInstances = snapshot.systems.filter(s => s.status === "online").length;
  const degradedInstances = snapshot.systems.filter(s => s.status === "degrading").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Plataformas conectadas"
        title="Status do ecossistema Windows e mobile"
        description="Heartbeat por máquina, releases ativas, backlog por plataforma e saúde do app desktop e dos clientes conectados."
        meta={[
          { label: "plataformas", value: String(snapshot.platforms.length) },
          { label: "releases", value: String(snapshot.releases.length) },
          { label: "ingest", value: "/api/telemetry/heartbeat" },
        ]}
      />

      {/* System Health Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <GlassCard className="p-6">
          <StatCard
            label="Total de Instâncias"
            value={String(totalInstances)}
            delta={`${totalReleases} versões ativas`}
            deltaColor="cyan"
          />
        </GlassCard>
        <GlassCard className="p-6">
          <StatCard
            label="Instâncias Online"
            value={String(healthyInstances)}
            delta={`${((healthyInstances / Math.max(snapshot.systems.length, 1)) * 100).toFixed(0)}% da frota`}
            deltaColor="emerald"
            progress={Math.round((healthyInstances / Math.max(snapshot.systems.length, 1)) * 100)}
          />
        </GlassCard>
        <GlassCard className="p-6">
          <StatCard
            label="Instâncias Degradadas"
            value={String(degradedInstances)}
            delta={degradedInstances > 0 ? "Requer atenção" : "Sem problemas"}
            deltaColor={degradedInstances > 0 ? "amber" : "emerald"}
            progress={Math.round((degradedInstances / Math.max(snapshot.systems.length, 1)) * 100)}
          />
        </GlassCard>
        <GlassCard className="p-6">
          <StatCard
            label="Releases Ativas"
            value={String(totalReleases)}
            delta="Em produção"
            deltaColor="cyan"
          />
        </GlassCard>
      </div>

      {/* Platforms grid */}
      <section className="grid gap-4 xl:grid-cols-3">
        {snapshot.platforms.length ? (
          snapshot.platforms.map((platform) => (
            <SectionCard
              key={platform.platform}
              title={platformLabel(platform.platform)}
              subtitle="Visão agregada da superfície por plataforma."
            >
              <div className="grid gap-2 sm:grid-cols-2">
                <StatTile label="instâncias"  value={platform.instances}      />
                <StatTile label="versões"     value={platform.uniqueVersions} />
                <StatTile label="usuários"    value={platform.activeUsers}    />
                <StatTile label="backlog"     value={platform.pendingSync}    />
              </div>
              <p className="mt-4 text-xs text-[var(--text-tertiary)]">
                {platform.degradedNodes} nodo(s) fora do ideal · última leitura{" "}
                {platform.latestSeenAt
                  ? formatRelativeTime(platform.latestSeenAt)
                  : "sem heartbeat"}
              </p>
            </SectionCard>
          ))
        ) : (
          <SectionCard
            title="Nenhuma plataforma conectada"
            subtitle="Ative o heartbeat do app Windows e a telemetria do produto para popular esta superfície."
            className="xl:col-span-3"
          >
            <p className="text-sm text-[var(--text-secondary)]">
              Assim que as instâncias reportarem heartbeat, o painel passa a mostrar releases, backlog e saúde por plataforma.
            </p>
          </SectionCard>
        )}
      </section>

      {/* Releases radar */}
      <SectionCard
        title="Radar de releases"
        subtitle="Versões observadas atualmente no ecossistema."
      >
        <div className="grid gap-4 xl:grid-cols-2">
          {snapshot.releases.length ? (
            snapshot.releases.map((release) => (
              <article
                key={release.id}
                className="rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-low)] p-4 transition-all duration-200 hover:border-[var(--border-default)] hover:bg-[var(--bg-surface-high)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-[var(--text-primary)]">
                      {platformLabel(release.platform)} · {release.version}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">
                      {release.environments.join(", ")} · {release.instances} instância(s)
                    </p>
                  </div>
                  <StatusPill value={release.health} />
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {[
                    `${release.activeUsers} usuários ativos`,
                    `${release.pendingSync} pendências`,
                    `visto ${formatRelativeTime(release.lastSeenAt)}`,
                  ].map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-[var(--border-neutral)] bg-[var(--bg-surface-high)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-tertiary)]"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-low)] p-8 text-sm text-[var(--text-tertiary)] xl:col-span-2 text-center">
              Nenhuma release foi registrada ainda.
            </div>
          )}
        </div>
      </SectionCard>

      {/* Windows machines */}
      <section className="grid gap-4 xl:grid-cols-3">
        {snapshot.systems.length ? (
          snapshot.systems.map((system) => (
            <SectionCard
              key={system.id}
              title={system.machineName}
              subtitle={`versão ${system.appVersion} · ${system.environment}`}
            >
              <div className="flex items-center justify-between gap-3">
                <StatusPill value={system.status} />
                <span className="text-xs text-[var(--text-tertiary)]">
                  visto {formatRelativeTime(system.lastSeenAt)}
                </span>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <StatTile label="cpu"     value={formatPercent(system.cpuPercent)}    />
                <StatTile label="memória" value={formatPercent(system.memoryPercent)} />
                <StatTile label="disco"   value={formatPercent(system.diskPercent)}   />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {[
                  `rede: ${system.networkStatus}`,
                  `app: ${system.appUptimeHours.toFixed(1)}h`,
                  `sistema: ${system.osUptimeHours.toFixed(1)}h`,
                ].map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-[var(--border-neutral)] bg-[var(--bg-surface-high)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-tertiary)]"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </SectionCard>
          ))
        ) : (
          <SectionCard
            title="Nenhum agente Windows conectado"
            subtitle="Ative o heartbeat do app Windows para popular esta superfície."
          >
            <p className="text-sm text-[var(--text-secondary)]">
              Assim que as instâncias Windows enviarem heartbeats, esta tela passa a
              mostrar versão instalada, consumo local e status em tempo real.
            </p>
          </SectionCard>
        )}
      </section>

      {/* Heartbeat agent reference */}
      <SectionCard
        title="Agente de heartbeat"
        subtitle="Script base para enviar telemetria do Windows ao Command Center."
      >
        <div className="rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-high)] p-4 font-mono text-sm text-[var(--text-secondary)]">
          <p className="font-bold text-[var(--accent)]">agent/windows-heartbeat.ps1</p>
          <p className="mt-2">
            Envie o script com um token de ingest e agende via Task Scheduler ou
            service wrapper para alimentar o endpoint de heartbeat.
          </p>
          <p className="mt-3 font-bold text-[var(--text-primary)]">
            Última leitura consolidada: {formatDateTime(snapshot.generatedAt)}
          </p>
        </div>
      </SectionCard>
    </div>
  );
}

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Plataformas conectadas"
        title="Status do ecossistema Windows e mobile"
        description="Heartbeat por máquina, releases ativas, backlog por plataforma e saúde do app desktop e dos clientes conectados."
        meta={[
          { label: "plataformas", value: String(snapshot.platforms.length) },
          { label: "releases", value: String(snapshot.releases.length) },
          { label: "ingest", value: "/api/telemetry/heartbeat" },
        ]}
      />

      {/* Platforms grid */}
      <section className="grid gap-4 xl:grid-cols-3">
        {snapshot.platforms.length ? (
          snapshot.platforms.map((platform) => (
            <SectionCard
              key={platform.platform}
              title={platformLabel(platform.platform)}
              subtitle="Visão agregada da superfície por plataforma."
            >
              <div className="grid gap-2 sm:grid-cols-2">
                <StatTile label="instâncias"  value={platform.instances}      />
                <StatTile label="versões"     value={platform.uniqueVersions} />
                <StatTile label="usuários"    value={platform.activeUsers}    />
                <StatTile label="backlog"     value={platform.pendingSync}    />
              </div>
              <p className="mt-4 text-xs text-[var(--text-tertiary)]">
                {platform.degradedNodes} nodo(s) fora do ideal · última leitura{" "}
                {platform.latestSeenAt
                  ? formatRelativeTime(platform.latestSeenAt)
                  : "sem heartbeat"}
              </p>
            </SectionCard>
          ))
        ) : (
          <SectionCard
            title="Nenhuma plataforma conectada"
            subtitle="Ative o heartbeat do app Windows e a telemetria do produto para popular esta superfície."
            className="xl:col-span-3"
          >
            <p className="text-sm text-[var(--text-secondary)]">
              Assim que as instâncias reportarem heartbeat, o painel passa a mostrar releases, backlog e saúde por plataforma.
            </p>
          </SectionCard>
        )}
      </section>

      {/* Releases radar */}
      <SectionCard
        title="Radar de releases"
        subtitle="Versões observadas atualmente no ecossistema."
      >
        <div className="grid gap-4 xl:grid-cols-2">
          {snapshot.releases.length ? (
            snapshot.releases.map((release) => (
              <article
                key={release.id}
                className="rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-low)] p-4 transition-all duration-200 hover:border-[var(--border-default)] hover:bg-[var(--bg-surface-high)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-[var(--text-primary)]">
                      {platformLabel(release.platform)} · {release.version}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">
                      {release.environments.join(", ")} · {release.instances} instância(s)
                    </p>
                  </div>
                  <StatusPill value={release.health} />
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {[
                    `${release.activeUsers} usuários ativos`,
                    `${release.pendingSync} pendências`,
                    `visto ${formatRelativeTime(release.lastSeenAt)}`,
                  ].map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-[var(--border-neutral)] bg-[var(--bg-surface-high)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-tertiary)]"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-low)] p-8 text-sm text-[var(--text-tertiary)] xl:col-span-2 text-center">
              Nenhuma release foi registrada ainda.
            </div>
          )}
        </div>
      </SectionCard>

      {/* Windows machines */}
      <section className="grid gap-4 xl:grid-cols-3">
        {snapshot.systems.length ? (
          snapshot.systems.map((system) => (
            <SectionCard
              key={system.id}
              title={system.machineName}
              subtitle={`versão ${system.appVersion} · ${system.environment}`}
            >
              <div className="flex items-center justify-between gap-3">
                <StatusPill value={system.status} />
                <span className="text-xs text-[var(--text-tertiary)]">
                  visto {formatRelativeTime(system.lastSeenAt)}
                </span>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <StatTile label="cpu"     value={formatPercent(system.cpuPercent)}    />
                <StatTile label="memória" value={formatPercent(system.memoryPercent)} />
                <StatTile label="disco"   value={formatPercent(system.diskPercent)}   />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {[
                  `rede: ${system.networkStatus}`,
                  `app: ${system.appUptimeHours.toFixed(1)}h`,
                  `sistema: ${system.osUptimeHours.toFixed(1)}h`,
                ].map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-[var(--border-neutral)] bg-[var(--bg-surface-high)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-tertiary)]"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </SectionCard>
          ))
        ) : (
          <SectionCard
            title="Nenhum agente Windows conectado"
            subtitle="Ative o heartbeat do app Windows para popular esta superfície."
          >
            <p className="text-sm text-[var(--text-secondary)]">
              Assim que as instâncias Windows enviarem heartbeats, esta tela passa a
              mostrar versão instalada, consumo local e status em tempo real.
            </p>
          </SectionCard>
        )}
      </section>

      {/* Heartbeat agent reference */}
      <SectionCard
        title="Agente de heartbeat"
        subtitle="Script base para enviar telemetria do Windows ao Command Center."
      >
        <div className="rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-high)] p-4 font-mono text-sm text-[var(--text-secondary)]">
          <p className="font-bold text-[var(--accent)]">agent/windows-heartbeat.ps1</p>
          <p className="mt-2">
            Envie o script com um token de ingest e agende via Task Scheduler ou
            service wrapper para alimentar o endpoint de heartbeat.
          </p>
          <p className="mt-3 font-bold text-[var(--text-primary)]">
            Última leitura consolidada: {formatDateTime(snapshot.generatedAt)}
          </p>
        </div>
      </SectionCard>
    </div>
  );
}
