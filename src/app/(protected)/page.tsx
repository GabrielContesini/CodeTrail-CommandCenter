import { getCommandCenterSnapshot } from "@/lib/command-center-data";
import {
  cn,
  formatDateTime,
  formatPercent,
  formatRelativeTime,
  platformLabel,
} from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function OverviewPage(
  props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }
) {
  const searchParams = await props.searchParams;
  const snapshot = await getCommandCenterSnapshot();

  return (
    <main className="pt-24 pb-12 pl-64 pr-8 lg:pr-12 min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome & Status Header */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">Dashboard Principal</h2>
            <p className="text-neutral-400 mt-1">Operational overview and global user metrics.</p>
          </div>
          <div className="flex gap-4">
            <button className="bg-primary-container text-on-primary-container px-6 py-2.5 rounded-lg font-bold text-sm shadow-lg shadow-cyan-500/20 hover:brightness-110 active:scale-95 transition-all">
              Execute Backup
            </button>
            <button className="bg-surface-container-high text-white px-6 py-2.5 rounded-lg font-bold text-sm border border-outline-variant/30 hover:bg-surface-bright transition-all">
              Export Logs
            </button>
          </div>
        </section>

        {/* Bento Grid Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* API Status Bento Block - 4 cols */}
          <div className="md:col-span-4 glass-card p-6 rounded-xl flex flex-col justify-between overflow-hidden relative group">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Real-time API Status</span>
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <div className="space-y-4">
                {[
                  { name: "Main API Gateway", status: "online" as const },
                  { name: "Auth Microservice", status: "degrading" as const },
                  { name: "Legacy Sync", status: "offline" as const },
                ].map((service) => (
                  <div
                    key={service.name}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border",
                      service.status === "online"
                        ? "bg-emerald-500/10 border-emerald-500/20"
                        : service.status === "degrading"
                          ? "bg-amber-500/10 border-amber-500/20"
                          : "bg-rose-500/10 border-rose-500/20"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "material-symbols-outlined text-sm",
                          service.status === "online"
                            ? "text-emerald-500"
                            : service.status === "degrading"
                              ? "text-amber-500"
                              : "text-rose-500"
                        )}
                      >
                        {service.status === "online"
                          ? "check_circle"
                          : service.status === "degrading"
                            ? "warning"
                            : "cancel"}
                      </span>
                      <span
                        className={cn(
                          "text-sm font-medium",
                          service.status === "online"
                            ? "text-emerald-200"
                            : service.status === "degrading"
                              ? "text-amber-200"
                              : "text-rose-200"
                        )}
                      >
                        {service.name}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-bold",
                        service.status === "online"
                          ? "text-emerald-500"
                          : service.status === "degrading"
                            ? "text-amber-500"
                            : "text-rose-500"
                      )}
                    >
                      {service.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-8 -right-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-9xl">api</span>
            </div>
          </div>

          {/* Growth Metrics - 5 cols */}
          <div className="md:col-span-5 glass-card p-6 rounded-xl flex flex-col justify-between bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Growth Metrics</span>
                <span className="bg-primary-container/20 text-cyan-400 px-2 py-1 rounded text-[10px] font-bold">+12% WoW</span>
              </div>
              <h3 className="text-5xl font-black text-white mb-2">
                {snapshot.users.length.toLocaleString()}
              </h3>
              <p className="text-sm text-neutral-400">Total Registered Subscribers</p>
            </div>
            <div className="mt-8 flex items-end gap-1 h-24">
              {[40, 60, 55, 75, 90, 100].map((height, i) => (
                <div key={i} className="flex-1 bg-cyan-400/20 rounded-t-sm h-[60%]" style={{ height: `${height}%` }}></div>
              ))}
            </div>
          </div>

          {/* Active Users - 3 cols */}
          <div className="md:col-span-3 glass-card p-6 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-4 block">Active Users</span>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-neutral-900 bg-neutral-800 flex items-center justify-center text-xs font-bold text-white"
                    >
                      U{i}
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full border-2 border-neutral-900 bg-neutral-800 flex items-center justify-center text-[10px] font-bold text-white">
                    +{Math.max(0, snapshot.users.length - 3)}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 border-t border-neutral-800 pt-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400">Peak Today</span>
                <span className="text-white font-bold">
                  {Math.floor(snapshot.users.length * 0.75)}
                </span>
              </div>
              <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-cyan-400 h-full w-[85%]"></div>
              </div>
            </div>
          </div>

          {/* System Performance Analytics - 8 cols */}
          <div className="md:col-span-8 glass-card rounded-xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
              <div>
                <h4 className="text-white font-bold">System Performance Analytics</h4>
                <p className="text-xs text-neutral-500">Last 24 hours traffic analysis</p>
              </div>
              <div className="flex gap-2">
                <button className="bg-neutral-800 text-[10px] uppercase tracking-tighter font-bold px-3 py-1 rounded text-neutral-300 border border-neutral-700">
                  Hour
                </button>
                <button className="bg-primary-container text-on-primary-container text-[10px] uppercase tracking-tighter font-bold px-3 py-1 rounded">
                  Day
                </button>
                <button className="bg-neutral-800 text-[10px] uppercase tracking-tighter font-bold px-3 py-1 rounded text-neutral-300 border border-neutral-700">
                  Week
                </button>
              </div>
            </div>
            <div className="flex-1 p-6 flex items-center justify-center">
              <div className="w-full h-64 relative">
                {/* Decorative SVG Graph */}
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 40">
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
                <div className="absolute top-[20%] left-[60%] -translate-x-1/2 -translate-y-full bg-neutral-900 border border-cyan-400 p-2 rounded shadow-xl">
                  <p className="text-[10px] text-cyan-400 font-bold mb-1">Peak Traffic</p>
                  <p className="text-xs text-white">12,4k requests/sec</p>
                </div>
              </div>
            </div>
          </div>

          {/* System Alerts Sidebar - 4 cols */}
          <div className="md:col-span-4 space-y-4">
            <div className="glass-card p-5 rounded-xl border-l-4 border-l-cyan-400">
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-cyan-400 text-lg">memory</span>
                <p className="text-xs font-bold text-white">Cluster Health</p>
              </div>
              <p className="text-xs text-neutral-400 mb-4">
                All {snapshot.systems.length || 12} nodes reporting healthy status.
              </p>
              <div className="grid grid-cols-4 gap-1">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1 rounded-full",
                      i < 3 ? "bg-cyan-400" : "bg-cyan-400/20"
                    )}
                  ></div>
                ))}
              </div>
            </div>

            <div className="glass-card p-5 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold text-white">Top Endpoints</p>
                <span className="material-symbols-outlined text-neutral-500 text-sm">open_in_new</span>
              </div>
              <ul className="space-y-3">
                {[
                  { path: "/api/v1/auth", requests: "2.4k/s" },
                  { path: "/api/v1/users", requests: "1.8k/s" },
                  { path: "/api/v1/billing", requests: "0.4k/s" },
                ].map((endpoint) => (
                  <li key={endpoint.path} className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500">{endpoint.path}</span>
                    <span className="text-white font-mono">{endpoint.requests}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-1 rounded-xl bg-gradient-to-tr from-cyan-400/50 to-purple-500/50">
              <div className="bg-neutral-900 rounded-[7px] p-5 h-full flex flex-col justify-between">
                <p className="text-xs font-bold text-white mb-2">Security Shield</p>
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-cyan-400 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    verified_user
                  </span>
                  <span className="text-xl font-black text-white">ACTIVE</span>
                </div>
                <p className="text-[10px] text-neutral-500">244 attempted breaches blocked this session.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
