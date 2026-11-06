"use client";

import Link from "next/link";
import { Button } from "@/components/admin/ui/Button";
import { adminPath } from "@/lib/admin/routes";

/** Recoverable error screen. Shows only the digest, never the error message. */
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex max-w-md flex-col items-center gap-4 rounded-lg border border-border bg-surface px-6 py-10 text-center shadow-[var(--shadow)]">
        <div>
          <h1 className="text-base font-semibold text-fg">Something went wrong</h1>
          <p className="mt-1 text-sm text-fg-muted">This screen failed to load. Nothing was changed.</p>
          {error.digest && <p className="mt-2 text-xs text-fg-subtle">Reference: <span className="tnum">{error.digest}</span></p>}
        </div>
        <div className="flex items-center gap-2 pt-1">
          <Button onClick={reset}>Try again</Button>
          <Link href={adminPath.home} className="inline-flex h-9 items-center rounded-md px-4 text-sm font-medium text-fg-muted hover:bg-surface-2 hover:text-fg">
            Today
          </Link>
        </div>
      </div>
    </div>
  );
}
