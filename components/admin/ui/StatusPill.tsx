import { cn } from "@/lib/admin/cn";

export type StatusTone = "paid" | "overdue" | "due" | "neutral" | "accent";

const TONE: Record<StatusTone, { dot: string; text: string; ring: string }> = {
  paid: { dot: "bg-paid", text: "text-paid", ring: "ring-paid/25" },
  overdue: { dot: "bg-overdue", text: "text-overdue", ring: "ring-overdue/25" },
  due: { dot: "bg-due", text: "text-due", ring: "ring-due/25" },
  neutral: { dot: "bg-neutral", text: "text-fg-muted", ring: "ring-neutral/20" },
  accent: { dot: "bg-accent", text: "text-accent", ring: "ring-accent/25" },
};

/** A dot and a label, never a solid colour fill. */
export function StatusPill({ tone = "neutral", children, className }: { tone?: StatusTone; children: React.ReactNode; className?: string }) {
  const t = TONE[tone];
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium ring-1 ring-inset", t.text, t.ring, className)}>
      <span className={cn("size-1.5 rounded-full", t.dot)} aria-hidden />
      {children}
    </span>
  );
}
