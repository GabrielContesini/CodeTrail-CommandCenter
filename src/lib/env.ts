function normalizeAppUrl(value?: string | null) {
  const normalized = value?.trim() ?? "";
  if (!normalized) {
    return "";
  }

  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return normalized;
  }

  return `https://${normalized}`;
}

export function getCommandCenterEnv() {
  const productSupabaseUrl =
    process.env.PRODUCT_SUPABASE_URL?.trim() ??
    process.env.SOURCE_SUPABASE_URL?.trim() ??
    "";
  const productSupabaseServiceRoleKey =
    process.env.PRODUCT_SUPABASE_SERVICE_ROLE_KEY?.trim() ??
    process.env.SOURCE_SUPABASE_SERVICE_ROLE_KEY?.trim() ??
    "";
  const productAppUrl =
    normalizeAppUrl(process.env.PRODUCT_APP_URL) ||
    normalizeAppUrl(process.env.CODETRAIL_WEB_APP_URL) ||
    normalizeAppUrl(process.env.NEXT_PUBLIC_PRODUCT_APP_URL) ||
    "";

  const appUrl =
    normalizeAppUrl(process.env.NEXT_PUBLIC_APP_URL) ||
    normalizeAppUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
    normalizeAppUrl(process.env.VERCEL_URL) ||
    "http://localhost:3000";

  const env = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "",
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "",
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "",
    productSupabaseUrl,
    productSupabaseServiceRoleKey,
    productAppUrl,
    telemetryIngestToken: process.env.TELEMETRY_INGEST_TOKEN?.trim() ?? "",
    appUrl,
  };

  return {
    ...env,
    hasSupabase: Boolean(env.supabaseUrl && env.supabaseAnonKey),
    hasAdmin: Boolean(env.supabaseUrl && env.supabaseServiceRoleKey),
    hasProductSource: Boolean(
      env.productSupabaseUrl && env.productSupabaseServiceRoleKey,
    ),
    hasProductApp: Boolean(env.productAppUrl),
    hasTelemetryToken: Boolean(env.telemetryIngestToken),
  };
}
