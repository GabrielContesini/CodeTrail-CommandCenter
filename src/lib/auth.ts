import { redirect } from "next/navigation";
import { getCommandCenterEnv } from "@/lib/env";
import type { AdminRole } from "@/lib/types";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";

type AdminProfileRow = {
  display_name: string;
  role: AdminRole;
};

export type AdminAccess = {
  user: {
    id: string;
    email: string | null;
  };
  profile: {
    displayName: string;
    role: AdminRole;
  } | null;
  reason?: "signed_out" | "misconfigured" | "unauthorized";
};

export function canEditOps(role: AdminRole) {
  return role === "owner" || role === "admin" || role === "operator";
}

export function canManageAdmins(role: AdminRole) {
  return role === "owner";
}

export async function getAdminAccess(): Promise<AdminAccess | null> {
  const env = getCommandCenterEnv();
  if (!env.hasSupabase) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const baseAccess: AdminAccess = {
    user: {
      id: user.id,
      email: user.email ?? null,
    },
    profile: null,
  };

  const adminClient = createSupabaseAdminClient();
  const profileSource = adminClient ?? supabase;
  const { data: profile } = await profileSource
    .from("ops_admin_profiles")
    .select("display_name, role")
    .eq("id", user.id)
    .maybeSingle<AdminProfileRow>();

  if (!profile) {
    return {
      ...baseAccess,
      reason: "unauthorized",
    };
  }

  return {
    ...baseAccess,
    profile: {
      displayName: profile.display_name,
      role: profile.role,
    },
  };
}

export async function requireAdminAccess() {
  const env = getCommandCenterEnv();
  if (!env.hasSupabase) {
    redirect("/login?reason=misconfigured");
  }

  const access = await getAdminAccess();
  if (access?.profile) {
    return access;
  }

  const reason = access?.reason ?? "signed_out";
  redirect(`/login?reason=${reason}`);
}
