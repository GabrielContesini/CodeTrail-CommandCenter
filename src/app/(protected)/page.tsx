import { DashboardBento } from "@/components/dashboard/dashboard-bento";
import { getCommandCenterSnapshot } from "@/lib/command-center-data";
import { clamp, formatCompactNumber } from "@/lib/utils";
import {
  createProductSourceAdminClient,
  createSupabaseAdminClient,
} from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const ONLINE_WINDOW_MINUTES = 60;
const PERFORMANCE_WINDOW_HOURS = 12;

type SessionPresenceRow = {
  user_id: string;
  start_time: string;
};

type ProductProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
};

type HeartbeatPerformanceRow = {
  created_at: string;
  cpu_percent: number | null;
  memory_percent: number | null;
  disk_percent: number | null;
};

type SubscriptionMembershipRow = {
  user_id: string;
  status: string;
  updated_at: string;
  plans:
    | {
        code: string;
        name: string;
      }
    | Array<{
        code: string;
        name: string;
      }>
    | null;
};

function averageMetric(values: Array<number | null | undefined>) {
  const normalized = values.filter(
    (value): value is number => typeof value === "number" && Number.isFinite(value),
  );

  if (!normalized.length) {
    return 0;
  }

  return Math.round((normalized.reduce((sum, value) => sum + value, 0) / normalized.length) * 10) / 10;
}

function buildAvatarSource(userId: string, avatarUrl?: string | null) {
  const normalized = avatarUrl?.trim();

  if (normalized && /^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`;
}

function buildPerformanceChartData(
  rows: HeartbeatPerformanceRow[],
  fallback: { cpu: number; memory: number; disk: number },
) {
  const formatter = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit" });
  const currentHour = new Date();
  currentHour.setMinutes(0, 0, 0);

  const buckets = Array.from({ length: PERFORMANCE_WINDOW_HOURS }, (_, index) => {
    const date = new Date(currentHour);
    date.setHours(currentHour.getHours() - (PERFORMANCE_WINDOW_HOURS - 1 - index));

    return {
      key: date.toISOString().slice(0, 13),
      label: `${formatter.format(date)}h`,
      cpuValues: [] as number[],
      memoryValues: [] as number[],
      diskValues: [] as number[],
    };
  });

  const bucketsByHour = new Map(buckets.map((bucket) => [bucket.key, bucket]));

  for (const row of rows) {
    const date = new Date(row.created_at);
    date.setMinutes(0, 0, 0);
    const bucket = bucketsByHour.get(date.toISOString().slice(0, 13));

    if (!bucket) {
      continue;
    }

    if (typeof row.cpu_percent === "number") {
      bucket.cpuValues.push(row.cpu_percent);
    }
    if (typeof row.memory_percent === "number") {
      bucket.memoryValues.push(row.memory_percent);
    }
    if (typeof row.disk_percent === "number") {
      bucket.diskValues.push(row.disk_percent);
    }
  }

  const chartData = buckets.map((bucket) => ({
    label: bucket.label,
    cpu: bucket.cpuValues.length ? averageMetric(bucket.cpuValues) : null,
    memory: bucket.memoryValues.length ? averageMetric(bucket.memoryValues) : null,
    disk: bucket.diskValues.length ? averageMetric(bucket.diskValues) : null,
  }));

  if (chartData.some((point) => point.cpu !== null || point.memory !== null || point.disk !== null)) {
    return chartData;
  }

  return [
    {
      label: "Agora",
      cpu: fallback.cpu,
      memory: fallback.memory,
      disk: fallback.disk,
    },
  ];
}

async function getLatestPaidMembershipBreakdown(
  client: ReturnType<typeof createProductSourceAdminClient>,
) {
  if (!client) {
    return { pro: 0, founding: 0 };
  }

  try {
    const pageSize = 200;
    const latestByUser = new Map<string, SubscriptionMembershipRow>();

    for (let from = 0; from <= 2000; from += pageSize) {
      const { data, error } = await client
        .from("subscriptions")
        .select("user_id, status, updated_at, plans(code, name)")
        .order("updated_at", { ascending: false })
        .range(from, from + pageSize - 1);

      if (error) {
        return { pro: 0, founding: 0 };
      }

      const rows = (data ?? []) as SubscriptionMembershipRow[];

      for (const row of rows) {
        if (!row.user_id || latestByUser.has(row.user_id)) {
          continue;
        }

        latestByUser.set(row.user_id, row);
      }

      if (rows.length < pageSize) {
        break;
      }
    }

    let pro = 0;
    let founding = 0;

    for (const row of latestByUser.values()) {
      const plan = Array.isArray(row.plans) ? row.plans[0] : row.plans;
      if (plan?.code === "pro") {
        pro += 1;
      } else if (plan?.code === "founding") {
        founding += 1;
      }
    }

    return { pro, founding };
  } catch {
    return { pro: 0, founding: 0 };
  }
}

export default async function DashboardPage() {
  const initialSnapshot = await getCommandCenterSnapshot();
  const opsAdmin = createSupabaseAdminClient();
  const productAdmin = createProductSourceAdminClient();
  const snapshotTime = new Date(initialSnapshot.generatedAt).getTime();

  const onlineSinceIso = new Date(
    snapshotTime - ONLINE_WINDOW_MINUTES * 60 * 1000,
  ).toISOString();
  const performanceSinceIso = new Date(
    snapshotTime - PERFORMANCE_WINDOW_HOURS * 60 * 60 * 1000,
  ).toISOString();

  const [snapshot, paidMemberships, onlineSessionsResult, heartbeatsResult] =
    await Promise.all([
      Promise.resolve(initialSnapshot),
      getLatestPaidMembershipBreakdown(productAdmin),
      productAdmin
        ? productAdmin
            .from("study_sessions")
            .select("user_id, start_time")
            .gte("start_time", onlineSinceIso)
            .order("start_time", { ascending: false })
            .limit(800)
        : Promise.resolve({ data: null, error: null }),
      opsAdmin
        ? opsAdmin
            .from("ops_heartbeats")
            .select("created_at, cpu_percent, memory_percent, disk_percent")
            .gte("created_at", performanceSinceIso)
            .order("created_at", { ascending: true })
            .limit(1000)
        : Promise.resolve({ data: null, error: null }),
    ]);

  const activity = snapshot.activity;
  const stats = snapshot.metrics.slice(0, 4).map((metric, idx) => ({
    label: metric.label,
    value: metric.value,
    delta: metric.delta ?? "Stable",
    deltaColor:
      metric.tone === "good"
        ? ("emerald" as const)
        : metric.tone === "warning"
          ? ("amber" as const)
          : ("rose" as const),
    progress: clamp(20 + idx * 20, 5, 100),
  }));

  const apiStatuses = snapshot.systems
    .slice()
    .sort((a, b) => {
      const weight = { down: 2, degraded: 1, up: 0 } as const;
      return weight[b.status] - weight[a.status];
    })
    .slice(0, 4)
    .map((system) => ({
      name: system.machineName || system.id,
      status:
        system.status === "up"
          ? ("online" as const)
          : system.status === "degraded"
            ? ("degrading" as const)
            : ("offline" as const),
    }));

  if (apiStatuses.length === 0) {
    apiStatuses.push(
      { name: "Auth Service", status: "online" as const },
      { name: "Database", status: "online" as const },
      { name: "API Gateway", status: "online" as const },
    );
  }

  const onlineSessions = (onlineSessionsResult.data ?? []) as SessionPresenceRow[];
  const orderedOnlineUserIds: string[] = [];
  const seenOnlineUserIds = new Set<string>();

  for (const session of onlineSessions) {
    if (!session.user_id || seenOnlineUserIds.has(session.user_id)) {
      continue;
    }

    seenOnlineUserIds.add(session.user_id);
    orderedOnlineUserIds.push(session.user_id);
  }

  for (const user of snapshot.users.slice().sort((left, right) => right.lastSeenAt.localeCompare(left.lastSeenAt))) {
    if (new Date(user.lastSeenAt).toISOString() < onlineSinceIso) {
      continue;
    }

    if (seenOnlineUserIds.has(user.id)) {
      continue;
    }

    seenOnlineUserIds.add(user.id);
    orderedOnlineUserIds.push(user.id);
  }

  let onlineProfiles: ProductProfileRow[] = [];

  if (productAdmin && orderedOnlineUserIds.length > 0) {
    const { data } = await productAdmin
      .from("profiles")
      .select("id, full_name, email, avatar_url")
      .in("id", orderedOnlineUserIds.slice(0, 24));

    onlineProfiles = (data ?? []) as ProductProfileRow[];
  }

  const onlineProfilesById = new Map(onlineProfiles.map((profile) => [profile.id, profile]));
  const avatars = orderedOnlineUserIds.slice(0, 8).map((userId) => {
    const profile = onlineProfilesById.get(userId);
    const fallbackUser = snapshot.users.find((user) => user.id === userId);
    const name =
      profile?.full_name?.trim() ||
      fallbackUser?.name ||
      profile?.email ||
      "Usuario online";

    return {
      src: buildAvatarSource(userId, profile?.avatar_url),
      alt: name,
      name,
    };
  });

  const activeUsers = orderedOnlineUserIds.length;
  const peakToday = Math.max(activeUsers, ...activity.map((point) => point.activeUsers), 0);
  const maxCapacity = Math.max(Math.ceil(Math.max(peakToday, 1) * 1.15), 10);

  const proUsersCount = paidMemberships.pro;
  const foundingUsersCount = paidMemberships.founding;
  const growthValue = proUsersCount + foundingUsersCount;
  const growthBreakdown = [
    {
      label: "Pro",
      value: proUsersCount,
      accent: "cyan" as const,
    },
    {
      label: "Founding",
      value: foundingUsersCount,
      accent: "violet" as const,
    },
  ];

  const performanceRows = (heartbeatsResult.data ?? []) as HeartbeatPerformanceRow[];
  const performanceAverages = {
    cpu: averageMetric(snapshot.systems.map((system) => system.cpuPercent)),
    memory: averageMetric(snapshot.systems.map((system) => system.memoryPercent)),
    disk: averageMetric(snapshot.systems.map((system) => system.diskPercent)),
  };
  const performanceChartData = buildPerformanceChartData(
    performanceRows,
    performanceAverages,
  );
  const performanceLastHeartbeatAt =
    performanceRows.at(-1)?.created_at ??
    snapshot.systems
      .map((system) => system.lastSeenAt)
      .sort((left, right) => right.localeCompare(left))
      .at(0) ??
    null;

  const recentIncidents = snapshot.incidents.slice(0, 5).map((incident) => ({
    id: incident.id,
    title: incident.title,
    severity: incident.severity,
    status: incident.status,
    source: incident.source,
    openedAt: incident.openedAt,
  }));

  const quickActions = [
    {
      label: "Ver Usuarios",
      href: "/users",
      icon: "group",
    },
    {
      label: "Incidentes",
      href: "/incidents",
      icon: "warning",
    },
    {
      label: "Sistemas",
      href: "/systems",
      icon: "dns",
    },
    {
      label: "Database",
      href: "/database",
      icon: "storage",
    },
  ];

  const dashboardProps = {
    title: "Dashboard Principal",
    subtitle: "Operational overview and global user metrics.",
    stats,
    apiStatuses,
    growthValue,
    growthLabel: "Usuarios com plano Pro ou Founding",
    growthMetaLabel: `${formatCompactNumber(proUsersCount)} Pro • ${formatCompactNumber(foundingUsersCount)} Founding`,
    growthBreakdown,
    activeUsers,
    activeUsersLabel: `atividade nos ultimos ${ONLINE_WINDOW_MINUTES} min`,
    peakToday,
    maxCapacity,
    avatars,
    performance: {
      averages: performanceAverages,
      chartData: performanceChartData,
      monitoredNodes: snapshot.systems.length,
      lastHeartbeatAt: performanceLastHeartbeatAt,
    },
    incidents: recentIncidents,
    quickActions,
  } as const;

  return (
    <main className="pt-24 pb-12 pl-64 pr-8 lg:pr-12 min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-8">
        <DashboardBento {...dashboardProps} />
      </div>
    </main>
  );
}
