import Link from "next/link";
import { adminPath } from "@/lib/admin/routes";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex max-w-md flex-col items-center gap-3 rounded-lg border border-border bg-surface px-6 py-10 text-center shadow-[var(--shadow)]">
        <h1 className="text-base font-semibold text-fg">Not found</h1>
        <p className="text-sm text-fg-muted">That record doesn&apos;t exist, or the link is out of date.</p>
        <Link href={adminPath.clients} className="text-sm font-medium text-accent hover:underline">Back to clients</Link>
      </div>
    </div>
  );
}
