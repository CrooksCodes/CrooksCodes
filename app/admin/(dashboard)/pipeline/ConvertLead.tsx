"use client";

import { useActionState, useState } from "react";
import { convertLead } from "./actions";
import type { FormState } from "@/lib/admin/form";
import type { PipelineLeadRow, Product } from "@/lib/admin/types";
import { isoToday } from "@/lib/admin/format";
import { Modal } from "@/components/admin/ui/Modal";
import { Button } from "@/components/admin/ui/Button";
import { Field, Input, Select, FormError } from "@/components/admin/ui/Field";

export function ConvertLead({ lead }: { lead: PipelineLeadRow }) {
  const [open, setOpen] = useState(false);
  const [product, setProduct] = useState<Product>(lead.product ?? "Website");
  const [state, action, pending] = useActionState<FormState, FormData>(async (prev, fd) => {
    const result = await convertLead(prev, fd);
    if (result.ok) setOpen(false);
    return result;
  }, {});
  const isGbp = product === "GBP";

  return (
    <>
      <Button size="sm" variant="subtle" onClick={() => setOpen(true)} aria-label={`Sign ${lead.name}`}>Sign →</Button>
      <Modal open={open} onClose={() => setOpen(false)} title={`Sign ${lead.name}`}>
        <form action={action} className="flex flex-col gap-4">
          <input type="hidden" name="lead_id" value={lead.id} />
          <p className="text-sm text-fg-muted">Creates a client from this lead, with its first deal.</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Product" htmlFor="cv-product">
              <Select id="cv-product" name="product" value={product} onChange={(e) => setProduct(e.target.value as Product)}>
                <option value="Website">Website</option>
                <option value="GBP">GBP</option>
              </Select>
            </Field>
            <Field label={isGbp ? "Monthly value" : "Value"} htmlFor="cv-value">
              <Input id="cv-value" name="value" type="number" step="0.01" min="0" defaultValue={lead.quote_amount ?? lead.estimated_value ?? ""} required autoFocus />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Signed date" htmlFor="cv-signed">
              <Input id="cv-signed" name="signed_date" type="date" defaultValue={isoToday()} />
            </Field>
            {isGbp && (
              <Field label="Billing day" htmlFor="cv-bday" hint="1–31">
                <Input id="cv-bday" name="billing_day" type="number" min="1" max="31" defaultValue={new Date().getDate()} />
              </Field>
            )}
          </div>
          <FormError message={state.error} />
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending ? "Converting…" : "Sign and create client"}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
