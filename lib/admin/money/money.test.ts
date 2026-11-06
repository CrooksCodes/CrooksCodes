import { describe, expect, it } from "vitest";
import { computeAR, computeLedger, computeMRR } from "./compute";
import { gbpPaidStatus, websiteProgress } from "./status";
import { isStaleLead, leadAmount } from "./leads";
import { buildHeartbeat } from "./heartbeat";
import type { ClientRow, DealRow, PaymentRow, PipelineLeadRow } from "../types";

const TODAY = new Date(2026, 10, 15); // 15 Nov 2026, local time
const stamp = { created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" };

const client = (id: string, name = "Example Co"): ClientRow => ({
  id, name, contact_name: null, contact_email: null, contact_phone: null, address: null, status: "active", notes: null, ...stamp,
});
const deal = (over: Partial<DealRow>): DealRow => ({
  id: "d1", client_id: "c1", product: "Website", value: 2000, billing_type: "one_time", status: "in_build",
  signed_date: null, go_live_date: null, term_end_date: null, next_checkin_date: null, billing_day: null,
  min_term_months: 6, delivery_flag: false, ...stamp, ...over,
});
const pay = (over: Partial<PaymentRow>): PaymentRow => ({
  id: "p1", deal_id: "d1", client_id: "c1", amount: 100, method: "etransfer", status: "received", kind: "other",
  due_date: null, received_date: null, received_into: null, period_month: null, invoice_id: null, ...stamp, ...over,
});
const lead = (over: Partial<PipelineLeadRow>): PipelineLeadRow => ({
  id: "l1", name: "Sample Lead", contact_name: null, contact_email: null, contact_phone: null, product: "Website",
  stage: "lead", estimated_value: null, estimated_value_max: null, quote_amount: null, last_activity_date: null,
  not_signed_reason: null, nurture: false, converted_client_id: null, notes: null, ...stamp, ...over,
});

describe("computeLedger", () => {
  it("counts only received payments and subtracts draws", () => {
    const l = computeLedger(
      [pay({ amount: 1000 }), pay({ amount: 450.1 }), pay({ amount: 999, status: "pending" })],
      [{ amount: 300.05 }],
    );
    expect(l).toEqual({ received: 1450.1, drawn: 300.05, balance: 1150.05 });
  });

  it("is zero with no data", () => {
    expect(computeLedger([], [])).toEqual({ received: 0, drawn: 0, balance: 0 });
  });
});

describe("MRR and AR", () => {
  const deals = [
    deal({ id: "g1", product: "GBP", status: "active", value: 450 }),
    deal({ id: "g2", product: "GBP", status: "mtm", value: 300 }),
    deal({ id: "g3", product: "GBP", status: "cancelled", value: 999 }),
    deal({ id: "w1", product: "Website", status: "live", value: 5000 }),
  ];

  it("MRR sums active and month-to-month GBP only", () => {
    expect(computeMRR(deals)).toBe(750);
  });

  it("AR leaves out deals paid for this month", () => {
    const payments = [pay({ deal_id: "g1", period_month: "2026-11" }), pay({ deal_id: "g2", period_month: "2026-10" })];
    expect(computeAR(deals, payments, TODAY)).toBe(300);
  });
});

describe("paid status", () => {
  it("GBP: paid, not yet, overdue", () => {
    expect(gbpPaidStatus({ billing_day: 20 }, [pay({ period_month: "2026-11" })], TODAY).status).toBe("paid");
    expect(gbpPaidStatus({ billing_day: 20 }, [], TODAY).status).toBe("not_yet");
    expect(gbpPaidStatus({ billing_day: 10 }, [], TODAY).status).toBe("overdue");
    expect(gbpPaidStatus({ billing_day: 10 }, [pay({ period_month: "2026-11", status: "pending" })], TODAY).status).toBe("overdue");
  });

  it("website: none, deposit, final, paid", () => {
    expect(websiteProgress({ value: 2000 }, []).progress).toBe("none");
    expect(websiteProgress({ value: 2000 }, [pay({ amount: 1000 })])).toEqual({ progress: "deposit", paid: 1000, remaining: 1000 });
    expect(websiteProgress({ value: 2000 }, [pay({ amount: 500 }), pay({ amount: 500 })]).progress).toBe("final");
    expect(websiteProgress({ value: 2000 }, [pay({ amount: 1000 }), pay({ amount: 1000 })]).progress).toBe("paid");
  });
});

describe("stale leads (all leads, open stages)", () => {
  it("flags any open lead quiet for 90+ days", () => {
    expect(isStaleLead(lead({ last_activity_date: "2026-08-17" }), TODAY)).toBe(true); // 90 days
    expect(isStaleLead(lead({ last_activity_date: "2026-08-18" }), TODAY)).toBe(false); // 89 days
    expect(isStaleLead(lead({ stage: "quote", last_activity_date: "2026-01-01" }), TODAY)).toBe(true);
  });

  it("never flags closed leads or leads with no date", () => {
    expect(isStaleLead(lead({ stage: "signed", last_activity_date: "2026-01-01" }), TODAY)).toBe(false);
    expect(isStaleLead(lead({ stage: "not_signed", last_activity_date: "2026-01-01" }), TODAY)).toBe(false);
    expect(isStaleLead(lead({ last_activity_date: null }), TODAY)).toBe(false);
  });

  it("weights quote over range over estimate", () => {
    expect(leadAmount({ quote_amount: 900, estimated_value: 100, estimated_value_max: 200 })).toBe(900);
    expect(leadAmount({ quote_amount: null, estimated_value: 100, estimated_value_max: 200 })).toBe(150);
    expect(leadAmount({ quote_amount: null, estimated_value: 100, estimated_value_max: null })).toBe(100);
    expect(leadAmount({ quote_amount: null, estimated_value: null, estimated_value_max: null })).toBe(0);
  });
});

describe("buildHeartbeat", () => {
  it("orders overdue first and links to the client page", () => {
    const items = buildHeartbeat(
      [client("c1"), client("c2", "Sample Studio")],
      [
        deal({ id: "g1", client_id: "c1", product: "GBP", status: "active", billing_day: 10 }),
        deal({ id: "w1", client_id: "c2", product: "Website", status: "warranty", term_end_date: "2026-11-20" }),
      ],
      [],
      [lead({ last_activity_date: "2026-01-01" })],
      TODAY,
    );
    expect(items.map((i) => i.id)).toEqual(["gbp-od-g1", "stale-l1", "warranty-w1"]);
    expect(items[0].href).toBe("/admin/clients/c1");
    expect(items[2].title).toBe("Sample Studio: warranty ends in 5d");
  });
});
