import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getCommandCenterEnv } from "@/lib/env";

let browserClient: SupabaseClient | null = null;

export function createSupabaseBrowserClient() {
  if (browserClient) {
    return browserClient;
  }

  const env = getCommandCenterEnv();
  if (!env.hasSupabase) {
    throw new Error("Supabase publico nao configurado para o Command Center.");
  }

  browserClient = createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
  return browserClient;
}
