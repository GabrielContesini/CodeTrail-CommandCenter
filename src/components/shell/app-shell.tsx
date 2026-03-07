"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Database,
  LayoutDashboard,
  MonitorCog,
  Siren,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/users", label: "Usuarios", icon: Activity },
  { href: "/systems", label: "Windows", icon: MonitorCog },
  { href: "/database", label: "Banco", icon: Database },
  { href: "/incidents", label: "Incidentes", icon: Siren },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentItem =
    navigation.find((item) =>
      item.href === "/"
        ? pathname === item.href
        : pathname.startsWith(item.href),
    ) ?? navigation[0];

  return (
    <div className="min-h-screen text-[var(--text-primary)]">
      <div className="pointer-events-none fixed inset-0 subtle-grid opacity-20" />
      <aside className="glass-panel panel-ring fixed inset-y-0 left-0 z-20 hidden w-72 flex-col border-r border-white/8 xl:flex">
        <div className="border-b border-white/8 px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-white/8 bg-black/20">
              <Image
                src="/CodeTrail.svg"
                alt="CodeTrail"
                fill
                className="object-cover"
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

        <nav className="flex-1 px-4 py-6">
          <div className="space-y-2">
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
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-white/8 px-4 py-4">
          <div className="rounded-3xl border border-white/8 bg-black/15 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-secondary)]">
              monitor
            </p>
            <p className="mt-2 text-sm font-semibold text-white">
              /api/health e /api/telemetry/heartbeat prontos
            </p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Use a mesma stack Supabase do app principal para consolidar operacao.
            </p>
          </div>
        </div>
      </aside>

      <main className="relative min-h-screen xl:pl-72">
        <div className="glass-panel panel-ring sticky top-0 z-10 mx-4 mt-4 rounded-[28px] border border-white/8 px-4 py-4 sm:mx-6 xl:mx-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-[var(--text-secondary)]">
                superficie ativa
              </p>
              <h2 className="mt-1 text-lg font-semibold text-white">
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
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[var(--text-secondary)]">
                Supabase-first
              </span>
              <span className="rounded-full border border-[var(--accent-secondary)]/20 bg-[rgba(127,255,211,0.08)] px-3 py-1 text-xs text-[var(--accent-secondary)]">
                telemetry-ready
              </span>
            </div>
          </div>
        </div>

        <div className="mx-auto flex max-w-[1600px] flex-col gap-6 px-4 py-6 sm:px-6 xl:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
