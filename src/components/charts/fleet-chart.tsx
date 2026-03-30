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

const TICK_COLOR = "rgba(186, 201, 204, 0.5)";
const GRID_COLOR = "rgba(59, 73, 76, 0.3)";

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
            cursor={{ fill: "rgba(0, 229, 255, 0.04)" }}
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
          <Bar dataKey="activeUsers" fill="#00E5FF" radius={[6, 6, 0, 0]} />
          <Bar dataKey="pendingSync" fill="#34d399" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
