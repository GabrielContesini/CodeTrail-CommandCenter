import { cn, statusTone } from "@/lib/utils";

const toneClassMap = {
  neutral: "border-white/10 bg-white/6 text-[var(--text-secondary)]",
  good: "border-[rgba(53,211,154,0.2)] bg-[rgba(53,211,154,0.12)] text-[var(--success)]",
  warning: "border-[rgba(255,209,102,0.24)] bg-[rgba(255,209,102,0.12)] text-[var(--accent-warning)]",
  critical: "border-[rgba(255,126,139,0.24)] bg-[rgba(255,126,139,0.12)] text-[var(--accent-danger)]",
};

const labelMap: Record<string, string> = {
  neutral: "neutral",
  good: "good",
  up: "up",
  degraded: "degraded",
  down: "down",
  healthy: "healthy",
  attention: "attention",
  critical: "critical",
  stable: "stable",
  monitoring: "monitoring",
  needs_follow_up: "follow-up",
  escalated: "escalated",
  info: "info",
  warning: "warning",
  open: "open",
  investigating: "investigating",
  mitigated: "mitigated",
  resolved: "resolved",
};

export function StatusPill({ value }: { value: string }) {
  const tone = statusTone(value as never);

  return (
    <span
      className={cn(
        "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]",
        toneClassMap[tone],
      )}
    >
      {labelMap[value] ?? value}
    </span>
  );
}
