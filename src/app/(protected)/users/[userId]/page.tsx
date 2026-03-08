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

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Usuario"
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
          className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white hover:bg-white/10"
        >
          Voltar para usuarios
        </Link>
        <Link
          href="/incidents"
          className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white hover:bg-white/10"
        >
          Abrir incidentes
        </Link>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard
          title="Contexto operacional"
          subtitle="Visao de onboarding, meta principal e sinais atuais de operacao."
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-white/8 bg-black/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                trilha
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {detail.user.trackName}
              </p>
            </div>
            <div className="rounded-3xl border border-white/8 bg-black/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                onboarding
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {detail.user.onboardingCompleted ? "concluido" : "pendente"}
              </p>
            </div>
            <div className="rounded-3xl border border-white/8 bg-black/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                ultima atividade
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {formatRelativeTime(detail.user.lastSeenAt)}
              </p>
            </div>
            <div className="rounded-3xl border border-white/8 bg-black/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                proxima acao
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {detail.user.nextActionAt
                  ? formatDateTime(detail.user.nextActionAt)
                  : "sem agenda"}
              </p>
            </div>
          </div>

          {detail.goal ? (
            <div className="mt-5 rounded-[28px] border border-white/8 bg-black/10 p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent-secondary)]">
                meta principal
              </p>
              <h3 className="mt-2 text-xl font-semibold text-white">
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
            <div className="mt-5 rounded-[28px] border border-white/8 bg-black/10 p-5 text-sm text-[var(--text-secondary)]">
              Nenhuma meta estruturada foi registrada para este usuario ainda.
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Watchlist"
          subtitle="Ajuste risco, suporte e proxima acao sem sair do detalhe."
        >
          <WatchlistForm user={detail.user} />
        </SectionCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard
          title="Atividade recente"
          subtitle="Sessoes, tarefas, revisoes e notas mais proximas do presente."
        >
          <div className="space-y-5">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-secondary)]">
                sessoes
              </p>
              <div className="mt-3 space-y-3">
                {detail.recentSessions.length ? (
                  detail.recentSessions.map((session) => (
                    <article
                      key={session.id}
                      className="rounded-[24px] border border-white/8 bg-white/4 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {session.type}
                          </p>
                          <p className="mt-1 text-xs text-[var(--text-secondary)]">
                            {formatDateTime(session.startTime)} · {formatDurationMinutes(session.durationMinutes)}
                          </p>
                        </div>
                        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[var(--accent-secondary)]">
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
                  <div className="rounded-[24px] border border-white/8 bg-white/4 p-4 text-sm text-[var(--text-secondary)]">
                    Nenhuma sessao recente encontrada.
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-secondary)]">
                  tarefas
                </p>
                <div className="mt-3 space-y-3">
                  {detail.recentTasks.length ? (
                    detail.recentTasks.map((task) => (
                      <article
                        key={task.id}
                        className="rounded-[24px] border border-white/8 bg-white/4 p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <p className="text-sm font-semibold text-white">{task.title}</p>
                          <StatusPill value={task.status} />
                        </div>
                        <p className="mt-2 text-xs text-[var(--text-secondary)]">
                          {task.priority} · atualizado {formatRelativeTime(task.updatedAt)}
                          {task.dueDate ? ` · vence ${formatDateTime(task.dueDate)}` : ""}
                        </p>
                      </article>
                    ))
                  ) : (
                    <div className="rounded-[24px] border border-white/8 bg-white/4 p-4 text-sm text-[var(--text-secondary)]">
                      Nenhuma tarefa recente.
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-secondary)]">
                  revisoes e notas
                </p>
                <div className="mt-3 space-y-3">
                  {detail.recentReviews.map((review) => (
                    <article
                      key={review.id}
                      className="rounded-[24px] border border-white/8 bg-white/4 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-white">{review.title}</p>
                        <StatusPill value={review.status} />
                      </div>
                      <p className="mt-2 text-xs text-[var(--text-secondary)]">
                        {review.intervalLabel} · {formatDateTime(review.scheduledFor)}
                      </p>
                    </article>
                  ))}
                  {detail.recentNotes.map((note) => (
                    <article
                      key={note.id}
                      className="rounded-[24px] border border-white/8 bg-white/4 p-4"
                    >
                      <p className="text-sm font-semibold text-white">{note.title}</p>
                      <p className="mt-2 text-xs text-[var(--text-secondary)]">
                        {note.folderName} · {formatRelativeTime(note.updatedAt)}
                      </p>
                    </article>
                  ))}
                  {!detail.recentReviews.length && !detail.recentNotes.length ? (
                    <div className="rounded-[24px] border border-white/8 bg-white/4 p-4 text-sm text-[var(--text-secondary)]">
                      Nenhuma revisao ou nota recente.
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Dispositivos e incidentes"
          subtitle="Contexto cruzado do usuario no ecossistema Android e Windows."
        >
          <div className="space-y-5">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-secondary)]">
                dispositivos ligados
              </p>
              <div className="mt-3 space-y-3">
                {detail.linkedInstances.length ? (
                  detail.linkedInstances.map((instance) => (
                    <article
                      key={instance.id}
                      className="rounded-[24px] border border-white/8 bg-white/4 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">{instance.label}</p>
                          <p className="mt-1 text-xs text-[var(--text-secondary)]">
                            {platformLabel(instance.platform)} · {instance.environment} · versao {instance.version}
                          </p>
                        </div>
                        <StatusPill value={instance.status} />
                      </div>
                      <p className="mt-3 text-xs text-[var(--text-secondary)]">
                        {instance.pendingSync} pendencia(s) · visto {formatRelativeTime(instance.lastSeenAt)}
                      </p>
                    </article>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-white/8 bg-white/4 p-4 text-sm text-[var(--text-secondary)]">
                    Nenhum dispositivo vinculado a este usuario ainda.
                  </div>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-secondary)]">
                incidentes relacionados
              </p>
              <div className="mt-3 space-y-3">
                {detail.relatedIncidents.length ? (
                  detail.relatedIncidents.map((incident) => (
                    <article
                      key={incident.id}
                      className="rounded-[24px] border border-white/8 bg-white/4 p-4"
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
                      <p className="mt-3 text-sm text-[var(--text-secondary)]">
                        {incident.summary}
                      </p>
                    </article>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-white/8 bg-white/4 p-4 text-sm text-[var(--text-secondary)]">
                    Nenhum incidente explicitamente vinculado a este usuario.
                  </div>
                )}
              </div>
            </div>
          </div>
        </SectionCard>
      </section>

      <SectionCard
        title="Timeline operacional"
        subtitle="Linha unica com tudo que a operacao precisa para decidir o proximo movimento."
      >
        <div className="space-y-3">
          {detail.timeline.map((entry) => (
            <article
              key={entry.id}
              className="rounded-[24px] border border-white/8 bg-white/4 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{entry.title}</p>
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
