// Shared form parsing helpers for server actions.
import { z } from "zod";

export const emptyToNull = (v: unknown) => (typeof v === "string" && v.trim() === "" ? null : v);
export const checkbox = z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean());
export const uuid = z.string().uuid();
export const textN = (max = 500) => z.preprocess(emptyToNull, z.string().trim().max(max).nullable());
export const dateN = z.preprocess(emptyToNull, z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a full date.").nullable());
export const moneyN = z.preprocess(emptyToNull, z.coerce.number().nonnegative().max(10_000_000).nullable());
export const emailN = z.preprocess(emptyToNull, z.string().trim().max(254).email("Invalid email.").nullable());

export type FormState = { error?: string; ok?: boolean };

export function firstError(err: z.ZodError, fallback: string): FormState {
  return { error: err.issues[0]?.message ?? fallback };
}

/** Plain object from FormData, dropping Next's internal $ACTION fields. */
export function formObject(fd: FormData): Record<string, FormDataEntryValue> {
  const out: Record<string, FormDataEntryValue> = {};
  for (const [k, v] of fd.entries()) if (!k.startsWith("$")) out[k] = v;
  return out;
}
