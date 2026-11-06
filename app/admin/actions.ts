"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/admin/supabase";
import { readAdminEnv } from "@/lib/admin/env";
import { ADMIN_LOGIN } from "@/lib/admin/routes";

/** Ends the session everywhere (global scope revokes all refresh tokens). */
export async function signOut() {
  if (readAdminEnv()) {
    const supabase = await createAdminClient();
    await supabase.auth.signOut({ scope: "global" });
  }
  redirect(ADMIN_LOGIN);
}
