"use client";

import { useActionState, useState, useTransition } from "react";
import { startEnrolment, verifyCode, type EnrolState, type VerifyState } from "./actions";
import { Field, Input, FormError } from "@/components/admin/ui/Field";
import { Button } from "@/components/admin/ui/Button";

function CodeForm({ factorId, next, submitLabel }: { factorId: string; next: string; submitLabel: string }) {
  const [state, action, pending] = useActionState<VerifyState, FormData>(verifyCode, {});
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="factorId" value={factorId} />
      <input type="hidden" name="next" value={next} />
      <Field label="6-digit code" htmlFor="code">
        <Input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d{6}"
          maxLength={6}
          required
          autoFocus
          className="tnum tracking-[0.3em]"
        />
      </Field>
      <FormError message={state.error} />
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Checking…" : submitLabel}
      </Button>
    </form>
  );
}

export function ChallengeForm({ factorId, next }: { factorId: string; next: string }) {
  return <CodeForm factorId={factorId} next={next} submitLabel="Verify" />;
}

export function EnrolPanel({ next }: { next: string }) {
  const [enrol, setEnrol] = useState<EnrolState>({});
  const [pending, start] = useTransition();

  if (!enrol.factorId) {
    return (
      <div className="flex flex-col gap-4">
        <FormError message={enrol.error} />
        <Button className="w-full" disabled={pending} onClick={() => start(async () => setEnrol(await startEnrolment()))}>
          {pending ? "Preparing…" : "Set up authenticator"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ol className="list-decimal space-y-1 pl-5 text-sm text-fg-muted">
        <li>Open your authenticator app and add an account.</li>
        <li>Scan this code, or enter the key below by hand.</li>
        <li>Type the 6-digit code it shows.</li>
      </ol>
      {/* eslint-disable-next-line @next/next/no-img-element -- data: URL from Supabase, not an optimisable asset */}
      <img src={enrol.qr} alt="QR code for your authenticator app" width={180} height={180} className="mx-auto rounded-md bg-white p-2" />
      <div>
        <div className="text-xs font-medium text-fg-muted">Setup key</div>
        <code className="mt-1 block break-all rounded-md bg-surface-2 px-3 py-2 font-mono text-xs text-fg">{enrol.secret}</code>
      </div>
      <CodeForm factorId={enrol.factorId} next={next} submitLabel="Turn on two-factor" />
    </div>
  );
}
