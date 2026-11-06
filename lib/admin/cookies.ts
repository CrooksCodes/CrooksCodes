import { ADMIN } from "./routes";

/**
 * Session cookies are scoped to /admin, so the browser never sends them with
 * requests for the public site. httpOnly because no client-side Supabase code
 * exists: every call runs on the server.
 */
export const adminCookieOptions = {
  path: ADMIN,
  sameSite: "lax" as const,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
};
