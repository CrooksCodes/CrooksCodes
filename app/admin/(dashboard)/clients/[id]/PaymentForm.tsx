"use client";

import { useActionState, useState } from "react";
import { addPayment } from "./actions";
import type { FormState } from "@/lib/admin/form";
import type { DealRow } from "@/lib/admin/types";
import { currentPeriod, isoToday } from "@/lib/admin/format";
import { Modal } from "@/components/admin/ui/Modal";
import { Button } from "@/components/admin/ui/Button";
import { Field, Input, Select, FormError } from "@/components/admin/ui/Field";

export function PaymentForm({ deal }: { deal: DealRow }) {
  const isGbp = deal.product === "GBP";
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"received" | "pending">("received");
  const [state, action, pending] = useActionState<FormState, FormData>(async (prev, fd) => {
    const result = await addPayment(prev, fd);
    if (result.ok) setOpen(false);
    return result;
  }, {});

  return (
    <>
      <Button size="sm" variant="subtle" onClick={() => setOpen(true)}>+ Payment</Button>
      <Modal open={open} onClose={() => setOpen(false)} title={`Record payment: ${deal.product}`}>
        <form action={action} className="flex flex-col gap-4">
          <input type="hidden" name="deal_id" value={deal.id} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount" htmlFor="p-amount">
              <Input id="p-amount" name="amount" type="number" step="0.01" min="0.01" inputMode="decimal" defaultValue={isGbp ? deal.value : ""} required autoFocus />
            </Field>
            <Field label="Type" htmlFor="p-kind">
              <Select id="p-kind" name="kind" defaultValue={isGbp ? "monthly" : "deposit"}>
                {isGbp ? <option value="monthly">Monthly</option> : (
                  <>
                    <option value="deposit">Deposit</option>
                    <option value="final">Final</option>
                  </>
                )}
                <option value="other">Other</option>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Method" htmlFor="p-method">
              <Select id="p-method" name="method" defaultValue="etransfer">
                <option value="etransfer">E-transfer</option>
                <option value="other">Other</option>
              </Select>
            </Field>
            <Field label="Status" htmlFor="p-status">
              <Select id="p-status" name="status" value={status} onChange={(e) => setStatus(e.target.value as "received" | "pending")}>
                <option value="received">Received</option>
                <option value="pending">Pending</option>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {status === "received" ? (
              <Field label="Received date" htmlFor="p-recv">
                <Input id="p-recv" name="received_date" type="date" defaultValue={isoToday()} />
              </Field>
            ) : (
              <Field label="Due date" htmlFor="p-due">
                <Input id="p-due" name="due_date" type="date" />
              </Field>
            )}
            {isGbp && (
              <Field label="Period" htmlFor="p-period" hint="YYYY-MM">
                <Input id="p-period" name="period_month" defaultValue={currentPeriod()} pattern="\d{4}-(0[1-9]|1[0-2])" />
              </Field>
            )}
          </div>
          <Field label="Received into" htmlFor="p-into" hint="Optional">
            <Input id="p-into" name="received_into" placeholder="Business account" maxLength={100} />
          </Field>
          <FormError message={state.error} />
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending ? "Recording…" : "Record payment"}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
