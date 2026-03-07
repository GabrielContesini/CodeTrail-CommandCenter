import { z } from "zod";

export const watchlistPayloadSchema = z.object({
  profileId: z.string().uuid(),
  riskLevel: z.enum(["healthy", "attention", "critical"]),
  supportStatus: z.enum([
    "stable",
    "monitoring",
    "needs_follow_up",
    "escalated",
  ]),
  internalNote: z.string().max(600).default(""),
  nextActionAt: z.string().datetime().nullable().optional(),
});

export const heartbeatPayloadSchema = z.object({
  instanceId: z.string().min(3).max(120),
  profileId: z.string().uuid().nullable().optional(),
  platform: z.enum(["android", "windows", "web", "api"]),
  appVersion: z.string().min(1).max(64),
  environment: z.string().min(1).max(64).default("production"),
  releaseChannel: z.string().max(64).default("stable"),
  deviceLabel: z.string().max(120).nullable().optional(),
  machineName: z.string().max(120).nullable().optional(),
  status: z.enum(["up", "degraded", "down"]).default("up"),
  syncBacklog: z.number().int().min(0).max(5000).default(0),
  openErrors: z.number().int().min(0).max(5000).default(0),
  cpuPercent: z.number().min(0).max(100).nullable().optional(),
  memoryPercent: z.number().min(0).max(100).nullable().optional(),
  diskPercent: z.number().min(0).max(100).nullable().optional(),
  appUptimeSeconds: z.number().int().min(0).nullable().optional(),
  osUptimeSeconds: z.number().int().min(0).nullable().optional(),
  networkStatus: z.string().max(32).default("online"),
  metadata: z.record(z.string(), z.unknown()).default({}),
  payload: z.record(z.string(), z.unknown()).default({}),
});
