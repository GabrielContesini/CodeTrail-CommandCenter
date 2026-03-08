import type { SupabaseClient } from "@supabase/supabase-js";

type AdminClient = NonNullable<SupabaseClient>;

export type AuthUserSummary = {
  id: string;
  email: string | null;
  lastSignInAt: string | null;
  displayName: string | null;
};

export async function listAllAuthUsers(
  client: AdminClient,
  {
    perPage = 200,
    maxPages = 10,
  }: {
    perPage?: number;
    maxPages?: number;
  } = {},
) {
  const users: AuthUserSummary[] = [];

  for (let page = 1; page <= maxPages; page += 1) {
    const { data, error } = await client.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw error;
    }

    const batch =
      data.users?.map<AuthUserSummary>((user) => ({
        id: user.id,
        email: user.email ?? null,
        lastSignInAt: user.last_sign_in_at ?? null,
        displayName:
          (typeof user.user_metadata?.full_name === "string"
            ? user.user_metadata.full_name
            : null) ??
          (typeof user.user_metadata?.name === "string"
            ? user.user_metadata.name
            : null),
      })) ?? [];

    users.push(...batch);

    if (batch.length < perPage) {
      break;
    }
  }

  return users;
}

export async function findAuthUserByEmail(
  client: AdminClient,
  email: string,
) {
  const normalized = email.trim().toLowerCase();
  const users = await listAllAuthUsers(client);
  return (
    users.find((user) => user.email?.toLowerCase() === normalized) ?? null
  );
}

export async function countOwners(client: AdminClient) {
  const { count, error } = await client
    .from("ops_admin_profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "owner");

  if (error) {
    throw error;
  }

  return count ?? 0;
}

export async function writeAuditLog(
  client: AdminClient,
  payload: {
    actorId: string | null;
    action: string;
    entityType: string;
    entityId: string;
    summary: string;
    metadata?: Record<string, unknown>;
  },
) {
  try {
    await client.from("ops_audit_logs").insert({
      actor_id: payload.actorId,
      action: payload.action,
      entity_type: payload.entityType,
      entity_id: payload.entityId,
      summary: payload.summary,
      metadata: payload.metadata ?? {},
    });
  } catch {
    // Audit is best-effort so it must not block the operational workflow.
  }
}

export async function getIncidentById(client: AdminClient, incidentId: string) {
  const { data, error } = await client
    .from("ops_incidents")
    .select("id, severity, title, source, status, summary, suggested_action, context")
    .eq("id", incidentId)
    .maybeSingle<{
      id: string;
      severity: string;
      title: string;
      source: string;
      status: string;
      summary: string;
      suggested_action: string;
      context: Record<string, unknown> | null;
    }>();

  if (error) {
    throw error;
  }

  return data;
}
