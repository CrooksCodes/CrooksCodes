import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/admin/auth";
import { loadClientDetail } from "@/lib/admin/queries";
import { uuid } from "@/lib/admin/form";
import { gbpPaidStatus, websiteProgress } from "@/lib/admin/money/status";
import { fmtDate, fmtMonth } from "@/lib/admin/format";
import { adminPath } from "@/lib/admin/routes";
import type { InvoiceRow, PaymentRow } from "@/lib/admin/types";
import { Card, CardHeader } from "@/components/admin/ui/Card";
import { Table, THead, TBody, Th, Tr, Td } from "@/components/admin/ui/DataTable";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { Money } from "@/components/admin/ui/Money";
import { StatusPill } from "@/components/admin/ui/StatusPill";
import { DealStageBadge, DeliveryFlag, GbpPaidBadge, InvoiceStatusBadge, WebsiteProgressBadge } from "@/components/admin/status-badges";
import { ClientForm } from "../ClientForm";
import { DealForm } from "./DealForm";
import { PaymentForm } from "./PaymentForm";
import { MarkReceived } from "./MarkReceived";

export const metadata: Metadata = { title: "Client" };
export const dynamic = "force-dynamic";

const METHOD: Record<PaymentRow["method"], string> = { etransfer: "E-transfer", other: "Other" };

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { supabase } = await requireOwner();
  const { id } = await params;
  if (!uuid.safeParse(id).success) notFound();

  const { client, deals, payments, invoices } = await loadClientDetail(supabase, id);
  if (!client) notFound();

  const contact = [client.contact_name, client.contact_email, client.contact_phone].filter(Boolean).join(" · ");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href={adminPath.clients} className="text-xs text-fg-muted hover:text-fg">← Clients</Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-fg">{client.name}</h1>
            <p className="mt-1 text-sm text-fg-muted">{contact || "No contact details"}</p>
            {client.address && <p className="text-sm text-fg-subtle">{client.address}</p>}
          </div>
          <div className="flex items-center gap-2">
            <StatusPill tone={client.status === "active" ? "accent" : "neutral"}>
              {client.status === "active" ? "Active" : "Past / completed"}
            </StatusPill>
            <ClientForm client={client} />
            <DealForm clientId={client.id} />
          </div>
        </div>
        {client.notes && <p className="mt-3 max-w-2xl whitespace-pre-line text-sm text-fg-muted">{client.notes}</p>}
      </div>

      {deals.length === 0 ? (
        <EmptyState title="No deals yet" hint="Add the first deal to start tracking money for this client." />
      ) : (
        deals.map((deal) => {
          const dealPayments = payments.filter((p) => p.deal_id === deal.id);
          const dealInvoices = invoices.filter((i) => i.deal_id === deal.id);
          const gbp = deal.product === "GBP" ? gbpPaidStatus(deal, dealPayments) : null;
          const web = deal.product === "Website" ? websiteProgress(deal, dealPayments) : null;

          return (
            <Card key={deal.id} className="overflow-hidden">
              <CardHeader
                title={
                  <span className="flex flex-wrap items-center gap-2">
                    <span>{deal.product}</span>
                    <Money value={deal.value} />
                    {deal.billing_type === "monthly" && <span className="text-xs text-fg-subtle">/mo</span>}
                    <DealStageBadge status={deal.status} />
                  </span>
                }
                action={
                  <div className="flex items-center gap-2">
                    <DealForm clientId={client.id} deal={deal} />
                    <PaymentForm deal={deal} />
                  </div>
                }
              />

              <dl className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
                <Meta label="Signed">{fmtDate(deal.signed_date)}</Meta>
                <Meta label="Go-live">{fmtDate(deal.go_live_date)}</Meta>
                <Meta label={deal.product === "GBP" ? "Term end" : "Warranty / handover"}>{fmtDate(deal.term_end_date)}</Meta>
                <Meta label="Paid status">
                  {gbp ? <GbpPaidBadge status={gbp.status} /> : web ? <WebsiteProgressBadge progress={web.progress} /> : "—"}
                </Meta>
                {deal.product === "GBP" && <Meta label="Next check-in">{fmtDate(deal.next_checkin_date)}</Meta>}
                {deal.product === "GBP" && <Meta label="Billing day">{deal.billing_day ?? "—"}</Meta>}
                {web && <Meta label="Remaining"><Money value={web.remaining} /></Meta>}
                <Meta label="Delivery"><DeliveryFlag ok={deal.delivery_flag} /></Meta>
              </dl>

              {dealPayments.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-fg-subtle">No payments recorded.</p>
              ) : (
                <Table>
                  <THead>
                    <Th>Type</Th>
                    <Th>Period</Th>
                    <Th align="right">Amount</Th>
                    <Th>Method</Th>
                    <Th>Status</Th>
                    <Th>Received</Th>
                    <Th align="right"><span className="sr-only">Actions</span></Th>
                  </THead>
                  <TBody>
                    {dealPayments.map((p) => {
                      const received = p.status === "received";
                      return (
                        <Tr key={p.id}>
                          <Td className="capitalize text-fg-muted">{p.kind}</Td>
                          <Td className="text-fg-muted">{fmtMonth(p.period_month)}</Td>
                          <Td align="right"><Money value={p.amount} /></Td>
                          <Td className="text-xs text-fg-subtle">{METHOD[p.method]}</Td>
                          <Td>{received ? <StatusPill tone="paid">Received</StatusPill> : <StatusPill tone="due">Pending</StatusPill>}</Td>
                          <Td className="text-fg-muted">{fmtDate(p.received_date)}</Td>
                          <Td align="right"><MarkReceived paymentId={p.id} received={received} /></Td>
                        </Tr>
                      );
                    })}
                  </TBody>
                </Table>
              )}

              {dealInvoices.length > 0 && <InvoiceList invoices={dealInvoices} />}
            </Card>
          );
        })
      )}
    </div>
  );
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface px-4 py-3">
      <dt className="text-xs uppercase tracking-wide text-fg-subtle">{label}</dt>
      <dd className="mt-1 text-sm text-fg">{children}</dd>
    </div>
  );
}

function InvoiceList({ invoices }: { invoices: InvoiceRow[] }) {
  return (
    <div className="border-t border-border">
      <h3 className="px-4 pt-3 text-xs font-medium uppercase tracking-wide text-fg-subtle">Invoices</h3>
      <Table>
        <THead>
          <Th>Number</Th>
          <Th align="right">Amount</Th>
          <Th>Status</Th>
          <Th>Due</Th>
        </THead>
        <TBody>
          {invoices.map((inv) => (
            <Tr key={inv.id}>
              <Td>{inv.number ?? "—"}</Td>
              <Td align="right"><Money value={inv.amount} /></Td>
              <Td><InvoiceStatusBadge status={inv.status} /></Td>
              <Td className="text-fg-muted">{fmtDate(inv.due_date)}</Td>
            </Tr>
          ))}
        </TBody>
      </Table>
    </div>
  );
}
