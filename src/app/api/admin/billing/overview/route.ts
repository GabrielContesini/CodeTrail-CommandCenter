import { canEditOps, getAdminAccess } from "@/lib/auth";
import { getBillingOverview } from "@/lib/billing-data";
import { NextResponse } from "next/server";

export async function GET() {
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
        message: "Seu papel atual nao permite acessar dados de billing.",
      },
      { status: 403 },
    );
  }

  try {
    const data = await getBillingOverview();
    return NextResponse.json({ ok: true, data });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Falha ao carregar overview de billing." },
      { status: 500 },
    );
  }
}
