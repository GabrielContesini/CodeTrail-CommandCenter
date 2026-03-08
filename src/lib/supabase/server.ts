import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { getCommandCenterEnv } from "@/lib/env";

export async function createSupabaseServerClient() {
  const env = getCommandCenterEnv();
  if (!env.hasSupabase) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components may not persist mutated cookies; middleware keeps
          // the auth session refreshed across requests.
        }
      },
    },
  });
}

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

export function createProductSourceAdminClient() {
  const env = getCommandCenterEnv();
  if (!env.hasProductSource) {
    return null;
  }

  return createClient(
    env.productSupabaseUrl,
    env.productSupabaseServiceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
