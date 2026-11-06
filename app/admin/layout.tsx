import type { Metadata } from "next";
import "./admin.css";
import { ROOT_ID, themeInitScript } from "@/components/admin/ThemeToggle";

// Never indexed, never followed, never cached by search engines. The proxy
// sends the same rule as an X-Robots-Tag header.
export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  openGraph: null,
  twitter: null,
  alternates: null,
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div id={ROOT_ID} data-theme="light" suppressHydrationWarning>
      <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      {children}
    </div>
  );
}
