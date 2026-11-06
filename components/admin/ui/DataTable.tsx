import { cn } from "@/lib/admin/cn";

type Align = "left" | "right" | "center";

export function Table({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-surface-2">
      <tr className="border-b border-border">{children}</tr>
    </thead>
  );
}

export function Th({ children, align = "left", className }: { children?: React.ReactNode; align?: Align; className?: string }) {
  return (
    <th
      scope="col"
      className={cn(
        "whitespace-nowrap px-3 py-2 text-xs font-medium uppercase tracking-wide text-fg-subtle",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function Tr({ children, className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn("border-b border-border last:border-0 hover:bg-surface-2/60", className)} {...props}>
      {children}
    </tr>
  );
}

export function Td({ children, align = "left", className }: { children?: React.ReactNode; align?: Align; className?: string }) {
  return (
    <td
      className={cn(
        "px-3 py-2.5 align-middle text-fg",
        align === "right" && "text-right tnum",
        align === "center" && "text-center",
        className,
      )}
    >
      {children}
    </td>
  );
}
