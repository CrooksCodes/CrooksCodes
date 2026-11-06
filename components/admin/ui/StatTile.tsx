import { cn } from "@/lib/admin/cn";

const TONE = { accent: "text-accent", paid: "text-paid", overdue: "text-overdue", due: "text-due" } as const;

export function StatTile({ label, value, sub, tone, className }: { label: string; value: React.ReactNode; sub?: React.ReactNode; tone?: keyof typeof TONE; className?: string }) {
  return (
    <div className={cn("rounded-lg border border-border bg-surface px-4 py-3", className)}>
      <div className="text-xs font-medium uppercase tracking-wide text-fg-subtle">{label}</div>
      <div className={cn("mt-1.5 text-2xl font-semibold tnum", tone ? TONE[tone] : "text-fg")}>{value}</div>
      {sub && <div className="mt-0.5 text-xs text-fg-muted">{sub}</div>}
    </div>
  );
}
