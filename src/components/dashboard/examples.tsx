/**
 * EXEMPLO DE USO DO NOVO DASHBOARD REDESENHADO
 * 
 * Este é um arquivo de referência mostrando como usar os novos componentes
 * do redesign. Você pode copiar e adaptar para sua página.
 */

// ============================================================================
// EXEMPLO 1: Usando DashboardBento com dados mockados
// ============================================================================

import { DashboardBento } from "@/components/dashboard/dashboard-bento";

export default function DashboardExample() {
  // Dados de exemplo
  const mockData = {
    title: "Dashboard Principal",
    subtitle: "Operational overview and global user metrics.",
    stats: [
      {
        label: "Active Users",
        value: "14,289",
        delta: "+12.4%",
        deltaColor: "emerald" as const,
        progress: 75,
      },
      {
        label: "Latency (Avg)",
        value: "24ms",
        delta: "-4.2ms",
        deltaColor: "emerald" as const,
        progress: 40,
      },
      {
        label: "API Requests",
        value: "1.2M",
        delta: "+28.1%",
        deltaColor: "amber" as const,
        progress: 90,
      },
      {
        label: "Uptime",
        value: "99.98%",
        delta: "Stable",
        deltaColor: "emerald" as const,
        progress: 100,
      },
    ],
    apiStatuses: [
      { name: "Main API Gateway", status: "online" as const },
      { name: "Auth Microservice", status: "degrading" as const },
      { name: "Legacy Sync", status: "offline" as const },
    ],
    growthValue: 12482,
    growthLabel: "Total Registered Subscribers",
    growthMetaLabel: "9.2k Pro • 3.2k Founding",
    growthBreakdown: [
      { label: "Pro", value: 9280, accent: "cyan" as const },
      { label: "Founding", value: 3202, accent: "violet" as const },
    ],
    activeUsers: 2104,
    activeUsersLabel: "atividade nos ultimos 60 min",
    peakToday: 2104,
    maxCapacity: 2500,
    avatars: [
      {
        src: "https://api.dicebear.com/7.x/avataaars/svg?seed=1",
        alt: "User 1",
        name: "John Doe",
      },
      {
        src: "https://api.dicebear.com/7.x/avataaars/svg?seed=2",
        alt: "User 2",
        name: "Jane Smith",
      },
      {
        src: "https://api.dicebear.com/7.x/avataaars/svg?seed=3",
        alt: "User 3",
        name: "Bob Johnson",
      },
    ],
    performance: {
      averages: {
        cpu: 42.4,
        memory: 58.2,
        disk: 34.8,
      },
      chartData: [
        { label: "09h", cpu: 30, memory: 49, disk: 34 },
        { label: "10h", cpu: 38, memory: 52, disk: 35 },
        { label: "11h", cpu: 45, memory: 57, disk: 35 },
        { label: "12h", cpu: 42, memory: 58, disk: 36 },
      ],
      monitoredNodes: 4,
      lastHeartbeatAt: new Date().toISOString(),
    },
  };

  return (
    <div className="space-y-8">
      <DashboardBento {...mockData} />

      {/* Seção adicional de usuários em atenção */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-on-surface">Usuários em Atenção</h3>
        {/* Adicione conteúdo adicional aqui */}
      </div>
    </div>
  );
}

// ============================================================================
// EXEMPLO 2: Usando componentes individuais
// ============================================================================

import {
  GlassCard,
  StatCard,
  Button,
  StatusBadge,
  APIStatusCard,
  GrowthMetricsCard,
  ActiveUsersCard,
} from "@/components/ui";

export function ComponentShowcase() {
  return (
    <div className="space-y-8 p-8">
      {/* Row 1: Basic Components */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard>
          <h3 className="text-on-surface font-bold mb-4">Glass Card Example</h3>
          <p className="text-neutral-400 text-sm">
            Este é um card com efeito glassmorphism
          </p>
        </GlassCard>

        <StatCard
          label="Total Users"
          value="12,842"
          delta="+12% vs last month"
          deltaColor="emerald"
          progressPercent={68}
        />

        <div className="space-y-2">
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="tertiary">Tertiary Button</Button>
        </div>
      </div>

      {/* Row 2: Status Components */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatusBadge status="online" label="Main API" size="md" />
        <StatusBadge status="degrading" label="Auth Service" size="md" />
        <StatusBadge status="offline" label="Sync Service" size="md" />
        <StatusBadge status="active" label="Active User" size="md" />
      </div>

      {/* Row 3: Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <APIStatusCard
          statuses={[
            { name: "API Gateway", status: "online" },
            { name: "Auth Service", status: "degrading" },
          ]}
        />

        <GrowthMetricsCard
          value={12482}
          label="Total Subscribers"
          metaLabel="9.2k Pro • 3.2k Founding"
          breakdown={[
            { label: "Pro", value: 9280, accent: "cyan" },
            { label: "Founding", value: 3202, accent: "violet" },
          ]}
        />

        <ActiveUsersCard
          activeUsers={2104}
          activeUsersLabel="atividade nos ultimos 60 min"
          peakToday={2104}
          maxCapacity={2500}
          avatars={[
            {
              src: "https://api.dicebear.com/7.x/avataaars/svg?seed=1",
              alt: "User 1",
            },
            {
              src: "https://api.dicebear.com/7.x/avataaars/svg?seed=2",
              alt: "User 2",
            },
          ]}
        />
      </div>
    </div>
  );
}

// ============================================================================
// EXEMPLO 3: Integração com dados reais
// ============================================================================

import type { CommandCenterSnapshot } from "@/lib/types";

export function DashboardIntegrated({
  snapshot,
}: {
  snapshot: CommandCenterSnapshot;
}) {
  // Preparar dados do snapshot para o dashboard
  const dashboardProps = {
    title: "Dashboard Principal",
    subtitle: "Operational overview and global user metrics.",
    stats: snapshot.metrics.map((metric, index) => ({
      label: metric.label,
      value: metric.value,
      delta: metric.delta || "stable",
      deltaColor:
        metric.tone === "good"
          ? ("emerald" as const)
          : metric.tone === "warning"
            ? ("amber" as const)
            : ("rose" as const),
      progress: Math.max(20, Math.min(95, 30 + index * 15)),
    })),
    apiStatuses: snapshot.systems.map((sys) => ({
      name: sys.machineName,
      status: (sys.status === "up" ? "online" : sys.status === "degraded" ? "degrading" : "offline") as "online" | "degrading" | "offline",
    })),
    growthValue: parseInt(
      snapshot.metrics[0]?.value?.toString().replace(/,/g, "") || "0"
    ),
    growthLabel: "Total Registered Users",
    growthMetaLabel: "dados mockados de planos",
    growthBreakdown: [
      { label: "Pro", value: Math.max(snapshot.users.length - 4, 0), accent: "cyan" as const },
      { label: "Founding", value: Math.min(snapshot.users.length, 4), accent: "violet" as const },
    ],
    activeUsers: snapshot.users.length,
    activeUsersLabel: "atividade recente",
    peakToday: 2104,
    maxCapacity: 2500,
    avatars: snapshot.users.slice(0, 3).map((user) => ({
      src: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
      alt: user.name,
      name: user.name,
    })),
    performance: {
      averages: {
        cpu: 42,
        memory: 58,
        disk: 34,
      },
      chartData: [
        { label: "09h", cpu: 34, memory: 49, disk: 31 },
        { label: "10h", cpu: 38, memory: 53, disk: 33 },
        { label: "11h", cpu: 44, memory: 57, disk: 34 },
        { label: "12h", cpu: 42, memory: 58, disk: 35 },
      ],
      monitoredNodes: snapshot.systems.length,
      lastHeartbeatAt: new Date().toISOString(),
    },
  };

  return <DashboardBento {...dashboardProps} />;
}

// ============================================================================
// EXEMPLO 4: Com Tailwind CSS direto
// ============================================================================

export function CustomLayout() {
  return (
    <div className="bg-background text-on-surface min-h-screen p-8">
      {/* Usando as cores do design system */}
      <div className="rounded-xl bg-surface-container border border-outline-variant/30 p-6">
        <h2 className="text-3xl font-black text-on-surface mb-2">
          Custom Layout
        </h2>
        <p className="text-neutral-400">Utilizando core colors do design system</p>

        {/* Grid de cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg bg-surface-container-low border border-outline-variant/30 p-4 hover:border-outline transition-all"
            >
              <p className="text-xs font-bold text-primary-container uppercase">
                Métrica {i + 1}
              </p>
              <p className="text-2xl font-black mt-2">1,234</p>
            </div>
          ))}
        </div>
      </div>

      {/* Glass effect */}
      <div className="mt-8 rounded-xl backdrop-blur-md bg-[rgba(32,31,31,0.6)] border border-outline-variant/30 p-6">
        <p className="text-on-surface">
          Este card tem glass-morphism effect
        </p>
      </div>
    </div>
  );
}
