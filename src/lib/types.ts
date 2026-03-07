export type DataSourceMode = "mock" | "supabase";
export type HealthStatus = "up" | "degraded" | "down";
export type RiskLevel = "healthy" | "attention" | "critical";
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
  summary: string;
  action: string;
};

export type CommandCenterSnapshot = {
  mode: DataSourceMode;
  generatedAt: string;
  metrics: MetricSnapshot[];
  activity: ActivityPoint[];
  fleet: FleetNode[];
  systems: SystemNode[];
  users: UserSnapshot[];
  database: DatabaseMetric[];
  incidents: IncidentSnapshot[];
};
