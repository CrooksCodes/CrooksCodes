// Row types for the admin schema (supabase/migrations/20261106000000_admin_dashboard.sql).
// numeric columns arrive from PostgREST as numbers.

export type Product = "Website" | "GBP";
export type BillingType = "one_time" | "monthly";
export type ClientStatus = "active" | "past_completed";
export type DealStatus =
  | "signed" | "in_build" | "live" | "warranty" | "handover" | "completed"
  | "active" | "mtm" | "cancelled";
export type PaymentMethod = "etransfer" | "other";
export type PaymentStatus = "pending" | "received";
export type PaymentKind = "deposit" | "final" | "monthly" | "other";
export type InvoiceStatus = "draft" | "open" | "paid" | "void";
export type PipelineStage = "lead" | "discovery" | "quote" | "signed" | "not_signed";
export type AuditAction = "INSERT" | "UPDATE" | "DELETE";

type Stamped = {
  id: string;
  created_at: string;
  updated_at: string;
};

export type UsersProfileRow = Stamped & {
  name: string;
  email: string;
};

export type ClientRow = Stamped & {
  name: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  status: ClientStatus;
  notes: string | null;
};

export type DealRow = Stamped & {
  client_id: string;
  product: Product;
  value: number;
  billing_type: BillingType;
  status: DealStatus;
  signed_date: string | null;
  go_live_date: string | null;
  term_end_date: string | null;
  next_checkin_date: string | null;
  billing_day: number | null;
  min_term_months: number;
  delivery_flag: boolean;
};

export type PaymentRow = Stamped & {
  deal_id: string;
  client_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  kind: PaymentKind;
  due_date: string | null;
  received_date: string | null;
  received_into: string | null;
  period_month: string | null;
  invoice_id: string | null;
};

export type InvoiceRow = Stamped & {
  deal_id: string;
  client_id: string;
  number: string | null;
  amount: number;
  status: InvoiceStatus;
  issued_date: string | null;
  due_date: string | null;
};

export type PipelineLeadRow = Stamped & {
  name: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  product: Product | null;
  stage: PipelineStage;
  estimated_value: number | null;
  estimated_value_max: number | null;
  quote_amount: number | null;
  last_activity_date: string | null;
  not_signed_reason: string | null;
  nurture: boolean;
  converted_client_id: string | null;
  notes: string | null;
};

export type DrawRow = Stamped & {
  amount: number;
  date: string;
  note: string | null;
};

export type AuditLogRow = {
  id: string;
  table_name: string;
  record_id: string;
  field: string | null;
  old_value: string | null;
  new_value: string | null;
  changed_by: string | null;
  action: AuditAction;
  changed_at: string;
};

type Table<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      users_profile: Table<UsersProfileRow>;
      clients: Table<ClientRow>;
      deals: Table<DealRow>;
      payments: Table<PaymentRow>;
      invoices: Table<InvoiceRow>;
      pipeline_leads: Table<PipelineLeadRow>;
      draws: Table<DrawRow>;
      audit_log: Table<AuditLogRow>;
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: {
      product: Product;
      billing_type: BillingType;
      client_status: ClientStatus;
      deal_status: DealStatus;
      payment_method: PaymentMethod;
      payment_status: PaymentStatus;
      payment_kind: PaymentKind;
      invoice_status: InvoiceStatus;
      pipeline_stage: PipelineStage;
      audit_action: AuditAction;
    };
    CompositeTypes: { [_ in never]: never };
  };
};
