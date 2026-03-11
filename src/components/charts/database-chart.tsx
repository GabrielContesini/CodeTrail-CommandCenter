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

const TICK_COLOR = "rgba(107,114,128,0.8)";

export function DatabaseChart({ data }: { data: DatabaseMetric[] }) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 10, top: 10, right: 10, bottom: 0 }} barSize={12}>
          <CartesianGrid stroke="rgba(108,99,255,0.07)" strokeDasharray="4 4" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: TICK_COLOR, fontFamily: "var(--font-fira-code)", fontSize: 11, fontWeight: 500 }}
            tickLine={false}
            axisLine={false}
            dx={4}
          />
          <YAxis
            type="category"
            dataKey="label"
            tick={{ fill: TICK_COLOR, fontSize: 11, fontWeight: 500 }}
            tickLine={false}
            axisLine={false}
            width={82}
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
          <Bar dataKey="rowCount" fill="#6C63FF" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
