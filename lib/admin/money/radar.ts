// The clients radar: one row per active deal, with derived paid status.
import type { ClientRow, DealRow, PaymentRow } from "../types";
import { gbpPaidStatus, websiteProgress, type GbpPaidStatus, type WebsiteProgress } from "./status";

const WEBSITE_ACTIVE = new Set<DealRow["status"]>(["signed", "in_build", "live", "warranty", "handover"]);
const GBP_ACTIVE = new Set<DealRow["status"]>(["active", "mtm"]);

export function isDealActive(deal: Pick<DealRow, "product" | "status">): boolean {
  return deal.product === "GBP" ? GBP_ACTIVE.has(deal.status) : WEBSITE_ACTIVE.has(deal.status);
}

export interface RadarRow {
  client: ClientRow;
  deal: DealRow;
  gbp: { status: GbpPaidStatus; period: string } | null;
  website: { progress: WebsiteProgress; paid: number; remaining: number } | null;
}

export function groupByDeal(payments: PaymentRow[]): Map<string, PaymentRow[]> {
  const map = new Map<string, PaymentRow[]>();
  for (const p of payments) {
    const list = map.get(p.deal_id);
    if (list) list.push(p);
    else map.set(p.deal_id, [p]);
  }
  return map;
}

export function buildRadarRows(
  clients: ClientRow[],
  deals: DealRow[],
  payments: PaymentRow[],
  today = new Date(),
): RadarRow[] {
  const clientById = new Map(clients.map((c) => [c.id, c]));
  const byDeal = groupByDeal(payments);
  const rows: RadarRow[] = [];
  for (const deal of deals) {
    if (!isDealActive(deal)) continue;
    const client = clientById.get(deal.client_id);
    if (!client) continue;
    const ps = byDeal.get(deal.id) ?? [];
    rows.push({
      client,
      deal,
      gbp: deal.product === "GBP" ? gbpPaidStatus(deal, ps, today) : null,
      website: deal.product === "Website" ? websiteProgress(deal, ps) : null,
    });
  }
  return rows.sort((a, b) => a.client.name.localeCompare(b.client.name));
}

/** Clients with no active deal. */
export function pastClients(clients: ClientRow[], deals: DealRow[]): ClientRow[] {
  const active = new Set(deals.filter(isDealActive).map((d) => d.client_id));
  return clients.filter((c) => !active.has(c.id)).sort((a, b) => a.name.localeCompare(b.name));
}
