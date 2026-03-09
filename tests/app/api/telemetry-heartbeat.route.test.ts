import { beforeEach, describe, expect, it, vi } from "vitest";
import { readJson } from "../../helpers/response";

const getCommandCenterEnv = vi.fn();
const createSupabaseAdminClient = vi.fn();

vi.mock("@/lib/env", () => ({
  getCommandCenterEnv,
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseAdminClient,
}));

describe("POST /api/telemetry/heartbeat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 503 when admin telemetry is unavailable", async () => {
    getCommandCenterEnv.mockReturnValue({
      hasAdmin: false,
      hasTelemetryToken: false,
    });
    createSupabaseAdminClient.mockReturnValue(null);

    const { POST } = await import("@/app/api/telemetry/heartbeat/route");

    const response = await POST(
      new Request("http://localhost/api/telemetry/heartbeat", {
        method: "POST",
        body: JSON.stringify({}),
      }),
    );
    const body = await readJson<{ ok: boolean; message: string }>(response);

    expect(response.status).toBe(503);
    expect(body.ok).toBe(false);
  });

  it("returns 401 when the ingest token is invalid", async () => {
    getCommandCenterEnv.mockReturnValue({
      hasAdmin: true,
      hasTelemetryToken: true,
      telemetryIngestToken: "expected-token",
    });
    createSupabaseAdminClient.mockReturnValue({});

    const { POST } = await import("@/app/api/telemetry/heartbeat/route");

    const response = await POST(
      new Request("http://localhost/api/telemetry/heartbeat", {
        method: "POST",
        headers: {
          authorization: "Bearer wrong-token",
        },
        body: JSON.stringify({}),
      }),
    );
    const body = await readJson<{ ok: boolean; message: string }>(response);

    expect(response.status).toBe(401);
    expect(body.message).toContain("Token de ingest invalido");
  });

  it("returns 400 when the payload is invalid", async () => {
    getCommandCenterEnv.mockReturnValue({
      hasAdmin: true,
      hasTelemetryToken: true,
      telemetryIngestToken: "expected-token",
    });
    createSupabaseAdminClient.mockReturnValue({});

    const { POST } = await import("@/app/api/telemetry/heartbeat/route");

    const response = await POST(
      new Request("http://localhost/api/telemetry/heartbeat", {
        method: "POST",
        headers: {
          "x-ingest-token": "expected-token",
        },
        body: JSON.stringify({
          instanceId: "short",
          platform: "desktop",
        }),
      }),
    );
    const body = await readJson<{
      ok: boolean;
      issues: { fieldErrors: Record<string, string[]> };
    }>(response);

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.issues.fieldErrors.platform).toBeDefined();
  });

  it("returns 500 when instance upsert fails", async () => {
    const upsert = vi.fn().mockResolvedValue({
      error: {
        message: "write failed",
      },
    });
    const from = vi.fn((table: string) => {
      if (table === "ops_app_instances") {
        return { upsert };
      }

      throw new Error(`Unexpected table ${table}`);
    });

    getCommandCenterEnv.mockReturnValue({
      hasAdmin: true,
      hasTelemetryToken: true,
      telemetryIngestToken: "expected-token",
    });
    createSupabaseAdminClient.mockReturnValue({ from });

    const { POST } = await import("@/app/api/telemetry/heartbeat/route");

    const response = await POST(
      new Request("http://localhost/api/telemetry/heartbeat", {
        method: "POST",
        headers: {
          authorization: "Bearer expected-token",
        },
        body: JSON.stringify(validPayload()),
      }),
    );
    const body = await readJson<{ ok: boolean; detail: string }>(response);

    expect(response.status).toBe(500);
    expect(body.ok).toBe(false);
    expect(body.detail).toBe("write failed");
  });

  it("persists instance and heartbeat when the payload is valid", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const single = vi.fn().mockResolvedValue({
      data: { id: "instance-row-1" },
      error: null,
    });
    const eq = vi.fn(() => ({ single }));
    const select = vi.fn(() => ({ eq }));
    const insert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn((table: string) => {
      if (table === "ops_app_instances") {
        return {
          upsert,
          select,
        };
      }

      if (table === "ops_heartbeats") {
        return {
          insert,
        };
      }

      throw new Error(`Unexpected table ${table}`);
    });

    getCommandCenterEnv.mockReturnValue({
      hasAdmin: true,
      hasTelemetryToken: true,
      telemetryIngestToken: "expected-token",
    });
    createSupabaseAdminClient.mockReturnValue({ from });

    const { POST } = await import("@/app/api/telemetry/heartbeat/route");

    const response = await POST(
      new Request("http://localhost/api/telemetry/heartbeat", {
        method: "POST",
        headers: {
          authorization: "Bearer expected-token",
        },
        body: JSON.stringify(validPayload()),
      }),
    );
    const body = await readJson<{
      ok: boolean;
      instanceId: string;
      receivedAt: string;
    }>(response);

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.instanceId).toBe("instance-row-1");
    expect(upsert).toHaveBeenCalledOnce();
    expect(insert).toHaveBeenCalledOnce();
  });
});

function validPayload() {
  return {
    instanceId: "windows-instance-1",
    profileId: "6ce815fd-6baf-4f3b-a9eb-1e8e29b9cb26",
    platform: "windows",
    appVersion: "1.1.4+7",
    environment: "production",
    releaseChannel: "stable",
    deviceLabel: "CodeTrail Windows",
    machineName: "gabriel-desktop",
    status: "up",
    syncBacklog: 2,
    openErrors: 0,
    networkStatus: "online",
    metadata: {
      os: "windows",
    },
    payload: {
      readyItems: 2,
      blockedItems: 0,
    },
  };
}
