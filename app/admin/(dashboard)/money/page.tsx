import type { Metadata } from "next";
import { requireOwner } from "@/lib/admin/auth";
import { loadCoreData, loadInvoices } from "@/lib/admin/queries";
import { computeAR, computeLedger, computeMRR } from "@/lib/admin/money/compute";
import { fmtDate, fmtMonth, isoToday } from "@/lib/admin/format";
import type { PaymentRow } from "@/lib/admin/types";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader } from "@/components/admin/ui/Card";
import { StatTile } from "@/components/admin/ui/StatTile";
import { Table, THead, TBody, Th, Tr, Td } from "@/components/admin/ui/DataTable";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { Money } from "@/components/admin/ui/Money";
import { StatusPill } from "@/components/admin/ui/StatusPill";
import { InvoiceStatusBadge } from "@/components/admin/status-badges";
import { RecordDraw } from "./RecordDraw";

export const metadata: Metadata = { title: "Money" };
export const dynamic = "force-dynamic";

const METHOD: Record<PaymentRow["method"], string> = { etransfer: "E-transfer", other: "Other" };

export default async function MoneyPage() {
  const { supabase } = await requireOwner();
  const [{ clients, deals, payments, draws }, invoices] = await Promise.all([loadCoreData(supabase), loadInvoices(supabase)]);

  const ledger = computeLedger(payments, draws);
  const mrr = computeMRR(deals);
  const ar = computeAR(deals, payments);
  const nameOf = new Map(clients.map((c) => [c.id, c.name]));
  const clientName = (id: string) => nameOf.get(id) ?? "—";

  // GBP reads as a billing history by month, websites as milestone payments.
  const productOf = new Map(deals.map((d) => [d.id, d.product]));
  const sorted = [...payments].sort((a, b) => (b.received_date ?? b.created_at).localeCompare(a.received_date ?? a.created_at));
  const gbp = sorted.filter((p) => productOf.get(p.deal_id) === "GBP").slice(0, 12);
  const oneTime = sorted.filter((p) => productOf.get(p.deal_id) !== "GBP").slice(0, 12);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Money" subtitle="Computed from received payments and draws." action={<RecordDraw today={isoToday()} />} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="MRR" value={<Money value={mrr} whole />} sub="Active GBP monthly" tone="accent" />
        <StatTile label="Undrawn" value={<Money value={ledger.balance} whole />} sub="Received minus draws" />
        <StatTile label="Unpaid this month" value={<Money value={ar} whole />} sub="GBP not yet collected" tone={ar > 0 ? "due" : undefined} />
        <StatTile label="Received" value={<Money value={ledger.received} whole />} sub={<><Money value={ledger.drawn} /> drawn</>} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <PaymentsCard title="GBP monthly" subtitle="Recurring billing" column="period" payments={gbp} clientName={clientName} />
          <PaymentsCard title="Website payments" subtitle="One-time milestones" column="type" payments={oneTime} clientName={clientName} />
        </div>
        <Card className="self-start overflow-hidden">
          <CardHeader title="Draws" />
          {draws.length === 0 ? (
            <EmptyState title="No draws recorded" className="rounded-none border-0" />
          ) : (
            <Table>
              <THead>
                <Th>Date</Th>
                <Th align="right">Amount</Th>
                <Th>Note</Th>
              </THead>
              <TBody>
                {draws.map((d) => (
                  <Tr key={d.id}>
                    <Td className="whitespace-nowrap text-fg-muted">{fmtDate(d.date)}</Td>
                    <Td align="right"><Money value={d.amount} /></Td>
                    <Td className="max-w-[12rem] truncate text-xs text-fg-muted">{d.note ?? "—"}</Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          )}
        </Card>
      </div>

      {invoices.length > 0 && (
        <Card className="overflow-hidden">
          <CardHeader title="Invoices" action={<span className="text-xs text-fg-subtle">Historical records</span>} />
          <Table>
            <THead>
              <Th>Number</Th>
              <Th>Client</Th>
              <Th align="right">Amount</Th>
              <Th>Status</Th>
              <Th>Issued</Th>
              <Th>Due</Th>
            </THead>
            <TBody>
              {invoices.map((inv) => (
                <Tr key={inv.id}>
                  <Td>{inv.number ?? "—"}</Td>
                  <Td>{clientName(inv.client_id)}</Td>
                  <Td align="right"><Money value={inv.amount} /></Td>
                  <Td><InvoiceStatusBadge status={inv.status} /></Td>
                  <Td className="text-fg-muted">{fmtDate(inv.issued_date)}</Td>
                  <Td className="text-fg-muted">{fmtDate(inv.due_date)}</Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

function PaymentsCard({ title, subtitle, column, payments, clientName }: {
  title: string;
  subtitle: string;
  column: "period" | "type";
  payments: PaymentRow[];
  clientName: (id: string) => string;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader title={title} action={<span className="text-xs text-fg-subtle">{subtitle}</span>} />
      {payments.length === 0 ? (
        <EmptyState title="None yet" className="rounded-none border-0" />
      ) : (
        <Table>
          <THead>
            <Th>Client</Th>
            <Th>{column === "period" ? "Period" : "Type"}</Th>
            <Th align="right">Amount</Th>
            <Th>Method</Th>
            <Th>Status</Th>
            <Th>Received</Th>
          </THead>
          <TBody>
            {payments.map((p) => (
              <Tr key={p.id}>
                <Td>{clientName(p.client_id)}</Td>
                <Td className="capitalize text-fg-muted">{column === "period" ? fmtMonth(p.period_month) : p.kind}</Td>
                <Td align="right"><Money value={p.amount} /></Td>
                <Td className="text-xs text-fg-subtle">{METHOD[p.method]}</Td>
                <Td>{p.status === "received" ? <StatusPill tone="paid">Received</StatusPill> : <StatusPill tone="due">Pending</StatusPill>}</Td>
                <Td className="text-fg-muted">{fmtDate(p.received_date)}</Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      )}
    </Card>
  );
}
