import type { MetricSnapshot } from "@/lib/types";
import { cn } from "@/lib/utils";

const toneMap = {
  neutral: "border-white/8 bg-black/10",
  good: "border-[rgba(53,211,154,0.16)] bg-[rgba(53,211,154,0.08)]",
  warning: "border-[rgba(255,209,102,0.18)] bg-[rgba(255,209,102,0.08)]",
  critical: "border-[rgba(255,126,139,0.18)] bg-[rgba(255,126,139,0.08)]",
};

export function MetricCard({ metric }: { metric: MetricSnapshot }) {
  return (
    <article
      className={cn(
        "panel-ring rounded-[28px] border p-5",
        toneMap[metric.tone ?? "neutral"],
      )}
    >
      <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-secondary)]">
        {metric.label}
      </p>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-white">
        {metric.value}
      </p>
      <p className="mt-3 text-sm font-medium text-[var(--accent-secondary)]">
        {metric.delta}
      </p>
      <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
        {metric.hint}
      </p>
    </article>
  );
}
