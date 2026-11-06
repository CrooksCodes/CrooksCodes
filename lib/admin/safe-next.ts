import { ADMIN, ADMIN_LOGIN, ADMIN_MFA, isAdminPath } from "./routes";

const BASE = "https://admin.invalid";

/**
 * Turn an untrusted `next` value into a same-origin path under /admin, or fall
 * back to /admin. Rejects protocol-relative URLs (//evil.com), backslash tricks
 * (/\evil.com, which browsers treat as //evil.com), encoded or raw control
 * characters, and anything outside /admin. The login and MFA pages are
 * rejected too, so a crafted link cannot loop.
 */
export function safeNext(raw: unknown): string {
  if (typeof raw !== "string" || raw.length === 0 || raw.length > 512) return ADMIN;
  if (!raw.startsWith("/") || raw.startsWith("//")) return ADMIN;
  if (/[\\\u0000-\u001f\u007f]/.test(raw)) return ADMIN;

  let decoded: string;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return ADMIN;
  }
  if (decoded.startsWith("//") || /[\\\u0000-\u001f\u007f]/.test(decoded)) return ADMIN;

  let url: URL;
  try {
    url = new URL(raw, BASE);
  } catch {
    return ADMIN;
  }
  if (url.origin !== BASE) return ADMIN;
  if (!isAdminPath(url.pathname)) return ADMIN;
  if (url.pathname.startsWith(ADMIN_LOGIN) || url.pathname.startsWith(ADMIN_MFA)) return ADMIN;
  return url.pathname + url.search;
}
