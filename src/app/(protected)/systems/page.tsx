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
          {
            label: "ingest",
            value: "/api/telemetry/heartbeat",
          },
        ]}
      />

      <section className="grid gap-4 xl:grid-cols-3">
        {snapshot.platforms.length ? (
          snapshot.platforms.map((platform) => (
            <SectionCard
              key={platform.platform}
              title={platformLabel(platform.platform)}
              subtitle="Visao agregada da superficie por plataforma."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/4 p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                    instancias
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {platform.instances}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/4 p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                    versoes
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {platform.uniqueVersions}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/4 p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                    usuarios
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {platform.activeUsers}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/4 p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                    backlog
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {platform.pendingSync}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-xs text-[var(--text-secondary)]">
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
            <p className="text-sm text-[var(--text-secondary)]">
              Assim que as instancias reportarem heartbeat, o painel passa a mostrar releases, backlog e saude por plataforma.
            </p>
          </SectionCard>
        )}
      </section>

      <SectionCard
        title="Radar de releases"
        subtitle="Versoes observadas atualmente no ecossistema."
      >
        <div className="grid gap-4 xl:grid-cols-2">
          {snapshot.releases.length ? (
            snapshot.releases.map((release) => (
              <article
                key={release.id}
                className="rounded-3xl border border-white/8 bg-black/10 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {platformLabel(release.platform)} · {release.version}
                    </p>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      {release.environments.join(", ")} · {release.instances} instancia(s)
                    </p>
                  </div>
                  <StatusPill value={release.health} />
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-xs text-[var(--text-secondary)]">
                  <span>{release.activeUsers} usuarios ativos</span>
                  <span>{release.pendingSync} pendencias</span>
                  <span>visto {formatRelativeTime(release.lastSeenAt)}</span>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-3xl border border-white/8 bg-black/10 p-4 text-sm text-[var(--text-secondary)] xl:col-span-2">
              Nenhuma release foi registrada ainda.
            </div>
          )}
        </div>
      </SectionCard>

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
                <span className="text-xs text-[var(--text-secondary)]">
                  visto {formatRelativeTime(system.lastSeenAt)}
                </span>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/4 p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                    cpu
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {formatPercent(system.cpuPercent)}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/4 p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                    memoria
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {formatPercent(system.memoryPercent)}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/4 p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                    disco
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {formatPercent(system.diskPercent)}
                  </p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-3 text-xs text-[var(--text-secondary)]">
                <span>rede: {system.networkStatus}</span>
                <span>app: {system.appUptimeHours.toFixed(1)}h</span>
                <span>sistema: {system.osUptimeHours.toFixed(1)}h</span>
              </div>
            </SectionCard>
          ))
        ) : (
          <SectionCard
            title="Nenhum agente Windows conectado"
            subtitle="Ative o heartbeat do app Windows para popular esta superficie."
          >
            <p className="text-sm text-[var(--text-secondary)]">
              Assim que as instancias Windows enviarem heartbeats, esta tela passa a
              mostrar versao instalada, consumo local e status em tempo real.
            </p>
          </SectionCard>
        )}
      </section>

      <SectionCard
        title="Agente de heartbeat"
        subtitle="Script base para enviar telemetria do Windows ao Command Center."
      >
        <div className="rounded-3xl border border-white/8 bg-black/20 p-4 font-mono text-sm text-[var(--text-secondary)]">
          <p>agent/windows-heartbeat.ps1</p>
          <p className="mt-2">
            Envie o script com um token de ingest e agende via Task Scheduler ou
            service wrapper para alimentar o endpoint de heartbeat.
          </p>
          <p className="mt-3 text-white">
            Ultima leitura consolidada: {formatDateTime(snapshot.generatedAt)}
          </p>
        </div>
      </SectionCard>
    </div>
  );
}
