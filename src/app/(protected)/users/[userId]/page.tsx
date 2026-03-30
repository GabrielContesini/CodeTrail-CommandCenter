import Link from "next/link";
import { notFound } from "next/navigation";
import { WatchlistForm } from "@/components/forms/watchlist-form";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatusPill } from "@/components/ui/status-pill";
import { getUserDetailSnapshot } from "@/lib/user-detail-data";
import {
  formatDateTime,
  formatDurationMinutes,
  formatRelativeTime,
  platformLabel,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

type Params = Promise<{ userId: string }>;

export default async function UserDetailPage({
  params,
}: {
  params: Params;
}) {
  const { userId } = await params;
  const detail = await getUserDetailSnapshot(userId);

  if (!detail) {
    notFound();
  }

  /** Shared card class for all inner article/div cards */
  const card =
    "rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-container)] p-4";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Usuário"
        title={detail.user.name}
        description={`${detail.user.email} · ${detail.user.trackName} · ${detail.user.desiredArea} · visto ${formatRelativeTime(detail.user.lastSeenAt)}.`}
        meta={[
          { label: "fila sync", value: String(detail.user.pendingSync) },
          { label: "streak", value: `${detail.user.activeStreak} dias` },
          { label: "horas semana", value: `${detail.user.weeklyHours.toFixed(1)}h` },
          { label: "incidentes", value: String(detail.relatedIncidents.length) },
        ]}
      />

      <div className="flex flex-wrap items-center gap-2">
        <StatusPill value={detail.user.riskLevel} />
        <StatusPill value={detail.user.supportStatus} />
        <Link
          href="/users"
          className="btn-secondary !rounded-full text-xs"
        >
          Voltar para usuários
        </Link>
        <Link
          href="/incidents"
          className="btn-secondary !rounded-full text-xs"
        >
          Abrir incidentes
        </Link>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard
          title="Contexto operacional"
          subtitle="Visão de onboarding, meta principal e sinais atuais de operação."
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className={card}>
              <p className="label-caps">
                trilha
              </p>
              <p className="mt-2 text-lg font-bold text-[var(--text-primary)]">
                {detail.user.trackName}
              </p>
            </div>
            <div className={card}>
              <p className="label-caps">
                onboarding
              </p>
              <p className="mt-2 text-lg font-bold text-[var(--text-primary)]">
                {detail.user.onboardingCompleted ? "concluído" : "pendente"}
              </p>
            </div>
            <div className={card}>
              <p className="label-caps">
                última atividade
              </p>
              <p className="mt-2 text-lg font-bold text-[var(--text-primary)]">
                {formatRelativeTime(detail.user.lastSeenAt)}
              </p>
            </div>
            <div className={card}>
              <p className="label-caps">
                próxima ação
              </p>
              <p className="mt-2 text-lg font-bold text-[var(--text-primary)]">
                {detail.user.nextActionAt
                  ? formatDateTime(detail.user.nextActionAt)
                  : "sem agenda"}
              </p>
            </div>
          </div>

          {detail.goal ? (
            <div className="mt-5 rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-container)] p-5">
              <p className="label-cyan">
                meta principal
              </p>
              <h3 className="mt-2 text-xl font-bold text-[var(--text-primary)]">
                {detail.goal.primaryGoal}
              </h3>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--text-secondary)]">
                <span>foco {detail.goal.focusType}</span>
                <span>
                  {detail.goal.hoursPerDay}h/dia · {detail.goal.daysPerWeek} dias/semana
                </span>
                <span>prazo {formatDateTime(detail.goal.deadline)}</span>
              </div>
              <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
                {detail.goal.generatedPlan}
              </p>
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-container)] p-5 text-sm text-[var(--text-secondary)]">
              Nenhuma meta estruturada foi registrada para este usuário ainda.
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Watchlist"
          subtitle="Ajuste risco, suporte e próxima ação sem sair do detalhe."
        >
          <WatchlistForm user={detail.user} />
        </SectionCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard
          title="Atividade recente"
          subtitle="Sessões, tarefas, revisões e notas mais próximas do presente."
        >
          <div className="space-y-5">
            <div>
              <p className="label-caps">
                sessões
              </p>
              <div className="mt-3 space-y-3">
                {detail.recentSessions.length ? (
                  detail.recentSessions.map((session) => (
                    <article key={session.id} className={card}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-[var(--text-primary)]">
                            {session.type}
                          </p>
                          <p className="mt-1 text-xs text-[var(--text-secondary)]">
                            {formatDateTime(session.startTime)} · {formatDurationMinutes(session.durationMinutes)}
                          </p>
                        </div>
                        <div className="rounded-full border border-[var(--accent-light)] bg-[var(--accent-light)] px-3 py-1 text-[11px] uppercase tracking-[0.18em] font-bold text-[var(--accent)]">
                          produtividade {session.productivityScore}/5
                        </div>
                      </div>
                      {session.notes ? (
                        <p className="mt-3 text-sm text-[var(--text-secondary)]">
                          {session.notes}
                        </p>
                      ) : null}
                    </article>
                  ))
                ) : (
                  <div className={card + " text-sm text-[var(--text-secondary)]"}>
                    Nenhuma sessão recente encontrada.
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <p className="label-caps">
                  tarefas
                </p>
                <div className="mt-3 space-y-3">
                  {detail.recentTasks.length ? (
                    detail.recentTasks.map((task) => (
                      <article key={task.id} className={card}>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <p className="text-sm font-bold text-[var(--text-primary)]">{task.title}</p>
                          <StatusPill value={task.status} />
                        </div>
                        <p className="mt-2 text-xs text-[var(--text-secondary)]">
                          {task.priority} · atualizado {formatRelativeTime(task.updatedAt)}
                          {task.dueDate ? ` · vence ${formatDateTime(task.dueDate)}` : ""}
                        </p>
                      </article>
                    ))
                  ) : (
                    <div className={card + " text-sm text-[var(--text-secondary)]"}>
                      Nenhuma tarefa recente.
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p className="label-caps">
                  revisões e notas
                </p>
                <div className="mt-3 space-y-3">
                  {detail.recentReviews.map((review) => (
                    <article key={review.id} className={card}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <p className="text-sm font-bold text-[var(--text-primary)]">{review.title}</p>
                        <StatusPill value={review.status} />
                      </div>
                      <p className="mt-2 text-xs text-[var(--text-secondary)]">
                        {review.intervalLabel} · {formatDateTime(review.scheduledFor)}
                      </p>
                    </article>
                  ))}
                  {detail.recentNotes.map((note) => (
                    <article key={note.id} className={card}>
                      <p className="text-sm font-bold text-[var(--text-primary)]">{note.title}</p>
                      <p className="mt-2 text-xs text-[var(--text-secondary)]">
                        {note.folderName} · {formatRelativeTime(note.updatedAt)}
                      </p>
                    </article>
                  ))}
                  {!detail.recentReviews.length && !detail.recentNotes.length ? (
                    <div className={card + " text-sm text-[var(--text-secondary)]"}>
                      Nenhuma revisão ou nota recente.
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Dispositivos e incidentes"
          subtitle="Contexto cruzado do usuário no ecossistema Android e Windows."
        >
          <div className="space-y-5">
            <div>
              <p className="label-caps">
                dispositivos ligados
              </p>
              <div className="mt-3 space-y-3">
                {detail.linkedInstances.length ? (
                  detail.linkedInstances.map((instance) => (
                    <article key={instance.id} className={card}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-[var(--text-primary)]">{instance.label}</p>
                          <p className="mt-1 text-xs text-[var(--text-secondary)]">
                            {platformLabel(instance.platform)} · {instance.environment} · versão {instance.version}
                          </p>
                        </div>
                        <StatusPill value={instance.status} />
                      </div>
                      <p className="mt-3 text-xs text-[var(--text-secondary)]">
                        {instance.pendingSync} pendência(s) · visto {formatRelativeTime(instance.lastSeenAt)}
                      </p>
                    </article>
                  ))
                ) : (
                  <div className={card + " text-sm text-[var(--text-secondary)]"}>
                    Nenhum dispositivo vinculado a este usuário ainda.
                  </div>
                )}
              </div>
            </div>

            <div>
              <p className="label-caps">
                incidentes relacionados
              </p>
              <div className="mt-3 space-y-3">
                {detail.relatedIncidents.length ? (
                  detail.relatedIncidents.map((incident) => (
                    <article key={incident.id} className={card}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-[var(--text-primary)]">{incident.title}</p>
                          <p className="mt-1 text-xs text-[var(--text-secondary)]">
                            {incident.source} · {formatRelativeTime(incident.openedAt)}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <StatusPill value={incident.severity} />
                          <StatusPill value={incident.status} />
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-[var(--text-secondary)]">
                        {incident.summary}
                      </p>
                    </article>
                  ))
                ) : (
                  <div className={card + " text-sm text-[var(--text-secondary)]"}>
                    Nenhum incidente explicitamente vinculado a este usuário.
                  </div>
                )}
              </div>
            </div>
          </div>
        </SectionCard>
      </section>

      <SectionCard
        title="Timeline operacional"
        subtitle="Linha única com tudo que a operação precisa para decidir o próximo movimento."
      >
        <div className="space-y-3">
          {detail.timeline.map((entry) => (
            <article key={entry.id} className={card}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-[var(--text-primary)]">{entry.title}</p>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    {entry.kind} · {formatDateTime(entry.happenedAt)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {entry.status ? <StatusPill value={entry.status} /> : null}
                  <StatusPill value={entry.tone} />
                </div>
              </div>
              <p className="mt-3 text-sm text-[var(--text-secondary)]">
                {entry.summary}
              </p>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
