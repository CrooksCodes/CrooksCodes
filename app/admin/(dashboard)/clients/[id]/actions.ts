"use server";

import { z } from "zod";
import { requireOwner } from "@/lib/admin/auth";
import { checkbox, dateN, emptyToNull, firstError, formObject, textN, uuid, type FormState } from "@/lib/admin/form";
import { isoToday } from "@/lib/admin/format";
import { revalidateMoney } from "../../revalidate";

const DealSchema = z.object({
  id: uuid.optional(),
  client_id: uuid,
  product: z.enum(["Website", "GBP"]),
  value: z.coerce.number().nonnegative().max(10_000_000),
  billing_type: z.enum(["one_time", "monthly"]),
  status: z.enum(["signed", "in_build", "live", "warranty", "handover", "completed", "active", "mtm", "cancelled"]),
  signed_date: dateN,
  go_live_date: dateN,
  term_end_date: dateN,
  next_checkin_date: dateN,
  billing_day: z.preprocess(emptyToNull, z.coerce.number().int().min(1).max(31).nullable()),
  min_term_months: z.coerce.number().int().positive().max(120).default(6),
  delivery_flag: checkbox,
});

export async function saveDeal(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireOwner();
  const raw = formObject(formData);
  const parsed = DealSchema.safeParse({ ...raw, id: raw.id || undefined, delivery_flag: raw.delivery_flag ?? false });
  if (!parsed.success) return firstError(parsed.error, "Invalid deal.");

  const { id, client_id, ...values } = parsed.data;
  const { error } = id
    ? await supabase.from("deals").update(values).eq("id", id).eq("client_id", client_id)
    : await supabase.from("deals").insert({ client_id, ...values });
  if (error) return { error: "Could not save the deal." };

  revalidateMoney(client_id);
  return { ok: true };
}

const PaymentSchema = z.object({
  deal_id: uuid,
  amount: z.coerce.number().positive("Amount must be greater than zero.").max(10_000_000),
  method: z.enum(["etransfer", "other"]).default("etransfer"),
  status: z.enum(["pending", "received"]).default("received"),
  kind: z.enum(["deposit", "final", "monthly", "other"]),
  due_date: dateN,
  received_date: dateN,
  received_into: textN(100),
  period_month: z.preprocess(emptyToNull, z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Use YYYY-MM.").nullable()),
});

export async function addPayment(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireOwner();
  const parsed = PaymentSchema.safeParse(formObject(formData));
  if (!parsed.success) return firstError(parsed.error, "Invalid payment.");

  // client_id comes from the deal, never from the form.
  const { data: deal } = await supabase.from("deals").select("id, client_id").eq("id", parsed.data.deal_id).maybeSingle();
  if (!deal) return { error: "Deal not found." };

  const values = { ...parsed.data, client_id: deal.client_id };
  if (values.status === "received" && !values.received_date) values.received_date = isoToday();
  if (values.status === "pending") values.received_date = null;

  const { error } = await supabase.from("payments").insert(values);
  if (error) return { error: "Could not record the payment." };

  revalidateMoney(deal.client_id);
  return { ok: true };
}

/** Toggle a payment between received and pending. */
export async function setPaymentReceived(paymentId: string, received: boolean): Promise<FormState> {
  const { supabase } = await requireOwner();
  const id = uuid.safeParse(paymentId);
  if (!id.success || typeof received !== "boolean") return { error: "Invalid payment." };

  const { data: pay } = await supabase.from("payments").select("id, client_id, received_date").eq("id", id.data).maybeSingle();
  if (!pay) return { error: "Payment not found." };

  const { error } = await supabase
    .from("payments")
    .update({ status: received ? "received" : "pending", received_date: received ? (pay.received_date ?? isoToday()) : null })
    .eq("id", pay.id);
  if (error) return { error: "Could not update the payment." };

  revalidateMoney(pay.client_id);
  return { ok: true };
}
