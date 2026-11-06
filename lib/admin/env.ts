// Admin configuration. Every check here fails closed: if anything is missing
// or looks wrong, readAdminEnv() returns null and /admin refuses to serve.
//
// Deliberately free of "server-only" so the unit tests can import it. Nothing
// here is secret: the publishable key is designed to be public, and RLS is
// what protects the data.

export interface AdminEnv {
  supabaseUrl: string;
  /** Publishable (anon) key. Requests run as the signed-in user, so RLS applies. */
  supabaseKey: string;
  /** auth.users id of the only account allowed into /admin. */
  ownerId: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** A secret or service-role key would bypass RLS, so it is refused here. */
function isElevatedKey(key: string): boolean {
  if (key.startsWith("sb_secret_")) return true;
  const parts = key.split(".");
  if (parts.length !== 3) return false;
  try {
    const json = Buffer.from(parts[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
    const payload = JSON.parse(json) as { role?: unknown };
    return payload.role !== "anon";
  } catch {
    return true;
  }
}

function isAllowedUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    if (url.protocol === "https:") return true;
    return url.protocol === "http:" && (url.hostname === "localhost" || url.hostname === "127.0.0.1");
  } catch {
    return false;
  }
}

export function readAdminEnv(env: NodeJS.ProcessEnv = process.env): AdminEnv | null {
  const supabaseUrl = env.SUPABASE_URL?.trim();
  const supabaseKey = env.SUPABASE_PUBLISHABLE_KEY?.trim();
  const ownerId = env.ADMIN_OWNER_USER_ID?.trim();

  if (!supabaseUrl || !supabaseKey || !ownerId) return null;
  if (!isAllowedUrl(supabaseUrl)) return null;
  if (!UUID.test(ownerId)) return null;
  if (isElevatedKey(supabaseKey)) return null;

  return { supabaseUrl, supabaseKey, ownerId: ownerId.toLowerCase() };
}

export class AdminConfigError extends Error {
  constructor() {
    super("Admin is not configured.");
    this.name = "AdminConfigError";
  }
}

export function requireAdminEnv(): AdminEnv {
  const env = readAdminEnv();
  if (!env) throw new AdminConfigError();
  return env;
}
