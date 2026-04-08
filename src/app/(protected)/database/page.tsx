import { getCommandCenterSnapshot } from "@/lib/command-center-data";
import { cn, formatCompactNumber, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DatabasePage() {
  const snapshot = await getCommandCenterSnapshot();
  const queue = snapshot.database.find((item) => item.tableName === "sync_queue");
  const healthyTables = snapshot.database.filter((item) => item.health === "healthy").length;
  const totalRows = snapshot.database.reduce((sum, item) => sum + item.rowCount, 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Monitoramento de Banco de Dados</h1>
          <p className="text-neutral-400 mt-2">
            Telemetria de saúde em tempo real para o cluster <span className="text-[var(--accent)] font-mono">TRAIL-PROD-SOUTH</span>
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-[var(--bg-surface-high)] rounded-lg p-1 border border-[var(--border-neutral)]">
            <button className="px-4 py-1.5 rounded text-xs font-bold bg-[var(--accent)] text-black shadow-sm">
              Ao Vivo
            </button>
            <button className="px-4 py-1.5 rounded text-xs font-semibold text-neutral-400 hover:text-white transition-colors">
              1H
            </button>
            <button className="px-4 py-1.5 rounded text-xs font-semibold text-neutral-400 hover:text-white transition-colors">
              24H
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-[var(--border-neutral)] bg-[var(--bg-surface-low)] rounded-lg text-sm font-bold text-white hover:bg-[var(--bg-surface-high)] transition-all active:scale-95 duration-150 shadow-sm">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>download</span>
            Exportar Dados
          </button>
        </div>
      </header>

      {/* Hero Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-[var(--bg-surface-low)] rounded-xl p-6 border border-[var(--border-neutral)] flex items-center gap-4 relative overflow-hidden group shadow-inner">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10 w-full">
            <p className="text-sm font-bold text-neutral-400 mb-1 uppercase tracking-widest text-[10px]">Uso de CPU</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">68%</span>
              <span className="text-xs text-[var(--status-red)] flex items-center gap-1 font-bold">
                <span className="material-symbols-outlined text-[14px]">trending_up</span> 4%
              </span>
            </div>
            <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-4 overflow-hidden border border-neutral-800">
              <div className="bg-[var(--accent)] h-full rounded-full shadow-[0_0_8px_var(--accent)]" style={{ width: "68%" }}></div>
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-surface-low)] rounded-xl p-6 border border-[var(--border-neutral)] flex items-center gap-4 relative overflow-hidden group shadow-inner">
          <div className="relative z-10 w-full">
            <p className="text-sm font-bold text-neutral-400 mb-1 uppercase tracking-widest text-[10px]">Uso de Memória</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">74%</span>
              <span className="text-xs text-[var(--accent)] flex items-center gap-1 font-bold">
                <span className="material-symbols-outlined text-[14px]">trending_flat</span> 0%
              </span>
            </div>
            <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-4 overflow-hidden border border-neutral-800">
              <div className="bg-[var(--accent)] h-full rounded-full shadow-[0_0_8px_var(--accent)]" style={{ width: "74%" }}></div>
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-surface-low)] rounded-xl p-6 border border-[var(--border-neutral)] flex items-center gap-4 relative overflow-hidden group shadow-inner">
          <div className="relative z-10 w-full">
            <p className="text-sm font-bold text-neutral-400 mb-1 uppercase tracking-widest text-[10px]">Conexões Ativas</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">142</span>
              <span className="text-xs text-[var(--accent)] flex items-center gap-1 font-bold">
                <span className="material-symbols-outlined text-[14px]">trending_down</span> 12
              </span>
            </div>
            <div className="mt-4 flex gap-1 h-6 items-end">
              <div className="bg-[var(--accent)]/20 w-full h-2/3 rounded-t-sm"></div>
              <div className="bg-[var(--accent)]/40 w-full h-1/2 rounded-t-sm"></div>
              <div className="bg-[var(--accent)]/60 w-full h-3/4 rounded-t-sm"></div>
              <div className="bg-[var(--accent)] w-full h-full rounded-t-sm shadow-[0_0_8px_var(--accent)]"></div>
              <div className="bg-[var(--accent)]/80 w-full h-4/5 rounded-t-sm"></div>
              <div className="bg-[var(--accent)]/50 w-full h-1/2 rounded-t-sm"></div>
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-surface-low)] rounded-xl p-6 border border-[var(--border-neutral)] flex items-center gap-4 relative overflow-hidden group shadow-inner">
          <div className="relative z-10 w-full">
            <p className="text-sm font-bold text-neutral-400 mb-1 uppercase tracking-widest text-[10px]">IOPS</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">4.2k/s</span>
              <span className="text-xs text-[var(--status-red)] flex items-center gap-1 font-bold">
                <span className="material-symbols-outlined text-[14px]">trending_up</span> 0.8k
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between text-[10px] text-[var(--text-tertiary)] font-mono font-bold">
              <span>READ: 2.8k</span>
              <span>WRITE: 1.4k</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Live Performance Chart */}
        <div className="col-span-12 lg:col-span-8 bg-[var(--bg-surface-low)] rounded-xl border border-[var(--border-neutral)] p-6 shadow-inner">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Latência de Query (ms)</h2>
              <p className="text-sm text-neutral-400">Velocidade de execução em tempo real em todos os nós</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-mono text-[var(--accent)] font-bold">12.4ms</span>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold mt-1">Latência Média</p>
            </div>
          </div>
          <div className="h-64 relative">
            <svg className="w-full h-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
              <defs>
                <linearGradient id="latencyGradient" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3"></stop>
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity="0"></stop>
                </linearGradient>
              </defs>
              <path d="M0,250 Q100,230 200,260 T400,180 T600,220 T800,120 T1000,150 L1000,300 L0,300 Z" fill="url(#latencyGradient)"></path>
              <path d="M0,250 Q100,230 200,260 T400,180 T600,220 T800,120 T1000,150" fill="none" stroke="var(--accent)" strokeWidth="3"></path>
              <line stroke="rgba(255,255,255,0.1)" strokeDasharray="4" x1="0" x2="1000" y1="50" y2="50"></line>
              <line stroke="rgba(255,255,255,0.1)" strokeDasharray="4" x1="0" x2="1000" y1="150" y2="150"></line>
              <line stroke="rgba(255,255,255,0.1)" strokeDasharray="4" x1="0" x2="1000" y1="250" y2="250"></line>
            </svg>
            <div className="absolute bottom-0 left-0 w-full flex justify-between px-2 text-[10px] text-[var(--text-tertiary)] font-mono font-bold">
              <span>{new Date().getHours()}:{String(new Date().getMinutes() - 30).padStart(2, '0')}</span>
              <span>{new Date().getHours()}:{String(new Date().getMinutes() - 25).padStart(2, '0')}</span>
              <span>{new Date().getHours()}:{String(new Date().getMinutes() - 20).padStart(2, '0')}</span>
              <span>{new Date().getHours()}:{String(new Date().getMinutes() - 15).padStart(2, '0')}</span>
              <span>{new Date().getHours()}:{String(new Date().getMinutes() - 10).padStart(2, '0')}</span>
              <span>{new Date().getHours()}:{String(new Date().getMinutes() - 5).padStart(2, '0')}</span>
              <span>Hoje</span>
            </div>
          </div>
        </div>

        {/* Replication Status */}
        <div className="col-span-12 lg:col-span-4 bg-[var(--bg-surface-low)] rounded-xl border border-[var(--border-neutral)] p-6 flex flex-col justify-between shadow-inner">
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Status de Replicação</h2>
            <p className="text-sm text-neutral-400 mb-6">Saúde de Primário para Réplica</p>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]"></div>
                  <span className="text-sm font-bold text-neutral-300">Delay de Replicação</span>
                </div>
                <span className="font-mono text-[var(--accent)] font-bold">12ms</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[var(--accent)]"></div>
                  <span className="text-sm font-bold text-neutral-300">Blocos Sincronizados</span>
                </div>
                <span className="font-mono text-white font-bold">99.99%</span>
              </div>
            </div>
          </div>
          
          <div className="mt-8 p-4 rounded-lg bg-neutral-900 border border-neutral-800 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] border border-[var(--accent)]/20">
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>storage</span>
                </div>
                <div className="w-0.5 h-6 bg-[var(--accent)]/20 my-1"></div>
                <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] border border-[var(--accent)]/20">
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>copy_all</span>
                </div>
              </div>
              <div className="flex-1 space-y-5 py-1">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#849396] font-bold">Primário</p>
                  <p className="text-xs font-mono font-medium text-white">BRL-SOUTH-1A</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#849396] font-bold">Réplica</p>
                  <p className="text-xs font-mono font-medium text-white">BRL-SOUTH-1B</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black tracking-widest bg-[var(--status-green-bg)] text-[var(--status-green)] px-2 py-1.5 rounded-sm border border-[var(--status-green-border)]">HEALTHY</span>
              </div>
            </div>
          </div>
        </div>

        {/* Database Instances (Tables) List */}
        <div className="col-span-12 lg:col-span-7 bg-[var(--bg-surface-low)] rounded-xl border border-[var(--border-neutral)] overflow-hidden shadow-inner flex flex-col">
          <div className="p-6 border-b border-[var(--border-neutral)] flex justify-between items-center bg-neutral-900/40">
            <h2 className="text-lg font-bold text-white">Armazenamento em Tabelas</h2>
            <button className="text-[var(--accent)] text-[10px] hover:text-white transition-colors font-black uppercase tracking-widest">
              Ver Tudo
            </button>
          </div>
          <div className="overflow-auto flex-1 h-[400px] custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#1c1b1b] text-[10px] uppercase text-neutral-500 font-bold tracking-widest sticky top-0 z-10 border-b border-[var(--border-neutral)]">
                <tr>
                  <th className="px-6 py-4 font-black">Tabela Local</th>
                  <th className="px-6 py-4 font-black">Status</th>
                  <th className="px-6 py-4 font-black">Volume</th>
                  <th className="px-6 py-4 font-black">Descrição</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-neutral)]">
                {snapshot.database.map((item) => {
                  const isHealthy = item.health === "healthy";
                  const volumePercent = Math.min(100, Math.max(10, Math.log10(item.rowCount + 1) * 15));
                  
                  return (
                    <tr key={item.tableName} className="hover:bg-[var(--bg-surface-high)] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className={`material-symbols-outlined text-[18px] ${isHealthy ? 'text-[var(--accent)]' : 'text-[var(--status-red)]'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                            database
                          </span>
                          <span className="font-mono text-sm font-bold text-white group-hover:text-[var(--accent)] transition-colors">{item.tableName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-sm text-[10px] font-black tracking-widest border ${
                          isHealthy 
                            ? 'bg-[var(--status-green-bg)]/20 text-[var(--status-green)] border-[var(--status-green-border)]' 
                            : 'bg-[var(--status-red-bg)] text-[var(--status-red)] border-[var(--status-red-border)]'
                        }`}>
                          <span className={cn(
                             "w-1.5 h-1.5 rounded-full",
                             isHealthy ? "bg-[var(--status-green)] shadow-[0_0_5px_var(--status-green)]" : "bg-[var(--status-red)] animate-pulse shadow-[0_0_5px_var(--status-red)]"
                          )}></span>
                          {isHealthy ? 'OTIMIZADO' : 'ATENÇÃO'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-neutral-800 h-1 rounded-full overflow-hidden border border-neutral-700">
                            <div className={`h-full ${isHealthy ? 'bg-[var(--accent)] shadow-[0_0_5px_var(--accent)]' : 'bg-[var(--status-red)]'}`} style={{ width: `${volumePercent}%` }}></div>
                          </div>
                          <span className={`text-[11px] font-mono font-bold ${isHealthy ? 'text-white' : 'text-[var(--status-red)]'}`}>
                            {formatCompactNumber(item.rowCount)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[11px] font-medium text-[#849396] max-w-[150px] truncate" title={item.description}>
                        {item.description}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Slow Query Log */}
        <div className="col-span-12 lg:col-span-5 bg-[var(--bg-surface-low)] rounded-xl border border-[var(--border-neutral)] p-6 shadow-inner flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white">Log de Queries Lentas</h2>
            <span className="material-symbols-outlined text-neutral-500 hover:text-cyan-400 cursor-pointer transition-colors text-[20px]">info</span>
          </div>
          <div className="space-y-4 flex-1">
            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 border-l-4 border-l-[var(--status-red)] group hover:border-[var(--status-red)] transition-all cursor-pointer shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-mono font-bold text-neutral-500 bg-neutral-800 px-1.5 py-0.5 rounded">HASH: 8f2a9c...</span>
                <span className="text-xs font-black text-[var(--status-red)]">482ms</span>
              </div>
              <code className="text-[11px] text-white/90 block font-mono mb-3 leading-relaxed break-all">
                SELECT * FROM orders WHERE status = 'pending' AND created_at &lt; NOW()...
              </code>
              <div className="flex justify-between items-center text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                <span>Freq: 142/hr</span>
                <span className="text-[var(--status-red)]">Impacto Crítico</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 border-l-4 border-l-[var(--status-yellow)] group hover:border-[var(--status-yellow)] transition-all cursor-pointer shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-mono font-bold text-neutral-500 bg-neutral-800 px-1.5 py-0.5 rounded">HASH: 3d1v7k...</span>
                <span className="text-xs font-black text-[var(--status-yellow)]">215ms</span>
              </div>
              <code className="text-[11px] text-white/90 block font-mono mb-3 leading-relaxed break-all">
                UPDATE inventory SET stock_count = stock_count - 1 WHERE sku_id IN...
              </code>
              <div className="flex justify-between items-center text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                <span>Freq: 850/hr</span>
                <span className="text-[var(--status-yellow)]">Alto Volume</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 border-l-4 border-l-[var(--accent)] group hover:border-[var(--accent)] transition-all cursor-pointer shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-mono font-bold text-neutral-500 bg-neutral-800 px-1.5 py-0.5 rounded">HASH: 5e9z2m...</span>
                <span className="text-xs font-black text-[var(--accent)]">182ms</span>
              </div>
              <code className="text-[11px] text-white/90 block font-mono mb-3 leading-relaxed break-all">
                INSERT INTO audit_logs (user_id, action, metadata) VALUES ($1, $2, $3)
              </code>
              <div className="flex justify-between items-center text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                <span>Freq: 12.4k/hr</span>
                <span className="text-[var(--accent)]">I/O Limite</span>
              </div>
            </div>
          </div>
          
          <button className="w-full mt-6 py-2.5 border border-dashed border-neutral-700 rounded-lg text-xs font-black text-neutral-400 uppercase tracking-widest hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/5 transition-all">
            Recomendações de Otimização
          </button>
        </div>

      </div>
    </div>
  );
}
