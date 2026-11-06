"use client";

import { useActionState, useState } from "react";
import { saveLead } from "./actions";
import type { FormState } from "@/lib/admin/form";
import type { PipelineLeadRow } from "@/lib/admin/types";
import { isoToday } from "@/lib/admin/format";
import { Modal } from "@/components/admin/ui/Modal";
import { Button, InlineButton } from "@/components/admin/ui/Button";
import { Checkbox, Field, Input, Select, Textarea, FormError } from "@/components/admin/ui/Field";

export function LeadForm({ lead }: { lead?: PipelineLeadRow }) {
  const editing = !!lead;
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<FormState, FormData>(async (prev, fd) => {
    const result = await saveLead(prev, fd);
    if (result.ok) setOpen(false);
    return result;
  }, {});

  return (
    <>
      {editing ? (
        <InlineButton onClick={() => setOpen(true)} aria-label={`Edit ${lead.name}`}>Edit</InlineButton>
      ) : (
        <Button size="sm" onClick={() => setOpen(true)}>+ New lead</Button>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? `Edit ${lead.name}` : "New lead"}>
        <form action={action} className="flex flex-col gap-4">
          {editing && <input type="hidden" name="id" value={lead.id} />}
          <Field label="Name" htmlFor="l-name">
            <Input id="l-name" name="name" defaultValue={lead?.name ?? ""} required maxLength={200} autoFocus />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Contact name" htmlFor="l-contact">
              <Input id="l-contact" name="contact_name" defaultValue={lead?.contact_name ?? ""} maxLength={200} />
            </Field>
            <Field label="Contact phone" htmlFor="l-phone">
              <Input id="l-phone" name="contact_phone" type="tel" defaultValue={lead?.contact_phone ?? ""} maxLength={50} />
            </Field>
          </div>
          <Field label="Contact email" htmlFor="l-email">
            <Input id="l-email" name="contact_email" type="email" defaultValue={lead?.contact_email ?? ""} maxLength={254} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Product" htmlFor="l-product">
              <Select id="l-product" name="product" defaultValue={lead?.product ?? "Website"}>
                <option value="Website">Website</option>
                <option value="GBP">GBP</option>
              </Select>
            </Field>
            <Field label="Stage" htmlFor="l-stage">
              <Select id="l-stage" name="stage" defaultValue={lead?.stage === "signed" ? "quote" : (lead?.stage ?? "lead")}>
                <option value="lead">Lead</option>
                <option value="discovery">Discovery</option>
                <option value="quote">Quote</option>
                <option value="not_signed">Not signed</option>
              </Select>
            </Field>
          </div>
          <Field label="Estimated value" htmlFor="l-est" hint="Leave high blank for a single figure">
            <div className="flex items-center gap-2">
              <Input id="l-est" name="estimated_value" type="number" step="0.01" min="0" placeholder="Low" aria-label="Low estimate" defaultValue={lead?.estimated_value ?? ""} />
              <span className="shrink-0 text-fg-subtle" aria-hidden>–</span>
              <Input name="estimated_value_max" type="number" step="0.01" min="0" placeholder="High" aria-label="High estimate" defaultValue={lead?.estimated_value_max ?? ""} />
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Quote" htmlFor="l-quote">
              <Input id="l-quote" name="quote_amount" type="number" step="0.01" min="0" defaultValue={lead?.quote_amount ?? ""} />
            </Field>
            <Field label="Last activity" htmlFor="l-activity">
              <Input id="l-activity" name="last_activity_date" type="date" defaultValue={lead?.last_activity_date ?? isoToday()} />
            </Field>
          </div>
          <Checkbox name="nurture" defaultChecked={lead?.nurture ?? false} label="Revisit this lead later" />
          <Field label="Not-signed reason" htmlFor="l-reason" help="Only when archiving as not signed">
            <Input id="l-reason" name="not_signed_reason" defaultValue={lead?.not_signed_reason ?? ""} maxLength={500} />
          </Field>
          <Field label="Notes" htmlFor="l-notes">
            <Textarea id="l-notes" name="notes" defaultValue={lead?.notes ?? ""} rows={2} maxLength={2000} />
          </Field>
          <FormError message={state.error} />
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending ? "Saving…" : editing ? "Save lead" : "Add lead"}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
