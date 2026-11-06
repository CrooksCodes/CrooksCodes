import { cn } from "@/lib/admin/cn";
import { money, money0 } from "@/lib/admin/format";

/** Every money value renders through this, with tabular figures. */
export function Money({ value, whole = false, muted = false, className }: { value: number | null | undefined; whole?: boolean; muted?: boolean; className?: string }) {
  return <span className={cn("tnum", muted && "text-fg-muted", className)}>{whole ? money0(value) : money(value)}</span>;
}
