import "server-only";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { requireAdminEnv } from "./env";
import { createAdminClient, type AdminClient } from "./supabase";
import { ADMIN_LOGIN, ADMIN_MFA } from "./routes";

export interface OwnerSession {
  supabase: AdminClient;
  user: User;
}

/**
 * The signed-in owner at any assurance level. Used only by the two-factor
 * page. Anyone else is signed out and sent to the login page.
 */
export async function requireOwnerPasswordSession(): Promise<OwnerSession> {
  const env = requireAdminEnv();
  const supabase = await createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser(); // validates the token with Supabase Auth

  if (!user) redirect(ADMIN_LOGIN);
  if (user.id.toLowerCase() !== env.ownerId) {
    await supabase.auth.signOut();
    redirect(`${ADMIN_LOGIN}?e=denied`);
  }
  return { supabase, user };
}

/**
 * The owner, signed in with two-factor. Call this first in every admin page
 * and every server action. The database enforces the same rule through RLS,
 * so a missed call here still returns no data.
 */
export async function requireOwner(): Promise<OwnerSession> {
  const session = await requireOwnerPasswordSession();
  const { data, error } = await session.supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error || data?.currentLevel !== "aal2") redirect(ADMIN_MFA);
  return session;
}
