import { NextResponse } from "next/server";
import { canManageAdmins, getAdminAccess } from "@/lib/auth";
import { findAuthUserByEmail, writeAuditLog } from "@/lib/admin-ops";
import { getCommandCenterEnv } from "@/lib/env";
import { adminMemberCreatePayloadSchema } from "@/lib/schemas";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const access = await getAdminAccess();
  if (!access?.profile) {
    return NextResponse.json(
      { ok: false, message: "Sessao administrativa ausente ou expirada." },
      { status: 401 },
    );
  }

  if (!canManageAdmins(access.profile.role)) {
    return NextResponse.json(
      {
        ok: false,
        message: "Somente o owner pode conceder ou alterar acessos administrativos.",
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
        message: "SUPABASE_SERVICE_ROLE_KEY ausente. Nao e possivel gerenciar administradores.",
      },
      { status: 503 },
    );
  }

  const payloadResult = adminMemberCreatePayloadSchema.safeParse(await request.json());
  if (!payloadResult.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "Payload administrativo invalido.",
        issues: payloadResult.error.flatten(),
      },
      { status: 400 },
    );
  }

  const payload = payloadResult.data;
  const targetUser = await findAuthUserByEmail(admin, payload.email);

  if (!targetUser) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "Nenhuma conta com esse e-mail foi encontrada no Auth do Supabase.",
      },
      { status: 404 },
    );
  }

  const displayName =
    payload.displayName?.trim() ||
    targetUser.displayName ||
    targetUser.email?.split("@")[0] ||
    "Operador CodeTrail";

  const now = new Date().toISOString();
  const { error } = await admin.from("ops_admin_profiles").upsert(
    {
      id: targetUser.id,
      display_name: displayName,
      role: payload.role,
      updated_at: now,
    },
    { onConflict: "id" },
  );

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        message: "Falha ao salvar o perfil administrativo.",
        detail: error.message,
      },
      { status: 500 },
    );
  }

  await writeAuditLog(admin, {
    actorId: access.user.id,
    action: "admin.member.upsert",
    entityType: "ops_admin_profiles",
    entityId: targetUser.id,
    summary: `${displayName} recebeu o papel ${payload.role}.`,
    metadata: {
      email: targetUser.email,
      role: payload.role,
    },
  });

  return NextResponse.json({ ok: true, savedAt: now });
}
