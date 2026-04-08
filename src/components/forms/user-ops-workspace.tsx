"use client";

import { WatchlistForm } from "@/components/forms/watchlist-form";
import { StatusPill } from "@/components/ui/status-pill";
import type { AdminRole, UserSnapshot } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";
import Link from "next/link";
import { startTransition, useDeferredValue, useEffect, useState } from "react";

function canEditOps(role: AdminRole) {
  return role === "owner" || role === "admin" || role === "operator";
}

function canManageAdmins(role: AdminRole) {
  return role === "owner";
}

type ActionFeedback = { type: "success" | "error"; message: string } | null;

export function UserOpsWorkspace({
  users,
  role,
}: {
  users: UserSnapshot[];
  role: AdminRole;
}) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(users[0]?.id ?? "");
  const deferredQuery = useDeferredValue(query);
  const normalized = deferredQuery.trim().toLowerCase();
  const filteredUsers = normalized
    ? users.filter((user) =>
        [user.name, user.email, user.trackName, user.desiredArea]
          .join(" ")
          .toLowerCase()
          .includes(normalized),
      )
    : users;
  const selectedUser =
    filteredUsers.find((user) => user.id === selectedId) ??
    filteredUsers[0] ??
    users[0];

  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [planCode, setPlanCode] = useState("");
  const [confirmBan, setConfirmBan] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<ActionFeedback>(null);

  useEffect(() => {
    setEditingName(false);
    setNewName("");
    setPlanCode("");
    setConfirmBan(false);
    setConfirmDelete(false);
    setDeleteConfirmText("");
    setActionLoading(null);
    setActionFeedback(null);
  }, [selectedUser?.id]);

  async function callAction(url: string, method: string, body?: unknown) {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const data = (await res.json()) as { ok?: boolean; message?: string };
    if (!res.ok || !data.ok) {
      throw new Error(data.message ?? "Falha na operação.");
    }
    return data;
  }

  function handleEditName() {
    if (!selectedUser || actionLoading) return;
    setActionFeedback(null);
    setActionLoading("editName");
    startTransition(async () => {
      try {
        await callAction(
          `/api/admin/product-users/${selectedUser.id}`,
          "PATCH",
          { fullName: newName.trim() },
        );
        setActionFeedback({
          type: "success",
          message: "Nome atualizado com sucesso.",
        });
        setEditingName(false);
      } catch (e) {
        setActionFeedback({
          type: "error",
          message: e instanceof Error ? e.message : "Falha ao atualizar nome.",
        });
      } finally {
        setActionLoading(null);
      }
    });
  }

  function handleChangePlan() {
    if (!selectedUser || actionLoading) return;
    setActionFeedback(null);
    setActionLoading("subscription");
    startTransition(async () => {
      try {
        await callAction(
          `/api/admin/product-users/${selectedUser.id}/subscription`,
          "PATCH",
          { planCode: planCode.trim() },
        );
        setActionFeedback({
          type: "success",
          message: "Assinatura alterada com sucesso.",
        });
        setPlanCode("");
      } catch (e) {
        setActionFeedback({
          type: "error",
          message:
            e instanceof Error ? e.message : "Falha ao alterar assinatura.",
        });
      } finally {
        setActionLoading(null);
      }
    });
  }

  function handleBan(banned: boolean) {
    if (!selectedUser || actionLoading) return;
    setActionFeedback(null);
    setActionLoading("ban");
    startTransition(async () => {
      try {
        await callAction(
          `/api/admin/product-users/${selectedUser.id}/ban`,
          "POST",
          { banned },
        );
        setActionFeedback({
          type: "success",
          message: banned ? "Usuário desativado." : "Usuário reativado.",
        });
        setConfirmBan(false);
      } catch (e) {
        setActionFeedback({
          type: "error",
          message: e instanceof Error ? e.message : "Falha na operação.",
        });
      } finally {
        setActionLoading(null);
      }
    });
  }

  function handleDelete() {
    if (!selectedUser || actionLoading) return;
    setActionFeedback(null);
    setActionLoading("delete");
    startTransition(async () => {
      try {
        await callAction(
          `/api/admin/product-users/${selectedUser.id}`,
          "DELETE",
        );
        setActionFeedback({
          type: "success",
          message: "Usuário excluído permanentemente.",
        });
        setConfirmDelete(false);
        setDeleteConfirmText("");
      } catch (e) {
        setActionFeedback({
          type: "error",
          message: e instanceof Error ? e.message : "Falha ao excluir usuário.",
        });
      } finally {
        setActionLoading(null);
      }
    });
  }

  if (!users.length) {
    return (
      <div className="rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-low)] p-6 text-sm text-[var(--text-secondary)]">
        Nenhum usuário foi carregado ainda. Conecte a fonte do produto em{" "}
        <code className="mx-1 rounded-md border border-[var(--border-neutral)] bg-[var(--bg-surface-high)] px-1.5 py-0.5 font-mono text-xs text-[var(--accent)]">
          PRODUCT_SUPABASE_URL
        </code>{" "}
        e{" "}
        <code className="mx-1 rounded-md border border-[var(--border-neutral)] bg-[var(--bg-surface-high)] px-1.5 py-0.5 font-mono text-xs text-[var(--accent)]">
          PRODUCT_SUPABASE_SERVICE_ROLE_KEY
        </code>{" "}
        para listar os usuários reais do CodeTrail App.
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
      {/* ── Left: search + list ──────────────────────────────────────────── */}
      <div className="space-y-4">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar usuário, e-mail ou trilha..."
          className="input-dark w-full rounded-xl px-4 py-3 text-sm"
        />

        <p className="text-xs text-[var(--text-quaternary)] tabular-nums">
          {filteredUsers.length} de {users.length} usuário(s)
        </p>

        <div className="scrollbar-thin max-h-[640px] space-y-3 overflow-y-auto pr-2">
          {filteredUsers.length === 0 && normalized && (
            <div className="rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-container)] p-6 text-center text-sm text-[var(--text-tertiary)]">
              Nenhum usuário encontrado para &ldquo;{deferredQuery.trim()}
              &rdquo;
            </div>
          )}
          {filteredUsers.map((user) => {
            const active = user.id === selectedUser?.id;
            return (
              <button
                type="button"
                key={user.id}
                onClick={() => setSelectedId(user.id)}
                className={`w-full rounded-xl border p-4 text-left transition-all duration-200 ${
                  active
                    ? "border-[var(--accent)] bg-[var(--accent-light)] shadow-[var(--shadow-glow-sm)]"
                    : "border-[var(--border-neutral)] bg-[var(--bg-surface-container)] hover:bg-[var(--bg-surface-high)] hover:border-[var(--border-default)]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-[var(--text-primary)]">
                      {user.name}
                    </p>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      {user.email}
                    </p>
                  </div>
                  <StatusPill value={user.riskLevel} />
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--text-tertiary)]">
                  <span>{user.trackName}</span>
                  <span>{user.pendingSync} pendências</span>
                  <span>{user.weeklyHours.toFixed(1)}h</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Right: selected user detail ──────────────────────────────────── */}
      {selectedUser ? (
        <div className="rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-low)] p-5 shadow-[var(--shadow-card)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="label-cyan">usuário selecionado</p>
              <h3 className="mt-2 text-2xl font-black text-[var(--text-primary)]">
                {selectedUser.name}
              </h3>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                {selectedUser.email} · {selectedUser.desiredArea} · visto{" "}
                {formatRelativeTime(selectedUser.lastSeenAt)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusPill value={selectedUser.riskLevel} />
              <StatusPill value={selectedUser.supportStatus} />
              <Link
                href={`/users/${selectedUser.id}`}
                className="btn-secondary text-xs !py-2 !px-4 !rounded-full"
              >
                Abrir detalhe
              </Link>
            </div>
          </div>

          {/* ── Mini metric strip ─────────────────────────────────────────── */}
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { label: "streak", value: `${selectedUser.activeStreak} dias` },
              {
                label: "horas semana",
                value: `${selectedUser.weeklyHours.toFixed(1)}h`,
              },
              { label: "fila sync", value: String(selectedUser.pendingSync) },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-high)] p-4"
              >
                <p className="label-caps">{label}</p>
                <p className="mt-2 text-xl font-bold text-[var(--text-primary)]">
                  {value}
                </p>
              </div>
            ))}
          </div>

          {canEditOps(role) ? (
            <div className="mt-6">
              <WatchlistForm user={selectedUser} />
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-container)] p-4 text-sm text-[var(--text-tertiary)]">
              <span className="material-symbols-outlined mr-1 align-middle text-base">
                lock
              </span>
              Seu papel ({role}) não permite editar a watchlist operacional.
            </div>
          )}

          {/* ── Admin Actions ─────────────────────────────────────────── */}
          {canEditOps(role) && (
            <div className="mt-6 space-y-4">
              <p className="label-cyan">ações administrativas</p>

              {actionFeedback && (
                <div
                  className={`rounded-xl border px-4 py-3 text-sm ${
                    actionFeedback.type === "success"
                      ? "border-green-500/30 bg-green-500/10 text-green-400"
                      : "border-red-500/30 bg-red-500/10 text-red-400"
                  }`}
                >
                  {actionFeedback.message}
                </div>
              )}

              {/* Edit name */}
              <div className="rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-container)] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-[var(--text-secondary)]">
                    Nome do usuário
                  </p>
                  {!editingName && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingName(true);
                        setNewName(selectedUser.name);
                        setActionFeedback(null);
                      }}
                      className="btn-secondary !rounded-full !py-1.5 !px-3 !text-xs"
                    >
                      Editar
                    </button>
                  )}
                </div>
                {editingName && (
                  <div className="mt-3 flex gap-2">
                    <input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="input-dark flex-1 rounded-xl px-4 py-2.5 text-sm"
                      placeholder="Novo nome..."
                    />
                    <button
                      type="button"
                      disabled={
                        actionLoading === "editName" ||
                        newName.trim().length < 2
                      }
                      onClick={handleEditName}
                      className="btn-primary !rounded-full !py-2 !px-4 !text-xs disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {actionLoading === "editName" ? "Salvando..." : "Salvar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingName(false)}
                      className="btn-secondary !rounded-full !py-2 !px-4 !text-xs"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>

              {/* Change subscription */}
              <div className="rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-container)] p-4">
                <p className="text-sm font-medium text-[var(--text-secondary)]">
                  Alterar assinatura
                </p>
                <div className="mt-3 flex gap-2">
                  <input
                    value={planCode}
                    onChange={(e) => setPlanCode(e.target.value)}
                    className="input-dark flex-1 rounded-xl px-4 py-2.5 text-sm"
                    placeholder="Código do plano (ex: pro, starter)"
                  />
                  <button
                    type="button"
                    disabled={
                      actionLoading === "subscription" || !planCode.trim()
                    }
                    onClick={handleChangePlan}
                    className="btn-primary !rounded-full !py-2 !px-4 !text-xs disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {actionLoading === "subscription"
                      ? "Alterando..."
                      : "Alterar plano"}
                  </button>
                </div>
              </div>

              {/* Ban / Unban + Delete — owner only */}
              {canManageAdmins(role) && (
                <div className="space-y-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                  <p className="text-sm font-bold text-red-400">
                    <span className="material-symbols-outlined mr-1 align-middle text-base">
                      warning
                    </span>
                    Zona de perigo — somente owner
                  </p>

                  {/* Ban/Unban */}
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-[var(--text-secondary)]">
                        Desativar / Reativar
                      </p>
                      <p className="text-xs text-[var(--text-quaternary)]">
                        Bloqueia o acesso do usuário ao produto.
                      </p>
                    </div>
                    {!confirmBan ? (
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmBan(true);
                          setActionFeedback(null);
                        }}
                        className="btn-secondary !rounded-full !py-1.5 !px-3 !text-xs border-red-500/30 text-red-400"
                      >
                        Desativar
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={actionLoading === "ban"}
                          onClick={() => handleBan(true)}
                          className="rounded-full bg-red-600 px-4 py-1.5 text-xs font-bold text-white disabled:opacity-50"
                        >
                          {actionLoading === "ban"
                            ? "Processando..."
                            : "Confirmar desativação"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmBan(false)}
                          className="btn-secondary !rounded-full !py-1.5 !px-3 !text-xs"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>

                  <hr className="border-[var(--border-neutral)]" />

                  {/* Delete */}
                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-[var(--text-secondary)]">
                          Excluir usuário
                        </p>
                        <p className="text-xs text-[var(--text-quaternary)]">
                          Remove permanentemente o usuário e todos os seus
                          dados.
                        </p>
                      </div>
                      {!confirmDelete && (
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmDelete(true);
                            setActionFeedback(null);
                          }}
                          className="btn-secondary !rounded-full !py-1.5 !px-3 !text-xs border-red-500/30 text-red-400"
                        >
                          Excluir
                        </button>
                      )}
                    </div>
                    {confirmDelete && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs text-red-400">
                          Digite <strong>{selectedUser.email}</strong> para
                          confirmar:
                        </p>
                        <div className="flex gap-2">
                          <input
                            value={deleteConfirmText}
                            onChange={(e) =>
                              setDeleteConfirmText(e.target.value)
                            }
                            className="input-dark flex-1 rounded-xl px-4 py-2.5 text-sm"
                            placeholder={selectedUser.email}
                          />
                          <button
                            type="button"
                            disabled={
                              actionLoading === "delete" ||
                              deleteConfirmText !== selectedUser.email
                            }
                            onClick={handleDelete}
                            className="rounded-full bg-red-600 px-4 py-1.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {actionLoading === "delete"
                              ? "Excluindo..."
                              : "Excluir permanente"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmDelete(false);
                              setDeleteConfirmText("");
                            }}
                            className="btn-secondary !rounded-full !py-1.5 !px-3 !text-xs"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
