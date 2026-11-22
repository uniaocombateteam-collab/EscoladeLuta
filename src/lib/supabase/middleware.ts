import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return response;
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(items, headers) {
        items.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        items.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([name, value]) => response.headers.set(name, value));
      },
    },
  });
  const { data } = await supabase.auth.getClaims();
  const pathname = request.nextUrl.pathname;
  const login = pathname.startsWith("/login");
  const changePassword = pathname.startsWith("/change-password");
  if (pathname === "/painel") {
    const target = request.nextUrl.clone();
    target.pathname = "/";
    return NextResponse.redirect(target);
  }
  const forceChange = data?.claims?.app_metadata && (data.claims.app_metadata as Record<string, unknown>).force_password_change === true;

  if (!data?.claims && !login) {
    const target = request.nextUrl.clone();
    target.pathname = "/login";
    target.search = "";
    return NextResponse.redirect(target);
  }
  if (data?.claims && forceChange && !changePassword && !login) {
    const target = request.nextUrl.clone();
    target.pathname = "/change-password";
    target.search = "";
    return NextResponse.redirect(target);
  }
  if (data?.claims && forceChange && login) {
    const target = request.nextUrl.clone();
    target.pathname = "/change-password";
    target.search = "";
    return NextResponse.redirect(target);
  }
  if (data?.claims && !forceChange && (login || changePassword)) {
    const target = request.nextUrl.clone();
    target.pathname = "/";
    target.search = "";
    return NextResponse.redirect(target);
  }
  return response;
}