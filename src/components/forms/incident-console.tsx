"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { StatusPill } from "@/components/ui/status-pill";
import type {
  AdminRole,
  FleetNode,
  IncidentSeverity,
  IncidentSnapshot,
  IncidentStatus,
  UserSnapshot,
} from "@/lib/types";
import { formatDateTime, formatRelativeTime, platformLabel } from "@/lib/utils";

const severityOptions: IncidentSeverity[] = ["info", "warning", "critical"];
const statusOptions: IncidentStatus[] = [
  "open",
  "investigating",
  "mitigated",
  "resolved",
];

type Draft = {
  title: string;
  severity: IncidentSeverity;
  source: string;
  status: IncidentStatus;
  summary: string;
  suggestedAction: string;
  profileId: string;
  instanceId: string;
  platform: string;
  version: string;
};

const emptyDraft: Draft = {
  title: "",
  severity: "warning",
  source: "Operação manual",
  status: "open",
  summary: "",
  suggestedAction: "",
  profileId: "",
  instanceId: "",
  platform: "",
  version: "",
};

function toDraft(incident?: IncidentSnapshot | null): Draft {
  if (!incident) {
    return emptyDraft;
  }

  return {
    title: incident.title,
    severity: incident.severity,
    source: incident.source,
    status: incident.status,
    summary: incident.summary,
    suggestedAction: incident.action,
    profileId: incident.context?.profileId ?? "",
    instanceId: incident.context?.instanceId ?? "",
    platform: incident.context?.platform ?? "",
    version: incident.context?.version ?? "",
  };
}

/** Shared input/select/textarea CSS — dark theme */
const fieldCls =
  "input-dark w-full rounded-xl px-4 py-3 text-sm disabled:opacity-60 disabled:cursor-not-allowed";

export function IncidentConsole({
  incidents,
  users,
  instances,
  currentRole,
}: {
  incidents: IncidentSnapshot[];
  users: Pick<UserSnapshot, "id" | "name" | "email">[];
  instances: Pick<FleetNode, "id" | "label" | "platform" | "version">[];
  currentRole: AdminRole;
}) {
  const router = useRouter();
  const canEdit = currentRole === "owner" || currentRole === "admin" || currentRole === "operator";
  const [selectedId, setSelectedId] = useState<string>(incidents[0]?.id ?? "new");
  const [draft, setDraft] = useState<Draft>(() => toDraft(incidents[0] ?? null));
  const [feedback, setFeedback] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const selectedIncident = useMemo(
    () => incidents.find((incident) => incident.id === selectedId) ?? null,
    [incidents, selectedId],
  );

  useEffect(() => {
    if (selectedId === "new") {
      setDraft(emptyDraft);
      return;
    }

    setDraft(toDraft(selectedIncident));
  }, [selectedId, selectedIncident]);

  const instanceMap = useMemo(
    () => new Map(instances.map((instance) => [instance.id, instance])),
    [instances],
  );

  function patchDraft(patch: Partial<Draft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function handleNewIncident() {
    setSelectedId("new");
    setFeedback(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canEdit) {
      return;
    }

    setSaving(true);
    setFeedback(null);

    startTransition(async () => {
      try {
        const response = await fetch(
          selectedId === "new" ? "/api/admin/incidents" : `/api/admin/incidents/${selectedId}`,
          {
            method: selectedId === "new" ? "POST" : "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: draft.title,
              severity: draft.severity,
              source: draft.source,
              status: draft.status,
              summary: draft.summary,
              suggestedAction: draft.suggestedAction,
              profileId: draft.profileId || null,
              instanceId: draft.instanceId || null,
              platform: draft.platform || null,
              version: draft.version || null,
            }),
          },
        );

        const result = (await response.json()) as { ok?: boolean; message?: string };
        if (!response.ok || !result.ok) {
          throw new Error(result.message ?? "Falha ao salvar o incidente.");
        }

        setFeedback(
          selectedId === "new"
            ? "Incidente criado com sucesso."
            : "Incidente atualizado com sucesso.",
        );
        router.refresh();
      } catch (error) {
        setFeedback(
          error instanceof Error ? error.message : "Falha ao salvar o incidente.",
        );
      } finally {
        setSaving(false);
      }
    });
  }

  function handleDelete() {
    if (!canEdit || selectedId === "new") {
      return;
    }

    setDeleting(true);
    setFeedback(null);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/incidents/${selectedId}`, {
          method: "DELETE",
        });

        const result = (await response.json()) as { ok?: boolean; message?: string };
        if (!response.ok || !result.ok) {
          throw new Error(result.message ?? "Falha ao remover o incidente.");
        }

        setSelectedId("new");
        setDraft(emptyDraft);
        setFeedback("Incidente removido com sucesso.");
        router.refresh();
      } catch (error) {
        setFeedback(
          error instanceof Error ? error.message : "Falha ao remover o incidente.",
        );
      } finally {
        setDeleting(false);
      }
    });
  }

  const [isModalOpen, setIsModalOpen] = useState(false);

  function openModalForIncident(id: string) {
    setSelectedId(id);
    setFeedback(null);
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
  }

  const getBorderColor = (severity: IncidentSeverity, status: IncidentStatus) => {
    if (status === "resolved") return "border-neutral-700";
    if (severity === "critical") return "border-[var(--status-red)]";
    if (severity === "warning") return "border-[var(--status-yellow)]";
    return "border-[var(--accent)]";
  };

  const getStatusBadge = (severity: IncidentSeverity, status: IncidentStatus) => {
    if (status === "resolved") {
      return (
        <span className="rounded border border-neutral-700 bg-neutral-800 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-neutral-400">
          Resolved
        </span>
      );
    }
    if (status === "investigating") {
      return (
        <span className="rounded border border-[var(--status-yellow)]/20 bg-[var(--status-yellow-bg)] px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-[var(--status-yellow)]">
          Investigating
        </span>
      );
    }
    if (severity === "critical") {
      return (
        <span className="rounded border border-[var(--status-red)]/20 bg-[var(--status-red-bg)] px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-[var(--status-red)]">
          Critical
        </span>
      );
    }
    return (
      <span className="rounded border border-[var(--accent)]/20 bg-[var(--accent-light)] px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-[var(--accent)]">
        {status}
      </span>
    );
  };

  return (
    <>
      <div className="flex items-center justify-between xl:mr-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-[var(--text-primary)]">
          <span className="material-symbols-outlined text-[var(--accent)]">history</span>
          Recent Activity
        </h2>
        <div className="flex gap-2">
           <button
             type="button"
             onClick={() => openModalForIncident("new")}
             className="flex items-center gap-2 rounded bg-[var(--accent)]/10 px-3 py-1 text-xs font-bold text-[var(--accent)] transition-colors hover:bg-[var(--accent)]/20"
           >
             <Plus size={14} /> NEW
           </button>
        </div>
      </div>

      <div className="space-y-4">
        {incidents.length ? (
          incidents.map((incident) => {
            const isResolved = incident.status === "resolved";
            const borderColor = getBorderColor(incident.severity, incident.status);

            return (
              <div
                key={incident.id}
                className={`group flex flex-col justify-between rounded-r-xl border-l-4 ${borderColor} bg-[var(--bg-surface-low)] p-5 shadow-[var(--shadow-glow-xs)] transition-all duration-300 hover:bg-[var(--bg-surface-container)] ${
                  isResolved ? "opacity-80" : ""
                }`}
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      {getStatusBadge(incident.severity, incident.status)}
                      <span className="text-xs font-medium text-[var(--text-tertiary)]">
                        {incident.source} • {formatRelativeTime(incident.openedAt)}
                      </span>
                    </div>
                    <h3
                      className={`text-lg font-bold transition-colors group-hover:text-[var(--accent)] ${
                        isResolved ? "text-neutral-400" : "text-[var(--text-primary)]"
                      }`}
                    >
                      {incident.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => openModalForIncident(incident.id)}
                    className="text-neutral-600 hover:text-[var(--text-primary)]"
                  >
                    <span className="material-symbols-outlined">
                      {isResolved ? "history_edu" : "more_vert"}
                    </span>
                  </button>
                </div>

                <div className="mb-4 flex items-center gap-4 text-sm">
                  {incident.context?.platform && (
                     <div className="flex items-center gap-1.5 text-[var(--text-tertiary)] hover:text-cyan-400">
                       <span className="material-symbols-outlined text-xs">dns</span>
                       <span>
                         {platformLabel(incident.context.platform)} {incident.context.version}
                       </span>
                     </div>
                  )}
                  {incident.context?.profileId && (
                     <div className="flex items-center gap-1.5 text-[var(--text-tertiary)] hover:text-cyan-400">
                       <span className="material-symbols-outlined text-xs">person</span>
                       <span>User impacted</span>
                     </div>
                  )}
                </div>

                <p
                  className={`line-clamp-2 text-sm leading-relaxed ${
                    isResolved ? "italic text-neutral-500" : "text-[var(--text-secondary)]"
                  }`}
                >
                  {incident.summary}
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-[var(--border-neutral)] pt-4">
                  {isResolved ? (
                    <span className="text-[10px] font-bold uppercase text-neutral-600">
                      Post-mortem drafted
                    </span>
                  ) : (
                    <div className="flex -space-x-2">
                       {/* Mocking users reacting to it as per design */}
                       <div className="h-6 w-6 rounded-full border-2 border-[var(--bg-surface-container)] flex items-center justify-center bg-neutral-800 text-[8px] font-bold text-neutral-400 text-center">
                         SRE
                       </div>
                    </div>
                  )}

                  <button
                    onClick={() => openModalForIncident(incident.id)}
                    className={`flex items-center gap-1 text-xs font-bold uppercase tracking-wider transition-all hover:gap-2 hover:text-[var(--text-primary)] ${
                      isResolved ? "text-neutral-500" : "text-[var(--accent)]"
                    }`}
                  >
                    {isResolved ? "Review RCA" : "View Details"}{" "}
                    <span className="material-symbols-outlined text-sm">
                       {isResolved ? "description" : "arrow_forward"}
                    </span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-container)] p-4 text-center text-sm text-[var(--text-tertiary)]">
            Nenhum incidente registrado ainda.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-[var(--border-neutral)] bg-[#131313] p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-start justify-between gap-3 border-b border-[var(--border-neutral)] pb-4">
              <div>
                <p className="label-cyan">editor</p>
                <h3 className="mt-1 text-xl font-bold text-[var(--text-primary)]">
                  {selectedId === "new" ? "Registrar incidente" : "Editar incidente"}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {feedback ? (
              <div className="mb-4 rounded-lg border border-[var(--status-green-border)] bg-[var(--status-green-bg)] px-4 py-3 text-sm text-[var(--status-green)]">
                {feedback}
              </div>
            ) : null}

            {!canEdit ? (
              <div className="mb-4 rounded-lg border border-[var(--status-yellow-border)] bg-[var(--status-yellow-bg)] px-4 py-3 text-sm text-[var(--status-yellow)]">
                Seu papel atual é <strong>{currentRole}</strong>. Somente owner, admin ou
                operator podem editar incidentes.
              </div>
            ) : null}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-[var(--text-secondary)]">
                    Título
                  </span>
                  <input
                    value={draft.title}
                    onChange={(event) => patchDraft({ title: event.target.value })}
                    disabled={!canEdit || saving || deleting}
                    className={fieldCls}
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-[var(--text-secondary)]">
                    Origem
                  </span>
                  <input
                    value={draft.source}
                    onChange={(event) => patchDraft({ source: event.target.value })}
                    disabled={!canEdit || saving || deleting}
                    className={fieldCls}
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-[var(--text-secondary)]">
                    Severidade
                  </span>
                  <select
                    value={draft.severity}
                    onChange={(event) =>
                      patchDraft({ severity: event.target.value as IncidentSeverity })
                    }
                    disabled={!canEdit || saving || deleting}
                    className={fieldCls}
                  >
                    {severityOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-[var(--text-secondary)]">
                    Status
                  </span>
                  <select
                    value={draft.status}
                    onChange={(event) =>
                      patchDraft({ status: event.target.value as IncidentStatus })
                    }
                    disabled={!canEdit || saving || deleting}
                    className={fieldCls}
                  >
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-[var(--text-secondary)]">
                    Usuário vinculado
                  </span>
                  <select
                    value={draft.profileId}
                    onChange={(event) => patchDraft({ profileId: event.target.value })}
                    disabled={!canEdit || saving || deleting}
                    className={fieldCls}
                  >
                    <option value="">Sem usuário vinculado</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} · {user.email}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-[var(--text-secondary)]">
                    Dispositivo vinculado
                  </span>
                  <select
                    value={draft.instanceId}
                    onChange={(event) => {
                      const nextId = event.target.value;
                      const instance = nextId ? instanceMap.get(nextId) : null;
                      patchDraft({
                        instanceId: nextId,
                        platform: instance?.platform ?? draft.platform,
                        version: instance?.version ?? draft.version,
                      });
                    }}
                    disabled={!canEdit || saving || deleting}
                    className={fieldCls}
                  >
                    <option value="">Sem dispositivo vinculado</option>
                    {instances.map((instance) => (
                      <option key={instance.id} value={instance.id}>
                        {instance.label} · {platformLabel(instance.platform)} ·{" "}
                        {instance.version}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-[var(--text-secondary)]">
                  Resumo
                </span>
                <textarea
                  rows={4}
                  value={draft.summary}
                  onChange={(event) => patchDraft({ summary: event.target.value })}
                  disabled={!canEdit || saving || deleting}
                  className={fieldCls + " resize-none"}
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-[var(--text-secondary)]">
                  Ação sugerida
                </span>
                <textarea
                  rows={2}
                  value={draft.suggestedAction}
                  onChange={(event) => patchDraft({ suggestedAction: event.target.value })}
                  disabled={!canEdit || saving || deleting}
                  className={fieldCls + " resize-none"}
                />
              </label>

              <div className="flex flex-wrap items-center justify-between pt-4">
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={!canEdit || saving || deleting}
                    className="btn-primary !rounded-full disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving
                      ? "Salvando..."
                      : selectedId === "new"
                      ? "Criar incidente"
                      : "Salvar incidente"}
                  </button>

                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="inline-flex items-center rounded-full border border-[var(--border-default)] px-4 py-2.5 text-sm font-bold text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-surface-high)]"
                  >
                    Cancelar
                  </button>
                </div>

                {selectedId !== "new" && canEdit ? (
                  <button
                    type="button"
                    onClick={() => {
                       handleDelete();
                    }}
                    disabled={saving || deleting}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--status-red-border)] px-4 py-2.5 text-sm font-bold text-[var(--status-red)] transition-colors hover:bg-[var(--status-red-bg)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Trash2 size={14} />
                    {deleting ? "Removendo..." : "Remover"}
                  </button>
                ) : null}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
