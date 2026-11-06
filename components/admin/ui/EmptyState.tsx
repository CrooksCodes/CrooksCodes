import { cn } from "@/lib/admin/cn";

export function EmptyState({ title, hint, action, className }: { title: string; hint?: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-surface px-6 py-12 text-center", className)}>
      <p className="text-sm font-medium text-fg">{title}</p>
      {hint && <p className="max-w-sm text-sm text-fg-muted">{hint}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
