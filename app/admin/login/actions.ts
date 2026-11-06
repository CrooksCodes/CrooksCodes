"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { readAdminEnv } from "@/lib/admin/env";
import { createAdminClient } from "@/lib/admin/supabase";
import { safeNext } from "@/lib/admin/safe-next";
import { ADMIN_MFA } from "@/lib/admin/routes";

export type LoginState = { error?: string };

const Credentials = z.object({
  email: z.string().trim().min(3).max(254).email(),
  password: z.string().min(1).max(256),
});

// One message for every failure, so the form never reveals which accounts exist.
const FAILED = "Email or password is incorrect.";

export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const env = readAdminEnv();
  if (!env) return { error: "Sign-in is unavailable." };

  const parsed = Credentials.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: FAILED };

  const supabase = await createAdminClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) return { error: FAILED };

  // Only the owner may hold an admin session. Any other account (for example
  // one created through public signup) is signed straight back out.
  if (data.user.id.toLowerCase() !== env.ownerId) {
    await supabase.auth.signOut({ scope: "global" });
    return { error: FAILED };
  }

  const next = safeNext(formData.get("next"));
  redirect(`${ADMIN_MFA}?next=${encodeURIComponent(next)}`);
}
