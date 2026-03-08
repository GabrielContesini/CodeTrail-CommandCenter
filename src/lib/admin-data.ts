import { unstable_noStore as noStore } from "next/cache";
import { listAllAuthUsers } from "@/lib/admin-ops";
import { getCommandCenterEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type {
  AdminAuditEntry,
  AdminConsoleSnapshot,
  AdminMemberSnapshot,
} from "@/lib/types";

type AdminProfileRow = {
  id: string;
  display_name: string;
  role: AdminMemberSnapshot["role"];
  created_at: string;
  updated_at: string;
};

type AuditRow = {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  summary: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

// Supabase/Postgrest builder types are too specific here; a relaxed builder keeps
// the helper reusable without fighting generic inference for order/limit chains.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QueryBuilder = (query: any) => any;

async function safeSelect<T>(
  client: ReturnType<typeof createSupabaseAdminClient>,
  table: string,
  columns: string,
  builder?: QueryBuilder,
) {
  if (!client) {
    return null;
  }

  try {
    let query = client.from(table).select(columns);
    if (builder) {
      query = builder(query) as typeof query;
    }
    const { data, error } = await query;
    if (error) {
      return null;
    }
    return (data ?? []) as T[];
  } catch {
    return null;
  }
}

export async function getAdminConsoleSnapshot(): Promise<AdminConsoleSnapshot> {
  noStore();

  const env = getCommandCenterEnv();
  const admin = createSupabaseAdminClient();
  const generatedAt = new Date().toISOString();

  if (!env.hasAdmin || !admin) {
    return {
      mode: "empty",
      generatedAt,
      hasSupabase: env.hasSupabase,
      hasServiceRole: env.hasAdmin,
      hasProductSource: env.hasProductSource,
      hasTelemetryToken: env.hasTelemetryToken,
      members: [],
      audit: [],
    };
  }

  const [profiles, authUsers, auditRows] = await Promise.all([
    safeSelect<AdminProfileRow>(
      admin,
      "ops_admin_profiles",
      "id, display_name, role, created_at, updated_at",
      (query) => query.order("role").order("display_name"),
    ),
    listAllAuthUsers(admin).catch(() => []),
    safeSelect<AuditRow>(
      admin,
      "ops_audit_logs",
      "id, actor_id, action, entity_type, entity_id, summary, metadata, created_at",
      (query) => query.order("created_at", { ascending: false }).limit(20),
    ),
  ]);

  const authById = new Map(authUsers.map((user) => [user.id, user]));

  const members =
    profiles?.map<AdminMemberSnapshot>((profile) => {
      const auth = authById.get(profile.id);
      return {
        id: profile.id,
        email: auth?.email ?? "sem-email@codetrail.local",
        displayName:
          profile.display_name || auth?.displayName || "Operador sem nome",
        role: profile.role,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
        lastSignInAt: auth?.lastSignInAt ?? null,
      };
    }) ?? [];

  const audit =
    auditRows?.map<AdminAuditEntry>((entry) => {
      const actor = entry.actor_id ? authById.get(entry.actor_id) : null;
      return {
        id: entry.id,
        action: entry.action,
        entityType: entry.entity_type,
        entityId: entry.entity_id,
        summary: entry.summary,
        actorLabel:
          actor?.email ??
          actor?.displayName ??
          (entry.actor_id ? "Operador interno" : "Sistema"),
        createdAt: entry.created_at,
        metadata: entry.metadata ?? {},
      };
    }) ?? [];

  return {
    mode: "supabase",
    generatedAt,
    hasSupabase: env.hasSupabase,
    hasServiceRole: env.hasAdmin,
    hasProductSource: env.hasProductSource,
    hasTelemetryToken: env.hasTelemetryToken,
    members,
    audit,
  };
}
