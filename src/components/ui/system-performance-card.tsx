"use client";

import { GlassCard } from "./glass-card";
import { cn, formatDateTime } from "@/lib/utils";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const TICK_COLOR = "rgba(186, 201, 204, 0.5)";
const GRID_COLOR = "rgba(59, 73, 76, 0.3)";

export interface SystemPerformancePoint {
  label: string;
  cpu: number | null;
  memory: number | null;
  disk: number | null;
}

interface SystemPerformanceCardProps {
  averages: {
    cpu: number;
    memory: number;
    disk: number;
  };
  data: SystemPerformancePoint[];
  monitoredNodes: number;
  lastHeartbeatAt?: string | null;
  className?: string;
}

function MetricPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "cyan" | "emerald" | "violet";
}) {
  const toneClasses = {
    cyan: "border-primary-container/20 bg-primary-container/10 text-primary-container",
    emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
    violet: "border-violet-500/20 bg-violet-500/10 text-violet-300",
  } as const;

  return (
    <div className={cn("rounded-xl border px-4 py-3", toneClasses[tone])}>
      <p className="text-[10px] font-bold uppercase tracking-[0.14em]">{label}</p>
      <p className="mt-2 text-2xl font-black">{value.toFixed(1)}%</p>
    </div>
  );
}

export function SystemPerformanceCard({
  averages,
  data,
  monitoredNodes,
  lastHeartbeatAt,
  className,
}: SystemPerformanceCardProps) {
  return (
    <GlassCard className={cn("rounded-xl overflow-hidden", className)}>
      <div className="flex flex-col gap-4 border-b border-outline-variant/30 pb-5 md:flex-row md:items-start md:justify-between">
        <div>
          <h4 className="text-on-surface font-bold">System Performance</h4>
          <p className="mt-1 text-xs text-neutral-500">
            Heartbeats reais agregados das ultimas 12 horas.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-outline-variant/40 bg-surface-container-high px-3 py-1 text-[11px] font-bold text-neutral-300">
            {monitoredNodes} nodo(s) monitorado(s)
          </span>
          {lastHeartbeatAt ? (
            <span className="rounded-full border border-outline-variant/40 bg-surface-container-high px-3 py-1 text-[11px] font-bold text-neutral-300">
              ultimo heartbeat {formatDateTime(lastHeartbeatAt)}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <MetricPill label="CPU media" value={averages.cpu} tone="cyan" />
        <MetricPill label="Memoria media" value={averages.memory} tone="emerald" />
        <MetricPill label="Disco medio" value={averages.disk} tone="violet" />
      </div>

      <div className="mt-6 h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid stroke={GRID_COLOR} strokeDasharray="4 4" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: TICK_COLOR, fontSize: 11, fontWeight: 500 }}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: TICK_COLOR, fontSize: 11, fontWeight: 500 }}
              tickLine={false}
              axisLine={false}
              dx={-10}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(32, 31, 31, 0.95)",
                backdropFilter: "blur(12px)",
                borderColor: "rgba(0, 229, 255, 0.2)",
                borderRadius: "12px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                color: "#e5e2e1",
                fontSize: "12px",
                fontWeight: 500,
              }}
              itemStyle={{ color: "#bac9cc", fontWeight: 600 }}
            />
            <Line
              type="monotone"
              dataKey="cpu"
              connectNulls
              stroke="#00E5FF"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#00E5FF", strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="memory"
              connectNulls
              stroke="#34d399"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#34d399", strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="disk"
              connectNulls
              stroke="#a78bfa"
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={false}
              activeDot={{ r: 4, fill: "#a78bfa", strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
