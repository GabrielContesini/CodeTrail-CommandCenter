import { unstable_noStore as noStore } from "next/cache";
import { getCommandCenterSnapshot } from "@/lib/command-center-data";
import {
  createProductSourceAdminClient,
  createSupabaseAdminClient,
} from "@/lib/supabase/server";
import type {
  FleetNode,
  IncidentSnapshot,
  UserDetailSnapshot,
  UserGoalSnapshot,
  UserRecentNote,
  UserRecentReview,
  UserRecentSession,
  UserRecentTask,
  UserSyncItem,
  UserTimelineEntry,
} from "@/lib/types";

// Supabase builders get too generic here; keep the adapter narrow and typed at
// the edges so the rest of the file can stay readable.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QueryBuilder = (query: any) => any;

type GoalRow = {
  primary_goal: string;
  focus_type: string;
  deadline: string;
  hours_per_day: number;
  days_per_week: number;
  generated_plan: string;
};

type SessionRow = {
  id: string;
  type: string;
  start_time: string;
  duration_minutes: number;
  productivity_score: number;
  notes: string;
};

type TaskRow = {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
  updated_at: string;
};

type ReviewRow = {
  id: string;
  title: string;
  status: string;
  scheduled_for: string;
  interval_label: string;
};

type NoteRow = {
  id: string;
  title: string;
  folder_name: string;
  updated_at: string;
};

type SyncItemRow = {
  id: string;
  table_name: string;
  action: "upsert" | "delete";
  attempts: number;
  last_error: string | null;
  created_at: string;
  updated_at: string;
};

type InstanceRow = {
  id: string;
  external_id: string;
  platform: FleetNode["platform"];
  app_version: string;
  environment: string;
  device_label: string | null;
  machine_name: string | null;
  last_seen_at: string;
  status: FleetNode["status"];
};

type HeartbeatRow = {
  instance_id: string;
  sync_backlog: number | null;
  created_at: string;
};

type IncidentRow = {
  id: string;
  severity: IncidentSnapshot["severity"];
  title: string;
  source: string;
  status: IncidentSnapshot["status"];
  opened_at: string;
  resolved_at: string | null;
  summary: string;
  suggested_action: string;
  context: Record<string, unknown> | null;
};

async function safeMaybeSingle<T>(
  client: ReturnType<typeof createProductSourceAdminClient>,
  table: string,
  columns: string,
  builder?: QueryBuilder,
) {
  if (!client) {
    return null;
  }

  try {
    let query = client.from(table).select(columns);
    if (builder) {
      query = builder(query) as typeof query;
    }
    const { data, error } = await query.maybeSingle<T>();
    if (error) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

async function safeSelect<T>(
  client: ReturnType<typeof createProductSourceAdminClient>,
  table: string,
  columns: string,
  builder?: QueryBuilder,
) {
  if (!client) {
    return null;
  }

  try {
    let query = client.from(table).select(columns);
    if (builder) {
      query = builder(query) as typeof query;
    }
    const { data, error } = await query;
    if (error) {
      return null;
    }
    return (data ?? []) as T[];
  } catch {
    return null;
  }
}

function deriveLinkedInstances(
  instances: InstanceRow[] | null,
  heartbeats: HeartbeatRow[] | null,
) {
  const backlogByInstance = new Map<string, number>();
  for (const heartbeat of heartbeats ?? []) {
    if (!backlogByInstance.has(heartbeat.instance_id)) {
      backlogByInstance.set(heartbeat.instance_id, heartbeat.sync_backlog ?? 0);
    }
  }

  return (instances ?? []).map<FleetNode>((instance) => ({
    id: instance.id,
    label:
      instance.device_label ||
      instance.machine_name ||
      instance.external_id ||
      "Instancia sem nome",
    platform: instance.platform,
    status: instance.status,
    version: instance.app_version,
    environment: instance.environment,
    lastSeenAt: instance.last_seen_at,
    activeUsers: 1,
    pendingSync: backlogByInstance.get(instance.id) ?? 0,
    uptimePercent:
      instance.status === "up" ? 99.9 : instance.status === "degraded" ? 97.4 : 91.2,
  }));
}

function mapIncidents(rows: IncidentRow[] | null) {
  return (rows ?? []).map<IncidentSnapshot>((incident) => ({
    id: incident.id,
    severity: incident.severity,
    title: incident.title,
    source: incident.source,
    status: incident.status,
    openedAt: incident.opened_at,
    resolvedAt: incident.resolved_at,
    summary: incident.summary,
    action: incident.suggested_action,
    context: {
      profileId:
        typeof incident.context?.profileId === "string"
          ? incident.context.profileId
          : null,
      instanceId:
        typeof incident.context?.instanceId === "string"
          ? incident.context.instanceId
          : null,
      platform:
        typeof incident.context?.platform === "string"
          ? (incident.context.platform as FleetNode["platform"])
          : null,
      version:
        typeof incident.context?.version === "string"
          ? incident.context.version
          : null,
    },
  }));
}

function buildTimeline(
  detail: Omit<UserDetailSnapshot, "timeline">,
) {
  const entries: UserTimelineEntry[] = [];

  if (detail.user.internalNote || detail.user.nextActionAt) {
    entries.push({
      id: `watchlist-${detail.user.id}`,
      kind: "watchlist",
      title: "Watchlist operacional",
      summary:
        detail.user.internalNote ||
        `Status atual ${detail.user.supportStatus} com risco ${detail.user.riskLevel}.`,
      happenedAt: detail.user.nextActionAt ?? detail.user.lastSeenAt,
      tone:
        detail.user.riskLevel === "critical"
          ? "critical"
          : detail.user.riskLevel === "attention"
            ? "warning"
            : "neutral",
      status: detail.user.supportStatus,
    });
  }

  for (const session of detail.recentSessions) {
    entries.push({
      id: `session-${session.id}`,
      kind: "session",
      title: `Sessao de ${session.type}`,
      summary: `${session.durationMinutes} min · produtividade ${session.productivityScore}/5`,
      happenedAt: session.startTime,
      tone:
        session.productivityScore >= 4
          ? "good"
          : session.productivityScore <= 2
            ? "warning"
            : "neutral",
      status: session.type,
    });
  }

  for (const task of detail.recentTasks) {
    const overdue =
      task.status !== "completed" &&
      task.dueDate &&
      new Date(task.dueDate).getTime() < Date.now();
    entries.push({
      id: `task-${task.id}`,
      kind: "task",
      title: task.title,
      summary: `${task.priority} · ${task.status}`,
      happenedAt: task.updatedAt,
      tone: task.status === "completed" ? "good" : overdue ? "warning" : "neutral",
      status: task.status,
    });
  }

  for (const review of detail.recentReviews) {
    const overdue =
      review.status !== "completed" &&
      new Date(review.scheduledFor).getTime() < Date.now();
    entries.push({
      id: `review-${review.id}`,
      kind: "review",
      title: review.title,
      summary: `${review.intervalLabel} · ${review.status}`,
      happenedAt: review.scheduledFor,
      tone: review.status === "completed" ? "good" : overdue ? "warning" : "neutral",
      status: review.status,
    });
  }

  for (const note of detail.recentNotes) {
    entries.push({
      id: `note-${note.id}`,
      kind: "note",
      title: note.title,
      summary: `Pasta ${note.folderName}`,
      happenedAt: note.updatedAt,
      tone: "neutral",
    });
  }

  for (const item of detail.syncItems) {
    entries.push({
      id: `sync-${item.id}`,
      kind: "sync",
      title: `Fila ${item.action} em ${item.tableName}`,
      summary:
        item.lastError ??
        `${item.attempts} tentativa(s) para enviar ${item.tableName}.`,
      happenedAt: item.updatedAt,
      tone: item.lastError ? "critical" : item.attempts > 1 ? "warning" : "neutral",
      status: item.action,
    });
  }

  for (const device of detail.linkedInstances) {
    entries.push({
      id: `device-${device.id}`,
      kind: "device",
      title: device.label,
      summary: `${device.environment} · versao ${device.version} · ${device.pendingSync} pendencia(s)`,
      happenedAt: device.lastSeenAt,
      tone:
        device.status === "down"
          ? "critical"
          : device.status === "degraded"
            ? "warning"
            : "good",
      status: device.status,
    });
  }

  for (const incident of detail.relatedIncidents) {
    entries.push({
      id: `incident-${incident.id}`,
      kind: "incident",
      title: incident.title,
      summary: incident.summary,
      happenedAt: incident.openedAt,
      tone:
        incident.severity === "critical"
          ? "critical"
          : incident.severity === "warning"
            ? "warning"
            : "neutral",
      status: incident.status,
    });
  }

  return entries
    .sort((left, right) => right.happenedAt.localeCompare(left.happenedAt))
    .slice(0, 18);
}

export async function getUserDetailSnapshot(
  userId: string,
): Promise<UserDetailSnapshot | null> {
  noStore();

  const snapshot = await getCommandCenterSnapshot();
  const user = snapshot.users.find((item) => item.id === userId);

  if (!user) {
    return null;
  }

  const productAdmin = createProductSourceAdminClient();
  const opsAdmin = createSupabaseAdminClient();

  const [
    goalRow,
    sessions,
    tasks,
    reviews,
    notes,
    syncItems,
    instanceRows,
    incidentRows,
  ] = await Promise.all([
    safeMaybeSingle<GoalRow>(
      productAdmin,
      "user_goals",
      "primary_goal, focus_type, deadline, hours_per_day, days_per_week, generated_plan",
      (query) => query.eq("user_id", userId),
    ),
    safeSelect<SessionRow>(
      productAdmin,
      "study_sessions",
      "id, type, start_time, duration_minutes, productivity_score, notes",
      (query) => query.eq("user_id", userId).order("start_time", { ascending: false }).limit(8),
    ),
    safeSelect<TaskRow>(
      productAdmin,
      "tasks",
      "id, title, status, priority, due_date, updated_at",
      (query) => query.eq("user_id", userId).order("updated_at", { ascending: false }).limit(8),
    ),
    safeSelect<ReviewRow>(
      productAdmin,
      "reviews",
      "id, title, status, scheduled_for, interval_label",
      (query) => query.eq("user_id", userId).order("scheduled_for", { ascending: false }).limit(8),
    ),
    safeSelect<NoteRow>(
      productAdmin,
      "study_notes",
      "id, title, folder_name, updated_at",
      (query) => query.eq("user_id", userId).order("updated_at", { ascending: false }).limit(6),
    ),
    safeSelect<SyncItemRow>(
      productAdmin,
      "sync_queue",
      "id, table_name, action, attempts, last_error, created_at, updated_at",
      (query) => query.eq("user_id", userId).order("updated_at", { ascending: false }).limit(10),
    ),
    safeSelect<InstanceRow>(
      opsAdmin,
      "ops_app_instances",
      "id, external_id, platform, app_version, environment, device_label, machine_name, last_seen_at, status",
      (query) => query.eq("profile_id", userId).order("last_seen_at", { ascending: false }).limit(8),
    ),
    safeSelect<IncidentRow>(
      opsAdmin,
      "ops_incidents",
      "id, severity, title, source, status, opened_at, resolved_at, summary, suggested_action, context",
      (query) => query.order("opened_at", { ascending: false }).limit(50),
    ),
  ]);

  const instanceIds = new Set((instanceRows ?? []).map((item) => item.id));
  const heartbeats = instanceIds.size
    ? await safeSelect<HeartbeatRow>(
        opsAdmin,
        "ops_heartbeats",
        "instance_id, sync_backlog, created_at",
        (query) =>
          query
            .in("instance_id", Array.from(instanceIds))
            .order("created_at", { ascending: false })
            .limit(60),
      )
    : null;

  const linkedInstances = deriveLinkedInstances(instanceRows, heartbeats);
  const relatedIncidents = mapIncidents(incidentRows).filter((incident) => {
    const profileMatch = incident.context?.profileId === userId;
    const instanceMatch =
      incident.context?.instanceId != null &&
      instanceIds.has(incident.context.instanceId);
    return profileMatch || instanceMatch;
  });

  const detailWithoutTimeline: Omit<UserDetailSnapshot, "timeline"> = {
    user,
    goal: goalRow
      ? ({
          primaryGoal: goalRow.primary_goal,
          focusType: goalRow.focus_type,
          deadline: goalRow.deadline,
          hoursPerDay: goalRow.hours_per_day,
          daysPerWeek: goalRow.days_per_week,
          generatedPlan: goalRow.generated_plan,
        } satisfies UserGoalSnapshot)
      : null,
    recentSessions:
      sessions?.map<UserRecentSession>((session) => ({
        id: session.id,
        type: session.type,
        startTime: session.start_time,
        durationMinutes: session.duration_minutes,
        productivityScore: session.productivity_score,
        notes: session.notes,
      })) ?? [],
    recentTasks:
      tasks?.map<UserRecentTask>((task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        dueDate: task.due_date,
        updatedAt: task.updated_at,
      })) ?? [],
    recentReviews:
      reviews?.map<UserRecentReview>((review) => ({
        id: review.id,
        title: review.title,
        status: review.status,
        scheduledFor: review.scheduled_for,
        intervalLabel: review.interval_label,
      })) ?? [],
    recentNotes:
      notes?.map<UserRecentNote>((note) => ({
        id: note.id,
        title: note.title,
        folderName: note.folder_name,
        updatedAt: note.updated_at,
      })) ?? [],
    syncItems:
      syncItems?.map<UserSyncItem>((item) => ({
        id: item.id,
        tableName: item.table_name,
        action: item.action,
        attempts: item.attempts,
        lastError: item.last_error,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      })) ?? [],
    linkedInstances,
    relatedIncidents,
  };

  return {
    ...detailWithoutTimeline,
    timeline: buildTimeline(detailWithoutTimeline),
  };
}
