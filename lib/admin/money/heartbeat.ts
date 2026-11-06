// "Due today and soon" on the admin home: GBP billing, check-ins, website
// warranty or handover dates, and stale leads.
import type { ClientRow, DealRow, PaymentRow, PipelineLeadRow } from "../types";
import { daysUntil } from "../format";
import { adminPath } from "../routes";
import { gbpPaidStatus } from "./status";
import { groupByDeal, isDealActive } from "./radar";
import { isStaleLead, STALE_DAYS } from "./leads";

export type HeartbeatTone = "overdue" | "due";

export interface HeartbeatItem {
  id: string;
  title: string;
  sub: string;
  tone: HeartbeatTone;
  /** Lower sorts first. */
  order: number;
  href: string;
}

const CHECKIN_WINDOW = 7;
const WARRANTY_WINDOW = 14;
const BILLING_WINDOW = 7;

function relative(days: number, pastSuffix: string): string {
  if (days === 0) return "today";
  return days < 0 ? `${-days}d ${pastSuffix}` : `in ${days}d`;
}

export function buildHeartbeat(
  clients: ClientRow[],
  deals: DealRow[],
  payments: PaymentRow[],
  leads: PipelineLeadRow[],
  today = new Date(),
): HeartbeatItem[] {
  const items: HeartbeatItem[] = [];
  const nameOf = new Map(clients.map((c) => [c.id, c.name]));
  const byDeal = groupByDeal(payments);

  for (const deal of deals) {
    if (!isDealActive(deal)) continue;
    const name = nameOf.get(deal.client_id) ?? "Client";
    const href = adminPath.client(deal.client_id);

    if (deal.product === "GBP") {
      const { status } = gbpPaidStatus(deal, byDeal.get(deal.id) ?? [], today);
      const billingDay = deal.billing_day ?? 1;
      if (status === "overdue") {
        items.push({ id: `gbp-od-${deal.id}`, title: `${name}: GBP payment overdue`, sub: `Billing day ${billingDay}, this month unpaid`, tone: "overdue", order: -100, href });
      } else if (status === "not_yet") {
        const dueIn = billingDay - today.getDate();
        if (dueIn >= 0 && dueIn <= BILLING_WINDOW) {
          items.push({ id: `gbp-due-${deal.id}`, title: `${name}: GBP billing ${relative(dueIn, "ago")}`, sub: `Billing day ${billingDay}`, tone: "due", order: dueIn, href });
        }
      }

      const cd = daysUntil(deal.next_checkin_date, today);
      if (cd !== null && cd <= CHECKIN_WINDOW) {
        items.push({ id: `checkin-${deal.id}`, title: `${name}: monthly check-in ${relative(cd, "overdue")}`, sub: "Review check-in", tone: cd < 0 ? "overdue" : "due", order: cd < 0 ? -50 + cd : cd, href });
      }
    } else {
      const wd = daysUntil(deal.term_end_date, today);
      if (wd !== null && wd <= WARRANTY_WINDOW) {
        const label = deal.status === "warranty" ? "warranty ends" : "handover";
        items.push({ id: `warranty-${deal.id}`, title: `${name}: ${label} ${relative(wd, "ago")}`, sub: "Website milestone", tone: wd < 0 ? "overdue" : "due", order: wd < 0 ? -40 + wd : wd + 0.5, href });
      }
    }
  }

  for (const lead of leads) {
    if (!isStaleLead(lead, today)) continue;
    const d = daysUntil(lead.last_activity_date, today) ?? -STALE_DAYS;
    items.push({ id: `stale-${lead.id}`, title: `${lead.name}: lead stale ${-d}d`, sub: `No activity in ${STALE_DAYS}+ days`, tone: "overdue", order: -30, href: adminPath.pipeline });
  }

  return items.sort((a, b) => a.order - b.order);
}
