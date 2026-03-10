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

export function ActivityChart({ data }: { data: ActivityPoint[] }) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="sessionsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="syncFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#10B981" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 500 }}
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis
            tick={{ fill: "rgba(255,255,255,0.4)", fontFamily: "var(--font-fira-code)", fontSize: 11, fontWeight: 500 }}
            tickLine={false}
            axisLine={false}
            dx={-10}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(10, 10, 10, 0.8)",
              backdropFilter: "blur(12px)",
              borderColor: "rgba(255,255,255,0.1)",
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              color: "#fff",
              fontSize: "12px",
              fontWeight: 500,
            }}
            itemStyle={{ color: "#fff", fontWeight: 600 }}
          />
          <Area
            type="monotone"
            dataKey="sessions"
            stroke="#3B82F6"
            strokeWidth={2}
            fill="url(#sessionsFill)"
            activeDot={{ r: 5, strokeWidth: 0, fill: "#3B82F6", style: { filter: "drop-shadow(0px 0px 8px #3B82F6)" } }}
          />
          <Area
            type="monotone"
            dataKey="syncBacklog"
            stroke="#10B981"
            strokeWidth={2}
            fill="url(#syncFill)"
            activeDot={{ r: 5, strokeWidth: 0, fill: "#10B981", style: { filter: "drop-shadow(0px 0px 8px #10B981)" } }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
