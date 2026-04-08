import { getAdminAccess } from "@/lib/auth";
import { getBillingOverview } from "@/lib/billing-data";
import type { BillingOverview } from "@/lib/types";
import { cn, formatCompactNumber, formatRelativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

function centsToDisplay(cents: number) {
  if (cents >= 100_00) {
    return formatCompactNumber(Math.round(cents / 100));
  }
  return (cents / 100).toFixed(2);
}

function formatMonthLabel(month: string) {
  const [year, m] = month.split("-");
  const date = new Date(Number(year), Number(m) - 1, 1);
  return date
    .toLocaleDateString("pt-BR", { month: "short" })
    .toUpperCase()
    .replace(".", "");
}

export default async function BillingPage() {
  const [overview, access] = await Promise.all([
    getBillingOverview(),
    getAdminAccess(),
  ]);

  const role = access?.profile?.role ?? "viewer";
  const canView = role === "owner" || role === "admin" || role === "operator";

  if (!canView) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-low)] p-8 text-center max-w-md">
          <span className="material-symbols-outlined text-4xl text-[var(--text-quaternary)] mb-4 block">
            lock
          </span>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">
            Acesso restrito
          </h3>
          <p className="mt-2 text-sm text-[var(--text-tertiary)]">
            Seu papel ({role}) não tem permissão para visualizar dados
            financeiros.
          </p>
        </div>
      </div>
    );
  }

  if (!overview.hasProductSource) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header>
          <h2 className="text-3xl font-black text-white tracking-tight">
            Payment Monitoring
          </h2>
          <p className="text-[var(--text-tertiary)] mt-1">
            Monitoramento financeiro e ciclo de vida de assinaturas.
          </p>
        </header>
        <div className="rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-low)] p-8 text-center">
          <span className="material-symbols-outlined text-5xl text-[var(--text-quaternary)] mb-4 block">
            database
          </span>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">
            Fonte de dados não configurada
          </h3>
          <p className="mt-2 text-sm text-[var(--text-tertiary)] max-w-lg mx-auto">
            Configure{" "}
            <code className="mx-1 rounded-md border border-[var(--border-neutral)] bg-[var(--bg-surface-high)] px-1.5 py-0.5 font-mono text-xs text-[var(--accent)]">
              PRODUCT_SUPABASE_URL
            </code>{" "}
            e{" "}
            <code className="mx-1 rounded-md border border-[var(--border-neutral)] bg-[var(--bg-surface-high)] px-1.5 py-0.5 font-mono text-xs text-[var(--accent)]">
              PRODUCT_SUPABASE_SERVICE_ROLE_KEY
            </code>{" "}
            para visualizar dados reais de billing do CodeTrail App.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <section className="flex flex-col lg:flex-row justify-between items-start gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">
            Payment Monitoring
          </h2>
          <p className="text-[var(--text-tertiary)] mt-1">
            Monitoramento financeiro e ciclo de vida de assinaturas.
          </p>
        </div>

        {overview.failedPayments30d > 0 && (
          <div className="flex-1 max-w-xl w-full">
            <div className="bg-[var(--status-red-bg)]/30 border border-[var(--status-red-border)] rounded-xl p-4 flex items-center gap-4 relative overflow-hidden shadow-sm">
              <div className="absolute inset-y-0 left-0 w-1 bg-[var(--status-red)]" />
              <div className="bg-[var(--status-red)]/20 text-[var(--status-red)] w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined">
                  report_problem
                </span>
              </div>
              <div className="flex-1">
                <h4 className="text-[var(--status-red)] text-sm font-bold">
                  {overview.failedPayments30d} pagamento(s) com falha
                </h4>
                <p className="text-neutral-500 text-xs mt-0.5">
                  Nos últimos 30 dias. Verifique integração com o gateway.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── Metric Cards ───────────────────────────────────────────────── */}
      <BillingMetricCards overview={overview} />

      {/* ── Charts Grid ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-6">
        <RevenueChart monthlyRevenue={overview.monthlyRevenue} />
        <PlanDistributionChart
          planBreakdown={overview.planBreakdown}
          activeSubs={overview.activeSubs}
        />
      </div>

      {/* ── Recent Subscribers Table ───────────────────────────────────── */}
      <RecentSubscribersTable subscribers={overview.recentSubscriptions} />
    </div>
  );
}

// ── Metric Cards ──────────────────────────────────────────────────────────────

function BillingMetricCards({ overview }: { overview: BillingOverview }) {
  const cards = [
    {
      label: "Receita total",
      value: `R$ ${centsToDisplay(overview.totalRevenueCents)}`,
      icon: "payments",
      sub: `Mês atual: R$ ${centsToDisplay(overview.currentMonthCents)}`,
    },
    {
      label: "MRR",
      value: `R$ ${centsToDisplay(overview.mrr)}`,
      icon: "trending_up",
      sub: `ARR: R$ ${centsToDisplay(overview.arr)}`,
    },
    {
      label: "Assinaturas ativas",
      value: String(overview.activeSubs),
      icon: "group",
      sub: `${overview.newSubs30d} nova(s) em 30d · ${overview.totalSubs} total`,
    },
    {
      label: "Churn 30d",
      value: `${(Math.round(overview.churnRate30d * 10) / 10).toFixed(1)}%`,
      icon: "person_remove",
      sub: `${overview.canceledSubs30d} cancelamento(s)`,
    },
    {
      label: "ARPU",
      value: `R$ ${centsToDisplay(overview.arpu)}`,
      icon: "leaderboard",
      sub: "Receita média por assinante ativo",
    },
    {
      label: "Receita 7d / 30d",
      value: `R$ ${centsToDisplay(overview.revenue7dCents)}`,
      icon: "calendar_month",
      sub: `30d: R$ ${centsToDisplay(overview.revenue30dCents)}`,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-[var(--bg-surface-high)] rounded-xl p-5 border border-neutral-800 relative group overflow-hidden shadow-inner flex flex-col justify-between min-h-[120px]"
        >
          <div className="absolute -right-3 -top-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="material-symbols-outlined text-6xl text-[var(--accent)]">
              {card.icon}
            </span>
          </div>
          <p className="text-neutral-400 text-[10px] font-bold uppercase tracking-widest mb-3">
            {card.label}
          </p>
          <h3 className="text-xl font-black text-white tabular-nums">
            {card.value}
          </h3>
          <p className="text-[10px] text-neutral-500 mt-1.5 truncate">
            {card.sub}
          </p>
        </div>
      ))}
    </div>
  );
}

// ── Revenue Chart ─────────────────────────────────────────────────────────────

function RevenueChart({
  monthlyRevenue,
}: {
  monthlyRevenue: BillingOverview["monthlyRevenue"];
}) {
  if (monthlyRevenue.length === 0) {
    return (
      <div className="col-span-12 xl:col-span-8 bg-[var(--bg-surface-low)] rounded-xl border border-neutral-800 p-8 flex items-center justify-center min-h-[320px]">
        <p className="text-sm text-[var(--text-quaternary)]">
          Nenhum dado de receita disponível.
        </p>
      </div>
    );
  }

  const maxAmount = Math.max(...monthlyRevenue.map((m) => m.amountCents), 1);

  return (
    <div className="col-span-12 xl:col-span-8 bg-[var(--bg-surface-low)] rounded-xl border border-neutral-800 shadow-inner flex flex-col overflow-hidden">
      <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/40">
        <div>
          <h4 className="text-white font-bold">Receita por período</h4>
          <p className="text-xs text-neutral-500">Últimos 6 meses</p>
        </div>
      </div>
      <div className="flex-1 p-6 flex flex-col justify-end">
        <div className="flex items-end justify-between gap-3 h-52">
          {monthlyRevenue.map((item) => {
            const heightPercent = Math.max(
              8,
              (item.amountCents / maxAmount) * 100,
            );
            return (
              <div
                key={item.month}
                className={cn(
                  "flex-1 relative group transition-all rounded-t-lg",
                  item.isCurrent
                    ? "bg-[var(--accent)] shadow-[0_0_20px_var(--accent-subtle)]"
                    : "bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20",
                )}
                style={{ height: `${heightPercent}%` }}
              >
                <p
                  className={cn(
                    "absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold",
                    item.isCurrent
                      ? "text-[var(--accent)]"
                      : "text-neutral-500",
                  )}
                >
                  {formatMonthLabel(item.month)}
                </p>
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-neutral-900 border border-[var(--accent)] px-2 py-1 rounded text-[10px] font-bold text-white shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  R$ {centsToDisplay(item.amountCents)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Plan Distribution ─────────────────────────────────────────────────────────

function PlanDistributionChart({
  planBreakdown,
  activeSubs,
}: {
  planBreakdown: BillingOverview["planBreakdown"];
  activeSubs: number;
}) {
  const colorMap: Record<string, [string, string]> = {
    free: ["bg-neutral-600", "text-neutral-600"],
    pro: ["bg-cyan-400", "text-cyan-400"],
    founding: ["bg-cyan-700", "text-cyan-700"],
  };

  if (planBreakdown.length === 0) {
    return (
      <div className="col-span-12 xl:col-span-4 bg-[var(--bg-surface-low)] rounded-xl border border-neutral-800 p-6 flex items-center justify-center">
        <p className="text-sm text-[var(--text-quaternary)]">
          Nenhum plano ativo.
        </p>
      </div>
    );
  }

  const circumference = 527.78;
  let currentOffset = 0;

  return (
    <div className="col-span-12 xl:col-span-4 bg-[var(--bg-surface-low)] rounded-xl border border-neutral-800 p-6 flex flex-col shadow-inner">
      <h4 className="text-white font-bold mb-6">Distribuição por plano</h4>
      <div className="flex-1 flex flex-col justify-center items-center py-4">
        <div className="w-48 h-48 relative flex items-center justify-center shadow-inner rounded-full">
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 192 192"
          >
            <circle
              cx="96"
              cy="96"
              r="84"
              fill="none"
              stroke="currentColor"
              className="text-neutral-800/50"
              strokeWidth="12"
            />
            {planBreakdown.map((plan) => {
              const [, textClass] = colorMap[plan.planCode] ?? [
                "bg-cyan-400",
                "text-cyan-400",
              ];
              const dashLength = (plan.percentage / 100) * circumference;
              const gapLength = circumference - dashLength;
              const circle = (
                <circle
                  key={plan.planCode}
                  className={cn("transition-all duration-1000", textClass)}
                  cx="96"
                  cy="96"
                  r="84"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12"
                  strokeDasharray={`${dashLength} ${gapLength}`}
                  strokeDashoffset={-currentOffset}
                />
              );
              currentOffset += dashLength;
              return circle;
            })}
          </svg>
          <div className="text-center z-10 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-white tracking-tight">
              {activeSubs >= 1000
                ? `${(activeSubs / 1000).toFixed(1)}k`
                : activeSubs}
            </span>
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold mt-1 leading-[1.2]">
              Assinantes
              <br />
              ativos
            </p>
          </div>
        </div>

        <div className="w-full mt-8 space-y-3">
          {planBreakdown.map((plan) => {
            const [bgClass] = colorMap[plan.planCode] ?? ["bg-cyan-400"];
            return (
              <div
                key={plan.planCode}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn("w-2 h-2 rounded-full shadow-sm", bgClass)}
                  />
                  <span className="text-neutral-400">{plan.planName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-neutral-500 tabular-nums">
                    {plan.activeCount}
                  </span>
                  <span className="font-bold text-white tabular-nums">
                    {plan.percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Recent Subscribers Table ──────────────────────────────────────────────────

function RecentSubscribersTable({
  subscribers,
}: {
  subscribers: BillingOverview["recentSubscriptions"];
}) {
  if (subscribers.length === 0) {
    return (
      <div className="bg-[var(--bg-surface-low)] rounded-xl border border-neutral-800 p-8 text-center">
        <span className="material-symbols-outlined text-4xl text-[var(--text-quaternary)] mb-3 block">
          group_off
        </span>
        <p className="text-sm text-[var(--text-tertiary)]">
          Nenhuma assinatura recente encontrada.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-surface-low)] rounded-xl border border-neutral-800 overflow-hidden shadow-inner">
      <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/40">
        <h4 className="text-white font-bold">Assinantes recentes</h4>
        <span className="text-xs text-neutral-500 tabular-nums">
          {subscribers.length} registro(s)
        </span>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#1c1b1b] border-b border-neutral-800">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-500">
                Usuário
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-500">
                Plano
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-500">
                Valor
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-500">
                Status
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-500">
                Atualizado
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/50">
            {subscribers.map((sub) => (
              <tr
                key={`${sub.userId}-${sub.updatedAt}`}
                className="hover:bg-[var(--bg-surface-high)]/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center font-bold text-[var(--accent)] text-xs border border-neutral-700 shadow-sm">
                      {sub.userInitials}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">
                        {sub.userName}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {sub.userEmail}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 uppercase tracking-tighter">
                    {sub.planName}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-white tabular-nums">
                    R$ {(sub.priceCents / 100).toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <SubscriptionStatusBadge status={sub.status} />
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs text-neutral-400">
                    {sub.updatedAt ? formatRelativeTime(sub.updatedAt) : "—"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────────────────────────────

function SubscriptionStatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; label: string }> = {
    active: { color: "var(--status-green)", label: "Ativa" },
    trialing: { color: "var(--accent)", label: "Trial" },
    canceled: { color: "var(--status-red)", label: "Cancelada" },
    expired: { color: "var(--status-red)", label: "Expirada" },
    past_due: { color: "var(--status-yellow, #facc15)", label: "Vencida" },
    unpaid: { color: "var(--status-red)", label: "Não paga" },
  };

  const cfg = config[status] ?? {
    color: "var(--text-quaternary)",
    label: status,
  };

  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-bold"
      style={{ color: cfg.color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{
          backgroundColor: cfg.color,
          boxShadow: `0 0 5px ${cfg.color}`,
        }}
      />
      {cfg.label}
    </span>
  );
}
