import { cn } from "@/lib/utils";
import React from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaColor?: "emerald" | "amber" | "rose" | "cyan";
  progressPercent?: number;
  hint?: string;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * StatCard - Metric display card with optional progress bar
 * Combines label, large value, delta badge, and progress visualization
 */
export function StatCard({
  label,
  value,
  delta,
  deltaColor = "cyan",
  progressPercent,
  hint,
  icon,
  className,
}: StatCardProps) {
  const deltaColorMap = {
    emerald: "bg-emerald-400/10 text-emerald-400",
    amber: "bg-amber-400/10 text-amber-400",
    rose: "bg-rose-500/10 text-rose-400",
    cyan: "bg-primary-container/10 text-primary-container",
  };

  const progressColorMap = {
    emerald: "bg-emerald-400",
    amber: "bg-amber-400",
    rose: "bg-rose-500",
    cyan: "bg-primary-container",
  };

  return (
    <div
      className={cn(
        "bg-surface-container rounded-xl p-6 border border-outline-variant/30 flex flex-col justify-between",
        className
      )}
    >
      {/* Header: Label + Icon + Delta Badge */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          {icon && <div className="text-primary-container">{icon}</div>}
          <span className="text-neutral-400 text-xs font-bold uppercase tracking-widest">
            {label}
          </span>
        </div>
        {delta && (
          <span className={cn("px-2 py-1 rounded text-[10px] font-bold", deltaColorMap[deltaColor])}>
            {delta}
          </span>
        )}
      </div>

      {/* Large Value */}
      <div className="mt-2">
        <h3 className="text-3xl font-black text-on-surface">{value}</h3>
      </div>

      {/* Progress Bar (optional) */}
      {progressPercent !== undefined && (
        <div className="w-full h-1 bg-neutral-800 mt-4 rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-600", progressColorMap[deltaColor])}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Hint Text */}
      {hint && <p className="text-xs text-neutral-500 mt-3">{hint}</p>}
    </div>
  );
}
