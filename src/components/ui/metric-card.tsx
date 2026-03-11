import type { MetricSnapshot } from "@/lib/types";
import { cn } from "@/lib/utils";

const toneConfig = {
  neutral: {
    card: "border-[var(--border-subtle)] bg-[var(--bg-elevated)]",
    label: "text-[var(--text-tertiary)]",
    value: "text-[var(--text-primary)]",
    delta: "text-[var(--accent-mid)]",
    bar: "from-[var(--accent)] to-[var(--accent-mid)]",
    dot: "bg-[var(--accent-mid)]",
  },
  good: {
    card: "border-[var(--status-green-border)] bg-[var(--bg-elevated)]",
    label: "text-[var(--text-tertiary)]",
    value: "text-[var(--text-primary)]",
    delta: "text-[var(--status-green)]",
    bar: "from-[var(--status-green)] to-emerald-400",
    dot: "bg-[var(--status-green)]",
  },
  warning: {
    card: "border-[var(--status-yellow-border)] bg-[var(--bg-elevated)]",
    label: "text-[var(--text-tertiary)]",
    value: "text-[var(--text-primary)]",
    delta: "text-[var(--status-yellow)]",
    bar: "from-[var(--status-yellow)] to-amber-400",
    dot: "bg-[var(--status-yellow)]",
  },
  critical: {
    card: "border-[var(--status-red-border)] bg-[var(--bg-elevated)]",
    label: "text-[var(--text-tertiary)]",
    value: "text-[var(--text-primary)]",
    delta: "text-[var(--status-red)]",
    bar: "from-[var(--status-red)] to-red-400",
    dot: "bg-[var(--status-red)]",
  },
};

export function MetricCard({ metric }: { metric: MetricSnapshot }) {
  const tone = metric.tone ?? "neutral";
  const config = toneConfig[tone];

  return (
    <article
      className={cn(
        "group relative rounded-[16px] border p-5 shadow-[var(--shadow-card)] hover-lift",
        config.card,
      )}
    >
      {/* Top row: label + dot */}
      <div className="flex items-center justify-between">
        <p className={cn("label-caps", config.label)}>{metric.label}</p>
        <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      </div>

      {/* Value */}
      <p
        className={cn(
          "data-value mt-4 text-[2rem] font-semibold leading-none tracking-tight",
          config.value,
        )}
      >
        {metric.value}
      </p>

      {/* Delta / trend */}
      <p className={cn("mt-2.5 text-[12px] font-semibold leading-none", config.delta)}>
        {metric.delta}
      </p>

      {/* Thin progress bar */}
      <div className="progress-bar-track mt-4">
        <div
          className={cn("progress-bar-fill bg-gradient-to-r", config.bar)}
          style={{ width: "68%" }}
        />
      </div>

      {/* Hint */}
      <p className="mt-3 text-[12px] leading-[1.5] text-[var(--text-tertiary)]">
        {metric.hint}
      </p>
    </article>
  );
}
