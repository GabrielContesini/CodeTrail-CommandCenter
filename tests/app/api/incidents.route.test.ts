import { beforeEach, describe, expect, it, vi } from "vitest";
import { readJson } from "../../helpers/response";

const getAdminAccess = vi.fn();
const canEditOps = vi.fn();
const getCommandCenterEnv = vi.fn();
const writeAuditLog = vi.fn();
const getIncidentById = vi.fn();
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
  getIncidentById,
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseAdminClient,
}));

describe("incident routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCommandCenterEnv.mockReturnValue({ hasAdmin: true });
    getAdminAccess.mockResolvedValue({
      user: { id: "ops-1", email: "ops@example.com" },
      profile: { displayName: "Ops", role: "operator" },
    });
    canEditOps.mockReturnValue(true);
  });

  it("creates incidents through POST /api/admin/incidents", async () => {
    const single = vi.fn().mockResolvedValue({
      data: { id: "incident-1" },
      error: null,
    });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    const from = vi.fn(() => ({ insert }));
    createSupabaseAdminClient.mockReturnValue({ from });

    const { POST } = await import("@/app/api/admin/incidents/route");

    const response = await POST(
      new Request("http://localhost/api/admin/incidents", {
        method: "POST",
        body: JSON.stringify({
          title: "Fila de sync travada",
          severity: "warning",
          source: "Sync pipeline",
          status: "open",
          summary: "Backlog acima do esperado na release atual.",
          suggestedAction: "Forcar nova rodada de retries.",
          platform: "windows",
          version: "1.1.4+7",
        }),
      }),
    );
    const body = await readJson<{ ok: boolean; incidentId: string }>(response);

    expect(response.status).toBe(200);
    expect(body.incidentId).toBe("incident-1");
    expect(insert).toHaveBeenCalled();
    expect(writeAuditLog).toHaveBeenCalled();
  });

  it("updates incidents through PATCH /api/admin/incidents/[incidentId]", async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn(() => ({ eq }));
    const from = vi.fn(() => ({ update }));
    createSupabaseAdminClient.mockReturnValue({ from });
    getIncidentById.mockResolvedValue({
      id: "incident-1",
      title: "Fila de sync travada",
      status: "open",
    });

    const { PATCH } = await import(
      "@/app/api/admin/incidents/[incidentId]/route"
    );

    const response = await PATCH(
      new Request("http://localhost/api/admin/incidents/incident-1", {
        method: "PATCH",
        body: JSON.stringify({
          title: "Fila de sync estabilizada",
          severity: "warning",
          source: "Sync pipeline",
          status: "mitigated",
          summary: "O backlog caiu depois dos retries.",
          suggestedAction: "Seguir monitorando a fila.",
          profileId: "6ce815fd-6baf-4f3b-a9eb-1e8e29b9cb26",
        }),
      }),
      { params: Promise.resolve({ incidentId: "incident-1" }) },
    );
    const body = await readJson<{ ok: boolean; savedAt: string }>(response);

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(update).toHaveBeenCalled();
    expect(writeAuditLog).toHaveBeenCalled();
  });

  it("deletes incidents through DELETE /api/admin/incidents/[incidentId]", async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const deleteFn = vi.fn(() => ({ eq }));
    const from = vi.fn(() => ({ delete: deleteFn }));
    createSupabaseAdminClient.mockReturnValue({ from });
    getIncidentById.mockResolvedValue({
      id: "incident-1",
      title: "Fila de sync travada",
      status: "open",
    });

    const { DELETE } = await import(
      "@/app/api/admin/incidents/[incidentId]/route"
    );

    const response = await DELETE(
      new Request("http://localhost/api/admin/incidents/incident-1", {
        method: "DELETE",
      }),
      { params: Promise.resolve({ incidentId: "incident-1" }) },
    );
    const body = await readJson<{ ok: boolean; deletedAt: string }>(response);

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(deleteFn).toHaveBeenCalled();
    expect(writeAuditLog).toHaveBeenCalled();
  });
});
