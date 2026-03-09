"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ActivityPoint } from "@/lib/types";

export function ActivityChart({ data }: { data: ActivityPoint[] }) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="sessionsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4F8CFF" stopOpacity={0.34} />
              <stop offset="100%" stopColor="#4F8CFF" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="syncFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22D3EE" stopOpacity={0.26} />
              <stop offset="100%" stopColor="#22D3EE" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(151,171,196,0.12)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#97abc4", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fill: "#97abc4", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(7, 17, 26, 0.96)",
              borderColor: "rgba(151,171,196,0.16)",
              borderRadius: "20px",
              color: "#eef4ff",
            }}
          />
          <Area
            type="monotone"
            dataKey="sessions"
            stroke="#4F8CFF"
            strokeWidth={2.6}
            fill="url(#sessionsFill)"
          />
          <Area
            type="monotone"
            dataKey="syncBacklog"
            stroke="#22D3EE"
            strokeWidth={2}
            fill="url(#syncFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
