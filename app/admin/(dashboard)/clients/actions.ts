"use server";

import { z } from "zod";
import { requireOwner } from "@/lib/admin/auth";
import { emailN, firstError, textN, uuid, type FormState } from "@/lib/admin/form";
import { revalidateMoney } from "../revalidate";

const ClientSchema = z.object({
  id: uuid.optional(),
  name: z.string().trim().min(1, "Name is required.").max(200),
  contact_name: textN(200),
  contact_email: emailN,
  contact_phone: textN(50),
  address: textN(300),
  status: z.enum(["active", "past_completed"]),
  notes: textN(2000),
});

export async function saveClient(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireOwner();
  const parsed = ClientSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    contact_name: formData.get("contact_name"),
    contact_email: formData.get("contact_email"),
    contact_phone: formData.get("contact_phone"),
    address: formData.get("address"),
    status: formData.get("status"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) return firstError(parsed.error, "Invalid client.");

  const { id, ...values } = parsed.data;
  const { error } = id
    ? await supabase.from("clients").update(values).eq("id", id)
    : await supabase.from("clients").insert(values);
  if (error) return { error: "Could not save the client." };

  revalidateMoney(id);
  return { ok: true };
}
