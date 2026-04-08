import { UserOpsWorkspace } from "@/components/forms/user-ops-workspace";
import { getAdminAccess } from "@/lib/auth";
import { getCommandCenterSnapshot } from "@/lib/command-center-data";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const [snapshot, access] = await Promise.all([
    getCommandCenterSnapshot(),
    getAdminAccess(),
  ]);

  const role = access?.profile?.role ?? "viewer";
  const totalUsers = snapshot.users.length;
  const riskyUsers = snapshot.users.filter(
    (user) => user.riskLevel === "attention" || user.riskLevel === "critical",
  ).length;
  const pendingSync = snapshot.users.reduce(
    (sum, user) => sum + user.pendingSync,
    0,
  );

  return (
    <div className="mx-auto max-w-7xl space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-[var(--text-primary)]">
            <span className="material-symbols-outlined text-4xl text-[var(--accent)]">
              group
            </span>
            Usuários do Produto
          </h1>
          <p className="mt-1 max-w-lg text-[var(--text-secondary)]">
            Diretório operacional dos usuários reais do CodeTrail Web.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-3 rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-container)] px-4 py-3">
            <span className="material-symbols-outlined text-[var(--accent)]">
              group
            </span>
            <div>
              <div className="text-xl font-black text-[var(--text-primary)] tabular-nums">
                {totalUsers}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-quaternary)]">
                Monitorados
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-container)] px-4 py-3">
            <span className="material-symbols-outlined text-[var(--status-yellow)]">
              warning
            </span>
            <div>
              <div className="text-xl font-black text-[var(--text-primary)] tabular-nums">
                {riskyUsers}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-quaternary)]">
                Em risco
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-container)] px-4 py-3">
            <span className="material-symbols-outlined text-[var(--text-tertiary)]">
              sync
            </span>
            <div>
              <div className="text-xl font-black text-[var(--text-primary)] tabular-nums">
                {pendingSync}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-quaternary)]">
                Sync pendente
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workspace */}
      <UserOpsWorkspace users={snapshot.users} role={role} />
    </div>
  );
}
