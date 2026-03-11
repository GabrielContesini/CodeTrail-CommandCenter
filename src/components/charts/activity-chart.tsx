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

const TICK_COLOR = "rgba(107,114,128,0.8)";

export function ActivityChart({ data }: { data: ActivityPoint[] }) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="sessionsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6C63FF" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#6C63FF" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="syncFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#10B981" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(108,99,255,0.07)" strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: TICK_COLOR, fontSize: 11, fontWeight: 500 }}
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis
            tick={{ fill: TICK_COLOR, fontFamily: "var(--font-fira-code)", fontSize: 11, fontWeight: 500 }}
            tickLine={false}
            axisLine={false}
            dx={-10}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(12px)",
              borderColor: "rgba(108,99,255,0.15)",
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(80,60,180,0.12)",
              color: "#111827",
              fontSize: "12px",
              fontWeight: 500,
            }}
            itemStyle={{ color: "#374151", fontWeight: 600 }}
          />
          <Area
            type="monotone"
            dataKey="sessions"
            stroke="#6C63FF"
            strokeWidth={2}
            fill="url(#sessionsFill)"
            activeDot={{ r: 5, strokeWidth: 0, fill: "#6C63FF" }}
          />
          <Area
            type="monotone"
            dataKey="syncBacklog"
            stroke="#10B981"
            strokeWidth={2}
            fill="url(#syncFill)"
            activeDot={{ r: 5, strokeWidth: 0, fill: "#10B981" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
