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
      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-[var(--text-primary)] tabular-nums">{value}</p>
    </div>
  );
}

export default async function SystemsPage() {
  const snapshot = await getCommandCenterSnapshot();
  
  const totalInstances = snapshot.platforms.reduce((sum, p) => sum + p.instances, 0);
  const totalReleases = snapshot.releases.length;
  const healthyInstances = snapshot.systems.filter(s => s.status === "up").length;
  const degradedInstances = snapshot.systems.filter(s => s.status === "degraded").length;

  return (
    <main className="pt-24 pb-12 pl-64 pr-8 lg:pr-12 min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <section>
          <h2 className="text-3xl font-black text-white tracking-tight">Plataformas Conectadas</h2>
          <p className="text-neutral-400 mt-1">Status do ecossistema Windows e mobile - Heartbeat por máquina</p>
        </section>

        {/* System Health Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Total de Instâncias", value: totalInstances },
            { label: "Instâncias Online", value: healthyInstances },
            { label: "Instâncias Degradadas", value: degradedInstances },
            { label: "Releases Ativas", value: totalReleases },
          ].map((metric, i) => (
            <div key={i} className="bg-surface-container rounded-xl p-6 border border-outline-variant/30">
              <p className="text-neutral-400 text-sm font-medium">{metric.label}</p>
              <div className="flex items-end justify-between mt-2">
                <h3 className="text-3xl font-black text-on-background">{metric.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Platforms grid */}
        <section className="grid gap-4 xl:grid-cols-3">
          {snapshot.platforms.length ? (
            snapshot.platforms.map((platform) => (
              <div
                key={platform.platform}
                className="bg-surface-container rounded-xl border border-neutral-800 p-6"
              >
                <h4 className="text-sm font-bold text-on-surface mb-1">{platformLabel(platform.platform)}</h4>
                <p className="text-neutral-500 text-xs mb-4">Visão agregada da superfície por plataforma.</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <StatTile label="instâncias" value={platform.instances} />
                  <StatTile label="versões" value={platform.uniqueVersions} />
                  <StatTile label="usuários" value={platform.activeUsers} />
                  <StatTile label="backlog" value={platform.pendingSync} />
                </div>
                <p className="mt-4 text-xs text-[var(--text-tertiary)]">
                  {platform.degradedNodes} nodo(s) fora do ideal · última leitura{" "}
                  {platform.latestSeenAt
                    ? formatRelativeTime(platform.latestSeenAt)
                    : "sem heartbeat"}
                </p>
              </div>
            ))
          ) : (
            <div className="bg-surface-container rounded-xl border border-neutral-800 p-6 xl:col-span-3">
              <h4 className="text-sm font-bold text-on-surface mb-2">Nenhuma plataforma conectada</h4>
              <p className="text-sm text-[var(--text-secondary)]">
                Ative o heartbeat do app Windows e a telemetria do produto para popular esta superfície.
              </p>
            </div>
          )}
        </section>

        {/* Releases radar */}
        <div className="bg-surface-container rounded-xl border border-neutral-800 p-6">
          <h4 className="text-lg font-bold text-on-surface mb-1">Radar de releases</h4>
          <p className="text-neutral-500 text-xs mb-6">Versões observadas atualmente no ecossistema.</p>
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
        </div>

        {/* Windows machines */}
        <section className="grid gap-4 xl:grid-cols-3">
          {snapshot.systems.length ? (
            snapshot.systems.map((system) => (
              <div
                key={system.id}
                className="bg-surface-container rounded-xl border border-neutral-800 p-6"
              >
                <h4 className="text-sm font-bold text-on-surface mb-1">{system.machineName}</h4>
                <p className="text-neutral-500 text-xs mb-4">versão {system.appVersion} · {system.environment}</p>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
                    {system.status.toUpperCase()}
                  </span>
                  <span className="text-xs text-[var(--text-tertiary)]">
                    visto {formatRelativeTime(system.lastSeenAt)}
                  </span>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <StatTile label="cpu" value={formatPercent(system.cpuPercent)} />
                  <StatTile label="memória" value={formatPercent(system.memoryPercent)} />
                  <StatTile label="disco" value={formatPercent(system.diskPercent)} />
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
              </div>
            ))
          ) : (
            <div className="bg-surface-container rounded-xl border border-neutral-800 p-6">
              <h4 className="text-sm font-bold text-on-surface mb-2">Nenhum agente Windows conectado</h4>
              <p className="text-sm text-[var(--text-secondary)]">
                Ative o heartbeat do app Windows para popular esta superfície.
              </p>
            </div>
          )}
        </section>

        {/* Heartbeat agent reference */}
        <div className="bg-surface-container rounded-xl border border-neutral-800 p-6">
          <h4 className="text-sm font-bold text-on-surface mb-1">Agente de heartbeat</h4>
          <p className="text-neutral-500 text-xs mb-4">Script base para enviar telemetria do Windows ao Command Center.</p>
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
        </div>
      </div>
    </main>
  );
}
