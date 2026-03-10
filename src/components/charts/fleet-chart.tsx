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
            cursor={{ fill: "rgba(255,255,255,0.02)" }}
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
          <Bar dataKey="activeUsers" fill="#3B82F6" radius={[6, 6, 0, 0]} />
          <Bar dataKey="pendingSync" fill="#10B981" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
