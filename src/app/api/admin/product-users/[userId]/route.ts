import { writeAuditLog } from "@/lib/admin-ops";
import { canEditOps, canManageAdmins, getAdminAccess } from "@/lib/auth";
import { getCommandCenterEnv } from "@/lib/env";
import { productUserUpdatePayloadSchema } from "@/lib/schemas";
import {
    createProductSourceAdminClient,
    createSupabaseAdminClient,
} from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type Params = Promise<{ userId: string }>;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(request: Request, { params }: { params: Params }) {
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
        message: "Seu papel atual nao permite editar usuarios do produto.",
      },
      { status: 403 },
    );
  }

  const { userId } = await params;
  if (!UUID_RE.test(userId)) {
    return NextResponse.json(
      { ok: false, message: "ID de usuario invalido." },
      { status: 400 },
    );
  }

  const env = getCommandCenterEnv();
  const productAdmin = createProductSourceAdminClient();
  if (!env.hasProductSource || !productAdmin) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "PRODUCT_SUPABASE nao configurado. Nao e possivel editar usuarios do produto.",
      },
      { status: 503 },
    );
  }

  const payloadResult = productUserUpdatePayloadSchema.safeParse(
    await request.json(),
  );
  if (!payloadResult.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "Payload invalido.",
        issues: payloadResult.error.flatten(),
      },
      { status: 400 },
    );
  }

  const { fullName } = payloadResult.data;
  const now = new Date().toISOString();

  const { error } = await productAdmin
    .from("profiles")
    .update({ full_name: fullName, updated_at: now })
    .eq("id", userId);

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        message: "Falha ao atualizar o nome do usuario.",
        detail: error.message,
      },
      { status: 500 },
    );
  }

  const opsAdmin = createSupabaseAdminClient();
  if (opsAdmin) {
    await writeAuditLog(opsAdmin, {
      actorId: access.user.id,
      action: "product.user.update_name",
      entityType: "profiles",
      entityId: userId,
      summary: `Nome do usuario ${userId} atualizado para "${fullName}".`,
      metadata: { fullName },
    });
  }

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
        message: "Somente o owner pode excluir usuarios do produto.",
      },
      { status: 403 },
    );
  }

  const { userId } = await params;
  if (!UUID_RE.test(userId)) {
    return NextResponse.json(
      { ok: false, message: "ID de usuario invalido." },
      { status: 400 },
    );
  }

  const env = getCommandCenterEnv();
  const productAdmin = createProductSourceAdminClient();
  if (!env.hasProductSource || !productAdmin) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "PRODUCT_SUPABASE nao configurado. Nao e possivel excluir usuarios do produto.",
      },
      { status: 503 },
    );
  }

  const { error } = await productAdmin.auth.admin.deleteUser(userId);
  if (error) {
    return NextResponse.json(
      {
        ok: false,
        message: "Falha ao excluir o usuario.",
        detail: error.message,
      },
      { status: 500 },
    );
  }

  const opsAdmin = createSupabaseAdminClient();
  if (opsAdmin) {
    await writeAuditLog(opsAdmin, {
      actorId: access.user.id,
      action: "product.user.delete",
      entityType: "auth.users",
      entityId: userId,
      summary: `Usuario ${userId} excluido permanentemente do produto.`,
    });
  }

  return NextResponse.json({ ok: true });
}
