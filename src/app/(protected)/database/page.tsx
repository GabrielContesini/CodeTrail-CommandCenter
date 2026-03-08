import { DatabaseChart } from "@/components/charts/database-chart";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatusPill } from "@/components/ui/status-pill";
import { getCommandCenterSnapshot } from "@/lib/command-center-data";
import { formatCompactNumber, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DatabasePage() {
  const snapshot = await getCommandCenterSnapshot();
  const queue = snapshot.database.find((item) => item.tableName === "sync_queue");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Banco e operacao"
        title="Utilizacao do banco e gargalos de persistencia"
        description="Contagem por tabela, pressao na fila de sincronizacao e leitura rapida da camada de dados do produto."
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
          title="Distribuicao de volume"
          subtitle="Acompanhamento das tabelas mais importantes para produto e suporte."
        >
          <DatabaseChart data={snapshot.database} />
        </SectionCard>

        <SectionCard
          title="Checklist operacional"
          subtitle="Leitura direta para o operador agir rapido."
        >
          <div className="space-y-3">
            {snapshot.database.map((item) => (
              <div
                key={item.tableName}
                className="rounded-3xl border border-white/8 bg-black/10 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      {item.description}
                    </p>
                  </div>
                  <StatusPill value={item.health} />
                </div>
                <p className="mt-4 text-2xl font-semibold text-white">
                  {formatCompactNumber(item.rowCount)}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>

      <SectionCard
        title="Runbook desta superficie"
        subtitle="O que validar quando a saude do banco ou da fila sair do esperado."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            "Confirmar se study_sessions segue crescendo em linha com o uso recente.",
            "Checar sync_queue por explosao de backlog, tentativas e mensagens de erro.",
            "Observar notas e revisoes quando o volume do produto crescer mais rapido que o previsto.",
          ].map((item) => (
            <div
              key={item}
              className="rounded-3xl border border-white/8 bg-black/10 p-4 text-sm text-[var(--text-secondary)]"
            >
              {item}
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-[var(--text-secondary)]">
          Snapshot gerado em {formatDateTime(snapshot.generatedAt)}.
        </p>
      </SectionCard>
    </div>
  );
}
