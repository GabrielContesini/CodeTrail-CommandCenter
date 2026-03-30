import React from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { APIStatusCard } from "@/components/ui/api-status-card";
import { GrowthMetricsCard } from "@/components/ui/growth-metrics-card";
import { ActiveUsersCard } from "@/components/ui/active-users-card";
import { cn } from "@/lib/utils";

interface DashboardBentoProps {
  title: string;
  subtitle: string;
  stats: Array<{
    label: string;
    value: string;
    delta: string;
    deltaColor: "emerald" | "amber" | "rose" | "cyan";
    progress?: number;
  }>;
  apiStatuses: Array<{
    name: string;
    status: "online" | "degrading" | "offline";
  }>;
  growthValue: number;
  growthLabel: string;
  growthDelta: number;
  activeUsers: number;
  peakToday: number;
  maxCapacity: number;
  avatars: Array<{ src: string; alt: string; name?: string }>;
  children?: React.ReactNode;
}

/**
 * DashboardBento - Redesigned dashboard with bento grid layout
 * Implements the new glass-morphism design with modern components
 */
export function DashboardBento({
  title,
  subtitle,
  stats,
  apiStatuses,
  growthValue,
  growthLabel,
  growthDelta,
  activeUsers,
  peakToday,
  maxCapacity,
  avatars,
  children,
}: DashboardBentoProps) {
  const chartData = [40, 60, 55, 75, 90, 100];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl font-black text-on-surface tracking-tight">
            {title}
          </h2>
          <p className="text-neutral-400 mt-1">{subtitle}</p>
        </div>
        <div className="flex gap-4">
          <Button variant="primary">Execute Backup</Button>
          <Button variant="secondary">Export Logs</Button>
        </div>
      </div>

      {/* Bento Grid Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* API Status - 4 cols */}
        <div className="md:col-span-4">
          <APIStatusCard statuses={apiStatuses} />
        </div>

        {/* Growth Metrics - 5 cols */}
        <div className="md:col-span-5">
          <GrowthMetricsCard
            value={growthValue}
            label={growthLabel}
            deltaPercent={growthDelta}
            chartData={chartData}
          />
        </div>

        {/* Active Users - 3 cols */}
        <div className="md:col-span-3">
          <ActiveUsersCard
            peakToday={peakToday}
            maxCapacity={maxCapacity}
            avatars={avatars}
          />
        </div>

        {/* System Performance Analytics - 8 cols */}
        <div className="md:col-span-8">
          <GlassCard className="rounded-xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
              <div>
                <h4 className="text-on-surface font-bold">System Performance Analytics</h4>
                <p className="text-xs text-neutral-500">Last 24 hours traffic analysis</p>
              </div>
              <div className="flex gap-2">
                <button className="bg-neutral-800 text-[10px] uppercase tracking-tighter font-bold px-3 py-1 rounded text-neutral-300 border border-neutral-700 hover:bg-neutral-700 transition-all">
                  Hour
                </button>
                <button className="bg-primary-container text-on-primary-container text-[10px] uppercase tracking-tighter font-bold px-3 py-1 rounded hover:brightness-110 transition-all">
                  Day
                </button>
                <button className="bg-neutral-800 text-[10px] uppercase tracking-tighter font-bold px-3 py-1 rounded text-neutral-300 border border-neutral-700 hover:bg-neutral-700 transition-all">
                  Week
                </button>
              </div>
            </div>

            {/* Chart area */}
            <div className="flex-1 p-6 flex items-center justify-center min-h-64">
              <div className="w-full h-64 relative">
                {/* Decorative SVG Graph */}
                <svg
                  className="w-full h-full"
                  preserveAspectRatio="none"
                  viewBox="0 0 100 40"
                >
                  <defs>
                    <linearGradient id="cyanGrad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 35 Q 10 32, 20 25 T 40 15 T 60 22 T 80 10 T 100 18 L 100 40 L 0 40 Z"
                    fill="url(#cyanGrad)"
                  ></path>
                  <path
                    d="M0 35 Q 10 32, 20 25 T 40 15 T 60 22 T 80 10 T 100 18"
                    fill="none"
                    stroke="#00E5FF"
                    strokeLinecap="round"
                    strokeWidth="0.5"
                  ></path>
                </svg>

                {/* Tooltip Mockup */}
                <div className="absolute top-[20%] left-[60%] -translate-x-1/2 -translate-y-full bg-neutral-900 border border-primary-container p-2 rounded shadow-xl">
                  <p className="text-[10px] text-primary-container font-bold mb-1">Peak Traffic</p>
                  <p className="text-xs text-on-surface">12,4k requests/sec</p>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* System Alerts Sidebar - 4 cols */}
        <div className="md:col-span-4 space-y-4">
          {/* Cluster Health */}
          <GlassCard className="p-5 rounded-xl border-l-4 border-l-primary-container">
            <div className="flex items-center gap-3 mb-3">
              <span className="material-symbols-outlined text-primary-container text-lg">memory</span>
              <p className="text-xs font-bold text-on-surface">Cluster Health</p>
            </div>
            <p className="text-xs text-neutral-400 mb-4">
              All 12 nodes reporting healthy status within specified parameters.
            </p>
            <div className="grid grid-cols-4 gap-1">
              <div className="h-1 bg-primary-container rounded-full"></div>
              <div className="h-1 bg-primary-container rounded-full"></div>
              <div className="h-1 bg-primary-container rounded-full"></div>
              <div className="h-1 bg-primary-container/20 rounded-full"></div>
            </div>
          </GlassCard>

          {/* Top Endpoints */}
          <GlassCard className="p-5 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-on-surface">Top Endpoints</p>
              <span className="material-symbols-outlined text-neutral-500 text-sm">open_in_new</span>
            </div>
            <ul className="space-y-3">
              <li className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">/api/v1/auth</span>
                <span className="text-on-surface font-mono">2.4k/s</span>
              </li>
              <li className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">/api/v1/users</span>
                <span className="text-on-surface font-mono">1.8k/s</span>
              </li>
              <li className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">/api/v1/billing</span>
                <span className="text-on-surface font-mono">0.4k/s</span>
              </li>
            </ul>
          </GlassCard>

          {/* Security Shield */}
          <div className="p-1 rounded-xl bg-gradient-to-tr from-primary-container/50 to-purple-500/50">
            <div className="bg-neutral-900 rounded-[7px] p-5 h-full flex flex-col justify-between">
              <p className="text-xs font-bold text-on-surface mb-2">Security Shield</p>
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary-container text-3xl">verified_user</span>
                <span className="text-xl font-black text-on-surface">ACTIVE</span>
              </div>
              <p className="text-[10px] text-neutral-500">
                244 attempted breaches blocked this session.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional content */}
      {children}
    </div>
  );
}
