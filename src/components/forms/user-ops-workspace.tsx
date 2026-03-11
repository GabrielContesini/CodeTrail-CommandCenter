"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { WatchlistForm } from "@/components/forms/watchlist-form";
import { StatusPill } from "@/components/ui/status-pill";
import type { UserSnapshot } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";

export function UserOpsWorkspace({ users }: { users: UserSnapshot[] }) {
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
    filteredUsers.find((user) => user.id === selectedId) ?? filteredUsers[0] ?? users[0];

  if (!users.length) {
    return (
      <div
        className="rounded-[28px] border border-[var(--border-subtle)] bg-[var(--bg-base)] p-6 text-sm text-[var(--text-secondary)]"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        Nenhum usuario foi carregado ainda. Conecte a fonte do produto em{" "}
        <code className="mx-1 rounded-md border border-[var(--border-default)] bg-[var(--bg-inset)] px-1.5 py-0.5 font-mono text-xs text-[var(--text-primary)]">
          PRODUCT_SUPABASE_URL
        </code>{" "}
        e{" "}
        <code className="mx-1 rounded-md border border-[var(--border-default)] bg-[var(--bg-inset)] px-1.5 py-0.5 font-mono text-xs text-[var(--text-primary)]">
          PRODUCT_SUPABASE_SERVICE_ROLE_KEY
        </code>{" "}
        para listar os usuarios reais do CodeTrail App.
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
          placeholder="Buscar usuario, e-mail ou trilha..."
          className="w-full rounded-3xl border border-[var(--border-default)] bg-[var(--bg-inset)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-placeholder)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-glow)]"
        />

        <div className="scrollbar-thin max-h-[640px] space-y-3 overflow-y-auto pr-2">
          {filteredUsers.map((user) => {
            const active = user.id === selectedUser?.id;
            return (
              <button
                type="button"
                key={user.id}
                onClick={() => setSelectedId(user.id)}
                className={`w-full rounded-3xl border p-4 text-left transition-colors ${
                  active
                    ? "border-[var(--accent)] bg-[var(--accent-light)]"
                    : "border-[var(--border-subtle)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)]"
                }`}
                style={active ? { boxShadow: "var(--shadow-card)" } : undefined}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{user.name}</p>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      {user.email}
                    </p>
                  </div>
                  <StatusPill value={user.riskLevel} />
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--text-tertiary)]">
                  <span>{user.trackName}</span>
                  <span>{user.pendingSync} pendencias</span>
                  <span>{user.weeklyHours.toFixed(1)}h</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Right: selected user detail ──────────────────────────────────── */}
      {selectedUser ? (
        <div
          className="rounded-[28px] border border-[var(--border-subtle)] bg-[var(--bg-base)] p-5"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent-mid)]">
                usuario selecionado
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
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
                className="inline-flex items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 py-2 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-inset)] transition-colors"
              >
                Abrir detalhe
              </Link>
            </div>
          </div>

          {/* ── Mini metric strip ─────────────────────────────────────────── */}
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { label: "streak", value: `${selectedUser.activeStreak} dias` },
              { label: "horas semana", value: `${selectedUser.weeklyHours.toFixed(1)}h` },
              { label: "fila sync", value: String(selectedUser.pendingSync) },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
                  {label}
                </p>
                <p className="mt-2 text-xl font-semibold text-[var(--text-primary)]">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <WatchlistForm user={selectedUser} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
