import { clsx } from "clsx";
import type {
  HealthStatus,
  IncidentSeverity,
  PlatformKey,
  RiskLevel,
  SupportStatus,
} from "@/lib/types";

export function cn(...values: Array<string | false | null | undefined>) {
  return clsx(values);
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    notation: "compact",
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  }).format(value);
}

export function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export function formatDurationMinutes(value: number) {
  if (value < 60) {
    return `${value}min`;
  }

  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return minutes ? `${hours}h ${minutes}min` : `${hours}h`;
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatRelativeTime(value?: string | null) {
  if (!value) {
    return "sem atividade";
  }

  const target = new Date(value).getTime();
  const diffMs = target - Date.now();
  const diffMinutes = Math.round(diffMs / 60000);
  const rtf = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

  if (Math.abs(diffMinutes) < 60) {
    return rtf.format(diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 48) {
    return rtf.format(diffHours, "hour");
  }

  const diffDays = Math.round(diffHours / 24);
  return rtf.format(diffDays, "day");
}

export function platformLabel(platform: PlatformKey) {
  switch (platform) {
    case "android":
      return "Android";
    case "windows":
      return "Windows";
    case "web":
      return "Web";
    case "api":
      return "API";
    default:
      return platform;
  }
}

export function statusTone(
  value: HealthStatus | IncidentSeverity | RiskLevel | SupportStatus | string,
) {
  switch (value) {
    case "up":
    case "healthy":
    case "stable":
    case "info":
      return "good";
    case "degraded":
    case "warning":
    case "attention":
    case "monitoring":
      return "warning";
    case "down":
    case "critical":
    case "needs_follow_up":
    case "escalated":
      return "critical";
    default:
      return "neutral";
  }
}

export function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function isoDayKey(date: Date | string) {
  return new Date(date).toISOString().slice(0, 10);
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
