import { NextResponse } from "next/server";
import { getAdminAccess } from "@/lib/auth";
import { listSupportInbox, SupportChatDataError } from "@/lib/support-chat";

export async function GET(request: Request) {
  const access = await getAdminAccess();
  if (!access?.profile) {
    return NextResponse.json(
      { ok: false, error: "Sessão administrativa ausente ou expirada." },
      { status: 401 },
    );
  }

  try {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") || 50);
    const status = url.searchParams.get("status");
    const inbox = await listSupportInbox(access, {
      limit,
      status,
    });

    return NextResponse.json({ ok: true, ...inbox });
  } catch (error) {
    const status =
      error instanceof SupportChatDataError ? error.status : 500;

    return NextResponse.json(
      {
        ok: false,
        error:
          status === 503
            ? "Configure PRODUCT_SUPABASE_URL e PRODUCT_SUPABASE_SERVICE_ROLE_KEY para ler o chat do produto."
            : "Não foi possível carregar a inbox de suporte agora.",
        detail: error instanceof Error ? error.message : "unknown",
      },
      { status },
    );
  }
}
