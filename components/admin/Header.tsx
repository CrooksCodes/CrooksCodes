import { ThemeToggle } from "./ThemeToggle";
import { MobileNav } from "./Sidebar";
import { signOut } from "@/app/admin/actions";

export function Header({ email }: { email: string }) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-surface/80 px-4 backdrop-blur">
      <MobileNav />
      <div className="flex-1" />
      <ThemeToggle />
      <div className="flex items-center gap-2.5 border-l border-border pl-3">
        <span className="hidden text-xs text-fg-subtle sm:block">{email}</span>
        <form action={signOut}>
          <button type="submit" className="min-h-9 rounded-md px-2 py-1 text-xs font-medium text-fg-muted hover:bg-surface-2 hover:text-fg">
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
