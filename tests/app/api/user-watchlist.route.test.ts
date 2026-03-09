import { beforeEach, describe, expect, it, vi } from "vitest";
import { readJson } from "../../helpers/response";

const getAdminAccess = vi.fn();
const canEditOps = vi.fn();
const getCommandCenterEnv = vi.fn();
const writeAuditLog = vi.fn();
const createSupabaseAdminClient = vi.fn();

vi.mock("@/lib/auth", () => ({
  getAdminAccess,
  canEditOps,
}));

vi.mock("@/lib/env", () => ({
  getCommandCenterEnv,
}));

vi.mock("@/lib/admin-ops", () => ({
  writeAuditLog,
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseAdminClient,
}));

describe("POST /api/admin/user-watchlist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCommandCenterEnv.mockReturnValue({ hasAdmin: true });
  });

  it("returns 401 without an admin session", async () => {
    getAdminAccess.mockResolvedValue(null);
    const { POST } = await import("@/app/api/admin/user-watchlist/route");

    const response = await POST(
      new Request("http://localhost/api/admin/user-watchlist", {
        method: "POST",
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(401);
  });

  it("returns 403 when the current role cannot edit ops", async () => {
    getAdminAccess.mockResolvedValue({
      user: { id: "viewer-1", email: "viewer@example.com" },
      profile: { displayName: "Viewer", role: "viewer" },
    });
    canEditOps.mockReturnValue(false);
    const { POST } = await import("@/app/api/admin/user-watchlist/route");

    const response = await POST(
      new Request("http://localhost/api/admin/user-watchlist", {
        method: "POST",
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(403);
  });

  it("upserts the watchlist record and writes audit data", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn(() => ({ upsert }));

    getAdminAccess.mockResolvedValue({
      user: { id: "ops-1", email: "ops@example.com" },
      profile: { displayName: "Ops", role: "operator" },
    });
    canEditOps.mockReturnValue(true);
    createSupabaseAdminClient.mockReturnValue({ from });

    const { POST } = await import("@/app/api/admin/user-watchlist/route");

    const response = await POST(
      new Request("http://localhost/api/admin/user-watchlist", {
        method: "POST",
        body: JSON.stringify({
          profileId: "6ce815fd-6baf-4f3b-a9eb-1e8e29b9cb26",
          riskLevel: "attention",
          supportStatus: "monitoring",
          internalNote: "Backlog acima do normal.",
          nextActionAt: "2026-03-10T12:00:00.000Z",
        }),
      }),
    );
    const body = await readJson<{ ok: boolean; savedAt: string }>(response);

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(upsert).toHaveBeenCalled();
    expect(writeAuditLog).toHaveBeenCalled();
  });
});
