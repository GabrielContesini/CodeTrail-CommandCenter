import { NextResponse } from "next/server";
import { canEditOps, getAdminAccess } from "@/lib/auth";
import { writeAuditLog } from "@/lib/admin-ops";
import { getCommandCenterEnv } from "@/lib/env";
import { watchlistPayloadSchema } from "@/lib/schemas";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const access = await getAdminAccess();
  if (!access?.profile) {
    return NextResponse.json(
      {
        ok: false,
        message: "Sessao administrativa ausente ou expirada.",
      },
      { status: 401 },
    );
  }

  if (!canEditOps(access.profile.role)) {
    return NextResponse.json(
      {
        ok: false,
        message: "Seu papel atual nao permite editar a watchlist operacional.",
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
        message:
          "SUPABASE_SERVICE_ROLE_KEY ausente. Nao e possivel persistir notas operacionais.",
      },
      { status: 503 },
    );
  }

  const payloadResult = watchlistPayloadSchema.safeParse(await request.json());
  if (!payloadResult.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "Payload de watchlist invalido.",
        issues: payloadResult.error.flatten(),
      },
      { status: 400 },
    );
  }

  const payload = payloadResult.data;
  const now = new Date().toISOString();

  const { error } = await admin.from("ops_user_watchlist").upsert(
    {
      profile_id: payload.profileId,
      risk_level: payload.riskLevel,
      support_status: payload.supportStatus,
      internal_note: payload.internalNote,
      next_action_at: payload.nextActionAt ?? null,
      updated_by: access.user.id,
      updated_at: now,
    },
    {
      onConflict: "profile_id",
    },
  );

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "Falha ao persistir a nota operacional. Verifique se o schema do Command Center foi aplicado.",
        detail: error.message,
      },
      { status: 500 },
    );
  }

  await writeAuditLog(admin, {
    actorId: access.user.id,
    action: "ops.watchlist.upsert",
    entityType: "ops_user_watchlist",
    entityId: payload.profileId,
    summary: `Watchlist operacional atualizada para ${payload.profileId}.`,
    metadata: {
      riskLevel: payload.riskLevel,
      supportStatus: payload.supportStatus,
    },
  });

  return NextResponse.json({ ok: true, savedAt: now });
}
