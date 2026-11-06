"use client";

import { useActionState } from "react";
import { signIn, type LoginState } from "./actions";
import { Field, Input, FormError } from "@/components/admin/ui/Field";
import { Button } from "@/components/admin/ui/Button";

export function LoginForm({ next, notice }: { next: string; notice?: string }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(signIn, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="username" required autoFocus />
      </Field>
      <Field label="Password" htmlFor="password">
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>
      <FormError message={state.error ?? notice} />
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
