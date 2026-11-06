"use client";

import { useActionState, useState } from "react";
import { recordDraw } from "./actions";
import type { FormState } from "@/lib/admin/form";
import { Button } from "@/components/admin/ui/Button";
import { Field, Input, Textarea, FormError } from "@/components/admin/ui/Field";
import { Modal } from "@/components/admin/ui/Modal";

export function RecordDraw({ today }: { today: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<FormState, FormData>(async (prev, fd) => {
    const result = await recordDraw(prev, fd);
    if (result.ok) setOpen(false);
    return result;
  }, {});

  return (
    <>
      <Button size="sm" variant="subtle" onClick={() => setOpen(true)}>+ Record draw</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Record draw">
        <form action={action} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount" htmlFor="d-amount">
              <Input id="d-amount" name="amount" type="number" step="0.01" min="0.01" inputMode="decimal" required autoFocus />
            </Field>
            <Field label="Date" htmlFor="d-date">
              <Input id="d-date" name="date" type="date" defaultValue={today} required />
            </Field>
          </div>
          <Field label="Note" htmlFor="d-note" hint="Optional">
            <Textarea id="d-note" name="note" rows={2} maxLength={500} />
          </Field>
          <FormError message={state.error} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending ? "Recording…" : "Record draw"}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
