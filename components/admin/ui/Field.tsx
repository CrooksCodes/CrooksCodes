import { cn } from "@/lib/admin/cn";

const control =
  "w-full rounded-md border border-border bg-surface px-3 text-sm text-fg placeholder:text-fg-subtle " +
  "disabled:cursor-not-allowed disabled:opacity-60";

export function Field({
  label,
  htmlFor,
  hint,
  error,
  help,
  children,
  className,
}: {
  label?: React.ReactNode;
  htmlFor?: string;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  help?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={htmlFor} className="flex items-center justify-between text-xs font-medium text-fg-muted">
          <span>{label}</span>
          {hint && <span className="font-normal text-fg-subtle">{hint}</span>}
        </label>
      )}
      {children}
      {error ? (
        <p role="alert" className="text-xs text-overdue">{error}</p>
      ) : help ? (
        <p className="text-xs text-fg-subtle">{help}</p>
      ) : null}
    </div>
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(control, "h-9", className)} {...props} />;
}

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(control, "h-9 pr-8", className)} {...props}>
      {children}
    </select>
  );
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(control, "min-h-20 py-2", className)} {...props} />;
}

export function Checkbox({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: React.ReactNode }) {
  return (
    <label className="flex items-center gap-2 text-sm text-fg-muted">
      <input type="checkbox" className="size-4 accent-[var(--accent)]" {...props} />
      {label}
    </label>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return <p role="alert" className="text-xs text-overdue">{message}</p>;
}
