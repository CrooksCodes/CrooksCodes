import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";
import { requireAdminEnv } from "./env";
import { adminCookieOptions } from "./cookies";

/**
 * Supabase client bound to the visitor's session cookies. It uses the
 * publishable key, so every query runs as the signed-in user and RLS applies.
 * Throws AdminConfigError if configuration is missing.
 */
export async function createAdminClient() {
  const env = requireAdminEnv();
  const store = await cookies();
  return createServerClient<Database>(env.supabaseUrl, env.supabaseKey, {
    cookieOptions: adminCookieOptions,
    cookies: {
      getAll() {
        return store.getAll();
      },
      setAll(list) {
        try {
          for (const { name, value, options } of list) store.set(name, value, options);
        } catch {
          // Server Components cannot set cookies; the proxy refreshes the session.
        }
      },
    },
  });
}

export type AdminClient = Awaited<ReturnType<typeof createAdminClient>>;
