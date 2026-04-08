"use client";

import { startTransition, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminAuditEntry, AdminMemberSnapshot, AdminRole } from "@/lib/types";
import { formatDateTime, formatRelativeTime } from "@/lib/utils";

const roleOptions: AdminRole[] = ["owner", "admin", "operator", "viewer"];

/* ─── shared input / select style ─────────────────────────────────────────── */
const inputCls =
  "input-dark w-full rounded-xl px-4 py-3 text-sm disabled:opacity-60";

export function AdminMembersWorkspace({
  members,
  audit,
  currentUserId,
  currentRole,
}: {
  members: AdminMemberSnapshot[];
  audit: AdminAuditEntry[];
  currentUserId: string;
  currentRole: AdminRole;
}) {
  const router = useRouter();
  const canManageMembers = currentRole === "owner";
  const [feedback, setFeedback] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<AdminRole>("viewer");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { displayName: string; role: AdminRole }>>(
    () =>
      Object.fromEntries(
        members.map((member) => [
          member.id,
          { displayName: member.displayName, role: member.role },
        ]),
      ),
  );

  const ownerCount = useMemo(
    () => members.filter((member) => member.role === "owner").length,
    [members],
  );

  function updateDraft(memberId: string, patch: Partial<{ displayName: string; role: AdminRole }>) {
    setDrafts((current) => ({
      ...current,
      [memberId]: {
        displayName: current[memberId]?.displayName ?? "",
        role: current[memberId]?.role ?? "viewer",
        ...patch,
      },
    }));
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManageMembers) return;

    setCreating(true);
    setFeedback(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/members", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, displayName, role }),
        });

        const result = (await response.json()) as { ok?: boolean; message?: string };
        if (!response.ok || !result.ok) {
          throw new Error(result.message ?? "Falha ao conceder acesso administrativo.");
        }

        setEmail("");
        setDisplayName("");
        setRole("viewer");
        setFeedback("Acesso administrativo salvo com sucesso.");
        router.refresh();
      } catch (error) {
        setFeedback(
          error instanceof Error ? error.message : "Falha ao conceder acesso administrativo.",
        );
      } finally {
        setCreating(false);
      }
    });
  }

  function handleMemberSave(memberId: string) {
    if (!canManageMembers) return;

    const draft = drafts[memberId];
    if (!draft) return;

    setSavingId(memberId);
    setFeedback(null);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/members/${memberId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
        });

        const result = (await response.json()) as { ok?: boolean; message?: string };
        if (!response.ok || !result.ok) {
          throw new Error(result.message ?? "Falha ao atualizar o membro.");
        }

        setFeedback("Papel administrativo atualizado.");
        router.refresh();
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Falha ao atualizar o membro.");
      } finally {
        setSavingId(null);
      }
    });
  }

  function handleMemberDelete(memberId: string) {
    if (!canManageMembers) return;

    setSavingId(memberId);
    setFeedback(null);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/members/${memberId}`, { method: "DELETE" });

        const result = (await response.json()) as { ok?: boolean; message?: string };
        if (!response.ok || !result.ok) {
          throw new Error(result.message ?? "Falha ao remover o membro.");
        }

        setFeedback("Acesso administrativo removido.");
        router.refresh();
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Falha ao remover o membro.");
      } finally {
        setSavingId(null);
      }
    });
  }

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="space-y-8">
      {/* Directory Filter Bar & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--text-primary)]">
             <span className="material-symbols-outlined text-[var(--accent)]">group</span>
             User Directory
         </h2>
         <div className="flex items-center gap-3">
             <button 
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                disabled={!canManageMembers}
                className="btn-primary !py-2 !px-4 text-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
             >
                <span className="material-symbols-outlined text-sm">add</span>
                New Member
             </button>
         </div>
      </div>

      {feedback ? (
        <div className="rounded-xl border border-[var(--status-green-border)] bg-[var(--status-green-bg)] px-4 py-3 text-sm text-[var(--status-green)]">
          {feedback}
        </div>
      ) : null}

      {/* User Directory Table */}
      <div className="bg-[var(--bg-surface-container)] rounded-xl border border-[var(--border-neutral)] overflow-x-auto">
         <table className="w-full text-left border-collapse min-w-[700px]">
             <thead>
                 <tr className="bg-black/30 border-b border-[var(--border-neutral)]">
                     <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">User Profile</th>
                     <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">System Role</th>
                     <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">Access Info</th>
                     <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] text-right">Actions</th>
                 </tr>
             </thead>
             <tbody className="divide-y divide-[var(--border-light)]">
                 {members.length ? members.map((member) => {
                     const draft = drafts[member.id] ?? {
                       displayName: member.displayName,
                       role: member.role,
                     };
                     const isSaving = savingId === member.id;
                     const isSelf = member.id === currentUserId;
                     const ownerLock =
                       member.role === "owner" && ownerCount <= 1 && draft.role !== "owner";

                     return (
                         <tr key={member.id} className="hover:bg-[var(--bg-surface-high)] transition-colors group">
                             <td className="px-6 py-4">
                                 <div className="flex items-center gap-3">
                                     <div className="w-10 h-10 shrink-0 rounded-lg bg-[var(--bg-surface-highest)] border border-[var(--border-neutral)] flex items-center justify-center text-[var(--text-secondary)]">
                                         <span className="material-symbols-outlined">person</span>
                                     </div>
                                     <div>
                                         <p className="font-bold text-[var(--text-primary)]">
                                            {isSelf ? <span className="text-[var(--accent)] mr-1">(You)</span> : null}
                                            {member.displayName}
                                         </p>
                                         <p className="text-xs text-[var(--text-tertiary)]">{member.email}</p>
                                         {ownerLock && (
                                            <p className="text-[10px] text-[var(--status-yellow)] mt-0.5">Cannot downgrade last owner</p>
                                         )}
                                     </div>
                                 </div>
                             </td>
                             <td className="px-6 py-4">
                                 <select
                                    value={draft.role}
                                    onChange={(event) =>
                                      updateDraft(member.id, { role: event.target.value as AdminRole })
                                    }
                                    disabled={!canManageMembers || isSaving}
                                    className="bg-[var(--bg-surface-highest)] border border-[var(--border-neutral)] rounded-lg text-xs px-3 py-1.5 text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--accent)] cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 uppercase tracking-widest font-bold"
                                 >
                                    {roleOptions.map((option) => (
                                      <option key={option} value={option}>
                                        {option}
                                      </option>
                                    ))}
                                 </select>
                             </td>
                             <td className="px-6 py-4 text-xs text-[var(--text-secondary)]">
                                 <div><span className="font-bold">Created:</span> {formatDateTime(member.createdAt)}</div>
                                 <div className="mt-0.5"><span className="font-bold">Last seen:</span> {member.lastSignInAt ? formatRelativeTime(member.lastSignInAt) : "Never"}</div>
                             </td>
                             <td className="px-6 py-4 text-right">
                                 <div className="flex items-center justify-end gap-2">
                                     <button
                                         type="button"
                                         disabled={!canManageMembers || isSaving || ownerLock}
                                         onClick={() => handleMemberSave(member.id)}
                                         className="rounded p-1.5 text-[var(--accent)] bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                                         title="Save changes"
                                     >
                                         <span className="material-symbols-outlined text-sm">save</span>
                                     </button>
                                     <button
                                         type="button"
                                         disabled={!canManageMembers || isSaving || isSelf}
                                         onClick={() => handleMemberDelete(member.id)}
                                         className="rounded p-1.5 text-[var(--status-red)] bg-[var(--status-red-bg)] hover:bg-[var(--status-red)]/20 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                                         title="Remove user"
                                     >
                                         <span className="material-symbols-outlined text-sm">delete</span>
                                     </button>
                                 </div>
                             </td>
                         </tr>
                     );
                 }) : (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-[var(--text-tertiary)]">No users found.</td></tr>
                 )}
             </tbody>
         </table>
         <div className="px-6 py-4 bg-black/20 border-t border-[var(--border-neutral)] flex items-center justify-between">
             <p className="text-xs text-[var(--text-tertiary)]">Showing <span className="font-bold text-[var(--text-secondary)]">All</span> users.</p>
         </div>
      </div>

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-[var(--border-neutral)] bg-[#131313] p-6 shadow-2xl relative">
              <button
                 type="button"
                 onClick={() => setIsAddModalOpen(false)}
                 className="absolute right-6 top-6 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              >
                 <span className="material-symbols-outlined">close</span>
              </button>
              
              <h2 className="text-xl font-bold flex items-center gap-2 mb-2 text-[var(--text-primary)]">
                  <span className="material-symbols-outlined text-[var(--accent)]">person_add</span>
                  Grant Access
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                  Account must exist in the Supabase Auth ecosystem.
              </p>

              <form className="space-y-4" onSubmit={handleCreate}>
                 <label className="block space-y-2 text-sm font-medium text-[var(--text-secondary)]">
                   <span>Existing Account Email</span>
                   <input
                     type="email"
                     value={email}
                     onChange={(event) => setEmail(event.target.value)}
                     disabled={!canManageMembers || creating}
                     placeholder="admin@codetrail.app"
                     className={inputCls}
                   />
                 </label>

                 <label className="block space-y-2 text-sm font-medium text-[var(--text-secondary)]">
                   <span>Display Name</span>
                   <input
                     type="text"
                     value={displayName}
                     onChange={(event) => setDisplayName(event.target.value)}
                     disabled={!canManageMembers || creating}
                     placeholder="Optional operator name"
                     className={inputCls}
                   />
                 </label>

                 <label className="block space-y-2 text-sm font-medium text-[var(--text-secondary)]">
                   <span>Assigned Role</span>
                   <select
                     value={role}
                     onChange={(event) => setRole(event.target.value as AdminRole)}
                     disabled={!canManageMembers || creating}
                     className={inputCls}
                   >
                     {roleOptions.map((option) => (
                       <option key={option} value={option}>
                         {option}
                       </option>
                     ))}
                   </select>
                 </label>

                 <div className="flex gap-3 pt-4">
                     <button
                       type="submit"
                       disabled={!canManageMembers || creating}
                       className="btn-primary !py-3 w-full !rounded-full disabled:cursor-not-allowed disabled:opacity-60"
                     >
                       {creating ? "Granting access..." : "Grant access"}
                     </button>
                 </div>
              </form>
          </div>
        </div>
      )}

      {/* Audit Log */}
      <h2 className="text-lg font-bold flex items-center gap-2 mt-8 text-[var(--text-primary)]">
          <span className="material-symbols-outlined text-[var(--text-tertiary)]">history_edu</span>
          Security Audit Log
      </h2>
      <div className="bg-[var(--bg-surface-low)] rounded-xl border border-[var(--border-neutral)] overflow-hidden">
         <table className="w-full text-left text-sm">
             <tbody className="divide-y divide-[var(--border-light)]">
                {audit.length ? audit.map((entry) => (
                    <tr key={entry.id} className="hover:bg-[var(--bg-surface-container)] transition-colors">
                        <td className="px-6 py-4">
                           <div className="flex flex-col gap-1">
                               <p className="font-bold text-[var(--text-primary)]">{entry.summary}</p>
                               <p className="text-xs text-[var(--text-tertiary)]">{entry.actorLabel}</p>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex flex-col items-end gap-1">
                               <span className="inline-flex rounded border border-[var(--border-neutral)] bg-neutral-800 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                                   {entry.action}
                               </span>
                               <span className="text-xs text-[var(--text-secondary)]">{formatDateTime(entry.createdAt)}</span>
                           </div>
                        </td>
                    </tr>
                )) : (
                    <tr>
                        <td colSpan={2} className="px-6 py-8 text-center text-sm text-[var(--text-tertiary)]">
                            No administrative actions recorded.
                        </td>
                    </tr>
                )}
             </tbody>
         </table>
      </div>
    </div>
  );
}
