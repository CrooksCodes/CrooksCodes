import { adminPath } from "@/lib/admin/routes";

type IconProps = { className?: string };

export interface NavItem {
  href: string;
  label: string;
  icon: (p: IconProps) => React.ReactElement;
  exact?: boolean;
}

export const NAV: NavItem[] = [
  { href: adminPath.home, label: "Today", icon: HomeIcon, exact: true },
  { href: adminPath.money, label: "Money", icon: MoneyIcon },
  { href: adminPath.clients, label: "Clients", icon: ClientsIcon },
  { href: adminPath.pipeline, label: "Pipeline", icon: PipelineIcon },
  { href: adminPath.history, label: "History", icon: HistoryIcon },
];

export function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, "aria-hidden": true } as const;

function HomeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} {...stroke}>
      <path d="M3 9.5 10 3l7 6.5M5 8.5V16h10V8.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function MoneyIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} {...stroke}>
      <rect x="2.5" y="5" width="15" height="10" rx="2" />
      <circle cx="10" cy="10" r="2.2" />
    </svg>
  );
}
function ClientsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} {...stroke}>
      <circle cx="7" cy="7" r="2.6" />
      <path d="M2.5 16c0-2.5 2-4.2 4.5-4.2S11.5 13.5 11.5 16M13 8.2a2.4 2.4 0 1 0-1-4.6M13.5 11.8c2 .4 3.5 2 3.5 4.2" strokeLinecap="round" />
    </svg>
  );
}
function PipelineIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} {...stroke}>
      <path d="M3 5h14M5 10h10M7 15h6" strokeLinecap="round" />
    </svg>
  );
}
function HistoryIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} {...stroke}>
      <path d="M10 5v5l3 2M17 10a7 7 0 1 1-2.1-5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 3v3.5h-3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Wordmark tile for the sidebar and the login card. */
export function AdminMark({ className }: IconProps) {
  return (
    <span className={`grid place-items-center rounded-md bg-accent font-mono text-[11px] font-semibold tracking-tight text-accent-fg ${className ?? ""}`} aria-hidden>
      CC
    </span>
  );
}
