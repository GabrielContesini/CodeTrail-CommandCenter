import { DatabaseChart } from "@/components/charts/database-chart";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatusPill } from "@/components/ui/status-pill";
import { GlassCard } from "@/components/ui/glass-card";
import { StatCard } from "@/components/ui/stat-card";
import { getCommandCenterSnapshot } from "@/lib/command-center-data";
import { formatCompactNumber, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DatabasePage() {
  const snapshot = await getCommandCenterSnapshot();
  const queue = snapshot.database.find((item) => item.tableName === "sync_queue");
  const healthyTables = snapshot.database.filter(item => item.health === "good").length;
  const totalRows = snapshot.database.reduce((sum, item) => sum + item.rowCount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Banco e operação"
        title="Utilização do banco e gargalos de persistência"
        description="Contagem por tabela, pressão na fila de sincronização e leitura rápida da camada de dados do produto."
        meta={[
          { label: "tabelas monitoradas", value: String(snapshot.database.length) },
          {
            label: "fila atual",
            value: queue ? formatCompactNumber(queue.rowCount) : "0",
          },
        ]}
      />

      {/* Database Health Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <GlassCard className="p-6">
          <StatCard
            label="Total de Linhas"
            value={formatCompactNumber(totalRows)}
            delta={`${snapshot.database.length} tabelas monitoradas`}
            deltaColor="cyan"
          />
        </GlassCard>
        <GlassCard className="p-6">
          <StatCard
            label="Fila de Sincronização"
            value={queue ? formatCompactNumber(queue.rowCount) : "0"}
            delta={queue ? (queue.health === "good" ? "Dentro do esperado" : "Acima do esperado") : "Vazio"}
            deltaColor={queue && queue.health === "good" ? "emerald" : queue ? "amber" : "emerald"}
            progress={queue ? (queue.health === "good" ? 40 : 80) : 10}
          />
        </GlassCard>
        <GlassCard className="p-6">
          <StatCard
            label="Tabelas Saudáveis"
            value={String(healthyTables)}
            delta={`${((healthyTables / snapshot.database.length) * 100).toFixed(0)}% do banco`}
            deltaColor={healthyTables === snapshot.database.length ? "emerald" : "amber"}
            progress={Math.round((healthyTables / snapshot.database.length) * 100)}
          />
        </GlassCard>
        <GlassCard className="p-6">
          <StatCard
            label="Saúde Geral"
            value={healthyTables === snapshot.database.length ? "Excelente" : "Monitorar"}
            delta="Sistema operacional"
            deltaColor={healthyTables === snapshot.database.length ? "emerald" : "amber"}
            progress={Math.round((healthyTables / snapshot.database.length) * 100)}
          />
        </GlassCard>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <SectionCard
          title="Distribuição de volume"
          subtitle="Acompanhamento das tabelas mais importantes para produto e suporte."
        >
          <DatabaseChart data={snapshot.database} />
        </SectionCard>

        <SectionCard
          title="Checklist operacional"
          subtitle="Leitura direta para o operador agir rápido."
        >
          <div className="space-y-3">
            {snapshot.database.map((item) => (
              <div
                key={item.tableName}
                className="rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-low)] p-4 transition-all duration-200 hover:border-[var(--border-default)] hover:bg-[var(--bg-surface-high)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-[var(--text-primary)]">{item.label}</p>
                    <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">
                      {item.description}
                    </p>
                  </div>
                  <StatusPill value={item.health} />
                </div>
                <p className="mt-4 text-2xl font-black text-[var(--text-primary)] tabular-nums">
                  {formatCompactNumber(item.rowCount)}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>

      <SectionCard
        title="Runbook desta superfície"
        subtitle="O que validar quando a saúde do banco ou da fila sair do esperado."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            "Confirmar se study_sessions segue crescendo em linha com o uso recente.",
            "Checar sync_queue por explosão de backlog, tentativas e mensagens de erro.",
            "Observar notas e revisões quando o volume do produto crescer mais rápido que o previsto.",
          ].map((item) => (
            <div
              key={item}
              className="rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-low)] p-4 text-sm text-[var(--text-secondary)] leading-relaxed"
            >
              {item}
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-[var(--text-tertiary)]">
          Snapshot gerado em {formatDateTime(snapshot.generatedAt)}.
        </p>
      </SectionCard>
    </div>
  );
}

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Banco e operação"
        title="Utilização do banco e gargalos de persistência"
        description="Contagem por tabela, pressão na fila de sincronização e leitura rápida da camada de dados do produto."
        meta={[
          { label: "tabelas monitoradas", value: String(snapshot.database.length) },
          {
            label: "fila atual",
            value: queue ? formatCompactNumber(queue.rowCount) : "0",
          },
        ]}
      />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <SectionCard
          title="Distribuição de volume"
          subtitle="Acompanhamento das tabelas mais importantes para produto e suporte."
        >
          <DatabaseChart data={snapshot.database} />
        </SectionCard>

        <SectionCard
          title="Checklist operacional"
          subtitle="Leitura direta para o operador agir rápido."
        >
          <div className="space-y-3">
            {snapshot.database.map((item) => (
              <div
                key={item.tableName}
                className="rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-low)] p-4 transition-all duration-200 hover:border-[var(--border-default)] hover:bg-[var(--bg-surface-high)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-[var(--text-primary)]">{item.label}</p>
                    <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">
                      {item.description}
                    </p>
                  </div>
                  <StatusPill value={item.health} />
                </div>
                <p className="mt-4 text-2xl font-black text-[var(--text-primary)] tabular-nums">
                  {formatCompactNumber(item.rowCount)}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>

      <SectionCard
        title="Runbook desta superfície"
        subtitle="O que validar quando a saúde do banco ou da fila sair do esperado."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            "Confirmar se study_sessions segue crescendo em linha com o uso recente.",
            "Checar sync_queue por explosão de backlog, tentativas e mensagens de erro.",
            "Observar notas e revisões quando o volume do produto crescer mais rápido que o previsto.",
          ].map((item) => (
            <div
              key={item}
              className="rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-low)] p-4 text-sm text-[var(--text-secondary)] leading-relaxed"
            >
              {item}
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-[var(--text-tertiary)]">
          Snapshot gerado em {formatDateTime(snapshot.generatedAt)}.
        </p>
      </SectionCard>
    </div>
  );
}
