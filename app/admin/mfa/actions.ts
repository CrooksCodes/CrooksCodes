"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireOwnerPasswordSession } from "@/lib/admin/auth";
import { safeNext } from "@/lib/admin/safe-next";

export type EnrolState = { error?: string; factorId?: string; qr?: string; secret?: string };
export type VerifyState = { error?: string };

/**
 * Start TOTP enrolment. Only allowed while the owner has no verified factor;
 * after that, adding or replacing a factor is done from the Supabase dashboard.
 */
export async function startEnrolment(): Promise<EnrolState> {
  const { supabase } = await requireOwnerPasswordSession();
  const { data: factors, error: listError } = await supabase.auth.mfa.listFactors();
  if (listError) return { error: "Could not check your two-factor status." };
  if (factors.totp.length > 0) return { error: "Two-factor is already set up. Use your authenticator code." };

  // Clear abandoned attempts so they don't pile up.
  for (const f of factors.all) {
    if (f.factor_type === "totp" && f.status === "unverified") await supabase.auth.mfa.unenroll({ factorId: f.id });
  }

  const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "Authenticator" });
  if (error || !data) return { error: "Could not start two-factor setup." };
  return { factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret };
}

const Verify = z.object({
  factorId: z.string().uuid(),
  code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code."),
});

/** Verify a TOTP code. This both completes enrolment and signs in at aal2. */
export async function verifyCode(_prev: VerifyState, formData: FormData): Promise<VerifyState> {
  const { supabase } = await requireOwnerPasswordSession();
  const parsed = Verify.safeParse({ factorId: formData.get("factorId"), code: formData.get("code") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Enter the 6-digit code." };

  // The factor must belong to this user.
  const { data: factors } = await supabase.auth.mfa.listFactors();
  if (!factors?.all.some((f) => f.id === parsed.data.factorId && f.factor_type === "totp")) {
    return { error: "That code didn't work. Try again." };
  }

  const { error } = await supabase.auth.mfa.challengeAndVerify(parsed.data);
  if (error) return { error: "That code didn't work. Try again." };

  redirect(safeNext(formData.get("next")));
}
