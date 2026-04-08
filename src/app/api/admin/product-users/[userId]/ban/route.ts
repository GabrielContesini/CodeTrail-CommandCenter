import { writeAuditLog } from "@/lib/admin-ops";
import { canManageAdmins, getAdminAccess } from "@/lib/auth";
import { getCommandCenterEnv } from "@/lib/env";
import { productUserBanPayloadSchema } from "@/lib/schemas";
import {
    createProductSourceAdminClient,
    createSupabaseAdminClient,
} from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type Params = Promise<{ userId: string }>;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request, { params }: { params: Params }) {
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
        message:
          "Somente o owner pode desativar ou reativar usuarios do produto.",
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
          "PRODUCT_SUPABASE nao configurado. Nao e possivel alterar o status do usuario.",
      },
      { status: 503 },
    );
  }

  const payloadResult = productUserBanPayloadSchema.safeParse(
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

  const { banned } = payloadResult.data;

  const { error } = await productAdmin.auth.admin.updateUserById(userId, {
    ban_duration: banned ? "876600h" : "none",
  });

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        message: banned
          ? "Falha ao desativar o usuario."
          : "Falha ao reativar o usuario.",
        detail: error.message,
      },
      { status: 500 },
    );
  }

  const opsAdmin = createSupabaseAdminClient();
  if (opsAdmin) {
    await writeAuditLog(opsAdmin, {
      actorId: access.user.id,
      action: banned ? "product.user.ban" : "product.user.unban",
      entityType: "auth.users",
      entityId: userId,
      summary: banned
        ? `Usuario ${userId} desativado no produto.`
        : `Usuario ${userId} reativado no produto.`,
    });
  }

  return NextResponse.json({ ok: true, banned });
}
