import type { AdminRole } from "@/lib/types";
import { z } from "zod";

const adminRoleOptions = [
  "owner",
  "admin",
  "operator",
  "viewer",
] as const satisfies readonly AdminRole[];

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

export const adminMemberCreatePayloadSchema = z.object({
  email: z.email().max(160),
  displayName: z.string().trim().min(2).max(120).optional(),
  role: z.enum(adminRoleOptions),
});

export const adminMemberUpdatePayloadSchema = z.object({
  displayName: z.string().trim().min(2).max(120),
  role: z.enum(adminRoleOptions),
});

export const bootstrapOwnerPayloadSchema = z.object({
  email: z.email().max(160),
  password: z.string().min(8).max(128),
  displayName: z.string().trim().min(2).max(120),
});

export const productUserUpdatePayloadSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
});

export const productUserBanPayloadSchema = z.object({
  banned: z.boolean(),
});

export const productUserSubscriptionPayloadSchema = z.object({
  planCode: z.string().trim().min(1).max(64),
});

export const incidentPayloadSchema = z.object({
  title: z.string().trim().min(4).max(180),
  severity: z.enum(["info", "warning", "critical"]),
  source: z.string().trim().min(2).max(120),
  status: z.enum(["open", "investigating", "mitigated", "resolved"]),
  summary: z.string().trim().min(8).max(1200),
  suggestedAction: z.string().trim().max(1000).default(""),
  profileId: z.uuid().nullable().optional(),
  instanceId: z.uuid().nullable().optional(),
  platform: z.enum(["android", "windows", "web", "api"]).nullable().optional(),
  version: z.string().trim().max(64).nullable().optional(),
});
