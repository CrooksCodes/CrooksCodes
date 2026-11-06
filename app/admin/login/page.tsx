import type { Metadata } from "next";
import { AuthCard } from "../AuthCard";
import { LoginForm } from "./LoginForm";
import { safeNext } from "@/lib/admin/safe-next";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; e?: string }> }) {
  const { next, e } = await searchParams;
  return (
    <AuthCard title="Sign in" lead="Owner access only.">
      <LoginForm next={safeNext(next)} notice={e === "denied" ? "That account does not have access." : undefined} />
    </AuthCard>
  );
}
