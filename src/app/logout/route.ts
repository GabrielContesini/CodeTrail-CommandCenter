import { NextResponse } from "next/server";
import { getCommandCenterEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const env = getCommandCenterEnv();
  const loginUrl = new URL("/login?reason=signed_out", request.url);

  if (!env.hasSupabase) {
    return NextResponse.redirect(loginUrl);
  }

  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();

  return NextResponse.redirect(loginUrl);
}
