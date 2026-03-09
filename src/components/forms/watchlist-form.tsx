"use client";

import { startTransition, useEffect, useState } from "react";
import type { UserSnapshot } from "@/lib/types";

const riskOptions = ["healthy", "attention", "critical"] as const;
const supportOptions = [
  "stable",
  "monitoring",
  "needs_follow_up",
  "escalated",
] as const;

export function WatchlistForm({ user }: { user: UserSnapshot }) {
  const [riskLevel, setRiskLevel] = useState<UserSnapshot["riskLevel"]>(
    user.riskLevel,
  );
  const [supportStatus, setSupportStatus] = useState<UserSnapshot["supportStatus"]>(
    user.supportStatus,
  );
  const [internalNote, setInternalNote] = useState(user.internalNote);
  const [nextActionAt, setNextActionAt] = useState(
    user.nextActionAt ? user.nextActionAt.slice(0, 16) : "",
  );
  const [feedback, setFeedback] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setRiskLevel(user.riskLevel);
    setSupportStatus(user.supportStatus);
    setInternalNote(user.internalNote);
    setNextActionAt(user.nextActionAt ? user.nextActionAt.slice(0, 16) : "");
    setFeedback(null);
  }, [user]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setSaving(true);

    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/user-watchlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            profileId: user.id,
            riskLevel,
            supportStatus,
            internalNote,
            nextActionAt: nextActionAt ? new Date(nextActionAt).toISOString() : null,
          }),
        });

        const result = (await response.json()) as { ok?: boolean; message?: string };
        if (!response.ok || !result.ok) {
          throw new Error(result.message ?? "Falha ao salvar a watchlist.");
        }

        setFeedback("Watchlist salva com sucesso.");
      } catch (error) {
        setFeedback(
          error instanceof Error ? error.message : "Falha ao salvar a watchlist.",
        );
      } finally {
        setSaving(false);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm text-[var(--text-secondary)]">
          <span>Risco operacional</span>
          <select
            value={riskLevel}
            onChange={(event) =>
              setRiskLevel(event.target.value as UserSnapshot["riskLevel"])
            }
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[var(--accent)]"
          >
            {riskOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm text-[var(--text-secondary)]">
          <span>Status de suporte</span>
          <select
            value={supportStatus}
            onChange={(event) =>
              setSupportStatus(event.target.value as UserSnapshot["supportStatus"])
            }
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[var(--accent)]"
          >
            {supportOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block space-y-2 text-sm text-[var(--text-secondary)]">
        <span>Proxima acao</span>
        <input
          type="datetime-local"
          value={nextActionAt}
          onChange={(event) => setNextActionAt(event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[var(--accent)]"
        />
      </label>

      <label className="block space-y-2 text-sm text-[var(--text-secondary)]">
        <span>Nota interna</span>
        <textarea
          rows={5}
          value={internalNote}
          onChange={(event) => setInternalNote(event.target.value)}
          className="w-full rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[var(--accent)]"
        />
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--text-secondary)]">
          {feedback ?? "Essas notas ajudam a operacao a acompanhar usuarios em risco."}
        </p>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#005F73,#2EC5FF)] px-5 py-3 text-sm font-semibold text-[#04080B] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? "Salvando..." : "Salvar watchlist"}
        </button>
      </div>
    </form>
  );
}
