import { AdminMembersWorkspace } from "@/components/forms/admin-members-workspace";
import { getAdminAccess } from "@/lib/auth";
import { getAdminConsoleSnapshot } from "@/lib/admin-data";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [access, snapshot] = await Promise.all([
    getAdminAccess(),
    getAdminConsoleSnapshot(),
  ]);

  const adminRole = access?.profile?.role ?? "viewer";
  const ownerCount = snapshot.members.filter((member) => member.role === "owner").length;
  const adminCount = snapshot.members.filter((member) => member.role === "admin").length;
  const viewerCount = snapshot.members.filter((member) => member.role === "viewer").length;
  const totalMembers = snapshot.members.length;

  return (
    <div className="mx-auto max-w-7xl space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-[var(--text-primary)]">
            <span className="material-symbols-outlined text-4xl text-[var(--accent)]">
              admin_panel_settings
            </span>
            System Administration
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Manage infrastructure access, oversee security policies, and monitor system resources.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
             <div className="text-xs font-bold uppercase tracking-widest text-[var(--text-tertiary)]">
               Current Role
             </div>
             <div className="text-sm font-black text-[var(--accent)]">
               {adminRole}
             </div>
          </div>
          <button className="flex items-center gap-2 rounded bg-[var(--bg-surface-high)] px-4 py-2 text-sm font-bold text-[var(--text-primary)] transition hover:bg-[var(--bg-surface-highest)] border border-[var(--border-neutral)] hover:border-[var(--accent)]">
             <span className="material-symbols-outlined text-[var(--text-secondary)]">download</span>
             Export Audit Log
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Settings */}
        <div className="space-y-8 lg:col-span-2">
           {/* System Configuration (Status Panels) */}
           <div className="rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-container)] p-6">
              <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-[var(--text-primary)]">
                  <span className="material-symbols-outlined text-[var(--accent)]">settings_suggest</span>
                  Infrastructure Configurations
              </h2>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                 {/* Card 1: Auth */}
                 <div className="rounded-lg border border-[var(--border-light)] bg-[var(--bg-surface-low)] p-4 transition hover:border-[var(--border-neutral)]">
                    <div className="mb-3 flex items-start justify-between">
                         <div>
                            <p className="text-sm font-bold text-[var(--text-primary)]">Supabase Public Access</p>
                            <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                              Anon key public authentication
                            </p>
                         </div>
                         <div className={`flex h-5 w-8 items-center rounded-full p-1 transition-colors ${snapshot.hasSupabase ? 'bg-[var(--accent)]' : 'bg-neutral-800'}`}>
                            <div className={`h-3 w-3 rounded-full bg-black transition-transform ${snapshot.hasSupabase ? 'translate-x-3' : 'translate-x-0'}`}></div>
                         </div>
                    </div>
                    {snapshot.hasSupabase ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[var(--status-green)]">
                        <span className="relative flex h-2 w-2">
                           <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--status-green)] opacity-75"></span>
                           <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--status-green)]"></span>
                        </span>
                        ACTIVE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[var(--status-red)]">
                        PENDING
                      </span>
                    )}
                 </div>

                 {/* Card 2: Service Role */}
                 <div className="rounded-lg border border-[var(--border-light)] bg-[var(--bg-surface-low)] p-4 transition hover:border-[var(--border-neutral)]">
                    <div className="mb-3 flex items-start justify-between">
                         <div>
                            <p className="text-sm font-bold text-[var(--text-primary)]">Service Role Key</p>
                            <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                              Elevated administrative privileges
                            </p>
                         </div>
                         <div className={`flex h-5 w-8 items-center rounded-full p-1 transition-colors ${snapshot.hasServiceRole ? 'bg-[var(--accent)]' : 'bg-neutral-800'}`}>
                            <div className={`h-3 w-3 rounded-full bg-black transition-transform ${snapshot.hasServiceRole ? 'translate-x-3' : 'translate-x-0'}`}></div>
                         </div>
                    </div>
                    {snapshot.hasServiceRole ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[var(--status-green)]">
                        <span className="relative flex h-2 w-2">
                           <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--status-green)] opacity-75"></span>
                           <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--status-green)]"></span>
                        </span>
                        SECURE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[var(--status-yellow)]">
                        PENDING
                      </span>
                    )}
                 </div>

                 {/* Card 3: Telemetry */}
                 <div className="rounded-lg border border-[var(--border-light)] bg-[var(--bg-surface-low)] p-4 transition hover:border-[var(--border-neutral)]">
                    <div className="mb-3 flex items-start justify-between">
                         <div>
                            <p className="text-sm font-bold text-[var(--text-primary)]">Product Telemetry</p>
                            <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                              Real-time external heartbeats
                            </p>
                         </div>
                         <div className={`flex h-5 w-8 items-center rounded-full p-1 transition-colors ${snapshot.hasTelemetryToken ? 'bg-[var(--accent)]' : 'bg-neutral-800'}`}>
                            <div className={`h-3 w-3 rounded-full bg-black transition-transform ${snapshot.hasTelemetryToken ? 'translate-x-3' : 'translate-x-0'}`}></div>
                         </div>
                    </div>
                    {snapshot.hasTelemetryToken ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[var(--status-green)]">
                        <span className="relative flex h-2 w-2">
                           <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--status-green)] opacity-75"></span>
                           <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--status-green)]"></span>
                        </span>
                        SYNCING
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[var(--status-yellow)]">
                        DISABLED
                      </span>
                    )}
                 </div>

                 {/* Card 4: Product Source */}
                 <div className="rounded-lg border border-[var(--border-light)] bg-[var(--bg-surface-low)] p-4 transition hover:border-[var(--border-neutral)]">
                    <div className="mb-3 flex items-start justify-between">
                         <div>
                            <p className="text-sm font-bold text-[var(--text-primary)]">Data Synchronizer</p>
                            <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                              App DB connection pool
                            </p>
                         </div>
                         <div className={`flex h-5 w-8 items-center rounded-full p-1 transition-colors ${snapshot.hasProductSource ? 'bg-[var(--accent)]' : 'bg-neutral-800'}`}>
                            <div className={`h-3 w-3 rounded-full bg-black transition-transform ${snapshot.hasProductSource ? 'translate-x-3' : 'translate-x-0'}`}></div>
                         </div>
                    </div>
                    {snapshot.hasProductSource ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[var(--status-green)]">
                        <span className="relative flex h-2 w-2">
                           <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--status-green)] opacity-75"></span>
                           <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--status-green)]"></span>
                        </span>
                        CONNECTED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[var(--status-red)]">
                        DISCONNECTED
                      </span>
                    )}
                 </div>
              </div>
           </div>

           {/* User Management Component */}
           <AdminMembersWorkspace
             members={snapshot.members}
             audit={snapshot.audit}
             currentUserId={access?.user.id ?? ""}
             currentRole={adminRole}
           />
        </div>

        {/* Right Column */}
        <div className="space-y-8">
           {/* Workspace Stats */}
           <div className="rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-container)] p-6">
               <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">
                   Workspace Overview
               </h3>
               <div className="space-y-4">
                   <div className="flex items-end justify-between border-b border-[var(--border-light)] pb-2 text-sm">
                       <span className="text-[var(--text-secondary)]">Total Members</span>
                       <span className="font-bold text-[var(--text-primary)]">{totalMembers}</span>
                   </div>
                   <div className="flex items-end justify-between border-b border-[var(--border-light)] pb-2 text-sm">
                       <span className="text-[var(--text-secondary)]">Active Owners</span>
                       <span className="font-bold text-[var(--accent)]">{ownerCount}</span>
                   </div>
                   <div className="flex items-end justify-between border-b border-[var(--border-light)] pb-2 text-sm">
                       <span className="text-[var(--text-secondary)]">Administrators</span>
                       <span className="font-bold text-[var(--text-primary)]">{adminCount}</span>
                   </div>
                   <div className="flex items-end justify-between pb-2 text-sm">
                       <span className="text-[var(--text-secondary)]">Viewers</span>
                       <span className="font-bold text-[var(--text-primary)]">{viewerCount}</span>
                   </div>
               </div>
               <div className="mt-6 rounded border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-3 text-xs text-[var(--accent)]">
                   Snapshot generated at: <br/><strong className="text-[var(--text-primary)]">{formatDateTime(snapshot.generatedAt)}</strong>
               </div>
           </div>

           {/* Mock Data - Storage / Utilization from the template */}
           <div className="rounded-xl border border-[var(--border-neutral)] bg-black p-6 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)] blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
               <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">
                   Storage Utilization
               </h3>
               <div className="flex items-end gap-2 mb-2">
                   <span className="text-3xl font-black text-[var(--text-primary)]">84%</span>
                   <span className="text-sm font-bold text-[var(--status-yellow)] mb-1">WARNING</span>
               </div>
               <div className="w-full bg-[var(--bg-surface-high)] rounded-full h-1.5 mb-4">
                   <div className="bg-[var(--status-yellow)] h-1.5 rounded-full w-[84%]"></div>
               </div>
               <p className="text-xs text-[var(--text-tertiary)]">
                   420GB of 500GB allocated Database space used. Auto-scaling policy will trigger at 90%.
               </p>
           </div>
        </div>
      </div>
    </div>
  );
}
