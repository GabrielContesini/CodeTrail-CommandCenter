"use client";

import { startTransition, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminAuditEntry, AdminMemberSnapshot, AdminRole } from "@/lib/types";
import { formatDateTime, formatRelativeTime } from "@/lib/utils";

const roleOptions: AdminRole[] = ["owner", "admin", "operator", "viewer"];

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
    if (!canManageMembers) {
      return;
    }

    setCreating(true);
    setFeedback(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/members", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            displayName,
            role,
          }),
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
          error instanceof Error
            ? error.message
            : "Falha ao conceder acesso administrativo.",
        );
      } finally {
        setCreating(false);
      }
    });
  }

  function handleMemberSave(memberId: string) {
    if (!canManageMembers) {
      return;
    }

    const draft = drafts[memberId];
    if (!draft) {
      return;
    }

    setSavingId(memberId);
    setFeedback(null);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/members/${memberId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(draft),
        });

        const result = (await response.json()) as { ok?: boolean; message?: string };
        if (!response.ok || !result.ok) {
          throw new Error(result.message ?? "Falha ao atualizar o membro.");
        }

        setFeedback("Papel administrativo atualizado.");
        router.refresh();
      } catch (error) {
        setFeedback(
          error instanceof Error ? error.message : "Falha ao atualizar o membro.",
        );
      } finally {
        setSavingId(null);
      }
    });
  }

  function handleMemberDelete(memberId: string) {
    if (!canManageMembers) {
      return;
    }

    setSavingId(memberId);
    setFeedback(null);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/members/${memberId}`, {
          method: "DELETE",
        });

        const result = (await response.json()) as { ok?: boolean; message?: string };
        if (!response.ok || !result.ok) {
          throw new Error(result.message ?? "Falha ao remover o membro.");
        }

        setFeedback("Acesso administrativo removido.");
        router.refresh();
      } catch (error) {
        setFeedback(
          error instanceof Error ? error.message : "Falha ao remover o membro.",
        );
      } finally {
        setSavingId(null);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[28px] border border-white/8 bg-black/10 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent-secondary)]">
                Membros administrativos
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-white">
                Controle de acesso do painel
              </h3>
              <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
                Owners gerenciam o time administrativo, definem papeis e evitam
                que o painel vire uma area sem dono.
              </p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-[var(--text-secondary)]">
              {ownerCount} owner(s) · {members.length} membro(s)
            </div>
          </div>

          {feedback ? (
            <div className="mt-5 rounded-2xl border border-[rgba(0,95,115,0.28)] bg-[rgba(0,95,115,0.1)] px-4 py-3 text-sm text-[#d7eff4]">
              {feedback}
            </div>
          ) : null}

          <div className="mt-5 space-y-4">
            {members.map((member) => {
              const draft = drafts[member.id] ?? {
                displayName: member.displayName,
                role: member.role,
              };
              const isSaving = savingId === member.id;
              const isSelf = member.id === currentUserId;
              const ownerLock =
                member.role === "owner" && ownerCount <= 1 && draft.role !== "owner";

              return (
                <article
                  key={member.id}
                  className="rounded-[24px] border border-white/8 bg-white/4 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {member.displayName}
                      </p>
                      <p className="mt-1 text-xs text-[var(--text-secondary)]">
                        {member.email}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-[var(--text-secondary)]">
                        <span>criado em {formatDateTime(member.createdAt)}</span>
                        <span>
                          ultimo acesso{" "}
                          {member.lastSignInAt
                            ? formatRelativeTime(member.lastSignInAt)
                            : "sem login ainda"}
                        </span>
                        {isSelf ? <span>esta conta e a sua</span> : null}
                      </div>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[var(--accent-secondary)]">
                      {member.role}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-[1fr_220px_auto]">
                    <input
                      value={draft.displayName}
                      onChange={(event) =>
                        updateDraft(member.id, { displayName: event.target.value })
                      }
                      disabled={!canManageMembers || isSaving}
                      className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[var(--accent)] disabled:opacity-60"
                    />
                    <select
                      value={draft.role}
                      onChange={(event) =>
                        updateDraft(member.id, {
                          role: event.target.value as AdminRole,
                        })
                      }
                      disabled={!canManageMembers || isSaving}
                      className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[var(--accent)] disabled:opacity-60"
                    >
                      {roleOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={!canManageMembers || isSaving || ownerLock}
                        onClick={() => handleMemberSave(member.id)}
                        className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#005F73,#2EC5FF)] px-4 py-3 text-sm font-semibold text-[#04080B] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSaving ? "Salvando..." : "Salvar"}
                      </button>
                      <button
                        type="button"
                        disabled={!canManageMembers || isSaving || isSelf}
                        onClick={() => handleMemberDelete(member.id)}
                        className="inline-flex items-center justify-center rounded-full border border-[rgba(255,126,139,0.28)] px-4 py-3 text-sm font-semibold text-[#ffd5da] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Remover
                      </button>
                    </div>
                  </div>

                  {ownerLock ? (
                    <p className="mt-3 text-xs text-[#ffe7a6]">
                      Este owner so pode ser alterado quando existir pelo menos mais um owner ativo.
                    </p>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>

        <section className="rounded-[28px] border border-white/8 bg-black/10 p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent-secondary)]">
            Conceder acesso
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-white">
            Novo operador
          </h3>
          <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
            A conta precisa existir primeiro no Supabase Auth do ecossistema CodeTrail.
          </p>

          {!canManageMembers ? (
            <div className="mt-5 rounded-2xl border border-[rgba(255,209,102,0.24)] bg-[rgba(255,209,102,0.08)] px-4 py-3 text-sm text-[#ffe7a6]">
              Seu papel atual e <strong>{currentRole}</strong>. Somente um owner pode
              conceder ou remover acesso administrativo.
            </div>
          ) : null}

          <form className="mt-5 space-y-4" onSubmit={handleCreate}>
            <label className="block space-y-2 text-sm text-[var(--text-secondary)]">
              <span>E-mail da conta existente</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={!canManageMembers || creating}
                placeholder="admin@codetrail.app"
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[var(--accent)] disabled:opacity-60"
              />
            </label>

            <label className="block space-y-2 text-sm text-[var(--text-secondary)]">
              <span>Nome de exibicao</span>
              <input
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                disabled={!canManageMembers || creating}
                placeholder="Nome opcional para o operador"
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[var(--accent)] disabled:opacity-60"
              />
            </label>

            <label className="block space-y-2 text-sm text-[var(--text-secondary)]">
              <span>Papel</span>
              <select
                value={role}
                onChange={(event) => setRole(event.target.value as AdminRole)}
                disabled={!canManageMembers || creating}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[var(--accent)] disabled:opacity-60"
              >
                {roleOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="submit"
              disabled={!canManageMembers || creating}
              className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#005F73,#2EC5FF)] px-5 py-3 text-sm font-semibold text-[#04080B] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? "Concedendo acesso..." : "Conceder acesso"}
            </button>
          </form>
        </section>
      </div>

      <section className="rounded-[28px] border border-white/8 bg-black/10 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent-secondary)]">
              Auditoria
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-white">
              Ultimas acoes administrativas
            </h3>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {audit.length ? (
            audit.map((entry) => (
              <article
                key={entry.id}
                className="rounded-[24px] border border-white/8 bg-white/4 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {entry.summary}
                    </p>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      {entry.actorLabel} · {formatDateTime(entry.createdAt)}
                    </p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                    {entry.action}
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[24px] border border-white/8 bg-white/4 p-4 text-sm text-[var(--text-secondary)]">
              Nenhuma acao administrativa registrada ainda.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
