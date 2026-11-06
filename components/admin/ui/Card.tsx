import { cn } from "@/lib/admin/cn";

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-lg border border-border bg-surface shadow-[var(--shadow)]", className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ title, action, className }: { title: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3", className)}>
      <h2 className="text-sm font-semibold text-fg">{title}</h2>
      {action}
    </div>
  );
}
