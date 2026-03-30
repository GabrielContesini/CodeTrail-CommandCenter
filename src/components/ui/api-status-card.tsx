import React from "react";
import { GlassCard } from "./glass-card";
import { StatCard } from "./stat-card";
import { StatusBadge } from "./status-badge";
import { cn } from "@/lib/utils";

interface APIStatus {
  name: string;
  status: "online" | "degrading" | "offline";
  icon?: React.ReactNode;
}

interface APIStatusCardProps {
  statuses: APIStatus[];
  className?: string;
}

/**
 * APIStatusCard - Shows real-time API status with indicators
 * Used in dashboard to display system health
 */
export function APIStatusCard({ statuses, className }: APIStatusCardProps) {
  return (
    <GlassCard className={cn("flex flex-col justify-between", className)}>
      <div>
        <div className="flex justify-between items-start mb-4">
          <span className="text-xs font-bold text-primary-container uppercase tracking-widest">
            Real-time API Status
          </span>
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>

        <div className="space-y-3">
          {statuses.map((api) => {
            const statusConfig = {
              online: {
                bg: "bg-emerald-500/10",
                border: "border-emerald-500/20",
                icon: "✓",
                color: "text-emerald-200",
                badge: "bg-emerald-500 text-white",
              },
              degrading: {
                bg: "bg-amber-500/10",
                border: "border-amber-500/20",
                icon: "⚠",
                color: "text-amber-200",
                badge: "bg-amber-500 text-white",
              },
              offline: {
                bg: "bg-rose-500/10",
                border: "border-rose-500/20",
                icon: "✕",
                color: "text-rose-200",
                badge: "bg-rose-500 text-white",
              },
            };

            const config = statusConfig[api.status];

            return (
              <div
                key={api.name}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border",
                  config.bg,
                  config.border
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{config.icon}</span>
                  <span className={cn("text-sm font-medium", config.color)}>
                    {api.name}
                  </span>
                </div>
                <span className={cn("text-[10px] font-bold px-2 py-1 rounded", config.badge)}>
                  {api.status.toUpperCase()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}
