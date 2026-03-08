import { NextResponse } from "next/server";
import { canManageAdmins, getAdminAccess } from "@/lib/auth";
import { countOwners, writeAuditLog } from "@/lib/admin-ops";
import { getCommandCenterEnv } from "@/lib/env";
import { adminMemberUpdatePayloadSchema } from "@/lib/schemas";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

type Params = Promise<{ memberId: string }>;

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

  if (!canManageAdmins(access.profile.role)) {
    return NextResponse.json(
      {
        ok: false,
        message: "Somente o owner pode alterar papeis administrativos.",
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

  const { memberId } = await params;
  const payloadResult = adminMemberUpdatePayloadSchema.safeParse(await request.json());
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
  const { data: currentMember, error: currentError } = await admin
    .from("ops_admin_profiles")
    .select("id, display_name, role")
    .eq("id", memberId)
    .maybeSingle<{
      id: string;
      display_name: string;
      role: "owner" | "admin" | "operator" | "viewer";
    }>();

  if (currentError || !currentMember) {
    return NextResponse.json(
      { ok: false, message: "Membro administrativo nao encontrado." },
      { status: 404 },
    );
  }

  if (
    currentMember.role === "owner" &&
    payload.role !== "owner"
  ) {
    const ownerCount = await countOwners(admin);
    if (ownerCount <= 1) {
      return NextResponse.json(
        {
          ok: false,
          message: "Nao e permitido remover o ultimo owner do Command Center.",
        },
        { status: 409 },
      );
    }
  }

  const now = new Date().toISOString();
  const { error } = await admin
    .from("ops_admin_profiles")
    .update({
      display_name: payload.displayName,
      role: payload.role,
      updated_at: now,
    })
    .eq("id", memberId);

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        message: "Falha ao atualizar o membro administrativo.",
        detail: error.message,
      },
      { status: 500 },
    );
  }

  await writeAuditLog(admin, {
    actorId: access.user.id,
    action: "admin.member.update",
    entityType: "ops_admin_profiles",
    entityId: memberId,
    summary: `${payload.displayName} agora possui o papel ${payload.role}.`,
    metadata: {
      previousRole: currentMember.role,
      nextRole: payload.role,
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

  if (!canManageAdmins(access.profile.role)) {
    return NextResponse.json(
      {
        ok: false,
        message: "Somente o owner pode remover operadores administrativos.",
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

  const { memberId } = await params;
  if (memberId === access.user.id) {
    return NextResponse.json(
      {
        ok: false,
        message: "Remova outro owner antes de retirar seu proprio acesso.",
      },
      { status: 409 },
    );
  }

  const { data: currentMember, error: currentError } = await admin
    .from("ops_admin_profiles")
    .select("id, display_name, role")
    .eq("id", memberId)
    .maybeSingle<{
      id: string;
      display_name: string;
      role: "owner" | "admin" | "operator" | "viewer";
    }>();

  if (currentError || !currentMember) {
    return NextResponse.json(
      { ok: false, message: "Membro administrativo nao encontrado." },
      { status: 404 },
    );
  }

  if (currentMember.role === "owner") {
    const ownerCount = await countOwners(admin);
    if (ownerCount <= 1) {
      return NextResponse.json(
        {
          ok: false,
          message: "Nao e permitido remover o ultimo owner do Command Center.",
        },
        { status: 409 },
      );
    }
  }

  const { error } = await admin
    .from("ops_admin_profiles")
    .delete()
    .eq("id", memberId);

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        message: "Falha ao remover o membro administrativo.",
        detail: error.message,
      },
      { status: 500 },
    );
  }

  await writeAuditLog(admin, {
    actorId: access.user.id,
    action: "admin.member.delete",
    entityType: "ops_admin_profiles",
    entityId: memberId,
    summary: `${currentMember.display_name} perdeu o acesso administrativo.`,
    metadata: {
      previousRole: currentMember.role,
    },
  });

  return NextResponse.json({ ok: true, deletedAt: new Date().toISOString() });
}
