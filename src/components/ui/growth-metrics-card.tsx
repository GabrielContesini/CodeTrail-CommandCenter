import { GlassCard } from "./glass-card";
import { cn } from "@/lib/utils";

interface GrowthMetricsCardProps {
  value: number;
  label: string;
  deltaPercent: number;
  chartData?: number[]; // Array de valores para sparkline
  className?: string;
}

/**
 * GrowthMetricsCard - Shows large metric with growth indicator and mini chart
 * Used in dashboard for key metrics like subscriber count
 */
export function GrowthMetricsCard({
  value,
  label,
  deltaPercent,
  chartData = [40, 60, 55, 75, 90, 100],
  className,
}: GrowthMetricsCardProps) {
  // Calculate the max value for scaling
  const maxValue = Math.max(...chartData);

  return (
    <GlassCard className={cn("bg-gradient-to-br from-primary-container/10 via-transparent to-transparent flex flex-col justify-between", className)}>
      <div>
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-bold text-primary-container uppercase tracking-widest">
            Growth Metrics
          </span>
          <span className="bg-primary-container/20 text-primary-container px-2 py-1 rounded text-[10px] font-bold">
            +{deltaPercent}% WoW
          </span>
        </div>
        <h3 className="text-5xl font-black text-on-surface mb-2">
          {value.toLocaleString()}
        </h3>
        <p className="text-sm text-neutral-400">{label}</p>
      </div>

      {/* Mini bar chart */}
      <div className="mt-8 flex items-end gap-1 h-24">
        {chartData.map((value, index) => (
          <div
            key={index}
            className={cn(
              "flex-1 rounded-t-sm transition-all",
              index === chartData.length - 1
                ? "bg-primary-container shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                : "bg-primary-container/20"
            )}
            style={{
              height: `${(value / maxValue) * 100}%`,
              minHeight: "4px",
            }}
          />
        ))}
      </div>
    </GlassCard>
  );
}
