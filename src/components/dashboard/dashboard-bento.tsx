import React from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { APIStatusCard } from "@/components/ui/api-status-card";
import { GrowthMetricsCard } from "@/components/ui/growth-metrics-card";
import { ActiveUsersCard } from "@/components/ui/active-users-card";
import {
  SystemPerformanceCard,
  type SystemPerformancePoint,
} from "@/components/ui/system-performance-card";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface QuickAction {
  label: string;
  href: string;
  icon: string;
}

interface IncidentInfo {
  id: string;
  title: string;
  severity: string;
  status: string;
  source: string;
  openedAt: string;
}

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
  growthMetaLabel: string;
  growthBreakdown: Array<{
    label: string;
    value: number;
    accent: "cyan" | "violet";
  }>;
  activeUsers: number;
  activeUsersLabel: string;
  peakToday: number;
  maxCapacity: number;
  avatars: Array<{ src: string; alt: string; name?: string; isCurrentUser?: boolean }>;
  performance: {
    averages: {
      cpu: number;
      memory: number;
      disk: number;
    };
    chartData: SystemPerformancePoint[];
    monitoredNodes: number;
    lastHeartbeatAt?: string | null;
  };
  incidents?: IncidentInfo[];
  quickActions?: QuickAction[];
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
  growthMetaLabel,
  growthBreakdown,
  activeUsers,
  activeUsersLabel,
  peakToday,
  maxCapacity,
  avatars,
  performance,
  incidents = [],
  quickActions = [],
  children,
}: DashboardBentoProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-rose-400 bg-rose-400/10';
      case 'warning':
        return 'text-amber-400 bg-amber-400/10';
      default:
        return 'text-cyan-400 bg-cyan-400/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return 'error';
      case 'investigating':
        return 'pending';
      case 'mitigated':
        return 'check_circle';
      case 'resolved':
        return 'verified';
      default:
        return 'info';
    }
  };

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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <StatCard
            key={idx}
            label={stat.label}
            value={stat.value}
            delta={stat.delta}
            deltaColor={stat.deltaColor}
            progressPercent={stat.progress}
          />
        ))}
      </div>

      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {quickActions.map((action, idx) => (
            <Link
              key={idx}
              href={action.href}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container border border-outline-variant/30 text-sm font-bold text-on-surface hover:bg-surface-container-high hover:border-primary-container transition-all"
            >
              <span className="material-symbols-outlined text-lg text-primary-container">
                {action.icon}
              </span>
              {action.label}
            </Link>
          ))}
        </div>
      )}

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
            metaLabel={growthMetaLabel}
            breakdown={growthBreakdown}
          />
        </div>

        {/* Active Users - 3 cols */}
        <div className="md:col-span-3">
          <ActiveUsersCard
            activeUsers={activeUsers}
            activeUsersLabel={activeUsersLabel}
            peakToday={peakToday}
            maxCapacity={maxCapacity}
            avatars={avatars}
          />
        </div>

        {/* System Performance Analytics */}
        <div className={incidents.length > 0 ? "md:col-span-8" : "md:col-span-12"}>
          <SystemPerformanceCard
            averages={performance.averages}
            data={performance.chartData}
            monitoredNodes={performance.monitoredNodes}
            lastHeartbeatAt={performance.lastHeartbeatAt}
          />
        </div>

        {/* Right Sidebar - 4 cols */}
        {incidents.length > 0 ? (
        <div className="md:col-span-4 space-y-4">
          {/* Recent Incidents */}
          <GlassCard className="p-5 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-on-surface">Recent Incidents</p>
              <Link href="/incidents" className="text-neutral-500 hover:text-primary-container transition-colors">
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
            <div className="space-y-3">
              {incidents.map((incident) => (
                <div
                  key={incident.id}
                  className="flex items-start gap-3 p-2 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors"
                >
                  <span className={cn("material-symbols-outlined text-sm mt-0.5", getSeverityColor(incident.severity).split(' ')[0])}>
                    {getStatusIcon(incident.status)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-on-surface truncate">{incident.title}</p>
                    <p className="text-[10px] text-neutral-500">{incident.source} - {new Date(incident.openedAt).toLocaleDateString()}</p>
                  </div>
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded uppercase", getSeverityColor(incident.severity))}>
                    {incident.severity}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
        ) : null}
      </div>

      {/* Additional content */}
      {children}
    </div>
  );
}
