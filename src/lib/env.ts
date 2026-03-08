export function getCommandCenterEnv() {
  const productSupabaseUrl =
    process.env.PRODUCT_SUPABASE_URL?.trim() ??
    process.env.SOURCE_SUPABASE_URL?.trim() ??
    "";
  const productSupabaseServiceRoleKey =
    process.env.PRODUCT_SUPABASE_SERVICE_ROLE_KEY?.trim() ??
    process.env.SOURCE_SUPABASE_SERVICE_ROLE_KEY?.trim() ??
    "";

  const env = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "",
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "",
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "",
    productSupabaseUrl,
    productSupabaseServiceRoleKey,
    telemetryIngestToken: process.env.TELEMETRY_INGEST_TOKEN?.trim() ?? "",
    appUrl: process.env.NEXT_PUBLIC_APP_URL?.trim() ?? "http://localhost:3000",
  };

  return {
    ...env,
    hasSupabase: Boolean(env.supabaseUrl && env.supabaseAnonKey),
    hasAdmin: Boolean(env.supabaseUrl && env.supabaseServiceRoleKey),
    hasProductSource: Boolean(
      env.productSupabaseUrl && env.productSupabaseServiceRoleKey,
    ),
    hasTelemetryToken: Boolean(env.telemetryIngestToken),
  };
}
