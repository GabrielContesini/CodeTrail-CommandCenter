import { NextResponse } from "next/server";
import { getCommandCenterEnv } from "@/lib/env";
import { watchlistPayloadSchema } from "@/lib/schemas";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
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

  return NextResponse.json({ ok: true, savedAt: now });
}
