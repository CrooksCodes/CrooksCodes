// Ledger figures, computed from payments and draws. Nothing here is typed in.
import type { DealRow, DrawRow, PaymentRow } from "../types";
import { currentPeriod, round2 } from "../format";

export interface Ledger {
  /** All received payments. */
  received: number;
  /** All draws taken. */
  drawn: number;
  /** Received minus drawn: money in the business account not yet drawn. */
  balance: number;
}

export function computeLedger(
  payments: Pick<PaymentRow, "status" | "amount">[],
  draws: Pick<DrawRow, "amount">[],
): Ledger {
  const received = payments
    .filter((p) => p.status === "received")
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const drawn = draws.reduce((sum, d) => sum + Number(d.amount), 0);
  return { received: round2(received), drawn: round2(drawn), balance: round2(received - drawn) };
}

function isRecurring(deal: Pick<DealRow, "product" | "status">): boolean {
  return deal.product === "GBP" && (deal.status === "active" || deal.status === "mtm");
}

/** Monthly recurring revenue: active GBP deals. */
export function computeMRR(deals: Pick<DealRow, "product" | "status" | "value">[]): number {
  return round2(deals.filter(isRecurring).reduce((sum, d) => sum + Number(d.value), 0));
}

/** Active GBP value not yet received for the current month. */
export function computeAR(
  deals: Pick<DealRow, "id" | "product" | "status" | "value">[],
  payments: Pick<PaymentRow, "deal_id" | "status" | "period_month">[],
  today = new Date(),
): number {
  const period = currentPeriod(today);
  const paid = new Set(
    payments.filter((p) => p.status === "received" && p.period_month === period).map((p) => p.deal_id),
  );
  return round2(
    deals.filter((d) => isRecurring(d) && !paid.has(d.id)).reduce((sum, d) => sum + Number(d.value), 0),
  );
}
