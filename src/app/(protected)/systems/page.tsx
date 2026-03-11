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

/** Small stat tile reused in platform + system grids */
function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[8px] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2">
      <p className="label-caps">{label}</p>
      <p className="mt-1 text-[13px] font-semibold text-[var(--text-primary)] tabular-nums">{value}</p>
    </div>
  );
}

export default async function SystemsPage() {
  const snapshot = await getCommandCenterSnapshot();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Plataformas conectadas"
        title="Status do ecossistema Windows e mobile"
        description="Heartbeat por maquina, releases ativas, backlog por plataforma e saude do app desktop e dos clientes conectados."
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
              subtitle="Visao agregada da superficie por plataforma."
            >
              <div className="grid gap-2 sm:grid-cols-2">
                <StatTile label="instancias"  value={platform.instances}      />
                <StatTile label="versoes"     value={platform.uniqueVersions} />
                <StatTile label="usuarios"    value={platform.activeUsers}    />
                <StatTile label="backlog"     value={platform.pendingSync}    />
              </div>
              <p className="mt-4 text-[12px] text-[var(--text-tertiary)]">
                {platform.degradedNodes} nodo(s) fora do ideal · ultima leitura{" "}
                {platform.latestSeenAt
                  ? formatRelativeTime(platform.latestSeenAt)
                  : "sem heartbeat"}
              </p>
            </SectionCard>
          ))
        ) : (
          <SectionCard
            title="Nenhuma plataforma conectada"
            subtitle="Ative o heartbeat do app Windows e a telemetria do produto para popular esta superficie."
            className="xl:col-span-3"
          >
            <p className="text-[13px] text-[var(--text-secondary)]">
              Assim que as instancias reportarem heartbeat, o painel passa a mostrar releases, backlog e saude por plataforma.
            </p>
          </SectionCard>
        )}
      </section>

      {/* Releases radar */}
      <SectionCard
        title="Radar de releases"
        subtitle="Versoes observadas atualmente no ecossistema."
      >
        <div className="grid gap-4 xl:grid-cols-2">
          {snapshot.releases.length ? (
            snapshot.releases.map((release) => (
              <article
                key={release.id}
                className="rounded-[12px] border border-[var(--border-subtle)] bg-[var(--bg-base)] p-4 transition-colors hover:border-[var(--border-default)] hover:bg-white"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-semibold text-[var(--text-primary)]">
                      {platformLabel(release.platform)} · {release.version}
                    </p>
                    <p className="mt-0.5 text-[12px] text-[var(--text-tertiary)]">
                      {release.environments.join(", ")} · {release.instances} instancia(s)
                    </p>
                  </div>
                  <StatusPill value={release.health} />
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {[
                    `${release.activeUsers} usuarios ativos`,
                    `${release.pendingSync} pendencias`,
                    `visto ${formatRelativeTime(release.lastSeenAt)}`,
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
            <div className="rounded-[12px] border border-[var(--border-subtle)] bg-[var(--bg-base)] p-8 text-[13px] text-[var(--text-tertiary)] xl:col-span-2 text-center">
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
              subtitle={`versao ${system.appVersion} · ${system.environment}`}
            >
              <div className="flex items-center justify-between gap-3">
                <StatusPill value={system.status} />
                <span className="text-[12px] text-[var(--text-tertiary)]">
                  visto {formatRelativeTime(system.lastSeenAt)}
                </span>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <StatTile label="cpu"     value={formatPercent(system.cpuPercent)}    />
                <StatTile label="memoria" value={formatPercent(system.memoryPercent)} />
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
                    className="rounded-full border border-[var(--border-default)] bg-white px-2 py-0.5 text-[11px] font-medium text-[var(--text-tertiary)]"
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
            subtitle="Ative o heartbeat do app Windows para popular esta superficie."
          >
            <p className="text-[13px] text-[var(--text-secondary)]">
              Assim que as instancias Windows enviarem heartbeats, esta tela passa a
              mostrar versao instalada, consumo local e status em tempo real.
            </p>
          </SectionCard>
        )}
      </section>

      {/* Heartbeat agent reference */}
      <SectionCard
        title="Agente de heartbeat"
        subtitle="Script base para enviar telemetria do Windows ao Command Center."
      >
        <div className="rounded-[12px] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 font-mono text-[13px] text-[var(--text-secondary)]">
          <p className="font-semibold text-[var(--text-primary)]">agent/windows-heartbeat.ps1</p>
          <p className="mt-2">
            Envie o script com um token de ingest e agende via Task Scheduler ou
            service wrapper para alimentar o endpoint de heartbeat.
          </p>
          <p className="mt-3 font-semibold text-[var(--text-primary)]">
            Ultima leitura consolidada: {formatDateTime(snapshot.generatedAt)}
          </p>
        </div>
      </SectionCard>
    </div>
  );
}
