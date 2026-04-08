import { NextResponse } from "next/server";
import { canEditOps, getAdminAccess } from "@/lib/auth";
import {
  sanitizeSupportMessageBody,
  sendSupportReply,
  SupportChatDataError,
  validateSupportMessageBody,
} from "@/lib/support-chat";

export async function POST(
  request: Request,
  context: { params: Promise<{ conversationId: string }> },
) {
  const access = await getAdminAccess();
  if (!access?.profile) {
    return NextResponse.json(
      { ok: false, error: "Sessão administrativa ausente ou expirada." },
      { status: 401 },
    );
  }

  if (!canEditOps(access.profile.role)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Seu papel atual não pode responder conversas de suporte.",
      },
      { status: 403 },
    );
  }

  const payload = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  const body = sanitizeSupportMessageBody(payload?.body);
  const validation = validateSupportMessageBody(body);

  if (!validation.valid) {
    return NextResponse.json(
      { ok: false, error: validation.error },
      { status: 400 },
    );
  }

  try {
    const { conversationId } = await context.params;
    const result = await sendSupportReply(
      access,
      conversationId,
      body,
      typeof payload?.clientMessageId === "string"
        ? payload.clientMessageId
        : null,
    );

    return NextResponse.json({ ok: true, ...result }, { status: 201 });
  } catch (error) {
    const status =
      error instanceof SupportChatDataError ? error.status : 500;

    return NextResponse.json(
      {
        ok: false,
        error:
          status === 404
            ? "Conversa não encontrada."
            : "Não foi possível enviar a mensagem agora.",
        detail: error instanceof Error ? error.message : "unknown",
      },
      { status },
    );
  }
}
