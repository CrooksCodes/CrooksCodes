// Proxy half of the gate. It refreshes the session cookie, sends visitors
// without a session to the login page and adds the admin response headers.
// It is only the first check: pages and actions call requireOwner(), and RLS
// sits behind both.
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./types";
import { readAdminEnv } from "./env";
import { adminCookieOptions } from "./cookies";
import { ADMIN, ADMIN_LOGIN } from "./routes";

export const ADMIN_HEADERS: Record<string, string> = {
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "Cache-Control": "private, no-store",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
};

function withHeaders(res: NextResponse): NextResponse {
  for (const [k, v] of Object.entries(ADMIN_HEADERS)) res.headers.set(k, v);
  return res;
}

function redirectTo(request: NextRequest, carry: NextResponse, pathname: string, params?: Record<string, string>) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  for (const [k, v] of Object.entries(params ?? {})) url.searchParams.set(k, v);
  const res = NextResponse.redirect(url);
  for (const c of carry.cookies.getAll()) res.cookies.set(c);
  return withHeaders(res);
}

export async function adminProxy(request: NextRequest): Promise<NextResponse> {
  const env = readAdminEnv();
  if (!env) {
    return withHeaders(new NextResponse("Not available.", { status: 503, headers: { "Content-Type": "text/plain" } }));
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient<Database>(env.supabaseUrl, env.supabaseKey, {
    cookieOptions: adminCookieOptions,
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(list) {
        for (const { name, value } of list) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of list) response.cookies.set(name, value, options);
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;
  const onLogin = pathname === ADMIN_LOGIN;

  if (!user && !onLogin) {
    return redirectTo(request, response, ADMIN_LOGIN, { next: pathname + search });
  }
  if (user && onLogin && user.id.toLowerCase() === env.ownerId) {
    return redirectTo(request, response, ADMIN);
  }
  return withHeaders(response);
}
