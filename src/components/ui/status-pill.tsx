import { cn, statusTone } from "@/lib/utils";

const labelMap: Record<string, string> = {
  neutral:        "neutro",
  good:           "saudável",
  up:             "online",
  degraded:       "degradado",
  down:           "offline",
  healthy:        "saudável",
  attention:      "atenção",
  critical:       "crítico",
  stable:         "estável",
  monitoring:     "monitorando",
  needs_follow_up:"follow-up",
  escalated:      "escalado",
  info:           "info",
  warning:        "alerta",
  open:           "aberto",
  investigating:  "investigando",
  mitigated:      "mitigado",
  resolved:       "resolvido",
};

const toneConfig = {
  neutral: {
    pill:  "border-[var(--border-default)] bg-white text-[var(--text-tertiary)]",
    dot:   "bg-[var(--status-gray)]",
  },
  good: {
    pill:  "border-[var(--status-green-border)] bg-[var(--status-green-bg)] text-[var(--status-green)]",
    dot:   "bg-[var(--status-green)]",
  },
  warning: {
    pill:  "border-[var(--status-yellow-border)] bg-[var(--status-yellow-bg)] text-[var(--status-yellow)]",
    dot:   "bg-[var(--status-yellow)]",
  },
  critical: {
    pill:  "border-[var(--status-red-border)] bg-[var(--status-red-bg)] text-[var(--status-red)]",
    dot:   "bg-[var(--status-red)] animate-pulse-slow",
  },
};

export function StatusPill({ value }: { value: string }) {
  const tone = statusTone(value as never);
  const config = toneConfig[tone];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-[0.05em] uppercase",
        config.pill,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", config.dot)} />
      {labelMap[value] ?? value}
    </span>
  );
}
