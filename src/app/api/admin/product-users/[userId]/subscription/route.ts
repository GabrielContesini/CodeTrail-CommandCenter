import { writeAuditLog } from "@/lib/admin-ops";
import { canEditOps, getAdminAccess } from "@/lib/auth";
import { getCommandCenterEnv } from "@/lib/env";
import { productUserSubscriptionPayloadSchema } from "@/lib/schemas";
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
        message: "Seu papel atual nao permite alterar assinaturas.",
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
          "PRODUCT_SUPABASE nao configurado. Nao e possivel alterar assinaturas.",
      },
      { status: 503 },
    );
  }

  const payloadResult = productUserSubscriptionPayloadSchema.safeParse(
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

  const { planCode } = payloadResult.data;

  // Resolve plan_id from the plans table.
  const { data: plan, error: planError } = await productAdmin
    .from("plans")
    .select("id, code, name")
    .eq("code", planCode)
    .maybeSingle<{ id: string; code: string; name: string }>();

  if (planError || !plan) {
    return NextResponse.json(
      {
        ok: false,
        message: `Plano "${planCode}" nao encontrado no banco do produto.`,
      },
      { status: 404 },
    );
  }

  const now = new Date().toISOString();

  const { error } = await productAdmin.from("subscriptions").upsert(
    {
      user_id: userId,
      plan_id: plan.id,
      status: "active",
      updated_at: now,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        message: "Falha ao atualizar a assinatura.",
        detail: error.message,
      },
      { status: 500 },
    );
  }

  const opsAdmin = createSupabaseAdminClient();
  if (opsAdmin) {
    await writeAuditLog(opsAdmin, {
      actorId: access.user.id,
      action: "product.user.subscription_change",
      entityType: "subscriptions",
      entityId: userId,
      summary: `Assinatura do usuario ${userId} alterada para ${plan.name} (${plan.code}).`,
      metadata: { planCode: plan.code, planName: plan.name },
    });
  }

  return NextResponse.json({
    ok: true,
    savedAt: now,
    plan: { code: plan.code, name: plan.name },
  });
}
