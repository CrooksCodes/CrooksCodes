"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/admin/cn";
import { NAV, isActive, AdminMark } from "./nav";

export function Sidebar() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="flex h-full flex-col gap-1 p-3">
      <div className="mb-4 flex items-center gap-2 px-2 py-1">
        <AdminMark className="size-7" />
        <div className="leading-tight">
          <div className="text-sm font-semibold text-fg">CrooksCodes</div>
          <div className="text-[10px] uppercase tracking-wide text-fg-subtle">Admin</div>
        </div>
      </div>
      {NAV.map(({ href, label, icon: Icon, exact }) => {
        const active = isActive(pathname, href, exact);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
              active ? "bg-accent-weak text-accent" : "text-fg-muted hover:bg-surface-2 hover:text-fg",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="flex items-center gap-1 overflow-x-auto md:hidden">
      {NAV.map(({ href, label, icon: Icon, exact }) => {
        const active = isActive(pathname, href, exact);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-9 items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm font-medium",
              active ? "bg-accent-weak text-accent" : "text-fg-muted hover:bg-surface-2",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
