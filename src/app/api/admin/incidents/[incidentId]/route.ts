import { NextResponse } from "next/server";
import { canEditOps, getAdminAccess } from "@/lib/auth";
import { getIncidentById, writeAuditLog } from "@/lib/admin-ops";
import { getCommandCenterEnv } from "@/lib/env";
import { incidentPayloadSchema } from "@/lib/schemas";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

type Params = Promise<{ incidentId: string }>;

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

export async function PATCH(
  request: Request,
  { params }: { params: Params },
) {
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
        message: "Seu papel atual nao permite editar incidentes operacionais.",
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
        message: "SUPABASE_SERVICE_ROLE_KEY ausente. Nao e possivel editar incidentes.",
      },
      { status: 503 },
    );
  }

  const { incidentId } = await params;
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

  const current = await getIncidentById(admin, incidentId);
  if (!current) {
    return NextResponse.json(
      { ok: false, message: "Incidente nao encontrado." },
      { status: 404 },
    );
  }

  const payload = payloadResult.data;
  const now = new Date().toISOString();
  const context = buildIncidentContext(payload);
  const { error } = await admin
    .from("ops_incidents")
    .update({
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
    .eq("id", incidentId);

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        message: "Falha ao atualizar o incidente operacional.",
        detail: error.message,
      },
      { status: 500 },
    );
  }

  await writeAuditLog(admin, {
    actorId: access.user.id,
    action: "ops.incident.update",
    entityType: "ops_incidents",
    entityId: incidentId,
    summary: `Incidente ${payload.title} atualizado para ${payload.status}.`,
    metadata: {
      previousStatus: current.status,
      nextStatus: payload.status,
      context,
    },
  });

  return NextResponse.json({ ok: true, savedAt: now });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Params },
) {
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
        message: "Seu papel atual nao permite remover incidentes operacionais.",
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
        message: "SUPABASE_SERVICE_ROLE_KEY ausente. Nao e possivel remover incidentes.",
      },
      { status: 503 },
    );
  }

  const { incidentId } = await params;
  const current = await getIncidentById(admin, incidentId);
  if (!current) {
    return NextResponse.json(
      { ok: false, message: "Incidente nao encontrado." },
      { status: 404 },
    );
  }

  const { error } = await admin.from("ops_incidents").delete().eq("id", incidentId);
  if (error) {
    return NextResponse.json(
      {
        ok: false,
        message: "Falha ao remover o incidente operacional.",
        detail: error.message,
      },
      { status: 500 },
    );
  }

  await writeAuditLog(admin, {
    actorId: access.user.id,
    action: "ops.incident.delete",
    entityType: "ops_incidents",
    entityId: incidentId,
    summary: `Incidente ${current.title} removido do painel.`,
    metadata: {
      previousStatus: current.status,
    },
  });

  return NextResponse.json({ ok: true, deletedAt: new Date().toISOString() });
}
