import type { MetricSnapshot } from "@/lib/types";
import { cn } from "@/lib/utils";

const toneMap = {
  neutral: "border-[var(--panel-border)] bg-[var(--panel-bg)] hover:border-[rgba(255,255,255,0.15)] transition-colors",
  good: "border-[var(--success-muted)] bg-[var(--panel-bg)] hover:border-[var(--success)] transition-colors shadow-[inset_0_1px_0_var(--success-muted)]",
  warning: "border-[var(--warning-muted)] bg-[var(--panel-bg)] hover:border-[var(--warning)] transition-colors",
  critical: "border-[var(--danger-muted)] bg-[var(--panel-bg)] hover:border-[var(--danger)] transition-colors shadow-[0_0_20px_var(--danger-muted)]",
};

export function MetricCard({ metric }: { metric: MetricSnapshot }) {
  return (
    <article
      className={cn(
        "oled-panel rounded-[20px] p-5",
        toneMap[metric.tone ?? "neutral"],
      )}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
        {metric.label}
      </p>
      <p className="data-value mt-4 text-3xl font-semibold tracking-tight text-white">
        {metric.value}
      </p>
      <p className="data-value mt-3 text-[13px] font-medium text-[var(--primary)]">
        {metric.delta}
      </p>
      <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
        {metric.hint}
      </p>
    </article>
  );
}
