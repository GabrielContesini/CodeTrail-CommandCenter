'use client';

import { MaterialIcon } from '@/components/icons/material-icon';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

// Mock data - será substituído por dados reais
const mockData = {
  users: Array(846).fill(null),
  systems: Array(12).fill(null),
  services: [
    { name: 'Main API Gateway', status: 'online' as const },
    { name: 'Auth Microservice', status: 'degrading' as const },
    { name: 'Legacy Sync', status: 'offline' as const },
  ],
  endpoints: [
    { path: '/api/v1/auth', requests: '2.4k/s' },
    { path: '/api/v1/users', requests: '1.8k/s' },
    { path: '/api/v1/billing', requests: '0.4k/s' },
  ],
  totalSubscribers: 12482,
  peakToday: 2104,
};

export default function DashboardPage() {
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

        {/* Bento Grid Metrics - 4-5-3-8-4 columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Card 1: Real-time API Status (md:col-span-4) */}
          <div className="md:col-span-4 glass-card p-6 rounded-xl flex flex-col justify-between overflow-hidden relative group">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Real-time API Status</span>
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <div className="space-y-4">
                {mockData.services.map((service) => (
                  <div
                    key={service.name}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg border',
                      service.status === 'online'
                        ? 'bg-emerald-500/10 border-emerald-500/20'
                        : service.status === 'degrading'
                          ? 'bg-amber-500/10 border-amber-500/20'
                          : 'bg-rose-500/10 border-rose-500/20'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <MaterialIcon
                        name={
                          service.status === 'online'
                            ? 'check_circle'
                            : service.status === 'degrading'
                              ? 'warning'
                              : 'cancel'
                        }
                        className={cn(
                          'text-sm',
                          service.status === 'online'
                            ? 'text-emerald-500'
                            : service.status === 'degrading'
                              ? 'text-amber-500'
                              : 'text-rose-500'
                        )}
                      />
                      <span
                        className={cn(
                          'text-sm font-medium',
                          service.status === 'online'
                            ? 'text-emerald-200'
                            : service.status === 'degrading'
                              ? 'text-amber-200'
                              : 'text-rose-200'
                        )}
                      >
                        {service.name}
                      </span>
                    </div>
                    <span
                      className={cn(
                        'text-[10px] font-bold',
                        service.status === 'online'
                          ? 'text-emerald-500'
                          : service.status === 'degrading'
                            ? 'text-amber-500'
                            : 'text-rose-500'
                      )}
                    >
                      {service.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-8 -right-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <MaterialIcon name="api" className="text-9xl" />
            </div>
          </div>

          {/* Card 2: Growth Metrics (md:col-span-5) */}
          <div className="md:col-span-5 glass-card p-6 rounded-xl flex flex-col justify-between bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Growth Metrics</span>
                <span className="bg-primary-container/20 text-cyan-400 px-2 py-1 rounded text-[10px] font-bold">+12% WoW</span>
              </div>
              <h3 className="text-5xl font-black text-white mb-2">{mockData.totalSubscribers.toLocaleString()}</h3>
              <p className="text-sm text-neutral-400">Total Registered Subscribers</p>
            </div>
            <div className="mt-8 flex items-end gap-1 h-24">
              {[40, 60, 55, 75, 90, 100].map((height, i) => (
                <div key={i} className="flex-1 bg-cyan-400/20 rounded-t-sm" style={{ height: `${height}%` }}></div>
              ))}
            </div>
          </div>

          {/* Card 3: Active Users (md:col-span-3) */}
          <div className="md:col-span-3 glass-card p-6 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-4 block">Active Users</span>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  <img
                    alt="User 1"
                    className="w-10 h-10 rounded-full border-2 border-neutral-900 object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBL677WbZ-TvdVm6WPhOGkZbEjhcs-VGMYtiLGJPDvhfhNoCXYYm8KQkJy1RKycy8p5OhXTwnP5xanghvn8ymf0t6820K48FVpfj8YSWx6n440Tp1ND7lgkk1-jk1II6uT5H84ejGvPUm1XjV_NdK_3SSuZTA1VWmBjdAUd7DFK6m8gvkPxOeDMGCfRl5CPSFObZU5hA5GJnVsacCizPyxnax4doQz09NWr5TTv9_k-RaXjwU4h5J-c0BjjYrwj01p9rqrHRpCEYKg"
                  />
                  <img
                    alt="User 2"
                    className="w-10 h-10 rounded-full border-2 border-neutral-900 object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTY5RhXq6V_AxJv0fXtFy-4wwPRIVdGdPZaDc4Jfq5zjMrFebnKtPT53w-9A9R8eccj3qb7hv_p6ZYrXTYZJaYpiQEgapiNtOeOHpkagadISnRe6PRx2qHC3LClqCE7nFXj0kHMPvz8l6UJb3KM0ezpi793kfZsg7JJh1B-KQ1E29hB2eAOKUtK2yyKxFOjTKeLgsRu2z3ymQ3P0hc7-Kknk5gzRNeL4WvXKPomaxSx2ue8npycTeSF6rOFR2tVliK_5xoDlQIAM4"
                  />
                  <img
                    alt="User 3"
                    className="w-10 h-10 rounded-full border-2 border-neutral-900 object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtPlBZP1P-_RKiC9912sGSAHwyCaM31rEYz-rOluOL-1HwwQEsYVUeW1sC2VF2a9mjGvUqi3s9wUafCRGgsZU4-mRZcNDmbfNGs7_WjyfodDRqnubVASPXzjELwknf0AQVpsae2r67gmTJaeHqkS67gUzV0gBxO0h5AhIfW7x-fQjoaZl7-qs5u_cZeOvBot0mbEcHF8bzkJtdWfINayjMhk-kPIZK09mZVZOvj4koG4lzklx7qEIjSlYg2QENSuStXoEF9nsKfJE"
                  />
                  <div className="w-10 h-10 rounded-full border-2 border-neutral-900 bg-neutral-800 flex items-center justify-center text-[10px] font-bold text-white">
                    +842
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 border-t border-neutral-800 pt-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400">Peak Today</span>
                <span className="text-white font-bold">{mockData.peakToday.toLocaleString()}</span>
              </div>
              <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-cyan-400 h-full w-[85%]"></div>
              </div>
            </div>
          </div>

          {/* Card 4: Analytics Chart (md:col-span-8) */}
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

          {/* Card 5: Memory Usage Sidebar (md:col-span-4) */}
          <div className="md:col-span-4 space-y-4">
            <div className="glass-card p-5 rounded-xl border-l-4 border-l-cyan-400">
              <div className="flex items-center gap-3 mb-3">
                <MaterialIcon name="memory" className="text-cyan-400 text-lg" />
                <p className="text-xs font-bold text-white">Cluster Health</p>
              </div>
              <p className="text-xs text-neutral-400 mb-4">
                All {mockData.systems.length} nodes reporting healthy status within specified parameters.
              </p>
              <div className="grid grid-cols-4 gap-1">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={cn('h-1 rounded-full', i < 3 ? 'bg-cyan-400' : 'bg-cyan-400/20')}
                  ></div>
                ))}
              </div>
            </div>

            <div className="glass-card p-5 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold text-white">Top Endpoints</p>
                <MaterialIcon name="open_in_new" className="text-neutral-500 text-sm" />
              </div>
              <ul className="space-y-3">
                {mockData.endpoints.map((endpoint) => (
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
                  <MaterialIcon
                    name="shield_with_heart"
                    className="text-cyan-400 text-3xl"
                    filled
                  />
                  <span className="text-xl font-black text-white">ACTIVE</span>
                </div>
                <p className="text-[10px] text-neutral-500">244 attempted breaches blocked this session.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAB - Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="bg-primary-container text-on-primary-container w-14 h-14 rounded-full shadow-2xl shadow-cyan-400/40 flex items-center justify-center group active:scale-90 transition-all">
          <MaterialIcon name="add" className="text-2xl" filled />
        </button>
      </div>
    </main>
  );
}
