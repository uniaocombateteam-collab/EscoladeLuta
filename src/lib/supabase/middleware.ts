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

  const forceChange =
    data?.claims?.app_metadata &&
    (data.claims.app_metadata as Record<string, unknown>).force_password_change === true;

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

  // Modalidades é uma área administrativa: autenticação, sozinha, não concede acesso.
  if (data?.claims && pathname.startsWith("/modalities")) {
    const userId = typeof data.claims.sub === "string" ? data.claims.sub : null;
    let roles: string[] = [];
    let roleLookupFailed = !userId;

    if (userId) {
      const { data: assignments, error: rolesError } = await supabase
        .from("profile_roles")
        .select("role")
        .eq("profile_id", userId);

      if (rolesError) {
        roleLookupFailed = true;
      } else {
        roles = (assignments ?? []).map((item) => item.role);
        if (roles.length === 0) {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", userId)
            .maybeSingle();
          if (profileError) roleLookupFailed = true;
          else if (profile?.role) roles = [profile.role];
        }
      }
    }

    if (roleLookupFailed || !roles.includes("admin")) {
      const target = request.nextUrl.clone();
      target.pathname = roles.includes("guardian")
        ? "/portal"
        : roles.includes("student")
          ? "/aluno"
          : "/";
      target.search = "";
      const redirect = NextResponse.redirect(target);
      response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
      return redirect;
    }
  }

  return response;
}
