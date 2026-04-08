import { NextResponse } from "next/server";
import { getAdminAccess } from "@/lib/auth";
import {
  markSupportThreadRead,
  SupportChatDataError,
} from "@/lib/support-chat";

export async function POST(
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
    const conversation = await markSupportThreadRead(access, conversationId);
    return NextResponse.json({ ok: true, conversation });
  } catch (error) {
    const status =
      error instanceof SupportChatDataError ? error.status : 500;

    return NextResponse.json(
      {
        ok: false,
        error:
          status === 404
            ? "Conversa não encontrada."
            : "Não foi possível atualizar a leitura agora.",
        detail: error instanceof Error ? error.message : "unknown",
      },
      { status },
    );
  }
}
