import { requireOwner } from "@/lib/admin/auth";
import { Sidebar } from "@/components/admin/Sidebar";
import { Header } from "@/components/admin/Header";

// Every page under here also calls requireOwner() itself. Layouts don't re-run
// on every navigation, so the layout check alone is not enough.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireOwner();
  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-56 shrink-0 border-r border-border bg-surface md:block">
        <Sidebar />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Header email={user.email ?? ""} />
        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
