import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard } from "../AuthCard";
import { ChallengeForm, EnrolPanel } from "./MfaForms";
import { requireOwnerPasswordSession } from "@/lib/admin/auth";
import { safeNext } from "@/lib/admin/safe-next";
import { signOut } from "../actions";

export const metadata: Metadata = { title: "Two-factor" };

export default async function MfaPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next);
  const { supabase } = await requireOwnerPasswordSession();

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.currentLevel === "aal2") redirect(next);

  const { data: factors, error } = await supabase.auth.mfa.listFactors();
  if (error) throw new Error("Could not check two-factor status.");
  const verified = factors.totp[0];

  return (
    <AuthCard
      title={verified ? "Two-factor code" : "Set up two-factor"}
      lead={verified ? "Enter the code from your authenticator app." : "Two-factor is required for the admin. This takes about a minute."}
    >
      {verified ? <ChallengeForm factorId={verified.id} next={next} /> : <EnrolPanel next={next} />}
      <form action={signOut} className="mt-4 text-center">
        <button type="submit" className="text-xs text-fg-subtle underline-offset-2 hover:text-fg hover:underline">
          Sign out
        </button>
      </form>
    </AuthCard>
  );
}
