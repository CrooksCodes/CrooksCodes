"use client";

import { useState, useTransition } from "react";
import { setPaymentReceived } from "./actions";
import { cn } from "@/lib/admin/cn";

export function MarkReceived({ paymentId, received }: { paymentId: string; received: boolean }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string>();

  return (
    <span className="inline-flex items-center gap-2">
      {error && <span role="alert" className="text-xs text-overdue">{error}</span>}
      <button
        type="button"
        disabled={pending}
        onClick={() => start(async () => setError((await setPaymentReceived(paymentId, !received)).error))}
        className={cn(
          "rounded-md px-2 py-1 text-xs font-medium transition-colors disabled:opacity-50",
          received ? "text-fg-muted hover:bg-surface-2 hover:text-fg" : "bg-accent text-accent-fg hover:bg-accent-hover",
        )}
      >
        {pending ? "Saving…" : received ? "Mark pending" : "Mark received"}
      </button>
    </span>
  );
}
