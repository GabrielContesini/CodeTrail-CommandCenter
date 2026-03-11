"use client";

import type { PlatformSnapshot } from "@/lib/types";
import { platformLabel } from "@/lib/utils";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const TICK_COLOR = "rgba(107,114,128,0.8)";

export function FleetChart({ data }: { data: PlatformSnapshot[] }) {
  const chartData = data.map((item) => ({
    label: platformLabel(item.platform),
    activeUsers: item.activeUsers,
    pendingSync: item.pendingSync,
    instances: item.instances,
  }));

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={16}>
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
            cursor={{ fill: "rgba(108,99,255,0.04)" }}
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
          <Bar dataKey="activeUsers" fill="#6C63FF" radius={[6, 6, 0, 0]} />
          <Bar dataKey="pendingSync" fill="#10B981" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
