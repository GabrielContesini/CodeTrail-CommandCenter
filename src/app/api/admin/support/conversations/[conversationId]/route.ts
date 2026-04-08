import { NextResponse } from "next/server";
import { canEditOps, getAdminAccess } from "@/lib/auth";
import {
  getSupportThread,
  SupportChatDataError,
  updateSupportThread,
} from "@/lib/support-chat";

export async function GET(
  _request: Request,
  context: { params: Promise<{ conversationId: string }> },
) {
  const access = await getAdminAccess();
  if (!access?.profile) {
    return NextResponse.json(
      { ok: false, error: "Sessão administrativa ausente ou expirada." },
      { status: 401 },
    );
  }

  try {
    const { conversationId } = await context.params;
    const thread = await getSupportThread(access, conversationId);
    return NextResponse.json({ ok: true, ...thread });
  } catch (error) {
    const status =
      error instanceof SupportChatDataError ? error.status : 500;

    return NextResponse.json(
      {
        ok: false,
        error:
          status === 404
            ? "Conversa não encontrada."
            : "Não foi possível carregar a thread agora.",
        detail: error instanceof Error ? error.message : "unknown",
      },
      { status },
    );
  }
}

export async function PATCH(
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
        error: "Seu papel atual não pode atualizar conversas de suporte.",
      },
      { status: 403 },
    );
  }

  const payload = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;

  try {
    const { conversationId } = await context.params;
    const conversation = await updateSupportThread(access, conversationId, {
      status: typeof payload?.status === "string" ? payload.status : null,
      subject: typeof payload?.subject === "string" ? payload.subject : null,
      assignToSelf: Boolean(payload?.assignToSelf),
    });

    return NextResponse.json({ ok: true, conversation });
  } catch (error) {
    const status =
      error instanceof SupportChatDataError ? error.status : 500;

    return NextResponse.json(
      {
        ok: false,
        error:
          status === 400
            ? "Os dados enviados para a conversa são inválidos."
            : status === 404
              ? "Conversa não encontrada."
              : "Não foi possível atualizar a conversa agora.",
        detail: error instanceof Error ? error.message : "unknown",
      },
      { status },
    );
  }
}
