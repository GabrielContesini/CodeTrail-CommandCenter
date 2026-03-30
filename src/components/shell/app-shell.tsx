"use client";

import { cn } from "@/lib/utils";
import {
  Activity,
  ChevronDown,
  Database,
  FolderKanban,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  MonitorCog,
  Search,
  Shield,
  Siren,
  Bell,
  HelpCircle,
  Terminal,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQueryState } from "nuqs";
import { Suspense, useMemo, useState } from "react";

function TopBarFilters() {
  const [envFilter, setEnvFilter] = useQueryState("env", { defaultValue: "all" });
  const [timeRange, setTimeRange] = useQueryState("range", { defaultValue: "24h" });

  return (
    <div className="flex items-center gap-0 rounded-lg bg-[var(--bg-surface-high)] p-0.5">
      <select
        value={envFilter}
        onChange={(e) => setEnvFilter(e.target.value)}
        className="appearance-none cursor-pointer rounded-lg bg-transparent pl-3 pr-2 py-1.5 text-xs font-medium text-[var(--text-primary)] outline-none border-none"
      >
        <option value="all">Global</option>
        <option value="prod">Produção</option>
        <option value="stag">Staging</option>
      </select>
      <div className="h-3 w-px bg-[var(--border-neutral)]" />
      <select
        value={timeRange}
        onChange={(e) => setTimeRange(e.target.value)}
        className="appearance-none cursor-pointer rounded-lg bg-transparent pl-2 pr-3 py-1.5 text-xs font-semibold text-[var(--accent)] outline-none border-none"
      >
        <option value="1h">1H</option>
        <option value="24h">24H</option>
        <option value="7d">7D</option>
      </select>
    </div>
  );
}

const primaryNavigation = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/incidents", label: "Incidentes", icon: Siren },
  { href: "/admin", label: "Admin", icon: Shield },
];

const observabilityNavigation = [
  { href: "/users", label: "Usuários", icon: Activity },
  { href: "/systems", label: "Plataformas", icon: MonitorCog },
  { href: "/database", label: "Banco", icon: Database },
];

export function AppShell({
  children,
  admin,
  sidebarSummary,
}: {
  children: React.ReactNode;
  admin: {
    displayName: string;
    email: string | null;
    role: string;
  } | null;
  sidebarSummary: {
    openIncidents: number;
    riskyUsers: number;
    degradedSystems: number;
    databaseAttention: number;
    pendingSync: number;
  };
}) {
  const pathname = usePathname();
  const [workspaceOpen, setWorkspaceOpen] = useState(true);

  const navigation = useMemo(
    () => [...primaryNavigation, ...observabilityNavigation],
    [],
  );
  const currentItem =
    navigation.find((item) =>
      item.href === "/"
        ? pathname === item.href
        : pathname.startsWith(item.href),
    ) ?? navigation[0];

  const globalHealthScore = 94;

  return (
    <div className="min-h-screen text-[var(--text-primary)] bg-[var(--bg-base)]">
      <div className="relative mx-auto min-h-screen max-w-[1920px] xl:grid xl:grid-cols-[var(--sidebar-width)_minmax(0,1fr)] xl:gap-0">

        {/* ── Sidebar ── */}
        <aside
          className="hidden self-start xl:flex xl:h-screen xl:sticky xl:top-0 xl:flex-col bg-[var(--sidebar-bg)] border-r border-[var(--border-neutral)]"
        >
          {/* Logo zone */}
          <div className="flex items-center gap-3 px-5 py-5 border-b border-[var(--border-neutral)]">
            <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]">
              <Terminal size={20} strokeWidth={2.2} className="text-[var(--text-on-accent)]" />
            </div>
            <div>
              <p className="text-sm font-black text-[var(--accent)] tracking-tight leading-tight">
                Command Center
              </p>
              <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-quaternary)] mt-0.5">
                Admin Terminal
              </p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
            {/* Primary nav */}
            <div>
              <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-quaternary)]">
                Sistema
              </p>
              <div className="space-y-0.5">
                {primaryNavigation.map((item) => {
                  const active =
                    item.href === "/"
                      ? pathname === item.href
                      : pathname.startsWith(item.href);
                  const Icon = item.icon;
                  const badge =
                    item.href === "/incidents"
                      ? sidebarSummary.openIncidents
                      : undefined;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                        active
                          ? "nav-active"
                          : "text-[var(--text-quaternary)] hover:bg-[var(--bg-surface-high)] hover:text-[var(--accent-dim)]",
                      )}
                    >
                      <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                      <span className="flex-1">{item.label}</span>
                      {badge ? (
                        <span className="rounded-full bg-[var(--status-red-bg)] border border-[var(--status-red-border)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--status-red)]">
                          {badge}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Observability collapse */}
            <div>
              <button
                type="button"
                onClick={() => setWorkspaceOpen((c) => !c)}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left"
              >
                <p className="flex-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-quaternary)]">
                  Observabilidade
                </p>
                <ChevronDown
                  size={12}
                  className={cn(
                    "text-[var(--text-quaternary)] transition-transform duration-200",
                    workspaceOpen ? "rotate-0" : "-rotate-90",
                  )}
                />
              </button>

              {workspaceOpen && (
                <div className="mt-0.5 space-y-0.5">
                  {observabilityNavigation.map((item) => {
                    const active = pathname.startsWith(item.href);
                    const Icon = item.icon;
                    const badge =
                      item.href === "/users"
                        ? sidebarSummary.riskyUsers
                        : item.href === "/systems"
                          ? sidebarSummary.degradedSystems
                          : sidebarSummary.databaseAttention;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                          active
                            ? "nav-active"
                            : "text-[var(--text-quaternary)] hover:bg-[var(--bg-surface-high)] hover:text-[var(--accent-dim)]",
                        )}
                      >
                        <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                        <span className="flex-1">{item.label}</span>
                        {badge ? (
                          <span className="rounded-full border border-[var(--border-neutral)] bg-[var(--bg-surface-high)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--text-tertiary)]">
                            {badge}
                          </span>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Workspace shortcuts */}
            <div>
              <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-quaternary)]">
                Workspace
              </p>
              <div className="space-y-0.5">
                <Link
                  href="/users"
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-[var(--text-quaternary)] hover:bg-[var(--bg-surface-high)] hover:text-[var(--accent-dim)] transition-all duration-200"
                >
                  <HeartPulse size={18} strokeWidth={1.8} className="text-[var(--status-yellow)]" />
                  <span className="flex-1 font-medium">Minha watchlist</span>
                  <span className="rounded-full bg-[var(--status-yellow-bg)] border border-[var(--status-yellow-border)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--status-yellow)]">
                    {sidebarSummary.riskyUsers}
                  </span>
                </Link>

                <Link
                  href="/database"
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-[var(--text-quaternary)] hover:bg-[var(--bg-surface-high)] hover:text-[var(--accent-dim)] transition-all duration-200"
                >
                  <FolderKanban size={18} strokeWidth={1.8} />
                  <span className="flex-1 font-medium">Fila de sync</span>
                  <span className="rounded-full border border-[var(--border-neutral)] bg-[var(--bg-surface-high)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--text-tertiary)]">
                    {sidebarSummary.pendingSync}
                  </span>
                </Link>
              </div>
            </div>
          </nav>

          {/* System Load indicator */}
          <div className="px-4 py-3">
            <div className="rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-low)] p-4">
              <p className="text-[10px] text-[var(--text-quaternary)] mb-2 uppercase font-bold tracking-wider">
                Carga do Sistema
              </p>
              <div className="w-full bg-[var(--border-neutral)] h-1 rounded-full overflow-hidden">
                <div className="bg-[var(--accent)] h-full w-[42%] transition-all duration-500" />
              </div>
              <p className="text-xs mt-2 text-[var(--accent)] font-medium">42.8% Capacidade</p>
            </div>
          </div>

          {/* Admin card */}
          <div className="shrink-0 border-t border-[var(--border-neutral)] px-4 py-4">
            {admin ? (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dim)] text-black">
                  <span className="text-[11px] font-bold">
                    {admin.displayName?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-[var(--text-primary)] leading-none truncate">
                    {admin.displayName}
                  </p>
                  <p className="mt-0.5 text-[10px] text-[var(--accent)] font-medium truncate">
                    {admin.role === "owner" ? "System Master" : admin.role}
                  </p>
                </div>
                <a
                  href="/logout"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-quaternary)] hover:bg-[var(--status-red-bg)] hover:text-[var(--status-red)] transition-colors"
                  title="Encerrar sessão"
                >
                  <LogOut size={14} />
                </a>
              </div>
            ) : null}
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="min-w-0 flex flex-col">
          {/* Top bar */}
          <div className="sticky top-0 z-20 bg-[var(--bg-topbar)] border-b border-[var(--border-neutral)] px-6 h-16 flex items-center">
            <div className="flex items-center justify-between gap-4 w-full">
              {/* Left: Page context */}
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--status-green-bg)] border border-[var(--status-green-border)]">
                  <span className="text-[11px] font-bold text-[var(--status-green)] tabular-nums">
                    {globalHealthScore}
                  </span>
                </div>
                <div>
                  <p className="label-caps">Superfície ativa</p>
                  <p className="text-sm font-semibold text-[var(--text-primary)] leading-tight tracking-tight">
                    {currentItem.label}
                  </p>
                </div>
              </div>

              {/* Mobile nav pills */}
              <div className="flex flex-wrap items-center gap-1.5 xl:hidden">
                {navigation.map((item) => {
                  const active =
                    item.href === "/"
                      ? pathname === item.href
                      : pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-medium transition-all",
                        active
                          ? "border-[var(--accent-light)] bg-[var(--accent-light)] text-[var(--accent)]"
                          : "border-[var(--border-neutral)] text-[var(--text-quaternary)] hover:text-[var(--text-primary)]",
                      )}
                    >
                      <Icon size={12} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              {/* Right controls */}
              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="hidden sm:flex items-center gap-2 rounded-lg bg-[var(--bg-surface-high)] px-3 py-2 transition-all focus-within:ring-1 focus-within:ring-[var(--accent)]">
                  <Search size={14} className="text-[var(--text-quaternary)]" />
                  <input
                    type="text"
                    placeholder="Buscar sistemas..."
                    className="w-36 bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-quaternary)] outline-none border-none"
                  />
                </div>

                {/* Action buttons */}
                <button className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-quaternary)] hover:bg-[var(--bg-surface-high)] hover:text-[var(--text-primary)] transition-colors active:scale-95 duration-150">
                  <Bell size={18} />
                </button>
                <button className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-quaternary)] hover:bg-[var(--bg-surface-high)] hover:text-[var(--text-primary)] transition-colors active:scale-95 duration-150">
                  <HelpCircle size={18} />
                </button>

                <div className="h-6 w-px bg-[var(--border-neutral)]" />

                <Suspense
                  fallback={
                    <div className="h-8 w-24 rounded-lg bg-[var(--bg-surface-high)] animate-shimmer" />
                  }
                >
                  <TopBarFilters />
                </Suspense>
              </div>
            </div>
          </div>

          {/* Page content */}
          <div className="flex-1 px-6 py-8 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
