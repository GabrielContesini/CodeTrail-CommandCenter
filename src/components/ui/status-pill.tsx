import { cn, statusTone } from "@/lib/utils";

const toneClassMap = {
  neutral: "border-[var(--panel-border)] bg-[var(--panel-bg)] text-[var(--text-secondary)]",
  good: "border-[var(--success-muted)] bg-[var(--success-muted)] text-[var(--success)] glow-text-success",
  warning: "border-[var(--warning-muted)] bg-[var(--warning-muted)] text-[var(--warning)]",
  critical: "border-[var(--danger-muted)] bg-[var(--danger-muted)] text-[var(--danger)] glow-text-danger animate-pulse-slow",
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
