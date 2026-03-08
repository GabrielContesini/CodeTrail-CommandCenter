"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PlatformSnapshot } from "@/lib/types";
import { platformLabel } from "@/lib/utils";

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
        <BarChart data={chartData}>
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
          <Bar dataKey="activeUsers" fill="#63b3ff" radius={[12, 12, 0, 0]} />
          <Bar dataKey="pendingSync" fill="#ffd166" radius={[12, 12, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
