import { StatusPill, type StatusTone } from "./ui/StatusPill";
import type { GbpPaidStatus, WebsiteProgress } from "@/lib/admin/money/status";
import type { DealStatus, InvoiceStatus, PipelineStage } from "@/lib/admin/types";

export function GbpPaidBadge({ status }: { status: GbpPaidStatus }) {
  if (status === "paid") return <StatusPill tone="paid">Paid</StatusPill>;
  if (status === "overdue") return <StatusPill tone="overdue">Overdue</StatusPill>;
  return <StatusPill tone="neutral">Not paid yet</StatusPill>;
}

const PROGRESS: Record<WebsiteProgress, [StatusTone, string]> = {
  paid: ["paid", "Paid in full"],
  final: ["due", "Partly paid"],
  deposit: ["due", "Deposit in"],
  none: ["neutral", "Unpaid"],
};

export function WebsiteProgressBadge({ progress }: { progress: WebsiteProgress }) {
  const [tone, label] = PROGRESS[progress];
  return <StatusPill tone={tone}>{label}</StatusPill>;
}

const DEAL: Record<DealStatus, [StatusTone, string]> = {
  signed: ["neutral", "Signed"],
  in_build: ["accent", "In build"],
  live: ["accent", "Live"],
  warranty: ["due", "Warranty"],
  handover: ["neutral", "Handover"],
  completed: ["paid", "Completed"],
  active: ["accent", "Active"],
  mtm: ["accent", "Month-to-month"],
  cancelled: ["neutral", "Cancelled"],
};

export function DealStageBadge({ status }: { status: DealStatus }) {
  const [tone, label] = DEAL[status];
  return <StatusPill tone={tone}>{label}</StatusPill>;
}

const LEAD: Record<PipelineStage, string> = {
  lead: "Lead",
  discovery: "Discovery",
  quote: "Quote",
  signed: "Signed",
  not_signed: "Not signed",
};

export function LeadStageBadge({ stage }: { stage: PipelineStage }) {
  const tone: StatusTone = stage === "signed" ? "paid" : stage === "not_signed" ? "neutral" : "accent";
  return <StatusPill tone={tone}>{LEAD[stage]}</StatusPill>;
}

const INVOICE: Record<InvoiceStatus, [StatusTone, string]> = {
  paid: ["paid", "Paid"],
  open: ["due", "Open"],
  void: ["neutral", "Void"],
  draft: ["neutral", "Draft"],
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const [tone, label] = INVOICE[status];
  return <StatusPill tone={tone}>{label}</StatusPill>;
}

export function DeliveryFlag({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="inline-flex items-center gap-1 text-xs text-paid">
      <span className="size-1.5 rounded-full bg-paid" aria-hidden /> On track
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs text-fg-subtle">
      <span className="size-1.5 rounded-full bg-neutral/50" aria-hidden /> Not flagged
    </span>
  );
}
