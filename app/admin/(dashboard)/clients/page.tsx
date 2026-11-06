import type { Metadata } from "next";
import Link from "next/link";
import { requireOwner } from "@/lib/admin/auth";
import { loadCoreData } from "@/lib/admin/queries";
import { buildRadarRows, pastClients, type RadarRow } from "@/lib/admin/money/radar";
import { fmtDate } from "@/lib/admin/format";
import { adminPath } from "@/lib/admin/routes";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader } from "@/components/admin/ui/Card";
import { Table, THead, TBody, Th, Tr, Td } from "@/components/admin/ui/DataTable";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { Money } from "@/components/admin/ui/Money";
import { DealStageBadge, GbpPaidBadge, WebsiteProgressBadge } from "@/components/admin/status-badges";
import { ClientForm } from "./ClientForm";

export const metadata: Metadata = { title: "Clients" };
export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const { supabase } = await requireOwner();
  const { clients, deals, payments } = await loadCoreData(supabase);
  const rows = buildRadarRows(clients, deals, payments);
  const websites = rows.filter((r) => r.deal.product === "Website");
  const gbp = rows.filter((r) => r.deal.product === "GBP");
  const past = pastClients(clients, deals);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Clients" subtitle="Every active deal. Paid status and stage are derived from payments." action={<ClientForm />} />

      {rows.length === 0 && (
        <EmptyState title="No active clients" hint="Signed leads from the pipeline land here." />
      )}

      {websites.length > 0 && (
        <Card className="overflow-hidden">
          <CardHeader title="Websites" action={<span className="text-xs text-fg-subtle">One-time builds</span>} />
          <Table>
            <THead>
              <Th>Client</Th>
              <Th>Stage</Th>
              <Th>Signed</Th>
              <Th>Go-live</Th>
              <Th>Warranty ends</Th>
              <Th align="right">Value</Th>
              <Th>Payment</Th>
            </THead>
            <TBody>
              {websites.map(({ client, deal, website }) => (
                <Tr key={deal.id}>
                  <ClientCell client={client} />
                  <Td><DealStageBadge status={deal.status} /></Td>
                  <Td className="text-fg-muted">{fmtDate(deal.signed_date)}</Td>
                  <Td className="text-fg-muted">{fmtDate(deal.go_live_date)}</Td>
                  <Td className="text-fg-muted">{fmtDate(deal.term_end_date)}</Td>
                  <Td align="right"><Money value={deal.value} /></Td>
                  <Td>
                    {website && (
                      <div className="flex flex-col items-start gap-1">
                        <WebsiteProgressBadge progress={website.progress} />
                        {website.remaining > 0 && <span className="text-xs text-fg-subtle"><Money value={website.remaining} /> left</span>}
                      </div>
                    )}
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        </Card>
      )}

      {gbp.length > 0 && (
        <Card className="overflow-hidden">
          <CardHeader title="GBP" action={<span className="text-xs text-fg-subtle">Recurring monthly</span>} />
          <Table>
            <THead>
              <Th>Client</Th>
              <Th>Status</Th>
              <Th>Signed</Th>
              <Th>Term end</Th>
              <Th>Check-in</Th>
              <Th align="right">Monthly</Th>
              <Th>This month</Th>
            </THead>
            <TBody>
              {gbp.map(({ client, deal, gbp: status }) => (
                <Tr key={deal.id}>
                  <ClientCell client={client} />
                  <Td><DealStageBadge status={deal.status} /></Td>
                  <Td className="text-fg-muted">{fmtDate(deal.signed_date)}</Td>
                  <Td className="text-fg-muted">{fmtDate(deal.term_end_date)}</Td>
                  <Td className="text-fg-muted">{fmtDate(deal.next_checkin_date)}</Td>
                  <Td align="right"><Money value={deal.value} /><span className="text-fg-subtle">/mo</span></Td>
                  <Td>{status && <GbpPaidBadge status={status.status} />}</Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        </Card>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-fg-muted">Past / completed</h2>
        {past.length === 0 ? (
          <p className="text-sm text-fg-subtle">No past clients.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((c) => (
              <Card key={c.id} className="px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <Link href={adminPath.client(c.id)} className="min-w-0 truncate font-medium text-fg hover:text-accent hover:underline">
                    {c.name}
                  </Link>
                  <ClientForm client={c} />
                </div>
                <div className="truncate text-xs text-fg-subtle">{c.contact_name ?? "—"}</div>
                {c.notes && <div className="mt-2 line-clamp-3 text-xs text-fg-muted">{c.notes}</div>}
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ClientCell({ client }: { client: RadarRow["client"] }) {
  const contact = [client.contact_name, client.contact_email].filter(Boolean).join(" · ");
  return (
    <Td>
      <div className="max-w-[16rem]">
        <Link href={adminPath.client(client.id)} className="block truncate font-medium text-fg hover:text-accent hover:underline">
          {client.name}
        </Link>
        <div className="truncate text-xs text-fg-subtle">{contact || "—"}</div>
      </div>
    </Td>
  );
}
