import "server-only";
import type { AdminClient } from "./supabase";
import type {
  AuditLogRow, ClientRow, DealRow, DrawRow, InvoiceRow, PaymentRow, PipelineLeadRow,
} from "./types";

/** Unwrap a Supabase result, throwing instead of silently showing nothing. */
function must<T>(res: { data: T | null; error: { message: string } | null }, what: string): T {
  if (res.error) throw new Error(`Could not load ${what}.`);
  return (res.data ?? ([] as unknown)) as T;
}

export interface CoreData {
  clients: ClientRow[];
  deals: DealRow[];
  payments: PaymentRow[];
  draws: DrawRow[];
}

/** The whole ledger in one round trip. The dataset is small. */
export async function loadCoreData(db: AdminClient): Promise<CoreData> {
  const [clients, deals, payments, draws] = await Promise.all([
    db.from("clients").select("*").order("name"),
    db.from("deals").select("*").order("created_at"),
    db.from("payments").select("*").order("created_at"),
    db.from("draws").select("*").order("date", { ascending: false }),
  ]);
  return {
    clients: must(clients, "clients"),
    deals: must(deals, "deals"),
    payments: must(payments, "payments"),
    draws: must(draws, "draws"),
  };
}

export interface ClientDetail {
  client: ClientRow | null;
  deals: DealRow[];
  payments: PaymentRow[];
  invoices: InvoiceRow[];
}

export async function loadClientDetail(db: AdminClient, id: string): Promise<ClientDetail> {
  const [client, deals, payments, invoices] = await Promise.all([
    db.from("clients").select("*").eq("id", id).maybeSingle(),
    db.from("deals").select("*").eq("client_id", id).order("created_at"),
    db.from("payments").select("*").eq("client_id", id).order("created_at"),
    db.from("invoices").select("*").eq("client_id", id).order("created_at", { ascending: false }),
  ]);
  if (client.error) throw new Error("Could not load client.");
  return {
    client: client.data,
    deals: must(deals, "deals"),
    payments: must(payments, "payments"),
    invoices: must(invoices, "invoices"),
  };
}

export async function loadInvoices(db: AdminClient): Promise<InvoiceRow[]> {
  return must(await db.from("invoices").select("*").order("created_at", { ascending: false }), "invoices");
}

export async function loadPipeline(db: AdminClient): Promise<PipelineLeadRow[]> {
  return must(
    await db.from("pipeline_leads").select("*").order("last_activity_date", { ascending: false, nullsFirst: false }),
    "leads",
  );
}

export async function loadProfileNames(db: AdminClient): Promise<Record<string, string>> {
  const rows = must(await db.from("users_profile").select("id, name"), "profiles");
  return Object.fromEntries(rows.map((p) => [p.id, p.name]));
}

export async function loadHistory(db: AdminClient, limit = 150): Promise<AuditLogRow[]> {
  return must(
    await db.from("audit_log").select("*").order("changed_at", { ascending: false }).limit(limit),
    "history",
  );
}
