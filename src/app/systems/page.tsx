import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatusPill } from "@/components/ui/status-pill";
import { getCommandCenterSnapshot } from "@/lib/command-center-data";
import { formatDateTime, formatPercent, formatRelativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SystemsPage() {
  const snapshot = await getCommandCenterSnapshot();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Windows telemetry"
        title="Status do ecossistema Windows"
        description="Heartbeat por maquina, versao instalada, consumo local e saude do app desktop."
        meta={[
          { label: "nodos", value: String(snapshot.systems.length) },
          {
            label: "ingest",
            value: "/api/telemetry/heartbeat",
          },
        ]}
      />

      <section className="grid gap-4 xl:grid-cols-3">
        {snapshot.systems.map((system) => (
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
        ))}
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
