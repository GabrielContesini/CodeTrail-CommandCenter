import { NextResponse } from "next/server";
import {
  countOwners,
  findAuthUserByEmail,
  writeAuditLog,
} from "@/lib/admin-ops";
import { bootstrapOwnerPayloadSchema } from "@/lib/schemas";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "SUPABASE_SERVICE_ROLE_KEY ausente. Nao e possivel criar o primeiro owner.",
      },
      { status: 503 },
    );
  }

  const ownerCount = await countOwners(admin).catch(() => null);
  if (ownerCount === null) {
    return NextResponse.json(
      {
        ok: false,
        message: "Nao foi possivel verificar o estado administrativo do painel.",
      },
      { status: 500 },
    );
  }

  if (ownerCount > 0) {
    return NextResponse.json(
      {
        ok: false,
        message: "O primeiro owner ja foi criado. Use o fluxo normal de login.",
      },
      { status: 409 },
    );
  }

  const payloadResult = bootstrapOwnerPayloadSchema.safeParse(await request.json());
  if (!payloadResult.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "Dados invalidos para criar o primeiro owner.",
        issues: payloadResult.error.flatten(),
      },
      { status: 400 },
    );
  }

  const payload = payloadResult.data;
  const normalizedEmail = payload.email.trim().toLowerCase();
  const existingUser = await findAuthUserByEmail(admin, normalizedEmail).catch(
    () => null,
  );

  let userId = existingUser?.id ?? null;

  if (existingUser) {
    const { error: updateError } = await admin.auth.admin.updateUserById(
      existingUser.id,
      {
        password: payload.password,
        email_confirm: true,
        user_metadata: {
          ...((existingUser.displayName
            ? { full_name: existingUser.displayName }
            : {}) as Record<string, unknown>),
          full_name: payload.displayName,
        },
      },
    );

    if (updateError) {
      return NextResponse.json(
        {
          ok: false,
          message: "Falha ao atualizar o usuario do primeiro owner.",
          detail: updateError.message,
        },
        { status: 500 },
      );
    }
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email: normalizedEmail,
      password: payload.password,
      email_confirm: true,
      user_metadata: {
        full_name: payload.displayName,
      },
    });

    if (error || !data.user?.id) {
      return NextResponse.json(
        {
          ok: false,
          message: "Falha ao criar o usuario do primeiro owner.",
          detail: error?.message,
        },
        { status: 500 },
      );
    }

    userId = data.user.id;
  }

  if (!userId) {
    return NextResponse.json(
      {
        ok: false,
        message: "Falha interna ao resolver o usuario do primeiro owner.",
      },
      { status: 500 },
    );
  }

  const { error: profileError } = await admin.from("ops_admin_profiles").upsert(
    {
      id: userId,
      display_name: payload.displayName,
      role: "owner",
    },
    {
      onConflict: "id",
    },
  );

  if (profileError) {
    return NextResponse.json(
      {
        ok: false,
        message: "Falha ao promover o primeiro owner.",
        detail: profileError.message,
      },
      { status: 500 },
    );
  }

  await writeAuditLog(admin, {
    actorId: userId,
    action: "ops.bootstrap.owner",
    entityType: "ops_admin_profiles",
    entityId: userId,
    summary: `Primeiro owner bootstrapado para ${normalizedEmail}.`,
    metadata: {
      email: normalizedEmail,
    },
  });

  return NextResponse.json({
    ok: true,
    email: normalizedEmail,
  });
}
