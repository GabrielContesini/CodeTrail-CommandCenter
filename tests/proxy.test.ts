import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const createServerClient = vi.fn();
const getCommandCenterEnv = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient,
}));

vi.mock("@/lib/env", () => ({
  getCommandCenterEnv,
}));

describe("proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("redirects protected routes to login when Supabase is misconfigured", async () => {
    getCommandCenterEnv.mockReturnValue({
      hasSupabase: false,
    });

    const { proxy } = await import("@/proxy");

    const response = await proxy(
      new NextRequest("http://localhost/incidents"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost/login?reason=misconfigured",
    );
    expect(createServerClient).not.toHaveBeenCalled();
  });

  it("allows public routes without Supabase", async () => {
    getCommandCenterEnv.mockReturnValue({
      hasSupabase: false,
    });

    const { proxy } = await import("@/proxy");

    const response = await proxy(new NextRequest("http://localhost/login"));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
    expect(createServerClient).not.toHaveBeenCalled();
  });

  it("redirects signed out users away from protected routes", async () => {
    getCommandCenterEnv.mockReturnValue({
      hasSupabase: true,
      supabaseUrl: "https://ops.example.com",
      supabaseAnonKey: "anon-key",
    });
    createServerClient.mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: null,
          },
        }),
      },
    });

    const { proxy } = await import("@/proxy");

    const response = await proxy(
      new NextRequest("http://localhost/users/user-1"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost/login?reason=signed_out",
    );
    expect(createServerClient).toHaveBeenCalledOnce();
  });

  it("allows authenticated users through the shell", async () => {
    getCommandCenterEnv.mockReturnValue({
      hasSupabase: true,
      supabaseUrl: "https://ops.example.com",
      supabaseAnonKey: "anon-key",
    });
    createServerClient.mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: "ops-1",
            },
          },
        }),
      },
    });

    const { proxy } = await import("@/proxy");

    const response = await proxy(new NextRequest("http://localhost/admin"));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
    expect(createServerClient).toHaveBeenCalledOnce();
  });
});
