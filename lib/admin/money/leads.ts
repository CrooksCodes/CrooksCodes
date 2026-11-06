import type { PipelineLeadRow } from "../types";
import { daysUntil } from "../format";

export const STALE_DAYS = 90;

const OPEN_STAGES = new Set<PipelineLeadRow["stage"]>(["lead", "discovery", "quote"]);

export function isOpenLead(lead: Pick<PipelineLeadRow, "stage">): boolean {
  return OPEN_STAGES.has(lead.stage);
}

/**
 * An open lead with no activity for 90 days or more. Applies to every lead;
 * signed and not-signed leads are closed, so they never go stale.
 */
export function isStaleLead(
  lead: Pick<PipelineLeadRow, "stage" | "last_activity_date">,
  today = new Date(),
): boolean {
  if (!isOpenLead(lead)) return false;
  const d = daysUntil(lead.last_activity_date, today);
  return d !== null && d <= -STALE_DAYS;
}

/** Pipeline weighting: a quote wins, a range counts at its midpoint, else the estimate. */
export function leadAmount(
  lead: Pick<PipelineLeadRow, "quote_amount" | "estimated_value" | "estimated_value_max">,
): number {
  if (lead.quote_amount != null) return Number(lead.quote_amount);
  const lo = lead.estimated_value;
  const hi = lead.estimated_value_max;
  if (lo != null && hi != null) return (Number(lo) + Number(hi)) / 2;
  return Number(lo ?? 0);
}
