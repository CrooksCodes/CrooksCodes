// Next.js proxy. It runs only on /admin; the public site never goes through it.
// See lib/admin/session.ts.
import type { NextRequest } from "next/server";
import { adminProxy } from "@/lib/admin/session";

export function proxy(request: NextRequest) {
  return adminProxy(request);
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
