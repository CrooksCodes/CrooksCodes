import type { Metadata } from "next";
import { BlogShell } from "@/components/BlogChrome";

export const metadata: Metadata = {
  title: "Blog",
  description: "Notes on what I'm learning and building: web development, school, and the bugs in between.",
  alternates: { canonical: "/blog", types: { "application/rss+xml": "/feed.xml" } },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <BlogShell>{children}</BlogShell>;
}
