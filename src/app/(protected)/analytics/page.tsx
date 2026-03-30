import { getCommandCenterSnapshot } from "@/lib/command-center-data";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const snapshot = await getCommandCenterSnapshot();
  const activeUsers = snapshot.users.filter(
    (u) => new Date(u.lastSeenAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  ).length;

  return (
    <main className="pt-24 pb-12 pl-64 pr-8 lg:pr-12 min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">Analytics Detalhado</h2>
            <p className="text-neutral-500 text-sm mt-1">Real-time performance metrics and user behavior intelligence.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-neutral-800 text-on-surface text-sm font-semibold rounded-lg border border-neutral-700 hover:bg-neutral-700 transition-all">
              <span className="material-symbols-outlined text-sm">calendar_today</span>
              Last 30 Days
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary-container text-on-primary-container text-sm font-bold rounded-lg hover:brightness-110 transition-all shadow-lg shadow-cyan-500/20">
              <span className="material-symbols-outlined text-sm">download</span>
              Export Report
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Active Users", value: "14,289", delta: "+12.4%", deltaColor: "emerald", progress: 75 },
            { label: "Latency (Avg)", value: "24ms", delta: "-4.2ms", deltaColor: "emerald", progress: 40 },
            { label: "API Requests", value: "1.2M", delta: "+28.1%", deltaColor: "amber", progress: 90 },
            { label: "Uptime", value: "99.98%", delta: "Stable", deltaColor: "emerald", progress: 100 },
          ].map((metric, i) => (
            <div key={i} className="bg-surface-container rounded-xl p-6 border border-outline-variant/30 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-neutral-400 text-xs font-bold uppercase tracking-widest">{metric.label}</span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                    metric.deltaColor === "emerald" ? "text-emerald-400 bg-emerald-400/10" : "text-amber-400 bg-amber-400/10"
                  }`}
                >
                  {metric.delta}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-black text-on-surface">{metric.value}</p>
                <div className="w-full h-1 bg-neutral-800 mt-4 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-container" style={{ width: `${metric.progress}%` }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Bento Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Active Users Over Time - Large Chart */}
          <div className="col-span-12 lg:col-span-8 bg-surface-container rounded-xl border border-outline-variant/30 p-8">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-lg font-bold text-on-surface">Active Users Over Time</h3>
                <p className="text-neutral-500 text-xs">Concurrent active sessions across all clusters</p>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5 mr-4">
                  <span className="w-3 h-3 rounded-full bg-primary-container"></span>
                  <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-widest">Direct</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-neutral-700"></span>
                  <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-widest">External</span>
                </div>
              </div>
            </div>
            <div className="relative h-[300px] w-full mt-4">
              {/* Graph Mockup */}
              <svg className="w-full h-full" viewBox="0 0 800 300" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="cyanGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Grid Lines */}
                <line stroke="#333" strokeDasharray="4" x1="0" x2="800" y1="50" y2="50" />
                <line stroke="#333" strokeDasharray="4" x1="0" x2="800" y1="150" y2="150" />
                <line stroke="#333" strokeDasharray="4" x1="0" x2="800" y1="250" y2="250" />
                {/* Area Fill */}
                <path d="M0,250 Q100,200 200,230 T400,100 T600,150 T800,50 L800,300 L0,300 Z" fill="url(#cyanGradient)" />
                {/* Line */}
                <path d="M0,250 Q100,200 200,230 T400,100 T600,150 T800,50" fill="none" stroke="#00E5FF" strokeLinecap="round" strokeWidth="4" />
                {/* Data Points */}
                <circle cx="200" cy="230" fill="#00E5FF" r="4" />
                <circle cx="400" cy="100" fill="#00E5FF" r="4" />
                <circle cx="600" cy="150" fill="#00E5FF" r="4" />
                <circle cx="800" cy="50" fill="#00E5FF" r="6" stroke="#000" strokeWidth="2" />
              </svg>
              {/* Tooltip Mockup */}
              <div className="absolute top-[30px] right-[20px] bg-neutral-900 border border-cyan-500/50 p-3 rounded-lg shadow-2xl backdrop-blur-md">
                <p className="text-[10px] text-neutral-400 font-bold uppercase">Peak Active</p>
                <p className="text-lg font-black text-cyan-400">{activeUsers.toLocaleString() || "14.3k"}</p>
              </div>
            </div>
            <div className="flex justify-between mt-6 px-2 text-[10px] font-bold text-neutral-600 uppercase">
              <span>00:00</span>
              <span>04:00</span>
              <span>08:00</span>
              <span>12:00</span>
              <span>16:00</span>
              <span>20:00</span>
              <span>23:59</span>
            </div>
          </div>

          {/* Node Density Map - Small Square */}
          <div className="col-span-12 lg:col-span-4 bg-surface-container rounded-xl border border-outline-variant/30 p-6 overflow-hidden relative group">
            <h3 className="text-sm font-bold text-on-surface mb-1">Node Density Map</h3>
            <p className="text-neutral-500 text-[11px] mb-6 uppercase tracking-widest font-semibold">Geo-Distribution Cluster</p>
            <div className="relative w-full aspect-square bg-neutral-900 rounded-lg overflow-hidden flex items-center justify-center">
              {/* Abstract Map Representation */}
              <div className="absolute inset-0 opacity-20 grayscale bg-gradient-to-br from-neutral-800 to-neutral-900"></div>
              {/* Density Circles */}
              <div className="relative w-full h-full">
                <div className="absolute top-[20%] left-[30%] w-16 h-16 bg-cyan-500/20 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute top-[20%] left-[30%] w-2 h-2 bg-cyan-400 rounded-full ring-4 ring-cyan-400/30"></div>
                <div className="absolute top-[60%] left-[70%] w-24 h-24 bg-cyan-500/30 rounded-full blur-2xl"></div>
                <div className="absolute top-[60%] left-[70%] w-3 h-3 bg-cyan-400 rounded-full ring-8 ring-cyan-400/20"></div>
                <div className="absolute top-[40%] left-[50%] w-12 h-12 bg-cyan-500/10 rounded-full blur-lg"></div>
                <div className="absolute top-[40%] left-[50%] w-1.5 h-1.5 bg-cyan-400 rounded-full ring-2 ring-cyan-400/40"></div>
              </div>
              {/* Legend Overlay */}
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md p-2 rounded border border-neutral-800">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                    <span className="text-[9px] text-neutral-300 font-bold uppercase">High Density</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-neutral-600 rounded-full"></span>
                    <span className="text-[9px] text-neutral-300 font-bold uppercase">Standby</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Table View */}
        <div className="col-span-12 bg-surface-container rounded-xl border border-outline-variant/30 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-on-surface">Top Endpoints</h3>
              <p className="text-neutral-500 text-xs">Most requested API paths this session</p>
            </div>
            <button className="text-neutral-400 hover:text-cyan-400 transition-colors">
              <span className="material-symbols-outlined">open_in_new</span>
            </button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800">
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Endpoint</th>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Requests/sec</th>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Avg Latency</th>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Error Rate</th>
              </tr>
            </thead>
            <tbody>
              {[
                { endpoint: "/api/v1/auth", requests: "2.4k", latency: "12ms", errors: "0.02%" },
                { endpoint: "/api/v1/users", requests: "1.8k", latency: "18ms", errors: "0.05%" },
                { endpoint: "/api/v1/sync", requests: "1.2k", latency: "45ms", errors: "0.1%" },
              ].map((row, i) => (
                <tr key={i} className="border-b border-neutral-800 hover:bg-neutral-800/30 transition-colors">
                  <td className="py-3 px-4 text-sm text-neutral-300 font-mono">{row.endpoint}</td>
                  <td className="py-3 px-4 text-sm text-cyan-400 font-bold">{row.requests}/s</td>
                  <td className="py-3 px-4 text-sm text-neutral-300">{row.latency}</td>
                  <td className="py-3 px-4 text-sm text-neutral-300">{row.errors}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
