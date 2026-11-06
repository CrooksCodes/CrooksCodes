// Paid status is always derived from payments, never set by hand.
import type { DealRow, PaymentRow } from "../types";
import { currentPeriod } from "../format";

export type GbpPaidStatus = "paid" | "not_yet" | "overdue";

/**
 * GBP status for the current month: paid if a received payment exists for the
 * period, otherwise overdue once the billing day has passed.
 */
export function gbpPaidStatus(
  deal: Pick<DealRow, "billing_day">,
  payments: Pick<PaymentRow, "status" | "period_month">[],
  today = new Date(),
): { status: GbpPaidStatus; period: string } {
  const period = currentPeriod(today);
  if (payments.some((p) => p.status === "received" && p.period_month === period)) {
    return { status: "paid", period };
  }
  const billingDay = deal.billing_day ?? 1;
  return { status: today.getDate() > billingDay ? "overdue" : "not_yet", period };
}

export type WebsiteProgress = "none" | "deposit" | "final" | "paid";

/** Website progress from received payments against the deal value. */
export function websiteProgress(
  deal: Pick<DealRow, "value">,
  payments: Pick<PaymentRow, "status" | "amount">[],
): { progress: WebsiteProgress; paid: number; remaining: number } {
  const received = payments.filter((p) => p.status === "received");
  const paid = received.reduce((sum, p) => sum + Number(p.amount), 0);
  const remaining = Math.max(0, Number(deal.value) - paid);

  let progress: WebsiteProgress;
  if (paid <= 0) progress = "none";
  else if (remaining <= 0.005) progress = "paid";
  else progress = received.length >= 2 ? "final" : "deposit";

  return { progress, paid, remaining };
}
