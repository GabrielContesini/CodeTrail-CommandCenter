import { createClient } from "@supabase/supabase-js";
import { getCommandCenterEnv } from "@/lib/env";

export function createSupabaseAdminClient() {
  const env = getCommandCenterEnv();
  if (!env.hasAdmin) {
    return null;
  }

  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
