import { IncidentConsole } from "@/components/forms/incident-console";
import { getAdminAccess } from "@/lib/auth";
import { getCommandCenterSnapshot } from "@/lib/command-center-data";

export const dynamic = "force-dynamic";

export default async function IncidentsPage() {
  const [snapshot, access] = await Promise.all([
    getCommandCenterSnapshot(),
    getAdminAccess(),
  ]);
  const critical = snapshot.incidents.filter(
    (incident) => incident.severity === "critical",
  ).length;
  const warnings = snapshot.incidents.filter(
    (incident) => incident.severity === "warning",
  ).length;
  const openCount = snapshot.incidents.filter(
    (incident) => incident.status !== "resolved",
  ).length;
  const resolvedCount = snapshot.incidents.filter(
    (incident) => incident.status === "resolved",
  ).length;

  return (
    <div className="mx-auto max-w-7xl space-y-8 w-full">
      {/* Hero Header */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-[var(--text-primary)]">
            Incident Management
          </h1>
          <p className="max-w-lg text-[var(--text-secondary)]">
            Monitor real-time system health, track ongoing investigations, and manage
            historical incident records across the global infrastructure.
          </p>
        </div>

        <div className="flex gap-4">
          <div className="flex items-center gap-4 rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-container)] p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--status-red-bg)]">
              <span className="material-symbols-outlined text-[var(--status-red)]">
                priority_high
              </span>
            </div>
            <div>
              <div className="font-bold text-2xl text-[var(--status-red)]">
                {critical}
              </div>
              <div className="text-xs font-bold uppercase text-[var(--text-tertiary)]">
                Active Critical
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-container)] p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-light)]">
              <span className="material-symbols-outlined text-[var(--accent)]">
                check_circle
              </span>
            </div>
            <div>
              <div className="font-bold text-2xl text-[var(--text-primary)]">
                {resolvedCount}
              </div>
              <div className="text-xs font-bold uppercase text-[var(--text-tertiary)]">
                Resolved (1h)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Incidents List -> delegated to IncidentConsole */}
        <div className="space-y-4 lg:col-span-2">
          <IncidentConsole
            incidents={snapshot.incidents}
            users={snapshot.users}
            instances={snapshot.fleet}
            currentRole={access?.profile?.role ?? "viewer"}
          />
        </div>

        {/* Side Stats / Info */}
        <div className="space-y-6">
          {/* Map/Service Health Component */}
          <div className="overflow-hidden rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-high)]">
            <div className="relative h-32">
              {/* Using a solid background for visual consistency, could replace with static asset if needed */}
              <div className="absolute inset-0 bg-[#0e0e0e] bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuAEWAvrZvvb76LP534q-STnBa0vkuj4veV7jZiiXZdGGUvIrgaZZnQ-qcCYIZLmoujd9fegPKsvmfkmwbFxbc-ue666STB1ONXQkdofvdTdEXEMYDnRVLOiuEDzya8Kb_cPCKid80Y8c_KYpi_DDyUvsi_4xEkRpf1XylzhARDUT0lhJPtzAo8akNAcELCwDr4lxCyCXkO2Wt1qHwYSgw_30904JVmYlanyLPafRYb6CszYkzVDVDDBqpVs9nnaRynHuiroPY55o2M')] bg-cover opacity-50 grayscale" />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-surface-high)] to-transparent" />
              <div className="absolute bottom-3 left-4 flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-[var(--accent)]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] cursor-default">
                  Global Live Map
                </span>
              </div>
            </div>
            <div className="space-y-4 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-secondary)]">
                  Global Availability
                </span>
                <span className="text-xs font-bold text-[var(--accent)]">
                  99.82%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
                <div className="h-full w-[99.8%] bg-[var(--accent)]" />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="rounded-lg border border-[var(--border-light)] bg-[var(--bg-surface-low)] p-3 cursor-default">
                  <div className="mb-1 text-[10px] font-bold uppercase text-[var(--text-tertiary)]">
                    MTTR
                  </div>
                  <div className="text-lg font-bold text-[var(--text-primary)]">24m</div>
                </div>
                <div className="rounded-lg border border-[var(--border-light)] bg-[var(--bg-surface-low)] p-3 cursor-default">
                  <div className="mb-1 text-[10px] font-bold uppercase text-[var(--text-tertiary)]">
                    MTTD
                  </div>
                  <div className="text-lg font-bold text-[var(--text-primary)]">4.2m</div>
                </div>
              </div>
            </div>
          </div>

          {/* On-Call Rotation */}
          <div className="rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-container)] p-5">
            <h3 className="mb-4 flex cursor-default items-center gap-2 text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]">
              <span className="material-symbols-outlined text-lg text-[var(--accent)]">
                person_search
              </span>
              On-Call Squad
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {/* Avatar 1 */}
                  <div className="h-10 w-10 flex shrink-0 items-center justify-center rounded-lg bg-[var(--bg-surface-high)] border border-[var(--border-neutral)] overflow-hidden">
                    <img
                      className="object-cover w-full h-full"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBTkWmnSiCA9QrQzJECwjoTYB2COafkUiN0-TN1cBCQMx0InadkTDvf7WxRilFF7jCGowSsj-8RLUFmYppx7h08EDVfrK5gGry2a-DsatVO5bNpMxHwinHT3mWNIpuRY03IoZuILcXwwaysZ9ksW7jgja54U9vgevTzmjGXD1AwieNdG57thAVNEBvIhoEAQsad9E02_UjAhwAVUgGmauFkFHeLkup8PAUTDqbjCrMosJld63J5XwZ1SFH4P7n7FqJcsfYxl5Ssks"
                      alt="Primary SRE"
                    />
                  </div>
                  <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[var(--bg-surface-container)] bg-[var(--accent)]" />
                </div>
                <div>
                  <div className="font-bold text-sm text-[var(--text-primary)]">Marcus Thorne</div>
                  <div className="text-[10px] uppercase text-[var(--text-tertiary)]">
                    Primary SRE
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-lg bg-[var(--bg-surface-high)] border border-[var(--border-neutral)] overflow-hidden">
                    <img
                      className="object-cover w-full h-full"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYVk4Jc9mwNYYVrE1-3Xem4fAelzRfzsSTuvZtQctZAH3NH3JhaL9Ym7G9hMxM0_c95YdB9Vh5JkTlhM3_OBS-qAMTnMhP5wNPQX-wnBbCsANrLDo4ZzQg0uKBxJJpx_xcieetHvZzcnCBviaqpRDk1zX0D2mq0uq0VyIRLBK4nKdj6DD8MMCMM9MI5Z4Nwi_wC5pMeWjcF1RJk61uv6Lx62TIJuSxEwr-bcf5ie1UrtDG8to2-AjDSnPcuH9uOidI1h32crDyCpI"
                      alt="Secondary SRE"
                    />
                 </div>
                <div>
                  <div className="font-bold text-sm text-[var(--text-primary)]">Elena Rodriguez</div>
                  <div className="text-[10px] uppercase text-[var(--text-tertiary)]">
                    Secondary SRE
                  </div>
                </div>
              </div>
            </div>
            <button
              className="mt-6 w-full rounded-lg border border-[var(--accent)]/30 py-2 text-xs font-bold text-[var(--accent)] transition-colors hover:bg-[var(--accent)]/10"
              type="button"
            >
              Paging Directory
            </button>
          </div>

          {/* Quick Resources */}
          <div className="rounded-xl border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-5">
            <h3 className="mb-3 cursor-default text-xs font-black uppercase tracking-widest text-[var(--accent)]">
              Protocols
            </h3>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              <li className="flex cursor-pointer items-center gap-2 transition-colors hover:text-[var(--accent)]">
                <span className="material-symbols-outlined text-base">
                  menu_book
                </span>
                <span>Incident Response Manual</span>
              </li>
              <li className="flex cursor-pointer items-center gap-2 transition-colors hover:text-[var(--accent)]">
                <span className="material-symbols-outlined text-base">
                  video_chat
                </span>
                <span>Standard Zoom Bridge</span>
              </li>
              <li className="flex cursor-pointer items-center gap-2 transition-colors hover:text-[var(--accent)]">
                <span className="material-symbols-outlined text-base">chat</span>
                <span>#incident-response-warroom</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

