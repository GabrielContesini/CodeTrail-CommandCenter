"use client";

import type { DatabaseMetric } from "@/lib/types";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function DatabaseChart({ data }: { data: DatabaseMetric[] }) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 10, top: 10, right: 10, bottom: 0 }} barSize={12}>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: "rgba(255,255,255,0.4)", fontFamily: "var(--font-fira-code)", fontSize: 11, fontWeight: 500 }}
            tickLine={false}
            axisLine={false}
            dx={4}
          />
          <YAxis
            type="category"
            dataKey="label"
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 500 }}
            tickLine={false}
            axisLine={false}
            width={82}
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
          <Bar dataKey="rowCount" fill="#3B82F6" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
