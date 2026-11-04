import Link from "next/link";
import { Cursor, Grain } from "@/components/Chrome";
import { SITE } from "@/lib/site";

/**
 * Shared nav + footer for every /blog page. Server component; the only client
 * pieces are the custom cursor and grain overlay, which the body CSS assumes.
 */
export function BlogNav() {
  return (
    <nav className="portfolio-nav blog-nav">
      <Link href="/" className="nav-logo" data-cursor="Home">
        CrooksCodes<em>.</em>com
      </Link>
      <div className="nav-links">
        <Link href="/blog" className="nav-btn nav-btn--active" data-cursor="Go">BLOG</Link>
        <Link href="/#projects" className="nav-btn" data-cursor="Go">PROJECTS</Link>
        <Link href="/#contact" className="nav-btn" data-cursor="Go">CONTACT</Link>
      </div>
    </nav>
  );
}

export function BlogFooter() {
  return (
    <footer className="blog-footer">
      <div className="blog-footer-links">
        <a href={SITE.socials.github.url} target="_blank" rel="noreferrer" data-cursor="Visit">GitHub</a>
        <a href={SITE.socials.linkedin.url} target="_blank" rel="noreferrer" data-cursor="Visit">LinkedIn</a>
        <a href={SITE.socials.x.url} target="_blank" rel="noreferrer" data-cursor="Visit">X</a>
        <a href="/feed.xml" data-cursor="RSS">RSS</a>
      </div>
      <span className="blog-footer-copy">© {new Date().getFullYear()} {SITE.author}</span>
    </footer>
  );
}

export function BlogShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Cursor />
      <Grain />
      <main className="portfolio-root blog-root">
        <BlogNav />
        {children}
        <BlogFooter />
      </main>
    </>
  );
}
