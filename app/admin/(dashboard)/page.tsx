import Link from "next/link";
import { requireOwner } from "@/lib/admin/auth";
import { loadCoreData, loadPipeline } from "@/lib/admin/queries";
import { computeAR, computeLedger, computeMRR } from "@/lib/admin/money/compute";
import { buildHeartbeat, type HeartbeatItem } from "@/lib/admin/money/heartbeat";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader } from "@/components/admin/ui/Card";
import { StatTile } from "@/components/admin/ui/StatTile";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { Money } from "@/components/admin/ui/Money";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const { supabase } = await requireOwner();
  const [{ clients, deals, payments, draws }, leads] = await Promise.all([loadCoreData(supabase), loadPipeline(supabase)]);

  const ledger = computeLedger(payments, draws);
  const mrr = computeMRR(deals);
  const ar = computeAR(deals, payments);
  const items = buildHeartbeat(clients, deals, payments, leads);
  const overdue = items.filter((i) => i.tone === "overdue").length;
  const today = new Date().toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Today"
        subtitle={today}
        action={
          <span className="text-sm text-fg-muted">
            {items.length === 0 ? "Nothing due." : `${items.length} due${overdue ? `, ${overdue} overdue` : ""}`}
          </span>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="MRR" value={<Money value={mrr} whole />} tone="accent" />
        <StatTile label="Undrawn" value={<Money value={ledger.balance} whole />} sub="Received minus draws" />
        <StatTile label="Received" value={<Money value={ledger.received} whole />} sub="All time" />
        <StatTile label="Unpaid this month" value={<Money value={ar} whole />} tone={ar > 0 ? "due" : undefined} />
      </div>

      <Card className="overflow-hidden">
        <CardHeader title="Due today and soon" action={<span className="text-xs text-fg-subtle">Billing, check-ins, warranty, stale leads</span>} />
        {items.length === 0 ? (
          <EmptyState title="Nothing due right now" hint="GBP billing days, check-ins, warranty and handover dates, and leads quiet for 90 days show up here." className="rounded-none border-0" />
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item) => <DueRow key={item.id} item={item} />)}
          </ul>
        )}
      </Card>
    </div>
  );
}

function DueRow({ item }: { item: HeartbeatItem }) {
  return (
    <li>
      <Link href={item.href} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-2/60">
        <span className={`size-2 shrink-0 rounded-full ${item.tone === "overdue" ? "bg-overdue" : "bg-due"}`} aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-fg">{item.title}</span>
          <span className="block truncate text-xs text-fg-subtle">
            <span className="sr-only">{item.tone === "overdue" ? "Overdue. " : "Due soon. "}</span>
            {item.sub}
          </span>
        </span>
        <svg viewBox="0 0 20 20" className="size-4 shrink-0 text-fg-subtle" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
          <path d="M7 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </li>
  );
}
