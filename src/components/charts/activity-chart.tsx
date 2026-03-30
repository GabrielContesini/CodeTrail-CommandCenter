"use client";

import type { ActivityPoint } from "@/lib/types";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const TICK_COLOR = "rgba(186, 201, 204, 0.5)";
const GRID_COLOR = "rgba(59, 73, 76, 0.3)";

export function ActivityChart({ data }: { data: ActivityPoint[] }) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="sessionsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00E5FF" stopOpacity={0.20} />
              <stop offset="100%" stopColor="#00E5FF" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="syncFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity={0.20} />
              <stop offset="100%" stopColor="#34d399" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={GRID_COLOR} strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: TICK_COLOR, fontSize: 11, fontWeight: 500 }}
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis
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
          <Area
            type="monotone"
            dataKey="sessions"
            stroke="#00E5FF"
            strokeWidth={2}
            fill="url(#sessionsFill)"
            activeDot={{ r: 5, strokeWidth: 0, fill: "#00E5FF" }}
          />
          <Area
            type="monotone"
            dataKey="syncBacklog"
            stroke="#34d399"
            strokeWidth={2}
            fill="url(#syncFill)"
            activeDot={{ r: 5, strokeWidth: 0, fill: "#34d399" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
