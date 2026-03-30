import type { MetricSnapshot } from "@/lib/types";
import { cn } from "@/lib/utils";

const toneConfig = {
  neutral: {
    card: "border-[var(--border-neutral)] bg-[var(--bg-surface-container)]",
    label: "text-[var(--text-quaternary)]",
    value: "text-[var(--text-primary)]",
    delta: "text-[var(--accent)]",
    bar: "bg-[var(--accent)]",
    badge: "bg-[var(--accent-light)] text-[var(--accent)]",
    dot: "bg-[var(--accent)]",
  },
  good: {
    card: "border-[var(--status-green-border)] bg-[var(--bg-surface-container)]",
    label: "text-[var(--text-quaternary)]",
    value: "text-[var(--text-primary)]",
    delta: "text-[var(--status-green)]",
    bar: "bg-[var(--status-green)]",
    badge: "bg-[var(--status-green-bg)] text-[var(--status-green)]",
    dot: "bg-[var(--status-green)]",
  },
  warning: {
    card: "border-[var(--status-yellow-border)] bg-[var(--bg-surface-container)]",
    label: "text-[var(--text-quaternary)]",
    value: "text-[var(--text-primary)]",
    delta: "text-[var(--status-yellow)]",
    bar: "bg-[var(--status-yellow)]",
    badge: "bg-[var(--status-yellow-bg)] text-[var(--status-yellow)]",
    dot: "bg-[var(--status-yellow)]",
  },
  critical: {
    card: "border-[var(--status-red-border)] bg-[var(--bg-surface-container)]",
    label: "text-[var(--text-quaternary)]",
    value: "text-[var(--text-primary)]",
    delta: "text-[var(--status-red)]",
    bar: "bg-[var(--status-red)]",
    badge: "bg-[var(--status-red-bg)] text-[var(--status-red)]",
    dot: "bg-[var(--status-red)] animate-pulse-slow",
  },
};

export function MetricCard({ metric }: { metric: MetricSnapshot }) {
  const tone = metric.tone ?? "neutral";
  const config = toneConfig[tone];

  return (
    <article
      className={cn(
        "group relative rounded-xl border p-6 transition-all duration-200 hover:border-[var(--border-default)]",
        config.card,
      )}
    >
      {/* Top row: label + delta badge */}
      <div className="flex items-start justify-between">
        <span className={cn("text-xs font-bold uppercase tracking-widest", config.label)}>
          {metric.label}
        </span>
        {metric.delta && (
          <span className={cn("text-xs font-bold px-2 py-0.5 rounded", config.badge)}>
            {metric.delta}
          </span>
        )}
      </div>

      {/* Value */}
      <p
        className={cn(
          "mt-4 text-3xl font-black leading-none tracking-tight",
          config.value,
        )}
      >
        {metric.value}
      </p>

      {/* Thin progress bar */}
      <div className="w-full h-1 bg-[var(--border-neutral)] mt-4 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-600", config.bar)}
          style={{ width: "68%" }}
        />
      </div>

      {/* Hint */}
      {metric.hint && (
        <p className="mt-3 text-xs leading-relaxed text-[var(--text-tertiary)]">
          {metric.hint}
        </p>
      )}
    </article>
  );
}
