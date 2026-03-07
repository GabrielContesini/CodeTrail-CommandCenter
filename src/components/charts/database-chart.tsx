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
import type { DatabaseMetric } from "@/lib/types";

export function DatabaseChart({ data }: { data: DatabaseMetric[] }) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 14 }}>
          <CartesianGrid stroke="rgba(151,171,196,0.12)" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: "#97abc4", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            tick={{ fill: "#97abc4", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={82}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(7, 17, 26, 0.96)",
              borderColor: "rgba(151,171,196,0.16)",
              borderRadius: "20px",
              color: "#eef4ff",
            }}
          />
          <Bar dataKey="rowCount" fill="#7fffd3" radius={[0, 12, 12, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
