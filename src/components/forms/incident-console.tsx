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
  source: "Operacao manual",
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

/** Shared input/select/textarea CSS */
const fieldCls =
  "w-full rounded-[10px] border border-[var(--border-default)] bg-white px-3.5 py-2.5 text-[13px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-quaternary)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10 disabled:opacity-60 disabled:cursor-not-allowed transition-colors";

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

  return (
    <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
      {/* Left panel — incident list */}
      <section className="rounded-[16px] border border-[var(--border-subtle)] bg-[var(--bg-base)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="label-caps">incidentes</p>
            <h3 className="mt-2 text-[20px] font-semibold text-[var(--text-primary)]">
              Fila operacional viva
            </h3>
          </div>
          <button
            type="button"
            onClick={handleNewIncident}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-white px-4 py-2 text-[13px] font-medium text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] hover:border-[var(--accent)] transition-colors"
          >
            <Plus size={14} />
            Novo incidente
          </button>
        </div>

        <div className="mt-5 space-y-2">
          {incidents.length ? (
            incidents.map((incident) => {
              const active = incident.id === selectedId;
              return (
                <button
                  type="button"
                  key={incident.id}
                  onClick={() => {
                    setSelectedId(incident.id);
                    setFeedback(null);
                  }}
                  className={`w-full rounded-[12px] border p-4 text-left transition-colors ${
                    active
                      ? "border-[var(--accent)] bg-[rgba(108,99,255,0.06)]"
                      : "border-[var(--border-subtle)] bg-[var(--bg-elevated)] hover:border-[var(--border-default)] hover:bg-white"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[13px] font-semibold text-[var(--text-primary)]">{incident.title}</p>
                      <p className="mt-0.5 text-[12px] text-[var(--text-tertiary)]">
                        {incident.source} · {formatRelativeTime(incident.openedAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <StatusPill value={incident.severity} />
                      <StatusPill value={incident.status} />
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-2 text-[12px] text-[var(--text-secondary)]">
                    {incident.summary}
                  </p>
                </button>
              );
            })
          ) : (
            <div className="rounded-[12px] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 text-[13px] text-[var(--text-tertiary)] text-center">
              Nenhum incidente registrado ainda.
            </div>
          )}
        </div>
      </section>

      {/* Right panel — editor */}
      <section className="rounded-[16px] border border-[var(--border-subtle)] bg-[var(--bg-base)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="label-caps">editor</p>
            <h3 className="mt-2 text-[20px] font-semibold text-[var(--text-primary)]">
              {selectedId === "new" ? "Registrar incidente" : "Editar incidente"}
            </h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--text-secondary)]">
              Relacione o incidente com um usuario ou dispositivo quando o alerta exigir contexto.
            </p>
          </div>
          {selectedIncident ? (
            <div className="rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-[12px] text-[var(--text-tertiary)]">
              aberto em {formatDateTime(selectedIncident.openedAt)}
            </div>
          ) : null}
        </div>

        {feedback ? (
          <div className="mt-4 rounded-[10px] border border-[color-mix(in_srgb,var(--accent)_25%,transparent)] bg-[color-mix(in_srgb,var(--accent)_6%,white)] px-4 py-3 text-[13px] text-[var(--accent)]">
            {feedback}
          </div>
        ) : null}

        {!canEdit ? (
          <div className="mt-4 rounded-[10px] border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-700">
            Seu papel atual e <strong>{currentRole}</strong>. Somente owner, admin ou operator podem editar incidentes.
          </div>
        ) : null}

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 xl:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-[12px] font-medium text-[var(--text-secondary)]">Titulo</span>
              <input
                value={draft.title}
                onChange={(event) => patchDraft({ title: event.target.value })}
                disabled={!canEdit || saving || deleting}
                className={fieldCls}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-[12px] font-medium text-[var(--text-secondary)]">Origem</span>
              <input
                value={draft.source}
                onChange={(event) => patchDraft({ source: event.target.value })}
                disabled={!canEdit || saving || deleting}
                className={fieldCls}
              />
            </label>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-[12px] font-medium text-[var(--text-secondary)]">Severidade</span>
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
              <span className="text-[12px] font-medium text-[var(--text-secondary)]">Status</span>
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

          <div className="grid gap-4 xl:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-[12px] font-medium text-[var(--text-secondary)]">Usuario vinculado</span>
              <select
                value={draft.profileId}
                onChange={(event) => patchDraft({ profileId: event.target.value })}
                disabled={!canEdit || saving || deleting}
                className={fieldCls}
              >
                <option value="">Sem usuario vinculado</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} · {user.email}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1.5">
              <span className="text-[12px] font-medium text-[var(--text-secondary)]">Dispositivo vinculado</span>
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
                    {instance.label} · {platformLabel(instance.platform)} · {instance.version}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-[12px] font-medium text-[var(--text-secondary)]">Plataforma</span>
              <input
                value={draft.platform}
                onChange={(event) => patchDraft({ platform: event.target.value })}
                disabled={!canEdit || saving || deleting}
                placeholder="android, windows, web ou api"
                className={fieldCls}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-[12px] font-medium text-[var(--text-secondary)]">Versao</span>
              <input
                value={draft.version}
                onChange={(event) => patchDraft({ version: event.target.value })}
                disabled={!canEdit || saving || deleting}
                placeholder="1.1.3+6"
                className={fieldCls}
              />
            </label>
          </div>

          <label className="block space-y-1.5">
            <span className="text-[12px] font-medium text-[var(--text-secondary)]">Resumo</span>
            <textarea
              rows={5}
              value={draft.summary}
              onChange={(event) => patchDraft({ summary: event.target.value })}
              disabled={!canEdit || saving || deleting}
              className={fieldCls + " resize-none"}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-[12px] font-medium text-[var(--text-secondary)]">Proxima acao sugerida</span>
            <textarea
              rows={4}
              value={draft.suggestedAction}
              onChange={(event) => patchDraft({ suggestedAction: event.target.value })}
              disabled={!canEdit || saving || deleting}
              className={fieldCls + " resize-none"}
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={!canEdit || saving || deleting}
              className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-5 py-2.5 text-[13px] font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 transition-opacity"
            >
              {saving ? "Salvando..." : selectedId === "new" ? "Criar incidente" : "Salvar incidente"}
            </button>

            {selectedId !== "new" ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={!canEdit || saving || deleting}
                className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2.5 text-[13px] font-semibold text-red-500 hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
              >
                <Trash2 size={14} />
                {deleting ? "Removendo..." : "Remover"}
              </button>
            ) : null}
          </div>
        </form>
      </section>
    </div>
  );
}
