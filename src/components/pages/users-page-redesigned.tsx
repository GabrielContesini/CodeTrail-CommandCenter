import React from "react";
import { Button, StatCard, GlassCard } from "@/components/ui";
import {
  UserDirectoryTable,
  UserRoleTag,
  SubscriptionBadge,
  AccountStatusBadge,
} from "@/components/tables/user-directory-table";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "administrator" | "editor" | "viewer";
  subscription: "free" | "professional" | "enterprise" | "enterprise_plus";
  status: "active" | "suspended" | "pending";
}

interface UsersPageProps {
  users: User[];
  totalUsers: number;
  activeNow: number;
  mrrRevenue: number;
  systemHealth: number;
  isLoading?: boolean;
}

/**
 * UsersPageRedesigned - New users management page with redesigned components
 * Implements the grid layout with modern cards and table design
 */
export function UsersPageRedesigned({
  users,
  totalUsers,
  activeNow,
  mrrRevenue,
  systemHealth,
  isLoading,
}: UsersPageProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl font-black text-on-surface tracking-tight">
            Gerenciamento de Usuários
          </h2>
          <p className="text-neutral-400 mt-1">
            Gerencie usuários, papéis e assinaturas do sistema.
          </p>
        </div>
        <Button variant="primary">Novo Usuário</Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          label="Total Users"
          value={totalUsers.toLocaleString()}
          delta="+12% vs last month"
          deltaColor="emerald"
          progressPercent={75}
        />
        <StatCard
          label="Active Now"
          value={activeNow.toLocaleString()}
          delta=""
          deltaColor="cyan"
          progressPercent={56}
        />
        <StatCard
          label="MRR Revenue"
          value={`$${(mrrRevenue / 1000).toFixed(1)}k`}
          delta="Growth"
          deltaColor="emerald"
          progressPercent={82}
        />
        <StatCard
          label="System Health"
          value={`${systemHealth}%`}
          delta="Stable"
          deltaColor="emerald"
          progressPercent={99}
        />
      </div>

      {/* Filter Bar */}
      <GlassCard className="p-4 rounded-xl border-outline-variant/30">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Filter By:
            </span>
          </div>

          <select className="bg-neutral-800 border-none rounded-lg text-sm px-4 py-2 text-on-surface focus:ring-1 focus:ring-primary-container cursor-pointer">
            <option>Account Status: All</option>
            <option>Active</option>
            <option>Suspended</option>
            <option>Pending</option>
          </select>

          <select className="bg-neutral-800 border-none rounded-lg text-sm px-4 py-2 text-on-surface focus:ring-1 focus:ring-primary-container cursor-pointer">
            <option>System Role: All</option>
            <option>Administrator</option>
            <option>Editor</option>
            <option>Viewer</option>
          </select>

          <select className="bg-neutral-800 border-none rounded-lg text-sm px-4 py-2 text-on-surface focus:ring-1 focus:ring-primary-container cursor-pointer">
            <option>Subscription: All</option>
            <option>Enterprise</option>
            <option>Professional</option>
            <option>Free Tier</option>
          </select>

          <div className="ml-auto flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-400 transition-colors">
              <span className="material-symbols-outlined">grid_view</span>
            </button>
            <button className="p-2 rounded-lg bg-neutral-800 text-primary-container transition-colors">
              <span className="material-symbols-outlined">list</span>
            </button>
          </div>
        </div>
      </GlassCard>

      {/* User Directory Table */}
      <UserDirectoryTable
        columns={[
          { key: "profile", label: "User Profile", width: "30%" },
          { key: "role", label: "System Role", width: "20%" },
          { key: "subscription", label: "Subscription", width: "20%" },
          { key: "status", label: "Status", width: "15%" },
          { key: "actions", label: "Actions", width: "15%" },
        ]}
        rows={users.map((user) => ({
          id: user.id,
          avatar: user.avatar,
          name: user.name,
          subtitle: user.email,
          cells: {
            profile: `${user.name} ${user.email}`,
            role: <UserRoleTag role={user.role} />,
            subscription: <SubscriptionBadge tier={user.subscription} />,
            status: <AccountStatusBadge status={user.status} />,
          },
          actions: (
            <button className="p-2 text-neutral-500 hover:text-primary-container transition-colors">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          ),
        }))}
        isLoading={isLoading}
      />

      {/* Pagination */}
      <div className="bg-surface-container rounded-xl border border-outline-variant/30 px-6 py-4 flex items-center justify-between">
        <p className="text-xs text-neutral-500">
          Showing <span className="font-bold text-neutral-300">1-10</span> of{" "}
          <span className="font-bold text-neutral-300">{totalUsers}</span> users
        </p>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg border border-outline-variant/30 text-neutral-500 hover:bg-neutral-800 transition-colors disabled:opacity-50">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button className="w-8 h-8 rounded-lg bg-primary-container/10 text-primary-container text-xs font-bold border border-primary-container/30">
            1
          </button>
          <button className="w-8 h-8 rounded-lg hover:bg-neutral-800 text-neutral-500 text-xs font-bold">
            2
          </button>
          <button className="w-8 h-8 rounded-lg hover:bg-neutral-800 text-neutral-500 text-xs font-bold">
            3
          </button>
          <span className="text-neutral-600 px-1">...</span>
          <button className="w-8 h-8 rounded-lg hover:bg-neutral-800 text-neutral-500 text-xs font-bold">
            125
          </button>
          <button className="p-2 rounded-lg border border-outline-variant/30 text-neutral-500 hover:bg-neutral-800 transition-colors">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}
