"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

const primaryNavigation = [
  { href: "/", label: "Dashboard", icon: "dashboard" },
  { href: "/incidents", label: "Incidentes", icon: "emergency" },
  { href: "/admin", label: "Sistema Config", icon: "settings" },
];

const observabilityNavigation = [
  { href: "/users", label: "Membros", icon: "group" },
  { href: "/apis", label: "APIs", icon: "api" },
  { href: "/systems", label: "Plataformas", icon: "analytics" },
  { href: "/database", label: "Database", icon: "database" },
  { href: "/billing", label: "Faturamento", icon: "receipt_long" },
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = useMemo(
    () => [...primaryNavigation, ...observabilityNavigation],
    []
  );

  return (
    <div className="bg-[var(--bg-base)] text-on-background antialiased selection:bg-[var(--accent)]/20 selection:text-[var(--accent)] min-h-screen">
      {/* SideNavBar Anchor */}
      <aside 
        className={cn(
          "fixed left-0 top-0 h-full w-64 flex-col py-6 z-[60] bg-neutral-900 border-r border-neutral-800 font-medium text-sm transition-transform duration-300 md:flex",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="px-6 mb-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/20 flex items-center justify-center border border-[var(--accent)]/30">
              <span className="material-symbols-outlined text-[var(--accent)] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>terminal</span>
            </div>
            <div>
              <h1 className="text-[var(--accent)] font-black leading-tight tracking-tight">Command Center</h1>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-0.5">Admin Terminal</p>
            </div>
          </div>
          {/* Close Menu Button (Mobile Only) */}
          <button 
            type="button" 
            className="md:hidden text-neutral-400 hover:text-white"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {navigation.map((item) => {
            const active = item.href === "/" ? pathname === item.href : pathname.startsWith(item.href);
            const badge =
              item.href === "/incidents"
                ? sidebarSummary.openIncidents
                : item.href === "/users"
                  ? sidebarSummary.riskyUsers
                  : item.href === "/systems"
                    ? sidebarSummary.degradedSystems
                    : item.href === "/database"
                      ? sidebarSummary.databaseAttention
                      : undefined;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                  active
                    ? "bg-[var(--accent)]/10 text-[var(--accent)] border-r-4 border-[var(--accent)] font-bold pointer-events-none"
                    : "text-neutral-500 hover:bg-neutral-800 hover:text-[var(--accent)] active:translate-x-1"
                )}
              >
                <span 
                  className="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110" 
                  style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {badge ? (
                  <span className={cn(
                     "rounded-full px-1.5 py-0.5 text-[10px] font-bold border",
                     item.href === "/incidents" 
                       ? "bg-[var(--status-red-bg)] border-[var(--status-red-border)] text-[var(--status-red)]" 
                       : "border-neutral-700 bg-neutral-800 text-neutral-400"
                  )}>
                    {badge}
                  </span>
                ) : null}
              </Link>
            )
          })}
          
           <div className="mt-8 mb-3 px-4 uppercase text-[10px] tracking-[0.15em] font-bold text-neutral-600">
             Workspace
           </div>
           
           <Link
             href="/support"
             onClick={() => setMobileMenuOpen(false)}
             className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group active:translate-x-1",
                pathname === "/support"
                  ? "bg-[var(--accent)]/10 text-[var(--accent)] border-r-4 border-[var(--accent)] font-bold pointer-events-none"
                  : "text-neutral-500 hover:bg-neutral-800 hover:text-[var(--accent)]"
              )}
           >
             <span className="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110">chat</span>
             <span className="flex-1">Suporte Operacional</span>
           </Link>
           <Link
             href="/logout"
             onClick={() => setMobileMenuOpen(false)}
             className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-500 hover:bg-[var(--status-red-bg)] hover:text-[var(--status-red)] hover:border-[var(--status-red-border)] border border-transparent transition-all duration-200 group active:translate-x-1"
           >
             <span className="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110">logout</span>
             <span className="flex-1">Sair da Sessão</span>
           </Link>
        </nav>
        
        <div className="px-6 mt-6 pb-2">
          <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 shadow-inner">
            <p className="text-[10px] text-neutral-500 mb-2 uppercase font-bold tracking-widest flex items-center justify-between">
              <span>Carga da API</span>
              <span className="flex h-2 w-2 rounded-full bg-[var(--accent)] animate-pulse"></span>
            </p>
            <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden mt-3">
              <div className="bg-[var(--accent)] h-full w-[42%] shadow-[0_0_10px_var(--accent)]"></div>
            </div>
            <p className="text-xs mt-2 text-[var(--accent)] font-bold tabular-nums">42.8% Capacidade</p>
          </div>
        </div>
      </aside>

      {/* Overlay Backdrop for Mobile Menu */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* TopAppBar Anchor */}
      <header className="fixed top-0 w-full z-40 flex justify-between items-center px-4 md:px-6 h-16 bg-neutral-900 border-b border-neutral-800 md:ml-64 md:w-[calc(100%-16rem)] shadow-sm antialiased backdrop-blur-md bg-opacity-90">
        <div className="flex items-center gap-3">
          {/* Hamburger Menu (Mobile Only) */}
          <button 
            type="button"
            className="md:hidden text-neutral-400 hover:text-[var(--accent)] focus:outline-none p-1"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
          
          <div className="relative w-full max-w-sm hidden sm:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-[18px]">search</span>
            <input 
              type="text"
              placeholder="Buscar no sistema (Cmd + K)..."
              className="w-full bg-neutral-800/50 border border-neutral-800 rounded-lg py-1.5 pl-10 pr-4 text-sm focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] text-white outline-none transition-all placeholder:text-neutral-500 shadow-inner"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-6">
           <div className="flex items-center gap-1 sm:gap-2">
             <button aria-label="Notificações" className="relative text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors p-2 rounded-lg active:scale-95 duration-150">
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--status-red)] shadow-[0_0_8px_var(--status-red)]"></span>
             </button>
             <button aria-label="Ajuda" className="hidden sm:flex text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors p-2 rounded-lg active:scale-95 duration-150">
                <span className="material-symbols-outlined text-[20px]">help_center</span>
             </button>
           </div>
           
           <div className="h-8 w-px bg-neutral-800 hidden sm:block"></div>
           
           <div className="flex items-center gap-3 select-none cursor-pointer group">
              <div className="text-right hidden sm:block">
                <p className="text-[13px] font-bold text-white leading-tight group-hover:text-[var(--accent)] transition-colors">{admin?.displayName || "Admin"}</p>
                <p className="text-[10px] text-neutral-400 font-bold tracking-wider mt-0.5 uppercase group-hover:text-[var(--accent)] transition-colors">{admin?.role === "owner" ? "System Master" : (admin?.role || "Operador")}</p>
              </div>
              <div className="w-9 h-9 rounded-full border border-neutral-700 flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900 overflow-hidden shadow-inner group-hover:border-[var(--accent)] transition-colors">
                 <span className="material-symbols-outlined text-neutral-400 group-hover:text-[var(--accent)] transition-colors" style={{ fontVariationSettings: "'FILL' 1" }}>shield_person</span>
              </div>
           </div>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className={cn(
          "transition-all min-h-screen bg-black",
          pathname === "/support"
            ? "md:pl-64 pt-16 flex flex-col h-screen overflow-hidden"
            : "md:pl-64 pt-24 pb-12"
      )}>
        {pathname === "/support" ? (
             <div className="flex-1 w-full h-full relative overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                {children}
             </div>
        ) : (
            <div className="max-w-[1600px] mx-auto px-4 sm:px-8 xl:px-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {children}
            </div>
        )}
      </main>
    </div>
  );
}
