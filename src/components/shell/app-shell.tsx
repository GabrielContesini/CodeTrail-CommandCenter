"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Activity,
  ChevronDown,
  Database,
  FolderKanban,
  HeartPulse,
  LayoutDashboard,
  Layers3,
  LogOut,
  MonitorCog,
  Shield,
  Siren,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

  return (
    <div className="min-h-screen text-[var(--text-primary)]">
      <div className="pointer-events-none fixed inset-0 subtle-grid opacity-20" />
      <div className="relative mx-auto min-h-screen max-w-[1880px] xl:grid xl:grid-cols-[272px_minmax(0,1fr)] xl:gap-5 xl:px-6 xl:py-6">
        <aside className="glass-panel panel-ring hidden self-start overflow-hidden rounded-[32px] xl:sticky xl:top-6 xl:flex xl:h-[calc(100vh-3rem)] xl:flex-col">
          <div className="border-b border-white/8 px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-white/8 bg-black/20">
                <Image
                  src="/design/CodeTrailMainIcon.png"
                  alt="CodeTrail"
                  fill
                  className="object-contain p-1.5"
                  priority
                />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.26em] text-[var(--accent-secondary)]">
                  operations
                </p>
                <h1 className="mt-1 text-lg font-semibold text-white">
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
                          "flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium",
                          active
                            ? "bg-[linear-gradient(135deg,rgba(99,179,255,0.24),rgba(127,255,211,0.12))] text-white shadow-[0_12px_30px_-18px_rgba(99,179,255,0.7)]"
                            : "text-[var(--text-secondary)] hover:bg-white/5 hover:text-white",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-2xl border",
                            active
                              ? "border-white/12 bg-black/20"
                              : "border-white/8 bg-black/10",
                          )}
                        >
                          <Icon size={18} />
                        </span>
                        <span className="flex-1">{item.label}</span>
                        {badge ? (
                          <span className="rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-[11px] text-white">
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
                    className="flex items-center gap-3 rounded-3xl px-4 py-3 text-sm text-[var(--text-secondary)] hover:bg-white/5 hover:text-white"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-black/10">
                      <HeartPulse size={18} />
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm text-white">Minha watchlist</span>
                      <span className="mt-1 block text-xs text-[var(--text-secondary)]">
                        usuarios que exigem follow-up
                      </span>
                    </span>
                    <span className="rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[11px] text-[var(--accent-secondary)]">
                      {sidebarSummary.riskyUsers}
                    </span>
                  </Link>

                  <Link
                    href="/database"
                    className="flex items-center gap-3 rounded-3xl px-4 py-3 text-sm text-[var(--text-secondary)] hover:bg-white/5 hover:text-white"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-black/10">
                      <FolderKanban size={18} />
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm text-white">Fila de sync</span>
                      <span className="mt-1 block text-xs text-[var(--text-secondary)]">
                        backlog atual aguardando flush
                      </span>
                    </span>
                    <span className="rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[11px] text-[var(--accent-warning)]">
                      {sidebarSummary.pendingSync}
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          <div className="shrink-0 border-t border-white/8 px-4 pb-4 pt-3">
            {admin ? (
              <div className="rounded-[26px] border border-white/8 bg-black/15 p-3.5">
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
            <div className="px-1.5 sm:px-2">
              <div className="glass-panel panel-ring sticky top-6 z-10 rounded-[24px] border border-white/8 px-4 py-3 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.65)] sm:px-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.26em] text-[var(--text-secondary)]">
                      superficie ativa
                    </p>
                    <h2 className="mt-1 text-base font-semibold text-white sm:text-lg">
                      {currentItem.label}
                    </h2>
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
                            "flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium",
                            active
                              ? "border-[var(--accent)] bg-[rgba(99,179,255,0.16)] text-white"
                              : "border-white/10 text-[var(--text-secondary)]",
                          )}
                        >
                          <Icon size={14} />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-[var(--text-secondary)]">
                      Operacao protegida
                    </span>
                    {admin ? (
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-[var(--text-secondary)]">
                        {admin.role}
                      </span>
                    ) : null}
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
