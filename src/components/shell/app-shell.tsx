"use client";

import { cn } from "@/lib/utils";
import {
  Activity,
  ChevronDown,
  Database,
  FolderKanban,
  HeartPulse,
  Layers3,
  LayoutDashboard,
  LogOut,
  MonitorCog,
  Search,
  Shield,
  Siren,
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
    <div className="flex items-center gap-0 rounded-full border border-[var(--border-default)] bg-[var(--bg-base)] p-0.5 shadow-sm">
      <select
        value={envFilter}
        onChange={(e) => setEnvFilter(e.target.value)}
        className="appearance-none cursor-pointer rounded-full bg-transparent pl-3 pr-2 py-1.5 text-xs font-medium text-[var(--text-primary)] outline-none"
      >
        <option value="all">Global</option>
        <option value="prod">Producao</option>
        <option value="stag">Staging</option>
      </select>
      <div className="h-3 w-px bg-[var(--border-default)]" />
      <select
        value={timeRange}
        onChange={(e) => setTimeRange(e.target.value)}
        className="appearance-none cursor-pointer rounded-full bg-transparent pl-2 pr-3 py-1.5 text-xs font-semibold text-[var(--accent-mid)] outline-none"
      >
        <option value="1h">1H</option>
        <option value="24h">24H</option>
        <option value="7d">7D</option>
      </select>
    </div>
  );
}

const primaryNavigation = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/incidents", label: "Incidentes", icon: Siren },
  { href: "/admin", label: "Admin", icon: Shield },
];

const observabilityNavigation = [
  { href: "/users", label: "Usuarios", icon: Activity },
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
      {/* Layout shell */}
      <div className="relative mx-auto min-h-screen max-w-[1920px] xl:grid xl:grid-cols-[var(--sidebar-width)_minmax(0,1fr)] xl:gap-0">

        {/* ── Sidebar ── */}
        <aside
          className="hidden self-start xl:flex xl:h-screen xl:sticky xl:top-0 xl:flex-col"
          style={{
            background: "var(--sidebar-bg)",
            borderRight: "1px solid var(--border-subtle)",
          }}
        >
          {/* Logo zone */}
          <div className="flex items-center gap-3 px-5 py-[18px] border-b border-[var(--border-subtle)]">
            <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg">
              <Image
                src="/design/CodeTrailMainIcon.png"
                alt="CodeTrail"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-quaternary)]">
                CodeTrail
              </p>
              <p className="text-[13px] font-semibold text-[var(--text-primary)] tracking-tight leading-none mt-0.5">
                Command Center
              </p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
            {/* Primary nav */}
            <div>
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-quaternary)]">
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
                        "flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-[13px] font-medium transition-all duration-100",
                        active
                          ? "nav-active"
                          : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
                      )}
                    >
                      <Icon size={15} strokeWidth={active ? 2.2 : 1.8} />
                      <span className="flex-1">{item.label}</span>
                      {badge ? (
                        <span className="data-value rounded-full bg-[var(--status-red-bg)] border border-[var(--status-red-border)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--status-red)]">
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
                <p className="flex-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-quaternary)]">
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
                          "flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-[13px] font-medium transition-all duration-100",
                          active
                            ? "bg-[var(--accent-light)] text-[var(--accent-mid)]"
                            : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
                        )}
                      >
                        <Icon size={15} strokeWidth={active ? 2.2 : 1.8} />
                        <span className="flex-1">{item.label}</span>
                        {badge ? (
                          <span className="data-value rounded-full border border-[var(--border-default)] bg-white px-1.5 py-0.5 text-[10px] font-medium text-[var(--text-tertiary)]">
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
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-quaternary)]">
                Workspace
              </p>
              <div className="space-y-0.5">
                <Link
                  href="/users"
                  className="flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-[13px] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <HeartPulse size={15} strokeWidth={1.8} className="text-[var(--status-yellow)]" />
                  <span className="flex-1 font-medium">Minha watchlist</span>
                  <span className="data-value rounded-full bg-[var(--status-yellow-bg)] border border-[var(--status-yellow-border)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--status-yellow)]">
                    {sidebarSummary.riskyUsers}
                  </span>
                </Link>

                <Link
                  href="/database"
                  className="flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-[13px] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <FolderKanban size={15} strokeWidth={1.8} />
                  <span className="flex-1 font-medium">Fila de sync</span>
                  <span className="data-value rounded-full border border-[var(--border-default)] bg-white px-1.5 py-0.5 text-[10px] font-medium text-[var(--text-tertiary)]">
                    {sidebarSummary.pendingSync}
                  </span>
                </Link>
              </div>
            </div>
          </nav>

          {/* Admin card */}
          <div className="shrink-0 border-t border-[var(--border-subtle)] px-3 py-3">
            {admin ? (
              <div className="rounded-[12px] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-mid)] text-white">
                    <span className="text-[11px] font-bold">
                      {admin.displayName?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-[var(--text-primary)] leading-none truncate">
                      {admin.displayName}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[var(--text-tertiary)] truncate">
                      {admin.email ?? "sem-email"}
                    </p>
                  </div>
                  <a
                    href="/logout"
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text-quaternary)] hover:bg-[var(--status-red-bg)] hover:text-[var(--status-red)] transition-colors"
                    title="Encerrar sessao"
                  >
                    <LogOut size={14} />
                  </a>
                </div>
              </div>
            ) : null}
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="min-w-0 flex flex-col">
          {/* Top bar */}
          <div className="sticky top-0 z-20 glass border-b border-[var(--border-subtle)] px-5 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--status-green-bg)] border border-[var(--status-green-border)]">
                  <span className="data-value text-[11px] font-bold text-[var(--status-green)]">
                    {globalHealthScore}
                  </span>
                </div>
                <div>
                  <p className="label-caps">Superficie ativa</p>
                  <p className="text-[14px] font-semibold text-[var(--text-primary)] leading-tight tracking-tight">
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
                          ? "border-[var(--accent-light)] bg-[var(--accent-light)] text-[var(--accent-mid)]"
                          : "border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
                      )}
                    >
                      <Icon size={12} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              {/* Right controls */}
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2 transition-all focus-within:border-[var(--accent-mid)] focus-within:ring-2 focus-within:ring-[var(--accent-light)]">
                  <Search size={13} className="text-[var(--text-quaternary)]" />
                  <input
                    type="text"
                    placeholder="Buscar... (⌘K)"
                    className="w-36 bg-transparent text-[12px] text-[var(--text-primary)] placeholder-[var(--text-quaternary)] outline-none"
                  />
                </div>

                <Suspense
                  fallback={
                    <div className="h-8 w-36 rounded-full border border-[var(--border-default)] bg-[var(--bg-base)] animate-pulse" />
                  }
                >
                  <TopBarFilters />
                </Suspense>
              </div>
            </div>
          </div>

          {/* Page content */}
          <div className="flex-1 px-5 py-6 lg:px-7 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
