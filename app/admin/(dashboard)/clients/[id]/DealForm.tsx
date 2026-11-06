"use client";

import { useActionState, useState } from "react";
import { saveDeal } from "./actions";
import type { FormState } from "@/lib/admin/form";
import type { DealRow, Product } from "@/lib/admin/types";
import { Modal } from "@/components/admin/ui/Modal";
import { Button, InlineButton } from "@/components/admin/ui/Button";
import { Checkbox, Field, Input, Select, FormError } from "@/components/admin/ui/Field";

export function DealForm({ clientId, deal }: { clientId: string; deal?: DealRow }) {
  const editing = !!deal;
  const [open, setOpen] = useState(false);
  const [product, setProduct] = useState<Product>(deal?.product ?? "Website");
  const [state, action, pending] = useActionState<FormState, FormData>(async (prev, fd) => {
    const result = await saveDeal(prev, fd);
    if (result.ok) setOpen(false);
    return result;
  }, {});
  const isGbp = product === "GBP";

  return (
    <>
      {editing ? (
        <InlineButton onClick={() => setOpen(true)}>Edit deal</InlineButton>
      ) : (
        <Button size="sm" onClick={() => setOpen(true)}>+ New deal</Button>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit deal" : "New deal"} className="max-w-2xl">
        <form action={action} className="flex flex-col gap-4">
          <input type="hidden" name="client_id" value={clientId} />
          {editing && <input type="hidden" name="id" value={deal.id} />}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field label="Product" htmlFor="d-product">
              <Select id="d-product" name="product" value={product} onChange={(e) => setProduct(e.target.value as Product)}>
                <option value="Website">Website</option>
                <option value="GBP">GBP</option>
              </Select>
            </Field>
            <Field label={isGbp ? "Monthly value" : "Value"} htmlFor="d-value">
              <Input id="d-value" name="value" type="number" step="0.01" min="0" inputMode="decimal" defaultValue={deal?.value ?? ""} required />
            </Field>
            <Field label="Billing" htmlFor="d-billing">
              <Select id="d-billing" name="billing_type" key={`b-${product}`} defaultValue={deal?.billing_type ?? (isGbp ? "monthly" : "one_time")}>
                <option value="one_time">One-time</option>
                <option value="monthly">Monthly</option>
              </Select>
            </Field>
            <Field label="Status" htmlFor="d-status">
              <Select id="d-status" name="status" key={`s-${product}`} defaultValue={deal?.product === product ? deal.status : isGbp ? "active" : "signed"}>
                {isGbp ? (
                  <>
                    <option value="active">Active</option>
                    <option value="mtm">Month-to-month</option>
                    <option value="cancelled">Cancelled</option>
                  </>
                ) : (
                  <>
                    <option value="signed">Signed</option>
                    <option value="in_build">In build</option>
                    <option value="live">Live</option>
                    <option value="warranty">Warranty</option>
                    <option value="handover">Handover</option>
                    <option value="completed">Completed</option>
                  </>
                )}
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field label="Signed" htmlFor="d-signed">
              <Input id="d-signed" name="signed_date" type="date" defaultValue={deal?.signed_date ?? ""} />
            </Field>
            <Field label="Go-live" htmlFor="d-golive">
              <Input id="d-golive" name="go_live_date" type="date" defaultValue={deal?.go_live_date ?? ""} />
            </Field>
            <Field label={isGbp ? "Term end" : "Warranty / handover"} htmlFor="d-term">
              <Input id="d-term" name="term_end_date" type="date" defaultValue={deal?.term_end_date ?? ""} />
            </Field>
            {isGbp && (
              <Field label="Next check-in" htmlFor="d-checkin">
                <Input id="d-checkin" name="next_checkin_date" type="date" defaultValue={deal?.next_checkin_date ?? ""} />
              </Field>
            )}
          </div>

          {isGbp && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Field label="Billing day" htmlFor="d-bday" hint="1–31">
                <Input id="d-bday" name="billing_day" type="number" min="1" max="31" defaultValue={deal?.billing_day ?? ""} />
              </Field>
              <Field label="Min term (months)" htmlFor="d-minterm">
                <Input id="d-minterm" name="min_term_months" type="number" min="1" max="120" defaultValue={deal?.min_term_months ?? 6} />
              </Field>
            </div>
          )}

          <Checkbox name="delivery_flag" defaultChecked={deal?.delivery_flag ?? false} label="Delivery on track" />

          <FormError message={state.error} />
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending ? "Saving…" : editing ? "Save deal" : "Add deal"}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
