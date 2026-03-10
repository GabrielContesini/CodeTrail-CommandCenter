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
  Siren
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
    <div className="flex items-center rounded-full border border-white/10 bg-black/40 p-1">
      <select
        value={envFilter}
        onChange={(e) => setEnvFilter(e.target.value)}
        className="appearance-none cursor-pointer bg-transparent pl-3 pr-2 py-1 text-xs font-medium text-white outline-none"
      >
        <option value="all">Global</option>
        <option value="prod">Producao</option>
        <option value="stag">Staging</option>
      </select>
      <div className="h-4 w-px bg-white/10 mx-1" />
      <select
        value={timeRange}
        onChange={(e) => setTimeRange(e.target.value)}
        className="appearance-none cursor-pointer bg-transparent pl-2 pr-3 py-1 text-xs font-medium text-[var(--accent-secondary)] outline-none"
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

  const globalHealthScore = 94; // Mocked for now

  return (
    <div className="min-h-screen text-[var(--text-primary)]">
      <div className="pointer-events-none fixed inset-0 subtle-grid opacity-20" />
      <div className="relative mx-auto min-h-screen max-w-[1880px] xl:grid xl:grid-cols-[272px_minmax(0,1fr)] xl:gap-5 xl:px-6 xl:py-6">
        <aside className="oled-panel hidden self-start overflow-hidden rounded-[20px] xl:sticky xl:top-6 xl:flex xl:h-[calc(100vh-3rem)] xl:flex-col">
          <div className="border-b border-white/5 px-6 py-5 bg-[var(--background)]">
            <div className="flex items-center gap-4">
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-[var(--primary-muted)] bg-[var(--primary-muted)]">
                <Image
                  src="/design/CodeTrailMainIcon.png"
                  alt="CodeTrail"
                  fill
                  className="object-contain p-1.5"
                  priority
                />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  operations
                </p>
                <h1 className="mt-1 text-[15px] font-semibold text-white tracking-tight leading-tight">
                  CodeTrail Command Center
                </h1>
              </div>
            </div>
          </div>

          <nav className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-4 py-5">
            <div className="space-y-5">
              <div>
                <p className="px-4 text-[11px] uppercase tracking-[0.26em] text-[var(--text-secondary)]">
                  sistema
                </p>
                <div className="mt-3 space-y-2">
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
                          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors",
                          active
                            ? "bg-[var(--primary-muted)] text-[var(--primary)] border border-[var(--primary-muted)]"
                            : "text-[var(--text-secondary)] border border-transparent hover:bg-white/[0.03] hover:text-white",
                        )}
                      >
                        <span className="flex items-center justify-center">
                          <Icon size={16} className={active ? "text-[var(--primary)]" : "opacity-80"} />
                        </span>
                        <span className="flex-1">{item.label}</span>
                        {badge ? (
                          <span className="data-value rounded border border-[var(--danger-muted)] bg-[var(--danger-muted)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--danger)]">
                            {badge}
                          </span>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-white/8 pt-5">
                <button
                  type="button"
                  onClick={() => setWorkspaceOpen((current) => !current)}
                  className="flex w-full items-center gap-3 rounded-3xl px-4 py-3 text-left text-sm font-semibold text-white hover:bg-white/4"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-black/10">
                    <Layers3 size={18} />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm text-white">Observabilidade</span>
                    <span className="mt-1 block text-xs font-normal text-[var(--text-secondary)]">
                      usuarios, plataformas e banco
                    </span>
                  </span>
                  <ChevronDown
                    size={16}
                    className={cn(
                      "text-[var(--text-secondary)] transition-transform",
                      workspaceOpen ? "rotate-0" : "-rotate-90",
                    )}
                  />
                </button>

                {workspaceOpen ? (
                  <div className="relative mt-2 pl-7">
                    <div className="absolute bottom-4 left-[27px] top-1 w-px bg-white/8" />
                    <div className="space-y-1">
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
                              "relative flex items-center gap-3 rounded-2xl py-2.5 pl-6 pr-4 text-sm",
                              active
                                ? "bg-white/6 text-white"
                                : "text-[var(--text-secondary)] hover:bg-white/4 hover:text-white",
                            )}
                          >
                            <span className="absolute left-0 top-1/2 h-px w-4 -translate-y-1/2 bg-white/10" />
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/8 bg-black/10">
                              <Icon size={16} />
                            </span>
                            <span className="flex-1">{item.label}</span>
                            {badge ? (
                              <span className="rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[11px] text-[var(--text-secondary)]">
                                {badge}
                              </span>
                            ) : null}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="border-t border-white/8 pt-5">
                <p className="px-4 text-[11px] uppercase tracking-[0.26em] text-[var(--text-secondary)]">
                  workspace
                </p>
                <div className="mt-3 space-y-2">
                  <Link
                    href="/users"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] border border-transparent text-[var(--text-secondary)] hover:bg-[var(--warning-muted)] hover:border-[var(--warning-muted)] hover:text-[var(--warning)] transition-colors"
                  >
                    <span className="flex items-center justify-center">
                      <HeartPulse size={16} className="opacity-80" />
                    </span>
                    <span className="flex-1">
                      <span className="block text-[13px] font-medium text-inherit">Minha watchlist</span>
                    </span>
                    <span className="data-value rounded border border-[var(--warning-muted)] bg-black/40 px-1.5 py-0.5 text-[10px] font-semibold text-inherit">
                      {sidebarSummary.riskyUsers}
                    </span>
                  </Link>

                  <Link
                    href="/database"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] border border-transparent text-[var(--text-secondary)] hover:bg-[var(--neutral-muted)] hover:border-[var(--panel-border)] hover:text-white transition-colors"
                  >
                    <span className="flex items-center justify-center">
                      <FolderKanban size={16} className="opacity-80" />
                    </span>
                    <span className="flex-1">
                      <span className="block text-[13px] font-medium text-inherit">Fila de sync</span>
                    </span>
                    <span className="data-value rounded border border-[var(--neutral-muted)] bg-black/40 px-1.5 py-0.5 text-[10px] font-semibold text-inherit">
                      {sidebarSummary.pendingSync}
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          <div className="shrink-0 border-t border-[var(--panel-border)] bg-[var(--background)] px-4 pb-4 pt-4">
            {admin ? (
              <div className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-secondary)]">
                      admin
                    </p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-white">
                      {admin.displayName}
                    </p>
                    <p className="mt-1 truncate text-xs text-[var(--text-secondary)]">
                      {admin.email ?? "sem-email"}
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-[var(--accent-secondary)]">
                    <Shield size={12} />
                    {admin.role}
                  </span>
                </div>
                <a
                  href="/logout"
                  className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs font-medium text-[var(--text-secondary)] hover:border-white/20 hover:bg-white/5 hover:text-white"
                >
                  <LogOut size={14} />
                  Encerrar sessao
                </a>
              </div>
            ) : null}
          </div>
        </aside>

        <main className="min-w-0 px-4 py-6 sm:px-6 xl:px-0 xl:py-0">
          <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-7">
            <div className="px-0 sm:px-2">
              <div className="oled-panel sticky top-6 z-10 flex min-h-[60px] flex-col justify-center rounded-[16px] px-4 py-3 sm:px-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-[84px] shrink-0 flex-col items-center justify-center rounded-lg bg-[var(--success-muted)] border border-[rgba(16,185,129,0.2)]">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--success)] opacity-90">Score</span>
                      <span className="data-value text-base font-bold leading-none text-[var(--success)] glow-text-success">{globalHealthScore}</span>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-bold">
                        superficie ativa
                      </p>
                      <h2 className="mt-0.5 text-[15px] font-semibold text-white tracking-tight">
                        {currentItem.label}
                      </h2>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 xl:hidden">
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
                            "flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition-all",
                            active
                              ? "border-[var(--accent)] bg-[rgba(0,142,179,0.24)] text-white shadow-[0_0_12px_rgba(0,191,255,0.2)]"
                              : "border-white/10 text-[var(--text-secondary)] hover:text-white hover:border-white/20",
                          )}
                        >
                          <Icon size={14} />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center rounded-full border border-white/10 bg-black/40 px-3 py-1.5 focus-within:border-[var(--accent)] focus-within:bg-black/60 transition-colors">
                      <Search size={14} className="text-[var(--text-secondary)]" />
                      <input
                        type="text"
                        placeholder="Cmd + K para buscar..."
                        className="ml-2 w-40 bg-transparent text-xs text-white placeholder-white/30 outline-none"
                      />
                    </div>

                    <Suspense fallback={<div className="h-8 w-[160px] rounded-full border border-white/10 bg-black/40 animate-pulse" />}>
                      <TopBarFilters />
                    </Suspense>

                    <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[rgba(255,255,255,0.03)] px-3 py-1.5 text-[11px] font-medium text-[var(--text-secondary)]">
                      <Shield size={12} className="text-[var(--accent-secondary)]" />
                      Protected
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full px-1.5 pb-6 pt-1 sm:px-2 sm:pt-2">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
