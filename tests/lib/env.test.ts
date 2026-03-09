import { afterEach, describe, expect, it, vi } from "vitest";

const originalEnv = { ...process.env };

describe("getCommandCenterEnv", () => {
  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  it("normalizes Vercel urls when NEXT_PUBLIC_APP_URL is absent", async () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: "https://ops.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
      SUPABASE_SERVICE_ROLE_KEY: "service",
      PRODUCT_SUPABASE_URL: "https://product.supabase.co",
      PRODUCT_SUPABASE_SERVICE_ROLE_KEY: "product-service",
      TELEMETRY_INGEST_TOKEN: "token",
      VERCEL_URL: "codetrail-command-center.vercel.app",
    };

    const { getCommandCenterEnv } = await import("@/lib/env");
    const env = getCommandCenterEnv();

    expect(env.appUrl).toBe("https://codetrail-command-center.vercel.app");
    expect(env.hasSupabase).toBe(true);
    expect(env.hasAdmin).toBe(true);
    expect(env.hasProductSource).toBe(true);
    expect(env.hasTelemetryToken).toBe(true);
  });

  it("supports SOURCE_* aliases for the product connection", async () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: "https://ops.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
      SOURCE_SUPABASE_URL: "https://source.supabase.co",
      SOURCE_SUPABASE_SERVICE_ROLE_KEY: "source-service",
    };

    const { getCommandCenterEnv } = await import("@/lib/env");
    const env = getCommandCenterEnv();

    expect(env.productSupabaseUrl).toBe("https://source.supabase.co");
    expect(env.productSupabaseServiceRoleKey).toBe("source-service");
    expect(env.hasProductSource).toBe(true);
    expect(env.appUrl).toBe("http://localhost:3000");
  });
});
