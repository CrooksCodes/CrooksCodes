"use server";

import { z } from "zod";
import { requireOwner } from "@/lib/admin/auth";
import { firstError, textN, type FormState } from "@/lib/admin/form";
import { revalidateMoney } from "../revalidate";

const DrawSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than zero.").max(10_000_000),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date."),
  note: textN(500),
});

/** Record a draw. The audit trigger logs it. */
export async function recordDraw(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireOwner();
  const parsed = DrawSchema.safeParse({ amount: formData.get("amount"), date: formData.get("date"), note: formData.get("note") });
  if (!parsed.success) return firstError(parsed.error, "Invalid draw.");

  const { error } = await supabase.from("draws").insert(parsed.data);
  if (error) return { error: "Could not record the draw." };

  revalidateMoney();
  return { ok: true };
}
