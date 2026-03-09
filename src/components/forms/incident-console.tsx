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
      <section className="rounded-[28px] border border-white/8 bg-black/10 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent-secondary)]">
              incidentes
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-white">
              Fila operacional viva
            </h3>
          </div>
          <button
            type="button"
            onClick={handleNewIncident}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
          >
            <Plus size={16} />
            Novo incidente
          </button>
        </div>

        <div className="mt-5 space-y-3">
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
                  className={`w-full rounded-[24px] border p-4 text-left ${
                    active
                      ? "border-[var(--accent)] bg-[rgba(0,95,115,0.24)]"
                      : "border-white/8 bg-white/4 hover:bg-white/6"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{incident.title}</p>
                      <p className="mt-1 text-xs text-[var(--text-secondary)]">
                        {incident.source} · {formatRelativeTime(incident.openedAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusPill value={incident.severity} />
                      <StatusPill value={incident.status} />
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm text-[var(--text-secondary)]">
                    {incident.summary}
                  </p>
                </button>
              );
            })
          ) : (
            <div className="rounded-[24px] border border-white/8 bg-white/4 p-4 text-sm text-[var(--text-secondary)]">
              Nenhum incidente registrado ainda.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/8 bg-black/10 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent-secondary)]">
              editor
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-white">
              {selectedId === "new" ? "Registrar incidente" : "Editar incidente"}
            </h3>
            <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
              Relacione o incidente com um usuario ou dispositivo quando o alerta exigir contexto.
            </p>
          </div>
          {selectedIncident ? (
            <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-xs text-[var(--text-secondary)]">
              aberto em {formatDateTime(selectedIncident.openedAt)}
            </div>
          ) : null}
        </div>

        {feedback ? (
          <div className="mt-5 rounded-2xl border border-[rgba(0,95,115,0.28)] bg-[rgba(0,95,115,0.1)] px-4 py-3 text-sm text-[#d7eff4]">
            {feedback}
          </div>
        ) : null}

        {!canEdit ? (
          <div className="mt-5 rounded-2xl border border-[rgba(255,209,102,0.24)] bg-[rgba(255,209,102,0.08)] px-4 py-3 text-sm text-[#ffe7a6]">
            Seu papel atual e <strong>{currentRole}</strong>. Somente owner, admin ou operator podem editar incidentes.
          </div>
        ) : null}

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 xl:grid-cols-2">
            <label className="space-y-2 text-sm text-[var(--text-secondary)]">
              <span>Titulo</span>
              <input
                value={draft.title}
                onChange={(event) => patchDraft({ title: event.target.value })}
                disabled={!canEdit || saving || deleting}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[var(--accent)] disabled:opacity-60"
              />
            </label>
            <label className="space-y-2 text-sm text-[var(--text-secondary)]">
              <span>Origem</span>
              <input
                value={draft.source}
                onChange={(event) => patchDraft({ source: event.target.value })}
                disabled={!canEdit || saving || deleting}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[var(--accent)] disabled:opacity-60"
              />
            </label>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <label className="space-y-2 text-sm text-[var(--text-secondary)]">
              <span>Severidade</span>
              <select
                value={draft.severity}
                onChange={(event) =>
                  patchDraft({ severity: event.target.value as IncidentSeverity })
                }
                disabled={!canEdit || saving || deleting}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[var(--accent)] disabled:opacity-60"
              >
                {severityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm text-[var(--text-secondary)]">
              <span>Status</span>
              <select
                value={draft.status}
                onChange={(event) =>
                  patchDraft({ status: event.target.value as IncidentStatus })
                }
                disabled={!canEdit || saving || deleting}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[var(--accent)] disabled:opacity-60"
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
            <label className="space-y-2 text-sm text-[var(--text-secondary)]">
              <span>Usuario vinculado</span>
              <select
                value={draft.profileId}
                onChange={(event) => patchDraft({ profileId: event.target.value })}
                disabled={!canEdit || saving || deleting}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[var(--accent)] disabled:opacity-60"
              >
                <option value="">Sem usuario vinculado</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} · {user.email}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm text-[var(--text-secondary)]">
              <span>Dispositivo vinculado</span>
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
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[var(--accent)] disabled:opacity-60"
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
            <label className="space-y-2 text-sm text-[var(--text-secondary)]">
              <span>Plataforma</span>
              <input
                value={draft.platform}
                onChange={(event) => patchDraft({ platform: event.target.value })}
                disabled={!canEdit || saving || deleting}
                placeholder="android, windows, web ou api"
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[var(--accent)] disabled:opacity-60"
              />
            </label>
            <label className="space-y-2 text-sm text-[var(--text-secondary)]">
              <span>Versao</span>
              <input
                value={draft.version}
                onChange={(event) => patchDraft({ version: event.target.value })}
                disabled={!canEdit || saving || deleting}
                placeholder="1.1.3+6"
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[var(--accent)] disabled:opacity-60"
              />
            </label>
          </div>

          <label className="block space-y-2 text-sm text-[var(--text-secondary)]">
            <span>Resumo</span>
            <textarea
              rows={5}
              value={draft.summary}
              onChange={(event) => patchDraft({ summary: event.target.value })}
              disabled={!canEdit || saving || deleting}
              className="w-full rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[var(--accent)] disabled:opacity-60"
            />
          </label>

          <label className="block space-y-2 text-sm text-[var(--text-secondary)]">
            <span>Proxima acao sugerida</span>
            <textarea
              rows={4}
              value={draft.suggestedAction}
              onChange={(event) => patchDraft({ suggestedAction: event.target.value })}
              disabled={!canEdit || saving || deleting}
              className="w-full rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[var(--accent)] disabled:opacity-60"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={!canEdit || saving || deleting}
              className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#005F73,#2EC5FF)] px-5 py-3 text-sm font-semibold text-[#04080B] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Salvando..." : selectedId === "new" ? "Criar incidente" : "Salvar incidente"}
            </button>

            {selectedId !== "new" ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={!canEdit || saving || deleting}
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,126,139,0.28)] px-4 py-3 text-sm font-semibold text-[#ffd5da] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 size={16} />
                {deleting ? "Removendo..." : "Remover"}
              </button>
            ) : null}
          </div>
        </form>
      </section>
    </div>
  );
}
