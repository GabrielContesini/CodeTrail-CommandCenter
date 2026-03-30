import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getCommandCenterEnv } from "@/lib/env";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicRoute =
    pathname === "/login" ||
    pathname === "/logout" ||
    pathname.startsWith("/api/");
  const env = getCommandCenterEnv();
  if (!env.hasSupabase) {
    if (!isPublicRoute) {
      return NextResponse.redirect(
        new URL("/login?reason=misconfigured", request.url),
      );
    }
    return NextResponse.next({
      request,
    });
  }

  const response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Supabase unreachable (paused project, DNS failure, no internet)
    if (!isPublicRoute) {
      return NextResponse.redirect(
        new URL("/login?reason=connection_error", request.url),
      );
    }
    return response;
  }

  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login?reason=signed_out", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
