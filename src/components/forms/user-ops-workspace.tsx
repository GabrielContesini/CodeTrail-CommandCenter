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
      <div className="rounded-[28px] border border-white/8 bg-black/10 p-6 text-sm text-[var(--text-secondary)]">
        Nenhum usuario foi carregado ainda. Conecte a fonte do produto em
        <code className="mx-1 rounded bg-white/6 px-1.5 py-0.5 text-white">
          PRODUCT_SUPABASE_URL
        </code>
        e
        <code className="mx-1 rounded bg-white/6 px-1.5 py-0.5 text-white">
          PRODUCT_SUPABASE_SERVICE_ROLE_KEY
        </code>
        para listar os usuarios reais do CodeTrail App.
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
      <div className="space-y-4">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar usuario, e-mail ou trilha..."
          className="w-full rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-[var(--text-secondary)] focus:border-[var(--accent)]"
        />

        <div className="scrollbar-thin max-h-[640px] space-y-3 overflow-y-auto pr-2">
          {filteredUsers.map((user) => {
            const active = user.id === selectedUser?.id;
            return (
              <button
                type="button"
                key={user.id}
                onClick={() => setSelectedId(user.id)}
                className={`w-full rounded-3xl border p-4 text-left ${
                  active
                    ? "border-[var(--accent)] bg-[rgba(0,95,115,0.24)]"
                    : "border-white/8 bg-black/10"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{user.name}</p>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      {user.email}
                    </p>
                  </div>
                  <StatusPill value={user.riskLevel} />
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--text-secondary)]">
                  <span>{user.trackName}</span>
                  <span>{user.pendingSync} pendencias</span>
                  <span>{user.weeklyHours.toFixed(1)}h</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedUser ? (
        <div className="rounded-[28px] border border-white/8 bg-black/10 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent-secondary)]">
                usuario selecionado
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-white">
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
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white hover:bg-white/10"
              >
                Abrir detalhe
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/4 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                streak
              </p>
              <p className="mt-2 text-xl font-semibold text-white">
                {selectedUser.activeStreak} dias
              </p>
            </div>
            <div className="rounded-2xl bg-white/4 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                horas semana
              </p>
              <p className="mt-2 text-xl font-semibold text-white">
                {selectedUser.weeklyHours.toFixed(1)}h
              </p>
            </div>
            <div className="rounded-2xl bg-white/4 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                fila sync
              </p>
              <p className="mt-2 text-xl font-semibold text-white">
                {selectedUser.pendingSync}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <WatchlistForm user={selectedUser} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
