import { GlassCard } from "./glass-card";
import { cn } from "@/lib/utils";

interface GrowthBreakdownItem {
  label: string;
  value: number;
  accent: "cyan" | "violet";
}

interface GrowthMetricsCardProps {
  value: number;
  label: string;
  metaLabel: string;
  breakdown: GrowthBreakdownItem[];
  className?: string;
}

/**
 * GrowthMetricsCard - Shows large metric with growth indicator and mini chart
 * Used in dashboard for key metrics like subscriber count
 */
export function GrowthMetricsCard({
  value,
  label,
  metaLabel,
  breakdown,
  className,
}: GrowthMetricsCardProps) {
  const maxValue = Math.max(1, ...breakdown.map((item) => item.value));
  const accentClasses = {
    cyan: {
      badge: "bg-primary-container/20 text-primary-container",
      bar: "bg-primary-container shadow-[0_0_18px_rgba(0,229,255,0.22)]",
    },
    violet: {
      badge: "bg-violet-500/15 text-violet-300",
      bar: "bg-violet-400 shadow-[0_0_18px_rgba(167,139,250,0.18)]",
    },
  } as const;

  return (
    <GlassCard className={cn("bg-gradient-to-br from-primary-container/10 via-transparent to-transparent flex flex-col justify-between", className)}>
      <div>
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-bold text-primary-container uppercase tracking-widest">
            Growth Metrics
          </span>
          <span className="bg-primary-container/20 text-primary-container px-2 py-1 rounded text-[10px] font-bold">
            {metaLabel}
          </span>
        </div>
        <h3 className="text-5xl font-black text-on-surface mb-2">
          {value.toLocaleString()}
        </h3>
        <p className="text-sm text-neutral-400">{label}</p>
      </div>

      <div className="mt-8 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {breakdown.map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-outline-variant/30 bg-surface-container-low px-3 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
                  {item.label}
                </span>
                <span className={cn("rounded-full px-2 py-1 text-[10px] font-bold", accentClasses[item.accent].badge)}>
                  {item.value.toLocaleString()}
                </span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-neutral-800">
                <div
                  className={cn("h-full rounded-full transition-all duration-300", accentClasses[item.accent].bar)}
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
