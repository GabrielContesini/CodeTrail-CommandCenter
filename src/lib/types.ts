export type DataSourceMode = "empty" | "supabase";
export type HealthStatus = "up" | "degraded" | "down";
export type RiskLevel = "healthy" | "attention" | "critical";
export type AdminRole = "owner" | "admin" | "operator" | "viewer";
export type SupportStatus =
  | "stable"
  | "monitoring"
  | "needs_follow_up"
  | "escalated";
export type PlatformKey = "android" | "windows" | "web" | "api";
export type IncidentSeverity = "info" | "warning" | "critical";
export type IncidentStatus = "open" | "investigating" | "mitigated" | "resolved";

export type MetricSnapshot = {
  label: string;
  value: string;
  delta: string;
  hint: string;
  tone?: "neutral" | "good" | "warning" | "critical";
};

export type ActivityPoint = {
  label: string;
  sessions: number;
  activeUsers: number;
  syncBacklog: number;
  errors: number;
};

export type FleetNode = {
  id: string;
  label: string;
  platform: PlatformKey;
  status: HealthStatus;
  version: string;
  environment: string;
  lastSeenAt: string;
  activeUsers: number;
  pendingSync: number;
  uptimePercent: number;
};

export type SystemNode = {
  id: string;
  machineName: string;
  status: HealthStatus;
  appVersion: string;
  cpuPercent: number;
  memoryPercent: number;
  diskPercent: number;
  networkStatus: string;
  lastSeenAt: string;
  appUptimeHours: number;
  osUptimeHours: number;
  environment: string;
};

export type UserSnapshot = {
  id: string;
  name: string;
  email: string;
  desiredArea: string;
  trackName: string;
  onboardingCompleted: boolean;
  lastSeenAt: string;
  activeStreak: number;
  weeklyHours: number;
  pendingSync: number;
  riskLevel: RiskLevel;
  supportStatus: SupportStatus;
  internalNote: string;
  nextActionAt?: string | null;
};

export type DatabaseMetric = {
  tableName: string;
  label: string;
  rowCount: number;
  description: string;
  health: "healthy" | "attention";
};

export type IncidentSnapshot = {
  id: string;
  severity: IncidentSeverity;
  title: string;
  source: string;
  status: IncidentStatus;
  openedAt: string;
  resolvedAt?: string | null;
  summary: string;
  action: string;
  context?: {
    profileId?: string | null;
    instanceId?: string | null;
    platform?: PlatformKey | null;
    version?: string | null;
  };
};

export type PlatformSnapshot = {
  platform: PlatformKey;
  instances: number;
  uniqueVersions: number;
  activeUsers: number;
  pendingSync: number;
  degradedNodes: number;
  latestSeenAt: string | null;
};

export type ReleaseSnapshot = {
  id: string;
  platform: PlatformKey;
  version: string;
  instances: number;
  activeUsers: number;
  pendingSync: number;
  health: HealthStatus;
  environments: string[];
  lastSeenAt: string;
};

export type UserRecentSession = {
  id: string;
  type: string;
  startTime: string;
  durationMinutes: number;
  productivityScore: number;
  notes: string;
};

export type UserRecentTask = {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  updatedAt: string;
};

export type UserRecentReview = {
  id: string;
  title: string;
  status: string;
  scheduledFor: string;
  intervalLabel: string;
};

export type UserRecentNote = {
  id: string;
  title: string;
  folderName: string;
  updatedAt: string;
};

export type UserSyncItem = {
  id: string;
  tableName: string;
  action: "upsert" | "delete";
  attempts: number;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UserTimelineEntry = {
  id: string;
  kind:
    | "session"
    | "task"
    | "review"
    | "note"
    | "sync"
    | "incident"
    | "watchlist"
    | "device";
  title: string;
  summary: string;
  happenedAt: string;
  tone: "neutral" | "good" | "warning" | "critical";
  status?: string;
};

export type UserGoalSnapshot = {
  primaryGoal: string;
  focusType: string;
  deadline: string;
  hoursPerDay: number;
  daysPerWeek: number;
  generatedPlan: string;
};

export type UserDetailSnapshot = {
  user: UserSnapshot;
  goal: UserGoalSnapshot | null;
  recentSessions: UserRecentSession[];
  recentTasks: UserRecentTask[];
  recentReviews: UserRecentReview[];
  recentNotes: UserRecentNote[];
  syncItems: UserSyncItem[];
  linkedInstances: FleetNode[];
  relatedIncidents: IncidentSnapshot[];
  timeline: UserTimelineEntry[];
};

export type AdminMemberSnapshot = {
  id: string;
  email: string;
  displayName: string;
  role: AdminRole;
  createdAt: string;
  updatedAt: string;
  lastSignInAt: string | null;
};

export type AdminAuditEntry = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  actorLabel: string;
  createdAt: string;
  metadata: Record<string, unknown>;
};

export type AdminConsoleSnapshot = {
  mode: DataSourceMode;
  generatedAt: string;
  hasSupabase: boolean;
  hasServiceRole: boolean;
  hasProductSource: boolean;
  hasTelemetryToken: boolean;
  members: AdminMemberSnapshot[];
  audit: AdminAuditEntry[];
};

export type CommandCenterSnapshot = {
  mode: DataSourceMode;
  generatedAt: string;
  metrics: MetricSnapshot[];
  activity: ActivityPoint[];
  fleet: FleetNode[];
  platforms: PlatformSnapshot[];
  releases: ReleaseSnapshot[];
  systems: SystemNode[];
  users: UserSnapshot[];
  database: DatabaseMetric[];
  incidents: IncidentSnapshot[];
};
