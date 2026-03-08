import { NextResponse } from "next/server";
import { canEditOps, getAdminAccess } from "@/lib/auth";
import { writeAuditLog } from "@/lib/admin-ops";
import { getCommandCenterEnv } from "@/lib/env";
import { incidentPayloadSchema } from "@/lib/schemas";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

function buildIncidentContext(payload: {
  profileId?: string | null;
  instanceId?: string | null;
  platform?: string | null;
  version?: string | null;
}) {
  return {
    ...(payload.profileId ? { profileId: payload.profileId } : {}),
    ...(payload.instanceId ? { instanceId: payload.instanceId } : {}),
    ...(payload.platform ? { platform: payload.platform } : {}),
    ...(payload.version ? { version: payload.version } : {}),
  };
}

export async function POST(request: Request) {
  const access = await getAdminAccess();
  if (!access?.profile) {
    return NextResponse.json(
      { ok: false, message: "Sessao administrativa ausente ou expirada." },
      { status: 401 },
    );
  }

  if (!canEditOps(access.profile.role)) {
    return NextResponse.json(
      {
        ok: false,
        message: "Seu papel atual nao permite registrar incidentes operacionais.",
      },
      { status: 403 },
    );
  }

  const env = getCommandCenterEnv();
  const admin = createSupabaseAdminClient();
  if (!env.hasAdmin || !admin) {
    return NextResponse.json(
      {
        ok: false,
        message: "SUPABASE_SERVICE_ROLE_KEY ausente. Nao e possivel persistir incidentes.",
      },
      { status: 503 },
    );
  }

  const payloadResult = incidentPayloadSchema.safeParse(await request.json());
  if (!payloadResult.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "Payload de incidente invalido.",
        issues: payloadResult.error.flatten(),
      },
      { status: 400 },
    );
  }

  const payload = payloadResult.data;
  const now = new Date().toISOString();
  const context = buildIncidentContext(payload);

  const { data, error } = await admin
    .from("ops_incidents")
    .insert({
      severity: payload.severity,
      title: payload.title,
      source: payload.source,
      status: payload.status,
      summary: payload.summary,
      suggested_action: payload.suggestedAction,
      resolved_at: payload.status === "resolved" ? now : null,
      context,
      updated_at: now,
    })
    .select("id")
    .single<{ id: string }>();

  if (error || !data) {
    return NextResponse.json(
      {
        ok: false,
        message: "Falha ao criar o incidente operacional.",
        detail: error?.message,
      },
      { status: 500 },
    );
  }

  await writeAuditLog(admin, {
    actorId: access.user.id,
    action: "ops.incident.create",
    entityType: "ops_incidents",
    entityId: data.id,
    summary: `Incidente ${payload.title} criado com severidade ${payload.severity}.`,
    metadata: context,
  });

  return NextResponse.json({ ok: true, incidentId: data.id, savedAt: now });
}
