import React from "react";
import { Button, StatCard, GlassCard } from "@/components/ui";
import {
  AnalyticsChart,
  LineChartMock,
  BarChartMock,
  NodeDensityMapMock,
  TableMetricsRow,
} from "@/components/charts/analytics-components";
import { cn } from "@/lib/utils";

interface AnalyticsPageProps {
  activeUsers: number;
  latency: number;
  apiRequests: number;
  uptime: number;
  isLoading?: boolean;
}

/**
 * AnalyticsPageRedesigned - New analytics page with redesigned components
 * Implements the new chart layout with glass-morphism design
 */
export function AnalyticsPageRedesigned({
  activeUsers,
  latency,
  apiRequests,
  uptime,
  isLoading,
}: AnalyticsPageProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">
            Analytics Detalhado
          </h2>
          <p className="text-neutral-500 text-sm mt-1">
            Real-time performance metrics and user behavior intelligence.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary">
            <span className="material-symbols-outlined text-sm">calendar_today</span>
            Last 30 Days
          </Button>
          <Button variant="primary">
            <span className="material-symbols-outlined text-sm">download</span>
            Export Report
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          label="Active Users"
          value={activeUsers.toLocaleString()}
          delta="+12.4%"
          deltaColor="emerald"
          progressPercent={75}
        />
        <StatCard
          label="Latency (Avg)"
          value={`${latency}ms`}
          delta="-4.2ms"
          deltaColor="emerald"
          progressPercent={40}
        />
        <StatCard
          label="API Requests"
          value={`${(apiRequests / 1000000).toFixed(1)}M`}
          delta="+28.1%"
          deltaColor="amber"
          progressPercent={90}
        />
        <StatCard
          label="Uptime"
          value={`${uptime}%`}
          delta="Stable"
          deltaColor="emerald"
          progressPercent={100}
        />
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Active Users Over Time - Large Chart (8 cols) */}
        <div className="col-span-12 lg:col-span-8">
          <AnalyticsChart
            title="Active Users Over Time"
            subtitle="Concurrent active sessions across all clusters"
          >
            <div className="w-full">
              <div className="flex justify-between items-center mb-4 px-4">
                <div className="flex gap-6">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-primary-container"></span>
                    <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-widest">
                      Direct
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-neutral-700"></span>
                    <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-widest">
                      External
                    </span>
                  </div>
                </div>
              </div>
              <LineChartMock />
              <div className="flex justify-between mt-6 px-4 text-[10px] font-bold text-neutral-600 uppercase">
                <span>00:00</span>
                <span>04:00</span>
                <span>08:00</span>
                <span>12:00</span>
                <span>16:00</span>
                <span>20:00</span>
                <span>23:59</span>
              </div>
            </div>
          </AnalyticsChart>
        </div>

        {/* Node Density Map (4 cols) */}
        <div className="col-span-12 lg:col-span-4">
          <AnalyticsChart
            title="Node Density Map"
            subtitle="Geo-Distribution Cluster"
          >
            <NodeDensityMapMock />
          </AnalyticsChart>
        </div>

        {/* Request Distribution (6 cols) */}
        <div className="col-span-12 lg:col-span-6">
          <AnalyticsChart
            title="Request Distribution by Endpoint"
            subtitle="Top performing API endpoints"
          >
            <BarChartMock />
          </AnalyticsChart>
        </div>

        {/* Performance Metrics (6 cols) */}
        <div className="col-span-12 lg:col-span-6">
          <GlassCard className="rounded-xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-outline-variant/30">
              <h4 className="text-on-surface font-bold">Performance Metrics</h4>
              <p className="text-xs text-neutral-500 mt-1">Last 24 hours summary</p>
            </div>
            <div className="flex-1 p-6">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-outline-variant/20">
                  <TableMetricsRow
                    label="Database Query Time"
                    value="45ms"
                    change="-2.3ms"
                    changeType="positive"
                  />
                  <TableMetricsRow
                    label="Cache Hit Rate"
                    value="94.2%"
                    change="+1.1%"
                    changeType="positive"
                  />
                  <TableMetricsRow
                    label="Error Rate"
                    value="0.12%"
                    change="+0.02%"
                    changeType="negative"
                  />
                  <TableMetricsRow
                    label="Request Timeout"
                    value="2"
                    change="No change"
                    changeType="neutral"
                  />
                  <TableMetricsRow
                    label="Avg Response Time"
                    value="234ms"
                    change="-12ms"
                    changeType="positive"
                  />
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Top Endpoints Table */}
      <GlassCard className="rounded-xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-outline-variant/30">
          <h4 className="text-on-surface font-bold">Top API Endpoints</h4>
          <p className="text-xs text-neutral-500 mt-1">
            Most used endpoints in the last 24 hours
          </p>
        </div>
        <div className="flex-1 p-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/20">
                <th className="px-4 py-3 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Endpoint
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Requests
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Avg Response
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {[
                { endpoint: "/api/v1/auth", requests: "2.4M", response: "142ms", status: "✓" },
                {
                  endpoint: "/api/v1/users",
                  requests: "1.8M",
                  response: "234ms",
                  status: "✓",
                },
                {
                  endpoint: "/api/v1/sessions",
                  requests: "1.2M",
                  response: "189ms",
                  status: "✓",
                },
                {
                  endpoint: "/api/v1/analytics",
                  requests: "842k",
                  response: "456ms",
                  status: "⚠",
                },
                {
                  endpoint: "/api/v1/billing",
                  requests: "412k",
                  response: "312ms",
                  status: "✓",
                },
              ].map((row) => (
                <tr
                  key={row.endpoint}
                  className="hover:bg-neutral-800/30 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-mono text-neutral-400">
                    {row.endpoint}
                  </td>
                  <td className="px-4 py-3 text-sm text-on-surface font-bold">
                    {row.requests}
                  </td>
                  <td className="px-4 py-3 text-sm text-on-surface">
                    {row.response}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={cn(
                        "text-sm font-bold",
                        row.status === "✓"
                          ? "text-emerald-400"
                          : "text-amber-400"
                      )}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
