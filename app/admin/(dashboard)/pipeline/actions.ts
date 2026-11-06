"use server";

import { z } from "zod";
import { requireOwner } from "@/lib/admin/auth";
import { checkbox, dateN, emailN, emptyToNull, firstError, formObject, moneyN, textN, uuid, type FormState } from "@/lib/admin/form";
import { isoToday } from "@/lib/admin/format";
import { adminPath } from "@/lib/admin/routes";
import { revalidatePath } from "next/cache";
import { revalidateMoney } from "../revalidate";

const LeadSchema = z
  .object({
    id: uuid.optional(),
    name: z.string().trim().min(1, "Name is required.").max(200),
    contact_name: textN(200),
    contact_email: emailN,
    contact_phone: textN(50),
    product: z.preprocess(emptyToNull, z.enum(["Website", "GBP"]).nullable()),
    stage: z.enum(["lead", "discovery", "quote", "not_signed"]),
    estimated_value: moneyN,
    estimated_value_max: moneyN,
    quote_amount: moneyN,
    last_activity_date: dateN,
    not_signed_reason: textN(500),
    nurture: checkbox,
    notes: textN(2000),
  })
  .refine((d) => d.estimated_value_max == null || d.estimated_value == null || d.estimated_value_max >= d.estimated_value, {
    message: "The high estimate must be at or above the low estimate.",
    path: ["estimated_value_max"],
  });

export async function saveLead(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireOwner();
  const raw = formObject(formData);
  const parsed = LeadSchema.safeParse({ ...raw, id: raw.id || undefined, nurture: raw.nurture ?? false });
  if (!parsed.success) return firstError(parsed.error, "Invalid lead.");

  const { id, ...values } = parsed.data;
  const { error } = id
    ? await supabase.from("pipeline_leads").update(values).eq("id", id).is("converted_client_id", null)
    : await supabase.from("pipeline_leads").insert(values);
  if (error) return { error: "Could not save the lead." };

  revalidatePath(adminPath.pipeline);
  revalidatePath(adminPath.home);
  return { ok: true };
}

const ConvertSchema = z.object({
  lead_id: uuid,
  product: z.enum(["Website", "GBP"]),
  value: z.coerce.number().nonnegative().max(10_000_000),
  signed_date: dateN,
  billing_day: z.preprocess(emptyToNull, z.coerce.number().int().min(1).max(31).nullable()),
});

/** Signed: turn the lead into a client and its first deal. */
export async function convertLead(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireOwner();
  const parsed = ConvertSchema.safeParse(formObject(formData));
  if (!parsed.success) return firstError(parsed.error, "Invalid conversion.");
  const { lead_id, product, value, signed_date, billing_day } = parsed.data;

  const { data: lead } = await supabase.from("pipeline_leads").select("*").eq("id", lead_id).maybeSingle();
  if (!lead) return { error: "Lead not found." };
  if (lead.converted_client_id) return { error: "This lead was already converted." };

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .insert({ name: lead.name, contact_name: lead.contact_name, contact_email: lead.contact_email, contact_phone: lead.contact_phone, status: "active" })
    .select("id")
    .single();
  if (clientError || !client) return { error: "Could not create the client." };

  const gbp = product === "GBP";
  const { error: dealError } = await supabase.from("deals").insert({
    client_id: client.id,
    product,
    value,
    billing_type: gbp ? "monthly" : "one_time",
    status: gbp ? "active" : "signed",
    signed_date: signed_date ?? isoToday(),
    billing_day: gbp ? billing_day : null,
  });
  if (dealError) return { error: "The client was created, but the deal was not. Add the deal from the client page." };

  await supabase
    .from("pipeline_leads")
    .update({ stage: "signed", converted_client_id: client.id, last_activity_date: isoToday() })
    .eq("id", lead.id);

  revalidatePath(adminPath.pipeline);
  revalidateMoney(client.id);
  return { ok: true };
}
