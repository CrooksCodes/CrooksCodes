"use client";

import { useActionState, useState } from "react";
import { saveClient } from "./actions";
import type { FormState } from "@/lib/admin/form";
import type { ClientRow } from "@/lib/admin/types";
import { Modal } from "@/components/admin/ui/Modal";
import { Button, InlineButton } from "@/components/admin/ui/Button";
import { Field, Input, Select, Textarea, FormError } from "@/components/admin/ui/Field";

export function ClientForm({ client }: { client?: ClientRow }) {
  const editing = !!client;
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<FormState, FormData>(async (prev, fd) => {
    const result = await saveClient(prev, fd);
    if (result.ok) setOpen(false);
    return result;
  }, {});

  return (
    <>
      {editing ? (
        <InlineButton onClick={() => setOpen(true)} aria-label={`Edit ${client.name}`}>Edit</InlineButton>
      ) : (
        <Button size="sm" onClick={() => setOpen(true)}>+ New client</Button>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? `Edit ${client.name}` : "New client"}>
        <form action={action} className="flex flex-col gap-4">
          {editing && <input type="hidden" name="id" value={client.id} />}
          <Field label="Business name" htmlFor="c-name">
            <Input id="c-name" name="name" defaultValue={client?.name ?? ""} required maxLength={200} autoFocus />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Contact name" htmlFor="c-contact">
              <Input id="c-contact" name="contact_name" defaultValue={client?.contact_name ?? ""} maxLength={200} />
            </Field>
            <Field label="Contact phone" htmlFor="c-phone">
              <Input id="c-phone" name="contact_phone" type="tel" defaultValue={client?.contact_phone ?? ""} maxLength={50} />
            </Field>
          </div>
          <Field label="Contact email" htmlFor="c-email">
            <Input id="c-email" name="contact_email" type="email" defaultValue={client?.contact_email ?? ""} maxLength={254} />
          </Field>
          <Field label="Address" htmlFor="c-address">
            <Input id="c-address" name="address" defaultValue={client?.address ?? ""} maxLength={300} />
          </Field>
          <Field label="Status" htmlFor="c-status">
            <Select id="c-status" name="status" defaultValue={client?.status ?? "active"}>
              <option value="active">Active</option>
              <option value="past_completed">Past / completed</option>
            </Select>
          </Field>
          <Field label="Notes" htmlFor="c-notes">
            <Textarea id="c-notes" name="notes" defaultValue={client?.notes ?? ""} rows={2} maxLength={2000} />
          </Field>
          <FormError message={state.error} />
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending ? "Saving…" : editing ? "Save changes" : "Add client"}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
