import { cn } from "@/lib/admin/cn";

type Variant = "primary" | "ghost" | "subtle";
type Size = "sm" | "md";

const VARIANT: Record<Variant, string> = {
  primary: "bg-accent text-accent-fg hover:bg-accent-hover shadow-[var(--shadow)]",
  ghost: "bg-transparent text-fg-muted hover:text-fg hover:bg-surface-2",
  subtle: "bg-surface-2 text-fg hover:bg-border",
};

const SIZE: Record<Size, string> = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-9 px-4 text-sm gap-2",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50",
        VARIANT[variant],
        SIZE[size],
        className,
      )}
      {...props}
    />
  );
}

/** Small text button used for inline row actions such as Edit. */
export function InlineButton({ className, type = "button", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={cn(
        "rounded-md px-2 py-1 text-xs font-medium text-fg-muted hover:bg-surface-2 hover:text-fg disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
