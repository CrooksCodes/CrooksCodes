import type { Metadata } from "next";
import { requireOwner } from "@/lib/admin/auth";
import { loadHistory, loadProfileNames } from "@/lib/admin/queries";
import type { AuditLogRow } from "@/lib/admin/types";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card } from "@/components/admin/ui/Card";
import { Table, THead, TBody, Th, Tr, Td } from "@/components/admin/ui/DataTable";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { StatusPill } from "@/components/admin/ui/StatusPill";

export const metadata: Metadata = { title: "History" };
export const dynamic = "force-dynamic";

const TONE = { INSERT: "paid", UPDATE: "accent", DELETE: "overdue" } as const;

function truncate(v: string | null, n = 48) {
  if (!v) return "—";
  return v.length > n ? `${v.slice(0, n)}…` : v;
}

export default async function HistoryPage() {
  const { supabase } = await requireOwner();
  const [rows, names] = await Promise.all([loadHistory(supabase), loadProfileNames(supabase)]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="History" subtitle="Every change to deals, payments, invoices and draws is logged by the database." />
      <Card className="overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState title="No changes logged yet" className="rounded-none border-0" />
        ) : (
          <Table>
            <THead>
              <Th>When</Th>
              <Th>Table</Th>
              <Th>Action</Th>
              <Th>Field</Th>
              <Th>Change</Th>
              <Th>By</Th>
            </THead>
            <TBody>
              {rows.map((r: AuditLogRow) => (
                <Tr key={r.id}>
                  <Td className="whitespace-nowrap text-fg-muted">
                    {new Date(r.changed_at).toLocaleString("en-CA", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </Td>
                  <Td>{r.table_name}</Td>
                  <Td><StatusPill tone={TONE[r.action]}>{r.action}</StatusPill></Td>
                  <Td className="text-fg-muted">{r.field ?? "—"}</Td>
                  <Td className="text-xs text-fg-muted" >
                    {r.action === "UPDATE" ? (
                      <span>
                        <span className="text-fg-subtle line-through">{truncate(r.old_value)}</span>
                        {" → "}
                        <span className="text-fg">{truncate(r.new_value)}</span>
                      </span>
                    ) : (
                      <span title={(r.action === "DELETE" ? r.old_value : r.new_value) ?? undefined}>
                        {truncate(r.action === "DELETE" ? r.old_value : r.new_value, 60)}
                      </span>
                    )}
                  </Td>
                  <Td className="whitespace-nowrap text-fg-muted">{r.changed_by ? (names[r.changed_by] ?? "—") : "System"}</Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
