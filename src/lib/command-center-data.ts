import { getBillingOverview } from "@/lib/billing-data";
import {
    createProductSourceAdminClient,
    createSupabaseAdminClient,
} from "@/lib/supabase/server";
import type {
    ActivityPoint,
    BillingSnapshot,
    CommandCenterSnapshot,
    DatabaseMetric,
    FleetNode,
    IncidentSnapshot,
    PlatformSnapshot,
    ReleaseSnapshot,
    RiskLevel,
    SupportStatus,
    UserSnapshot,
} from "@/lib/types";
import { clamp, formatCompactNumber, isoDayKey, startOfDay } from "@/lib/utils";
import { unstable_noStore as noStore } from "next/cache";

// Supabase builders are heavily generic and become noisy here; keep this
// adapter narrow so the rest of the file can stay strictly typed.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QueryBuilder = (query: any) => any;

type ProfileRow = {
  id: string;
  full_name: string;
  email: string | null;
  desired_area: string;
  onboarding_completed: boolean;
  selected_track_id: string | null;
  updated_at: string;
};

type TrackRow = {
  id: string;
  name: string;
};

type SessionRow = {
  user_id: string;
  start_time: string;
  duration_minutes: number;
};

type SyncQueueRow = {
  user_id: string;
  attempts: number;
  last_error: string | null;
  created_at: string;
};

type WatchlistRow = {
  profile_id: string;
  risk_level: RiskLevel;
  support_status: SupportStatus;
  internal_note: string | null;
  next_action_at: string | null;
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
  open_errors: number | null;
  cpu_percent: number | null;
  memory_percent: number | null;
  disk_percent: number | null;
  network_status: string | null;
  app_uptime_seconds: number | null;
  os_uptime_seconds: number | null;
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

type AuthUserRow = {
  id: string;
  email?: string;
  last_sign_in_at?: string | null;
  updated_at?: string | null;
};

const TABLE_DESCRIPTIONS: Array<{
  tableName: string;
  label: string;
  description: string;
}> = [
  {
    tableName: "profiles",
    label: "Perfis",
    description: "Base principal de usuarios e onboarding.",
  },
  {
    tableName: "study_sessions",
    label: "Sessoes",
    description: "Historico de estudo usado em analytics e progresso.",
  },
  {
    tableName: "tasks",
    label: "Tarefas",
    description: "Pendencias operacionais e de estudo por usuario.",
  },
  {
    tableName: "reviews",
    label: "Revisoes",
    description: "Agenda de repeticao espaçada e vencimentos futuros.",
  },
  {
    tableName: "study_notes",
    label: "Notas",
    description: "Caderno unificado do usuario nos apps do ecossistema.",
  },
  {
    tableName: "sync_queue",
    label: "Fila de sync",
    description: "Registros ainda aguardando envio ao Supabase.",
  },
];

function getEmptyCommandCenterSnapshot(
  generatedAt: string,
  mode: CommandCenterSnapshot["mode"] = "empty",
): CommandCenterSnapshot {
  return {
    mode,
    generatedAt,
    metrics: [
      {
        label: "Usuarios monitorados",
        value: "0",
        delta: "fonte do produto ainda sem leitura",
        hint: "Conecte o banco do produto para listar usuarios reais.",
        tone: "neutral",
      },
      {
        label: "Pendencias de sync",
        value: "0",
        delta: "sem backlog observado",
        hint: "A fila sera consolidada assim que a fonte do produto estiver conectada.",
        tone: "neutral",
      },
      {
        label: "Frota operacional",
        value: "0/0",
        delta: "sem agentes reportando heartbeat",
        hint: "Windows e apps clientes aparecem aqui quando o heartbeat estiver ativo.",
        tone: "neutral",
      },
      {
        label: "Incidentes criticos",
        value: "0",
        delta: "nenhum incidente aberto",
        hint: "Incidentes surgem a partir do banco operacional do Command Center.",
        tone: "neutral",
      },
    ],
    activity: groupActivity(null, null),
    fleet: [],
    platforms: [],
    releases: [],
    systems: [],
    users: [],
    database: deriveDatabaseMetrics({
      profiles: 0,
      study_sessions: 0,
      tasks: 0,
      reviews: 0,
      study_notes: 0,
      sync_queue: 0,
    }),
    incidents: [],
  };
}

async function safeCount(
  client: ReturnType<typeof createSupabaseAdminClient>,
  table: string,
  builder?: QueryBuilder,
) {
  if (!client) {
    return null;
  }

  try {
    let query = client.from(table).select("*", { count: "exact", head: true });
    if (builder) {
      query = builder(query);
    }
    const { count, error } = await query;
    if (error) {
      return null;
    }
    return count ?? 0;
  } catch {
    return null;
  }
}

async function safeSelect<T>(
  client: ReturnType<typeof createSupabaseAdminClient>,
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
      query = builder(query);
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

async function safeListAuthUsers(
  client: ReturnType<typeof createSupabaseAdminClient>,
) {
  if (!client) {
    return null;
  }

  try {
    const users: AuthUserRow[] = [];
    const pageSize = 100;

    for (let page = 1; page <= 20; page += 1) {
      const { data, error } = await client.auth.admin.listUsers({
        page,
        perPage: pageSize,
      });

      if (error) {
        return null;
      }

      const batch = data.users ?? [];
      users.push(
        ...batch.map<AuthUserRow>((user) => ({
          id: user.id,
          email: user.email,
          last_sign_in_at: user.last_sign_in_at,
          updated_at: user.updated_at,
        })),
      );

      if (batch.length < pageSize) {
        break;
      }
    }

    return users;
  } catch {
    return null;
  }
}

function groupActivity(
  sessions: SessionRow[] | null,
  syncQueue: SyncQueueRow[] | null,
) {
  const dayFormatter = new Intl.DateTimeFormat("pt-BR", { weekday: "short" });
  const today = startOfDay(new Date());
  const buckets = new Map<
    string,
    ActivityPoint & { activeUserSet: Set<string> }
  >();

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    const key = isoDayKey(date);
    buckets.set(key, {
      label: dayFormatter.format(date).replace(".", ""),
      sessions: 0,
      activeUsers: 0,
      syncBacklog: 0,
      errors: 0,
      activeUserSet: new Set<string>(),
    });
  }

  for (const session of sessions ?? []) {
    const bucket = buckets.get(isoDayKey(session.start_time));
    if (!bucket) {
      continue;
    }
    bucket.sessions += 1;
    bucket.activeUserSet.add(session.user_id);
  }

  for (const item of syncQueue ?? []) {
    const bucket = buckets.get(isoDayKey(item.created_at));
    if (!bucket) {
      continue;
    }
    bucket.syncBacklog += 1;
    if (item.last_error) {
      bucket.errors += 1;
    }
  }

  return Array.from(buckets.values()).map((bucket) => ({
    label: bucket.label,
    sessions: bucket.sessions,
    activeUsers: bucket.activeUserSet.size,
    syncBacklog: bucket.syncBacklog,
    errors: bucket.errors,
  }));
}

function deriveUsers(
  profiles: ProfileRow[] | null,
  tracks: TrackRow[] | null,
  sessions: SessionRow[] | null,
  syncQueue: SyncQueueRow[] | null,
  watchlist: WatchlistRow[] | null,
  authUsers: AuthUserRow[] | null,
) {
  if (!profiles?.length) {
    return [];
  }

  const tracksById = new Map(
    (tracks ?? []).map((track) => [track.id, track.name]),
  );
  const authById = new Map((authUsers ?? []).map((user) => [user.id, user]));
  const watchlistById = new Map(
    (watchlist ?? []).map((row) => [row.profile_id, row]),
  );
  const sessionStats = new Map<
    string,
    { minutes: number; days: Set<string>; lastSeenAt: string | null }
  >();
  const syncStats = new Map<string, { pending: number; errorCount: number }>();

  for (const session of sessions ?? []) {
    const current = sessionStats.get(session.user_id) ?? {
      minutes: 0,
      days: new Set<string>(),
      lastSeenAt: null,
    };

    current.minutes += session.duration_minutes ?? 0;
    current.days.add(isoDayKey(session.start_time));
    if (!current.lastSeenAt || current.lastSeenAt < session.start_time) {
      current.lastSeenAt = session.start_time;
    }
    sessionStats.set(session.user_id, current);
  }

  for (const item of syncQueue ?? []) {
    const current = syncStats.get(item.user_id) ?? {
      pending: 0,
      errorCount: 0,
    };
    current.pending += 1;
    if (item.last_error) {
      current.errorCount += 1;
    }
    syncStats.set(item.user_id, current);
  }

  const riskWeight: Record<RiskLevel, number> = {
    critical: 3,
    attention: 2,
    healthy: 1,
  };

  return profiles
    .map<UserSnapshot>((profile) => {
      const authUser = authById.get(profile.id);
      const watch = watchlistById.get(profile.id);
      const study = sessionStats.get(profile.id);
      const sync = syncStats.get(profile.id) ?? { pending: 0, errorCount: 0 };
      const fallbackRisk =
        sync.pending >= 10 || sync.errorCount >= 2
          ? "critical"
          : sync.pending >= 4
            ? "attention"
            : "healthy";
      const lastSeenCandidates = [
        authUser?.last_sign_in_at,
        authUser?.updated_at,
        study?.lastSeenAt,
        profile.updated_at,
      ].filter(Boolean) as string[];
      const lastSeenAt = lastSeenCandidates.sort().at(-1) ?? profile.updated_at;

      return {
        id: profile.id,
        name: profile.full_name || authUser?.email || "Usuario sem nome",
        email: authUser?.email ?? profile.email ?? "sem-email@codetrail.local",
        desiredArea: profile.desired_area,
        trackName:
          tracksById.get(profile.selected_track_id ?? "") ?? "Sem trilha",
        onboardingCompleted: profile.onboarding_completed,
        lastSeenAt,
        activeStreak: study?.days.size ?? 0,
        weeklyHours: (study?.minutes ?? 0) / 60,
        pendingSync: sync.pending,
        riskLevel: watch?.risk_level ?? fallbackRisk,
        supportStatus:
          watch?.support_status ??
          (fallbackRisk === "critical"
            ? "needs_follow_up"
            : fallbackRisk === "attention"
              ? "monitoring"
              : "stable"),
        internalNote:
          watch?.internal_note ??
          (sync.pending > 0
            ? "Usuario com backlog recente aguardando flush."
            : "Operacao sem intervencao necessaria."),
        nextActionAt: watch?.next_action_at ?? null,
      };
    })
    .sort((left, right) => {
      if (riskWeight[left.riskLevel] !== riskWeight[right.riskLevel]) {
        return riskWeight[right.riskLevel] - riskWeight[left.riskLevel];
      }
      if (right.pendingSync !== left.pendingSync) {
        return right.pendingSync - left.pendingSync;
      }
      return right.weeklyHours - left.weeklyHours;
    });
}

function deriveFleet(
  instances: InstanceRow[] | null,
  heartbeats: HeartbeatRow[] | null,
  activeUsers: number,
) {
  if (!instances?.length) {
    return [];
  }

  const latestHeartbeatByInstance = new Map<string, HeartbeatRow>();
  for (const heartbeat of heartbeats ?? []) {
    if (!latestHeartbeatByInstance.has(heartbeat.instance_id)) {
      latestHeartbeatByInstance.set(heartbeat.instance_id, heartbeat);
    }
  }

  return instances.map<FleetNode>((instance) => {
    const heartbeat = latestHeartbeatByInstance.get(instance.id);
    const pendingSync = heartbeat?.sync_backlog ?? 0;

    return {
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
      activeUsers:
        instance.platform === "android"
          ? activeUsers
          : clamp(activeUsers / 4, 0, 999),
      pendingSync,
      uptimePercent:
        instance.status === "up"
          ? 99.9
          : instance.status === "degraded"
            ? 97.4
            : 91.2,
    };
  });
}

function deriveSystems(fleet: FleetNode[], heartbeats: HeartbeatRow[] | null) {
  const windowsFleet = fleet.filter((node) => node.platform === "windows");
  if (!windowsFleet.length) {
    return [];
  }

  const latestHeartbeatByInstance = new Map<string, HeartbeatRow>();
  for (const heartbeat of heartbeats ?? []) {
    if (!latestHeartbeatByInstance.has(heartbeat.instance_id)) {
      latestHeartbeatByInstance.set(heartbeat.instance_id, heartbeat);
    }
  }

  return windowsFleet.map((node) => {
    const heartbeat = latestHeartbeatByInstance.get(node.id);
    return {
      id: node.id,
      machineName: node.label,
      status: node.status,
      appVersion: node.version,
      cpuPercent: heartbeat?.cpu_percent ?? 0,
      memoryPercent: heartbeat?.memory_percent ?? 0,
      diskPercent: heartbeat?.disk_percent ?? 0,
      networkStatus: heartbeat?.network_status ?? "unknown",
      lastSeenAt: node.lastSeenAt,
      appUptimeHours:
        Math.round(((heartbeat?.app_uptime_seconds ?? 0) / 3600) * 10) / 10,
      osUptimeHours:
        Math.round(((heartbeat?.os_uptime_seconds ?? 0) / 3600) * 10) / 10,
      environment: node.environment,
    };
  });
}

function derivePlatformSummaries(fleet: FleetNode[]) {
  const summaries = new Map<string, PlatformSnapshot>();

  for (const node of fleet) {
    const current = summaries.get(node.platform) ?? {
      platform: node.platform,
      instances: 0,
      uniqueVersions: 0,
      activeUsers: 0,
      pendingSync: 0,
      degradedNodes: 0,
      latestSeenAt: null,
    };

    current.instances += 1;
    current.activeUsers += node.activeUsers;
    current.pendingSync += node.pendingSync;
    if (node.status !== "up") {
      current.degradedNodes += 1;
    }
    if (!current.latestSeenAt || current.latestSeenAt < node.lastSeenAt) {
      current.latestSeenAt = node.lastSeenAt;
    }

    summaries.set(node.platform, current);
  }

  const versionsByPlatform = new Map<string, Set<string>>();
  for (const node of fleet) {
    const current = versionsByPlatform.get(node.platform) ?? new Set<string>();
    current.add(node.version);
    versionsByPlatform.set(node.platform, current);
  }

  return Array.from(summaries.values())
    .map((item) => ({
      ...item,
      uniqueVersions: versionsByPlatform.get(item.platform)?.size ?? 0,
    }))
    .sort((left, right) => right.instances - left.instances);
}

function deriveReleaseSummaries(fleet: FleetNode[]) {
  const summaries = new Map<string, ReleaseSnapshot>();

  for (const node of fleet) {
    const key = `${node.platform}:${node.version}`;
    const current = summaries.get(key) ?? {
      id: key,
      platform: node.platform,
      version: node.version,
      instances: 0,
      activeUsers: 0,
      pendingSync: 0,
      health: "up" as const,
      environments: [],
      lastSeenAt: node.lastSeenAt,
    };

    current.instances += 1;
    current.activeUsers += node.activeUsers;
    current.pendingSync += node.pendingSync;
    if (!current.environments.includes(node.environment)) {
      current.environments.push(node.environment);
    }
    if (current.lastSeenAt < node.lastSeenAt) {
      current.lastSeenAt = node.lastSeenAt;
    }
    if (node.status === "down") {
      current.health = "down";
    } else if (node.status === "degraded" && current.health !== "down") {
      current.health = "degraded";
    }

    summaries.set(key, current);
  }

  return Array.from(summaries.values()).sort((left, right) => {
    if (left.health !== right.health) {
      const weight = { down: 3, degraded: 2, up: 1 };
      return weight[right.health] - weight[left.health];
    }
    if (right.instances !== left.instances) {
      return right.instances - left.instances;
    }
    return right.lastSeenAt.localeCompare(left.lastSeenAt);
  });
}

function deriveIncidents(
  incidents: IncidentSnapshot[] | null,
  fleet: FleetNode[],
  pendingSync: number,
  users: UserSnapshot[],
) {
  if (incidents?.length) {
    return incidents;
  }

  const derived: IncidentSnapshot[] = [];
  const downNodes = fleet.filter((node) => node.status === "down");
  const degradedNodes = fleet.filter((node) => node.status === "degraded");
  const criticalUsers = users.filter((user) => user.riskLevel === "critical");

  if (downNodes.length) {
    derived.push({
      id: "derived-down-fleet",
      severity: "critical",
      title: "Instancias fora do ar",
      source: "Fleet monitoring",
      status: "open",
      openedAt: new Date().toISOString(),
      resolvedAt: null,
      summary: `${downNodes.length} instancia(s) estao sem heartbeat dentro da janela esperada.`,
      action:
        "Verificar conectividade, versao instalada e ultimo deploy da frota.",
      context: {},
    });
  }

  if (pendingSync > 20 || degradedNodes.length) {
    derived.push({
      id: "derived-sync-hotspot",
      severity: "warning",
      title: "Backlog ou degradacao acima do limite",
      source: "Sync pipeline",
      status: "investigating",
      openedAt: new Date().toISOString(),
      resolvedAt: null,
      summary:
        "A fila de sincronizacao ou o status da frota exigem nova rodada de retries e observacao do Supabase.",
      action:
        "Abrir a tela de diagnostico, confirmar retries e checar os clientes com maior backlog.",
      context: {},
    });
  }

  if (criticalUsers.length) {
    derived.push({
      id: "derived-user-risk",
      severity: "warning",
      title: "Usuarios com risco operacional",
      source: "User watchlist",
      status: "open",
      openedAt: new Date().toISOString(),
      resolvedAt: null,
      summary: `${criticalUsers.length} usuario(s) exigem follow-up pela equipe.`,
      action: "Atualizar notas internas e definir a proxima acao ainda hoje.",
      context: {},
    });
  }

  return derived;
}

function deriveDatabaseMetrics(counts: Record<string, number | null>) {
  const values = TABLE_DESCRIPTIONS.map<DatabaseMetric>((table) => ({
    tableName: table.tableName,
    label: table.label,
    rowCount: counts[table.tableName] ?? 0,
    description: table.description,
    health:
      table.tableName === "sync_queue" && (counts[table.tableName] ?? 0) > 10
        ? "attention"
        : "healthy",
  }));

  return values;
}

export async function getCommandCenterSnapshot(): Promise<CommandCenterSnapshot> {
  noStore();

  const opsAdmin = createSupabaseAdminClient();
  const productAdmin = createProductSourceAdminClient();
  const generatedAt = new Date().toISOString();

  if (!opsAdmin && !productAdmin) {
    return getEmptyCommandCenterSnapshot(generatedAt, "empty");
  }

  const sevenDaysAgo = startOfDay(new Date());
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const sinceIso = sevenDaysAgo.toISOString();

  const [
    profilesCount,
    sessionsCount,
    tasksCount,
    reviewsCount,
    notesCount,
    syncQueueCount,
    profiles,
    tracks,
    sessions,
    syncQueue,
    watchlist,
    instances,
    heartbeats,
    incidents,
    authUsers,
  ] = await Promise.all([
    safeCount(productAdmin, "profiles"),
    safeCount(productAdmin, "study_sessions"),
    safeCount(productAdmin, "tasks"),
    safeCount(productAdmin, "reviews"),
    safeCount(productAdmin, "study_notes"),
    safeCount(productAdmin, "sync_queue"),
    safeSelect<ProfileRow>(
      productAdmin,
      "profiles",
      "id, full_name, email, desired_area, onboarding_completed, selected_track_id, updated_at",
      (query) => query.order("updated_at", { ascending: false }).limit(100),
    ),
    safeSelect<TrackRow>(productAdmin, "study_tracks", "id, name"),
    safeSelect<SessionRow>(
      productAdmin,
      "study_sessions",
      "user_id, start_time, duration_minutes",
      (query) =>
        query
          .gte("start_time", sinceIso)
          .order("start_time", { ascending: true })
          .limit(1500),
    ),
    safeSelect<SyncQueueRow>(
      productAdmin,
      "sync_queue",
      "user_id, attempts, last_error, created_at",
      (query) => query.order("created_at", { ascending: true }).limit(1500),
    ),
    safeSelect<WatchlistRow>(
      opsAdmin,
      "ops_user_watchlist",
      "profile_id, risk_level, support_status, internal_note, next_action_at",
    ),
    safeSelect<InstanceRow>(
      opsAdmin,
      "ops_app_instances",
      "id, external_id, platform, app_version, environment, device_label, machine_name, last_seen_at, status",
      (query) => query.order("last_seen_at", { ascending: false }).limit(50),
    ),
    safeSelect<HeartbeatRow>(
      opsAdmin,
      "ops_heartbeats",
      "instance_id, sync_backlog, open_errors, cpu_percent, memory_percent, disk_percent, network_status, app_uptime_seconds, os_uptime_seconds, created_at",
      (query) => query.order("created_at", { ascending: false }).limit(200),
    ),
    safeSelect<IncidentRow>(
      opsAdmin,
      "ops_incidents",
      "id, severity, title, source, status, opened_at, resolved_at, summary, suggested_action, context",
      (query) => query.order("opened_at", { ascending: false }).limit(20),
    ).then(
      (rows) =>
        rows?.map<IncidentSnapshot>((incident) => ({
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
        })) ?? null,
    ),
    safeListAuthUsers(productAdmin),
  ]);

  const users = deriveUsers(
    profiles,
    tracks,
    sessions,
    syncQueue,
    watchlist,
    authUsers,
  );

  const activeUsers = sessions?.length
    ? new Set(sessions.map((session) => session.user_id)).size
    : users.length;

  const fleet = deriveFleet(instances, heartbeats, activeUsers);
  const platforms = derivePlatformSummaries(fleet);
  const releases = deriveReleaseSummaries(fleet);
  const systems = deriveSystems(fleet, heartbeats);
  const pendingSync = syncQueueCount ?? 0;
  const activity = groupActivity(sessions, syncQueue);
  const database = deriveDatabaseMetrics({
    profiles: profilesCount,
    study_sessions: sessionsCount,
    tasks: tasksCount,
    reviews: reviewsCount,
    study_notes: notesCount,
    sync_queue: syncQueueCount,
  });
  const incidentList = deriveIncidents(incidents, fleet, pendingSync, users);
  const criticalIncidents = incidentList.filter(
    (incident) => incident.severity === "critical",
  ).length;

  const hasAnyRealData =
    users.length > 0 ||
    fleet.length > 0 ||
    systems.length > 0 ||
    incidentList.length > 0 ||
    database.some((item) => item.rowCount > 0);

  if (!hasAnyRealData) {
    return getEmptyCommandCenterSnapshot(
      generatedAt,
      opsAdmin || productAdmin ? "supabase" : "empty",
    );
  }

  return {
    mode: "supabase",
    generatedAt,
    metrics: [
      {
        label: "Usuarios monitorados",
        value: formatCompactNumber(profilesCount ?? users.length),
        delta: `${activeUsers} ativos nos ultimos 7 dias`,
        hint: "Leitura consolidada da base do produto e do uso recente das sessoes.",
        tone: "good",
      },
      {
        label: "Pendencias de sync",
        value: formatCompactNumber(pendingSync),
        delta:
          pendingSync > 10
            ? "backlog acima do alvo"
            : "dentro da faixa operacional",
        hint: "Fila atual observada em sync_queue.",
        tone: pendingSync > 10 ? "warning" : "good",
      },
      {
        label: "Frota operacional",
        value: `${fleet.filter((node) => node.status === "up").length}/${fleet.length}`,
        delta: `${fleet.filter((node) => node.status !== "up").length} nodo(s) exigem atencao`,
        hint: "Heartbeat consolidado por instancia monitorada.",
        tone: fleet.some((node) => node.status === "down")
          ? "critical"
          : "good",
      },
      {
        label: "Incidentes criticos",
        value: String(criticalIncidents),
        delta: `${incidentList.length} evento(s) no radar`,
        hint: "Incidentes persistidos ou derivados do estado operacional.",
        tone: criticalIncidents > 0 ? "critical" : "neutral",
      },
    ],
    activity,
    fleet,
    platforms,
    releases,
    systems,
    users,
    database,
    incidents: incidentList,
  };
}

export async function getBillingSnapshot(): Promise<BillingSnapshot> {
  noStore();
  const generatedAt = new Date().toISOString();

  const overview = await getBillingOverview();

  if (!overview.hasProductSource) {
    // Fallback: product source not configured
    return {
      mode: "empty",
      generatedAt,
      metrics: {
        totalRevenue: 0,
        revenueGrowth: 0,
        activeSubs: 0,
        activeSubsGrowth: 0,
        churnRate: 0,
        churnRateDelta: 0,
        arpu: 0,
        arpuGrowth: 0,
      },
      monthlyRevenue: [],
      planDistribution: [],
      recentEvents: [],
    };
  }

  const planColorMap: Record<string, string> = {
    free: "bg-neutral-600",
    pro: "bg-cyan-400",
    founding: "bg-cyan-700",
  };

  return {
    mode: "supabase",
    generatedAt,
    metrics: {
      totalRevenue: Math.round(overview.totalRevenueCents / 100),
      revenueGrowth: 0,
      activeSubs: overview.activeSubs,
      activeSubsGrowth: 0,
      churnRate: Math.round(overview.churnRate30d * 10) / 10,
      churnRateDelta: 0,
      arpu: Math.round(overview.arpu / 100),
      arpuGrowth: 0,
    },
    monthlyRevenue: overview.monthlyRevenue.map((m) => ({
      month: m.month.slice(5),
      amount: Math.round(m.amountCents / 100),
      isCurrent: m.isCurrent,
    })),
    planDistribution: overview.planBreakdown.map((p, idx) => ({
      id: p.planCode,
      name: p.planName,
      userCount: p.activeCount,
      percentage: p.percentage,
      color:
        planColorMap[p.planCode] ??
        (idx % 2 === 0 ? "bg-cyan-400" : "bg-cyan-700"),
    })),
    recentEvents: overview.recentSubscriptions.slice(0, 5).map((s, idx) => ({
      id: `sub_${idx}`,
      userId: s.userId,
      userName: s.userName,
      userEmail: s.userEmail,
      userInitials: s.userInitials,
      eventType: s.status === "trialing" ? "Trial" : "Subscription",
      timeAgo: "",
      planType: s.planName,
      amount: s.priceCents / 100,
      status: "success" as const,
    })),
  };
}
