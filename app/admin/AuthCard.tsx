import { AdminMark } from "@/components/admin/nav";

/** Centred card shared by the login and two-factor pages. */
export function AuthCard({ title, lead, children }: { title: string; lead: React.ReactNode; children: React.ReactNode }) {
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-2.5">
          <AdminMark className="size-9" />
          <div>
            <div className="text-base font-semibold text-fg">CrooksCodes</div>
            <div className="text-xs text-fg-subtle">Admin</div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-6 shadow-[var(--shadow)]">
          <h1 className="mb-1 text-lg font-semibold text-fg">{title}</h1>
          <div className="mb-5 text-sm text-fg-muted">{lead}</div>
          {children}
        </div>
      </div>
    </main>
  );
}
