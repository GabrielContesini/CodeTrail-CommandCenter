import { beforeEach, describe, expect, it, vi } from "vitest";
import { readJson } from "../../helpers/response";

const countOwners = vi.fn();
const findAuthUserByEmail = vi.fn();
const writeAuditLog = vi.fn();
const createSupabaseAdminClient = vi.fn();

vi.mock("@/lib/admin-ops", () => ({
  countOwners,
  findAuthUserByEmail,
  writeAuditLog,
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseAdminClient,
}));

describe("POST /api/bootstrap/owner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 503 when the service role client is unavailable", async () => {
    createSupabaseAdminClient.mockReturnValue(null);
    const { POST } = await import("@/app/api/bootstrap/owner/route");

    const response = await POST(
      new Request("http://localhost/api/bootstrap/owner", {
        method: "POST",
        body: JSON.stringify({}),
      }),
    );
    const body = await readJson<{ ok: boolean; message: string }>(response);

    expect(response.status).toBe(503);
    expect(body.ok).toBe(false);
  });

  it("returns 409 when the first owner already exists", async () => {
    createSupabaseAdminClient.mockReturnValue({});
    countOwners.mockResolvedValue(1);
    const { POST } = await import("@/app/api/bootstrap/owner/route");

    const response = await POST(
      new Request("http://localhost/api/bootstrap/owner", {
        method: "POST",
        body: JSON.stringify({
          email: "owner@example.com",
          password: "12345678",
          displayName: "Owner",
        }),
      }),
    );
    const body = await readJson<{ ok: boolean; message: string }>(response);

    expect(response.status).toBe(409);
    expect(body.message).toContain("primeiro owner");
  });

  it("creates the first owner when auth and profile writes succeed", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn(() => ({ upsert }));
    const createUser = vi.fn().mockResolvedValue({
      data: {
        user: { id: "owner-1" },
      },
      error: null,
    });

    createSupabaseAdminClient.mockReturnValue({
      auth: {
        admin: {
          createUser,
          updateUserById: vi.fn(),
        },
      },
      from,
    });
    countOwners.mockResolvedValue(0);
    findAuthUserByEmail.mockResolvedValue(null);

    const { POST } = await import("@/app/api/bootstrap/owner/route");

    const response = await POST(
      new Request("http://localhost/api/bootstrap/owner", {
        method: "POST",
        body: JSON.stringify({
          email: "owner@example.com",
          password: "12345678",
          displayName: "Owner Root",
        }),
      }),
    );
    const body = await readJson<{ ok: boolean; email: string }>(response);

    expect(response.status).toBe(200);
    expect(body).toEqual({
      ok: true,
      email: "owner@example.com",
    });
    expect(createUser).toHaveBeenCalled();
    expect(upsert).toHaveBeenCalled();
    expect(writeAuditLog).toHaveBeenCalled();
  });
});
