import type { Metadata } from "next";
import { requireOwner } from "@/lib/admin/auth";
import { loadPipeline } from "@/lib/admin/queries";
import { isOpenLead, isStaleLead, leadAmount, STALE_DAYS } from "@/lib/admin/money/leads";
import { fmtDate } from "@/lib/admin/format";
import type { PipelineLeadRow, PipelineStage } from "@/lib/admin/types";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card } from "@/components/admin/ui/Card";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { Money } from "@/components/admin/ui/Money";
import { StatusPill } from "@/components/admin/ui/StatusPill";
import { LeadStageBadge } from "@/components/admin/status-badges";
import { LeadForm } from "./LeadForm";
import { ConvertLead } from "./ConvertLead";

export const metadata: Metadata = { title: "Pipeline" };
export const dynamic = "force-dynamic";

const COLUMNS: { key: PipelineStage; label: string }[] = [
  { key: "lead", label: "Lead" },
  { key: "discovery", label: "Discovery" },
  { key: "quote", label: "Quote" },
];

export default async function PipelinePage() {
  const { supabase } = await requireOwner();
  const leads = await loadPipeline(supabase);
  const byStage = (s: PipelineStage) => leads.filter((l) => l.stage === s);
  const openValue = leads.filter(isOpenLead).reduce((sum, l) => sum + leadAmount(l), 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Pipeline"
        subtitle={`Lead → Discovery → Quote → Signed or not signed. Open leads go stale after ${STALE_DAYS} days without activity.`}
        action={
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs uppercase tracking-wide text-fg-subtle">Open pipeline</div>
              <div className="text-lg font-semibold text-fg"><Money value={openValue} whole /></div>
            </div>
            <LeadForm />
          </div>
        }
      />

      {leads.length === 0 ? (
        <EmptyState title="No leads yet" hint="Signed leads become a client and a first deal." />
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            {COLUMNS.map(({ key, label }) => {
              const items = byStage(key);
              return (
                <section key={key} aria-label={label} className="flex flex-col gap-3">
                  <div className="flex items-center justify-between px-1">
                    <h2 className="text-sm font-semibold text-fg">{label}</h2>
                    <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs text-fg-muted">{items.length}</span>
                  </div>
                  {items.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-fg-subtle">Empty</div>
                  ) : (
                    <div className="flex flex-col gap-2">{items.map((l) => <LeadCard key={l.id} lead={l} />)}</div>
                  )}
                </section>
              );
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <ClosedList title="Signed" leads={byStage("signed")} />
            <ClosedList title="Not signed" leads={byStage("not_signed")} />
          </div>
        </>
      )}
    </div>
  );
}

function ClosedList({ title, leads }: { title: string; leads: PipelineLeadRow[] }) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold text-fg-muted">{title}</h2>
      {leads.length === 0 ? (
        <p className="text-sm text-fg-subtle">None.</p>
      ) : (
        <div className="flex flex-col gap-2">{leads.map((l) => <LeadCard key={l.id} lead={l} />)}</div>
      )}
    </section>
  );
}

function LeadValue({ lead }: { lead: PipelineLeadRow }) {
  if (lead.quote_amount != null) return <Money value={lead.quote_amount} whole />;
  const lo = lead.estimated_value;
  const hi = lead.estimated_value_max;
  if (lo == null) return null;
  if (hi != null && hi !== lo) return <><Money value={lo} whole />–<Money value={hi} whole /></>;
  return <Money value={lo} whole />;
}

function LeadCard({ lead }: { lead: PipelineLeadRow }) {
  const stale = isStaleLead(lead);
  const convertible = isOpenLead(lead) && !lead.converted_client_id;
  return (
    <Card className="p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-medium text-fg">{lead.name}</h3>
          <div className="truncate text-xs text-fg-subtle">
            {lead.contact_name ?? "—"}
            {lead.product ? ` · ${lead.product}` : ""}
          </div>
        </div>
        <LeadStageBadge stage={lead.stage} />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-fg-muted"><LeadValue lead={lead} /></span>
        {lead.nurture && <StatusPill tone="accent">Revisit</StatusPill>}
        {stale && <StatusPill tone="overdue">Stale {STALE_DAYS}d+</StatusPill>}
        <span className="ml-auto text-fg-subtle">Active {fmtDate(lead.last_activity_date)}</span>
      </div>
      {lead.not_signed_reason && <p className="mt-2 line-clamp-2 text-xs text-fg-muted">Reason: {lead.not_signed_reason}</p>}
      {!lead.converted_client_id && (
        <div className="mt-2 flex items-center gap-1 border-t border-border pt-2">
          <LeadForm lead={lead} />
          {convertible && <div className="ml-auto"><ConvertLead lead={lead} /></div>}
        </div>
      )}
    </Card>
  );
}
